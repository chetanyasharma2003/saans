// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import therapistService from '../services/therapistService.js';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class TherapistController {
  /**
   * GET /therapists - Get all therapists with filters
   * Query params: specialty, minPrice, maxPrice, minRating, availability, page, limit
   */
  async getAllTherapists(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;

    try {
      const { specialty, minPrice, maxPrice, minRating, availability, page, limit, userCity } = req.query;

      const filters = {
        specialty: specialty as string,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        availability: availability ? availability === 'true' : undefined,
        userCity: userCity as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      // Validate pagination params
      if (filters.page < 1) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Page must be greater than 0',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (filters.limit < 1 || filters.limit > 100) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_PAGINATION,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate price range
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        if (filters.minPrice > filters.maxPrice) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Min price cannot be greater than max price',
            true,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      logger.debug('Fetching therapists', { filters }, undefined, requestId);

      const result = await therapistService.getAllTherapists(filters);

      logger.info('Therapists retrieved', { count: result.therapists?.length || 0 }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get therapists failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('Get therapists error', error, undefined, undefined, requestId);
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
   * GET /therapists/:id - Get single therapist detail
   */
  async getTherapistById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { id } = req.params;

    try {
      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching therapist', { therapistId: id }, undefined, requestId);

      const therapist = await therapistService.getTherapistById(id);

      logger.info('Therapist retrieved', { therapistId: id }, undefined, requestId);
      return res.status(HttpStatus.OK).json(therapist);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, undefined, requestId);
        return next(apiError);
      }

      logger.error('Get therapist error', error, undefined, undefined, requestId);
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
   * GET /therapists/availability/:id - Get available slots
   * Query params: date (YYYY-MM-DD)
   */
  async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { id } = req.params;
    const { date } = req.query;

    try {
      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!date) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Date query parameter is required (YYYY-MM-DD)',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date as string)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Invalid date format. Use YYYY-MM-DD',
          true,
          ErrorCodes.INVALID_DATE
        );
      }

      logger.debug('Fetching available slots', { therapistId: id, date }, undefined, requestId);

      const slots = await therapistService.getAvailableSlots(id, date as string);

      logger.info('Available slots retrieved', { therapistId: id, slotCount: slots.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(slots);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, undefined, requestId);
        return next(apiError);
      }

      logger.error('Get available slots error', error, undefined, undefined, requestId);
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
   * GET /therapist-reviews/:id - Get therapist reviews
   * Query params: page, limit
   */
  async getTherapistReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { id } = req.params;
    const { page, limit } = req.query;

    try {
      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 10;

      if (pageNum < 1) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Page must be greater than 0',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_PAGINATION,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching therapist reviews', { therapistId: id, page: pageNum, limit: limitNum }, undefined, requestId);

      const reviews = await therapistService.getTherapistReviews(id, pageNum, limitNum);

      logger.info('Reviews retrieved', { therapistId: id, reviewCount: reviews.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(reviews);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, undefined, requestId);
        return next(apiError);
      }

      logger.error('Get therapist reviews error', error, undefined, undefined, requestId);
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
   * GET /therapist-stats/:id - Get therapist statistics
   */
  async getTherapistStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { id } = req.params;

    try {
      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching therapist stats', { therapistId: id }, undefined, requestId);

      const stats = await therapistService.getTherapistStats(id);

      logger.info('Therapist stats retrieved', { therapistId: id }, undefined, requestId);
      return res.status(HttpStatus.OK).json(stats);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, undefined, requestId);
        return next(apiError);
      }

      logger.error('Get therapist stats error', error, undefined, undefined, requestId);
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
   * POST /therapist-profile - Create therapist profile
   * Requires authentication (therapist)
   */
  async createTherapistProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { licenseNumber, specialization, certifications, yearsOfExperience, hourlyRate, availableSlots } =
        req.body;

      // Validate required fields
      if (!licenseNumber) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'License number is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!specialization || !Array.isArray(specialization) || specialization.length === 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'At least one specialization is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (yearsOfExperience === undefined || yearsOfExperience < 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Valid years of experience is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate availability slots if provided
      if (availableSlots) {
        if (!Array.isArray(availableSlots)) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Available slots must be an array',
            true,
            ErrorCodes.VALIDATION_FAILED
          );
        }

        for (const slot of availableSlots) {
          if (slot.dayOfWeek === undefined || slot.startTime === undefined || slot.endTime === undefined) {
            throw new ApiError(
              HttpStatus.BAD_REQUEST,
              'Each slot must have dayOfWeek, startTime, and endTime',
              true,
              ErrorCodes.VALIDATION_FAILED
            );
          }
          if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
            throw new ApiError(
              HttpStatus.BAD_REQUEST,
              'Day of week must be between 0 and 6',
              true,
              ErrorCodes.VALIDATION_FAILED
            );
          }
        }
      }

      logger.info('Creating therapist profile', { userId }, userId, requestId);

      const result = await therapistService.createTherapistProfile({
        userId,
        licenseNumber,
        specialization,
        certifications: certifications || [],
        yearsOfExperience,
        hourlyRate: hourlyRate || 500,
        availableSlots,
      });

      logger.info('Therapist profile created', { userId }, userId, requestId);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Create therapist profile failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message?.includes('already exists')) {
        const apiError = new ApiError(
          HttpStatus.CONFLICT,
          ErrorMessages.THERAPIST_PROFILE_EXISTS,
          true,
          ErrorCodes.RESOURCE_EXISTS
        );
        logger.warn(`Therapist profile already exists for user: ${userId}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Create therapist profile error', error, undefined, userId, requestId);
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
   * PUT /therapist-profile/:id - Update therapist profile
   * Requires authentication (therapist)
   */
  async updateTherapistProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { id } = req.params;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { specialization, certifications, yearsOfExperience, hourlyRate, isAvailable } = req.body;

      // Validate input data
      if (specialization && (!Array.isArray(specialization) || specialization.length === 0)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Specialization must be a non-empty array',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (yearsOfExperience !== undefined && yearsOfExperience < 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Years of experience cannot be negative',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (hourlyRate !== undefined && hourlyRate <= 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Hourly rate must be greater than 0',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.info('Updating therapist profile', { therapistId: id }, userId, requestId);

      const result = await therapistService.updateTherapistProfile(id, {
        specialization,
        certifications,
        yearsOfExperience,
        hourlyRate,
        isAvailable,
      });

      logger.info('Therapist profile updated', { therapistId: id }, userId, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Update therapist profile failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Update therapist profile error', error, undefined, userId, requestId);
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
   * PUT /therapist-availability/:id - Update availability slots
   * Requires authentication (therapist)
   */
  async updateAvailabilitySlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { id } = req.params;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      if (!id) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { slots } = req.body;

      if (!slots || !Array.isArray(slots)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Slots must be a non-empty array',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate each slot
      for (const slot of slots) {
        if (slot.dayOfWeek === undefined || slot.startTime === undefined || slot.endTime === undefined) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Each slot must have dayOfWeek, startTime, and endTime',
            true,
            ErrorCodes.VALIDATION_FAILED
          );
        }
        if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
          throw new ApiError(
            HttpStatus.BAD_REQUEST,
            'Day of week must be between 0 and 6',
            true,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      logger.info('Updating availability slots', { therapistId: id, slotCount: slots.length }, userId, requestId);

      const result = await therapistService.updateAvailabilitySlots(id, slots);

      logger.info('Availability slots updated', { therapistId: id }, userId, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Update availability slots failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message === 'Therapist not found') {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.THERAPIST_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Update availability slots error', error, undefined, userId, requestId);
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
   * GET /therapists/search/:query - Search therapists
   * Query params: limit
   */
  async searchTherapists(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { query } = req.params;
    const { limit } = req.query;

    try {
      if (!query || query.trim().length === 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Search query is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const limitNum = limit ? parseInt(limit as string) : 10;

      if (limitNum < 1 || limitNum > 100) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_PAGINATION,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Searching therapists', { query, limit: limitNum }, undefined, requestId);

      const results = await therapistService.searchTherapists(query, limitNum);

      logger.info('Therapist search completed', { query, resultCount: results.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json({
        query,
        results,
        count: results.length,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Search therapists failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('Search therapists error', error, undefined, undefined, requestId);
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

export default new TherapistController();
