const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

let redisStore = null;

// Try to setup Redis store
try {
  const redis = require('redis');
  const RedisStore = require('rate-limit-redis');

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisClient = redis.createClient({ url: redisUrl, legacyMode: true });

  redisClient.connect().then(() => {
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'rate-limit:'
    });
    logger.info('Redis rate limiting store connected');
  }).catch(err => {
    logger.warn('Redis connection failed, using in-memory store', { error: err.message });
    redisStore = null;
  });
} catch (error) {
  logger.warn('Redis store initialization failed, using in-memory store', { error: error.message });
}

/**
 * Rate Limiter Middleware
 * Prevents brute force attacks and API abuse
 */

// Helper to create rate limiter config
const createLimiterConfig = (options = {}) => {
  const config = {
    skipFailedRequests: true,
    skipSuccessfulRequests: false,
    ...options
  };
  if (redisStore) {
    config.store = redisStore;
  }
  return config;
};

// Login attempts - 5 attempts per 15 minutes
const loginLimiter = rateLimit(createLimiterConfig({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip,
  skip: (req) => {
    if (!req.body.email) return false;
    return false;
  },
  handler: (req, res) => {
    logger.warn('Login rate limit exceeded', {
      email: req.body.email,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again in 15 minutes.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

// Registration attempts - 3 per hour
const registrationLimiter = rateLimit(createLimiterConfig({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per windowMs
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip,
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded', {
      email: req.body.email,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'Too many registration attempts. Please try again in 1 hour.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

// API calls - 100 per minute per user
const apiLimiter = rateLimit(createLimiterConfig({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id || req.ip,
  handler: (req, res) => {
    logger.warn('API rate limit exceeded', {
      userId: req.user?._id,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

// File upload - 10 per hour per user
const uploadLimiter = rateLimit(createLimiterConfig({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id || req.ip,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      userId: req.user?._id,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'Upload rate limit exceeded. Please try again in 1 hour.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

// Password reset - 3 per hour
const passwordResetLimiter = rateLimit(createLimiterConfig({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip,
  handler: (req, res) => {
    logger.warn('Password reset rate limit exceeded', {
      email: req.body.email,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'Too many password reset attempts. Please try again in 1 hour.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

// AI requests - 20 per hour per user
const aiLimiter = rateLimit(createLimiterConfig({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id || req.ip,
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', {
      userId: req.user?._id,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      error: 'AI service rate limit exceeded. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = {
  loginLimiter,
  registrationLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  aiLimiter
};
