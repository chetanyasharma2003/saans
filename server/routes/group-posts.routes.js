const express = require('express');
const router = express.Router();
const GroupPost = require('../models/GroupPost');
const GroupPostComment = require('../models/GroupPostComment');
const CommunityGroup = require('../models/CommunityGroup');
const { authenticateToken } = require('../middleware/auth');

// Get group posts
router.get('/group/:groupId', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const posts = await GroupPost.find({
      groupId: req.params.groupId,
      status: 'published'
    })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await GroupPost.countDocuments({
      groupId: req.params.groupId,
      status: 'published'
    });

    res.json({
      success: true,
      data: posts,
      total,
      hasMore: offset + posts.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Get single post detail
router.get('/:id', async (req, res, next) => {
  try {
    const post = await GroupPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'firstName lastName profileImage');

    if (!post || post.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// Create post in group
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { groupId, title, content, category, tags } = req.body;

    if (!groupId || !title || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const group = await CommunityGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const post = new GroupPost({
      groupId,
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags || []
    });

    await post.save();
    await post.populate('userId', 'firstName lastName profileImage');

    // Update group post count
    await CommunityGroup.findByIdAndUpdate(groupId, { $inc: { postCount: 1 } });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// Get post comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const comments = await GroupPostComment.find({
      postId: req.params.id,
      status: 'published'
    })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await GroupPostComment.countDocuments({
      postId: req.params.id,
      status: 'published'
    });

    res.json({
      success: true,
      data: comments,
      total,
      hasMore: offset + comments.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Comment too short' });
    }

    const post = await GroupPost.findById(req.params.id);
    if (!post || post.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const comment = new GroupPostComment({
      postId: req.params.id,
      userId: req.userId,
      content: content.trim()
    });

    await comment.save();
    await comment.populate('userId', 'firstName lastName profileImage');

    // Update post comment count
    await GroupPost.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// Upvote post
router.post('/:id/upvote', authenticateToken, async (req, res, next) => {
  try {
    const post = await GroupPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// Delete post (own posts only)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const post = await GroupPost.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { status: 'deleted' },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
