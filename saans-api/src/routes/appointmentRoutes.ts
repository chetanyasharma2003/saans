// @ts-nocheck

import { Router } from 'express';
import appointmentController from '../controllers/appointmentController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// All appointment routes require authentication
router.use(verifyToken, isAuthenticated);

/**
 * @swagger
 * /api/appointments/book:
 *   post:
 *     summary: Book a new appointment
 *     description: Book an appointment with a therapist
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error (invalid time slot, therapist not available)
 *       401:
 *         description: Unauthorized
 */
router.post('/book', (req, res) => appointmentController.bookAppointment(req, res));

/**
 * @swagger
 * /api/appointments/my-appointments:
 *   get:
 *     summary: Get user's appointments
 *     description: Get all appointments for authenticated user with optional status filter
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED]
 *         description: Filter by appointment status
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-appointments', (req, res) => appointmentController.getMyAppointments(req, res));

/**
 * @swagger
 * /api/appointments/therapist-appointments/{therapistId}:
 *   get:
 *     summary: Get therapist's appointments
 *     description: Get all appointments for a specific therapist (therapist or admin only)
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: therapistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED]
 *     responses:
 *       200:
 *         description: Therapist appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/therapist-appointments/:therapistId', (req, res) =>
  appointmentController.getTherapistAppointments(req, res),
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment details
 *     description: Get full details for a specific appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', (req, res) => appointmentController.getAppointmentDetails(req, res));

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     description: Update appointment status (complete, cancel, no-show, etc.)
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, CANCELLED, NO_SHOW]
 *               cancelReason:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Appointment status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 */
router.put('/:id/status', (req, res) => appointmentController.updateAppointmentStatus(req, res));

/**
 * @swagger
 * /api/appointments/{id}/reschedule:
 *   post:
 *     summary: Reschedule appointment
 *     description: Change appointment to a different date/time
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RescheduleAppointmentRequest'
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 */
router.post('/:id/reschedule', (req, res) =>
  appointmentController.rescheduleAppointment(req, res),
);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   post:
 *     summary: Cancel appointment
 *     description: Cancel an upcoming appointment with optional reason
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelAppointmentRequest'
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 */
router.post('/:id/cancel', (req, res) => appointmentController.cancelAppointment(req, res));

/**
 * @swagger
 * /api/appointments/availability/{therapistId}:
 *   get:
 *     summary: Check therapist availability
 *     description: Check if a therapist is available at a specific datetime
 *     tags:
 *       - Appointments
 *     parameters:
 *       - name: therapistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: dateTime
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: duration
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 30
 *           description: Duration in minutes
 *     responses:
 *       200:
 *         description: Availability status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 */
router.get('/availability/:therapistId', (req, res) =>
  appointmentController.checkAvailability(req, res),
);

/**
 * @swagger
 * /api/appointments/slots/{therapistId}:
 *   get:
 *     summary: Get available time slots
 *     description: Get available time slots for a therapist on a specific date
 *     tags:
 *       - Appointments
 *     parameters:
 *       - name: therapistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *       - name: duration
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 30
 *           default: 60
 *         description: Session duration in minutes
 *     responses:
 *       200:
 *         description: Available slots retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AvailableSlot'
 */
router.get('/slots/:therapistId', (req, res) =>
  appointmentController.getAvailableSlots(req, res),
);

export default router;
