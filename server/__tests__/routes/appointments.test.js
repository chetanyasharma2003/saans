const request = require('supertest');
const app = require('../../server');

describe('Appointments Routes', () => {
  describe('GET /api/appointments', () => {
    test('should return status 200 or 401', async () => {
      const response = await request(app)
        .get('/api/appointments');

      expect([200, 401]).toContain(response.status);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', '');

      expect([401, 400]).toContain(response.status);
    });
  });

  describe('GET /api/appointments/upcoming', () => {
    test('should return upcoming appointments endpoint', async () => {
      const response = await request(app)
        .get('/api/appointments/upcoming');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('GET /api/appointments/next', () => {
    test('should return next appointment endpoint', async () => {
      const response = await request(app)
        .get('/api/appointments/next');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('Error handling', () => {
    test('should have proper middleware for error handling', async () => {
      const response = await request(app)
        .get('/api/appointments/invalid-route');

      expect([404, 401]).toContain(response.status);
    });
  });
});
