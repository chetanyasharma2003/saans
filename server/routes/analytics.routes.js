const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

/**
 * Analytics Routes - Dashboard & Reports
 */

// Get dashboard stats (admin only)
router.get('/dashboard/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await analyticsService.getDashboardStats(parseInt(days));

    await analyticsService.trackEvent(req.user._id, 'analytics_viewed', {
      type: 'dashboard',
      days
    });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get dashboard stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user engagement (user's own or admin can view all)
router.get('/engagement/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    // Check permission
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        statusCode: 403,
        timestamp: new Date().toISOString()
      });
    }

    const engagement = await analyticsService.getUserEngagement(userId, parseInt(days));

    res.json({
      success: true,
      data: engagement,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get user engagement failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get revenue report (admin only)
router.get('/revenue/report', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'startDate must be before endDate',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const report = await analyticsService.getRevenueReport(start, end);

    await analyticsService.trackEvent(req.user._id, 'analytics_viewed', {
      type: 'revenue',
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get revenue report failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get therapist performance (therapist or admin)
router.get('/therapist/performance/:therapistId', authenticateToken, async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { days = 30 } = req.query;

    // Check permission
    if (
      req.user._id.toString() !== therapistId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        statusCode: 403,
        timestamp: new Date().toISOString()
      });
    }

    const performance = await analyticsService.getTherapistPerformance(
      therapistId,
      parseInt(days)
    );

    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get therapist performance failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user stats (admin only)
router.get('/users/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await analyticsService.getUserStats(startDate);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        ...stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get user stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get appointment stats (admin only)
router.get('/appointments/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await analyticsService.getAppointmentStats(startDate);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        ...stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get appointment stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get payment stats (admin only)
router.get('/payments/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await analyticsService.getPaymentStats(startDate);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        ...stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get payment stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get event stats (admin only)
router.get('/events/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await analyticsService.getEventStats(startDate);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        events: stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get event stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
