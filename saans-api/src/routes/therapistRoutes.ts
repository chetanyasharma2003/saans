// @ts-nocheck

import { Router, Request, Response, NextFunction } from 'express';
import therapistController from '../controllers/therapistController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * PUBLIC ROUTES - No authentication required
 */

/**
 * GET /therapists - Get all therapists with filters
 * Query params: specialty, minPrice, maxPrice, minRating, availability, page, limit
 */
router.get('/', (req, res) => therapistController.getAllTherapists(req, res));

/**
 * GET /therapists/:id - Get single therapist detail
 */
router.get('/:id', (req, res) => therapistController.getTherapistById(req, res));

/**
 * GET /therapists/availability/:id - Get available slots for a therapist
 * Query params: date (YYYY-MM-DD)
 */
router.get('/availability/:id', (req, res) => therapistController.getAvailableSlots(req, res));

/**
 * GET /therapist-reviews/:id - Get therapist reviews with pagination
 * Query params: page, limit
 */
router.get('/reviews/:id', (req, res) => therapistController.getTherapistReviews(req, res));

/**
 * GET /therapist-stats/:id - Get therapist statistics (ratings, bookings, sessions)
 */
router.get('/stats/:id', (req, res) => therapistController.getTherapistStats(req, res));

/**
 * GET /therapists/search/:query - Search therapists by name or specialization
 * Query params: limit
 */
router.get('/search/:query', (req, res) => therapistController.searchTherapists(req, res));

/**
 * PROTECTED ROUTES - Authentication required
 */

/**
 * POST /therapist-profile - Create therapist profile
 * Requires authentication
 * Body: {
 *   licenseNumber: string,
 *   specialization: string[],
 *   certifications?: string[],
 *   yearsOfExperience: number,
 *   hourlyRate?: number,
 *   availableSlots?: [{dayOfWeek: number, startTime: string, endTime: string}]
 * }
 */
router.post('/profile', verifyToken, isAuthenticated, (req, res) =>
  therapistController.createTherapistProfile(req, res),
);

/**
 * PUT /therapist-profile/:id - Update therapist profile
 * Requires authentication
 * Body: {
 *   specialization?: string[],
 *   certifications?: string[],
 *   yearsOfExperience?: number,
 *   hourlyRate?: number,
 *   isAvailable?: boolean
 * }
 */
router.put('/profile/:id', verifyToken, isAuthenticated, (req, res) =>
  therapistController.updateTherapistProfile(req, res),
);

/**
 * PUT /therapist-availability/:id - Update availability slots
 * Requires authentication
 * Body: {
 *   slots: [{dayOfWeek: number, startTime: string, endTime: string}]
 * }
 */
router.put('/availability/:id', verifyToken, isAuthenticated, (req, res) =>
  therapistController.updateAvailabilitySlots(req, res),
);

export default router;
