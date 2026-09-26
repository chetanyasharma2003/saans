const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Therapist = require('../models/Therapist');
const Appointment = require('../models/Appointment');

// Get therapist availability
router.get('/:therapistId/availability', async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    res.json({
      success: true,
      data: {
        availability: therapist.availability || [],
        timezone: therapist.timezone || 'Asia/Kolkata',
        sessionDuration: therapist.sessionDuration || 60
      }
    });
  } catch (error) {
    next(error);
  }
});

// Set therapist availability
router.post('/availability/set', authenticateToken, async (req, res, next) => {
  try {
    const { availability } = req.body;

    // Verify user is a therapist
    const therapist = await Therapist.findOne({ userId: req.userId });
    if (!therapist) {
      return res.status(403).json({ success: false, error: 'Not a therapist' });
    }

    await Therapist.findByIdAndUpdate(therapist._id, { availability });

    res.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    next(error);
  }
});

// Get available slots
router.get('/:therapistId/slots', async (req, res, next) => {
  try {
    const { date } = req.query;

    const therapist = await Therapist.findById(req.params.therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    // Get booked appointments
    const bookedSlots = await Appointment.find({
      therapistId: req.params.therapistId,
      scheduledAt: {
        $gte: new Date(date + ' 00:00:00'),
        $lte: new Date(date + ' 23:59:59')
      },
      status: { $ne: 'cancelled' }
    });

    // Generate available slots (every 60 mins from 9 AM to 6 PM)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      const slotTime = new Date(`${date} ${hour.toString().padStart(2, '0')}:00:00`);
      const isBooked = bookedSlots.some(
        (apt) => apt.scheduledAt.getTime() === slotTime.getTime()
      );

      if (!isBooked && slotTime > new Date()) {
        slots.push({
          time: slotTime.toISOString(),
          available: true
        });
      }
    }

    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
});

// Block time (therapist unavailability)
router.post('/block-time', authenticateToken, async (req, res, next) => {
  try {
    const { startTime, endTime, reason } = req.body;

    const therapist = await Therapist.findOne({ userId: req.userId });
    if (!therapist) {
      return res.status(403).json({ success: false, error: 'Not a therapist' });
    }

    await Therapist.findByIdAndUpdate(
      therapist._id,
      {
        $push: {
          blockedTimes: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reason
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, message: 'Time blocked' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
