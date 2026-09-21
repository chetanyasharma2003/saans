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
// Security middleware removed for performance - can be re-added later if needed
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/errorMiddleware.js';

dotenv.config();

const app: Express = express();

// =============== MINIMAL SETUP - JUST CORS + ROUTES ===============

// Trust proxy
app.set('trust proxy', 1);

// CORS - MAXIMUM PERMISSIVE
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// =============== LOGGING ===============

app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} ${req.method} ${req.path}`);
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
