const request = require('supertest');
const app = require('../../server');

describe('AI Routes', () => {
  describe('GET /api/health', () => {
    test('should return health check', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    test('should confirm backend is running', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.body.message).toContain('running');
    });
  });

  describe('POST /api/ai/chat', () => {
    test('should require message parameter', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({});

      expect([400, 401]).toContain(response.status);
    });

    test('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: '' });

      expect([400, 401]).toContain(response.status);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Hello' });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeLessThan(500);
    });
  });
});
