const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticateToken } = require('../middleware/auth');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/AppError');
const User = require('../models/User');

// ============ GET ALL APPOINTMENTS ============
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, month } = req.query;
    const query = { userId: req.userId };

    if (status) query.status = status;
    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query.scheduledAt = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('therapistId', 'firstName lastName specialties rating')
      .sort({ scheduledAt: -1 });

    res.json({
      success: true,
      data: appointments,
      total: appointments.length,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET UPCOMING APPOINTMENTS ============
router.get('/upcoming', authenticateToken, async (req, res, next) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      userId: req.userId,
      scheduledAt: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialties rating')
      .sort({ scheduledAt: 1 })
      .limit(5);

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET NEXT APPOINTMENT ============
router.get('/next', authenticateToken, async (req, res, next) => {
  try {
    const now = new Date();
    const appointment = await Appointment.findOne({
      userId: req.userId,
      scheduledAt: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialties rating')
      .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ============ GET SINGLE APPOINTMENT ============
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('therapistId', 'firstName lastName specialties rating');

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ============ CREATE APPOINTMENT ============
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { therapistId, scheduledAt, type, price, notes } = req.body;

    if (!therapistId || !scheduledAt) {
      throw new ValidationError('Missing required fields: therapistId, scheduledAt');
    }

    // Validate therapist exists
    const Therapist = require('../models/Therapist');
    const therapist = await Therapist.findById(therapistId);

    if (!therapist) {
      throw new NotFoundError('Therapist');
    }

    const appointmentDate = new Date(scheduledAt);

    // Validate appointment is in future
    if (appointmentDate <= new Date()) {
      throw new ValidationError('Appointment must be scheduled for a future date');
    }

    // Check for double-booking
    const existingAppointment = await Appointment.findOne({
      therapistId: therapist._id,
      scheduledAt: appointmentDate,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      throw new ConflictError('Therapist already booked at this time');
    }

    const appointment = new Appointment({
      userId: req.userId,
      therapistId: therapist._id,
      scheduledAt: appointmentDate,
      type: type || 'video',
      price: price || therapist.hourlyRate || 800,
      notes,
      status: 'scheduled',
    });

    await appointment.save();
    await appointment.populate('therapistId', 'firstName lastName specialties rating');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ============ UPDATE APPOINTMENT ============
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { scheduledAt, status, notes, feedback } = req.body;

    if (scheduledAt) {
      const newDate = new Date(scheduledAt);
      if (newDate <= new Date()) {
        return res.status(400).json({ error: 'Appointment must be in future' });
      }
      appointment.scheduledAt = newDate;
    }

    if (status) {
      // Validate status transitions
      const validTransitions = {
        'scheduled': ['confirmed', 'cancelled'],
        'confirmed': ['in-progress', 'cancelled'],
        'in-progress': ['completed'],
        'completed': [],
        'cancelled': [],
        'no-show': []
      };

      if (validTransitions[appointment.status] && !validTransitions[appointment.status].includes(status)) {
        return res.status(400).json({ error: `Cannot transition from ${appointment.status} to ${status}` });
      }

      appointment.status = status;
    }

    if (notes) appointment.notes = notes;
    if (feedback) appointment.feedback = feedback;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ============ CANCEL APPOINTMENT ============
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'User cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ============ RESCHEDULE APPOINTMENT ============
router.post('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const newDate = new Date(scheduledAt);

    // Validate new date is in future
    if (newDate <= new Date()) {
      return res.status(400).json({ error: 'Appointment must be scheduled for a future date' });
    }

    // Check for double-booking at new time
    const existingAppointment = await Appointment.findOne({
      therapistId: appointment.therapistId,
      scheduledAt: newDate,
      _id: { $ne: appointment._id },
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'Therapist already booked at this time' });
    }

    appointment.scheduledAt = newDate;
    appointment.status = 'scheduled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
