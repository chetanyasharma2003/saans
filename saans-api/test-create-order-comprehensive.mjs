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
  title: () => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(90)}${colors.reset}`),
  h1: (text) => console.log(`\n${colors.bright}${colors.magenta}╔ ${text}${colors.reset}`),
  h2: (text) => console.log(`\n${colors.bright}${colors.blue}▶ ${text}${colors.reset}`),
  success: (text) => console.log(`  ${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`  ${colors.red}✗ ${text}${colors.reset}`),
  warn: (text) => console.log(`  ${colors.yellow}⚠ ${text}${colors.reset}`),
  info: (text) => console.log(`  ${colors.cyan}ℹ ${text}${colors.reset}`),
  detail: (text) => console.log(`    ${colors.cyan}→ ${text}${colors.reset}`),
  problem: (category, details) => {
    console.log(`  ${colors.red}${colors.bright}[PROBLEM: ${category}]${colors.reset}`);
    console.log(`    ${details}`);
  },
};

const testResults = [];
const problems = [];
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
    validateStatus: () => true,
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

const recordProblem = (category, description, evidence = '') => {
  problems.push({
    category,
    description,
    evidence,
  });
  log.problem(category, `${description}${evidence ? '\n      Evidence: ' + evidence : ''}`);
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
  log.h1('POST /api/payments/create-order Test Suite - Problem Discovery');
  log.title();

  // ==================== 1. VALID REQUESTS ====================
  log.h2('1. Valid Requests - Testing Core Functionality');

  const validPlans = ['BASIC', 'PREMIUM', 'PLUS'];
  let validRequestsWorking = true;

  for (const plan of validPlans) {
    const response = await makeRequest('POST', '/api/payments/create-order', {
      planType: plan,
    });

    const isSuccess = response && response.status === 201 && response.data && response.data.success === true;
    const hasOrderData = response && response.data && response.data.data && response.data.data.orderId;

    recordTest(
      `Valid request with ${plan} plan`,
      isSuccess && hasOrderData,
      `Status: ${response ? response.status : 'unknown'}`
    );

    if (!isSuccess) {
      validRequestsWorking = false;
      if (response && response.status !== 201) {
        log.detail(`Expected 201, got ${response.status}`);
      }
      if (response && response.data && response.data.error) {
        log.detail(`Error: ${response.data.error.message}`);
        recordProblem(
          'RAZORPAY_INTEGRATION',
          `Order creation fails for ${plan} plan`,
          `Error Message: ${response.data.error.message}. This suggests Razorpay API keys may be invalid or misconfigured.`
        );
      }
    } else {
      log.detail(`✓ Order ID: ${response.data.data.orderId}, Amount: ₹${response.data.data.amount}`);
    }
  }

  if (validRequestsWorking) {
    log.success('All valid requests working correctly');
  }

  // ==================== 2. MISSING FIELDS ====================
  log.h2('2. Missing Fields - Input Validation');

  // Missing planType
  let response = await makeRequest('POST', '/api/payments/create-order', {});

  let passed =
    response.status === 400 &&
    response.data.error &&
    response.data.error.message &&
    response.data.error.message.toLowerCase().includes('plan');

  recordTest(
    'Rejects missing planType with 400 status',
    passed,
    `Status: ${response.status}, Message: ${response.data.error?.message || 'N/A'}`
  );

  if (!passed && response.status === 400) {
    recordProblem(
      'ERROR_FORMAT',
      'Missing field validation returns 400 but with unexpected response format',
      `Response keys: ${Object.keys(response.data).join(', ')}`
    );
  }

  // Empty planType
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: '',
  });

  passed =
    response.status === 400 &&
    response.data.error &&
    response.data.error.message;

  recordTest(
    'Rejects empty planType with 400 status',
    passed,
    `Status: ${response.status}`
  );

  // Null planType
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: null,
  });

  passed =
    response.status === 400 &&
    response.data.error &&
    response.data.error.message;

  recordTest(
    'Rejects null planType with 400 status',
    passed,
    `Status: ${response.status}`
  );

  // ==================== 3. INVALID PLANS ====================
  log.h2('3. Invalid Plan Types - Validation');

  const invalidPlans = ['INVALID', 'GOLD', 'DIAMOND', 'FREE', 'STANDARD'];
  let invalidPlanValidationWorks = true;

  for (const plan of invalidPlans) {
    response = await makeRequest('POST', '/api/payments/create-order', {
      planType: plan,
    });

    const isValidation =
      response.status === 400 &&
      response.data.error &&
      response.data.error.message &&
      (response.data.error.message.toLowerCase().includes('invalid') ||
        response.data.error.message.toLowerCase().includes('plan'));

    recordTest(
      `Rejects invalid plan "${plan}" with proper error`,
      isValidation,
      `Status: ${response.status}, Message: ${response.data.error?.message || response.data.error || 'N/A'}`
    );

    if (!isValidation && response.status !== 400) {
      invalidPlanValidationWorks = false;
      recordProblem(
        'INVALID_PLAN_VALIDATION',
        `Plan validation returns ${response.status} instead of 400 for invalid plan "${plan}"`,
        `Response: ${JSON.stringify(response.data)}`
      );
    }
  }

  // Check for FREE plan specifically
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'FREE',
  });

  // FREE plan is actually valid according to the code, but shouldn't be orderable
  if (response.status === 400) {
    recordTest(
      'FREE plan is correctly rejected (non-payable plan)',
      true,
      'Status: 400'
    );
  } else if (response.status === 201) {
    recordProblem(
      'FREE_PLAN_VALIDATION',
      'FREE plan should not be orderable but API created an order for it',
      `Status: 201 - FREE plan should not require payment order creation`
    );
  }

  // ==================== 4. AUTHENTICATION & AUTHORIZATION ====================
  log.h2('4. Authentication & Authorization');

  // No token
  response = await makeRequest('POST', '/api/payments/create-order', { planType: 'BASIC' }, null);

  passed = response.status === 401 && response.data.error;
  recordTest(
    'No authentication token returns 401',
    passed,
    `Status: ${response.status}`
  );

  if (!passed) {
    recordProblem(
      'AUTH_VALIDATION',
      `Missing token handling returns ${response.status} instead of 401`,
      `Response: ${JSON.stringify(response.data)}`
    );
  }

  // Invalid token
  response = await makeRequest('POST', '/api/payments/create-order', { planType: 'BASIC' }, 'invalid.token.here');

  passed = response.status === 401 && response.data.error;
  recordTest(
    'Invalid token returns 401',
    passed,
    `Status: ${response.status}`
  );

  // ==================== 5. RATE LIMITING ====================
  log.h2('5. Rate Limiting');

  const performRateLimitTest = async () => {
    const maxAttempts = 25;
    let rateLimitTriggered = false;
    let triggerPoint = null;

    log.info('Sending rapid requests to test rate limiting...');

    for (let i = 1; i <= maxAttempts; i++) {
      const res = await makeRequest('POST', '/api/payments/create-order', {
        planType: 'BASIC',
      });

      // Check for X-RateLimit headers
      const rateLimit = {
        limit: parseInt(res.headers['x-ratelimit-limit'], 10),
        remaining: parseInt(res.headers['x-ratelimit-remaining'], 10),
        reset: parseInt(res.headers['x-ratelimit-reset'], 10),
      };

      if (res.status === 429) {
        rateLimitTriggered = true;
        triggerPoint = i;
        recordTest(
          `Rate limit triggered at request ${i}`,
          true,
          `Status: 429, Retry-After: ${res.data.retryAfter}s`
        );
        break;
      }

      if (i === maxAttempts) {
        log.warn(`Rate limiting did not trigger after ${maxAttempts} requests`);
      }
    }

    if (!rateLimitTriggered) {
      recordProblem(
        'RATE_LIMITING',
        `Rate limiting did not trigger after ${maxAttempts} requests`,
        `Expected limit is 20 requests per minute per user. Redis may be unavailable or rate limiting may be disabled.`
      );
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
      'Rate limit headers (X-RateLimit-*) present in response',
      hasRateLimitHeaders,
      `Limit: ${headerResponse.headers['x-ratelimit-limit']}, ` +
        `Remaining: ${headerResponse.headers['x-ratelimit-remaining']}`
    );

    if (!hasRateLimitHeaders) {
      recordProblem(
        'RATE_LIMIT_HEADERS',
        'Rate limit headers missing from response',
        'X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers should be present'
      );
    }
  };

  await performRateLimitTest();

  // ==================== 6. RESPONSE FORMAT ====================
  log.h2('6. Response Format Validation');

  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'PREMIUM',
  });

  if (response.status === 201 && response.data.success) {
    const hasValidFormat =
      response.data.data &&
      typeof response.data.data.orderId === 'string' &&
      typeof response.data.data.amount === 'number' &&
      typeof response.data.data.currency === 'string' &&
      typeof response.data.data.planType === 'string';

    recordTest(
      'Success response has correct format (success: true, data with all fields)',
      hasValidFormat,
      `Response: ${JSON.stringify(response.data)}`
    );
  } else {
    log.warn('Cannot validate success format - valid requests are not working');
  }

  // Test error format
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'INVALID_PLAN',
  });

  const hasErrorFormat =
    response.status === 400 &&
    response.data.error &&
    response.data.error.message &&
    response.data.error.code;

  recordTest(
    'Error response has correct format (error with message and code)',
    hasErrorFormat,
    `Error code: ${response.data.error?.code || 'N/A'}`
  );

  if (!hasErrorFormat) {
    recordProblem(
      'ERROR_FORMAT',
      'Error responses do not follow expected format',
      `Expected: { error: { message, code, timestamp } }, Got: ${JSON.stringify(response.data)}`
    );
  }

  // ==================== 7. EDGE CASES ====================
  log.h2('7. Edge Cases');

  // Case sensitivity
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'basic',
  });

  const caseSensitivityWorks = response.status === 400;
  recordTest(
    'Plan type is case-sensitive (lowercase rejected)',
    caseSensitivityWorks,
    `Status: ${response.status}`
  );

  if (!caseSensitivityWorks) {
    recordProblem(
      'CASE_SENSITIVITY',
      'Plan type validation is not case-sensitive',
      'Plan types should be uppercase only (BASIC, PREMIUM, PLUS)'
    );
  }

  // Extra fields
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'BASIC',
    extraField: 'ignored',
    maliciousField: { nested: 'object' },
  });

  // Extra fields should be ignored, so if valid it should work
  const extraFieldsHandled = response.status !== 400 || (response.status === 400 && !response.data.error?.message.includes('extra'));
  recordTest(
    'Extra fields do not cause validation errors',
    extraFieldsHandled,
    `Status: ${response.status}`
  );

  // Very long string for planType
  response = await makeRequest('POST', '/api/payments/create-order', {
    planType: 'A'.repeat(1000),
  });

  const longStringHandled = response.status === 400;
  recordTest(
    'Very long plan type strings are rejected',
    longStringHandled,
    `Status: ${response.status}`
  );

  // ==================== 8. INVALID AMOUNT HANDLING ====================
  log.h2('8. Invalid Amount Handling');

  // Check if the API validates amounts in any way
  // Note: Current implementation doesn't have amount in request body, only planType
  log.info('Note: Current implementation does not accept amount in request (fixed by planType)');
  log.detail('Amount is determined server-side based on planType from SUBSCRIPTION_PLANS constant');

  // ==================== 9. DATABASE STATE ====================
  log.h2('9. Database State Checks');

  // After successful order, check if user data is affected
  if (validRequestsWorking) {
    const userAfter = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { subscription: true },
    });

    recordTest(
      'User subscription not modified by create-order (order creation only)',
      userAfter.subscription === null || userAfter.subscription.type === 'FREE',
      'Subscription should only update after verify-payment, not after create-order'
    );
  }
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
    log.h1('Test Results & Issues Summary');
    log.title();

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;

    console.log(`\n${colors.bright}Total Tests: ${total}${colors.reset}`);
    console.log(`${colors.green}${colors.bright}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}${colors.bright}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.bright}Success Rate: ${((passed / total) * 100).toFixed(2)}%${colors.reset}\n`);

    if (problems.length > 0) {
      log.title();
      log.h1('Discovered Problems');
      log.title();

      const problemsByCategory = {};
      problems.forEach(p => {
        if (!problemsByCategory[p.category]) {
          problemsByCategory[p.category] = [];
        }
        problemsByCategory[p.category].push(p);
      });

      Object.entries(problemsByCategory).forEach(([category, issues]) => {
        log.h2(`${category} (${issues.length} issue${issues.length > 1 ? 's' : ''})`);
        issues.forEach(issue => {
          log.error(issue.description);
          if (issue.evidence) {
            log.detail(issue.evidence);
          }
        });
      });
    }

    if (failed > 0) {
      log.h2('Failed Test Details');
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

    process.exit(failed > 0 || problems.length > 0 ? 1 : 0);
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
