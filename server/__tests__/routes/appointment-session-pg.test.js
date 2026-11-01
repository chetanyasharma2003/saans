const express = require('express');
const request = require('supertest');

jest.mock('../../config/database', () => ({
  sequelize: { transaction: jest.fn() },
}));

jest.mock('../../models/index', () => ({
  Appointment: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Therapist: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../middleware/auth', () => ({
  authenticateToken(req, res, next) {
    req.userId = 'client-id';
    next();
  },
}));

jest.mock('../../services/videoCallService', () => ({
  isConfigured: jest.fn(() => true),
  generateToken: jest.fn((channelName, uid) => ({
    appId: 'agora-app',
    channelName,
    token: 'signed-token',
    uid,
  })),
}));

const { sequelize } = require('../../config/database');
const { Appointment, Therapist } = require('../../models/index');
const videoCallService = require('../../services/videoCallService');
const appointmentsRouter = require('../../routes/appointments-pg.routes');
const videoCallsRouter = require('../../routes/video-calls-complete.routes');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/video-calls', videoCallsRouter);
  return app;
}

describe('PostgreSQL appointment and session routes', () => {
  const app = createApp();
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  let appointment;

  beforeEach(() => {
    videoCallService.isConfigured.mockReturnValue(true);
    videoCallService.generateToken.mockImplementation((channelName, uid) => ({
      appId: 'agora-app',
      channelName,
      token: 'signed-token',
      uid,
    }));
    appointment = {
      id: 'appointment-id',
      userId: 'client-id',
      therapistId: 'therapist-id',
      type: 'audio',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 5 * 60_000),
      duration: 45,
      therapist: { userId: 'therapist-user-id' },
      update: jest.fn(),
    };
    sequelize.transaction.mockImplementation((callback) => callback(transaction));
    Appointment.findAll.mockResolvedValue([]);
    Appointment.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
    Therapist.findByPk.mockResolvedValue({
      id: 'therapist-id',
      isActive: true,
      isVerified: true,
      acceptNewClients: true,
      hourlyRate: 1200,
      timezone: 'Asia/Kolkata',
    });
    Appointment.create.mockResolvedValue({ id: 'appointment-id' });
    Appointment.findByPk.mockResolvedValue(appointment);
  });

  test('rejects invalid booking data without opening a transaction', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({ therapistId: 'therapist-id', type: 'video' });

    expect(response.status).toBe(400);
    expect(sequelize.transaction).not.toHaveBeenCalled();
  });

  test('books a verified therapist and calculates the price on the server', async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
    Appointment.findByPk.mockResolvedValue({ id: 'appointment-id', price: 600 });

    const response = await request(app)
      .post('/api/appointments')
      .send({ therapistId: 'therapist-id', scheduledAt, type: 'audio', duration: 30 });

    expect(response.status).toBe(201);
    expect(Appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'client-id',
        therapistId: 'therapist-id',
        type: 'audio',
        duration: 30,
        price: 600,
        paymentStatus: 'pending',
      }),
      { transaction }
    );
  });

  test('rejects overlapping bookings for the same therapist', async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60_000);
    Appointment.findAll.mockResolvedValue([{
      scheduledAt: new Date(scheduledAt.getTime() - 15 * 60_000),
      duration: 60,
    }]);

    const response = await request(app)
      .post('/api/appointments')
      .send({ therapistId: 'therapist-id', scheduledAt: scheduledAt.toISOString(), duration: 30 });

    expect(response.status).toBe(409);
    expect(Appointment.create).not.toHaveBeenCalled();
  });

  test('scopes appointment lists to the authenticated user', async () => {
    const response = await request(app).get('/api/appointments');

    expect(response.status).toBe(200);
    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'client-id' },
    }));
  });

  test('returns a token for the appointment session type without prematurely changing status', async () => {
    const response = await request(app)
      .post('/api/video-calls/start')
      .send({ appointmentId: 'appointment-id' });

    expect(response.status).toBe(200);
    expect(response.body.data.type).toBe('audio');
    expect(response.body.data.token).toBe('signed-token');
    expect(videoCallService.generateToken).toHaveBeenCalled();
    expect(appointment.status).toBe('scheduled');
  });

  test('marks an authenticated participant connected only after RTC join succeeds', async () => {
    const response = await request(app)
      .post('/api/video-calls/connected')
      .send({ appointmentId: 'appointment-id' });

    expect(response.status).toBe(200);
    expect(appointment.update).toHaveBeenCalledWith({ status: 'in-progress' });
  });
});
