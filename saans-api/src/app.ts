import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import crisisRoutes from './routes/crisisRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import {
  validateSecurityConfig,
  requestIdMiddleware,
  csrfSessionMiddleware,
  securityHeadersMiddleware,
  cspMiddleware,
  hstsMiddleware,
  secureCookieMiddleware,
  permissionsPolicyMiddleware,
  csrfTokenMiddleware,
  verifyCsrfMiddleware,
  rateLimitMiddleware,
  validateRequestSizeMiddleware,
  sanitizeInputMiddleware,
} from './middleware/securityMiddleware.js';
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/errorMiddleware.js';

dotenv.config();

// =============== SECURITY CONFIGURATION ===============

// Validate security config on startup
validateSecurityConfig();

const app: Express = express();

// =============== TRUST PROXY ===============

// Trust X-Forwarded-For when behind reverse proxy (Nginx, Vercel, etc.)
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

// =============== REQUEST TRACKING ===============

// Add request IDs for logging and debugging
app.use(requestIdMiddleware);

// =============== BODY PARSING & SIZE VALIDATION ===============

// Validate request size before parsing
app.use(validateRequestSizeMiddleware(Number(process.env.MAX_REQUEST_SIZE_MB) || 10));

// Body parsing with size limits
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE_MB || '10mb' }));
app.use(
  express.urlencoded({
    limit: process.env.MAX_REQUEST_SIZE_MB || '10mb',
    extended: true,
  })
);

// =============== CORS ===============

const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow all localhost origins in development
  if (process.env.NODE_ENV !== 'production') {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev
    }
  } else {
    // Production: use env var
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin || '')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    maxAge: 3600,
  })
);

// =============== SECURITY HEADERS ===============

// Comprehensive security headers
app.use(securityHeadersMiddleware);

// Content Security Policy
app.use(cspMiddleware);

// HSTS (HTTP Strict Transport Security)
app.use(hstsMiddleware);

// Permissions Policy (Feature Policy)
app.use(permissionsPolicyMiddleware);

// Secure cookie defaults
app.use(secureCookieMiddleware);

// =============== CSRF PROTECTION ===============

// Initialize CSRF session tracking
app.use(csrfSessionMiddleware);

// Provide CSRF tokens on GET requests
app.use(csrfTokenMiddleware);

// =============== INPUT VALIDATION & RATE LIMITING ===============

// Sanitize input to prevent injection attacks
app.use(sanitizeInputMiddleware);

// Rate limiting - disabled in development, configurable via environment
if (process.env.NODE_ENV === 'production') {
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
  const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
  app.use(rateLimitMiddleware(rateLimitWindowMs, rateLimitMaxRequests));
}

// =============== CSRF VERIFICATION FOR STATE-CHANGING REQUESTS ===============

// Verify CSRF token on POST, PUT, DELETE, PATCH requests
app.use(verifyCsrfMiddleware);

// =============== REQUEST LOGGING ===============

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.id || 'unknown';
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// =============== SWAGGER DOCUMENTATION ===============

// =============== ROUTES ===============

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API status
app.get('/api/status', (_req, res) => {
  res.status(200).json({
    status: 'operational',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Therapist routes
app.use('/api/therapists', therapistRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Crisis routes
app.use('/api/crisis', crisisRoutes);

// Community routes
app.use('/api/community', communityRoutes);

// Mood routes
app.use('/api/moods', moodRoutes);

// =============== ERROR HANDLING ===============

// 404 handler (must be before global error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
