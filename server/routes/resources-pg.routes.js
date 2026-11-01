const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Resource } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');
const demoResourceSource = 'SAANS DEMO — fictional sample content';

// Get all resources with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, condition, difficulty, search, limit = 20, offset = 0 } = req.query;

    const where = { status: 'published' };
    if (process.env.ENABLE_DEMO_DATA !== 'true') {
      where[Op.and] = [{
        [Op.or]: [
          { source: { [Op.ne]: demoResourceSource } },
          { source: null },
        ],
      }];
    }

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (condition) {
      where.conditions = { [Op.contains]: [condition] };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
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

    if (!resource || resource.status !== 'published'
      || (process.env.ENABLE_DEMO_DATA !== 'true' && resource.source === demoResourceSource)) {
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
        ...(process.env.ENABLE_DEMO_DATA !== 'true'
          ? {
              [Op.and]: [{
                [Op.or]: [
                  { source: { [Op.ne]: demoResourceSource } },
                  { source: null },
                ],
              }],
            }
          : {}),
        conditions: {
          [Op.contains]: [req.params.condition]
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
