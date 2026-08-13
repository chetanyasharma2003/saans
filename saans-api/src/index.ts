import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { initializeRedis } from './utils/redis.js';
import AppointmentReminderJob from './jobs/appointmentReminder.js';

dotenv.config();

const prisma = new PrismaClient();
const PORT = parseInt(process.env.API_PORT || '3000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

// Store cleanup functions for graceful shutdown
let stopReminderJob: (() => void) | null = null;
let stopNoShowDetection: (() => void) | null = null;

// Create HTTP server
const server = createServer(app);

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] User connected: ${socket.id}`);

  // Placeholder for chat events (to be implemented in Week 3-4)
  socket.on('message:send', (data) => {
    console.log(`[Socket.io] Message received: ${data.content.substring(0, 50)}...`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] User disconnected: ${socket.id}`);
  });
});

// Attach io to app for use in routes
(app as any).io = io;

// Database connection check
async function checkDatabase() {
  // Skip if no DATABASE_URL configured
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not configured - running without database');
    return;
  }

  try {
    // Try to count users as a safer test
    await prisma.user.count();
    console.log('✅ Database connected');
  } catch (error: any) {
    console.warn('⚠️  Database connection failed, but continuing anyway:', error.message);
    // Don't exit - let the app start anyway
  }
}

// Start server
async function start() {
  try {
    // Check database
    await checkDatabase();

    // Initialize Redis (non-blocking)
    initializeRedis().catch(() => console.warn('⚠️ Redis not available - caching disabled'));

    // Start appointment reminder jobs
    stopReminderJob = AppointmentReminderJob.startPeriodicJob(30 * 60 * 1000); // Every 30 minutes
    stopNoShowDetection = AppointmentReminderJob.startNoShowDetection(60 * 60 * 1000); // Every 60 minutes

    // Start listening
    server.listen(PORT, HOST, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║        🚀 SAANS API SERVER STARTED 🚀          ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Server running at: http://${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}`);
      console.log(`🔌 WebSocket: Enabled (Socket.io)`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  GET  /health                           - Server health check');
      console.log('  GET  /api/status                       - API status');
      console.log('  POST /api/auth/login                   - Login');
      console.log('  POST /api/auth/register                - Register');
      console.log('  POST /api/appointments/book            - Book appointment');
      console.log('  GET  /api/appointments/my-appointments - Get my appointments');
      console.log('  GET  /api/appointments/:id             - Get appointment details');
      console.log('  PUT  /api/appointments/:id/status      - Update status');
      console.log('  POST /api/appointments/:id/reschedule  - Reschedule appointment');
      console.log('  POST /api/appointments/:id/cancel      - Cancel appointment');
      console.log('  POST /api/crisis/detect                - Detect crisis in message');
      console.log('  POST /api/crisis/alert                 - Trigger emergency alert');
      console.log('  GET  /api/crisis/my-incidents          - Get incident history');
      console.log('');
      console.log('Background Jobs:');
      console.log('  ✅ Appointment reminders (24h before)');
      console.log('  ✅ No-show detection (30min after)');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');

  // Stop background jobs
  if (stopReminderJob) {
    stopReminderJob();
  }
  if (stopNoShowDetection) {
    stopNoShowDetection();
  }

  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
start();
