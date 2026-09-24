const request = require('supertest');
const app = require('../../server');

describe('Auth Routes', () => {
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  };

  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `new-${Date.now()}@example.com`
        });

      expect([200, 201]).toContain(response.status);
      if (response.body.success) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      }
    });

    test('should reject missing firstName', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });

    test('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'short'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
    });

    test('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'SomePassword123'
        });

      expect(response.status).toBe(400);
    });

    test('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });
  });
});
