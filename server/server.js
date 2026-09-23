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
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Request ID tracking (should be first)
app.use(requestIdMiddleware);

// Security
app.use(helmet());

// CORS Configuration - Handle multiple origins properly
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = corsOrigin
  .split(',')
  .map(url => url.trim())
  .filter(url => url.length > 0);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      // Handle wildcard patterns like *.vercel.app
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*');
        return new RegExp(`^https?://${pattern}$`).test(origin);
      }
      return origin === allowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
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

// API Routes (All endpoints at /api/)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/mood', require('./routes/mood.routes'));
app.use('/api/therapists', require('./routes/therapists.routes'));
app.use('/api/community', require('./routes/community.routes'));

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
