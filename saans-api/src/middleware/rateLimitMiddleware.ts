// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../utils/redis.js';

// ==================== TYPES ====================
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests allowed in window
  keyGenerator: (req: Request) => string; // Function to generate rate limit key
  message?: string; // Custom error message
  statusCode?: number; // HTTP status code
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  backoffMultiplier?: number; // Exponential backoff multiplier
}

interface RateLimitStore {
  hits: number;
  resetTime: number;
  backoffUntil?: number;
}

// ==================== HELPERS ====================

/**
 * Get client IP address
 */
function getClientIP(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Get Redis key for rate limiting
 */
function getRedisKey(baseKey: string, type: string): string {
  return `ratelimit:${type}:${baseKey}`;
}

/**
 * Check if client is in exponential backoff period
 */
function isInBackoffPeriod(backoffUntil?: number): boolean {
  if (!backoffUntil) return false;
  return Date.now() < backoffUntil;
}

/**
 * Calculate exponential backoff time
 */
function calculateBackoffTime(
  attemptCount: number,
  backoffMultiplier: number = 2,
  baseDelay: number = 1000
): number {
  // Backoff = baseDelay * (multiplier ^ (attempt - 1))
  return baseDelay * Math.pow(backoffMultiplier, attemptCount - 1);
}

// ==================== MAIN RATE LIMITING FUNCTION ====================

/**
 * Create rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisClient = getRedisClient();

      // If Redis is not available, log warning and allow request
      if (!redisClient) {
        console.warn('⚠️  Rate limiting disabled: Redis unavailable');
        return next();
      }

      const key = config.keyGenerator(req);
      const redisKey = getRedisKey(key, 'standard');
      const backoffKey = getRedisKey(key, 'backoff');

      // Check if client is in backoff period
      const backoffData = await redisClient.get(backoffKey);
      if (backoffData) {
        const backoffInfo = JSON.parse(backoffData);
        if (isInBackoffPeriod(backoffInfo.backoffUntil)) {
          const remainingSeconds = Math.ceil((backoffInfo.backoffUntil - Date.now()) / 1000);
          res.setHeader('Retry-After', remainingSeconds.toString());
          return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: remainingSeconds,
            backoffMultiplier: backoffInfo.multiplier,
            attemptCount: backoffInfo.attemptCount,
          });
        }
      }

      // Get current rate limit data
      const rateLimitData = await redisClient.get(redisKey);
      let limitStore: RateLimitStore = rateLimitData
        ? JSON.parse(rateLimitData)
        : { hits: 0, resetTime: Date.now() + config.windowMs, backoffUntil: undefined };

      // Reset if window expired
      if (Date.now() >= limitStore.resetTime) {
        limitStore = { hits: 0, resetTime: Date.now() + config.windowMs };
      }

      // Increment hit count
      limitStore.hits += 1;

      // Save updated data
      const ttl = Math.ceil((limitStore.resetTime - Date.now()) / 1000);
      if (ttl > 0) {
        await redisClient.setEx(redisKey, ttl, JSON.stringify(limitStore));
      }

      // Set rate limit headers
      const remaining = Math.max(0, config.max - limitStore.hits);
      const resetAt = Math.ceil(limitStore.resetTime / 1000);

      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', resetAt.toString());

      // Check if limit exceeded
      if (limitStore.hits > config.max) {
        // Trigger exponential backoff on failure
        const backoffMultiplier = config.backoffMultiplier || 2;
        const failureCount = Math.floor(limitStore.hits / config.max);
        const backoffMs = calculateBackoffTime(failureCount, backoffMultiplier);
        const backoffUntil = Date.now() + backoffMs;

        const backoffStore = {
          backoffUntil,
          multiplier: backoffMultiplier,
          attemptCount: failureCount,
          resetTime: limitStore.resetTime,
        };

        await redisClient.setEx(
          backoffKey,
          Math.ceil(backoffMs / 1000),
          JSON.stringify(backoffStore)
        );

        const retryAfterSeconds = Math.ceil(backoffMs / 1000);
        res.setHeader('Retry-After', retryAfterSeconds.toString());

        return res.status(config.statusCode || 429).json({
          error: config.message || 'Too many requests, please try again later.',
          retryAfter: retryAfterSeconds,
          backoffMultiplier,
          attemptCount: failureCount,
        });
      }

      // Attach rate limit info to request for logging
      (req as any).rateLimit = {
        limit: config.max,
        current: limitStore.hits,
        remaining,
        resetTime: limitStore.resetTime,
      };

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow request to proceed but log the issue
      next();
    }
  };
}

// ==================== PRESET RATE LIMITERS ====================

/**
 * Login rate limiter: 5 attempts per minute per IP
 */
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  statusCode: 429,
  message: 'Too many login attempts, please try again in a few minutes.',
  keyGenerator: (req: Request) => {
    return `login:${getClientIP(req)}`;
  },
  backoffMultiplier: 2,
});

/**
 * Registration rate limiter: 3 attempts per hour per IP
 */
export const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  statusCode: 429,
  message: 'Too many registration attempts from this IP. Please try again in an hour.',
  keyGenerator: (req: Request) => {
    return `register:${getClientIP(req)}`;
  },
  backoffMultiplier: 2,
});

/**
 * Password change rate limiter: 3 attempts per 24 hours per user
 */
export const passwordChangeLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  statusCode: 429,
  message: 'Too many password change attempts. Please try again tomorrow.',
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise fall back to IP
    const userId = (req as any).userId;
    if (!userId) {
      return `pwd:${getClientIP(req)}`;
    }
    return `pwd:${userId}`;
  },
  backoffMultiplier: 3,
});

/**
 * General API rate limiter: 100 requests per minute per user/IP
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  statusCode: 429,
  message: 'API rate limit exceeded. Please slow down.',
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = (req as any).userId;
    if (userId) {
      return `api:${userId}`;
    }
    return `api:${getClientIP(req)}`;
  },
  backoffMultiplier: 1.5,
});

/**
 * Strict API rate limiter: 30 requests per minute per IP
 * Use for sensitive endpoints
 */
export const strictApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  statusCode: 429,
  message: 'Rate limit exceeded on sensitive endpoint.',
  keyGenerator: (req: Request) => {
    return `api:strict:${getClientIP(req)}`;
  },
  backoffMultiplier: 2,
});

/**
 * Crisis endpoint rate limiter: 10 requests per minute per IP
 * For crisis detection and alerts - very permissive for legitimate users
 */
export const crisisLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  statusCode: 429,
  message: 'Crisis endpoint rate limited. Emergency services contacted.',
  keyGenerator: (req: Request) => {
    return `crisis:${getClientIP(req)}`;
  },
  backoffMultiplier: 1.5,
});

/**
 * Payment endpoint rate limiter: 20 requests per minute per user
 */
export const paymentLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  statusCode: 429,
  message: 'Payment endpoint rate limited. Please try again later.',
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId;
    if (!userId) {
      return `payment:${getClientIP(req)}`;
    }
    return `payment:${userId}`;
  },
  backoffMultiplier: 2,
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Reset rate limit for a specific key
 * Useful for testing or administrative purposes
 */
export async function resetRateLimit(key: string, type: string = 'standard'): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    const redisKey = getRedisKey(key, type);
    await redisClient.del(redisKey);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

/**
 * Get current rate limit status for a key
 */
export async function getRateLimitStatus(
  key: string,
  type: string = 'standard'
): Promise<RateLimitStore | null> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return null;
    }

    const redisKey = getRedisKey(key, type);
    const data = await redisClient.get(redisKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
}

/**
 * Check if a key is currently rate limited
 */
export async function isRateLimited(key: string, max: number): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    const data = await getRateLimitStatus(key);
    if (!data) {
      return false;
    }

    return data.hits > max;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return false;
  }
}

// ==================== EXPORT ====================

export default createRateLimiter;
