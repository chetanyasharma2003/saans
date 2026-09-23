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

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saans', {
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
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

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
