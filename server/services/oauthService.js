const User = require('../models/User');
const auditLogService = require('./auditLogService');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * OAuth Service for Google and Apple authentication
 * Handles social login and user provisioning
 */

class OAuthService {
  // Handle Google OAuth callback
  async handleGoogleAuth(profile, ip = '') {
    try {
      const { id, displayName, emails, photos } = profile;

      if (!emails || emails.length === 0) {
        throw new Error('No email provided by Google');
      }

      const email = emails[0].value;
      const firstName = displayName?.split(' ')[0] || 'User';
      const lastName = displayName?.split(' ').slice(1).join(' ') || '';
      const avatar = photos?.[0]?.value || null;

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user
        user = await User.create({
          firstName,
          lastName,
          email,
          avatar,
          role: 'patient',
          oauthProvider: 'google',
          oauthId: id,
          isVerified: true // Google users are pre-verified
        });

        logger.info('New user created via Google OAuth', {
          userId: user._id,
          email
        });

        // Log authentication
        await auditLogService.logAuthAttempt(email, true, 'Google OAuth', ip, 'OAuth');
      } else {
        // Update existing user with OAuth info
        if (!user.oauthProvider) {
          user.oauthProvider = 'google';
          user.oauthId = id;
          await user.save();

          logger.info('User linked to Google OAuth', {
            userId: user._id,
            email
          });
        }

        // Log authentication
        await auditLogService.logAuthAttempt(email, true, 'Google OAuth login', ip, 'OAuth');
      }

      return user;
    } catch (error) {
      logger.error('Google OAuth handling failed', { error: error.message });
      throw error;
    }
  }

  // Handle Apple OAuth callback
  async handleAppleAuth(profile, ip = '') {
    try {
      const { id, displayName, emails, identities } = profile;

      if (!emails || emails.length === 0) {
        throw new Error('No email provided by Apple');
      }

      const email = emails[0].value;
      const firstName = displayName?.split(' ')[0] || 'User';
      const lastName = displayName?.split(' ').slice(1).join(' ') || '';

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user
        user = await User.create({
          firstName,
          lastName,
          email,
          role: 'patient',
          oauthProvider: 'apple',
          oauthId: id,
          isVerified: true // Apple users are pre-verified
        });

        logger.info('New user created via Apple OAuth', {
          userId: user._id,
          email
        });

        // Log authentication
        await auditLogService.logAuthAttempt(email, true, 'Apple OAuth', ip, 'OAuth');
      } else {
        // Update existing user with OAuth info
        if (!user.oauthProvider) {
          user.oauthProvider = 'apple';
          user.oauthId = id;
          await user.save();

          logger.info('User linked to Apple OAuth', {
            userId: user._id,
            email
          });
        }

        // Log authentication
        await auditLogService.logAuthAttempt(email, true, 'Apple OAuth login', ip, 'OAuth');
      }

      return user;
    } catch (error) {
      logger.error('Apple OAuth handling failed', { error: error.message });
      throw error;
    }
  }

  // Generate JWT token for OAuth user
  generateOAuthToken(user) {
    try {
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info('OAuth token generated', {
        userId: user._id
      });

      return token;
    } catch (error) {
      logger.error('OAuth token generation failed', { error: error.message });
      throw error;
    }
  }

  // Disconnect OAuth provider
  async disconnectOAuth(userId, provider) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          oauthProvider: null,
          oauthId: null
        },
        { new: true }
      );

      await auditLogService.logAdminAction(userId, 'DISCONNECT_OAUTH', userId, {
        provider
      });

      logger.info('OAuth provider disconnected', {
        userId,
        provider
      });

      return user;
    } catch (error) {
      logger.error('OAuth disconnect failed', { error: error.message });
      throw error;
    }
  }

  // Get OAuth user info
  async getOAuthInfo(userId) {
    try {
      const user = await User.findById(userId).select('oauthProvider oauthId email');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        provider: user.oauthProvider,
        connected: !!user.oauthProvider,
        email: user.email
      };
    } catch (error) {
      logger.error('OAuth info retrieval failed', { error: error.message });
      throw error;
    }
  }

  // Link additional OAuth provider
  async linkOAuthProvider(userId, provider, profile) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Don't allow linking if already linked to different provider
      if (user.oauthProvider && user.oauthProvider !== provider) {
        throw new Error(`User already linked to ${user.oauthProvider}`);
      }

      const id = profile.id || profile.sub;

      user.oauthProvider = provider;
      user.oauthId = id;

      await user.save();

      await auditLogService.logAdminAction(userId, 'LINK_OAUTH', userId, {
        provider
      });

      logger.info('OAuth provider linked', {
        userId,
        provider
      });

      return user;
    } catch (error) {
      logger.error('OAuth provider linking failed', { error: error.message });
      throw error;
    }
  }

  // Check if email is associated with OAuth
  async isEmailOAuthed(email) {
    try {
      const user = await User.findOne({
        email,
        oauthProvider: { $ne: null }
      });

      return !!user;
    } catch (error) {
      logger.error('OAuth email check failed', { error: error.message });
      return false;
    }
  }
}

module.exports = new OAuthService();
