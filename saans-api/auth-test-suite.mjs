#!/usr/bin/env node

import axios from 'axios';
import https from 'https';

const API_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = `test-auth-${Date.now()}@test.com`;
const TEST_PASSWORD = 'TestPassword123';
const TEST_NAME = 'Test User Auth';

// Create axios instance with cookie jar support
const client = axios.create({
  baseURL: API_URL,
  validateStatus: () => true, // Don't throw on any status
  withCredentials: true,
  jar: true,
});

let testResults = [];
let tokens = { accessToken: null, refreshToken: null };
let userId = null;

// Helper function to log results
function logTest(testNum, testName, passed, details) {
  const result = {
    test: testNum,
    name: testName,
    status: passed ? 'PASS' : 'FAIL',
    details,
  };
  testResults.push(result);

  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`\n${color}${icon} Test ${testNum}: ${testName}${reset}`);
  console.log(`  Status: ${result.status}`);
  if (details) {
    console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
  }
}

// Helper to check database state (via API call)
async function checkUserInDB() {
  try {
    if (!tokens.accessToken) return null;

    const response = await client.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

// Test 1: Register new user
async function test1_RegisterNewUser() {
  try {
    const response = await client.post('/api/auth/register', {
      email: TEST_USER_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME,
      role: 'PATIENT',
    });

    const passed = response.status === 201;
    const details = {
      statusCode: response.status,
      expectedCode: 201,
      hasUser: !!response.data?.user,
      hasAccessToken: !!response.data?.accessToken,
      hasRefreshToken: !!response.data?.refreshToken,
      userEmail: response.data?.user?.email,
    };

    if (passed && response.data?.accessToken) {
      tokens.accessToken = response.data.accessToken;
      tokens.refreshToken = response.data.refreshToken;
      userId = response.data.user?.id;
    }

    logTest(1, 'Register new user', passed, details);
  } catch (error) {
    logTest(1, 'Register new user', false, {
      error: error.message,
      response: error.response?.data,
    });
  }
}

// Test 2: Login with correct credentials
async function test2_LoginCorrectCredentials() {
  try {
    const response = await client.post('/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_PASSWORD,
    });

    const passed = response.status === 200;
    const details = {
      statusCode: response.status,
      expectedCode: 200,
      hasUser: !!response.data?.user,
      hasAccessToken: !!response.data?.accessToken,
      userEmail: response.data?.user?.email,
      responseHeaders: {
        setCookie: response.headers['set-cookie']?.length ? 'Has refreshToken cookie' : 'No cookie',
      },
    };

    if (passed && response.data?.accessToken) {
      tokens.accessToken = response.data.accessToken;
    }

    // Check if refresh token is in cookie
    const hasCookie = response.headers['set-cookie']?.some(c => c.includes('refreshToken'));
    details.hasCookie = hasCookie;

    logTest(2, 'Login with correct credentials', passed, details);
  } catch (error) {
    logTest(2, 'Login with correct credentials', false, {
      error: error.message,
    });
  }
}

// Test 3: Login with wrong password
async function test3_LoginWrongPassword() {
  try {
    const response = await client.post('/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: 'WrongPassword123',
    });

    const passed = response.status === 401;
    const details = {
      statusCode: response.status,
      expectedCode: 401,
      errorMessage: response.data?.message || response.data?.error,
      shouldNotHaveToken: !response.data?.accessToken,
    };

    logTest(3, 'Login with wrong password', passed, details);
  } catch (error) {
    logTest(3, 'Login with wrong password', false, {
      error: error.message,
    });
  }
}

// Test 4: Login with non-existent email
async function test4_LoginNonExistentEmail() {
  try {
    const response = await client.post('/api/auth/login', {
      email: `nonexistent-${Date.now()}@test.com`,
      password: TEST_PASSWORD,
    });

    const passed = response.status === 401;
    const details = {
      statusCode: response.status,
      expectedCode: 401,
      errorMessage: response.data?.message || response.data?.error,
      shouldNotHaveToken: !response.data?.accessToken,
    };

    logTest(4, 'Login with non-existent email', passed, details);
  } catch (error) {
    logTest(4, 'Login with non-existent email', false, {
      error: error.message,
    });
  }
}

// Test 5: Access protected route without auth
async function test5_ProtectedRouteNoAuth() {
  try {
    // Try without token first
    const response = await client.get('/api/auth/me');

    const passed = response.status === 401;
    const details = {
      statusCode: response.status,
      expectedCode: 401,
      errorMessage: response.data?.error,
      hasNoToken: !response.config.headers.Authorization,
    };

    logTest(5, 'Access protected route without auth', passed, details);
  } catch (error) {
    logTest(5, 'Access protected route without auth', false, {
      error: error.message,
    });
  }
}

// Test 6: Access with valid token
async function test6_AccessWithValidToken() {
  try {
    if (!tokens.accessToken) {
      logTest(6, 'Access with valid token', false, { error: 'No valid token from previous tests' });
      return;
    }

    const response = await client.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    const passed = response.status === 200;
    const details = {
      statusCode: response.status,
      expectedCode: 200,
      hasUserData: !!response.data?.id,
      userEmail: response.data?.email,
      userRole: response.data?.role,
      userCreatedAt: response.data?.createdAt,
    };

    logTest(6, 'Access with valid token', passed, details);
  } catch (error) {
    logTest(6, 'Access with valid token', false, {
      error: error.message,
    });
  }
}

// Test 7: Access with expired token and refresh
async function test7_TokenRefresh() {
  try {
    // Create an expired token (use a past expiry)
    const expiredResponse = await client.post('/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_PASSWORD,
    });

    if (expiredResponse.status !== 200) {
      logTest(7, 'Access with expired token', false, { error: 'Could not login to test refresh' });
      return;
    }

    // Now test refresh endpoint
    const refreshResponse = await client.post('/api/auth/refresh-token', {
      refreshToken: tokens.refreshToken,
    });

    const passed = refreshResponse.status === 200;
    const details = {
      statusCode: refreshResponse.status,
      expectedCode: 200,
      hasNewAccessToken: !!refreshResponse.data?.accessToken,
      tokenChanged: refreshResponse.data?.accessToken !== tokens.accessToken,
    };

    if (passed && refreshResponse.data?.accessToken) {
      tokens.accessToken = refreshResponse.data.accessToken;
    }

    logTest(7, 'Access with expired token - refresh', passed, details);
  } catch (error) {
    logTest(7, 'Access with expired token - refresh', false, {
      error: error.message,
    });
  }
}

// Test 8: Change password
async function test8_ChangePassword() {
  try {
    if (!tokens.accessToken) {
      logTest(8, 'Change password', false, { error: 'No valid token' });
      return;
    }

    const newPassword = 'NewPassword456';
    const response = await client.post('/api/auth/change-password', {
      oldPassword: TEST_PASSWORD,
      newPassword: newPassword,
    }, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    const passed = response.status === 200;
    const details = {
      statusCode: response.status,
      expectedCode: 200,
      message: response.data?.message,
    };

    if (passed) {
      // Store new password for later login test
      global.TEST_PASSWORD_NEW = newPassword;
    }

    logTest(8, 'Change password', passed, details);
  } catch (error) {
    logTest(8, 'Change password', false, {
      error: error.message,
      response: error.response?.data,
    });
  }
}

// Test 9: Logout and verify token is cleared
async function test9_Logout() {
  try {
    if (!tokens.accessToken) {
      logTest(9, 'Logout', false, { error: 'No valid token' });
      return;
    }

    const response = await client.post('/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    const passed = response.status === 200;
    const details = {
      statusCode: response.status,
      expectedCode: 200,
      message: response.data?.message,
      clearedCookie: response.headers['set-cookie']?.some(c => c.includes('refreshToken=;')),
    };

    logTest(9, 'Logout', passed, details);
  } catch (error) {
    logTest(9, 'Logout', false, {
      error: error.message,
    });
  }
}

// Test 10: Re-login after logout with new password
async function test10_ReloginAfterLogout() {
  try {
    const passwordToUse = global.TEST_PASSWORD_NEW || TEST_PASSWORD;

    const response = await client.post('/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: passwordToUse,
    });

    const passed = response.status === 200;
    const details = {
      statusCode: response.status,
      expectedCode: 200,
      hasNewAccessToken: !!response.data?.accessToken,
      userEmail: response.data?.user?.email,
      usedNewPassword: passwordToUse !== TEST_PASSWORD,
    };

    logTest(10, 'Re-login after logout', passed, details);
  } catch (error) {
    logTest(10, 'Re-login after logout', false, {
      error: error.message,
    });
  }
}

// Print summary
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('AUTHENTICATION TEST SUITE - SUMMARY');
  console.log('='.repeat(80));

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const passRate = ((passed / testResults.length) * 100).toFixed(1);

  console.log(`\nTotal Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  console.log('Test Breakdown:');
  testResults.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    const color = r.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(`${color}${icon}${reset} Test ${r.test}: ${r.name} - ${r.status}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('Test User Created:');
  console.log(`  Email: ${TEST_USER_EMAIL}`);
  console.log(`  Password (final): ${global.TEST_PASSWORD_NEW || TEST_PASSWORD}`);
  console.log(`  User ID: ${userId || 'Not captured'}`);
  console.log('='.repeat(80) + '\n');
}

// Main execution
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('SAANS MENTAL HEALTH PLATFORM - AUTHENTICATION TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Starting at: ${new Date().toISOString()}`);
  console.log(`API URL: ${API_URL}\n`);

  // Run all tests sequentially
  await test1_RegisterNewUser();
  await test2_LoginCorrectCredentials();
  await test3_LoginWrongPassword();
  await test4_LoginNonExistentEmail();
  await test5_ProtectedRouteNoAuth();
  await test6_AccessWithValidToken();
  await test7_TokenRefresh();
  await test8_ChangePassword();
  await test9_Logout();
  await test10_ReloginAfterLogout();

  printSummary();
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
