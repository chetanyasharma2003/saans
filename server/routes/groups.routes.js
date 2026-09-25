const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const CommunityGroup = require('../models/CommunityGroup');
const logger = require('../utils/logger');

// Helper to create slug
const createSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

// ============ GET GROUPS ============

// Get all groups
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'memberCount' } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const sortObj = sort === 'newest' ? { createdAt: -1 } : { memberCount: -1 };

    const groups = await CommunityGroup.find(filter)
      .sort(sortObj)
      .select('name slug description icon color category memberCount postCount');

    res.json({ success: true, data: groups });
  } catch (error) {
    logger.error('Get groups failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single group
router.get('/:slug', async (req, res) => {
  try {
    const group = await CommunityGroup.findOne({ slug: req.params.slug })
      .populate('createdBy', 'firstName lastName avatar')
      .populate('moderators', 'firstName lastName avatar')
      .select('-members'); // Don't return all members list

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ CREATE GROUP ============

router.post('/', auth, [
  body('name').isLength({ min: 3, max: 50 }),
  body('description').isLength({ min: 10, max: 500 }),
  body('category').isIn(['anxiety', 'depression', 'ptsd', 'trauma', 'relationships', 'work', 'grief', 'addiction', 'sleep', 'eating-disorders', 'self-esteem', 'career']),
  body('icon').optional().isLength({ max: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, category, icon, color, guidelines, rules } = req.body;
    const slug = createSlug(name);

    // Check if slug already exists
    const existing = await CommunityGroup.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Group name already taken' });
    }

    const group = new CommunityGroup({
      name,
      slug,
      description,
      category,
      icon: icon || '💬',
      color: color || '#9333ea',
      guidelines,
      rules: rules || [],
      createdBy: req.userId,
      members: [req.userId],
      memberCount: 1
    });

    await group.save();

    logger.info('Community group created', {
      groupId: group._id,
      userId: req.userId,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully!',
      data: group
    });
  } catch (error) {
    logger.error('Create group failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GROUP MEMBERSHIP ============

// Join group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    if (group.members.includes(req.userId)) {
      return res.status(400).json({ success: false, error: 'Already a member' });
    }

    group.members.push(req.userId);
    group.memberCount = group.members.length;
    await group.save();

    logger.info('User joined group', {
      groupId: group._id,
      userId: req.userId
    });

    res.json({ success: true, message: 'Joined group!', data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await CommunityGroup.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { members: req.userId },
        $inc: { memberCount: -1 }
      },
      { new: true }
    );

    logger.info('User left group', {
      groupId: req.params.id,
      userId: req.userId
    });

    res.json({ success: true, message: 'Left group' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get group members
router.get('/:id/members', async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id)
      .populate('members', 'firstName lastName avatar');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    res.json({ success: true, data: group.members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
