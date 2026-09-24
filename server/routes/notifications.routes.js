const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Notification Routes - User Notifications Management
 */

// Get all notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let filter = { userId: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total,
        unreadCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get notifications failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get single notification
router.get('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: notification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get notification failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Notification marked as read', {
      userId: req.user._id,
      notificationId
    });

    res.json({
      success: true,
      data: notification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark notification as read failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    logger.info('All notifications marked as read', {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark all as read failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    logger.info('Notification deleted', {
      userId: req.user._id,
      notificationId
    });

    res.json({
      success: true,
      message: 'Notification deleted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Delete notification failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Clear all notifications
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    logger.info('All notifications cleared', {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'All notifications cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Clear notifications failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get unread count
router.get('/stats/unread', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    const byType = await Notification.aggregate([
      { $match: { userId: req.user._id, isRead: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total: unreadCount,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get unread stats failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
