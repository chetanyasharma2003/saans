const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * ⚠️ STUB: Group Posts Routes
 *
 * These routes still use MongoDB syntax and need Sequelize migration.
 * This is a stub implementation that returns helpful error messages.
 *
 * Status: PostgreSQL migration in progress
 * Priority: Medium (not used by current frontend)
 * Estimated fix time: 2-3 hours (80 lines per route)
 */

const notImplementedMessage = {
  success: false,
  error: 'Group Posts feature is being migrated to PostgreSQL',
  status: 'IN_PROGRESS',
  details: 'This feature will be available in the next update',
  alternative: 'Please use /api/groups endpoint for community features',
  eta: '2-3 days'
};

// Get group posts
router.get('/group/:groupId', async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Get single post detail
router.get('/:id', async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Create post in group
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Get post comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Upvote post
router.post('/:id/upvote', authenticateToken, async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    res.status(503).json(notImplementedMessage);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
