// @ts-nocheck

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { PrismaClient as PrismaClientImport } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClientImport();

interface QRCodeResult {
  qrCode: string;
  secret: string;
  manualEntryKey: string;
}

interface SessionTokenResult {
  sessionToken: string;
  expiresAt: Date;
}

interface BackupCode {
  code: string;
  isUsed: boolean;
  usedAt: Date | null;
}

export class TwoFactorService {
  /**
   * Generate TOTP secret and QR code for 2FA setup
   */
  async generateQRCode(userId: string, userEmail: string): Promise<QRCodeResult> {
    try {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `SAANS (${userEmail})`,
        issuer: 'SAANS Mental Health Platform',
        length: 32,
      });

      if (!secret.otpauth_url) {
        throw new Error('Failed to generate TOTP secret');
      }

      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        qrCode,
        secret: secret.base32,
        manualEntryKey: secret.base32,
      };
    } catch (error) {
      logger.error('Failed to generate QR code', error);
      throw new Error('Failed to generate 2FA QR code');
    }
  }

  /**
   * Verify TOTP token with secret
   */
  verifyTOTP(secret: string, token: string): boolean {
    try {
      // Verify token with 30-second window (current, previous, and next)
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
      });

      return verified;
    } catch (error) {
      logger.error('TOTP verification failed', error);
      return false;
    }
  }

  /**
   * Generate 10 backup codes for account recovery
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric code in format XXXX-XXXX
      const code = this.generateRandomCode();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Setup 2FA for a user
   * Stores the secret and generates backup codes
   */
  async setup2FA(userId: string, secret: string): Promise<{ backupCodes: string[] }> {
    try {
      const backupCodes = this.generateBackupCodes();

      // Store secret in user profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret,
        },
      });

      // Store backup codes
      for (const code of backupCodes) {
        await prisma.twoFactorBackupCode.create({
          data: {
            userId,
            code: code.toUpperCase(),
          },
        });
      }

      logger.info('2FA setup started', { userId });

      return { backupCodes };
    } catch (error) {
      logger.error('Failed to setup 2FA', error);
      throw new Error('Failed to setup 2FA');
    }
  }

  /**
   * Verify 2FA setup with TOTP token and enable 2FA
   */
  async verifySetup(userId: string, token: string): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true,
        },
      });

      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA setup not initiated for this user');
      }

      if (user.twoFactorEnabled) {
        throw new Error('2FA is already enabled for this user');
      }

      // Verify TOTP token
      if (!this.verifyTOTP(user.twoFactorSecret, token)) {
        throw new Error('Invalid 2FA verification code');
      }

      // Enable 2FA
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
        },
      });

      logger.info('2FA enabled successfully', { userId });

      return { message: '2FA has been enabled successfully' };
    } catch (error: any) {
      logger.error('2FA verification failed', error);
      throw error;
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string): Promise<{ message: string }> {
    try {
      // Delete all backup codes
      await prisma.twoFactorBackupCode.deleteMany({
        where: { userId },
      });

      // Delete active sessions
      await prisma.twoFactorSession.deleteMany({
        where: { userId },
      });

      // Disable 2FA and clear secret
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      logger.info('2FA disabled successfully', { userId });

      return { message: '2FA has been disabled successfully' };
    } catch (error) {
      logger.error('Failed to disable 2FA', error);
      throw new Error('Failed to disable 2FA');
    }
  }

  /**
   * Create a temporary 2FA session token
   * Used during login when 2FA is required
   */
  async createSessionToken(userId: string): Promise<SessionTokenResult> {
    try {
      // Generate random session token (32 bytes, hex-encoded)
      const sessionToken = this.generateRandomToken();

      // Set expiration to 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store session token in database
      await prisma.twoFactorSession.create({
        data: {
          userId,
          sessionToken,
          expiresAt,
        },
      });

      logger.debug('2FA session token created', { userId, expiresAt });

      return {
        sessionToken,
        expiresAt,
      };
    } catch (error) {
      logger.error('Failed to create 2FA session token', error);
      throw new Error('Failed to create 2FA session');
    }
  }

  /**
   * Verify 2FA login with TOTP token or backup code
   */
  async verifyLogin(
    userId: string,
    sessionToken: string,
    totpToken: string,
    useBackupCode: boolean = false
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      // Verify session token exists and is not expired
      const session = await prisma.twoFactorSession.findUnique({
        where: { sessionToken },
      });

      if (!session || session.userId !== userId) {
        return {
          isValid: false,
          message: 'Invalid or expired 2FA session',
        };
      }

      if (new Date() > session.expiresAt) {
        // Clean up expired session
        await prisma.twoFactorSession.delete({
          where: { id: session.id },
        });
        return {
          isValid: false,
          message: '2FA session expired',
        };
      }

      if (session.isUsed) {
        return {
          isValid: false,
          message: '2FA session already used',
        };
      }

      // Get user with 2FA secret
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true,
        },
      });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return {
          isValid: false,
          message: '2FA not enabled for this user',
        };
      }

      let isValid = false;

      if (useBackupCode) {
        // Verify backup code
        isValid = await this.validateBackupCode(userId, totpToken);
      } else {
        // Verify TOTP token
        isValid = this.verifyTOTP(user.twoFactorSecret, totpToken);
      }

      if (!isValid) {
        return {
          isValid: false,
          message: 'Invalid 2FA verification code',
        };
      }

      // Mark session as used
      await prisma.twoFactorSession.update({
        where: { id: session.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      logger.info('2FA login verified successfully', {
        userId,
        useBackupCode,
      });

      return {
        isValid: true,
        message: '2FA verification successful',
      };
    } catch (error) {
      logger.error('2FA login verification failed', error);
      return {
        isValid: false,
        message: 'Failed to verify 2FA code',
      };
    }
  }

  /**
   * Validate and consume a backup code
   */
  async validateBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const backupCode = await prisma.twoFactorBackupCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!backupCode || backupCode.userId !== userId || backupCode.isUsed) {
        return false;
      }

      // Mark backup code as used
      await prisma.twoFactorBackupCode.update({
        where: { id: backupCode.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      logger.info('Backup code used for 2FA', { userId });

      return true;
    } catch (error) {
      logger.error('Backup code validation failed', error);
      return false;
    }
  }

  /**
   * Get list of remaining backup codes (excluding used ones)
   */
  async getRemainingBackupCodes(userId: string): Promise<number> {
    try {
      const count = await prisma.twoFactorBackupCode.count({
        where: {
          userId,
          isUsed: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Failed to get backup codes count', error);
      return 0;
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<{ backupCodes: string[] }> {
    try {
      // Delete existing backup codes
      await prisma.twoFactorBackupCode.deleteMany({
        where: { userId },
      });

      // Generate new backup codes
      const backupCodes = this.generateBackupCodes();

      // Store new backup codes
      for (const code of backupCodes) {
        await prisma.twoFactorBackupCode.create({
          data: {
            userId,
            code: code.toUpperCase(),
          },
        });
      }

      logger.info('Backup codes regenerated', { userId });

      return { backupCodes };
    } catch (error) {
      logger.error('Failed to regenerate backup codes', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }

  /**
   * Get 2FA status for a user
   */
  async get2FAStatus(userId: string): Promise<{
    enabled: boolean;
    remainingBackupCodes: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const remainingBackupCodes = await this.getRemainingBackupCodes(userId);

      return {
        enabled: user.twoFactorEnabled,
        remainingBackupCodes,
      };
    } catch (error) {
      logger.error('Failed to get 2FA status', error);
      throw error;
    }
  }

  /**
   * Clean up expired 2FA sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.twoFactorSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        logger.info('Cleaned up expired 2FA sessions', { count: result.count });
      }

      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error);
      return 0;
    }
  }

  /**
   * Generate a random token for 2FA session
   */
  private generateRandomToken(): string {
    const bytes = new Uint8Array(32);
    if (typeof window === 'undefined') {
      // Node.js environment - crypto already imported at top
      return randomBytes(32).toString('hex');
    } else {
      // Browser environment (fallback)
      crypto.getRandomValues(bytes);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }
}

export default new TwoFactorService();
