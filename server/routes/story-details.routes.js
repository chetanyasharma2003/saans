const express = require('express');
const router = express.Router();

const msg = { success: false, error: 'Stories being optimized', status: 'IN_PROGRESS' };

router.get('/:storyId', (req, res) => res.status(503).json(msg));
router.post('/:storyId/like', (req, res) => res.status(503).json(msg));
router.get('/:storyId/comments', (req, res) => res.status(503).json(msg));
router.post('/:storyId/comments', (req, res) => res.status(503).json(msg));

module.exports = router;
