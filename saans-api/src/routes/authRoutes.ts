// @ts-nocheck

import { Router } from 'express';
import authController from '../controllers/authController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import {
  loginLimiter,
  registrationLimiter,
  passwordChangeLimiter,
} from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes with rate limiting (disabled in development)
const useRateLimiting = process.env.NODE_ENV === 'production';
const regLimiter = useRateLimiting ? registrationLimiter : (req: any, res: any, next: any) => next();
const logLimiter = useRateLimiting ? loginLimiter : (req: any, res: any, next: any) => next();

router.post('/register', regLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', logLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Protected routes
router.get('/me', verifyToken, isAuthenticated, (req, res, next) =>
  authController.getCurrentUser(req, res, next),
);

router.put('/profile', verifyToken, isAuthenticated, (req, res, next) =>
  authController.updateProfile(req, res, next),
);

router.post('/change-password', verifyToken, isAuthenticated, passwordChangeLimiter, (req, res, next) =>
  authController.changePassword(req, res, next),
);

export default router;
