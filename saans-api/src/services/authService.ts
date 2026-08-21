import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient as PrismaClientImport } from '@prisma/client';
import { generateTokenPair, verifyTokenHash, isTokenExpired, getTokenErrorMessage } from '../utils/tokenUtils.js';
import emailService from './emailService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClientImport();

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'THERAPIST' | 'ADMIN';
  city?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    city?: string;
    twoFactorEnabled?: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Generate JWT tokens
  private generateTokens(userId: string) {
    // @ts-ignore - JWT type mismatch
    const accessToken = jwt.sign(
      { userId },
      (process.env.JWT_SECRET || 'your-secret-key') as string,
      { expiresIn: process.env.JWT_EXPIRY || '15m' },
    );

    // @ts-ignore - JWT type mismatch
    const refreshToken = jwt.sign(
      { userId },
      (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret') as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' },
    );

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate email
    if (!input.email || !input.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!input.password || input.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(input.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || 'PATIENT',
        city: input.city,
        isVerified: false,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.city,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Login user
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Verify token
  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
      };
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
    // @ts-ignore - JWT type mismatch with environment variables

        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      ) as { userId: string };

      // @ts-ignore - JWT type mismatch
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        (process.env.JWT_SECRET || 'your-secret-key') as string,
        { expiresIn: process.env.JWT_EXPIRY || '15m' },
      );

      return { accessToken };
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Get user by ID
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        bio: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  async updateProfile(
    userId: string,
    data: { name?: string; bio?: string; phoneNumber?: string },
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        phoneNumber: true,
      },
    });

    return user;
  }

  // Change password
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send password changed email
    try {
      await emailService.sendPasswordChangedEmail(user.email);
    } catch (error) {
      logger.warn('Failed to send password changed email', error);
      // Don't fail the request if email fails
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Request password reset
   * Generates a secure token and sends reset email
   */
  async requestPasswordReset(email: string, frontendUrl: string): Promise<{ message: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Security: Don't reveal if email exists (prevents user enumeration)
      return { message: 'If an account exists with that email, a password reset link has been sent.' };
    }

    // Generate secure token pair
    const { token, hashedToken, expiryDate } = generateTokenPair();

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: expiryDate,
      },
    });

    // Build reset link
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email with reset link
    try {
      await emailService.sendPasswordResetEmail(email, resetLink);
      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Failed to send password reset email', error);
      // Clear the token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });
      throw new Error('Failed to send reset email. Please try again later.');
    }

    return { message: 'If an account exists with that email, a password reset link has been sent.' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Security: Use generic message
      throw new Error(getTokenErrorMessage());
    }

    // Check if reset token exists
    if (!user.passwordResetToken || !user.passwordResetExpiry) {
      throw new Error(getTokenErrorMessage());
    }

    // Check if token has expired
    if (isTokenExpired(user.passwordResetExpiry)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });
      throw new Error('Reset token has expired. Please request a new one.');
    }

    // Verify token (timing-safe comparison)
    try {
      if (!verifyTokenHash(token, user.passwordResetToken)) {
        throw new Error(getTokenErrorMessage());
      }
    } catch (error: any) {
      if (error.message === getTokenErrorMessage()) {
        throw error;
      }
      throw new Error(getTokenErrorMessage());
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(email);
    } catch (error) {
      logger.warn('Failed to send password changed confirmation email', error);
    }

    logger.info('Password reset successfully', { email });
    return { message: 'Password has been reset successfully' };
  }

  /**
   * Send email verification link
   */
  async sendEmailVerification(email: string, frontendUrl: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Already verified
    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    // Generate secure token pair
    const { token, hashedToken, expiryDate } = generateTokenPair();

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiryDate,
        emailVerificationSentAt: new Date(),
      },
    });

    // Build verification link
    const verificationLink = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationLink);
      logger.info('Verification email sent', { email });
    } catch (error) {
      logger.error('Failed to send verification email', error);
      // Clear the token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });
      throw new Error('Failed to send verification email. Please try again later.');
    }

    return { message: 'Verification email has been sent' };
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string, email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(getTokenErrorMessage());
    }

    // Already verified
    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    // Check if verification token exists
    if (!user.emailVerificationToken || !user.emailVerificationExpiry) {
      throw new Error(getTokenErrorMessage());
    }

    // Check if token has expired
    if (isTokenExpired(user.emailVerificationExpiry)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });
      throw new Error('Verification token has expired. Please request a new one.');
    }

    // Verify token (timing-safe comparison)
    try {
      if (!verifyTokenHash(token, user.emailVerificationToken)) {
        throw new Error(getTokenErrorMessage());
      }
    } catch (error: any) {
      if (error.message === getTokenErrorMessage()) {
        throw error;
      }
      throw new Error(getTokenErrorMessage());
    }

    // Update user: mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, user.name);
    } catch (error) {
      logger.warn('Failed to send welcome email', error);
    }

    logger.info('Email verified successfully', { email });
    return { message: 'Email has been verified successfully' };
  }

  /**
   * Generate refresh token rotation (for enhanced security)
   * This can be used to invalidate old refresh tokens
   */
  async rotateRefreshToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

export default new AuthService();
