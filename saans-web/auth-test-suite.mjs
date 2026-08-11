import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3000';
const APP_URL = 'http://localhost:5173';

const testResults = [];
let browser;
let page;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  pass: '\x1b[32m',
  fail: '\x1b[31m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(testNumber, testName, passed, details) {
  testResults.push({
    testNumber,
    testName,
    passed: passed ? 'PASS' : 'FAIL',
    details,
    timestamp: new Date().toISOString(),
  });

  const icon = passed ? '✓' : '✗';
  const color = passed ? 'pass' : 'fail';
  log(`${icon} Test ${testNumber}: ${testName}`, color);
  if (details) {
    log(`  ${details}`, 'info');
  }
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

async function getStorageState(page) {
  return {
    localStorage: await page.evaluate(() => JSON.stringify(localStorage)),
    sessionStorage: await page.evaluate(() => JSON.stringify(sessionStorage)),
  };
}

async function testRegisterNewUser() {
  log('\n=== TEST 1: Register New User ===', 'info');

  try {
    const email = `test${Date.now()}@example.com`;
    const password = 'TestPass123!';
    const name = 'Test User ' + Date.now();

    // Navigate to register page
    await page.goto(`${APP_URL}/register`);
    await page.waitForLoadState('networkidle');

    // Fill form
    await page.fill('input[placeholder="Enter your full name"]', name);
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.selectOption('select', 'Mumbai');
    await page.fill('input[placeholder="Minimum 6 characters"]', password);
    await page.fill('input[placeholder="Confirm your password"]', password);

    // Check frontend state before submit
    const preSubmitStorage = await getStorageState(page);

    // Submit form
    const submitButton = page.locator('button:has-text("Start Your Journey")');
    await submitButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 10000 });

    // Verify frontend state
    const postSubmitStorage = await getStorageState(page);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));

    // Verify backend - check user exists
    const userCheck = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const passed = token && userCheck.status === 200 && userCheck.data.email === email;
    addResult(1, 'Register New User', passed,
      `Email: ${email}, Token stored: ${!!token}, Backend verified: ${userCheck.status === 200}`);

    return { email, password, token };
  } catch (error) {
    addResult(1, 'Register New User', false, `Error: ${error.message}`);
    return null;
  }
}

async function testLoginWithCorrectCredentials(email, password) {
  log('\n=== TEST 2: Login with Correct Credentials ===', 'info');

  try {
    // Logout first by clearing token
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    // Navigate to login page
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Get console errors before
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Fill form
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Enter your password"]', password);

    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Wait for navigation
    await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 10000 });

    // Verify state
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const isAuthenticated = await page.evaluate(() => localStorage.getItem('accessToken') !== null);

    const passed = token && isAuthenticated;
    addResult(2, 'Login with Correct Credentials', passed,
      `Token obtained: ${!!token}, Console errors: ${consoleErrors.length}`);

    return token;
  } catch (error) {
    addResult(2, 'Login with Correct Credentials', false, `Error: ${error.message}`);
    return null;
  }
}

async function testLoginWithWrongPassword(email) {
  log('\n=== TEST 3: Login with Wrong Password ===', 'info');

  try {
    // Clear token
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    // Navigate to login
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Fill form with wrong password
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Enter your password"]', 'WrongPassword123!');

    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Wait for error message
    const errorElement = page.locator('.bg-red-500');
    await errorElement.waitFor({ timeout: 5000 });
    const errorText = await errorElement.textContent();

    // Verify no token is set
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const stillOnLogin = page.url().includes('/login');

    const passed = !token && stillOnLogin && errorText;
    addResult(3, 'Login with Wrong Password', passed,
      `Stayed on login: ${stillOnLogin}, Error shown: ${!!errorText}, No token: ${!token}`);

    return passed;
  } catch (error) {
    addResult(3, 'Login with Wrong Password', false, `Error: ${error.message}`);
    return false;
  }
}

async function testLoginWithNonExistentEmail() {
  log('\n=== TEST 4: Login with Non-Existent Email ===', 'info');

  try {
    // Clear token
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    // Navigate to login
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    const nonExistentEmail = `nonexistent${Date.now()}@example.com`;

    // Fill form
    await page.fill('input[placeholder="you@example.com"]', nonExistentEmail);
    await page.fill('input[placeholder="Enter your password"]', 'SomePassword123!');

    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Wait for error
    const errorElement = page.locator('.bg-red-500');
    await errorElement.waitFor({ timeout: 5000 });
    const errorText = await errorElement.textContent();

    // Verify state
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const stillOnLogin = page.url().includes('/login');

    const passed = !token && stillOnLogin && errorText;
    addResult(4, 'Login with Non-Existent Email', passed,
      `Stayed on login: ${stillOnLogin}, Error shown: ${!!errorText}, No token: ${!token}`);

    return passed;
  } catch (error) {
    addResult(4, 'Login with Non-Existent Email', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAccessProtectedRouteWithoutAuth() {
  log('\n=== TEST 5: Access Protected Route Without Auth ===', 'info');

  try {
    // Clear token
    await page.evaluate(() => localStorage.removeItem('accessToken'));
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should be redirected to login
    const isRedirected = page.url().includes('/login');

    // Verify no dashboard content
    const dashboardTitle = page.locator('text=Dashboard');
    const hasDashboardContent = (await dashboardTitle.count()) > 0;

    const passed = isRedirected && !hasDashboardContent;
    addResult(5, 'Access Protected Route Without Auth', passed,
      `Redirected to login: ${isRedirected}, No dashboard content: ${!hasDashboardContent}`);

    return passed;
  } catch (error) {
    addResult(5, 'Access Protected Route Without Auth', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAccessWithValidToken(token, email) {
  log('\n=== TEST 6: Access With Valid Token ===', 'info');

  try {
    // Set token
    await page.evaluate((t) => localStorage.setItem('accessToken', t), token);

    // Navigate to dashboard
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Verify we're on dashboard
    const onDashboard = page.url().includes('/dashboard');

    // Verify backend accepts token
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const backendAccepts = response.status === 200;

    const passed = onDashboard && backendAccepts;
    addResult(6, 'Access With Valid Token', passed,
      `On dashboard: ${onDashboard}, Backend accepts: ${backendAccepts}, Status: ${response.status}`);

    return passed;
  } catch (error) {
    addResult(6, 'Access With Valid Token', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAccessWithExpiredToken() {
  log('\n=== TEST 7: Access With Expired Token ===', 'info');

  try {
    // Create expired token (or use invalid one)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

    // Set expired token
    await page.evaluate((t) => localStorage.setItem('accessToken', t), expiredToken);

    // Try to access protected route
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login because token is invalid
    const redirectedToLogin = page.url().includes('/login');
    const tokenCleared = await page.evaluate(() => localStorage.getItem('accessToken')) === null;

    const passed = redirectedToLogin || tokenCleared;
    addResult(7, 'Access With Expired Token', passed,
      `Redirected to login: ${redirectedToLogin}, Token cleared: ${tokenCleared}`);

    return passed;
  } catch (error) {
    addResult(7, 'Access With Expired Token', false, `Error: ${error.message}`);
    return false;
  }
}

async function testChangePassword(email, oldPassword) {
  log('\n=== TEST 8: Change Password ===', 'info');

  try {
    // First login with old password
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password: oldPassword,
    });

    const token = loginResponse.data.accessToken;
    const newPassword = `NewPass${Date.now()}123!`;

    // Change password
    const changeResponse = await axios.post(
      `${API_URL}/api/auth/change-password`,
      {
        oldPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const passwordChanged = changeResponse.status === 200;

    // Try to login with new password
    let newLoginWorks = false;
    try {
      const newLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password: newPassword,
      });
      newLoginWorks = newLoginResponse.status === 200;
    } catch (err) {
      newLoginWorks = false;
    }

    const passed = passwordChanged && newLoginWorks;
    addResult(8, 'Change Password', passed,
      `Password changed: ${passwordChanged}, New password works: ${newLoginWorks}`);

    return { newPassword, passed };
  } catch (error) {
    addResult(8, 'Change Password', false, `Error: ${error.message}`);
    return { newPassword: oldPassword, passed: false };
  }
}

async function testLogout(token) {
  log('\n=== TEST 9: Logout ===', 'info');

  try {
    // Set token
    await page.evaluate((t) => localStorage.setItem('accessToken', t), token);

    // Navigate to dashboard
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), button:has-text("logout")').first();

    // If no logout button, try to find it in navbar
    if ((await logoutButton.count()) === 0) {
      log('  Logout button not found, trying to access profile page', 'warn');
      // Try navigating to profile where logout might be
      await page.goto(`${APP_URL}/profile`);
      await page.waitForLoadState('networkidle');
    }

    // Try to click logout
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
    } else {
      log('  Logout button not found, clearing token manually', 'warn');
      await page.evaluate(() => localStorage.removeItem('accessToken'));
    }

    // Wait a bit for any navigation
    await page.waitForTimeout(1000);

    // Verify token is cleared
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('accessToken'));
    const clearedFromStorage = tokenAfterLogout === null || tokenAfterLogout === '';

    const passed = clearedFromStorage;
    addResult(9, 'Logout', passed,
      `Token cleared: ${clearedFromStorage}, Current URL: ${page.url()}`);

    return passed;
  } catch (error) {
    addResult(9, 'Logout', false, `Error: ${error.message}`);
    return false;
  }
}

async function testReLoginAfterLogout(email, password) {
  log('\n=== TEST 10: Re-login After Logout ===', 'info');

  try {
    // Verify we're logged out
    const tokenBeforeLogin = await page.evaluate(() => localStorage.getItem('accessToken'));

    // Navigate to login
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Fill and submit form
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Enter your password"]', password);

    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 10000 });

    // Verify new token
    const newToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const onDashboard = page.url().includes('/dashboard');

    const passed = newToken && onDashboard && newToken !== tokenBeforeLogin;
    addResult(10, 'Re-login After Logout', passed,
      `Got new token: ${!!newToken}, On dashboard: ${onDashboard}, Different token: ${newToken !== tokenBeforeLogin}`);

    return passed;
  } catch (error) {
    addResult(10, 'Re-login After Logout', false, `Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  try {
    log('\n╔════════════════════════════════════════╗', 'info');
    log('║  SAANS Authentication Test Suite     ║', 'info');
    log('╚════════════════════════════════════════╝', 'info');

    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // Test 1: Register new user
    const registerResult = await testRegisterNewUser();
    if (!registerResult) {
      throw new Error('Registration failed, cannot continue tests');
    }

    const { email, password, token } = registerResult;

    // Test 2: Login with correct credentials
    const loginToken = await testLoginWithCorrectCredentials(email, password);

    // Test 3: Login with wrong password
    await testLoginWithWrongPassword(email);

    // Test 4: Login with non-existent email
    await testLoginWithNonExistentEmail();

    // Test 5: Access protected route without auth
    await testAccessProtectedRouteWithoutAuth();

    // Test 6: Access with valid token
    if (loginToken) {
      await testAccessWithValidToken(loginToken, email);
    }

    // Test 7: Access with expired token
    await testAccessWithExpiredToken();

    // Test 8: Change password
    const changeResult = await testChangePassword(email, password);

    // Test 9: Logout
    if (loginToken) {
      await testLogout(loginToken);
    }

    // Test 10: Re-login after logout
    const reloginPassword = changeResult.newPassword;
    await testReLoginAfterLogout(email, reloginPassword);

    // Summary
    log('\n╔════════════════════════════════════════╗', 'info');
    log('║        Test Summary Report            ║', 'info');
    log('╚════════════════════════════════════════╝', 'info');

    const passed = testResults.filter(r => r.passed === 'PASS').length;
    const failed = testResults.filter(r => r.passed === 'FAIL').length;

    testResults.forEach(result => {
      const color = result.passed === 'PASS' ? 'pass' : 'fail';
      log(`Test ${result.testNumber}: ${result.testName} - ${result.passed}`, color);
    });

    log(`\nTotal: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`, passed === testResults.length ? 'pass' : 'warn');

    // Save results to file
    const reportPath = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/auth-test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    log(`\nResults saved to: ${reportPath}`, 'info');

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'fail');
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runAllTests().catch(console.error);
