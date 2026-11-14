const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * ⚠️ STUB: Notifications Routes
 * Status: PostgreSQL migration in progress
 */

const msg = { success: false, error: 'Notifications being migrated', status: 'IN_PROGRESS' };

router.get('/', authenticateToken, (req, res) => res.status(503).json(msg));
router.post('/', authenticateToken, (req, res) => res.status(503).json(msg));
router.put('/:id/read', authenticateToken, (req, res) => res.status(503).json(msg));
router.delete('/:id', authenticateToken, (req, res) => res.status(503).json(msg));

module.exports = router;
