import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3000';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_for_testing_purposes';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log = {
  title: () => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`),
  h1: (text) => console.log(`\n${colors.bright}${colors.blue}╔ ${text} ╔${colors.reset}`),
  h2: (text) => console.log(`\n${colors.bright}${colors.green}▶ ${text}${colors.reset}`),
  success: (text) => console.log(`  ${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`  ${colors.red}✗ ${text}${colors.reset}`),
  warn: (text) => console.log(`  ${colors.yellow}⚠ ${text}${colors.reset}`),
  info: (text) => console.log(`  ${colors.cyan}ℹ ${text}${colors.reset}`),
};

const testResults = [];
let userId = '';
let accessToken = '';

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

const generateValidSignature = (orderId, paymentId) => {
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
};

const makeAuthRequest = async (method, path, data = null, token = accessToken) => {
  const config = {
    method,
    url: `${API_BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message,
    };
  }
};

const addTestResult = (testName, passed, details = '') => {
  testResults.push({
    testName,
    passed,
    details,
  });
};

async function setupTestUser() {
  try {
    const testUserId = crypto.randomUUID();
    const hashedPassword = await bcryptjs.hash('TestPassword123!', 10);

    await prisma.user.create({
      data: {
        id: testUserId,
        email: `payment-verify-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Payment Verify Test User',
        role: 'PATIENT',
        isPremium: false,
        isVerified: true,
      },
    });

    userId = testUserId;
    accessToken = generateJWT(testUserId);

    log.success(`Test user created and authenticated`);
    return true;
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    return false;
  }
}

async function createMockOrder(planType = 'BASIC') {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return orderId;
}

// ===== TEST CASES =====

async function test1_ValidSignatureValidData() {
  log.h2('TEST 1: Valid Signature + Valid Data');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'BASIC',
    });

    if (response.success && response.status === 200) {
      log.success('Payment verified successfully');
      log.info(`Subscription activated: ${response.data.data.type}`);
      addTestResult('TEST 1: Valid Signature + Valid Data', true);
      return true;
    } else {
      log.error(`Got response: ${response.status}`);
      log.info(`Message: ${response.data?.message}`);
      addTestResult('TEST 1: Valid Signature + Valid Data', response.success, `Status: ${response.status}`);
      return response.success;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 1: Valid Signature + Valid Data', false, error.message);
    return false;
  }
}

async function test2_ValidSignatureMissingPlanType() {
  log.h2('TEST 2: Valid Signature + Missing planType');
  try {
    const orderId = await createMockOrder('PREMIUM');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected due to missing planType');
      addTestResult('TEST 2: Valid Signature + Missing planType', true);
      return true;
    } else {
      log.error(`Should have returned 400 error. Got: ${response.status}`);
      addTestResult('TEST 2: Valid Signature + Missing planType', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 2: Valid Signature + Missing planType', false, error.message);
    return false;
  }
}

async function test3_InvalidSignature() {
  log.h2('TEST 3: Invalid Signature + Valid Data');
  try {
    const orderId = await createMockOrder('PREMIUM');
    const paymentId = `pay_${Date.now()}`;
    const invalidSignature = 'invalid_signature_' + crypto.randomBytes(16).toString('hex');

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: invalidSignature,
      planType: 'PREMIUM',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected invalid signature');
      log.info(`Error: ${response.data.message}`);
      addTestResult('TEST 3: Invalid Signature + Valid Data', true);
      return true;
    } else {
      log.error(`Should have rejected invalid signature. Got status: ${response.status}`);
      addTestResult('TEST 3: Invalid Signature + Valid Data', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 3: Invalid Signature + Valid Data', false, error.message);
    return false;
  }
}

async function test4_MissingOrderId() {
  log.h2('TEST 4: Missing razorpay_order_id');
  try {
    const paymentId = `pay_${Date.now()}`;
    const fakeOrderId = 'fake_order_id';
    const validSignature = generateValidSignature(fakeOrderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'BASIC',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected due to missing order ID');
      addTestResult('TEST 4: Missing razorpay_order_id', true);
      return true;
    } else {
      log.error(`Should have returned 400 error. Got: ${response.status}`);
      addTestResult('TEST 4: Missing razorpay_order_id', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 4: Missing razorpay_order_id', false, error.message);
    return false;
  }
}

async function test5_IdempotencySamePayment() {
  log.h2('TEST 5: Idempotency - Verify Same Payment Twice');
  try {
    const orderId = await createMockOrder('PLUS');
    const paymentId = `pay_idempotent_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response1 = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'PLUS',
    });

    if (!response1.success) {
      log.error('First verification failed');
      addTestResult('TEST 5: Idempotency - Same Payment', false, 'First verification failed');
      return false;
    }

    log.success('First verification succeeded');

    const response2 = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'PLUS',
    });

    const payments = await prisma.payment.findMany({
      where: {
        userId,
        transactionId: paymentId,
      },
    });

    log.info(`Payment records found: ${payments.length}`);

    if (payments.length === 1) {
      log.success('No duplicate charge created (idempotent behavior)');
      addTestResult('TEST 5: Idempotency - Same Payment', true, 'Single charge recorded');
      return true;
    } else if (payments.length > 1) {
      log.error(`DUPLICATE CHARGE BUG: ${payments.length} charges recorded for same payment!`);
      addTestResult('TEST 5: Idempotency - Same Payment', false, `Found ${payments.length} charges (DUPLICATE DETECTED)`);
      return false;
    } else {
      log.warn('No charges recorded at all');
      addTestResult('TEST 5: Idempotency - Same Payment', false, 'No charges recorded');
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 5: Idempotency - Same Payment', false, error.message);
    return false;
  }
}

async function test6_InvalidPlanType() {
  log.h2('TEST 6: Valid Signature + Invalid planType');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'INVALID_PLAN',
    });

    if (!response.success) {
      log.success('Correctly rejected invalid plan type');
      addTestResult('TEST 6: Valid Signature + Invalid planType', true);
      return true;
    } else {
      log.error(`Should have rejected invalid plan. Got status: ${response.status}`);
      addTestResult('TEST 6: Valid Signature + Invalid planType', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 6: Valid Signature + Invalid planType', false, error.message);
    return false;
  }
}

async function test7_TamperedOrderId() {
  log.h2('TEST 7: Signature Mismatch - Tampered Order ID');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const tamperedOrderId = orderId + '_tampered';

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: tamperedOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'BASIC',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected tampered order ID');
      addTestResult('TEST 7: Tampered Order ID', true);
      return true;
    } else {
      log.error(`Should have rejected tampered data. Got status: ${response.status}`);
      addTestResult('TEST 7: Tampered Order ID', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 7: Tampered Order ID', false, error.message);
    return false;
  }
}

async function test8_TamperedPaymentId() {
  log.h2('TEST 8: Signature Mismatch - Tampered Payment ID');
  try {
    const orderId = await createMockOrder('PREMIUM');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const tamperedPaymentId = paymentId + '_tampered';

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: tamperedPaymentId,
      razorpay_signature: validSignature,
      planType: 'PREMIUM',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected tampered payment ID');
      addTestResult('TEST 8: Tampered Payment ID', true);
      return true;
    } else {
      log.error(`Should have rejected tampered data. Got status: ${response.status}`);
      addTestResult('TEST 8: Tampered Payment ID', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 8: Tampered Payment ID', false, error.message);
    return false;
  }
}

async function test9_UnauthenticatedRequest() {
  log.h2('TEST 9: Unauthenticated Request');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest(
      'POST',
      '/api/payments/verify-payment',
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        planType: 'BASIC',
      },
      null
    );

    if (!response.success && response.status === 401) {
      log.success('Correctly rejected unauthenticated request');
      addTestResult('TEST 9: Unauthenticated Request', true);
      return true;
    } else {
      log.error(`Should have returned 401 error. Got: ${response.status}`);
      addTestResult('TEST 9: Unauthenticated Request', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 9: Unauthenticated Request', false, error.message);
    return false;
  }
}

async function test10_DatabaseConsistency() {
  log.h2('TEST 10: Database Consistency After Verification');
  try {
    const orderId = await createMockOrder('PREMIUM');
    const paymentId = `pay_verify_db_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      planType: 'PREMIUM',
    });

    if (!response.success) {
      log.error('Verification failed');
      addTestResult('TEST 10: Database Consistency', false, 'Verification failed');
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true, payments: true },
    });

    const subscriptionExists = user?.subscription && user.subscription.type === 'PREMIUM';
    const paymentRecorded = user?.payments?.some(p => p.transactionId === paymentId);
    const userPremiumStatus = user?.isPremium === true;

    if (subscriptionExists && paymentRecorded && userPremiumStatus) {
      log.success('All database records created correctly');
      log.info(`Subscription Type: ${user.subscription.type}`);
      log.info(`User isPremium: ${user.isPremium}`);
      addTestResult('TEST 10: Database Consistency', true);
      return true;
    } else {
      const issues = [];
      if (!subscriptionExists) issues.push('Subscription not created');
      if (!paymentRecorded) issues.push('Payment not recorded');
      if (!userPremiumStatus) issues.push('User not marked as premium');
      log.error(`Inconsistencies: ${issues.join(', ')}`);
      addTestResult('TEST 10: Database Consistency', false, issues.join(', '));
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 10: Database Consistency', false, error.message);
    return false;
  }
}

async function test11_MissingPaymentId() {
  log.h2('TEST 11: Missing razorpay_payment_id');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;
    const validSignature = generateValidSignature(orderId, paymentId);

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_signature: validSignature,
      planType: 'BASIC',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected due to missing payment ID');
      addTestResult('TEST 11: Missing razorpay_payment_id', true);
      return true;
    } else {
      log.error(`Should have returned 400 error. Got: ${response.status}`);
      addTestResult('TEST 11: Missing razorpay_payment_id', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 11: Missing razorpay_payment_id', false, error.message);
    return false;
  }
}

async function test12_MissingSignature() {
  log.h2('TEST 12: Missing razorpay_signature');
  try {
    const orderId = await createMockOrder('BASIC');
    const paymentId = `pay_${Date.now()}`;

    const response = await makeAuthRequest('POST', '/api/payments/verify-payment', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      planType: 'BASIC',
    });

    if (!response.success && response.status === 400) {
      log.success('Correctly rejected due to missing signature');
      addTestResult('TEST 12: Missing razorpay_signature', true);
      return true;
    } else {
      log.error(`Should have returned 400 error. Got: ${response.status}`);
      addTestResult('TEST 12: Missing razorpay_signature', false, `Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    addTestResult('TEST 12: Missing razorpay_signature', false, error.message);
    return false;
  }
}

async function generateReport() {
  log.title();
  log.h1('TEST EXECUTION SUMMARY');

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`\n${colors.bright}Results: ${passed}/${total} PASSED (${percentage}%)${colors.reset}\n`);

  testResults.forEach((result) => {
    const status = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${status} ${result.testName}`);
    if (result.details) {
      console.log(`  ${colors.cyan}→ ${result.details}${colors.reset}`);
    }
  });

  log.title();
  if (failed > 0) {
    log.h1('BUGS IDENTIFIED');
    const failedTests = testResults.filter(r => !r.passed);
    failedTests.forEach((test, i) => {
      console.log(`\n${i + 1}. ${test.testName}`);
      console.log(`   Issue: ${test.details}`);
    });
  } else {
    log.success('All tests passed!');
  }

  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

async function runTests() {
  log.h1('POST /api/payments/verify - COMPREHENSIVE TEST SUITE');
  log.info(`Testing endpoint: ${API_BASE_URL}/api/payments/verify-payment`);

  try {
    log.h2('Setup: Creating Test User');
    if (!(await setupTestUser())) {
      throw new Error('User setup failed');
    }

    log.h2('Running 12 Payment Verification Tests');
    await test1_ValidSignatureValidData();
    await test2_ValidSignatureMissingPlanType();
    await test3_InvalidSignature();
    await test4_MissingOrderId();
    await test5_IdempotencySamePayment();
    await test6_InvalidPlanType();
    await test7_TamperedOrderId();
    await test8_TamperedPaymentId();
    await test9_UnauthenticatedRequest();
    await test10_DatabaseConsistency();
    await test11_MissingPaymentId();
    await test12_MissingSignature();

    await generateReport();

    process.exit(0);
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
