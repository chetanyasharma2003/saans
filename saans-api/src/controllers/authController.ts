// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService.js';
import twoFactorService from '../services/twoFactorService.js';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { email, password, name, role, city } = req.body;

      logger.debug('Register attempt', { email: email || 'unknown' }, undefined, requestId);

      // Validate required fields
      if (!email || !password || !name) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['email', 'password', 'name'] }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_EMAIL,
          true,
          ErrorCodes.INVALID_EMAIL
        );
      }

      // Validate password length
      if (password.length < 6) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Password must be at least 6 characters long',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await authService.register({
        email,
        password,
        name,
        role: role || 'PATIENT',
        city,
      });

      // Send verification email after registration
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      try {
        await authService.sendEmailVerification(email, frontendUrl);
      } catch (error) {
        logger.warn('Failed to send verification email during registration', error);
        // Don't fail registration if email fails
      }

      logger.info('User registered successfully', { email }, undefined, requestId);
      res.status(HttpStatus.CREATED).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Register failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message?.includes('already exists')) {
        const apiError = new ApiError(
          HttpStatus.CONFLICT,
          ErrorMessages.DUPLICATE_EMAIL,
          true,
          ErrorCodes.RESOURCE_EXISTS
        );
        logger.warn(`Register failed: Duplicate email`, undefined, undefined, requestId);
        return next(apiError);
      }

      const apiError = new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorMessages.BAD_REQUEST,
        true,
        ErrorCodes.VALIDATION_FAILED
      );
      logger.error('Register error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * POST /api/auth/login
   * User login (with 2FA support)
   */
  async login(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { email, password } = req.body;

      logger.debug('Login attempt', { email: email || 'unknown' }, undefined, requestId);

      if (!email || !password) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.AUTH_MISSING_CREDENTIALS,
          { required: ['email', 'password'] }
        );
      }

      const result = await authService.login({ email, password });

      // Check if user has 2FA enabled
      if (result.user.twoFactorEnabled) {
        // Create temporary 2FA session
        const session = await twoFactorService.createSessionToken(result.user.id);

        logger.info('2FA required for login', { email }, undefined, requestId);
        return res.status(HttpStatus.OK).json({
          requiresTwoFactor: true,
          sessionToken: session.sessionToken,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
        });
      }

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('User logged in successfully', { email }, undefined, requestId);
      res.status(HttpStatus.OK).json({
        requiresTwoFactor: false,
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Login failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.UNAUTHORIZED,
        ErrorMessages.INVALID_CREDENTIALS,
        true,
        ErrorCodes.AUTH_INVALID_CREDENTIALS
      );
      logger.warn(`Login failed: Invalid credentials`, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * POST /api/auth/refresh-token
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-index'] as string;
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'Refresh token is required',
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const result = await authService.refreshAccessToken(refreshToken);

      logger.info('Token refreshed successfully', undefined, undefined, requestId);
      res.status(HttpStatus.OK).json({
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.UNAUTHORIZED,
        ErrorMessages.TOKEN_EXPIRED,
        true,
        ErrorCodes.AUTH_TOKEN_EXPIRED
      );
      logger.warn(`Token refresh failed`, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.USER_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
      }

      res.status(HttpStatus.OK).json(user);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('Get current user error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * PUT /api/auth/profile
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { name, bio, phoneNumber } = req.body;

      // Validate input
      if (name && typeof name !== 'string') {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Name must be a string',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const user = await authService.updateProfile(userId, {
        name,
        bio,
        phoneNumber,
      });

      logger.info('User profile updated', { userId }, userId, requestId);
      res.status(HttpStatus.OK).json(user);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('Update profile error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/change-password
   * Change user password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['oldPassword', 'newPassword'] }
        );
      }

      if (newPassword.length < 6) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'New password must be at least 6 characters long',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      logger.info('Password changed successfully', { userId }, userId, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message?.includes('incorrect')) {
        const apiError = new ApiError(
          HttpStatus.UNAUTHORIZED,
          'Current password is incorrect',
          true,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
        logger.warn(`Change password failed: Invalid current password`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Change password error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/logout
   * User logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      res.clearCookie('refreshToken');
      logger.info('User logged out', { userId }, userId, requestId);
      res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      logger.error('Logout error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['email'] }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_EMAIL,
          true,
          ErrorCodes.INVALID_EMAIL
        );
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const result = await authService.requestPasswordReset(email, frontendUrl);

      logger.info('Password reset requested', { email }, undefined, requestId);
      // Don't leak if email exists or not (security best practice)
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Forgot password failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('Forgot password error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.BAD_REQUEST,
          true,
          ErrorCodes.VALIDATION_FAILED
        )
      );
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { token, email, newPassword, confirmPassword } = req.body;

      if (!token || !email || !newPassword || !confirmPassword) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['token', 'email', 'newPassword', 'confirmPassword'] }
        );
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Passwords do not match',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (newPassword.length < 6) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Password must be at least 6 characters long',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await authService.resetPassword(token, email, newPassword);

      logger.info('Password reset completed', { email }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Password reset failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message?.includes('expired')) {
        const apiError = new ApiError(
          HttpStatus.GONE,
          error.message,
          true,
          ErrorCodes.TOKEN_EXPIRED
        );
        logger.warn(`Password reset failed: ${error.message}`, undefined, undefined, requestId);
        return next(apiError);
      }

      const apiError = new ApiError(
        HttpStatus.BAD_REQUEST,
        error.message || 'Invalid or expired reset token',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
      logger.warn(`Password reset failed: ${error.message}`, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * POST /api/auth/resend-verification
   * Resend email verification link
   */
  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['email'] }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_EMAIL,
          true,
          ErrorCodes.INVALID_EMAIL
        );
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const result = await authService.sendEmailVerification(email, frontendUrl);

      logger.info('Verification email resent', { email }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Resend verification failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.BAD_REQUEST,
        error.message || 'Failed to resend verification email',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
      logger.error('Resend verification error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/auth/verify-email
   * Verify email with token
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { token, email } = req.query;

      if (!token || !email) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['token', 'email'] }
        );
      }

      const result = await authService.verifyEmail(token as string, email as string);

      logger.info('Email verified successfully', { email }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Email verification failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message?.includes('expired')) {
        const apiError = new ApiError(
          HttpStatus.GONE,
          error.message,
          true,
          ErrorCodes.TOKEN_EXPIRED
        );
        logger.warn(`Email verification failed: ${error.message}`, undefined, undefined, requestId);
        return next(apiError);
      }

      const apiError = new ApiError(
        HttpStatus.BAD_REQUEST,
        error.message || 'Invalid or expired verification token',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
      logger.warn(`Email verification failed: ${error.message}`, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/auth/2fa/setup
   * Initiate 2FA setup - returns QR code and backup codes
   */
  async setup2FA(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      // Get user email
      const user = await authService.getUserById(userId);

      // Generate QR code and secret
      const qrResult = await twoFactorService.generateQRCode(userId, user.email);

      // Setup 2FA and generate backup codes
      const backupResult = await twoFactorService.setup2FA(userId, qrResult.secret);

      logger.info('2FA setup initiated', { userId }, userId, requestId);

      res.status(HttpStatus.OK).json({
        qrCode: qrResult.qrCode,
        secret: qrResult.secret,
        manualEntryKey: qrResult.manualEntryKey,
        backupCodes: backupResult.backupCodes,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('2FA setup error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/2fa/verify-setup
   * Verify 2FA setup with TOTP code and enable 2FA
   */
  async verifySetup2FA(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { totpCode } = req.body;

      if (!totpCode) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['totpCode'] }
        );
      }

      // Verify TOTP code and enable 2FA
      const result = await twoFactorService.verifySetup(userId, totpCode);

      logger.info('2FA setup verified', { userId }, userId, requestId);

      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message?.includes('Invalid')) {
        const apiError = new ApiError(
          HttpStatus.UNAUTHORIZED,
          'Invalid verification code. Please try again.',
          true,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
        logger.warn('2FA setup verification failed', undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('2FA setup verification error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/2fa/verify-login
   * Verify 2FA during login with TOTP or backup code
   */
  async verifyLogin2FA(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const { userId, sessionToken, totpCode, useBackupCode } = req.body;

      if (!userId || !sessionToken || !totpCode) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['userId', 'sessionToken', 'totpCode'] }
        );
      }

      // Verify 2FA code
      const verifyResult = await twoFactorService.verifyLogin(
        userId,
        sessionToken,
        totpCode,
        useBackupCode === true
      );

      if (!verifyResult.isValid) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          verifyResult.message,
          true,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
      }

      // Generate access and refresh tokens
      const tokens = await authService.rotateRefreshToken(userId);
      const user = await authService.getUserById(userId);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('2FA login verified', { userId }, userId, requestId);

      res.status(HttpStatus.OK).json({
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`2FA login verification failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('2FA login verification error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/2fa/disable
   * Disable 2FA with password confirmation
   */
  async disable2FA(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { password } = req.body;

      if (!password) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['password'] }
        );
      }

      // Verify password
      const user = await authService.getUserById(userId);
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      prisma.$disconnect();

      if (!dbUser) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.USER_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
      }

      const bcryptjs = await import('bcryptjs');
      const isPasswordValid = await bcryptjs.compare(password, dbUser.password);

      if (!isPasswordValid) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'Invalid password',
          true,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
      }

      // Disable 2FA
      const result = await twoFactorService.disable2FA(userId);

      logger.info('2FA disabled', { userId }, userId, requestId);

      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('Disable 2FA error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /api/auth/2fa/status
   * Get current 2FA status
   */
  async get2FAStatus(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const status = await twoFactorService.get2FAStatus(userId);

      res.status(HttpStatus.OK).json(status);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('Get 2FA status error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /api/auth/2fa/regenerate-backup-codes
   * Regenerate backup codes
   */
  async regenerateBackupCodes(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { password } = req.body;

      if (!password) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['password'] }
        );
      }

      // Verify password
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      prisma.$disconnect();

      if (!dbUser) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.USER_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
      }

      const bcryptjs = await import('bcryptjs');
      const isPasswordValid = await bcryptjs.compare(password, dbUser.password);

      if (!isPasswordValid) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'Invalid password',
          true,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
      }

      // Regenerate backup codes
      const result = await twoFactorService.regenerateBackupCodes(userId);

      logger.info('Backup codes regenerated', { userId }, userId, requestId);

      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error('Regenerate backup codes error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }
}

export default new AuthController();
