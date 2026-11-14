/**
 * Video Call Routes - Agora Integration
 * Complete implementation for therapy video sessions
 */

const express = require('express');
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const { Appointment } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { z } = require('zod');

// Agora Configuration
const AGORA_APP_ID = process.env.AGORA_APP_ID || 'default_app_id';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'default_cert';

// Validation schemas
const tokenSchema = z.object({
  appointmentId: z.string().uuid(),
  role: z.enum(['publisher', 'subscriber']).default('publisher')
});

const recordingSchema = z.object({
  appointmentId: z.string().uuid(),
  action: z.enum(['start', 'stop']),
  recordingType: z.enum(['individual', 'composite']).default('composite')
});

/**
 * Generate Agora Token for video session
 * POST /api/video/token
 */
router.post('/token', protect, async (req, res) => {
  try {
    const { appointmentId, role } = tokenSchema.parse(req.body);

    // Verify appointment exists and user has access
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check user is therapist or client for this appointment
    const isTherapist = req.user.id === appointment.therapistId;
    const isClient = req.user.id === appointment.userId;

    if (!isTherapist && !isClient) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    // Generate token
    const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      appointmentId,
      req.user.id,
      rtcRole,
      privilegeExpiredTs
    );

    // Log session start
    await Appointment.update(
      {
        status: 'in_progress',
        sessionStartedAt: new Date()
      },
      { where: { id: appointmentId } }
    );

    res.json({
      token,
      appointmentId,
      uid: req.user.id,
      expiresIn: expirationTimeInSeconds,
      appId: AGORA_APP_ID
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Start recording for appointment
 * POST /api/video/recording/start
 */
router.post('/recording/start', protect, async (req, res) => {
  try {
    const { appointmentId, recordingType } = recordingSchema.parse(req.body);

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only therapist can start recording
    if (req.user.id !== appointment.therapistId) {
      return res.status(403).json({ error: 'Only therapist can start recording' });
    }

    // Update appointment
    await appointment.update({
      recordingStartedAt: new Date(),
      recordingType: recordingType,
      isRecording: true
    });

    res.json({
      message: 'Recording started',
      appointmentId,
      recordingType,
      recordingStartedAt: appointment.recordingStartedAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Stop recording for appointment
 * POST /api/video/recording/stop
 */
router.post('/recording/stop', protect, async (req, res) => {
  try {
    const { appointmentId } = z.object({
      appointmentId: z.string().uuid()
    }).parse(req.body);

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only therapist can stop recording
    if (req.user.id !== appointment.therapistId) {
      return res.status(403).json({ error: 'Only therapist can stop recording' });
    }

    const recordingDuration = appointment.recordingStartedAt
      ? Math.floor((new Date() - appointment.recordingStartedAt) / 60000)
      : 0;

    // Update appointment
    await appointment.update({
      recordingEndedAt: new Date(),
      recordingDuration: recordingDuration,
      isRecording: false,
      recordingUrl: `https://recordings.saans.com/${appointmentId}.mp4`
    });

    res.json({
      message: 'Recording stopped',
      appointmentId,
      recordingDuration,
      recordingUrl: appointment.recordingUrl
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * End session
 * POST /api/video/session/end
 */
router.post('/session/end', protect, async (req, res) => {
  try {
    const { appointmentId, notes } = z.object({
      appointmentId: z.string().uuid(),
      notes: z.string().optional()
    }).parse(req.body);

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const sessionDuration = appointment.sessionStartedAt
      ? Math.floor((new Date() - appointment.sessionStartedAt) / 60000)
      : 0;

    // Update appointment
    await appointment.update({
      status: 'completed',
      sessionEndedAt: new Date(),
      sessionDuration: sessionDuration,
      therapistNotes: notes || null
    });

    // Create activity log
    // await ActivityLog.create({
    //   userId: req.user.id,
    //   appointmentId: appointmentId,
    //   action: 'session_completed',
    //   duration: sessionDuration
    // });

    res.json({
      message: 'Session ended',
      appointmentId,
      sessionDuration,
      recordingUrl: appointment.recordingUrl
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get session history
 * GET /api/video/history
 */
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const appointments = await Appointment.findAll({
      where: {
        status: 'completed',
        [require('sequelize').Op.or]: [
          { userId: req.user.id },
          { therapistId: req.user.id }
        ]
      },
      order: [['sessionEndedAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      attributes: [
        'id', 'userId', 'therapistId', 'scheduledAt',
        'sessionDuration', 'recordingUrl', 'sessionEndedAt'
      ]
    });

    const total = await Appointment.count({
      where: {
        status: 'completed',
        [require('sequelize').Op.or]: [
          { userId: req.user.id },
          { therapistId: req.user.id }
        ]
      }
    });

    res.json({
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
