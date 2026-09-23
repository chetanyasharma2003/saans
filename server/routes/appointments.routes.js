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
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ date: -1 });

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
      date: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ date: 1 })
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
      date: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .populate('therapistId', 'firstName lastName specialty rating')
      .sort({ date: 1 });

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
    const { therapistId, date, time, type, price, notes } = req.body;

    if (!therapistId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointment = new Appointment({
      userId: req.userId,
      therapistId,
      date: new Date(date),
      time,
      type: type || 'video',
      price: price || 500,
      notes,
      status: 'scheduled',
    });

    await appointment.save();
    await appointment.populate('therapistId', 'firstName lastName specialty rating');

    res.status(201).json({
      success: true,
      message: 'Appointment created',
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

    const { date, time, status, notes, feedback } = req.body;

    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (status) appointment.status = status;
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
router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;
