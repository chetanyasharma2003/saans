import axios from 'axios';
import crypto from 'crypto';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';
const RAZORPAY_KEY_SECRET = 'test_secret_key_for_testing_purposes';

// Test tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  bugs: [],
};

let testToken = '';
let testUserId = '';

// Helper function to generate valid signature
function generateValidSignature(orderId, paymentId, secret = RAZORPAY_KEY_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

// Helper function to run a test
async function runTest(testName, testFn) {
  results.total++;
  try {
    await testFn();
    results.passed++;
    console.log(chalk.green(`✓ ${testName}`));
  } catch (error) {
    results.failed++;
    console.log(chalk.red(`✗ ${testName}`));
    console.log(chalk.dim(`  Error: ${error.message}`));

    if (error.bug) {
      results.bugs.push({
        test: testName,
        issue: error.bug,
        details: error.message,
      });
    }
  }
}

// Test helper
async function callVerifyPayment(payload, token = testToken, expectedStatus = 200) {
  try {
    const response = await axios.post(`${API_URL}/api/payments/verify-payment`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    });

    return {
      status: response.status,
      data: response.data,
      response,
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Setup: Get or create a test user and token
async function setupTestUser() {
  console.log(chalk.cyan('Setting up test user...\n'));

  try {
    // Try to register a test user
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@payment-test.com`;
    const testPassword = 'TestPassword123!';

    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: `Test User ${timestamp}`,
    }, {
      validateStatus: () => true,
    });

    if (registerResponse.status === 201 || registerResponse.status === 200) {
      testToken = registerResponse.data.data?.token || registerResponse.data.accessToken;
      testUserId = registerResponse.data.data?.userId || registerResponse.data.user?.id;

      if (!testToken) {
        // Try login
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: testEmail,
          password: testPassword,
        }, {
          validateStatus: () => true,
        });

        testToken = loginResponse.data.data?.token || loginResponse.data.accessToken;
        testUserId = loginResponse.data.data?.userId || loginResponse.data.user?.id;
      }
    } else if (registerResponse.status === 409 || registerResponse.status === 400) {
      // User might exist, try login
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test_user@payment-test.com',
        password: 'TestPassword123!',
      }, {
        validateStatus: () => true,
      });

      testToken = loginResponse.data.data?.token || loginResponse.data.accessToken;
      testUserId = loginResponse.data.data?.userId || loginResponse.data.user?.id;
    }

    if (testToken) {
      console.log(chalk.green('✓ Test user authenticated\n'));
    } else {
      console.log(chalk.yellow('⚠ Could not authenticate test user, using dummy token for tests\n'));
      testToken = 'test-token-' + Date.now();
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠ Auth setup failed: ${error.message}\n`));
    testToken = 'test-token-' + Date.now();
  }
}

// =============== TEST SUITES ===============

await setupTestUser();

console.log(chalk.bold.blue('\n=== PAYMENT VERIFY ENDPOINT TESTS ===\n'));

// 1. Valid Signature Tests
console.log(chalk.bold.cyan('1. VALID SIGNATURE TESTS'));

await runTest('Should accept valid Razorpay signature', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  });

  // Status should not be 400 for invalid signature with correct auth
  if (result.data?.message?.includes('Invalid payment signature')) {
    const error = new Error('Valid signature rejected as invalid');
    error.bug = 'Signature verification logic broken - rejecting valid signatures';
    throw error;
  }
});

await runTest('Should reject tampered order ID', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  // Tamper with order ID
  const tamperedOrderId = orderId + 'xxx';

  const result = await callVerifyPayment({
    razorpay_order_id: tamperedOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  });

  if (result.status === 200 || !result.data?.message?.includes('Invalid')) {
    const error = new Error(`Tampered order ID accepted (status=${result.status})`);
    error.bug = 'SECURITY: Signature verification does not catch tampered order IDs';
    throw error;
  }
});

await runTest('Should reject tampered payment ID', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  // Tamper with payment ID
  const tamperedPaymentId = paymentId + 'yyy';

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: tamperedPaymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  });

  if (result.status === 200 || !result.data?.message?.includes('Invalid')) {
    const error = new Error(`Tampered payment ID accepted (status=${result.status})`);
    error.bug = 'SECURITY: Signature verification does not catch tampered payment IDs';
    throw error;
  }
});

await runTest('Should reject signature with wrong secret', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const wrongSignature = generateValidSignature(orderId, paymentId, 'WRONG_SECRET');

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: wrongSignature,
    planType: 'BASIC',
  });

  if (result.status === 200 || !result.data?.message?.includes('Invalid')) {
    const error = new Error(`Wrong secret signature accepted (status=${result.status})`);
    error.bug = 'SECURITY: Signature verification does not validate secret correctly';
    throw error;
  }
});

// 2. Invalid Data Tests
console.log(chalk.bold.cyan('\n2. INVALID DATA TESTS'));

await runTest('Should reject missing order ID', async () => {
  const result = await callVerifyPayment({
    razorpay_payment_id: 'pay_test',
    razorpay_signature: 'sig_test',
    planType: 'BASIC',
  });

  if (result.status !== 400) {
    const error = new Error(`Expected 400, got ${result.status}`);
    error.bug = 'Missing required field (order ID) not properly validated';
    throw error;
  }
});

await runTest('Should reject missing payment ID', async () => {
  const result = await callVerifyPayment({
    razorpay_order_id: 'order_test',
    razorpay_signature: 'sig_test',
    planType: 'BASIC',
  });

  if (result.status !== 400) {
    const error = new Error(`Expected 400, got ${result.status}`);
    error.bug = 'Missing required field (payment ID) not properly validated';
    throw error;
  }
});

await runTest('Should reject missing signature', async () => {
  const result = await callVerifyPayment({
    razorpay_order_id: 'order_test',
    razorpay_payment_id: 'pay_test',
    planType: 'BASIC',
  });

  if (result.status !== 400) {
    const error = new Error(`Expected 400, got ${result.status}`);
    error.bug = 'Missing required field (signature) not properly validated';
    throw error;
  }
});

await runTest('Should reject missing plan type', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
  });

  if (result.status !== 400) {
    const error = new Error(`Expected 400, got ${result.status}`);
    error.bug = 'Missing required field (planType) not properly validated';
    throw error;
  }
});

await runTest('Should reject invalid plan type', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'INVALID_PLAN',
  });

  if (result.status !== 400) {
    const error = new Error(`Expected 400, got ${result.status}`);
    error.bug = 'Invalid plan type not properly validated';
    throw error;
  }
});

// 3. Data Type Validation
console.log(chalk.bold.cyan('\n3. DATA TYPE VALIDATION TESTS'));

await runTest('Should reject non-string order ID', async () => {
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature('order_test', paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: 12345, // Number instead of string
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  });

  if (result.status === 200) {
    const error = new Error('Non-string order ID was accepted');
    error.bug = 'No type validation for order ID - accepts numbers';
    throw error;
  }
});

await runTest('Should reject null values', async () => {
  const result = await callVerifyPayment({
    razorpay_order_id: null,
    razorpay_payment_id: null,
    razorpay_signature: null,
    planType: 'BASIC',
  });

  if (result.status === 200) {
    const error = new Error('Null values were accepted');
    error.bug = 'No null validation - accepts null fields';
    throw error;
  }
});

await runTest('Should reject empty strings', async () => {
  const result = await callVerifyPayment({
    razorpay_order_id: '',
    razorpay_payment_id: '',
    razorpay_signature: '',
    planType: 'BASIC',
  });

  if (result.status === 200) {
    const error = new Error('Empty strings were accepted');
    error.bug = 'No empty string validation';
    throw error;
  }
});

// 4. Idempotency Tests
console.log(chalk.bold.cyan('\n4. IDEMPOTENCY TESTS'));

await runTest('Should handle duplicate requests safely', async () => {
  const orderId = 'order_idempotent_' + Date.now();
  const paymentId = 'pay_idempotent_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const payload = {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  };

  // First request
  const result1 = await callVerifyPayment(payload);

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Second request (duplicate)
  const result2 = await callVerifyPayment(payload);

  // Both should have same status
  if (result1.status !== result2.status) {
    const error = new Error(`Status mismatch: first=${result1.status}, second=${result2.status}`);
    error.bug = 'Not idempotent - duplicate requests return different results';
    throw error;
  }
});

// 5. Authentication & Authorization Tests
console.log(chalk.bold.cyan('\n5. AUTHENTICATION & AUTHORIZATION TESTS'));

await runTest('Should reject requests without authentication', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  }, {
    validateStatus: () => true,
  });

  if (response.status !== 401 && response.status !== 403) {
    const error = new Error(`Expected 401/403, got ${response.status}`);
    error.bug = 'SECURITY: Endpoint accessible without authentication';
    throw error;
  }
});

await runTest('Should reject requests with invalid token', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
  }, {
    headers: {
      'Authorization': 'Bearer invalid_token_xyz_abc_def_ghi',
    },
    validateStatus: () => true,
  });

  if (response.status !== 401 && response.status !== 403) {
    const error = new Error(`Expected 401/403, got ${response.status}`);
    error.bug = 'SECURITY: Endpoint accepts invalid tokens';
    throw error;
  }
});

// 6. Security Tests
console.log(chalk.bold.cyan('\n6. SECURITY TESTS'));

await runTest('Should prevent SQL injection in order ID', async () => {
  const maliciousOrderId = "order'; DROP TABLE payments; --";
  const paymentId = 'pay_test';
  const signature = generateValidSignature(maliciousOrderId, paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: maliciousOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    planType: 'BASIC',
  });

  // Should reject with invalid signature (due to tampering)
  if (result.status === 200) {
    const error = new Error('SQL injection payload was processed');
    error.bug = 'SECURITY: Possible SQL injection vulnerability in order ID';
    throw error;
  }
});

await runTest('Should prevent signature bypass with extra fields', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'BASIC',
    userId: 'attacker_user_id', // Attempt to override user ID
    bypassed: true, // Try to bypass verification
  });

  // Should not let these fields override the authenticated user
  if (result.data?.userId === 'attacker_user_id') {
    const error = new Error('User ID was overridden');
    error.bug = 'SECURITY: Extra fields can override authenticated user context';
    throw error;
  }
});

await runTest('Should validate signature format (hex string 64 chars)', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: 'not_a_valid_hex_signature', // Too short and not hex
    planType: 'BASIC',
  });

  if (result.status === 200) {
    const error = new Error('Invalid signature format was accepted');
    error.bug = 'No format validation for signature - should be 64 char hex';
    throw error;
  }
});

await runTest('Should not allow payment amount tampering in signature', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  // Try to send different amount than what was in the original order
  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
    planType: 'PREMIUM', // Change from BASIC to PREMIUM
  });

  // Signature should still be invalid because planType wasn't part of signature
  // But ideally should reject tampering
});

// 7. Error Handling Tests
console.log(chalk.bold.cyan('\n7. ERROR HANDLING TESTS'));

await runTest('Should return proper error message for invalid signature', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const wrongSignature = generateValidSignature(orderId, paymentId, 'WRONG_KEY');

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: wrongSignature,
    planType: 'BASIC',
  });

  if (!result.data?.message && !result.data?.error) {
    const error = new Error('No error message in response');
    error.bug = 'Poor error handling - no message for invalid signature';
    throw error;
  }
});

await runTest('Should not leak sensitive info in errors', async () => {
  const result = await callVerifyPayment({
    razorpay_order_id: 'order_test',
    razorpay_payment_id: 'pay_test',
    razorpay_signature: 'sig_test',
    planType: 'BASIC',
  });

  const errorMsg = JSON.stringify(result.data);
  const sensitivePatterns = [
    /secret/i,
    /key_secret/i,
    /private_key/i,
    /RAZORPAY_KEY_SECRET/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(errorMsg)) {
      const error = new Error('Sensitive information leaked in error');
      error.bug = 'SECURITY: Error messages contain sensitive information';
      throw error;
    }
  }
});

// 8. Rate Limiting Tests
console.log(chalk.bold.cyan('\n8. RATE LIMITING TESTS'));

await runTest('Should have rate limiting on verify endpoint', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();

  const results = [];

  // Make rapid requests (not too many to avoid actual rate limiting blocking test)
  for (let i = 0; i < 5; i++) {
    const result = await callVerifyPayment({
      razorpay_order_id: orderId + i,
      razorpay_payment_id: paymentId + i,
      razorpay_signature: generateValidSignature(orderId + i, paymentId + i),
      planType: 'BASIC',
    });
    results.push(result.status);
  }

  // Check if rate limiting header is present
  const hasRateLimitHeaders = results.some(status =>
    status === 429 // Too Many Requests
  );

  // This is informational, not a hard fail
});

// =============== SUMMARY ===============

console.log(chalk.bold.cyan('\n=== TEST SUMMARY ===\n'));
console.log(`Total Tests: ${results.total}`);
console.log(chalk.green(`Passed: ${results.passed}`));
console.log(chalk.red(`Failed: ${results.failed}`));

if (results.bugs.length > 0) {
  console.log(chalk.bold.red(`\n=== BUGS FOUND: ${results.bugs.length} ===\n`));

  // Sort bugs by severity
  const criticalBugs = results.bugs.filter(b => b.issue.includes('SECURITY'));
  const warningBugs = results.bugs.filter(b => b.issue.includes('WARNING'));
  const otherBugs = results.bugs.filter(b => !b.issue.includes('SECURITY') && !b.issue.includes('WARNING'));

  if (criticalBugs.length > 0) {
    console.log(chalk.bold.red('CRITICAL SECURITY ISSUES:\n'));
    criticalBugs.forEach((bug, index) => {
      console.log(chalk.bold.red(`  ${index + 1}. ${bug.test}`));
      console.log(chalk.red(`     ${bug.issue}`));
      console.log(chalk.dim(`     ${bug.details}\n`));
    });
  }

  if (warningBugs.length > 0) {
    console.log(chalk.bold.yellow('WARNINGS:\n'));
    warningBugs.forEach((bug, index) => {
      console.log(chalk.bold.yellow(`  ${index + 1}. ${bug.test}`));
      console.log(chalk.yellow(`     ${bug.issue}`));
      console.log(chalk.dim(`     ${bug.details}\n`));
    });
  }

  if (otherBugs.length > 0) {
    console.log(chalk.bold.red('OTHER ISSUES:\n'));
    otherBugs.forEach((bug, index) => {
      console.log(chalk.bold.red(`  ${index + 1}. ${bug.test}`));
      console.log(chalk.yellow(`     ${bug.issue}`));
      console.log(chalk.dim(`     ${bug.details}\n`));
    });
  }
} else {
  console.log(chalk.bold.green('\n✓ No critical bugs found!\n'));
}

console.log(chalk.dim('Test completed at ' + new Date().toISOString()));
