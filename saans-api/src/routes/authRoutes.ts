// @ts-nocheck

import { Router } from 'express';
import authController from '../controllers/authController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import {
  loginLimiter,
  registrationLimiter,
  passwordChangeLimiter,
  twoFactorLimiter,
  twoFactorSetupLimiter,
} from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes with rate limiting (disabled in development)
const useRateLimiting = process.env.NODE_ENV === 'production';
const regLimiter = useRateLimiting ? registrationLimiter : (req: any, res: any, next: any) => next();
const logLimiter = useRateLimiting ? loginLimiter : (req: any, res: any, next: any) => next();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with email and password. Email verification required.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: user@example.com
 *             password: SecurePass123!
 *             confirmPassword: SecurePass123!
 *             name: John Doe
 *             city: Mumbai
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', regLimiter, (req, res, next) => authController.register(req, res, next));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to account
 *     description: Authenticate user with email and password. Returns access token and refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: user@example.com
 *             password: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=...; HttpOnly; Secure; SameSite=Strict
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', logLimiter, (req, res, next) => authController.login(req, res, next));
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token. Refresh token sent as HttpOnly cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: End user session and invalidate tokens
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset link to user email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset email sent successfully
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       429:
 *         description: Too many reset requests
 */
router.post('/forgot-password', logLimiter, (req, res, next) => authController.forgotPassword(req, res, next));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Reset password using token from email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', logLimiter, (req, res, next) => authController.resetPassword(req, res, next));

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Send verification email again to unverified account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/resend-verification', regLimiter, (req, res, next) => authController.resendVerificationEmail(req, res, next));

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email address
 *     description: Activate email using verification token from email link
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/me', verifyToken, isAuthenticated, (req, res, next) =>
  authController.getCurrentUser(req, res, next),
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user's profile information (name, city, phone, etc.)
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.put('/profile', verifyToken, isAuthenticated, (req, res, next) =>
  authController.updateProfile(req, res, next),
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change password for authenticated user. Requires current password.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/change-password', verifyToken, isAuthenticated, passwordChangeLimiter, (req, res, next) =>
  authController.changePassword(req, res, next),
);

// ==================== TWO-FACTOR AUTHENTICATION ROUTES ====================

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   get:
 *     summary: Setup two-factor authentication
 *     description: Generate QR code and secret for 2FA setup. User must scan QR code with authenticator app.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TwoFASetupResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/2fa/setup', verifyToken, isAuthenticated, twoFactorSetupLimiter, (req, res, next) =>
  authController.setup2FA(req, res, next),
);

/**
 * @swagger
 * /api/auth/2fa/verify-setup:
 *   post:
 *     summary: Verify and enable two-factor authentication
 *     description: Complete 2FA setup by verifying code from authenticator app
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TwoFAVerifySetupRequest'
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid token
 */
router.post('/2fa/verify-setup', verifyToken, isAuthenticated, twoFactorSetupLimiter, (req, res, next) =>
  authController.verifySetup2FA(req, res, next),
);

/**
 * @swagger
 * /api/auth/2fa/verify-login:
 *   post:
 *     summary: Verify 2FA code during login
 *     description: Submit authenticator code or backup code after 2FA-enabled login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionToken:
 *                 type: string
 *                 description: Temporary session token from login
 *               token:
 *                 type: string
 *                 description: 6-digit authenticator code or backup code
 *               isBackupCode:
 *                 type: boolean
 *                 description: Whether using backup code
 *             required:
 *               - sessionToken
 *               - token
 *     responses:
 *       200:
 *         description: 2FA verified, access token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired token
 */
router.post('/2fa/verify-login', twoFactorLimiter, (req, res, next) =>
  authController.verifyLogin2FA(req, res, next),
);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable two-factor authentication
 *     description: Turn off 2FA for authenticated user. Requires password confirmation.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid password
 */
router.post('/2fa/disable', verifyToken, isAuthenticated, (req, res, next) =>
  authController.disable2FA(req, res, next),
);

/**
 * @swagger
 * /api/auth/2fa/status:
 *   get:
 *     summary: Get two-factor authentication status
 *     description: Check if 2FA is enabled and backup codes remaining
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TwoFAStatusResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/2fa/status', verifyToken, isAuthenticated, (req, res, next) =>
  authController.get2FAStatus(req, res, next),
);

/**
 * @swagger
 * /api/auth/2fa/regenerate-backup-codes:
 *   post:
 *     summary: Regenerate 2FA backup codes
 *     description: Generate new backup codes to replace existing ones. Password confirmation required.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: New backup codes generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid password
 */
router.post('/2fa/regenerate-backup-codes', verifyToken, isAuthenticated, (req, res, next) =>
  authController.regenerateBackupCodes(req, res, next),
);

export default router;
