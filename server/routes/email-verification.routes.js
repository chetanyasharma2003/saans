const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Send verification email
router.post('/send', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user.emailVerified) {
      return res.status(400).json({ success: false, error: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await User.findByIdAndUpdate(req.userId, {
      verificationToken: hashedToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await emailService.sendVerificationEmail(user.email, verificationUrl);

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

// Verify email with token
router.post('/verify/:token', async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user.emailVerified) {
      return res.status(400).json({ success: false, error: 'Email already verified' });
    }

    // Check if already sent recently
    if (user.verificationTokenExpires && user.verificationTokenExpires > new Date(Date.now() - 60000)) {
      return res.status(400).json({ success: false, error: 'Please wait before requesting again' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await User.findByIdAndUpdate(req.userId, {
      verificationToken: hashedToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(user.email, verificationUrl);

    res.json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
