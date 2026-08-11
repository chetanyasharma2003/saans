// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import appointmentService from '../services/appointmentService.js';
import { BookingStatus } from '@prisma/client';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AppointmentController {
  /**
   * POST /appointments/book
   * Book a new appointment
   * Required: therapistId, scheduledAt, duration
   * Optional: reason, notes
   */
  async bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { therapistId, scheduledAt, duration, reason, notes } = req.body;

      // Validate required fields
      if (!therapistId || !scheduledAt || !duration) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.MISSING_REQUIRED_FIELDS,
          true,
          ErrorCodes.VALIDATION_FAILED,
          { required: ['therapistId', 'scheduledAt', 'duration'] }
        );
      }

      // Validate duration
      if (typeof duration !== 'number' || duration <= 0 || duration > 480) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Duration must be a number between 1 and 480 minutes (8 hours)',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate date
      if (isNaN(Date.parse(scheduledAt))) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_DATE,
          true,
          ErrorCodes.INVALID_DATE
        );
      }

      logger.info('Booking appointment', { therapistId, duration }, userId, requestId);

      const result = await appointmentService.bookAppointment({
        userId,
        therapistId,
        scheduledAt: new Date(scheduledAt),
        duration,
        reason,
        notes,
      });

      // @ts-ignore - Service returns appointment wrapped object
      logger.info('Appointment booked successfully', { appointmentId: result.id }, userId, requestId);
      res.status(HttpStatus.CREATED).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Book appointment failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Book appointment error', error, undefined, userId, requestId);
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
   * GET /appointments/my-appointments
   * Get all appointments for logged-in user (patient view)
   * Query params: status (optional - filter by status)
   */
  async getMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { status } = req.query;

      // Validate status if provided
      if (status && !Object.values(BookingStatus).includes(status as BookingStatus)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching user appointments', { status }, userId, requestId);

      const result = await appointmentService.getAppointmentsByUser(
        userId,
        status as BookingStatus | undefined,
      );

      logger.info('Appointments retrieved', { count: result.appointments?.length || 0 }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get appointments failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Get appointments error', error, undefined, userId, requestId);
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
   * GET /appointments/therapist-appointments/:therapistId
   * Get all appointments for a therapist
   * Query params: status (optional - filter by status)
   * Only accessible by the therapist themselves
   */
  async getTherapistAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const { therapistId } = req.params;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          ErrorMessages.UNAUTHORIZED,
          true,
          ErrorCodes.AUTH_UNAUTHORIZED
        );
      }

      if (!therapistId) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // TODO: Verify that userId is the therapist or admin
      const { status } = req.query;

      // Validate status if provided
      if (status && !Object.values(BookingStatus).includes(status as BookingStatus)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching therapist appointments', { therapistId, status }, userId, requestId);

      const result = await appointmentService.getAppointmentsByTherapist(
        therapistId,
        status as BookingStatus | undefined,
      );

      logger.info('Therapist appointments retrieved', { therapistId }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get therapist appointments failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      logger.error('Get therapist appointments error', error, undefined, userId, requestId);
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
   * GET /appointments/:id
   * Get single appointment details
   */
  async getAppointmentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          'Appointment ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Fetching appointment details', { appointmentId: id }, userId, requestId);

      const result = await appointmentService.getAppointmentDetails(id);

      // Check if user is authorized to view this appointment
      if (
        result.appointment.patient.id !== userId &&
        result.appointment.therapist.id !== userId
      ) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          ErrorMessages.RESOURCE_FORBIDDEN,
          true,
          ErrorCodes.RESOURCE_FORBIDDEN
        );
      }

      logger.info('Appointment details retrieved', { appointmentId: id }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get appointment details failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message?.includes('not found')) {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.APPOINTMENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Appointment not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Get appointment details error', error, undefined, userId, requestId);
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
   * PUT /appointments/:id/status
   * Update appointment status
   * Body: { status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW', cancelReason?: string }
   */
  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          'Appointment ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { status, cancelReason } = req.body;

      if (!status) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Status is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (!Object.values(BookingStatus).includes(status)) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.info('Updating appointment status', { appointmentId: id, newStatus: status }, userId, requestId);

      const result = await appointmentService.updateAppointmentStatus({
        appointmentId: id,
        status,
        cancelReason,
      });

      logger.info('Appointment status updated', { appointmentId: id, status }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Update appointment status failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message?.includes('not found')) {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.APPOINTMENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Appointment not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      if (error.message?.includes('Cannot transition')) {
        const apiError = new ApiError(
          HttpStatus.BAD_REQUEST,
          error.message,
          true,
          ErrorCodes.VALIDATION_FAILED
        );
        logger.warn(`Invalid status transition: ${error.message}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Update appointment status error', error, undefined, userId, requestId);
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
   * POST /appointments/:id/reschedule
   * Reschedule an appointment to a new date/time
   * Body: { newDateTime: ISO string }
   */
  async rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          'Appointment ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { newDateTime } = req.body;

      if (!newDateTime) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'newDateTime is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (isNaN(Date.parse(newDateTime))) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_DATE,
          true,
          ErrorCodes.INVALID_DATE
        );
      }

      logger.info('Rescheduling appointment', { appointmentId: id, newDateTime }, userId, requestId);

      const result = await appointmentService.rescheduleAppointment({
        appointmentId: id,
        newDateTime: new Date(newDateTime),
      });

      logger.info('Appointment rescheduled', { appointmentId: id }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Reschedule appointment failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message?.includes('not found')) {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.APPOINTMENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Appointment not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Reschedule appointment error', error, undefined, userId, requestId);
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
   * POST /appointments/:id/cancel
   * Cancel an appointment
   * Body: { reason: string }
   */
  async cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          'Appointment ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { reason } = req.body;
      const cancelReason = reason || 'User cancelled';

      logger.info('Cancelling appointment', { appointmentId: id, cancelReason }, userId, requestId);

      const result = await appointmentService.cancelAppointment(id, cancelReason);

      logger.info('Appointment cancelled', { appointmentId: id }, userId, requestId);
      res.status(HttpStatus.OK).json((result as any).appointment || result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Cancel appointment failed: ${error.message}`, undefined, userId, requestId);
        return next(error);
      }

      if (error.message?.includes('not found')) {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          ErrorMessages.APPOINTMENT_NOT_FOUND,
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Appointment not found: ${id}`, undefined, userId, requestId);
        return next(apiError);
      }

      logger.error('Cancel appointment error', error, undefined, userId, requestId);
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
   * GET /appointments/availability/:therapistId
   * Check therapist availability for a specific date/time
   * Query params: dateTime (ISO string), duration (minutes)
   */
  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { therapistId } = req.params;

    try {
      if (!therapistId) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { dateTime, duration } = req.query;

      if (!dateTime || !duration) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'dateTime and duration query parameters are required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (isNaN(Date.parse(dateTime as string))) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_DATE,
          true,
          ErrorCodes.INVALID_DATE
        );
      }

      const durationNum = parseInt(duration as string, 10);
      if (isNaN(durationNum) || durationNum <= 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'duration must be a positive number',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Checking therapist availability', { therapistId, dateTime, duration: durationNum }, undefined, requestId);

      const availability = await appointmentService.checkTherapistAvailability(
        therapistId,
        new Date(dateTime as string),
        durationNum,
      );

      logger.info('Availability checked', { therapistId, available: availability.available }, undefined, requestId);
      res.status(HttpStatus.OK).json({
        success: true,
        therapistId,
        dateTime,
        duration: durationNum,
        available: availability.available,
        ...(availability.conflict && { conflictingAppointmentId: availability.conflict }),
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Check availability failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('Check availability error', error, undefined, undefined, requestId);
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
   * GET /appointments/slots/:therapistId
   * Get available time slots for a therapist on a specific date
   * Query params: date (ISO date string: YYYY-MM-DD), duration (minutes, default 60)
   */
  async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const { therapistId } = req.params;

    try {
      if (!therapistId) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Therapist ID is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const { date, duration } = req.query;

      if (!date) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'date query parameter is required (format: YYYY-MM-DD)',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (isNaN(Date.parse(date as string))) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorMessages.INVALID_DATE,
          true,
          ErrorCodes.INVALID_DATE
        );
      }

      const durationNum = duration ? parseInt(duration as string, 10) : 60;
      if (isNaN(durationNum) || durationNum <= 0 || durationNum > 480) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'duration must be a positive number between 1 and 480 minutes',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Getting available slots', { therapistId, date, duration: durationNum }, undefined, requestId);

      const result = await appointmentService.getAvailableSlots(
        therapistId,
        new Date(date as string),
        durationNum,
      );

      logger.info('Available slots retrieved', { therapistId, slotsCount: result.availableSlots.length }, undefined, requestId);
      res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get available slots failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message?.includes('not found')) {
        const apiError = new ApiError(
          HttpStatus.NOT_FOUND,
          'Therapist not found',
          true,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
        logger.warn(`Therapist not found: ${therapistId}`, undefined, undefined, requestId);
        return next(apiError);
      }

      logger.error('Get available slots error', error, undefined, undefined, requestId);
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
}

export default new AppointmentController();
