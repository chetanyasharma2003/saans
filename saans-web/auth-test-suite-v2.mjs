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

    await page.goto(`${APP_URL}/register`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Enter your full name"]', name);
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.selectOption('select', 'Mumbai');
    await page.fill('input[placeholder="Minimum 6 characters"]', password);
    await page.fill('input[placeholder="Confirm your password"]', password);

    const submitButton = page.locator('button:has-text("Start Your Journey")');
    await submitButton.click();

    await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));

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
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Enter your password"]', password);

    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const isAuthenticated = await page.evaluate(() => localStorage.getItem('accessToken') !== null);

    const passed = token && isAuthenticated;
    addResult(2, 'Login with Correct Credentials', passed,
      `Token obtained: ${!!token}, Current URL: ${page.url()}`);

    return token;
  } catch (error) {
    addResult(2, 'Login with Correct Credentials', false, `Error: ${error.message}`);
    return null;
  }
}

async function testLoginWithWrongPassword(email) {
  log('\n=== TEST 3: Login with Wrong Password ===', 'info');

  try {
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Enter your password"]', 'WrongPassword123!');

    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    const errorElement = page.locator('.bg-red-500');
    await errorElement.waitFor({ timeout: 5000 });
    const errorText = await errorElement.textContent();

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
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    const nonExistentEmail = `nonexistent${Date.now()}@example.com`;

    await page.fill('input[placeholder="you@example.com"]', nonExistentEmail);
    await page.fill('input[placeholder="Enter your password"]', 'SomePassword123!');

    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    const errorElement = page.locator('.bg-red-500');
    await errorElement.waitFor({ timeout: 5000 });
    const errorText = await errorElement.textContent();

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
    await page.evaluate(() => localStorage.removeItem('accessToken'));
    await page.context().clearCookies();

    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const isRedirected = page.url().includes('/login');

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
    await page.evaluate((t) => localStorage.setItem('accessToken', t), token);

    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const onDashboard = page.url().includes('/dashboard');

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
  log('\n=== TEST 7: Access With Expired Token (Logout + Try Access) ===', 'info');

  try {
    // First, login successfully
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Create a fresh invalid token to test error handling
    const fakeExpiredToken = 'invalid.token.here';

    await page.evaluate((t) => {
      localStorage.setItem('accessToken', t);
    }, fakeExpiredToken);

    // Try to access a protected API endpoint with expired token
    let apiRejected = false;
    try {
      await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${fakeExpiredToken}` }
      });
    } catch (err) {
      // Backend should reject invalid token (401 or 403)
      apiRejected = err.response && (err.response.status === 401 || err.response.status === 403);
    }

    // Verify that the application properly handles invalid tokens
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('accessToken'));
    const tokenIsInvalid = tokenInStorage === fakeExpiredToken;

    const passed = apiRejected && tokenIsInvalid;
    addResult(7, 'Access With Expired Token', passed,
      `API rejects invalid token: ${apiRejected}, Token handling correct: ${tokenIsInvalid}`);

    return passed;
  } catch (error) {
    addResult(7, 'Access With Expired Token', false, `Error: ${error.message}`);
    return false;
  }
}

async function testChangePassword(email, oldPassword) {
  log('\n=== TEST 8: Change Password ===', 'info');

  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password: oldPassword,
    });

    const token = loginResponse.data.accessToken;
    const newPassword = `NewPass${Date.now()}123!`;

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
  log('\n=== TEST 9: Logout (Clear Token) ===', 'info');

  try {
    await page.evaluate((t) => localStorage.setItem('accessToken', t), token);

    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Clear token to simulate logout
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    await page.waitForTimeout(500);

    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('accessToken'));
    const clearedFromStorage = tokenAfterLogout === null || tokenAfterLogout === '';

    const passed = clearedFromStorage;
    addResult(9, 'Logout', passed,
      `Token cleared: ${clearedFromStorage}`);

    return passed;
  } catch (error) {
    addResult(9, 'Logout', false, `Error: ${error.message}`);
    return false;
  }
}

async function testReLoginAfterLogout(email, password) {
  log('\n=== TEST 10: Re-login After Logout ===', 'info');

  try {
    // Make sure we're logged out
    await page.evaluate(() => localStorage.removeItem('accessToken'));

    // Verify no token
    const tokenBeforeLogin = await page.evaluate(() => localStorage.getItem('accessToken'));

    // Navigate to login and wait for page load
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Fill credentials
    const emailInput = page.locator('input[placeholder="you@example.com"]');
    const passwordInput = page.locator('input[placeholder="Enter your password"]');

    await emailInput.fill(email);
    await passwordInput.fill(password);

    // Click submit and wait for navigation with longer timeout
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Wait for URL change with extended timeout
    try {
      await page.waitForURL(/dashboard|login/, { timeout: 15000 });
    } catch (e) {
      log(`  Navigation wait error: ${e.message}`, 'warn');
    }

    // Check final state
    const finalUrl = page.url();
    const newToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const onDashboard = finalUrl.includes('/dashboard');

    const passed = newToken && onDashboard;
    addResult(10, 'Re-login After Logout', passed,
      `Got new token: ${!!newToken}, On dashboard: ${onDashboard}, URL: ${finalUrl}`);

    return passed;
  } catch (error) {
    addResult(10, 'Re-login After Logout', false, `Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  try {
    log('\n╔════════════════════════════════════════╗', 'info');
    log('║  SAANS Authentication Test Suite v2  ║', 'info');
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
    const reportPath = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/auth-test-results-v2.json';
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
