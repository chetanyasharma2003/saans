// @ts-nocheck

import { Router } from 'express';
import aiController from '../controllers/aiController.js';

const router = Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI counselor
 *     description: Send a message to the AI counselor for mental health support and guidance. Public endpoint.
 *     tags:
 *       - AI Counselor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: AI counselor response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: AI service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/chat', aiController.chatWithAI);

export default router;
