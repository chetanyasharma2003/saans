import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import wellnessResourcesService from '../services/wellnessResourcesService.js';

const router = Router();

// Get meditations
router.get('/meditations', async (req: Request, res: Response) => {
  try {
    const category = req.query.condition as string;
    const meditations = await wellnessResourcesService.getMeditations(category);
    res.json({ success: true, data: meditations });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get exercises
router.get('/exercises', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const exercises = await wellnessResourcesService.getExercises(category);
    res.json({ success: true, data: exercises });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get articles
router.get('/articles', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const articles = await wellnessResourcesService.getArticles(category);
    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get podcasts
router.get('/podcasts', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const podcasts = await wellnessResourcesService.getPodcasts(category);
    res.json({ success: true, data: podcasts });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get books
router.get('/books', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const books = await wellnessResourcesService.getBooks(category);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Search resources
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query required' });
    }
    const results = await wellnessResourcesService.searchResources(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const resources = await wellnessResourcesService.getResourcesByCategory(req.params.category);
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Bookmark resource (authenticated)
router.post('/:id/bookmark', verifyToken, async (req: Request, res: Response) => {
  try {
    // TODO: Implement bookmarking
    res.json({ success: true, message: 'Resource bookmarked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get bookmarked resources
router.get('/my-resources', verifyToken, async (req: Request, res: Response) => {
  try {
    // TODO: Implement getting bookmarked resources
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
