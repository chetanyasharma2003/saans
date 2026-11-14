const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const msg = { success: false, error: 'Community feature being migrated', status: 'IN_PROGRESS' };

router.get('/', (req, res) => res.status(503).json(msg));
router.get('/:id', (req, res) => res.status(503).json(msg));
router.post('/', authenticateToken, (req, res) => res.status(503).json(msg));
router.put('/:id', authenticateToken, (req, res) => res.status(503).json(msg));
router.delete('/:id', authenticateToken, (req, res) => res.status(503).json(msg));

module.exports = router;
