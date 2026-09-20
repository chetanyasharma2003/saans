import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import progressTrackingService from '../services/progressTrackingService.js';

const router = Router();

// Get mood trend
router.get('/mood-trend', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const period = (req.query.period as string) || '30days';
    const days = period === '30days' ? 30 : period === '7days' ? 7 : 365;
    const trend = await progressTrackingService.getMoodTrend(userId, days);
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get symptom improvement
router.get('/symptom-improvement', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const improvement = await progressTrackingService.getSymptomImprovement(userId);
    res.json({ success: true, data: improvement });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Add progress metric
router.post('/metric', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const metric = await progressTrackingService.addMetric(userId, req.body.metricName, req.body.value, req.body.notes);
    res.json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get recovery percentage
router.get('/recovery-percentage', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const recovery = await progressTrackingService.getRecoveryPercentage(userId);
    res.json({ success: true, data: recovery });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get milestones
router.get('/milestones', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const milestones = await progressTrackingService.getMilestones(userId);
    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Add milestone
router.post('/milestones/add', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const milestone = await progressTrackingService.addMilestone(userId, req.body.title, req.body.description, req.body.celebrationMessage);
    res.json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
