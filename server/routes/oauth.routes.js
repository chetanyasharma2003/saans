const express = require('express');
const router = express.Router();
const passport = require('passport');
const oauthService = require('../services/oauthService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * OAuth Routes - Google & Apple Authentication
 */

// Google authentication
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      // Generate JWT token
      const token = oauthService.generateOAuthToken(user);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${token}&user=${JSON.stringify({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role
      })}`;

      logger.info('Google OAuth successful', {
        userId: user._id,
        email: user.email
      });

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback failed', { error: error.message });
      res.redirect('/login?error=callback_failed');
    }
  }
);

// Apple authentication
router.get('/apple',
  passport.authenticate('apple')
);

// Apple callback
router.get('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
      const ip = req.ip || req.connection.remoteAddress;

      // Generate JWT token
      const token = oauthService.generateOAuthToken(user);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${token}&user=${JSON.stringify({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role
      })}`;

      logger.info('Apple OAuth successful', {
        userId: user._id,
        email: user.email
      });

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Apple OAuth callback failed', { error: error.message });
      res.redirect('/login?error=callback_failed');
    }
  }
);

// Get current OAuth connections
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const info = await oauthService.getOAuthInfo(req.user._id);

    res.json({
      success: true,
      data: info,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('OAuth connections retrieval failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Disconnect OAuth provider
router.post('/disconnect/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;

    // Validate provider
    if (!['google', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    await oauthService.disconnectOAuth(req.user._id, provider);

    res.json({
      success: true,
      message: `${provider} disconnected successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('OAuth disconnect failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
