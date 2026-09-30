const express = require('express');
const router = express.Router();
const { Resource } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

// Get all resources with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, condition, difficulty, search, limit = 20, offset = 0 } = req.query;

    const where = { status: 'published' };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (condition) {
      where.conditions = require('sequelize').sequelize.where(
        require('sequelize').sequelize.fn('jsonb_contains', require('sequelize').sequelize.col('conditions'), require('sequelize').sequelize.literal(`'"${condition}"'`)),
        true
      );
    }

    if (search) {
      where[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Resource.findAndCountAll({
      where,
      order: [['rating', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get resource by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);

    if (!resource || resource.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Increment view count
    await resource.increment('viewCount');

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get resources by condition
router.get('/condition/:condition', authenticateToken, async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: {
        status: 'published',
        conditions: {
          [require('sequelize').Op.contains]: [req.params.condition]
        }
      },
      order: [['rating', 'DESC']],
      limit: 20,
    });

    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark resource as helpful
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    await resource.increment('helpfulCount');

    res.json({ success: true, message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
