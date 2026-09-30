/**
 * SAANS Backend Server
 * Express + MongoDB Setup
 */

require('dotenv').config();
const express = require('express');
const { sequelize, connectDB } = require('./config/database');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, loginLimiter, registrationLimiter } = require('./middleware/rateLimiter');
const socketService = require('./services/socketService');
require('./config/passport');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// ⚠️ CORS MUST BE FIRST - Before all other middleware
// BULLETPROOF: Allow all origins for now (Vercel needs this)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle OPTIONS preflight explicitly
app.options('*', cors());

// Request ID tracking
app.use(requestIdMiddleware);

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'saans-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Security (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: false, // Don't interfere with CORS
}));

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ DATABASE ============
// PostgreSQL connection initialized in config/database.js

// ============ ROUTES ============

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SAANS Backend is running' });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SAANS API Documentation'
}));

// API Routes (All endpoints at /api/)
// Apply rate limiters only to POST requests (skip OPTIONS preflight)
app.post('/api/auth/login', loginLimiter);
app.post('/api/auth/register', registrationLimiter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/appointments', require('./routes/appointments-pg.routes'));
app.use('/api/mood', require('./routes/mood-pg.routes'));
app.use('/api/therapists', require('./routes/therapist-pg.routes'));
app.use('/api/therapist-register', require('./routes/therapistRegistration.routes'));
app.use('/api/community', require('./routes/community.routes'));
app.use('/api/resources', require('./routes/resources.routes'));
app.use('/api/resource-details', require('./routes/resource-details.routes'));
app.use('/api/admin/analytics', require('./routes/admin.analytics.routes'));
app.use('/api/admin', require('./routes/admin-analytics.routes'));
app.use('/api/payments-enhanced', require('./routes/payments.enhanced.routes'));
app.use('/api/video-calls', require('./routes/videocalls.routes'));
app.use('/api/recommendations', require('./routes/recommendations.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/email', require('./routes/email.routes'));
app.use('/api/files', require('./routes/files.routes'));
app.use('/api/oauth', require('./routes/oauth.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/payments', require('./routes/payments-complete.routes'));
app.use('/api/video-calls', require('./routes/video-calls-complete.routes'));
app.use('/api/messaging', require('./routes/messaging-complete.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/stories', require('./routes/stories.routes'));
app.use('/api/story-details', require('./routes/story-details.routes'));
app.use('/api/groups', require('./routes/groups.routes'));
app.use('/api/group-posts', require('./routes/group-posts.routes'));
app.use('/api/uploads', require('./routes/file-uploads.routes'));
app.use('/api/therapist-availability', require('./routes/therapist-availability.routes'));
app.use('/api/subscriptions', require('./routes/subscriptions-pg.routes'));
app.use('/api/2fa', require('./routes/2fa.routes'));
app.use('/api/email-verification', require('./routes/email-verification.routes'));
app.use('/api', require('./routes/seed.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// ============ SERVER START ============

const startServer = async () => {
  try {
    // Try to connect to database (won't crash if it fails)
    connectDB().catch(err => console.error('DB connection failed:', err.message));

    // Start server regardless of DB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`📍 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`📍 Appointments: http://localhost:${PORT}/api/appointments`);
      console.log(`📍 WebSocket: ws://localhost:${PORT}`);
    });

    // Initialize Socket.io
    socketService.initialize(server);
  } catch (error) {
    console.error('❌ Server Start Error:', error);
    process.exit(1);
  }
};

// Handle Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server shutting down...');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
