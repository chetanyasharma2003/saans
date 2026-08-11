// @ts-nocheck

import { Router } from 'express';
import aiController from '../controllers/aiController.js';

const router = Router();

// POST /api/ai/chat - Send message to AI counselor (public endpoint)
router.post('/chat', aiController.chatWithAI);

export default router;
