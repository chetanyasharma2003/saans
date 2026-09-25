const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');
const CommunityGroup = require('../models/CommunityGroup');
const dataValidator = require('../services/dataPipeline/dataValidator');
const logger = require('../utils/logger');

// ============ POSTS ============

// Get community feed
router.get('/posts/feed', auth, [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('category').optional().isString().trim()
], async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category } = req.query;

    const query = {
      status: 'published',
      isVerified: false
    };

    if (category) query.category = category;

    const posts = await CommunityPost.find(query)
      .populate('userId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: { total, limit, offset }
    });
  } catch (error) {
    next(error);
  }
});

// Create new post
router.post('/posts', auth, [
  body('title').notEmpty().isLength({ min: 5, max: 200 }),
  body('content').notEmpty().isLength({ min: 10, max: 5000 }),
  body('category').notEmpty().isIn([
    'depression', 'anxiety', 'stress', 'relationships', 'work',
    'sleep', 'trauma', 'ptsd', 'grief', 'addiction', 'self-esteem',
    'eating-disorders', 'parenting', 'teen-issues', 'career', 'general'
  ]),
  body('tags').optional().isArray()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    // Validate content
    const validation = dataValidator.validateCommunityPostData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check spam score
    if (validation.spamScore > 0.7) {
      return res.status(400).json({
        success: false,
        error: 'Post detected as spam. Please review and try again.'
      });
    }

    const post = new CommunityPost({
      userId: req.userId,
      title,
      content,
      category,
      tags: tags || [],
      source: 'user',
      status: 'published',
      isVerified: req.user.role === 'admin' || req.user.role === 'therapist',
      createdAt: new Date(),
      engagement: {
        views: 0,
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      }
    });

    await post.save();

    logger.info('Community post created', {
      postId: post._id,
      userId: req.userId,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
});

// Get single post
router.get('/posts/:id', auth, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('userId', 'firstName lastName profileImage')
      .populate('comments.userId', 'firstName lastName profileImage');

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Increment view count
    post.engagement.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// Upvote post
router.post('/posts/:id/upvote', auth, async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'engagement.upvotes': 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post.engagement });
  } catch (error) {
    next(error);
  }
});

// Add comment to post
router.post('/posts/:id/comments', auth, [
  body('text').notEmpty().isLength({ min: 1, max: 500 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { text } = req.body;
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const comment = {
      _id: require('mongoose').Types.ObjectId(),
      userId: req.userId,
      text,
      upvotes: 0,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.engagement.comments += 1;
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

// Delete post (own or admin)
router.delete('/posts/:id', auth, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.userId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    logger.info('Post deleted', { postId: req.params.id, userId: req.userId });

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

// Search posts
router.get('/posts/search', auth, [
  query('q').notEmpty().isString().trim()
], async (req, res, next) => {
  try {
    const { q } = req.query;

    const posts = await CommunityPost.find({
      $text: { $search: q },
      status: 'published'
    })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

// ============ GROUPS ============

// Get all groups
router.get('/groups', auth, [
  query('category').optional().isString().trim()
], async (req, res, next) => {
  try {
    const { category } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;

    const groups = await CommunityGroup.find(query)
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ 'stats.memberCount': -1 })
      .limit(50);

    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
});

// Create group
router.post('/groups', auth, [
  body('name').notEmpty().isLength({ min: 3, max: 100 }),
  body('description').notEmpty().isLength({ min: 10, max: 500 }),
  body('category').notEmpty().isString(),
  body('privacy').optional().isIn(['public', 'private'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, category, privacy = 'public', rules, tags } = req.body;

    const group = new CommunityGroup({
      name,
      description,
      category,
      privacy,
      rules: rules || [],
      tags: tags || [],
      createdBy: req.userId,
      admins: [req.userId],
      members: [
        {
          userId: req.userId,
          role: 'admin',
          joinedAt: new Date()
        }
      ],
      stats: {
        memberCount: 1,
        postCount: 0,
        activeNow: 1
      }
    });

    await group.save();

    logger.info('Community group created', {
      groupId: group._id,
      creatorId: req.userId,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
});

// Join group
router.post('/groups/:id/join', auth, async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Check if already member
    const isMember = group.members.some(m => m.userId.equals(req.userId));
    if (isMember) {
      return res.status(400).json({ success: false, error: 'Already a member' });
    }

    group.members.push({
      userId: req.userId,
      role: 'member',
      joinedAt: new Date()
    });

    group.stats.memberCount = group.members.length;
    await group.save();

    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    next(error);
  }
});

// Leave group
router.post('/groups/:id/leave', auth, async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    group.members = group.members.filter(m => !m.userId.equals(req.userId));
    group.stats.memberCount = group.members.length;
    await group.save();

    logger.info('User left group', { groupId: req.params.id, userId: req.userId });

    res.json({ success: true, message: 'Left group' });
  } catch (error) {
    next(error);
  }
});

// Get group posts
router.get('/groups/:id/posts', auth, [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // In production, would link posts to groups
    // For now, return group info
    const group = await CommunityGroup.findById(req.params.id)
      .populate('members.userId', 'firstName lastName profileImage');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    res.json({
      success: true,
      data: {
        group,
        posts: [],
        pagination: { total: 0, limit, offset }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get group members
router.get('/groups/:id/members', auth, async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id)
      .populate('members.userId', 'firstName lastName profileImage');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    res.json({
      success: true,
      data: group.members
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  const categories = [
    'depression',
    'anxiety',
    'stress',
    'relationships',
    'work',
    'sleep',
    'trauma',
    'ptsd',
    'grief',
    'addiction',
    'self-esteem',
    'eating-disorders',
    'parenting',
    'teen-issues',
    'career',
    'general'
  ];

  res.json({ success: true, data: categories });
});

module.exports = router;
