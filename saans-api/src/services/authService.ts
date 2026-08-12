import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient as PrismaClientImport } from '@prisma/client';

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

    return { message: 'Password changed successfully' };
  }
}

export default new AuthService();
