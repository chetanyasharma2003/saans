const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const oauthService = require('../services/oauthService');
const logger = require('../utils/logger');

let AppleStrategy = null;
try {
  AppleStrategy = require('passport-apple').Strategy;
} catch (e) {
  logger.warn('passport-apple not installed - Apple OAuth disabled for MVP');
}

/**
 * Passport.js Configuration
 * Local, Google, and Apple strategies
 */

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ============ LOCAL STRATEGY ============

passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        logger.warn('Local login failed: user not found', { email });
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        logger.warn('Local login failed: invalid password', { email });
        return done(null, false, { message: 'Invalid email or password' });
      }

      logger.info('Local login successful', { userId: user._id, email });
      return done(null, user);
    } catch (error) {
      logger.error('Local strategy error', { error: error.message });
      return done(error);
    }
  }
));

// ============ GOOGLE STRATEGY ============

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3001'}/api/oauth/google/callback`,
      accessType: 'offline',
      prompt: 'consent'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await oauthService.handleGoogleAuth(profile);
        logger.info('Google OAuth verified', { userId: user._id });
        return done(null, user);
      } catch (error) {
        logger.error('Google strategy error', { error: error.message });
        return done(error);
      }
    }
  ));
} else {
  logger.warn('Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// ============ APPLE STRATEGY ============

if (AppleStrategy && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY_PATH) {
  passport.use('apple', new AppleStrategy(
    {
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, idToken, user, done) => {
      try {
        // Apple returns user data in idToken
        const profile = {
          id: user.id || user.sub,
          displayName: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim() || 'User',
          emails: [{ value: user.email }]
        };

        const userData = await oauthService.handleAppleAuth(profile);
        logger.info('Apple OAuth verified', { userId: userData._id });
        return done(null, userData);
      } catch (error) {
        logger.error('Apple strategy error', { error: error.message });
        return done(error);
      }
    }
  ));
} else {
  logger.warn('Apple OAuth not configured (missing APPLE_TEAM_ID, APPLE_KEY_ID, or APPLE_PRIVATE_KEY_PATH)');
}

module.exports = passport;
