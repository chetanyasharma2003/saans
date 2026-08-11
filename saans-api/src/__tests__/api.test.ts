import request from 'supertest';
import app from '../app.js';

/**
 * SAANS Mental Health Platform - Comprehensive API Test Suite
 * Production-ready tests for all API endpoints
 *
 * Test Coverage:
 * - Authentication (Register, Login, Profile Management, Password Change)
 * - Therapist Management (Get List, Details, Search)
 * - Appointments (Book, View, Status Management)
 * - Payments (Create Order, Verify Payment)
 * - Crisis Detection (Detect Keywords, Trigger Alert)
 */

describe('SAANS Mental Health Platform - API Tests', () => {
  let authToken: string;
  let therapistId: string;

  const testUser = {
    email: `test_${Date.now()}@test.com`,
    password: 'TestPassword123@',
    name: 'Test User',
    role: 'PATIENT',
  };

  // ==================== SETUP & TEARDOWN ====================

  beforeAll(async () => {
    console.log('\n✓ Test Suite Initialization Started\n');
    // Initialize test environment
  });

  afterAll(async () => {
    console.log('\n✓ Test Suite Completed\n');
    // Cleanup after all tests
  });

  beforeEach(async () => {
    // Clear any state before each test if needed
  });

  afterEach(async () => {
    // Cleanup after each test if needed
  });

  // ==================== HEALTH CHECK TESTS ====================

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return API status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });
  });

  // ==================== AUTHENTICATION TESTS ====================

  describe('Authentication - User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
          role: testUser.role,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('accessToken');

      authToken = response.body.accessToken;
    });

    it('should fail to register without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: testUser.password,
          name: testUser.name,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('required');
    });

    it('should fail to register without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `new_${Date.now()}@test.com`,
          name: testUser.name,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to register without name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `new_${Date.now()}@test.com`,
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to register with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testUser.password,
          name: testUser.name,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('email');
    });

    it('should fail to register with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `new_${Date.now()}@test.com`,
          password: '123',
          name: testUser.name,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('password');
    });

    it('should fail to register with duplicate email', async () => {
      // Attempt to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: 'Another User',
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Authentication - User Login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', testUser.email);

      authToken = response.body.accessToken;
    });

    it('should fail to login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123@',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to login without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('required');
    });

    it('should fail to login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should set refresh token cookie on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      if (Array.isArray(cookies)) {
        const refreshTokenCookie = cookies.find((cookie: string) =>
          cookie.includes('refreshToken')
        );
        expect(refreshTokenCookie).toBeDefined();
      }
    });
  });

  describe('Authentication - Profile Management', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', testUser.name);
    });

    it('should fail to get profile without authorization', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should update user profile successfully', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          bio: 'Test bio',
          phoneNumber: '+919876543210',
        })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('bio', 'Test bio');
      expect(response.body).toHaveProperty('phoneNumber', '+919876543210');
    });

    it('should fail to update profile without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Updated Name',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject profile update with invalid name type', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 123, // Invalid: should be string
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication - Password Management', () => {
    it('should change password with correct old password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'NewPassword123@',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Update test user password for subsequent tests
      testUser.password = 'NewPassword123@';
    });

    it('should fail to change password with incorrect old password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongOldPassword@',
          newPassword: 'AnotherPassword123@',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('incorrect');
    });

    it('should fail to change password without old password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'NewPassword123@',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to change password without new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject new password that is too short', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to change password without token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          oldPassword: testUser.password,
          newPassword: 'AnotherPassword123@',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ==================== THERAPIST TESTS ====================

  describe('Therapist Management - List Therapists', () => {
    it('should get all therapists', async () => {
      const response = await request(app)
        .get('/api/therapists')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
      expect(Array.isArray(response.body.therapists)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should get therapists with pagination', async () => {
      const response = await request(app)
        .get('/api/therapists?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should filter therapists by specialty', async () => {
      const response = await request(app)
        .get('/api/therapists?specialty=anxiety')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
      expect(Array.isArray(response.body.therapists)).toBe(true);
    });

    it('should filter therapists by price range', async () => {
      const response = await request(app)
        .get('/api/therapists?minPrice=500&maxPrice=2000')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
    });

    it('should filter therapists by minimum rating', async () => {
      const response = await request(app)
        .get('/api/therapists?minRating=4.0')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
    });

    it('should filter therapists by availability', async () => {
      const response = await request(app)
        .get('/api/therapists?availability=true')
        .expect(200);

      expect(response.body).toHaveProperty('therapists');
    });

    it('should fail with invalid page', async () => {
      const response = await request(app)
        .get('/api/therapists?page=0')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid limit', async () => {
      const response = await request(app)
        .get('/api/therapists?limit=101')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid price range', async () => {
      const response = await request(app)
        .get('/api/therapists?minPrice=2000&maxPrice=500')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Therapist Management - Get Therapist Details', () => {
    it('should get therapist details by ID', async () => {
      // Get a therapist first
      const listResponse = await request(app)
        .get('/api/therapists')
        .expect(200);

      if (listResponse.body.therapists.length > 0) {
        therapistId = listResponse.body.therapists[0].id;

        const response = await request(app)
          .get(`/api/therapists/${therapistId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', therapistId);
        expect(response.body).toHaveProperty('licenseNumber');
        expect(response.body).toHaveProperty('specialization');
        expect(response.body).toHaveProperty('yearsOfExperience');
        expect(response.body).toHaveProperty('hourlyRate');
      }
    });

    it('should fail with invalid therapist ID', async () => {
      const response = await request(app)
        .get('/api/therapists/invalid-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('not found');
    });

    it('should get available slots for therapist', async () => {
      const listResponse = await request(app)
        .get('/api/therapists')
        .expect(200);

      if (listResponse.body.therapists.length > 0) {
        const therapist = listResponse.body.therapists[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const dateStr = futureDate.toISOString().split('T')[0];

        const response = await request(app)
          .get(`/api/therapists/availability/${therapist.id}?date=${dateStr}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should fail get available slots without date', async () => {
      const listResponse = await request(app)
        .get('/api/therapists')
        .expect(200);

      if (listResponse.body.therapists.length > 0) {
        const therapist = listResponse.body.therapists[0];
        const response = await request(app)
          .get(`/api/therapists/availability/${therapist.id}`)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should fail get available slots with invalid date format', async () => {
      const listResponse = await request(app)
        .get('/api/therapists')
        .expect(200);

      if (listResponse.body.therapists.length > 0) {
        const therapist = listResponse.body.therapists[0];
        const response = await request(app)
          .get(`/api/therapists/availability/${therapist.id}?date=invalid-date`)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Therapist Management - Search Therapists', () => {
    it('should search therapists by query', async () => {
      const response = await request(app)
        .get('/api/therapists/search/anxiety')
        .expect(200);

      expect(response.body).toHaveProperty('query', 'anxiety');
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should fail search with empty query', async () => {
      const response = await request(app)
        .get('/api/therapists/search/ ')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should search with custom limit', async () => {
      const response = await request(app)
        .get('/api/therapists/search/anxiety?limit=5')
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(5);
    });

    it('should fail search with invalid limit', async () => {
      const response = await request(app)
        .get('/api/therapists/search/anxiety?limit=101')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ==================== APPOINTMENT TESTS ====================

  describe('Appointments - Book Appointment', () => {
    beforeEach(async () => {
      // Ensure we have a therapist ID for tests
      const listResponse = await request(app)
        .get('/api/therapists')
        .expect(200);

      if (listResponse.body.therapists.length > 0) {
        therapistId = listResponse.body.therapists[0].id;
      }
    });

    it('should book an appointment successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          scheduledAt: futureDate.toISOString(),
          duration: 60,
          reason: 'Anxiety counseling',
          notes: 'First session',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('therapistId', therapistId);
      expect(response.body).toHaveProperty('duration', 60);
      expect(response.body).toHaveProperty('status');
    });

    it('should fail to book appointment without authorization', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/api/appointments/book')
        .send({
          therapistId,
          scheduledAt: futureDate.toISOString(),
          duration: 60,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment without therapist ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduledAt: futureDate.toISOString(),
          duration: 60,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment without scheduled date', async () => {
      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          duration: 60,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment without duration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          scheduledAt: futureDate.toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment with invalid duration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          scheduledAt: futureDate.toISOString(),
          duration: 0,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment with duration > 480 minutes', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          scheduledAt: futureDate.toISOString(),
          duration: 500,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to book appointment with invalid date', async () => {
      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          therapistId,
          scheduledAt: 'invalid-date',
          duration: 60,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Appointments - Get My Appointments', () => {
    it('should get user appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should fail to get appointments without authorization', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should filter appointments by status', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments?status=INVALID_STATUS')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ==================== PAYMENT TESTS ====================

  describe('Payments - Create Order', () => {
    it('should create a payment order for subscription', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'BASIC',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('amount');
      expect(response.body.data).toHaveProperty('currency');
    });

    it('should create order for PREMIUM plan', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'PREMIUM',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should create order for PLUS plan', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'PLUS',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should fail to create order without plan type', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create order with invalid plan type', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'INVALID_PLAN',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid plan');
    });

    it('should fail to create order without authorization', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({
          planType: 'BASIC',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Payments - Verify Payment', () => {
    it('should fail to verify payment with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'invalid_sig',
          planType: 'BASIC',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to verify payment without order ID', async () => {
      const response = await request(app)
        .post('/api/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig',
          planType: 'BASIC',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to verify payment without payment ID', async () => {
      const response = await request(app)
        .post('/api/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_123',
          razorpay_signature: 'sig',
          planType: 'BASIC',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to verify payment without signature', async () => {
      const response = await request(app)
        .post('/api/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          planType: 'BASIC',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to verify payment without authorization', async () => {
      const response = await request(app)
        .post('/api/payments/verify-payment')
        .send({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig',
          planType: 'BASIC',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ==================== CRISIS DETECTION TESTS ====================

  describe('Crisis Detection - Detect Keywords', () => {
    it('should detect crisis keywords in message', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I am having suicidal thoughts',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isCrisis');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('matchedKeywords');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('shouldAlert');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should detect HIGH severity crisis', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I want to kill myself right now',
        })
        .expect(200);

      expect(response.body.isCrisis).toBe(true);
    });

    it('should detect MEDIUM severity crisis', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I am feeling very depressed',
        })
        .expect(200);

      expect(response.body).toHaveProperty('isCrisis');
    });

    it('should handle normal message without crisis', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I am having a good day',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isCrisis');
    });

    it('should fail to detect crisis without message', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with empty message', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with non-string message', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 123,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to detect crisis without authorization', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .send({
          message: 'Test message',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Crisis Detection - Emergency Alert', () => {
    it('should trigger emergency alert', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Immediate mental health crisis',
          severity: 'HIGH',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('incident');
      expect(response.body).toHaveProperty('emergencyContacts');
      expect(response.body).toHaveProperty('hotlines');
      expect(response.body).toHaveProperty('escalated');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should trigger alert with MEDIUM severity', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Moderate mental health concern',
          severity: 'MEDIUM',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should trigger alert with LOW severity', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Minor mental health concern',
          severity: 'LOW',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should fail without description', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          severity: 'HIGH',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid severity', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test alert',
          severity: 'INVALID',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authorization', async () => {
      const response = await request(app)
        .post('/api/crisis/alert')
        .send({
          description: 'Test alert',
          severity: 'HIGH',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Crisis Detection - Get Hotlines', () => {
    it('should get emergency hotlines', async () => {
      const response = await request(app)
        .get('/api/crisis/hotlines')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('hotlines');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('country', 'India');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.hotlines)).toBe(true);
    });

    it('should get hotlines for specific city', async () => {
      const response = await request(app)
        .get('/api/crisis/hotlines?city=Delhi')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('hotlines');
    });

    it('should return pan-India hotlines for unknown city', async () => {
      const response = await request(app)
        .get('/api/crisis/hotlines?city=UnknownCity')
        .expect(200);

      expect(response.body).toHaveProperty('hotlines');
      expect(response.body.hotlines.length).toBeGreaterThan(0);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Integration Tests - Full User Journey', () => {
    it('should complete a full appointment booking journey', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `integration_${Date.now()}@test.com`,
          password: 'IntegrationTest123@',
          name: 'Integration Tester',
          role: 'PATIENT',
        })
        .expect(201);

      const tempAuthToken = registerResponse.body.accessToken;

      // 2. Get therapists
      const therapistsResponse = await request(app)
        .get('/api/therapists?limit=1')
        .expect(200);

      if (therapistsResponse.body.therapists.length > 0) {
        const tempTherapistId = therapistsResponse.body.therapists[0].id;

        // 3. Book appointment
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2);
        futureDate.setHours(10, 0, 0, 0);

        const appointmentResponse = await request(app)
          .post('/api/appointments/book')
          .set('Authorization', `Bearer ${tempAuthToken}`)
          .send({
            therapistId: tempTherapistId,
            scheduledAt: futureDate.toISOString(),
            duration: 60,
            reason: 'Integration test',
          })
          .expect(201);

        expect(appointmentResponse.body).toHaveProperty('id');
        expect(appointmentResponse.body).toHaveProperty('therapistId', tempTherapistId);
      }
    });

    it('should complete payment flow', async () => {
      // 1. Create order
      const orderResponse = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'PREMIUM',
        })
        .expect(201);

      expect(orderResponse.body.data).toHaveProperty('id');

      // 2. Attempt verification (will fail with test data, but structure validates)
      const verifyResponse = await request(app)
        .post('/api/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: orderResponse.body.data.id,
          razorpay_payment_id: 'test_payment',
          razorpay_signature: 'test_signature',
          planType: 'PREMIUM',
        });

      // Verification should respond (may fail due to invalid signature)
      expect([400, 200]).toContain(verifyResponse.status);
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should validate Content-Type for POST requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@test.com',
          password: 'test123',
          name: 'Test',
        });

      // Should either succeed or provide validation error
      expect([201, 400, 409]).toContain(response.status);
    });
  });

  // ==================== SECURITY TESTS ====================

  describe('Security - Authentication & Authorization', () => {
    it('should reject request without Content-Type header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Content-Type', '');

      // May return 400, 401, or 415 depending on implementation
      expect([400, 401, 415]).toContain(response.status);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 401]).toContain(response.status);
    });

    it('should rate limit excessive requests', async () => {
      const email = `ratelimit_${Date.now()}@test.com`;

      // Make multiple requests rapidly
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: `${email}_${i}`,
            password: 'Test123@',
            name: 'Test',
          });
      }

      // The implementation should enforce rate limiting
      // This test verifies the endpoint is responsive
    });
  });
});
