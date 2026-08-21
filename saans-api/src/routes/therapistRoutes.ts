// @ts-nocheck

import { Router, Request, Response, NextFunction } from 'express';
import therapistController from '../controllers/therapistController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get all therapists
 *     description: Retrieve list of therapists with optional filters (specialty, price, rating)
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: specialty
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by specialty (e.g., Anxiety, Depression)
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Minimum hourly rate in INR
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Maximum hourly rate in INR
 *       - name: minRating
 *         in: query
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating (0-5)
 *       - name: availability
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Only available therapists
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of therapists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', (req, res) => therapistController.getAllTherapists(req, res));

/**
 * @swagger
 * /api/therapists/{id}:
 *   get:
 *     summary: Get therapist details
 *     description: Get detailed profile information for a specific therapist
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Therapist profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Therapist'
 *       404:
 *         description: Therapist not found
 */
router.get('/:id', (req, res) => therapistController.getTherapistById(req, res));

/**
 * @swagger
 * /api/therapists/availability/{id}:
 *   get:
 *     summary: Get therapist available slots
 *     description: Get available time slots for a therapist on a specific date
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: id
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
router.get('/availability/:id', (req, res) => therapistController.getAvailableSlots(req, res));

/**
 * @swagger
 * /api/therapists/reviews/{id}:
 *   get:
 *     summary: Get therapist reviews
 *     description: Get paginated list of client reviews for a therapist
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Reviews retrieved
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
 *                     $ref: '#/components/schemas/TherapistReview'
 */
router.get('/reviews/:id', (req, res) => therapistController.getTherapistReviews(req, res));

/**
 * @swagger
 * /api/therapists/stats/{id}:
 *   get:
 *     summary: Get therapist statistics
 *     description: Get rating, booking count, and session statistics for a therapist
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistics retrieved
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
 *                     rating:
 *                       type: number
 *                     totalReviews:
 *                       type: integer
 *                     totalSessions:
 *                       type: integer
 *                     bookingCount:
 *                       type: integer
 */
router.get('/stats/:id', (req, res) => therapistController.getTherapistStats(req, res));

/**
 * @swagger
 * /api/therapists/search/{query}:
 *   get:
 *     summary: Search therapists
 *     description: Search therapists by name or specialization
 *     tags:
 *       - Therapists
 *     parameters:
 *       - name: query
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
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
 *                     $ref: '#/components/schemas/Therapist'
 */
router.get('/search/:query', (req, res) => therapistController.searchTherapists(req, res));

/**
 * @swagger
 * /api/therapists/profile:
 *   post:
 *     summary: Create therapist profile
 *     description: Create a therapist profile for authenticated user (requires therapist role)
 *     tags:
 *       - Therapists
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTherapistProfileRequest'
 *     responses:
 *       201:
 *         description: Therapist profile created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Therapist'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 */
router.post('/profile', verifyToken, isAuthenticated, (req, res) =>
  therapistController.createTherapistProfile(req, res),
);

/**
 * @swagger
 * /api/therapists/profile/{id}:
 *   put:
 *     summary: Update therapist profile
 *     description: Update therapist profile information (specializations, rates, availability status)
 *     tags:
 *       - Therapists
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
 *             $ref: '#/components/schemas/UpdateTherapistProfileRequest'
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
 *                   $ref: '#/components/schemas/Therapist'
 *       404:
 *         description: Therapist profile not found
 */
router.put('/profile/:id', verifyToken, isAuthenticated, (req, res) =>
  therapistController.updateTherapistProfile(req, res),
);

/**
 * @swagger
 * /api/therapists/availability/{id}:
 *   put:
 *     summary: Update availability slots
 *     description: Update therapist's weekly availability slots
 *     tags:
 *       - Therapists
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
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: 0=Sunday, 6=Saturday
 *                     startTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: '09:00'
 *                     endTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: '17:00'
 *             required:
 *               - slots
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Therapist'
 */
router.put('/availability/:id', verifyToken, isAuthenticated, (req, res) =>
  therapistController.updateAvailabilitySlots(req, res),
);

export default router;
