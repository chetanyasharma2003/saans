import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:3000';
const RAZORPAY_KEY_SECRET = 'test_secret_key_for_testing_purposes';

// Helper function to generate valid signature
function generateValidSignature(orderId, paymentId, secret = RAZORPAY_KEY_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

// Setup test token
let testToken = '';

async function setupTestUser() {
  try {
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
      if (!testToken) {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: testEmail,
          password: testPassword,
        }, {
          validateStatus: () => true,
        });
        testToken = loginResponse.data.data?.token || loginResponse.data.accessToken;
      }
    }
  } catch (error) {
    console.log('Auth setup failed:', error.message);
  }
}

async function testSignatureValidation() {
  await setupTestUser();

  console.log('=== SIGNATURE VALIDATION DEBUG ===\n');

  // Test 1: Valid signature
  console.log('TEST 1: Valid Signature');
  const orderId1 = 'order_' + Date.now();
  const paymentId1 = 'pay_' + Date.now();
  const validSig = generateValidSignature(orderId1, paymentId1);

  let response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: orderId1,
    razorpay_payment_id: paymentId1,
    razorpay_signature: validSig,
    planType: 'BASIC',
  }, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
  console.log();

  // Test 2: Tampered order ID
  console.log('TEST 2: Tampered Order ID');
  const orderId2 = 'order_' + Date.now();
  const paymentId2 = 'pay_' + Date.now();
  const validSig2 = generateValidSignature(orderId2, paymentId2);
  const tamperedOrderId = orderId2 + 'XXX';

  response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: tamperedOrderId,
    razorpay_payment_id: paymentId2,
    razorpay_signature: validSig2, // Valid for original order, NOT for tampered
    planType: 'BASIC',
  }, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
  console.log('Expected: 400 with "Invalid payment signature"');
  console.log();

  // Test 3: Tampered payment ID
  console.log('TEST 3: Tampered Payment ID');
  const orderId3 = 'order_' + Date.now();
  const paymentId3 = 'pay_' + Date.now();
  const validSig3 = generateValidSignature(orderId3, paymentId3);
  const tamperedPaymentId = paymentId3 + 'YYY';

  response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: orderId3,
    razorpay_payment_id: tamperedPaymentId,
    razorpay_signature: validSig3, // Valid for original payment, NOT for tampered
    planType: 'BASIC',
  }, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
  console.log('Expected: 400 with "Invalid payment signature"');
  console.log();

  // Test 4: Wrong secret
  console.log('TEST 4: Wrong Secret in Signature');
  const orderId4 = 'order_' + Date.now();
  const paymentId4 = 'pay_' + Date.now();
  const wrongSig = generateValidSignature(orderId4, paymentId4, 'WRONG_SECRET');

  response = await axios.post(`${API_URL}/api/payments/verify-payment`, {
    razorpay_order_id: orderId4,
    razorpay_payment_id: paymentId4,
    razorpay_signature: wrongSig, // Wrong secret
    planType: 'BASIC',
  }, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
  console.log('Expected: 400 with "Invalid payment signature"');
  console.log();

  // Test 5: Idempotency
  console.log('TEST 5: Idempotency Check');
  const orderId5 = 'order_idempotent_' + Date.now();
  const paymentId5 = 'pay_idempotent_' + Date.now();
  const validSig5 = generateValidSignature(orderId5, paymentId5);

  const payload = {
    razorpay_order_id: orderId5,
    razorpay_payment_id: paymentId5,
    razorpay_signature: validSig5,
    planType: 'BASIC',
  };

  console.log('First request:');
  let response1 = await axios.post(`${API_URL}/api/payments/verify-payment`, payload, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response1.status}`);
  console.log(`Message: ${response1.data?.message}`);

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\nSecond request (duplicate):');
  let response2 = await axios.post(`${API_URL}/api/payments/verify-payment`, payload, {
    headers: {
      'Authorization': `Bearer ${testToken}`,
    },
    validateStatus: () => true,
  });

  console.log(`Status: ${response2.status}`);
  console.log(`Message: ${response2.data?.message}`);
  console.log(`Response:`, JSON.stringify(response2.data, null, 2));
  console.log();
  console.log('Status codes match?', response1.status === response2.status ? 'YES' : 'NO');
  if (response1.status !== response2.status) {
    console.log('BUG: Idempotency issue - same request gets different responses');
  }
}

testSignatureValidation().catch(console.error);
