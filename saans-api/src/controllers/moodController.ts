// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import moodService from '../services/moodService.js';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class MoodController {
  /**
   * POST /api/moods/track
   * Track a new mood entry
   */
  async trackMood(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const { moodScore, moodCategory, symptoms, triggers, notes, location, weather } = req.body;

      // Validate required fields
      if (moodScore === undefined || !moodCategory) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Mood score and category are required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await moodService.trackMood(userId, {
        moodScore,
        moodCategory,
        symptoms,
        triggers,
        notes,
        location,
        weather,
      });

      logger.info('Mood entry tracked successfully', { userId }, undefined, requestId);
      res.status(HttpStatus.CREATED).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Track mood failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Track mood error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/moods/my-moods
   * Get user's mood history
   */
  async getUserMoods(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const limit = Math.min(Number(req.query.limit) || 30, 100);
      const skip = Math.max(Number(req.query.skip) || 0, 0);

      const result = await moodService.getUserMoods(userId, limit, skip);

      logger.info('Mood history retrieved', { userId }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get moods failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Get moods error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/moods/analytics
   * Get mood analytics
   */
  async getMoodAnalytics(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const analytics = await moodService.getMoodAnalytics(userId);

      logger.info('Mood analytics retrieved', { userId }, undefined, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get analytics failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Get analytics error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * GET /api/moods/date-range
   * Get moods for a date range
   * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
   */
  async getMoodsByDateRange(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'startDate and endDate query parameters are required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await moodService.getMoodsByDateRange(
        userId,
        startDate as string,
        endDate as string
      );

      logger.info('Moods by date range retrieved', { userId }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get moods by date range failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Get moods by date range error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * DELETE /api/moods/:id
   * Delete a mood entry
   */
  async deleteMoodEntry(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const { id } = req.params;

      const result = await moodService.deleteMoodEntry(userId, id);

      logger.info('Mood entry deleted', { userId, entryId: id }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Delete mood failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Delete mood error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }

  /**
   * PUT /api/moods/:id
   * Update a mood entry
   */
  async updateMoodEntry(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTHENTICATION_FAILED
        );
      }

      const { id } = req.params;
      const { moodScore, moodCategory, symptoms, triggers, notes, location, weather } = req.body;

      const result = await moodService.updateMoodEntry(userId, id, {
        moodScore,
        moodCategory,
        symptoms,
        triggers,
        notes,
        location,
        weather,
      });

      logger.info('Mood entry updated', { userId, entryId: id }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Update mood failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      const apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_ERROR,
        true,
        ErrorCodes.DATABASE_ERROR
      );
      logger.error('Update mood error', error, undefined, undefined, requestId);
      next(apiError);
    }
  }
}

export default new MoodController();
