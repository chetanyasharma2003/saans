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
async function callVerifyPayment(payload, token = 'valid-test-token', expectedStatus = 200) {
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

// =============== TEST SUITES ===============

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

  // Should be 200 or 400 (depending on user auth), but NOT 400 with "Invalid signature"
  if (result.status === 401) {
    throw new Error('Unauthorized (no auth token)');
  }

  if (result.data?.message?.includes('Invalid payment signature')) {
    const error = new Error('Valid signature rejected as invalid');
    error.bug = 'Signature verification logic is broken - rejecting valid signatures';
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

  if (!result.data?.message?.includes('Invalid')) {
    const error = new Error('Tampered order ID was accepted');
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

  if (!result.data?.message?.includes('Invalid')) {
    const error = new Error('Tampered payment ID was accepted');
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

  if (!result.data?.message?.includes('Invalid')) {
    const error = new Error('Wrong secret signature was accepted');
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

  if (result.status !== 400 && result.status !== 401) {
    const error = new Error(`Expected 400/401, got ${result.status}`);
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

  if (result.status !== 400 && result.status !== 401) {
    const error = new Error(`Expected 400/401, got ${result.status}`);
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

  if (result.status !== 400 && result.status !== 401) {
    const error = new Error(`Expected 400/401, got ${result.status}`);
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

  if (result.status !== 400 && result.status !== 401) {
    const error = new Error(`Expected 400/401, got ${result.status}`);
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

  if (result.status !== 400 && result.status !== 401) {
    const error = new Error(`Expected 400/401, got ${result.status}`);
    error.bug = 'Invalid plan type not properly validated';
    throw error;
  }
});

// 3. Data Type Validation
console.log(chalk.bold.cyan('\n3. DATA TYPE VALIDATION TESTS'));

await runTest('Should reject non-string order ID', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

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

  // Second request (duplicate)
  const result2 = await callVerifyPayment(payload);

  // Both should have same status or be idempotent
  if (result1.status !== result2.status) {
    const error = new Error(`Status mismatch: first=${result1.status}, second=${result2.status}`);
    error.bug = 'Not idempotent - duplicate requests return different results';
    throw error;
  }

  // Check if idempotency key mechanism exists
  const responseData = result1.data;
  if (responseData.idempotencyKey === undefined && result1.status === 200) {
    const error = new Error('No idempotency key in response');
    error.bug = 'WARNING: No idempotency mechanism detected - could allow double-charging';
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
      'Authorization': 'Bearer invalid_token_xyz',
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

  // Should reject or handle safely
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

await runTest('Should validate signature format', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();

  const result = await callVerifyPayment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: 'invalid_signature_format_too_short',
    planType: 'BASIC',
  });

  if (result.status === 200) {
    const error = new Error('Invalid signature format was accepted');
    error.bug = 'No format validation for signature - should be 64 char hex';
    throw error;
  }
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

await runTest('Should enforce rate limiting on verify endpoint', async () => {
  const orderId = 'order_' + Date.now();
  const paymentId = 'pay_' + Date.now();
  const validSignature = generateValidSignature(orderId, paymentId);

  const results = [];

  // Make multiple rapid requests
  for (let i = 0; i < 10; i++) {
    const result = await callVerifyPayment({
      razorpay_order_id: orderId + i,
      razorpay_payment_id: paymentId + i,
      razorpay_signature: generateValidSignature(orderId + i, paymentId + i),
      planType: 'BASIC',
    });
    results.push(result.status);
  }

  // Check if any 429 status (Too Many Requests)
  const hasTooMany = results.some(status => status === 429);

  if (!hasTooMany) {
    // Note: This is a warning, not necessarily a bug if rate limiting is done elsewhere
    console.log(chalk.yellow('  ⚠ Rate limiting may not be enforced on this endpoint'));
  }
});

// =============== SUMMARY ===============

console.log(chalk.bold.cyan('\n=== TEST SUMMARY ===\n'));
console.log(`Total Tests: ${results.total}`);
console.log(chalk.green(`Passed: ${results.passed}`));
console.log(chalk.red(`Failed: ${results.failed}`));

if (results.bugs.length > 0) {
  console.log(chalk.bold.red(`\n=== BUGS FOUND: ${results.bugs.length} ===\n`));

  results.bugs.forEach((bug, index) => {
    console.log(chalk.bold.red(`Bug ${index + 1}: ${bug.test}`));
    console.log(chalk.yellow(`Issue: ${bug.issue}`));
    console.log(chalk.dim(`Details: ${bug.details}\n`));
  });
} else {
  console.log(chalk.bold.green('\n✓ No critical bugs found!\n'));
}

console.log(chalk.dim('Test completed at ' + new Date().toISOString()));
