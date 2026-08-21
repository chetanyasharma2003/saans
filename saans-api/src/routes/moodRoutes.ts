// @ts-nocheck

import { Router, Request, Response, NextFunction } from 'express';
import moodController from '../controllers/moodController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/moods/track:
 *   post:
 *     summary: Track a mood entry
 *     description: Create a new mood tracking entry with score, category, and optional details
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrackMoodRequest'
 *     responses:
 *       201:
 *         description: Mood entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Mood'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 */
router.post('/track', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.trackMood(req, res, next)
);

/**
 * @swagger
 * /api/moods/my-moods:
 *   get:
 *     summary: Get user's mood history
 *     description: Retrieve paginated list of user's mood entries
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 30
 *           maximum: 100
 *       - name: skip
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Mood history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mood'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-moods', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getUserMoods(req, res, next)
);

/**
 * @swagger
 * /api/moods/analytics:
 *   get:
 *     summary: Get mood analytics
 *     description: Get mood statistics including averages, distributions, triggers, and symptoms
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Analytics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MoodAnalytics'
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getMoodAnalytics(req, res, next)
);

/**
 * @swagger
 * /api/moods/date-range:
 *   get:
 *     summary: Get moods for date range
 *     description: Get mood entries for a specific date range
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - name: endDate
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Mood entries retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mood'
 */
router.get('/date-range', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.getMoodsByDateRange(req, res, next)
);

/**
 * @swagger
 * /api/moods/{id}:
 *   put:
 *     summary: Update mood entry
 *     description: Update a previously recorded mood entry
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moodScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               moodCategory:
 *                 type: string
 *                 enum: [Happy, Calm, Anxious, Sad, Excited, Angry, Neutral]
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               triggers:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               location:
 *                 type: string
 *               weather:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mood entry updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Mood'
 *       404:
 *         description: Mood entry not found
 */
router.put('/:id', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.updateMoodEntry(req, res, next)
);

/**
 * @swagger
 * /api/moods/{id}:
 *   delete:
 *     summary: Delete mood entry
 *     description: Delete a mood entry
 *     tags:
 *       - Mood Tracking
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mood entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Mood entry not found
 */
router.delete('/:id', verifyToken, isAuthenticated, (req: Request, res: Response, next: NextFunction) =>
  moodController.deleteMoodEntry(req, res, next)
);

export default router;
