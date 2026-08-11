import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const log = {
  title: () => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`),
  h1: (text) => console.log(`\n${colors.bright}${colors.magenta}╔ ${text}${colors.reset}`),
  h2: (text) => console.log(`\n${colors.bright}${colors.blue}▶ ${text}${colors.reset}`),
  success: (text) => console.log(`  ${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`  ${colors.red}✗ ${text}${colors.reset}`),
  warn: (text) => console.log(`  ${colors.yellow}⚠ ${text}${colors.reset}`),
  info: (text) => console.log(`  ${colors.cyan}ℹ ${text}${colors.reset}`),
  detail: (text) => console.log(`    ${colors.cyan}→ ${text}${colors.reset}`),
};

const testResults = [];
let testUserId = '';
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

const makeRequest = async (method, path, data = null, token = accessToken) => {
  const config = {
    method,
    url: `${API_BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    validateStatus: () => true, // Don't throw on any status
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message,
    };
  }
};

const recordTest = (testName, passed, details = '') => {
  testResults.push({
    name: testName,
    passed,
    details,
  });
  if (passed) {
    log.success(testName);
  } else {
    log.error(testName);
  }
  if (details) {
    log.detail(details);
  }
};

// ==================== TEST SETUP ====================

const setupTestUser = async () => {
  log.h2('Setting up test user');

  try {
    const testEmail = `test-create-order-${Date.now()}@test.com`;
    const hashedPassword = await bcryptjs.hash('TestPassword123!', 10);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Create Order User',
        isVerified: true,
      },
    });

    testUserId = user.id;
    accessToken = generateJWT(user.id);

    log.success(`Test user created: ${testEmail}`);
    log.detail(`User ID: ${user.id}`);
    return user.id;
  } catch (error) {
    log.error(`Failed to create test user: ${error.message}`);
    throw error;
  }
};

// ==================== TESTS ====================

const runTests = async () => {
  log.title();
  log.h1('POST /api/payments/create-order Comprehensive Test Suite');
  log.title();

  // ==================== 1. VALID REQUESTS ====================
  log.h2('1. Valid Requests');

  const validPlans = ['BASIC', 'PREMIUM', 'PLUS'];
  for (const plan of validPlans) {
    const response = await makeRequest('POST', '/api/payments/create-order', {
      planType: plan,
    });

    const passed =
      response.status === 201 &&
      response.data.success === true &&
      response.data.data.orderId &&
      response.data.data.amount &&
      response.data.data.planType === plan;

    recordTest(
      `Valid request with ${plan} plan`,
      passed,
      `Status: ${response.status}, Order ID: ${response.data.data?.orderId || 'N/A'}`
    );

    if (passed) {
      log.detail(`Amount: ₹${response.data.data.amount}, Currency: ${response.data.data.currency}`);
    } else {
      log.detail(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  }

  // ==================== 2. MISSING FIELDS ====================
  log.h2('2. Missing Fields');

  // Missing planType
  let response = await makeRequest('POST', '/api/payments/create-order', {});

  let passed = response.status === 400 && response.data.success === false;
  recordTest(
    'Missing planType field',
    passed,
    `Status: ${response.status}, Message: ${response.data.message || 'N/A'}`
  );

  // Empty planType
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: '',
  });

  passed = response.status === 400 && response.data.success === false;
  recordTest(
    'Empty planType field',
    passed,
    `Status: ${response.status}, Message: ${response.data.message || 'N/A'}`
  );

  // Null planType
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: null,
  });

  passed = response.status === 400 && response.data.success === false;
  recordTest(
    'Null planType field',
    passed,
    `Status: ${response.status}, Message: ${response.data.message || 'N/A'}`
  );

  // ==================== 3. INVALID PLANS ====================
  log.h2('3. Invalid Plan Types');

  const invalidPlans = ['INVALID', 'GOLD', 'DIAMOND', 'FREE', 'STANDARD', '123', 'null'];
  for (const plan of invalidPlans) {
    response = await makeRequest('POST', '/api/payments/create-order', {
      planType: plan,
    });

    passed =
      response.status === 400 &&
      response.data.success === false &&
      response.data.message &&
      response.data.message.includes('Invalid plan type');

    recordTest(
      `Invalid plan type: "${plan}"`,
      passed,
      `Status: ${response.status}, Message: ${response.data.message || 'N/A'}`
    );
  }

  // ==================== 4. AUTHENTICATION & AUTHORIZATION ====================
  log.h2('4. Authentication & Authorization');

  // No token
  response = await makeRequest('POST', '/api/payments/create-order',
    { planType: 'BASIC' },
    null // No token
  );

  passed = response.status === 401 || response.status === 403;
  recordTest(
    'No authentication token',
    passed,
    `Status: ${response.status}, Message: ${response.data.message || response.data.error || 'N/A'}`
  );

  // Invalid token
  response = await makeRequest('POST', '/api/payments/create-order',
    { planType: 'BASIC' },
    'invalid.token.here'
  );

  passed = response.status === 401 || response.status === 403;
  recordTest(
    'Invalid authentication token',
    passed,
    `Status: ${response.status}, Message: ${response.data.message || response.data.error || 'N/A'}`
  );

  // ==================== 5. RATE LIMITING ====================
  log.h2('5. Rate Limiting Tests');

  const rateLimitTests = async () => {
    const maxRequests = 20; // Based on paymentLimiter config (20 per minute per user)
    let rateLimitHit = false;
    let rateLimitStatus = null;

    log.info(`Attempting ${maxRequests + 5} rapid requests to trigger rate limiting...`);

    for (let i = 1; i <= maxRequests + 5; i++) {
      const res = await makeRequest('POST', '/api/payments/create-order', {
        planType: 'BASIC',
      });

      if (res.status === 429) {
        rateLimitHit = true;
        rateLimitStatus = res.data;
        log.warn(`Rate limit hit at request ${i}`);
        break;
      }

      if (i === maxRequests + 5) {
        log.warn(`Rate limit not triggered after ${maxRequests + 5} requests`);
      }
    }

    // Test rate limit headers
    const headerResponse = await makeRequest('POST', '/api/payments/create-order', {
      planType: 'BASIC',
    });

    const hasRateLimitHeaders =
      headerResponse.headers['x-ratelimit-limit'] !== undefined &&
      headerResponse.headers['x-ratelimit-remaining'] !== undefined &&
      headerResponse.headers['x-ratelimit-reset'] !== undefined;

    recordTest(
      'Rate limit headers present',
      hasRateLimitHeaders,
      `Limit: ${headerResponse.headers['x-ratelimit-limit']}, ` +
      `Remaining: ${headerResponse.headers['x-ratelimit-remaining']}`
    );

    if (rateLimitHit) {
      const expected429 = rateLimitStatus.error &&
                         (rateLimitStatus.error.includes('Too many') ||
                          rateLimitStatus.error.includes('rate'));
      recordTest(
        'Rate limit returns 429 with proper error message',
        expected429,
        `Status: 429, Message: ${rateLimitStatus.error || 'N/A'}`
      );

      const hasRetryAfter = rateLimitStatus.retryAfter !== undefined;
      recordTest(
        'Rate limit includes Retry-After header',
        hasRetryAfter,
        `Retry-After: ${rateLimitStatus.retryAfter || 'N/A'} seconds`
      );

      const hasBackoffInfo = rateLimitStatus.backoffMultiplier !== undefined &&
                            rateLimitStatus.attemptCount !== undefined;
      recordTest(
        'Rate limit includes backoff multiplier and attempt count',
        hasBackoffInfo,
        `Multiplier: ${rateLimitStatus.backoffMultiplier || 'N/A'}, ` +
        `Attempts: ${rateLimitStatus.attemptCount || 'N/A'}`
      );
    } else {
      log.warn('Rate limiting was not triggered - may need higher request count or Redis issue');
    }
  };

  await rateLimitTests();

  // ==================== 6. RESPONSE FORMAT ====================
  log.h2('6. Response Format Validation');

  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'PREMIUM',
  });

  const hasValidFormat =
    response.data.success === true &&
    response.data.data &&
    typeof response.data.data.orderId === 'string' &&
    typeof response.data.data.amount === 'number' &&
    typeof response.data.data.currency === 'string' &&
    typeof response.data.data.planType === 'string';

  recordTest(
    'Valid response format (success, data with orderId, amount, currency, planType)',
    hasValidFormat,
    `Response keys: ${Object.keys(response.data.data || {}).join(', ')}`
  );

  // ==================== 7. EDGE CASES ====================
  log.h2('7. Edge Cases');

  // Case sensitivity
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'basic', // lowercase
  });

  const caseSensitivityFails = response.status === 400;
  recordTest(
    'Plan type is case-sensitive (lowercase should fail)',
    caseSensitivityFails,
    `Status: ${response.status}, Message: ${response.data.message || 'N/A'}`
  );

  // Extra fields should not cause issues
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'BASIC',
    extraField: 'should be ignored',
    anotherField: 123,
  });

  const extraFieldsIgnored = response.status === 201 && response.data.success === true;
  recordTest(
    'Extra fields are ignored and do not cause errors',
    extraFieldsIgnored,
    `Status: ${response.status}`
  );

  // ==================== 8. ERROR RESPONSE FORMAT ====================
  log.h2('8. Error Response Format');

  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'INVALID_PLAN',
  });

  const hasErrorFormat =
    response.data.success === false &&
    response.data.message &&
    typeof response.data.message === 'string';

  recordTest(
    'Error responses have proper format (success: false, message)',
    hasErrorFormat,
    `Message: ${response.data.message || 'N/A'}`
  );
};

// ==================== CLEANUP ====================

const cleanupTestUser = async () => {
  if (testUserId) {
    try {
      await prisma.user.delete({
        where: { id: testUserId },
      });
      log.success('Test user cleaned up');
    } catch (error) {
      log.warn(`Failed to cleanup test user: ${error.message}`);
    }
  }
};

// ==================== MAIN EXECUTION ====================

const main = async () => {
  try {
    await setupTestUser();
    await runTests();

    // ==================== RESULTS SUMMARY ====================
    log.title();
    log.h1('Test Results Summary');
    log.title();

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;

    console.log(`\n${colors.bright}Total Tests: ${total}${colors.reset}`);
    console.log(`${colors.green}${colors.bright}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}${colors.bright}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.bright}Success Rate: ${((passed / total) * 100).toFixed(2)}%${colors.reset}\n`);

    if (failed > 0) {
      log.h2('Failed Tests');
      testResults
        .filter(r => !r.passed)
        .forEach(r => {
          log.error(r.name);
          if (r.details) log.detail(r.details);
        });
    }

    log.title();

    await cleanupTestUser();
    await prisma.$disconnect();

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
