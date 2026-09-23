const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticateToken } = require('../middleware/auth');

// TODO: Implement appointment routes
// GET /api/v1/appointments - Get user appointments
// POST /api/v1/appointments - Create appointment
// GET /api/v1/appointments/:id - Get single appointment
// PUT /api/v1/appointments/:id - Update appointment
// DELETE /api/v1/appointments/:id - Cancel appointment

router.get('/', (req, res) => {
  res.json({ message: 'Appointments endpoint ready' });
});

module.exports = router;
