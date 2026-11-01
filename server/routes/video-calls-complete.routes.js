const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Appointment, Therapist } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const videoCallService = require('../services/videoCallService');

function getAgoraUid(userId) {
  const uid = crypto.createHash('sha256').update(userId).digest().readUInt32BE(0);
  return uid || 1;
}

async function getAuthorizedCallAppointment(appointmentId, userId) {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [{ model: Therapist, as: 'therapist' }],
  });

  if (!appointment) {
    return { error: { status: 404, message: 'Appointment not found' } };
  }
  if (appointment.userId !== userId && appointment.therapist?.userId !== userId) {
    return { error: { status: 403, message: 'You are not a participant in this appointment' } };
  }
  if (!['video', 'audio'].includes(appointment.type)) {
    return { error: { status: 400, message: 'This appointment is not an audio or video session' } };
  }
  if (!['scheduled', 'confirmed', 'in-progress'].includes(appointment.status)) {
    return { error: { status: 409, message: 'This appointment is no longer active' } };
  }

  const startsAt = new Date(appointment.scheduledAt).getTime();
  const now = Date.now();
  const endsAt = startsAt + appointment.duration * 60_000;
  if (now < startsAt - 15 * 60_000 || now > endsAt) {
    return { error: { status: 409, message: 'The session can be joined from 15 minutes before its scheduled start until it ends' } };
  }

  return { appointment };
}

function unavailableVideoService(res) {
  if (!videoCallService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Video calling is not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE on the backend.',
      code: 'VIDEO_SERVICE_UNAVAILABLE',
    });
    return true;
  }
  return false;
}

router.post('/generate-token', authenticateToken, async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ success: false, error: 'appointmentId is required' });
  }
  if (unavailableVideoService(res)) return;

  try {
    const result = await getAuthorizedCallAppointment(appointmentId, req.userId);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, error: result.error.message });
    }

    const channelName = `appointment_${result.appointment.id}`;
    const token = videoCallService.generateToken(channelName, getAgoraUid(req.userId));
    res.json({
      success: true,
      data: {
        appId: token.appId,
        channelName: token.channelName,
        token: token.token,
        uid: token.uid,
      },
    });
  } catch (error) {
    console.error('Generate video session token failed:', error);
    res.status(500).json({ success: false, error: 'Unable to prepare the session' });
  }
});

router.post('/start', authenticateToken, async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ success: false, error: 'appointmentId is required' });
  }
  if (unavailableVideoService(res)) return;

  try {
    const result = await getAuthorizedCallAppointment(appointmentId, req.userId);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, error: result.error.message });
    }

    const appointment = result.appointment;
    const token = videoCallService.generateToken(
      `appointment_${appointment.id}`,
      getAgoraUid(req.userId)
    );
    res.json({
      success: true,
      data: {
        appointmentId: appointment.id,
        appId: token.appId,
        channelName: token.channelName,
        token: token.token,
        uid: token.uid,
        type: appointment.type,
      },
    });
  } catch (error) {
    console.error('Start video session failed:', error);
    res.status(500).json({ success: false, error: 'Unable to start the session' });
  }
});

router.post('/connected', authenticateToken, async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ success: false, error: 'appointmentId is required' });
  }

  try {
    const result = await getAuthorizedCallAppointment(appointmentId, req.userId);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, error: result.error.message });
    }

    const appointment = result.appointment;
    if (appointment.status !== 'in-progress') {
      await appointment.update({ status: 'in-progress' });
    }
    res.json({ success: true, data: { appointmentId: appointment.id, status: 'in-progress' } });
  } catch (error) {
    console.error('Mark session connected failed:', error);
    res.status(500).json({ success: false, error: 'Unable to mark the session as connected' });
  }
});

router.post('/end', authenticateToken, async (req, res) => {
  const { appointmentId, duration } = req.body;
  if (!appointmentId || !Number.isInteger(duration) || duration < 0) {
    return res.status(400).json({ success: false, error: 'appointmentId and a non-negative duration are required' });
  }

  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Therapist, as: 'therapist' }],
    });
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    if (appointment.userId !== req.userId && appointment.therapist?.userId !== req.userId) {
      return res.status(403).json({ success: false, error: 'You are not a participant in this appointment' });
    }
    if (appointment.status !== 'in-progress') {
      return res.status(409).json({ success: false, error: 'This session is not in progress' });
    }

    await appointment.update({ status: 'completed' });
    res.json({ success: true, data: { appointmentId: appointment.id, status: 'completed', duration } });
  } catch (error) {
    console.error('End video session failed:', error);
    res.status(500).json({ success: false, error: 'Unable to end the session' });
  }
});

router.get('/active', authenticateToken, async (req, res) => {
  try {
    const therapists = await Therapist.findAll({ where: { userId: req.userId }, attributes: ['id'] });
    const therapistIds = therapists.map((therapist) => therapist.id);
    const appointments = await Appointment.findAll({
      where: {
        status: 'in-progress',
        [Op.or]: [
          { userId: req.userId },
          ...(therapistIds.length ? [{ therapistId: { [Op.in]: therapistIds } }] : []),
        ],
      },
      include: [{ model: Therapist, as: 'therapist' }],
      order: [['scheduledAt', 'DESC']],
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get active sessions failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load active sessions' });
  }
});

module.exports = router;
