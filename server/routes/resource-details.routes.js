const express = require('express');
const router = express.Router();
const MentalHealthResource = require('../models/MentalHealthResource');
const ResourceBookmark = require('../models/ResourceBookmark');
const ResourceReview = require('../models/ResourceReview');
const { authenticateToken } = require('../middleware/auth');

// Get resource detail
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!resource || resource.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Get average rating
    const reviews = await ResourceReview.find({
      resourceId: req.params.id,
      status: 'published'
    });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        ...resource.toObject(),
        averageRating: avgRating,
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get resource reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await ResourceReview.find({
      resourceId: req.params.id,
      status: 'published'
    })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ helpful: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await ResourceReview.countDocuments({
      resourceId: req.params.id,
      status: 'published'
    });

    res.json({
      success: true,
      data: reviews,
      total,
      hasMore: offset + reviews.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Add review
router.post('/:id/reviews', authenticateToken, async (req, res, next) => {
  try {
    const { rating, title, content } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid rating' });
    }

    const resource = await MentalHealthResource.findById(req.params.id);
    if (!resource || resource.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Check if user already reviewed
    const existingReview = await ResourceReview.findOne({
      resourceId: req.params.id,
      userId: req.userId
    });

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You already reviewed this resource' });
    }

    const review = new ResourceReview({
      resourceId: req.params.id,
      userId: req.userId,
      rating,
      title: title?.trim(),
      content: content?.trim()
    });

    await review.save();
    await review.populate('userId', 'firstName lastName profileImage');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// Mark review helpful
router.post('/:id/reviews/:reviewId/helpful', authenticateToken, async (req, res, next) => {
  try {
    const review = await ResourceReview.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// Get user's bookmarks
router.get('/user/bookmarks', authenticateToken, async (req, res, next) => {
  try {
    const bookmarks = await ResourceBookmark.find({ userId: req.userId })
      .populate('resourceId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookmarks.map(b => b.resourceId),
      count: bookmarks.length
    });
  } catch (error) {
    next(error);
  }
});

// Add bookmark
router.post('/:id/bookmark', authenticateToken, async (req, res, next) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Check if already bookmarked
    const existing = await ResourceBookmark.findOne({
      userId: req.userId,
      resourceId: req.params.id
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already bookmarked' });
    }

    const bookmark = new ResourceBookmark({
      userId: req.userId,
      resourceId: req.params.id
    });

    await bookmark.save();
    res.status(201).json({ success: true, message: 'Bookmarked' });
  } catch (error) {
    next(error);
  }
});

// Remove bookmark
router.delete('/:id/bookmark', authenticateToken, async (req, res, next) => {
  try {
    const result = await ResourceBookmark.findOneAndDelete({
      userId: req.userId,
      resourceId: req.params.id
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
});

// Check if bookmarked
router.get('/:id/is-bookmarked', authenticateToken, async (req, res, next) => {
  try {
    const bookmark = await ResourceBookmark.findOne({
      userId: req.userId,
      resourceId: req.params.id
    });

    res.json({ success: true, isBookmarked: !!bookmark });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
