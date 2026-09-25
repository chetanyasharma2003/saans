const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Story = require('../models/Story');
const User = require('../models/User');
const logger = require('../utils/logger');

// ============ GET STORIES ============

// Get approved stories (public feed)
router.get('/feed', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status: 'approved' };
    if (category) filter.category = category;

    const stories = await Story.find(filter)
      .select('-comments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName avatar');

    const total = await Story.countDocuments(filter);

    res.json({
      success: true,
      data: stories,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    logger.error('Get stories failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'firstName lastName avatar');

    if (!story || story.status !== 'approved') {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ CREATE STORY ============

router.post('/', auth, [
  body('title').isLength({ min: 5, max: 200 }),
  body('content').isLength({ min: 20, max: 5000 }),
  body('category').isIn(['anxiety', 'depression', 'ptsd', 'trauma', 'relationships', 'work', 'grief', 'addiction', 'sleep', 'eating-disorders', 'self-esteem', 'career']),
  body('isAnonymous').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, category, isAnonymous, tags } = req.body;
    const user = await User.findById(req.userId);

    const story = new Story({
      userId: req.userId,
      authorName: isAnonymous ? 'Anonymous' : `${user.firstName} ${user.lastName}`,
      isAnonymous,
      title,
      content,
      category,
      tags: tags || [],
      status: 'pending' // Needs moderation
    });

    await story.save();

    logger.info('Story submitted for review', {
      storyId: story._id,
      userId: req.userId,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Story submitted! Awaiting moderation approval.',
      data: story
    });
  } catch (error) {
    logger.error('Create story failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ENGAGEMENT ============

// Upvote story
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ADMIN: MODERATION ============

// Get pending stories (admin only)
router.get('/admin/pending', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin only' });
    }

    const stories = await Story.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'firstName lastName email');

    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve story
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin only' });
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.userId,
        approvedAt: new Date()
      },
      { new: true }
    );

    logger.info('Story approved', { storyId: req.params.id });
    res.json({ success: true, message: 'Story approved', data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject story
router.post('/:id/reject', auth, [
  body('reason').isLength({ min: 5 })
], async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin only' });
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        moderationNotes: req.body.reason
      },
      { new: true }
    );

    logger.info('Story rejected', { storyId: req.params.id });
    res.json({ success: true, message: 'Story rejected', data: story });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
