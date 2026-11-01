const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Appointment, Therapist } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

const allowedTypes = ['video', 'audio', 'chat'];
const allowedDurations = [30, 45, 60, 90];
const activeStatuses = ['scheduled', 'confirmed', 'in-progress'];

function parseFutureDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date <= new Date() ? null : date;
}

async function findConflictingAppointment({ therapistId, scheduledAt, duration, transaction, excludeId }) {
  const requestedEnd = scheduledAt.getTime() + duration * 60_000;
  const candidates = await Appointment.findAll({
    where: {
      therapistId,
      status: { [Op.in]: activeStatuses },
      scheduledAt: {
        [Op.gte]: new Date(scheduledAt.getTime() - 90 * 60_000),
        [Op.lt]: new Date(requestedEnd),
      },
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
    transaction,
  });

  return candidates.find((candidate) => {
    const bookedEnd = new Date(candidate.scheduledAt).getTime() + candidate.duration * 60_000;
    return new Date(candidate.scheduledAt).getTime() < requestedEnd && bookedEnd > scheduledAt.getTime();
  });
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const where = { userId: req.userId };
    if (req.query.status) where.status = req.query.status;

    const appointments = await Appointment.findAndCountAll({
      where,
      include: [{ model: Therapist, as: 'therapist' }],
      limit,
      offset,
      order: [['scheduledAt', 'ASC']],
    });

    res.json({ success: true, data: appointments.rows, total: appointments.count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load appointments' });
  }
});

router.get('/next', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        userId: req.userId,
        status: { [Op.in]: ['scheduled', 'confirmed'] },
        scheduledAt: { [Op.gte]: new Date() },
      },
      include: [{ model: Therapist, as: 'therapist' }],
      order: [['scheduledAt', 'ASC']],
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load the next appointment' });
  }
});

router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        userId: req.userId,
        status: { [Op.in]: ['scheduled', 'confirmed'] },
        scheduledAt: { [Op.gte]: new Date() },
      },
      include: [{ model: Therapist, as: 'therapist' }],
      order: [['scheduledAt', 'ASC']],
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load upcoming appointments' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{ model: Therapist, as: 'therapist' }],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load appointment' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { therapistId, scheduledAt: scheduledAtValue, type = 'video', duration = 60, notes } = req.body;
  const scheduledAt = parseFutureDate(scheduledAtValue);
  const sessionDuration = Number(duration);

  if (!therapistId || !scheduledAt || !allowedTypes.includes(type) || !allowedDurations.includes(sessionDuration)) {
    return res.status(400).json({
      success: false,
      error: 'Provide a therapist, future appointment time, supported session type, and valid duration',
    });
  }

  try {
    const appointment = await sequelize.transaction(async (transaction) => {
      const therapist = await Therapist.findByPk(therapistId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!therapist || !therapist.isActive || !therapist.isVerified || !therapist.acceptNewClients) {
        const error = new Error('Therapist is not available for bookings');
        error.statusCode = 404;
        throw error;
      }

      const conflict = await findConflictingAppointment({
        therapistId,
        scheduledAt,
        duration: sessionDuration,
        transaction,
      });
      if (conflict) {
        const error = new Error('This appointment time is no longer available');
        error.statusCode = 409;
        throw error;
      }

      const hourlyRate = Number(therapist.hourlyRate);
      if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
        throw new Error('Therapist rate is not configured');
      }

      return Appointment.create({
        userId: req.userId,
        therapistId,
        scheduledAt,
        duration: sessionDuration,
        timezone: therapist.timezone || 'Asia/Kolkata',
        type,
        status: 'scheduled',
        notes: typeof notes === 'string' ? notes.trim().slice(0, 2000) : null,
        price: (hourlyRate * sessionDuration) / 60,
        paymentStatus: 'pending',
      }, { transaction });
    });

    const created = await Appointment.findByPk(appointment.id, {
      include: [{ model: Therapist, as: 'therapist' }],
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    const statusCode = error.statusCode || (error.name === 'SequelizeForeignKeyConstraintError' ? 404 : 500);
    if (statusCode === 500) console.error('Create appointment failed:', error);
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? 'Unable to book appointment' : error.message,
    });
  }
});

async function rescheduleAppointment(req, res) {
  const scheduledAt = parseFutureDate(req.body.scheduledAt || req.body.newScheduledAt);
  if (!scheduledAt) {
    return res.status(400).json({ success: false, error: 'A future scheduledAt date is required' });
  }

  try {
    const updatedAppointment = await sequelize.transaction(async (transaction) => {
      const currentAppointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          userId: req.userId,
          status: { [Op.in]: ['scheduled', 'confirmed'] },
        },
        transaction,
      });
      if (!currentAppointment) {
        const error = new Error('Appointment not found or cannot be rescheduled');
        error.statusCode = 404;
        throw error;
      }

      const therapist = await Therapist.findByPk(currentAppointment.therapistId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!therapist) {
        const error = new Error('Therapist not found');
        error.statusCode = 404;
        throw error;
      }

      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          userId: req.userId,
          status: { [Op.in]: ['scheduled', 'confirmed'] },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!appointment) {
        const error = new Error('Appointment not found or cannot be rescheduled');
        error.statusCode = 404;
        throw error;
      }

      const conflict = await findConflictingAppointment({
        therapistId: appointment.therapistId,
        scheduledAt,
        duration: appointment.duration,
        transaction,
        excludeId: appointment.id,
      });
      if (conflict) {
        const error = new Error('This appointment time is no longer available');
        error.statusCode = 409;
        throw error;
      }

      await appointment.update({
        scheduledAt,
        ...(typeof req.body.notes === 'string' ? { notes: req.body.notes.trim().slice(0, 2000) } : {}),
      }, { transaction });
      return appointment;
    });

    const result = await Appointment.findByPk(updatedAppointment.id, {
      include: [{ model: Therapist, as: 'therapist' }],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error('Reschedule appointment failed:', error);
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? 'Unable to reschedule appointment' : error.message,
    });
  }
}

router.put('/:id', authenticateToken, rescheduleAppointment);
router.post('/:id/reschedule', authenticateToken, rescheduleAppointment);

router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const [updatedCount] = await Appointment.update({
      status: 'cancelled',
      cancellationReason: typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 500) : null,
    }, {
      where: {
        id: req.params.id,
        userId: req.userId,
        status: { [Op.in]: ['scheduled', 'confirmed'] },
      },
    });

    if (!updatedCount) {
      return res.status(404).json({ success: false, error: 'Appointment not found or cannot be cancelled' });
    }

    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{ model: Therapist, as: 'therapist' }],
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Cancel appointment failed:', error);
    res.status(500).json({ success: false, error: 'Unable to cancel appointment' });
  }
});

module.exports = router;
