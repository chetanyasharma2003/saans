// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService.js';
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
      const { email, password, name, role } = req.body;

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
      });

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
   * User login
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

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('User logged in successfully', { email }, undefined, requestId);
      res.status(HttpStatus.OK).json({
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
}

export default new AuthController();
