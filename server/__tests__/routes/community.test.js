const request = require('supertest');
const app = require('../../server');

describe('Community Routes', () => {
  describe('GET /api/community/posts', () => {
    test('should return community posts', async () => {
      const response = await request(app)
        .get('/api/community/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should have correct post structure', async () => {
      const response = await request(app)
        .get('/api/community/posts');

      if (response.body.data.length > 0) {
        const post = response.body.data[0];
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('likes');
      }
    });

    test('should return at least 3 mock posts', async () => {
      const response = await request(app)
        .get('/api/community/posts');

      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('GET /api/community/posts/:id', () => {
    test('should return single post', async () => {
      const response = await request(app)
        .get('/api/community/posts/1');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error handling', () => {
    test('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/api/community/invalid');

      expect([404, 401]).toContain(response.status);
    });
  });
});
