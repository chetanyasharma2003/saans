// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { getRedisClient } from '../utils/redis.js';

/**
 * Security Middleware for Production-Ready API
 * Includes CSRF protection, security headers, and vulnerability protections
 */

// =============== CSRF TOKEN MANAGEMENT ===============

/**
 * Generate a unique CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory CSRF token store for when Redis is not available
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

/**
 * Store CSRF token in Redis or in-memory fallback
 */
async function storeCSRFToken(
  sessionId: string,
  token: string,
  ttl: number = 3600
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const key = `csrf:${sessionId}`;

    if (redisClient) {
      await redisClient.setEx(key, ttl, token);
    } else {
      // Fallback to in-memory store for testing
      csrfTokenStore.set(key, { token, expiresAt: Date.now() + ttl * 1000 });
    }
  } catch (error) {
    console.error('Error storing CSRF token:', error);
    // Don't throw - just log and continue (CSRF is optional if Redis fails)
  }
}

/**
 * Verify CSRF token from Redis or in-memory store
 */
async function verifyCSRFToken(sessionId: string, token: string): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    const key = `csrf:${sessionId}`;
    let storedToken: string | null = null;

    if (redisClient) {
      storedToken = await redisClient.get(key);
    } else {
      // Check in-memory store
      const cached = csrfTokenStore.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        storedToken = cached.token;
      }
    }

    if (!storedToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    const result = crypto.timingSafeEqual(
      Buffer.from(storedToken),
      Buffer.from(token)
    );

    // Delete token after verification (one-time use)
    if (result) {
      if (redisClient) {
        await redisClient.del(key);
      } else {
        csrfTokenStore.delete(key);
      }
    }

    return result;
  } catch (error) {
    console.error('Error verifying CSRF token:', error);
    return false;
  }
}

// =============== MIDDLEWARE FUNCTIONS ===============

/**
 * Get or create a session ID for CSRF protection
 */
export function csrfSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Use user ID if authenticated, otherwise create a session ID
  let sessionId = req.user?.id || req.headers['x-session-id'] as string;

  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex');
    res.setHeader('X-Session-ID', sessionId);
  }

  req.csrfSessionId = sessionId;
  next();
}

/**
 * Generate and provide CSRF token
 * Should be called on GET requests before forms/state-changing operations
 */
export async function csrfTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only generate tokens on safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const token = generateCSRFToken();
      await storeCSRFToken(req.csrfSessionId, token);
      res.setHeader('X-CSRF-Token', token);
    }
    return next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    // Don't fail the request - CSRF is optional if storage fails
    return next();
  }
}

/**
 * Verify CSRF token for state-changing requests
 */
export async function verifyCsrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Skip CSRF verification for safe methods and public endpoints
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for webhook endpoints (they have their own verification)
    if (req.path.includes('/webhook') || req.path.includes('/callback')) {
      return next();
    }

    // Skip CSRF for all auth routes (API-based auth doesn't use traditional session tokens)
    if (req.path.startsWith('/api/auth')) {
      return next();
    }

    // Skip CSRF for API routes in development/testing
    if (process.env.NODE_ENV !== 'production' && req.path.startsWith('/api/')) {
      return next();
    }

    const token =
      req.headers['x-csrf-token'] ||
      req.body?.csrfToken ||
      (req.query?.csrfToken as string);

    // In production, require CSRF tokens. In dev/test, allow without token
    if (process.env.NODE_ENV === 'production') {
      if (!token) {
        res.status(403).json({
          error: 'CSRF token missing',
          code: 'CSRF_TOKEN_MISSING',
        });
        return;
      }

      const isValid = await verifyCSRFToken(req.csrfSessionId, token as string);

      if (!isValid) {
        res.status(403).json({
          error: 'CSRF token invalid or expired',
          code: 'CSRF_TOKEN_INVALID',
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('CSRF verification error:', error);
    // Don't fail the request on CSRF errors, just log
    next();
  }
}

// =============== SECURITY HEADERS ===============

/**
 * Set comprehensive security headers
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow same-origin iframe embedding if needed

  // XSS Protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - don't send referrer to cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Prevent browser caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Remove powered by header
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Content Security Policy (CSP) Headers
 */
export function cspMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const environment = process.env.NODE_ENV || 'development';

  // Stricter CSP for production
  const cspPolicy =
    environment === 'production'
      ? // Production: Very restrictive
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'", // Adjust based on your needs
          "img-src 'self' https: data:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join('; ')
      : // Development: More permissive for debugging
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' https: data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https: ws: wss:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);
  res.setHeader('Content-Security-Policy-Report-Only', cspPolicy);

  next();
}

/**
 * HSTS (HTTP Strict Transport Security) Headers
 */
export function hstsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const environment = process.env.NODE_ENV || 'development';

  // Only set HSTS in production with HTTPS
  if (environment === 'production' && req.protocol === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

/**
 * Secure Cookie Settings Middleware
 */
export function secureCookieMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Intercept res.cookie to add security settings
  const originalCookie = res.cookie.bind(res);

  res.cookie = function (name: string, value: string, options: any = {}) {
    const environment = process.env.NODE_ENV || 'development';

    // Default secure cookie options
    const secureOptions = {
      ...options,
      httpOnly: true, // Prevent XSS attacks by making cookie inaccessible to JavaScript
      secure: environment === 'production', // Only send over HTTPS in production
      sameSite: 'strict' as const, // CSRF protection
      maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours default
    };

    return originalCookie(name, value, secureOptions);
  };

  next();
}

/**
 * Permissions Policy (Feature Policy)
 */
export function permissionsPolicyMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Restrict access to sensitive APIs
  const permissionsPolicy = [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'document-domain=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'sync-xhr=()',
    'usb=()',
    'vr=()',
    'xr-spatial-tracking=()',
  ].join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);

  next();
}

/**
 * Rate Limiting Middleware
 */
export function rateLimitMiddleware(
  windowMs: number = 60000,
  maxRequests: number = 100
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.user?.id || req.ip || req.headers['x-forwarded-for'];

    if (!clientId) {
      return next();
    }

    const now = Date.now();
    const clientData = requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // New window or expired
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    clientData.count++;

    if (clientData.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((clientData.resetTime - now) / 1000));
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Reset', clientData.resetTime);

    next();
  };
}

/**
 * Request Size Validation Middleware
 */
export function validateRequestSizeMiddleware(maxSizeInMB: number = 10) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(_req.headers['content-length'] || '0', 10);
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSizeInBytes) {
      res.status(413).json({
        error: 'Payload too large',
        maxSize: `${maxSizeInMB}MB`,
      });
      return;
    }

    next();
  };
}

/**
 * SQL Injection & NoSQL Injection Prevention
 */
export function sanitizeInputMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const dangerousPatterns = [
    /(\$where|eval|function)/gi, // NoSQL injection
    /(drop|delete|update|insert)\s+/gi, // SQL injection
    /(<script|javascript:|onerror=|onload=)/gi, // XSS
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => checkValue(v));
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query)) {
    res.status(400).json({
      error: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
    return;
  }

  next();
}

/**
 * Request ID Tracking
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId =
    (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  return next();
}

// =============== ENVIRONMENT-SPECIFIC VALIDATION ===============

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): void {
  const environment = process.env.NODE_ENV || 'development';

  if (environment === 'production') {
    const requiredEnvVars = [
      'JWT_SECRET',
      'CORS_ORIGIN',
      'FRONTEND_URL',
    ];

    const missing = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missing.length > 0) {
      console.warn(
        `⚠️  WARNING: Missing production environment variables: ${missing.join(', ')}`
      );
      console.warn('⚠️  Please ensure all security configs are properly set before deploying');
    }

    // Warn if using weak defaults
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      throw new Error('❌ SECURITY ERROR: JWT_SECRET must be changed from default in production');
    }
  }
}

// =============== EXTENDED TYPES ===============

declare global {
  namespace Express {
    interface Request {
      id?: string;
      csrfSessionId: string;
      user?: any;
    }
  }
}

export default {
  generateCSRFToken,
  csrfSessionMiddleware,
  csrfTokenMiddleware,
  verifyCsrfMiddleware,
  securityHeadersMiddleware,
  cspMiddleware,
  hstsMiddleware,
  secureCookieMiddleware,
  permissionsPolicyMiddleware,
  rateLimitMiddleware,
  validateRequestSizeMiddleware,
  sanitizeInputMiddleware,
  requestIdMiddleware,
  validateSecurityConfig,
};
