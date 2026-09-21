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
import analyticsRoutes from './routes/analyticsRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import medicalRecordsRoutes from './routes/medicalRecordsRoutes.js';
import progressTrackingRoutes from './routes/progressTrackingRoutes.js';
import safetyPlanRoutes from './routes/safetyPlanRoutes.js';
import wellnessResourcesRoutes from './routes/wellnessResourcesRoutes.js';
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

// =============== REQUEST LOGGING (FIRST!) ===============

// Log EVERY request immediately
app.use((req, res, next) => {
  console.log(`📍 [${new Date().toISOString()}] ${req.method} ${req.path} from ${req.get('origin')}`);
  next();
});

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

// Allow ALL origins - maximum permissive mode
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));

// Handle OPTIONS preflight
app.options('*', cors());

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

// =============== ROUTES ===============

// Health check
app.get('/health', (_req, res) => {
  console.log('✅ /health endpoint called');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Test endpoint (no middleware)
app.get('/test', (_req, res) => {
  console.log('✅ /test endpoint called');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ message: 'Backend is responding!' });
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

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Matching routes
app.use('/api/matching', matchingRoutes);

// Reports routes
app.use('/api/reports', reportRoutes);

// Subscriptions routes
app.use('/api/subscriptions', subscriptionRoutes);

// Medical Records routes
app.use('/api/medical-records', medicalRecordsRoutes);

// Progress Tracking routes
app.use('/api/progress', progressTrackingRoutes);

// Safety Plan routes
app.use('/api/safety', safetyPlanRoutes);

// Wellness Resources routes
app.use('/api/wellness', wellnessResourcesRoutes);

// =============== ERROR HANDLING ===============

// 404 handler (must be before global error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
