const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const videoCallService = require('../services/videoCallService');
const notificationService = require('../services/notificationService');
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');

// ==================== TOKEN GENERATION ====================

// Get video call token
router.post('/token', auth, [
  body('appointmentId').isMongoId(),
  body('role').isIn(['publisher', 'subscriber']).optional()
], async (req, res, next) => {
  try {
    // Check if video service is configured
    if (!videoCallService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Video calling service is not configured',
        code: 'VIDEO_SERVICE_UNAVAILABLE'
      });
    }

    const { appointmentId, role = 'publisher' } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Verify user is part of this appointment
    if (appointment.userId.toString() !== req.user._id.toString() &&
        appointment.therapistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const channelName = `appointment_${appointmentId}`;
    const tokenData = videoCallService.generateToken(channelName, req.user._id.toString(), role);

    res.json({
      success: true,
      data: tokenData
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SESSION MANAGEMENT ====================

// Start video session
router.post('/start', auth, [
  body('appointmentId').isMongoId()
], async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const isTherapist = appointment.therapistId.toString() === req.user._id.toString();
    const isUser = appointment.userId.toString() === req.user._id.toString();

    if (!isTherapist && !isUser) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const session = await videoCallService.startVideoSession(
      appointmentId,
      appointment.therapistId.toString(),
      appointment.userId.toString()
    );

    // Update appointment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'in-progress',
      videoSessionId: session.session.channelName
    });

    logger.info('Video session started', { appointmentId });

    res.json({
      success: true,
      data: {
        sessionData: session.session,
        token: isTherapist ? session.therapistToken : session.userToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// End video session
router.post('/end', auth, [
  body('appointmentId').isMongoId(),
  body('duration').isInt({ min: 0 })
], async (req, res, next) => {
  try {
    const { appointmentId, duration } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const session = await videoCallService.endVideoSession(appointmentId, duration);

    // Update appointment
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'completed',
      sessionDuration: duration,
      endTime: new Date()
    });

    logger.info('Video session ended', { appointmentId, duration });

    res.json({
      success: true,
      data: session.session
    });
  } catch (error) {
    next(error);
  }
});

// ==================== RECORDING ====================

// Start recording
router.post('/recording/start', auth, [
  body('appointmentId').isMongoId()
], async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const channelName = `appointment_${appointmentId}`;
    const recording = await videoCallService.startRecording(channelName);

    logger.info('Recording started', { appointmentId, recordingId: recording.recordingId });

    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    next(error);
  }
});

// Stop recording
router.post('/recording/stop', auth, [
  body('recordingId').notEmpty().isString()
], async (req, res, next) => {
  try {
    const { recordingId } = req.body;

    const recording = await videoCallService.stopRecording(recordingId);

    logger.info('Recording stopped', { recordingId });

    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    next(error);
  }
});

// ==================== METRICS ====================

// Log call quality metrics
router.post('/metrics', auth, [
  body('appointmentId').isMongoId(),
  body('audioQuality').isIn(['excellent', 'good', 'fair', 'poor']),
  body('videoQuality').isIn(['excellent', 'good', 'fair', 'poor'])
], async (req, res, next) => {
  try {
    const { appointmentId, ...metrics } = req.body;

    const qualityData = await videoCallService.logCallMetrics(appointmentId, metrics);

    logger.info('Call metrics logged', { appointmentId });

    res.json({
      success: true,
      data: qualityData.metrics
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SCREEN SHARING ====================

// Get screen share token
router.post('/screen/token', auth, [
  body('appointmentId').isMongoId()
], async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const channelName = `appointment_${appointmentId}`;
    const screenToken = videoCallService.generateScreenShareToken(
      channelName,
      req.user._id.toString()
    );

    logger.info('Screen share token generated', { appointmentId });

    res.json({
      success: true,
      data: screenToken
    });
  } catch (error) {
    next(error);
  }
});

// ==================== PRESENCE ====================

// Update user status
router.post('/status', auth, [
  body('appointmentId').isMongoId(),
  body('status').isIn(['online', 'offline', 'idle'])
], async (req, res, next) => {
  try {
    const { appointmentId, status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const channelName = `appointment_${appointmentId}`;
    const statusUpdate = await videoCallService.updateUserStatus(
      req.user._id.toString(),
      channelName,
      status
    );

    logger.info('User status updated', { appointmentId, status });

    res.json({
      success: true,
      data: statusUpdate
    });
  } catch (error) {
    next(error);
  }
});

// ==================== RECONNECTION ====================

// Get backup token for reconnection
router.post('/backup-token', auth, [
  body('appointmentId').isMongoId()
], async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const channelName = `appointment_${appointmentId}`;
    const backupToken = await videoCallService.getBackupToken(
      channelName,
      req.user._id.toString()
    );

    logger.info('Backup token generated for reconnection', { appointmentId });

    res.json({
      success: true,
      data: backupToken
    });
  } catch (error) {
    next(error);
  }
});

// ==================== NOTIFICATIONS ====================

// Send appointment reminder
router.post('/reminder/:appointmentId', auth, async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate('userId');
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Send SMS reminder if phone available
    if (appointment.userId.phone) {
      await notificationService.sendAppointmentReminder(
        appointment.userId.phone,
        'Your Therapist',
        new Date(appointment.startTime).toLocaleTimeString()
      );
    }

    logger.info('Appointment reminder sent', { appointmentId });

    res.json({
      success: true,
      message: 'Reminder sent'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
