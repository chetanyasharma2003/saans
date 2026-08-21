/**
 * Password Reset and Email Verification Tests
 * Tests for new authentication features
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js';
import authService from '../services/authService.js';
import { generateTokenPair, isTokenExpired } from '../utils/tokenUtils.js';

const prisma = new PrismaClient();

describe('Password Reset and Email Verification', () => {
  const testUser = {
    email: 'test-reset@saans.app',
    password: 'TestPassword123',
    name: 'Test User',
  };

  beforeAll(async () => {
    // Clean up test user if exists
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  describe('Email Verification Flow', () => {
    test('should register user and send verification email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      // Check that verification token was created
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user?.emailVerificationToken).toBeTruthy();
      expect(user?.emailVerificationExpiry).toBeTruthy();
      expect(user?.emailVerified).toBe(false);
    });

    test('should verify email with valid token', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (!user?.emailVerificationToken) {
        throw new Error('No verification token found');
      }

      // Get the raw token from DB (we need to simulate what would be sent to user)
      // In real scenario, the token would be generated and sent via email
      const { token, hashedToken, expiryDate } = generateTokenPair();

      // Update test user with a valid token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: hashedToken,
          emailVerificationExpiry: expiryDate,
        },
      });

      // Verify email
      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({
          token,
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Check user is now verified
      const updatedUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(updatedUser?.emailVerified).toBe(true);
      expect(updatedUser?.isVerified).toBe(true);
      expect(updatedUser?.emailVerificationToken).toBeNull();
    });

    test('should reject invalid verification token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({
          token: 'invalid-token',
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should reject expired verification token', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (!user) throw new Error('User not found');

      const { hashedToken } = generateTokenPair();
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: hashedToken,
          emailVerificationExpiry: expiredDate,
        },
      });

      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({
          token: 'some-token',
          email: testUser.email,
        })
        .expect(410); // Gone (token expired)

      expect(response.body.message).toContain('expired');
    });

    test('should resend verification email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user?.emailVerificationSentAt).toBeTruthy();
    });
  });

  describe('Password Reset Flow', () => {
    const resetUser = {
      email: 'test-password-reset@saans.app',
      password: 'OldPassword123',
      name: 'Reset Test User',
    };

    beforeAll(async () => {
      await prisma.user.deleteMany({
        where: { email: resetUser.email },
      });

      // Create test user for password reset
      await prisma.user.create({
        data: {
          email: resetUser.email,
          password: '$2a$10$abcdefghijklmnopqrstuvwxyz', // dummy hashed password
          name: resetUser.name,
          emailVerified: true,
          isVerified: true,
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: resetUser.email },
      });
    });

    test('should request password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: resetUser.email,
        })
        .expect(200);

      expect(response.body.message).toContain('password reset');

      // Check that reset token was created
      const user = await prisma.user.findUnique({
        where: { email: resetUser.email },
      });

      expect(user?.passwordResetToken).toBeTruthy();
      expect(user?.passwordResetExpiry).toBeTruthy();
    });

    test('should reset password with valid token', async () => {
      const user = await prisma.user.findUnique({
        where: { email: resetUser.email },
      });

      if (!user) throw new Error('User not found');

      const { token, hashedToken, expiryDate } = generateTokenPair();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpiry: expiryDate,
        },
      });

      const newPassword = 'NewPassword123';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          email: resetUser.email,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200);

      expect(response.body.message).toContain('successfully');

      // Check that reset token was cleared
      const updatedUser = await prisma.user.findUnique({
        where: { email: resetUser.email },
      });

      expect(updatedUser?.passwordResetToken).toBeNull();
      expect(updatedUser?.passwordResetExpiry).toBeNull();
    });

    test('should reject mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          email: resetUser.email,
          newPassword: 'NewPassword123',
          confirmPassword: 'DifferentPassword123',
        })
        .expect(400);

      expect(response.body.message).toContain('do not match');
    });

    test('should reject short passwords', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          email: resetUser.email,
          newPassword: 'short',
          confirmPassword: 'short',
        })
        .expect(400);

      expect(response.body.message).toContain('at least 6 characters');
    });

    test('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          email: resetUser.email,
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid');
    });

    test('should not reveal if user exists', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent-user@saans.app',
        })
        .expect(200);

      expect(response.body.message).toContain('password reset');
    });
  });

  describe('Security Features', () => {
    test('token hashing should prevent token leakage from DB', async () => {
      const { token, hashedToken } = generateTokenPair();

      // Hashed token should not equal raw token
      expect(hashedToken).not.toBe(token);

      // Token should be hex string of expected length
      expect(token).toMatch(/^[a-f0-9]+$/);
      expect(token.length).toBeGreaterThan(30);
    });

    test('tokens should expire after 24 hours', async () => {
      const { expiryDate } = generateTokenPair();

      // Should not be expired immediately
      expect(isTokenExpired(expiryDate)).toBe(false);

      // But should be expired in the future
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      expect(isTokenExpired(pastDate)).toBe(true);
    });
  });
});
