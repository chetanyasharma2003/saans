const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const VideoCall = require('../models/VideoCall');
const Appointment = require('../models/Appointment');

// Generate Agora token
router.post('/generate-token', authenticateToken, async (req, res, next) => {
  try {
    const { appointmentId, channelName } = req.body;

    if (!appointmentId || !channelName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // In production, use agora-access-token to generate token
    // For now, return a mock token
    const token = Buffer.from(`${appointmentId}-${req.userId}-${Date.now()}`).toString('base64');

    res.json({
      success: true,
      token,
      channelName,
      uid: req.userId,
      appId: process.env.AGORA_APP_ID || 'demo'
    });
  } catch (error) {
    next(error);
  }
});

// Start video call
router.post('/start', authenticateToken, async (req, res, next) => {
  try {
    const { appointmentId, channelName } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const videoCall = new VideoCall({
      appointmentId,
      participants: [appointment.userId, appointment.therapistId],
      channelName,
      startedBy: req.userId,
      startTime: new Date(),
      status: 'active'
    });

    await videoCall.save();

    res.json({
      success: true,
      message: 'Call started',
      data: videoCall
    });
  } catch (error) {
    next(error);
  }
});

// End video call
router.post('/:callId/end', authenticateToken, async (req, res, next) => {
  try {
    const { duration, recording } = req.body;

    const videoCall = await VideoCall.findByIdAndUpdate(
      req.params.callId,
      {
        status: 'ended',
        endTime: new Date(),
        duration,
        recordingUrl: recording
      },
      { new: true }
    );

    if (!videoCall) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }

    res.json({
      success: true,
      message: 'Call ended',
      data: videoCall
    });
  } catch (error) {
    next(error);
  }
});

// Get call history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const calls = await VideoCall.find({
      participants: req.userId
    })
      .populate('appointmentId')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await VideoCall.countDocuments({ participants: req.userId });

    res.json({
      success: true,
      data: calls,
      total,
      hasMore: offset + calls.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Get active calls
router.get('/active', authenticateToken, async (req, res, next) => {
  try {
    const activeCalls = await VideoCall.find({
      participants: req.userId,
      status: 'active'
    }).populate('appointmentId');

    res.json({
      success: true,
      data: activeCalls,
      count: activeCalls.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
