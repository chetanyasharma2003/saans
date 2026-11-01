const express = require('express');
const request = require('supertest');
const { Op } = require('sequelize');

jest.mock('../../models/index', () => ({
  Therapist: {
    findAndCountAll: jest.fn(),
  },
}));

jest.mock('../../middleware/auth', () => ({
  authenticateToken(req, res, next) {
    req.userId = 'client-id';
    next();
  },
}));

const { Therapist } = require('../../models/index');
const router = require('../../routes/therapist-pg.routes');

function createApp() {
  const app = express();
  app.use('/api/therapists', router);
  return app;
}

describe('Demo therapist marketplace visibility', () => {
  const app = createApp();
  const previousDemoFlag = process.env.ENABLE_DEMO_DATA;

  beforeEach(() => {
    Therapist.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{
        bio: '[DEMO PROFILE ONLY] Fictional sample.',
        licenseNumber: 'must-not-be-exposed',
        certificateUrl: 'must-not-be-exposed',
        toJSON() {
          return {
            id: 'demo-therapist',
            bio: this.bio,
            licenseNumber: this.licenseNumber,
            certificateUrl: this.certificateUrl,
          };
        },
      }],
    });
  });

  afterAll(() => {
    if (previousDemoFlag === undefined) delete process.env.ENABLE_DEMO_DATA;
    else process.env.ENABLE_DEMO_DATA = previousDemoFlag;
  });

  test('does not include fictional profiles unless demo mode is enabled', async () => {
    delete process.env.ENABLE_DEMO_DATA;

    const response = await request(app).get('/api/therapists');

    expect(response.status).toBe(200);
    expect(Therapist.findAndCountAll.mock.calls[0][0].where[Op.or]).toEqual([{ isVerified: true }]);
  });

  test('labels demo profiles and removes credential fields from public output', async () => {
    process.env.ENABLE_DEMO_DATA = 'true';

    const response = await request(app).get('/api/therapists');

    expect(response.status).toBe(200);
    expect(Therapist.findAndCountAll.mock.calls[0][0].where[Op.or]).toEqual([
      { isVerified: true },
      { bio: { [Op.like]: '[DEMO PROFILE ONLY]%' } },
    ]);
    expect(response.body.data[0]).toEqual({
      id: 'demo-therapist',
      bio: '[DEMO PROFILE ONLY] Fictional sample.',
      isDemo: true,
    });
  });
});
