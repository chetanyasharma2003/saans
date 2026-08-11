import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const generateJWT = (userId) => {
  const payload = {
    userId,
    email: `test-${userId}@test.com`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const encodeBase64Url = (str) => {
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

  return `${header}.${payloadStr}.${signature}`;
};

const makeRequest = async (method, path, data = null, token = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': `test-${Date.now()}`,
    },
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.error('ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message,
    };
  }
};

async function test() {
  try {
    // Create test user
    const testUserId = crypto.randomUUID();
    const hashedPassword = await bcryptjs.hash('TestPassword123!', 10);

    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `payment-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Test User',
        role: 'PATIENT',
        isPremium: false,
        isVerified: true,
      },
    });

    const token = generateJWT(testUserId);

    console.log('User created:', testUserId);
    console.log('Token generated\n');

    // Test 1: Create order
    console.log('TEST: Creating order...');
    const orderResponse = await makeRequest('POST', '/api/payments/create-order', { planType: 'BASIC' }, token);
    console.log('Order response status:', orderResponse.status);
    console.log('Order response data:', JSON.stringify(orderResponse.data, null, 2));

    if (!orderResponse.success) {
      console.error('Order creation failed. Stopping tests.');
      process.exit(1);
    }

    const orderId = orderResponse.data.data.orderId;

    // Test 2: Verify with valid signature
    console.log('\n\nTEST: Verifying payment with valid signature...');
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret_value';
    const paymentId = `pay_${Date.now()}`;
    const signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verifyResponse = await makeRequest(
      'POST',
      '/api/payments/verify-payment',
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        planType: 'BASIC',
      },
      token
    );

    console.log('Verify response status:', verifyResponse.status);
    console.log('Verify response data:', JSON.stringify(verifyResponse.data, null, 2));

    // Test 3: Verify with invalid signature
    console.log('\n\nTEST: Verifying payment with invalid signature...');
    const invalidSig = 'invalid_signature_' + crypto.randomBytes(16).toString('hex');

    const invalidResponse = await makeRequest(
      'POST',
      '/api/payments/verify-payment',
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: invalidSig,
        planType: 'BASIC',
      },
      token
    );

    console.log('Invalid signature response status:', invalidResponse.status);
    console.log('Invalid signature response data:', JSON.stringify(invalidResponse.data, null, 2));

    // Test 4: Missing fields
    console.log('\n\nTEST: Verifying with missing planType...');
    const missingFieldResponse = await makeRequest(
      'POST',
      '/api/payments/verify-payment',
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        // planType missing
      },
      token
    );

    console.log('Missing field response status:', missingFieldResponse.status);
    console.log('Missing field response data:', JSON.stringify(missingFieldResponse.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
