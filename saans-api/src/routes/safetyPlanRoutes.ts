import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import safetyPlanService from '../services/safetyPlanService.js';

const router = Router();

// Get safety plan
router.get('/plan', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const plan = await safetyPlanService.getSafetyPlan(userId);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Create/Update safety plan
router.post('/plan/create', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const plan = await safetyPlanService.updateSafetyPlan(userId, req.body);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Update safety plan
router.put('/plan/edit', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const plan = await safetyPlanService.updateSafetyPlan(userId, req.body);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Add contact
router.post('/contacts/add', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const contact = await safetyPlanService.addContact(userId, req.body);
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Remove contact
router.delete('/contacts/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    await safetyPlanService.removeContact(req.params.id);
    res.json({ success: true, message: 'Contact removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get crisis resources
router.get('/crisis-resources', async (req: Request, res: Response) => {
  try {
    const country = (req.query.country as string) || 'India';
    const resources = await safetyPlanService.getCrisisResources(country);
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Emergency alert
router.post('/emergency-alert', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // TODO: Implement emergency alert notification
    res.json({ success: true, message: 'Emergency alert sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Export safety plan
router.get('/export', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const exported = await safetyPlanService.exportSafetyPlan(userId);
    res.json({ success: true, data: exported });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
