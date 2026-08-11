// @ts-nocheck

import { Router, Request, Response, NextFunction } from 'express';
import moodController from '../controllers/moodController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * PROTECTED ROUTES - Authentication required
 */

/**
 * POST /moods/track
 * Track a new mood entry
 * Requires authentication
 * Body: {
 *   moodScore: number (1-10),
 *   moodCategory: string (Happy, Calm, Anxious, Sad, Excited),
 *   symptoms?: string[],
 *   triggers?: string[],
 *   notes?: string,
 *   location?: string,
 *   weather?: string
 * }
 */
router.post('/track', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.trackMood(req, res, next)
);

/**
 * GET /moods/my-moods
 * Get user's mood history with pagination
 * Requires authentication
 * Query params: limit (default 30, max 100), skip (default 0)
 */
router.get('/my-moods', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getUserMoods(req, res, next)
);

/**
 * GET /moods/analytics
 * Get mood analytics
 * Requires authentication
 */
router.get('/analytics', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getMoodAnalytics(req, res, next)
);

/**
 * GET /moods/date-range
 * Get moods for a specific date range
 * Requires authentication
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */
router.get('/date-range', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getMoodsByDateRange(req, res, next)
);

/**
 * PUT /moods/:id
 * Update a mood entry
 * Requires authentication
 * Body: {
 *   moodScore?: number,
 *   moodCategory?: string,
 *   symptoms?: string[],
 *   triggers?: string[],
 *   notes?: string,
 *   location?: string,
 *   weather?: string
 * }
 */
router.put('/:id', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.updateMoodEntry(req, res, next)
);

/**
 * DELETE /moods/:id
 * Delete a mood entry
 * Requires authentication
 */
router.delete('/:id', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.deleteMoodEntry(req, res, next)
);

export default router;
