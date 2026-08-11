// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Demo responses for testing (when API key not configured)
const DEMO_RESPONSES: { [key: string]: string } = {
  suicidal: "I hear you, and I'm truly concerned about what you're experiencing. These feelings are real and serious, but there is help available. Please reach out to:\n\n🆘 National Suicide Prevention Lifeline: 988\n💬 Crisis Text Line: Text HOME to 741741\n🏥 Go to nearest emergency room\n\nYour life has value. Talk to someone today. Would you like to discuss what's leading to these feelings?",
  anxious: "Anxiety is a common human experience, and I'm glad you're sharing this. Let's work through it together. Some immediate help:\n\n📌 Try the 4-7-8 breathing technique\n📌 Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste\n📌 Move your body - even a short walk helps\n\nWhat's triggering your anxiety right now? I'm here to listen.",
  sad: "It's okay to feel sad. Sometimes sadness tells us something important about ourselves or our lives. I'm here to listen and support you.\n\nShare more about what's making you feel this way. Are there specific events or thoughts contributing to your sadness? Remember, reaching out like this is a sign of strength.",
  stressed: "Stress can feel overwhelming, but you're not alone. Let's break this down:\n\n💪 Identify what's in your control vs. what isn't\n⏰ Take things one small step at a time\n🧘 Practice self-care and rest\n\nWhat's causing you the most stress right now? Let's talk about it.",
  default: "I'm listening to you, and I want to understand what you're going through. Your feelings matter. Can you tell me more about what's on your mind? I'm here to support you with genuine care and understanding.",
};

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string;
  const userId = (req as any).userId;

  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Message is required',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Message must be a non-empty string',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
    }

    logger.debug('AI chat request', { messageLength: message.length }, userId, requestId);

    // Check if API key is valid (not placeholder)
    const isValidApiKey = GROQ_API_KEY && !GROQ_API_KEY.includes('YOUR_FREE_KEY');

    if (!isValidApiKey) {
      // DEMO MODE - Use intelligent responses based on keywords
      logger.warn('Using DEMO MODE - no valid Groq API key configured', undefined, undefined, requestId);

      const messageLower = message.toLowerCase();
      let demoResponse = DEMO_RESPONSES.default;

      if (messageLower.includes('suicidal') || messageLower.includes('die') || messageLower.includes('kill')) {
        demoResponse = DEMO_RESPONSES.suicidal;
      } else if (messageLower.includes('anxious') || messageLower.includes('anxiety') || messageLower.includes('panic')) {
        demoResponse = DEMO_RESPONSES.anxious;
      } else if (messageLower.includes('sad') || messageLower.includes('depression') || messageLower.includes('depressed')) {
        demoResponse = DEMO_RESPONSES.sad;
      } else if (messageLower.includes('stress') || messageLower.includes('stressed') || messageLower.includes('overwhelm')) {
        demoResponse = DEMO_RESPONSES.stressed;
      }

      logger.info('AI chat completed (demo mode)', { mode: 'DEMO' }, userId, requestId);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: demoResponse,
        timestamp: new Date().toISOString(),
        mode: 'DEMO',
      });
    }

    // Build messages array with conversation history
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      {
        role: 'system',
        content: `You are SAANS, a compassionate and professional mental health counselor AI. Your role is to:
1. Listen empathetically to users' concerns and feelings
2. Provide genuine emotional support and validation
3. Offer practical coping strategies when appropriate
4. Ask thoughtful follow-up questions to understand better
5. Suggest professional help when needed for serious issues
6. Be honest about your limitations as an AI

Always respond with warmth, understanding, and professionalism. Take the user's concerns seriously, especially if they mention suicidal thoughts or serious mental health crises - in those cases, strongly encourage seeking immediate professional help and provide crisis resources.`,
      },
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        if (msg.sender && msg.text) {
          messages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    try {
      // Call Groq API (OpenAI-compatible)
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Extract the response text
      const aiMessage = response.data?.choices?.[0]?.message?.content;

      if (!aiMessage) {
        throw new Error('No response from AI service');
      }

      logger.info('AI chat completed (real AI)', { mode: 'REAL_AI' }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: aiMessage,
        timestamp: new Date().toISOString(),
        mode: 'REAL_AI',
      });
    } catch (apiError: any) {
      // Log API error but don't expose details
      logger.warn(
        'External API error during AI chat',
        { apiStatus: apiError.response?.status },
        userId,
        requestId
      );

      // Fallback to demo mode on API errors
      const messageLower = message.toLowerCase();
      let demoResponse = DEMO_RESPONSES.default;

      if (messageLower.includes('suicidal') || messageLower.includes('die') || messageLower.includes('kill')) {
        demoResponse = DEMO_RESPONSES.suicidal;
      } else if (messageLower.includes('anxious') || messageLower.includes('anxiety')) {
        demoResponse = DEMO_RESPONSES.anxious;
      } else if (messageLower.includes('sad') || messageLower.includes('depression')) {
        demoResponse = DEMO_RESPONSES.sad;
      } else if (messageLower.includes('stress') || messageLower.includes('stressed')) {
        demoResponse = DEMO_RESPONSES.stressed;
      }

      logger.info('AI chat completed (demo fallback)', { mode: 'DEMO_FALLBACK' }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: demoResponse,
        timestamp: new Date().toISOString(),
        mode: 'DEMO_FALLBACK',
      });
    }
  } catch (error: any) {
    if (error instanceof ApiError) {
      logger.warn(`AI chat failed: ${error.message}`, undefined, userId, requestId);
      return next(error);
    }

    logger.error('AI chat error', error, undefined, userId, requestId);
    next(
      new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_SERVER_ERROR,
        false,
        ErrorCodes.INTERNAL_ERROR
      )
    );
  }
};

export default { chatWithAI };
