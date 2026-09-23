/**
 * Integration Tests - SAANS Backend
 * Tests all critical fixes
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

describe('SAANS Integration Tests', () => {
  let server;
  let testUser;
  let testTherapist;
  let authToken;

  beforeAll(() => {
    server = app;
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await Appointment.deleteMany({});
  });

  // ============ JWT SECURITY TESTS ============

  describe('JWT Security', () => {
    test('Should require JWT_SECRET env var', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET).not.toEqual('secret-key');
    });
  });

  // ============ AUTHENTICATION TESTS ============

  describe('Authentication', () => {
    test('Should register user with strong password', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');

      testUser = res.body.user;
      authToken = res.body.token;
    });

    test('Should reject weak password', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak', // Too weak
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Should reject duplicate email', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com', // Already exists
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT');
    });

    test('Should login successfully', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('Should reject invalid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    test('Should verify valid token', async () => {
      const res = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBeDefined();
    });

    test('Should reject invalid token', async () => {
      const res = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  // ============ APPOINTMENT TESTS ============

  describe('Appointments', () => {
    beforeAll(async () => {
      // Create a therapist
      testTherapist = await User.create({
        email: 'therapist@example.com',
        password: 'Test@123456',
        firstName: 'Dr.',
        lastName: 'Therapist',
        role: 'therapist',
        status: 'active',
        therapistProfile: {
          licenseNumber: 'LIC123',
          specialties: ['anxiety', 'depression'],
          price: 500,
        },
      });
    });

    test('Should create appointment in future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

      const res = await request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId: testTherapist._id,
          scheduledAt: futureDate,
          type: 'video',
          notes: 'Test appointment',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('scheduled');
    });

    test('Should reject appointment in past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const res = await request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId: testTherapist._id,
          scheduledAt: pastDate,
          type: 'video',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('Should reject appointment with non-existent therapist', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const res = await request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId: '507f1f77bcf86cd799439011', // Non-existent ID
          scheduledAt: futureDate,
          type: 'video',
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('Should prevent double-booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);

      // Create first appointment
      await Appointment.create({
        userId: testUser._id,
        therapistId: testTherapist._id,
        scheduledAt: futureDate,
        type: 'video',
        price: 500,
        status: 'scheduled',
      });

      // Try to create second appointment at same time
      const res = await request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId: testTherapist._id,
          scheduledAt: futureDate,
          type: 'video',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT');
    });

    test('Should get user appointments', async () => {
      const res = await request(server)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ============ ERROR HANDLING TESTS ============

  describe('Error Handling', () => {
    test('Should return proper error format', async () => {
      const res = await request(server)
        .get('/api/appointments/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBeDefined();
      expect(res.body.error).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    test('Should include request ID in response', async () => {
      const res = await request(server)
        .get('/api/health');

      expect(res.headers['x-request-id']).toBeDefined();
    });

    test('Should handle missing required fields', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // password missing
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // ============ API RESPONSE STRUCTURE TESTS ============

  describe('API Response Structure', () => {
    test('Health endpoint should return proper structure', async () => {
      const res = await request(server)
        .get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });

    test('Error responses should have consistent structure', async () => {
      const res = await request(server)
        .get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
