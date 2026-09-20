import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/analytics/mood/trends:
 *   get:
 *     summary: Get mood trends
 *     description: Get mood trends for specified period (7/30/90 days)
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: ['7', '30', '90']
 *           default: '30'
 *         description: Period in days
 *     responses:
 *       200:
 *         description: Mood trends retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch trends
 */
router.get('/mood/trends', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as string) || '30';
    const trends = await AnalyticsService.getMoodTrends(userId, parseInt(period));
    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('Failed to fetch mood trends:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trends' });
  }
});

/**
 * @swagger
 * /api/analytics/mood/patterns:
 *   get:
 *     summary: Get mood patterns
 *     description: Detect and retrieve mood patterns for user
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Mood patterns retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch patterns
 */
router.get('/mood/patterns', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const patterns = await AnalyticsService.getMoodPatterns(userId);
    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    logger.error('Failed to fetch mood patterns:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patterns' });
  }
});

/**
 * @swagger
 * /api/analytics/mood/insights:
 *   get:
 *     summary: Get mood insights
 *     description: Generate and retrieve AI-powered mood insights
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Mood insights generated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to generate insights
 */
router.get('/mood/insights', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const insights = await AnalyticsService.generateMoodInsights(userId);
    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error('Failed to generate mood insights:', error);
    res.status(500).json({ success: false, error: 'Failed to generate insights' });
  }
});

/**
 * @swagger
 * /api/analytics/mood/export:
 *   post:
 *     summary: Export mood data
 *     description: Export mood data in specified format (pdf/csv/json)
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: ['pdf', 'csv', 'json']
 *                 default: 'pdf'
 *     responses:
 *       200:
 *         description: Data exported successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to export data
 */
router.post('/mood/export', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const format = (req.body.format as 'JSON' | 'CSV') || 'JSON';
    const data = await AnalyticsService.exportMoodData(userId, format);
    res.json({
      success: true,
      data,
      format,
    });
  } catch (error) {
    logger.error('Failed to export mood data:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

export default router;
