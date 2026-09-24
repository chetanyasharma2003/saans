/**
 * SAANS Backend Server
 * Express + MongoDB Setup
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Request ID tracking (should be first)
app.use(requestIdMiddleware);

// CORS Configuration - Must be BEFORE helmet
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Whitelist of allowed patterns
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/, // localhost:* for dev
      /^https?:\/\/.*\.vercel\.app$/, // All Vercel deployments (preview + production)
      /^https:\/\/saans-mental-health\.vercel\.app$/, // Production
    ];

    // Check if origin matches any allowed pattern
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

    // If CORS_ORIGIN env var is set, also check those
    if (process.env.CORS_ORIGIN) {
      const customOrigins = process.env.CORS_ORIGIN
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (customOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*');
          return new RegExp(`^https?://${pattern}$`).test(origin);
        }
        return origin === allowed;
      })) {
        return callback(null, true);
      }
    }

    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/saans';
    if (!mongoURI) {
      throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
    }
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

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
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/mood', require('./routes/mood.routes'));
app.use('/api/therapists', require('./routes/therapists.routes'));
app.use('/api/community', require('./routes/community.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/email', require('./routes/email.routes'));
app.use('/api/files', require('./routes/files.routes'));

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
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`📍 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`📍 Appointments: http://localhost:${PORT}/api/appointments`);
    });
  } catch (error) {
    console.error('❌ Server Start Error:', error);
    process.exit(1);
  }
};

// Handle Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;
