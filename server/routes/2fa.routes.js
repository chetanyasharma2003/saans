const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate 2FA secret
router.post('/generate-secret', authenticateToken, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `SAANS (${req.userId})`,
      issuer: 'SAANS Mental Health',
      length: 32
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
      manual: secret.otpauth_url
    });
  } catch (error) {
    next(error);
  }
});

// Verify & enable 2FA
router.post('/enable', authenticateToken, async (req, res, next) => {
  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    await User.findByIdAndUpdate(req.userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    });

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
});

// Verify 2FA token during login
router.post('/verify', async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
    }

    res.json({ success: true, message: '2FA verified' });
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/disable', authenticateToken, async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.userId);
    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }

    await User.findByIdAndUpdate(req.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null
    });

    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    next(error);
  }
});

// Generate backup codes
router.post('/backup-codes', authenticateToken, async (req, res, next) => {
  try {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    await User.findByIdAndUpdate(req.userId, {
      backupCodes: codes
    });

    res.json({ success: true, codes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
