const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/AppError');

// Validate JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required and must be set');
}

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ============ REGISTER ============
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character (!@#$%^&*)'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
], async (req, res, next) => {
  try {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Registration validation failed', errors.array());
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// ============ LOGIN ============
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Login validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// ============ REFRESH TOKEN ============
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token (allow expired for refresh)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      throw new UnauthorizedError('Invalid token signature');
    }

    // Verify user still exists and is active
    const user = await User.findOne({ _id: decoded.userId, status: 'active' }).select('_id status');
    if (!user) {
      throw new UnauthorizedError('User no longer active');
    }

    // Generate new token
    const newToken = generateToken(decoded.userId);

    res.json({
      success: true,
      message: 'Token refreshed',
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
});

// ============ VERIFY TOKEN ============
router.get('/verify', (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      message: 'Token is valid',
      userId: decoded.userId,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
