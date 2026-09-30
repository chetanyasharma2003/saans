const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Group } = require('../models/index');

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [['memberCount', 'DESC']],
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single group
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    res.status(404).json({ success: false, error: 'Group not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    res.status(201).json({
      success: true,
      message: 'Groups feature coming soon',
      data: {
        _id: 'temp-id',
        name,
        description,
        category,
        memberCount: 1,
        postCount: 0,
        createdAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join group
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Joined group' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
