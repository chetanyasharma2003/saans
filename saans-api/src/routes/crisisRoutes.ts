// @ts-nocheck

import { Router } from 'express';
import crisisController from '../controllers/crisisController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { crisisLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

/**
 * =============== PUBLIC ROUTES ===============
 * No authentication required
 */

/**
 * POST /crisis/detect
 * Analyze message for crisis keywords
 * Body: { message: string }
 * Public endpoint - can be called without authentication
 * Rate limited: 10 requests per minute per IP
 */
router.post('/detect', crisisLimiter, (req, res) => crisisController.detectCrisis(req, res));

/**
 * GET /crisis/hotlines
 * Get emergency hotline numbers for India
 * Query: city (optional)
 * Public endpoint - no authentication needed
 */
router.get('/hotlines', (req, res) => crisisController.getHotlines(req, res));

/**
 * =============== PROTECTED ROUTES ===============
 * Authentication required
 */

/**
 * POST /crisis/alert
 * Manually trigger emergency alert
 * Body: { description: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH' }
 */
router.post(
  '/alert',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.triggerEmergencyAlert(req, res)
);

/**
 * GET /crisis/my-incidents
 * Get user's crisis incident history
 * Query: limit (max 100), offset
 */
router.get(
  '/my-incidents',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.getMyIncidents(req, res)
);

/**
 * PUT /crisis/incident/:id/status
 * Update crisis incident status
 * Body: { status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED_TO_THERAPIST' | 'CLOSED' }
 */
router.put(
  '/incident/:id/status',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.updateIncidentStatus(req, res)
);

/**
 * POST /crisis/incident/:id/escalate
 * Manually escalate incident to therapist
 */
router.post(
  '/incident/:id/escalate',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.escalateIncident(req, res)
);

/**
 * GET /crisis/statistics
 * Get user's crisis statistics
 * Query: days (default 30, max 365)
 */
router.get(
  '/statistics',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.getStatistics(req, res)
);

export default router;
