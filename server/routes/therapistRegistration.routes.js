const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Therapist = require('../models/Therapist');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const locationMatcher = require('../services/dataPipeline/locationMatcher');
const dataValidator = require('../services/dataPipeline/dataValidator');
const logger = require('../utils/logger');

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Register new therapist
router.post(
  '/register',
  [
    body('firstName').notEmpty().trim().isLength({ min: 2 }),
    body('lastName').notEmpty().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('password').isLength({ min: 8 }),
    body('license.number').notEmpty().trim().isLength({ min: 5 }),
    body('specialties').isArray({ min: 1 }),
    body('location.city').notEmpty().trim(),
    body('location.state').notEmpty().trim(),
    body('location.address').notEmpty().trim(),
    body('experience').isInt({ min: 0 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        license,
        specialties,
        location,
        experience,
        education,
        languages,
        pricing,
        sessionFormat
      } = req.body;

      // Check if therapist already exists
      const existingTherapist = await Therapist.findOne({ email });
      if (existingTherapist) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }

      // Validate data
      const validation = dataValidator.validateTherapistData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Geocode address
      let coordinates;
      try {
        coordinates = await locationMatcher.geocodeAddress(location.address || location.city);
      } catch (error) {
        logger.warn('Geocoding failed, using default:', { error: error.message });
        coordinates = [72.8479, 19.0144]; // Default to Mumbai
      }

      // Create therapist profile
      const therapist = new Therapist({
        firstName,
        lastName,
        email,
        phone,
        license: {
          ...license,
          verified: false,
          issueDate: license.issueDate ? new Date(license.issueDate) : undefined,
          expiryDate: license.expiryDate ? new Date(license.expiryDate) : undefined
        },
        specialties,
        location: {
          city: location.city,
          state: location.state,
          country: location.country || 'India',
          zipCode: location.zipCode,
          address: location.address,
          coordinates: {
            type: 'Point',
            coordinates
          }
        },
        experience,
        education: education || [],
        languages: languages || [],
        pricing: pricing || {},
        sessionFormat: sessionFormat || ['video-call'],
        verification: {
          status: 'pending',
          documents: []
        },
        isActive: false,
        status: 'inactive'
      });

      // Store password (will be hashed by pre-save hook if needed)
      therapist.password = password;

      await therapist.save();

      // Generate verification token
      const verificationToken = jwt.sign(
        { therapistId: therapist._id, email: therapist.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send verification email
      try {
        await emailTransporter.sendMail({
          to: therapist.email,
          subject: 'SAANS - Verify Your Therapist Account',
          html: `
            <h2>Welcome to SAANS!</h2>
            <p>Thank you for registering as a therapist. Please verify your email by clicking the link below:</p>
            <a href="${process.env.FRONTEND_URL}/therapist-verify/${verificationToken}">
              Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
            <p>Your profile is currently pending approval. We will verify your credentials and contact you soon.</p>
          `
        });
      } catch (emailError) {
        logger.error('Error sending verification email:', { error: emailError.message });
      }

      logger.info('Therapist registered:', {
        therapistId: therapist._id,
        email: therapist.email,
        specialties
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          therapistId: therapist._id,
          email: therapist.email,
          verificationRequired: true
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify email
router.post('/verify-email', [body('token').notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const therapist = await Therapist.findById(decoded.therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    therapist.emailVerified = true;
    await therapist.save();

    logger.info('Therapist email verified:', { therapistId: therapist._id });

    res.json({
      success: true,
      message: 'Email verified successfully! Your profile is pending admin approval.'
    });
  } catch (error) {
    next(error);
  }
});

// Upload license document
router.post(
  '/:id/upload-license',
  auth,
  [body('documentType').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const { documentType } = req.body;
      const therapistId = req.params.id;

      // Check if it's the therapist's own profile
      if (req.userId.toString() !== therapistId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      const therapist = await Therapist.findById(therapistId);
      if (!therapist) {
        return res.status(404).json({ success: false, error: 'Therapist not found' });
      }

      // Store document URL (in production, would upload to S3)
      const documentUrl = `/uploads/therapist-documents/${therapistId}/${req.file.filename}`;

      if (!therapist.verification.documents) {
        therapist.verification.documents = [];
      }

      therapist.verification.documents.push(documentUrl);
      await therapist.save();

      logger.info('License document uploaded:', {
        therapistId,
        documentType,
        filename: req.file.filename
      });

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: { documentUrl }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get therapist registration status
router.get('/:id/status', auth, async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.params.id).select(
      'verification status isActive email emailVerified'
    );

    if (!therapist) {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    // Check if user owns this profile or is admin
    if (req.userId.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: {
        verificationStatus: therapist.verification.status,
        profileStatus: therapist.status,
        isActive: therapist.isActive,
        emailVerified: therapist.emailVerified,
        rejectionReason: therapist.verification.rejectionReason || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get pending therapist registrations (ADMIN ONLY)
router.get(
  '/admin/pending-approvals',
  auth,
  requireRole(['admin']),
  async (req, res, next) => {
    try {
      const pendingTherapists = await Therapist.find({
        'verification.status': 'pending'
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        data: pendingTherapists,
        count: pendingTherapists.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// Approve therapist registration (ADMIN ONLY)
router.post(
  '/admin/:id/approve',
  auth,
  requireRole(['admin']),
  [body('notes').optional().isString().trim()],
  async (req, res, next) => {
    try {
      const { notes } = req.body;
      const therapistId = req.params.id;

      const therapist = await Therapist.findById(therapistId);
      if (!therapist) {
        return res.status(404).json({ success: false, error: 'Therapist not found' });
      }

      therapist.verification.status = 'approved';
      therapist.verification.verifiedBy = req.userId;
      therapist.verification.verifiedDate = new Date();
      therapist.isActive = true;
      therapist.status = 'active';
      therapist.adminNotes = notes || '';

      await therapist.save();

      // Send approval email
      try {
        await emailTransporter.sendMail({
          to: therapist.email,
          subject: 'SAANS - Your Profile Has Been Approved!',
          html: `
            <h2>Great news!</h2>
            <p>Your therapist profile has been approved and is now live on SAANS.</p>
            <p>You can now start accepting clients and managing your appointments.</p>
            <p>Login to your dashboard: ${process.env.FRONTEND_URL}/therapist-dashboard</p>
          `
        });
      } catch (emailError) {
        logger.error('Error sending approval email:', { error: emailError.message });
      }

      logger.info('Therapist approved by admin:', {
        therapistId,
        adminId: req.userId,
        notes
      });

      res.json({
        success: true,
        message: 'Therapist approved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reject therapist registration (ADMIN ONLY)
router.post(
  '/admin/:id/reject',
  auth,
  requireRole(['admin']),
  [body('rejectionReason').notEmpty().isString().trim()],
  async (req, res, next) => {
    try {
      const { rejectionReason } = req.body;
      const therapistId = req.params.id;

      const therapist = await Therapist.findById(therapistId);
      if (!therapist) {
        return res.status(404).json({ success: false, error: 'Therapist not found' });
      }

      therapist.verification.status = 'rejected';
      therapist.verification.verifiedBy = req.userId;
      therapist.verification.verifiedDate = new Date();
      therapist.verification.rejectionReason = rejectionReason;
      therapist.isActive = false;
      therapist.status = 'inactive';

      await therapist.save();

      // Send rejection email
      try {
        await emailTransporter.sendMail({
          to: therapist.email,
          subject: 'SAANS - Registration Update',
          html: `
            <h2>Registration Update</h2>
            <p>Unfortunately, your therapist registration could not be approved.</p>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p>Please review and submit again with the necessary corrections.</p>
          `
        });
      } catch (emailError) {
        logger.error('Error sending rejection email:', { error: emailError.message });
      }

      logger.info('Therapist rejected by admin:', {
        therapistId,
        adminId: req.userId,
        reason: rejectionReason
      });

      res.json({
        success: true,
        message: 'Therapist registration rejected'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
