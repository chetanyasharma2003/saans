const express = require('express');
const router = express.Router();
const { Appointment, Therapist } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

// Get user appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const where = { userId: req.userId };
    if (status) where.status = status;

    const appointments = await Appointment.findAndCountAll({
      where,
      include: [{ model: Therapist, as: 'therapist' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduledAt', 'DESC']],
    });

    res.json({
      success: true,
      data: appointments.rows,
      total: appointments.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single appointment
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { therapistId, scheduledAt, type, duration, price, notes } = req.body;

    if (!therapistId || !scheduledAt || !price) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const appointment = await Appointment.create({
      userId: req.userId,
      therapistId,
      scheduledAt: new Date(scheduledAt),
      type: type || 'video',
      duration: duration || 60,
      price,
      notes,
      status: 'scheduled',
      paymentStatus: 'pending',
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update appointment (reschedule, notes, feedback)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{ model: Therapist, as: 'therapist' }],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const { status, scheduledAt, notes, feedbackRating, feedbackComment } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (notes) updateData.notes = notes;
    if (feedbackRating) updateData.feedbackRating = feedbackRating;
    if (feedbackComment) updateData.feedbackComment = feedbackComment;

    await appointment.update(updateData);

    // Fetch updated appointment with associations
    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [{ model: Therapist, as: 'therapist' }],
    });

    res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel appointment
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    await appointment.update({
      status: 'cancelled',
      cancellationReason: req.body.reason,
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
