import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get available plans
 *     description: Get list of all available subscription plans
 *     tags:
 *       - Subscriptions
 *     responses:
 *       200:
 *         description: Subscription plans retrieved
 *       500:
 *         description: Failed to fetch plans
 */
router.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await SubscriptionService.getAvailablePlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Failed to fetch subscription plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

/**
 * @swagger
 * /api/subscriptions/upgrade:
 *   post:
 *     summary: Upgrade subscription
 *     description: Upgrade user to a different subscription plan
 *     tags:
 *       - Subscriptions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID of the plan to upgrade to
 *     responses:
 *       200:
 *         description: Subscription upgraded
 *       400:
 *         description: Invalid plan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to upgrade subscription
 */
router.post('/upgrade', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const planId = req.body.planId;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    const subscription = await SubscriptionService.upgradeSubscription(userId, planId);
    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    logger.error('Failed to upgrade subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade subscription' });
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}/pause:
 *   put:
 *     summary: Pause subscription
 *     description: Temporarily pause user's active subscription
 *     tags:
 *       - Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               durationDays:
 *                 type: number
 *                 default: 30
 *     responses:
 *       200:
 *         description: Subscription paused
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Failed to pause subscription
 */
router.put('/:id/pause', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const durationDays = req.body.durationDays || 30;
    const result = await SubscriptionService.pauseSubscription(userId, durationDays);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to pause subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to pause subscription' });
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     summary: Cancel subscription
 *     description: Cancel user's active subscription
 *     tags:
 *       - Subscriptions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Failed to cancel subscription
 */
router.delete('/:id', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const result = await SubscriptionService.cancelSubscription(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
  }
});

/**
 * @swagger
 * /api/subscriptions/current:
 *   get:
 *     summary: Get current subscription
 *     description: Get currently active subscription for user
 *     tags:
 *       - Subscriptions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription
 *       500:
 *         description: Failed to fetch subscription
 */
router.get('/current', verifyToken, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const subscription = await SubscriptionService.getUserSubscription(userId);
    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    logger.error('Failed to fetch current subscription:', error);
    res.status(404).json({ success: false, error: 'No active subscription' });
  }
});

export default router;
