const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get approved stories (public feed)
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    // For now, return empty stories list
    // TODO: Implement full stories feature with PostgreSQL models
    res.json({
      success: true,
      data: [],
      pagination: { total: 0, page, limit, pages: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single story
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    res.status(404).json({ success: false, error: 'Story not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create story
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, isAnonymous } = req.body;

    // For now, return success but don't actually save
    res.status(201).json({
      success: true,
      message: 'Stories feature coming soon',
      data: {
        _id: 'temp-id',
        title,
        content,
        category,
        authorName: isAnonymous ? 'Anonymous' : 'User',
        createdAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like story
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Like recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as helpful
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
