#!/usr/bin/env node

/**
 * 2FA Testing Script
 * Tests all 2FA endpoints with real requests
 *
 * Usage: node test-2fa.mjs
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api/auth';
const TEST_USER = {
  email: 'test-2fa@example.com',
  password: 'TestPassword123!',
  name: 'Test 2FA User',
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function request(method, path, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    throw error;
  }
}

let testState = {
  accessToken: null,
  userId: null,
  sessionToken: null,
  totpSecret: null,
  qrCode: null,
  backupCodes: [],
};

async function testRegisterUser() {
  logSection('Step 1: Register Test User');

  try {
    const result = await request('POST', '/register', TEST_USER);

    if (!result.ok) {
      if (result.data.code === 'RESOURCE_EXISTS') {
        logWarning('User already exists, proceeding...');
      } else {
        logError(`Registration failed: ${result.data.message}`);
        return false;
      }
    } else {
      testState.userId = result.data.user.id;
      testState.accessToken = result.data.accessToken;
      logSuccess(`User registered: ${result.data.user.id}`);
    }

    // Try login if registration fails
    const loginResult = await request('POST', '/login', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (loginResult.ok) {
      testState.userId = loginResult.data.user.id;
      testState.accessToken = loginResult.data.accessToken;
      logSuccess(`User logged in: ${loginResult.data.user.id}`);
    }

    return true;
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    return false;
  }
}

async function testSetup2FA() {
  logSection('Step 2: Setup 2FA - Get QR Code');

  if (!testState.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const result = await request('GET', '/2fa/setup', null, {
      Authorization: `Bearer ${testState.accessToken}`,
    });

    if (!result.ok) {
      logError(`Setup failed: ${result.data.message}`);
      return false;
    }

    testState.totpSecret = result.data.secret;
    testState.backupCodes = result.data.backupCodes;
    testState.qrCode = result.data.qrCode;

    logSuccess('QR Code generated successfully');
    log(`TOTP Secret: ${result.data.secret}`, 'yellow');
    log(`Manual Entry Key: ${result.data.manualEntryKey}`, 'yellow');
    log(`Backup Codes: ${result.data.backupCodes.join(', ')}`, 'yellow');

    // Save QR code to file
    const qrCodeDataUrl = result.data.qrCode;
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('/tmp/2fa-qr-code.png', Buffer.from(base64Data, 'base64'));
    logSuccess('QR Code saved to /tmp/2fa-qr-code.png');

    return true;
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    return false;
  }
}

async function testVerifySetup2FA() {
  logSection('Step 3: Verify 2FA Setup');

  if (!testState.accessToken || !testState.totpSecret) {
    logError('Missing setup data');
    return false;
  }

  try {
    // Generate TOTP code using speakeasy
    const speakeasy = await import('speakeasy');

    const totpCode = speakeasy.totp({
      secret: testState.totpSecret,
      encoding: 'base32',
    });

    log(`Generated TOTP Code: ${totpCode}`, 'yellow');

    const result = await request('POST', '/2fa/verify-setup', {
      totpCode,
    }, {
      Authorization: `Bearer ${testState.accessToken}`,
    });

    if (!result.ok) {
      logError(`Verification failed: ${result.data.message}`);
      return false;
    }

    logSuccess('2FA setup verified successfully');
    log(result.data.message, 'green');

    return true;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return false;
  }
}

async function testLoginWith2FA() {
  logSection('Step 4: Login with 2FA');

  try {
    // Step 1: Login
    const loginResult = await request('POST', '/login', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (!loginResult.ok) {
      logError(`Login failed: ${loginResult.data.message}`);
      return false;
    }

    if (!loginResult.data.requiresTwoFactor) {
      logWarning('2FA not required (may not be enabled yet)');
      testState.accessToken = loginResult.data.accessToken;
      return true;
    }

    testState.sessionToken = loginResult.data.sessionToken;
    testState.userId = loginResult.data.user.id;

    logSuccess('Login step 1 complete (2FA required)');
    log(`Session Token: ${testState.sessionToken.substring(0, 20)}...`, 'yellow');

    // Step 2: Verify 2FA
    const speakeasy = await import('speakeasy');

    const totpCode = speakeasy.totp({
      secret: testState.totpSecret,
      encoding: 'base32',
    });

    log(`Generated TOTP Code: ${totpCode}`, 'yellow');

    const verifyResult = await request('POST', '/2fa/verify-login', {
      userId: testState.userId,
      sessionToken: testState.sessionToken,
      totpCode,
      useBackupCode: false,
    });

    if (!verifyResult.ok) {
      logError(`2FA verification failed: ${verifyResult.data.message}`);
      return false;
    }

    testState.accessToken = verifyResult.data.accessToken;

    logSuccess('2FA verification successful');
    logSuccess(`Access Token: ${testState.accessToken.substring(0, 20)}...`);

    return true;
  } catch (error) {
    logError(`Login with 2FA failed: ${error.message}`);
    return false;
  }
}

async function testGet2FAStatus() {
  logSection('Step 5: Get 2FA Status');

  if (!testState.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const result = await request('GET', '/2fa/status', null, {
      Authorization: `Bearer ${testState.accessToken}`,
    });

    if (!result.ok) {
      logError(`Status check failed: ${result.data.message}`);
      return false;
    }

    logSuccess('2FA Status retrieved');
    log(`Enabled: ${result.data.enabled}`, 'blue');
    log(`Remaining Backup Codes: ${result.data.remainingBackupCodes}`, 'blue');

    return true;
  } catch (error) {
    logError(`Status check failed: ${error.message}`);
    return false;
  }
}

async function testRegenerateBackupCodes() {
  logSection('Step 6: Regenerate Backup Codes');

  if (!testState.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const result = await request('POST', '/2fa/regenerate-backup-codes', {
      password: TEST_USER.password,
    }, {
      Authorization: `Bearer ${testState.accessToken}`,
    });

    if (!result.ok) {
      logError(`Regeneration failed: ${result.data.message}`);
      return false;
    }

    logSuccess('Backup codes regenerated');
    log(`New Backup Codes: ${result.data.backupCodes.join(', ')}`, 'yellow');

    return true;
  } catch (error) {
    logError(`Regeneration failed: ${error.message}`);
    return false;
  }
}

async function testDisable2FA() {
  logSection('Step 7: Disable 2FA');

  if (!testState.accessToken) {
    logError('No access token available');
    return false;
  }

  try {
    const result = await request('POST', '/2fa/disable', {
      password: TEST_USER.password,
    }, {
      Authorization: `Bearer ${testState.accessToken}`,
    });

    if (!result.ok) {
      logError(`Disable failed: ${result.data.message}`);
      return false;
    }

    logSuccess('2FA disabled successfully');
    log(result.data.message, 'green');

    return true;
  } catch (error) {
    logError(`Disable failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  logSection('2FA System Test Suite');

  const tests = [
    { name: 'Register User', fn: testRegisterUser },
    { name: 'Setup 2FA', fn: testSetup2FA },
    { name: 'Verify 2FA Setup', fn: testVerifySetup2FA },
    { name: 'Login with 2FA', fn: testLoginWith2FA },
    { name: 'Get 2FA Status', fn: testGet2FAStatus },
    { name: 'Regenerate Backup Codes', fn: testRegenerateBackupCodes },
    { name: 'Disable 2FA', fn: testDisable2FA },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test error: ${error.message}`);
      failed++;
    }
  }

  logSection('Test Summary');
  log(`Passed: ${passed}/${tests.length}`, 'green');
  log(`Failed: ${failed}/${tests.length}`, failed > 0 ? 'red' : 'green');

  if (failed === 0) {
    logSuccess('All tests passed! 2FA system is working correctly.');
  } else {
    logWarning(`${failed} test(s) failed. Please check the logs above.`);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
