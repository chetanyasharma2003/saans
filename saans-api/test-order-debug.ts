import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function test() {
  try {
    // Create test user
    const testUserId = crypto.randomUUID();
    const testEmail = `test-order-${Date.now()}@test.com`;
    const hashedPassword = await bcryptjs.hash('TestPass123!', 10);

    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'PATIENT',
        isPremium: false,
        isVerified: true,
      },
    });

    console.log('User created:', user.id);

    // Create JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const payload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    const encodeBase64Url = (str: string) => {
      return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadStr = encodeBase64Url(JSON.stringify(payload));
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payloadStr}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const accessToken = `${header}.${payloadStr}.${signature}`;
    console.log('Token created');

    // Try to create order
    try {
      const response = await axios.post('http://localhost:3000/api/payments/create-order', 
        { planType: 'BASIC' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': `test-${Date.now()}`,
          },
        }
      );
      console.log('Order created successfully:', response.data);
    } catch (error: any) {
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message || error.response?.data?.error);
      console.log('Full error data:', JSON.stringify(error.response?.data, null, 2));
    }
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
