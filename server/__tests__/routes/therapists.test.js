const request = require('supertest');
const app = require('../../server');

describe('Therapists Routes', () => {
  describe('GET /api/therapists', () => {
    test('should return all therapists', async () => {
      const response = await request(app)
        .get('/api/therapists');

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    test('should have correct therapist structure', async () => {
      const response = await request(app)
        .get('/api/therapists');

      if (response.body.data.length > 0) {
        const therapist = response.body.data[0];
        expect(therapist).toHaveProperty('name');
        expect(therapist).toHaveProperty('specialty');
        expect(therapist).toHaveProperty('rating');
        expect(therapist).toHaveProperty('price');
        expect(therapist).toHaveProperty('languages');
      }
    });

    test('should filter by specialty', async () => {
      const response = await request(app)
        .get('/api/therapists?specialty=Depression');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].specialty).toContain('Depression');
      }
    });

    test('should filter by language', async () => {
      const response = await request(app)
        .get('/api/therapists?language=Hindi');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].languages).toContain('Hindi');
      }
    });

    test('should filter by minimum rating', async () => {
      const response = await request(app)
        .get('/api/therapists?minRating=4.5');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].rating).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('should filter by maximum price', async () => {
      const response = await request(app)
        .get('/api/therapists?maxPrice=500');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].price).toBeLessThanOrEqual(500);
      }
    });
  });

  describe('GET /api/therapists/:id', () => {
    test('should return therapist by id', async () => {
      const response = await request(app)
        .get('/api/therapists/1');

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('rating');
      }
    });
  });

  describe('GET /api/therapists/options/specialties', () => {
    test('should return all specialties', async () => {
      const response = await request(app)
        .get('/api/therapists/options/specialties');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should have correct specialty structure', async () => {
      const response = await request(app)
        .get('/api/therapists/options/specialties');

      if (response.body.data.length > 0) {
        const specialty = response.body.data[0];
        expect(specialty).toHaveProperty('name');
        expect(specialty).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/therapists/options/languages', () => {
    test('should return all languages', async () => {
      const response = await request(app)
        .get('/api/therapists/options/languages');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should include common languages', async () => {
      const response = await request(app)
        .get('/api/therapists/options/languages');

      expect(response.body.data).toContain('English');
      expect(response.body.data).toContain('Hindi');
    });
  });
});
