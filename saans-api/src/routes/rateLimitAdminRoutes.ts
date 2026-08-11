// @ts-nocheck

import { Router } from 'express';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import rateLimitAdminController from '../controllers/rateLimitAdminController.js';

const router = Router();

/**
 * All rate limit admin endpoints require authentication and admin role
 */

// Apply auth middleware to all routes
router.use(verifyToken, checkRole('admin'));

// ==================== DASHBOARD & REPORTING ====================

/**
 * GET /admin/rate-limits/dashboard
 * Get rate limit dashboard summary
 */
router.get('/dashboard', (req, res) => rateLimitAdminController.getDashboard(req, res));

/**
 * GET /admin/rate-limits/report
 * Get detailed rate limit report (plain text)
 */
router.get('/report', (req, res) => rateLimitAdminController.getReport(req, res));

/**
 * GET /admin/rate-limits/configs
 * Get all rate limit configurations
 */
router.get('/configs', (req, res) => rateLimitAdminController.getConfigs(req, res));

// ==================== STATUS & MONITORING ====================

/**
 * GET /admin/rate-limits/limited-clients
 * Get all currently rate-limited clients
 */
router.get('/limited-clients', (req, res) =>
  rateLimitAdminController.getLimitedClients(req, res)
);

/**
 * GET /admin/rate-limits/status/:key
 * Get status for a specific rate limit key
 * Query params:
 *   - type: string (default: 'standard')
 *   - limit: number (default: 100)
 */
router.get('/status/:key', (req, res) => rateLimitAdminController.getStatus(req, res));

/**
 * GET /admin/rate-limits/search
 * Search for rate limit keys matching a pattern
 * Query params:
 *   - pattern: string (required) - e.g., "login:*" or "192.168.*"
 *   - type: string (default: 'standard')
 */
router.get('/search', (req, res) => rateLimitAdminController.searchKeys(req, res));

/**
 * GET /admin/rate-limits/stats
 * Get statistics by type
 * Query params:
 *   - type: string (default: 'standard')
 */
router.get('/stats', (req, res) => rateLimitAdminController.getStats(req, res));

/**
 * GET /admin/rate-limits/whitelist
 * Get all whitelisted keys
 */
router.get('/whitelist', (req, res) => rateLimitAdminController.getWhitelist(req, res));

// ==================== MANAGEMENT ====================

/**
 * POST /admin/rate-limits/:key/reset
 * Reset rate limit for a specific key
 * Query params:
 *   - type: string (default: 'standard')
 */
router.post('/:key/reset', (req, res) => rateLimitAdminController.resetKey(req, res));

/**
 * POST /admin/rate-limits/reset-many
 * Reset rate limits for multiple keys
 * Body: { keys: string[] }
 * Query params:
 *   - type: string (default: 'standard')
 */
router.post('/reset-many', (req, res) => rateLimitAdminController.resetMany(req, res));

/**
 * POST /admin/rate-limits/:key/whitelist
 * Add key to whitelist
 * Body: { expiryHours?: number } (default: 1)
 */
router.post('/:key/whitelist', (req, res) =>
  rateLimitAdminController.whitelistKey(req, res)
);

/**
 * DELETE /admin/rate-limits/:key/whitelist
 * Remove key from whitelist
 */
router.delete('/:key/whitelist', (req, res) =>
  rateLimitAdminController.removeFromWhitelist(req, res)
);

export default router;
