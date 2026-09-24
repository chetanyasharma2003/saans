const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Send Welcome Email
router.post('/send-welcome', async (req, res, next) => {
  try {
    const { firstName, email } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({
        error: 'firstName and email are required'
      });
    }

    logger.info('Welcome email request', { email });

    const result = await emailService.sendWelcomeEmail({
      firstName,
      email
    });

    res.json(result);
  } catch (error) {
    logger.error('Welcome email send failed', { error: error.message });
    next(error);
  }
});

// Send Password Reset Email
router.post('/send-password-reset', async (req, res, next) => {
  try {
    const { firstName, email, resetLink } = req.body;

    if (!firstName || !email || !resetLink) {
      return res.status(400).json({
        error: 'firstName, email, and resetLink are required'
      });
    }

    logger.info('Password reset email request', { email });

    const result = await emailService.sendPasswordResetEmail(
      { firstName, email },
      resetLink
    );

    res.json(result);
  } catch (error) {
    logger.error('Password reset email send failed', { error: error.message });
    next(error);
  }
});

// Send Appointment Confirmation
router.post('/send-appointment-confirmation', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, email, therapistName, date, time, type } = req.body;

    if (!firstName || !email || !therapistName || !date || !time || !type) {
      return res.status(400).json({
        error: 'All appointment details are required'
      });
    }

    logger.info('Appointment confirmation email request', {
      userId: req.userId,
      email,
      therapistName
    });

    const result = await emailService.sendAppointmentConfirmation(
      { firstName, email },
      { therapistName, date, time, type }
    );

    res.json(result);
  } catch (error) {
    logger.error('Appointment confirmation email send failed', {
      error: error.message
    });
    next(error);
  }
});

// Send Appointment Reminder
router.post('/send-appointment-reminder', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, email, therapistName, time, type } = req.body;

    if (!firstName || !email || !therapistName || !time || !type) {
      return res.status(400).json({
        error: 'All appointment details are required'
      });
    }

    logger.info('Appointment reminder email request', {
      userId: req.userId,
      email
    });

    const result = await emailService.sendAppointmentReminder(
      { firstName, email },
      { therapistName, time, type }
    );

    res.json(result);
  } catch (error) {
    logger.error('Appointment reminder email send failed', {
      error: error.message
    });
    next(error);
  }
});

// Send Weekly Mood Report
router.post('/send-weekly-report', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, email, stats } = req.body;

    if (!firstName || !email || !stats) {
      return res.status(400).json({
        error: 'firstName, email, and stats are required'
      });
    }

    logger.info('Weekly report email request', {
      userId: req.userId,
      email
    });

    const result = await emailService.sendWeeklyReport(
      { firstName, email },
      stats
    );

    res.json(result);
  } catch (error) {
    logger.error('Weekly report email send failed', {
      error: error.message
    });
    next(error);
  }
});

// Send Therapist Recommendation
router.post('/send-therapist-recommendation', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, email, therapist } = req.body;

    if (!firstName || !email || !therapist) {
      return res.status(400).json({
        error: 'firstName, email, and therapist are required'
      });
    }

    logger.info('Therapist recommendation email request', {
      userId: req.userId,
      email
    });

    const result = await emailService.sendTherapistRecommendation(
      { firstName, email },
      therapist
    );

    res.json(result);
  } catch (error) {
    logger.error('Therapist recommendation email send failed', {
      error: error.message
    });
    next(error);
  }
});

module.exports = router;
