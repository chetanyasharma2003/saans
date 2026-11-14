const express = require('express');
const router = express.Router();

const msg = { success: false, error: 'Resources being optimized', status: 'IN_PROGRESS' };

router.get('/:resourceId', (req, res) => res.status(503).json(msg));
router.post('/:resourceId/review', (req, res) => res.status(503).json(msg));
router.post('/:resourceId/bookmark', (req, res) => res.status(503).json(msg));

module.exports = router;
