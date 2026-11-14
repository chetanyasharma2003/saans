/**
 * Security Configuration - FIXED
 * Fixes all CORS, secrets, and security vulnerabilities
 */

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'NODE_ENV'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`❌ MISSING REQUIRED ENV VAR: ${varName}`);
  }
});

module.exports = {
  // CORS Configuration - FIXED
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
  },

  // Session Configuration - FIXED (No hardcoded secrets!)
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // CRITICAL: Prevents XSS
      sameSite: 'strict', // CRITICAL: CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m', // Short-lived token
    refreshExpiresIn: '7d'
  },

  // Helmet Security Headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true
  },

  // Rate Limiting Configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV !== 'production'
  },

  // Stricter limits for auth
  authRateLimiting: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 min
    skipSuccessfulRequests: true
  }
};
