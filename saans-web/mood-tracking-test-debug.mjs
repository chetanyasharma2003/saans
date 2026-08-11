#!/usr/bin/env node

import { chromium } from 'playwright';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const APP_URL = 'http://localhost:5173';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiCall(method, endpoint, data = null, authToken) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      timeout: 10000,
    };
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

async function main() {
  console.log('\n[DEBUG] Mood Tracker - Page Loading Test\n');

  const TEST_EMAIL = `debug${Date.now()}@example.com`;
  const TEST_PASSWORD = 'TestPassword123!';

  // Auth
  console.log('[1] Registering user...');
  const authRes = await apiCall('POST', '/api/auth/register', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: 'Debug Test User',
  });

  if (!authRes.success) {
    console.log('  Login response:', authRes.error);
    const loginRes = await apiCall('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    console.log('  Login status:', loginRes.success ? 'OK' : 'FAIL');
    return;
  }

  const authToken = authRes.data?.accessToken || authRes.data?.data?.token;
  console.log(`  ✓ Auth token: ${authToken.substring(0, 20)}...`);

  // Launch browser
  console.log('\n[2] Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set token and navigate
  console.log('[3] Setting token and navigating to mood tracker...');
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await page.evaluate((token) => {
    localStorage.setItem('authToken', token);
  }, authToken);

  // Navigate to mood tracker
  await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'load' });
  await delay(3000);

  console.log('[4] Checking page content...');

  // Check page title
  const title = await page.title();
  console.log(`  Page title: ${title}`);

  // Check for key elements
  const content = await page.content();
  const checks = {
    'Mood Tracker': content.includes('Mood Tracker'),
    'How are you feeling': content.includes('How are you feeling'),
    'Happy button': content.includes('Happy'),
    'Calm button': content.includes('Calm'),
    'Intensity': content.includes('Intensity'),
    'Save button': content.includes('Save Mood'),
    'Input range': content.includes('input type="range"') || content.includes('range'),
    'Textarea': content.includes('textarea'),
  };

  Object.entries(checks).forEach(([name, found]) => {
    console.log(`  ${found ? '✓' : '✗'} ${name}`);
  });

  console.log('\n[5] Checking for visible UI elements...');

  // Check for buttons
  const buttons = await page.locator('button').count();
  console.log(`  Buttons on page: ${buttons}`);

  // Try to find Happy mood button
  try {
    const happyBtn = page.locator('button:has-text("Happy")');
    const isVisible = await happyBtn.isVisible({ timeout: 3000 });
    console.log(`  Happy button visible: ${isVisible}`);

    if (isVisible) {
      console.log('  → Attempting to click Happy button...');
      await happyBtn.click();
      await delay(500);
      console.log('  ✓ Happy button clicked successfully');

      // Check if mood selected
      const selected = await page.locator('[class*="selected"]').count();
      console.log(`  Mood selected elements: ${selected}`);
    }
  } catch (e) {
    console.log(`  Error with Happy button: ${e.message}`);
  }

  console.log('\n[6] Checking API endpoints...');

  // Test mood API
  const moodRes = await apiCall('GET', '/api/moods/my-moods', null, authToken);
  console.log(`  GET /api/moods/my-moods: ${moodRes.success ? 'OK' : 'FAIL'}`);
  if (moodRes.success) {
    console.log(`    Entries: ${moodRes.data?.data?.length || 0}`);
  }

  const analyticsRes = await apiCall('GET', '/api/moods/analytics', null, authToken);
  console.log(`  GET /api/moods/analytics: ${analyticsRes.success ? 'OK' : 'FAIL'}`);
  if (analyticsRes.success) {
    console.log(`    Total: ${analyticsRes.data?.data?.totalEntries || 0}`);
  }

  console.log('\n[7] Taking screenshot...');
  await page.screenshot({ path: '/tmp/mood-tracker-debug.png' });
  console.log('  Screenshot saved to /tmp/mood-tracker-debug.png');

  console.log('\n[8] Page source excerpt:\n');
  const html = await page.content();
  // Get a snippet around "Happy"
  const happyIdx = html.indexOf('Happy');
  if (happyIdx > -1) {
    console.log(html.substring(Math.max(0, happyIdx - 200), happyIdx + 200));
  }

  await browser.close();
  console.log('\n[Done]\n');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
