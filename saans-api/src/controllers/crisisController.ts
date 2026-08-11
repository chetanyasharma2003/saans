// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import crisisService from '../services/crisisService.js';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CrisisController {
  /**
   * POST /crisis/detect
   * Analyze message for crisis keywords and detect severity level
   * Body: { message: string }
   * Returns: { isCrisis, level, keywords, confidence, shouldAlert }
   */
  async detectCrisis(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Message is required and must be a string',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (message.trim().length === 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Message cannot be empty',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Detecting crisis indicators', { messageLength: message.length }, userId, requestId);

      // Detect crisis in message
      const detection = crisisService.detectCrisisKeywords(message);

      // Determine if alert should be sent
      const shouldAlert = detection.isCrisis && detection.level === 'HIGH';

      if (shouldAlert) {
        logger.warn('High severity crisis detected', { level: detection.level }, userId, requestId);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        isCrisis: detection.isCrisis,
        level: detection.level,
        matchedKeywords: detection.matchedKeywords,
        confidence: Math.round(detection.confidence * 100),
        shouldAlert,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Crisis detection failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Crisis detection error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to analyze message for crisis indicators',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /crisis/alert
   * User manually triggers emergency alert
   * Body: { description?: string, severity?: string }
   * Requires: Authentication (Bearer token)
   */
  async triggerEmergencyAlert(req: Request, res: Response, next: NextFunction) {
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

      const { description, severity = 'HIGH' } = req.body;

      if (!description || typeof description !== 'string') {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Description is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!['LOW', 'MEDIUM', 'HIGH'].includes(severity)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Invalid severity level. Must be LOW, MEDIUM, or HIGH',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.warn('Emergency alert triggered', { severity, description }, userId, requestId);

      // Create crisis incident
      const incident = await crisisService.createCrisisIncident({
        userId,
        severity,
        description,
      });

      // Alert emergency contacts
      const alertResult = await crisisService.alertEmergencyContacts({
        userId,
        incidentId: incident.id,
        incident,
      });

      // If HIGH severity, escalate to therapist
      if (severity === 'HIGH') {
        try {
          await crisisService.escalateToTherapist(incident.id);
          logger.info('Incident escalated to therapist', { incidentId: incident.id }, userId, requestId);
        } catch (err) {
          logger.error('Failed to escalate incident', err, undefined, userId, requestId);
          // Continue - don't fail the alert
        }
      }

      logger.info('Emergency alert processed', { incidentId: incident.id, severity }, userId, requestId);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Emergency alert triggered successfully',
        incident: {
          id: incident.id,
          level: incident.level,
          status: incident.status,
          createdAt: incident.detectedAt,
        },
        emergencyContacts: {
          contacted: alertResult.contacted,
          contacts: alertResult.contacts,
        },
        hotlines: crisisService.getHotlineNumbers().slice(0, 3), // Top 3 hotlines
        escalated: severity === 'HIGH',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Emergency alert failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Emergency alert error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to trigger emergency alert',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /crisis/my-incidents
   * Get user's crisis incident history
   * Query params: limit (default 50), offset (default 0)
   * Requires: Authentication
   */
  async getMyIncidents(req: Request, res: Response, next: NextFunction) {
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

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit < 1 || offset < 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_PAGINATION,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching crisis incidents', { limit, offset }, userId, requestId);

      const incidents = await crisisService.getMyIncidents(userId, limit);
      const statistics = await crisisService.getCrisisStatistics(userId, 30);

      logger.info('Crisis incidents retrieved', { count: incidents.length }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        incidents: incidents.slice(offset, offset + limit),
        total: incidents.length,
        limit,
        offset,
        statistics,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get incidents failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Get incidents error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to fetch crisis incidents',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * PUT /crisis/incident/:id/status
   * Update incident status
   * Body: { status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED_TO_THERAPIST' | 'CLOSED' }
   * Requires: Authentication
   */
  async updateIncidentStatus(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { id: incidentId } = req.params;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      const { status } = req.body;

      if (!status || typeof status !== 'string') {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Status is required and must be a string',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!['ACTIVE', 'RESOLVED', 'ESCALATED_TO_THERAPIST', 'CLOSED'].includes(status)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Invalid status. Must be ACTIVE, RESOLVED, ESCALATED_TO_THERAPIST, or CLOSED',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!incidentId) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Incident ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Updating incident status', { incidentId, newStatus: status }, userId, requestId);

      // Verify incident belongs to user
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const incident = await prisma.crisisIncident.findUnique({
        where: { id: incidentId },
      });

      if (!incident) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.INCIDENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
      }

      if (incident.userId !== userId) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          'Forbidden - this incident belongs to another user',
          true,
          ErrorCodes.RESOURCE_FORBIDDEN
        );
      }

      // Update status
      const updatedIncident = await crisisService.updateIncidentStatus(incidentId, status);

      logger.info('Incident status updated', { incidentId, status }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Incident status updated to ${status}`,
        incident: {
          id: updatedIncident.id,
          level: updatedIncident.level,
          status: updatedIncident.status,
          resolvedAt: updatedIncident.resolvedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Update incident status failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Update incident status error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update incident status',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /crisis/hotlines
   * Get emergency hotline numbers for India
   * Query params: city (optional - filter by city)
   * Public endpoint (no auth required)
   */
  async getHotlines(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;

    try {
      const { city } = req.query;

      logger.debug('Fetching hotline numbers', { city: city || 'all' }, undefined, requestId);

      let hotlines;
      if (city && typeof city === 'string') {
        hotlines = crisisService.getHotlinesByCity(city);
      } else {
        hotlines = crisisService.getHotlineNumbers();
      }

      if (hotlines.length === 0) {
        // Always return pan-India hotlines if city not found
        hotlines = crisisService.getHotlineNumbers();
      }

      logger.info('Hotline numbers retrieved', { count: hotlines.length }, undefined, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        hotlines,
        count: hotlines.length,
        country: 'India',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get hotlines error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to fetch hotline numbers',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /crisis/incident/:id/escalate
   * Manually escalate incident to therapist
   * Requires: Authentication
   */
  async escalateIncident(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { id: incidentId } = req.params;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      if (!incidentId) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Incident ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Escalating incident', { incidentId }, userId, requestId);

      // Verify incident belongs to user
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const incident = await prisma.crisisIncident.findUnique({
        where: { id: incidentId },
      });

      if (!incident) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.INCIDENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
      }

      if (incident.userId !== userId) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          'Forbidden - this incident belongs to another user',
          true,
          ErrorCodes.RESOURCE_FORBIDDEN
        );
      }

      // Escalate to therapist
      const escalated = await crisisService.escalateToTherapist(incidentId);

      logger.info('Incident escalated to therapist', { incidentId }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Incident escalated to therapist successfully',
        incident: {
          id: escalated.id,
          status: escalated.status,
          level: escalated.level,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Escalate incident failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Escalate incident error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to escalate incident',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /crisis/statistics
   * Get crisis statistics for admin/user dashboard
   * Query params: days (default 30)
   * Requires: Authentication
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
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

      const days = Math.min(parseInt(req.query.days as string) || 30, 365); // Max 1 year

      if (days < 1) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Days must be a positive number',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching crisis statistics', { days }, userId, requestId);

      const stats = await crisisService.getCrisisStatistics(userId, days);

      logger.info('Crisis statistics retrieved', { days }, userId, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        statistics: stats,
        period: {
          days,
          from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get statistics failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Get statistics error', error, undefined, userId, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to fetch crisis statistics',
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }
}

export default new CrisisController();
