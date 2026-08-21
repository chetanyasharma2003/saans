// @ts-nocheck

import { Router } from 'express';
import crisisController from '../controllers/crisisController.js';
import { verifyToken, isAuthenticated } from '../middleware/authMiddleware.js';
import { crisisLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/crisis/detect:
 *   post:
 *     summary: Detect crisis in message
 *     description: Analyze message for crisis keywords and assess severity. Public endpoint.
 *     tags:
 *       - Crisis Support
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetectCrisisRequest'
 *     responses:
 *       200:
 *         description: Crisis analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetectCrisisResponse'
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/detect', crisisLimiter, (req, res) => crisisController.detectCrisis(req, res));

/**
 * @swagger
 * /api/crisis/hotlines:
 *   get:
 *     summary: Get emergency hotlines
 *     description: Get list of emergency hotlines for India, optionally filtered by city
 *     tags:
 *       - Crisis Support
 *     parameters:
 *       - name: city
 *         in: query
 *         schema:
 *           type: string
 *         description: City name for local hotlines
 *     responses:
 *       200:
 *         description: Hotlines retrieved
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
 *                     $ref: '#/components/schemas/Hotline'
 */
router.get('/hotlines', (req, res) => crisisController.getHotlines(req, res));

/**
 * @swagger
 * /api/crisis/alert:
 *   post:
 *     summary: Trigger emergency alert
 *     description: Manually trigger an emergency alert for crisis intervention
 *     tags:
 *       - Crisis Support
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Details about the crisis situation
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 nullable: true
 *             required:
 *               - description
 *     responses:
 *       201:
 *         description: Emergency alert triggered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CrisisIncident'
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/alert',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.triggerEmergencyAlert(req, res)
);

/**
 * @swagger
 * /api/crisis/my-incidents:
 *   get:
 *     summary: Get user's crisis incidents
 *     description: Get list of user's crisis incidents with pagination
 *     tags:
 *       - Crisis Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Incidents retrieved
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
 *                     $ref: '#/components/schemas/CrisisIncident'
 */
router.get(
  '/my-incidents',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.getMyIncidents(req, res)
);

/**
 * @swagger
 * /api/crisis/incident/{id}/status:
 *   put:
 *     summary: Update incident status
 *     description: Update the status of a crisis incident
 *     tags:
 *       - Crisis Support
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
 *                 enum: [ACTIVE, RESOLVED, ESCALATED_TO_THERAPIST, CLOSED]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Incident status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CrisisIncident'
 */
router.put(
  '/incident/:id/status',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.updateIncidentStatus(req, res)
);

/**
 * @swagger
 * /api/crisis/incident/{id}/escalate:
 *   post:
 *     summary: Escalate incident to therapist
 *     description: Escalate a crisis incident to a therapist for immediate intervention
 *     tags:
 *       - Crisis Support
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
 *         description: Incident escalated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CrisisIncident'
 */
router.post(
  '/incident/:id/escalate',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.escalateIncident(req, res)
);

/**
 * @swagger
 * /api/crisis/statistics:
 *   get:
 *     summary: Get crisis statistics
 *     description: Get crisis-related statistics for the user over a time period
 *     tags:
 *       - Crisis Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           default: 30
 *           maximum: 365
 *         description: Number of days to analyze
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
 *                     totalIncidents:
 *                       type: integer
 *                     criticalIncidents:
 *                       type: integer
 *                     resolvedIncidents:
 *                       type: integer
 *                     escalatedIncidents:
 *                       type: integer
 */
router.get(
  '/statistics',
  verifyToken,
  isAuthenticated,
  (req, res) => crisisController.getStatistics(req, res)
);

export default router;
