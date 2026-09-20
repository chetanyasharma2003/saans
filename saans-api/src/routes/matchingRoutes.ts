import { Router, Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/matchingService.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/matching/therapists/match:
 *   post:
 *     summary: Find therapist matches
 *     description: Get therapist matches based on user preferences and needs
 *     tags:
 *       - Matching
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               languagesPreferred:
 *                 type: array
 *                 items:
 *                   type: string
 *               availabilityTz:
 *                 type: string
 *               maxRate:
 *                 type: number
 *               minRating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Therapist matches found
 *       400:
 *         description: Invalid preferences
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to find matches
 */
router.post('/therapists/match', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const preferences = req.body;
    const matches = await MatchingService.getMatchingTherapists(userId, preferences);
    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    logger.error('Failed to find therapist matches:', error);
    res.status(500).json({ success: false, error: 'Failed to find matches' });
  }
});

/**
 * @swagger
 * /api/matching/therapists/{therapistId}/match-score:
 *   get:
 *     summary: Get match score details
 *     description: Get detailed match score between user and specific therapist
 *     tags:
 *       - Matching
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: therapistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match score calculated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Failed to calculate score
 */
router.get('/therapists/:therapistId/match-score', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const therapistId = req.params.therapistId;
    const score = await MatchingService.getTherapistMatchScore(userId, therapistId);
    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    logger.error('Failed to calculate match score:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate score' });
  }
});

export default router;
