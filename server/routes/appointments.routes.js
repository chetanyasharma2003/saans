const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticateToken } = require('../middleware/auth');

// ============ GET ALL APPOINTMENTS ============
router.get('/', authenticateToken, async (req, res) => {
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
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ scheduledAt: -1 });

    res.json({
      success: true,
      data: appointments,
      total: appointments.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET UPCOMING APPOINTMENTS ============
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      userId: req.userId,
      scheduledAt: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ scheduledAt: 1 })
      .limit(5);

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET NEXT APPOINTMENT ============
router.get('/next', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const appointment = await Appointment.findOne({
      userId: req.userId,
      scheduledAt: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE APPOINTMENT ============
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('therapistId', 'firstName lastName specialty rating');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE APPOINTMENT ============
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { therapistId, scheduledAt, type, price, notes } = req.body;

    if (!therapistId || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields: therapistId, scheduledAt' });
    }

    // Validate therapist exists and is active
    const User = require('../models/User');
    const therapist = await User.findOne({
      _id: therapistId,
      role: 'therapist',
      status: 'active'
    }).select('_id therapistProfile');

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found or not available' });
    }

    const appointmentDate = new Date(scheduledAt);

    // Validate appointment is in future
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ error: 'Appointment must be scheduled for a future date' });
    }

    // Check for double-booking
    const existingAppointment = await Appointment.findOne({
      therapistId,
      scheduledAt: appointmentDate,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'Therapist already booked at this time' });
    }

    const appointment = new Appointment({
      userId: req.userId,
      therapistId,
      scheduledAt: appointmentDate,
      type: type || 'video',
      price: price || therapist.therapistProfile?.price || 500,
      notes,
      status: 'scheduled',
    });

    await appointment.save();
    await appointment.populate('therapistId', 'firstName lastName specialty rating');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
