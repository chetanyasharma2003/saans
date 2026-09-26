const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const StoryComment = require('../models/StoryComment');
const { authenticateToken } = require('../middleware/auth');

// Get story detail
router.get('/:id', async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'firstName lastName profileImage');

    if (!story || story.status !== 'approved') {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
});

// Get story comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const comments = await StoryComment.find({
      storyId: req.params.id,
      status: 'published'
    })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await StoryComment.countDocuments({
      storyId: req.params.id,
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

// Create comment on story
router.post('/:id/comments', authenticateToken, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Comment too short' });
    }

    const story = await Story.findById(req.params.id);
    if (!story || story.status !== 'approved') {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    const comment = new StoryComment({
      storyId: req.params.id,
      userId: req.userId,
      content: content.trim()
    });

    await comment.save();
    await comment.populate('userId', 'firstName lastName profileImage');

    // Update story comment count
    await Story.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// Like comment
router.post('/:id/comments/:commentId/like', authenticateToken, async (req, res, next) => {
  try {
    const comment = await StoryComment.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// Mark comment helpful
router.post('/:id/comments/:commentId/helpful', authenticateToken, async (req, res, next) => {
  try {
    const comment = await StoryComment.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// Delete comment (own comments only)
router.delete('/:id/comments/:commentId', authenticateToken, async (req, res, next) => {
  try {
    const comment = await StoryComment.findOneAndUpdate(
      {
        _id: req.params.commentId,
        userId: req.userId
      },
      { status: 'deleted' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
