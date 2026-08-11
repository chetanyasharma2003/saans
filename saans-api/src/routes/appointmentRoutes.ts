// @ts-nocheck

import { Router } from 'express';
import appointmentController from '../controllers/appointmentController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// All appointment routes require authentication
router.use(verifyToken, isAuthenticated);

/**
 * POST /api/appointments/book
 * Book a new appointment
 * Body: {
 *   therapistId: string,
 *   scheduledAt: ISO datetime,
 *   duration: number (minutes),
 *   reason?: string,
 *   notes?: string
 * }
 */
router.post('/book', (req, res) => appointmentController.bookAppointment(req, res));

/**
 * GET /api/appointments/my-appointments
 * Get all appointments for logged-in user
 * Query: status? (SCHEDULED | COMPLETED | CANCELLED | NO_SHOW)
 */
router.get('/my-appointments', (req, res) => appointmentController.getMyAppointments(req, res));

/**
 * GET /api/appointments/therapist-appointments/:therapistId
 * Get all appointments for a therapist
 * Query: status? (SCHEDULED | COMPLETED | CANCELLED | NO_SHOW)
 */
router.get('/therapist-appointments/:therapistId', (req, res) =>
  appointmentController.getTherapistAppointments(req, res),
);

/**
 * GET /api/appointments/:id
 * Get appointment details
 */
router.get('/:id', (req, res) => appointmentController.getAppointmentDetails(req, res));

/**
 * PUT /api/appointments/:id/status
 * Update appointment status
 * Body: {
 *   status: BookingStatus (COMPLETED | CANCELLED | NO_SHOW),
 *   cancelReason?: string
 * }
 */
router.put('/:id/status', (req, res) => appointmentController.updateAppointmentStatus(req, res));

/**
 * POST /api/appointments/:id/reschedule
 * Reschedule an appointment
 * Body: {
 *   newDateTime: ISO datetime
 * }
 */
router.post('/:id/reschedule', (req, res) =>
  appointmentController.rescheduleAppointment(req, res),
);

/**
 * POST /api/appointments/:id/cancel
 * Cancel an appointment
 * Body: {
 *   reason?: string
 * }
 */
router.post('/:id/cancel', (req, res) => appointmentController.cancelAppointment(req, res));

/**
 * GET /api/appointments/availability/:therapistId
 * Check therapist availability
 * Query: dateTime (ISO datetime), duration (minutes)
 */
router.get('/availability/:therapistId', (req, res) =>
  appointmentController.checkAvailability(req, res),
);

/**
 * GET /api/appointments/slots/:therapistId
 * Get available time slots for a therapist on a specific date
 * Query: date (ISO date string: YYYY-MM-DD), duration? (minutes, default 60)
 */
router.get('/slots/:therapistId', (req, res) =>
  appointmentController.getAvailableSlots(req, res),
);

export default router;
