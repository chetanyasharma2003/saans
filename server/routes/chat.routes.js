const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * ⚠️ STUB: Chat Routes
 * Status: PostgreSQL migration in progress
 * ETA: 2-3 days
 */

const msg = { success: false, error: 'Chat feature being migrated', status: 'IN_PROGRESS' };

router.get('/', authenticateToken, (req, res) => res.status(503).json(msg));
router.post('/', authenticateToken, (req, res) => res.status(503).json(msg));
router.get('/:chatId', authenticateToken, (req, res) => res.status(503).json(msg));
router.post('/:chatId/messages', authenticateToken, (req, res) => res.status(503).json(msg));
router.put('/:messageId', authenticateToken, (req, res) => res.status(503).json(msg));
router.delete('/:messageId', authenticateToken, (req, res) => res.status(503).json(msg));

module.exports = router;
