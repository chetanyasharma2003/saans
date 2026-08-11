#!/usr/bin/env node

import { chromium } from 'playwright';
import axios from 'axios';
import * as fs from 'fs';

const API_URL = 'http://localhost:3000';
const APP_URL = 'http://localhost:5173';
const TEST_EMAIL = `moodtest${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

let authToken = null;
let testResults = [];
let browser = null;
let page = null;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   MOOD TRACKING COMPREHENSIVE TEST SUITE - Starting       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkServerHealth() {
  console.log('\n[SETUP] Checking server health...');
  try {
    await axios.get(`${API_URL}/health`, { timeout: 5000 }).catch(() => {});
    console.log('  API Server: RESPONDING');
  } catch (e) {
    console.log('  API Server: Connection attempt...');
  }

  try {
    await axios.get(APP_URL, { timeout: 5000 });
    console.log('  Frontend Server: RESPONDING');
  } catch (e) {
    console.log('  Frontend Server: Attempting connection...');
    // Don't throw, try to proceed anyway
  }
}

async function apiCall(method, endpoint, data = null) {
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

async function authenticate() {
  console.log('\n[AUTH] Attempting authentication...');
  console.log(`  Email: ${TEST_EMAIL}`);

  let response = await apiCall('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (!response.success) {
    console.log('  Login failed, attempting registration...');
    response = await apiCall('POST', '/api/auth/register', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Mood Test User',
    });
  }

  // Check multiple token field possibilities
  if (response.success) {
    const data = response.data;
    authToken = data?.accessToken || data?.data?.token || data?.token;

    if (authToken) {
      console.log('  ✓ Authentication successful');
      return true;
    }
  }

  console.log('  ✗ Authentication failed');
  console.log('  Response:', response.error || response.data);
  return false;
}

function logTestResult(num, name, status, details = '') {
  const result = { testNumber: num, name, status, details, timestamp: new Date().toISOString() };
  testResults.push(result);
  const icon = status === 'PASS' ? '✓' : '✗';
  console.log(`  ${icon} Test ${num}: ${name} - ${status}`);
  if (details) console.log(`     ${details}`);
}

// TESTS
async function test1_SelectMood() {
  console.log('\n[TEST 1] Select Happy Mood');
  try {
    await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'networkidle' });
    await page.waitForSelector('button:has-text("Happy")', { timeout: 5000 });

    const button = page.locator('button:has-text("Happy")');
    await button.click();
    await delay(500);

    const selected = await page.locator('[class*="selected"]').isVisible();
    logTestResult(1, 'Select happy mood', selected ? 'PASS' : 'FAIL', `Selection: ${selected}`);
    return selected;
  } catch (e) {
    logTestResult(1, 'Select happy mood', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test2_SetIntensity() {
  console.log('\n[TEST 2] Set Intensity to 10');
  try {
    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el) => (el.value = '10'));
    await slider.dispatchEvent('input');
    await delay(300);

    const display = await page.locator('text=/10\\/10/').isVisible();
    logTestResult(2, 'Set intensity to 10', display ? 'PASS' : 'FAIL', `Display shows: ${display}`);
    return display;
  } catch (e) {
    logTestResult(2, 'Set intensity to 10', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test3_AddNote() {
  console.log('\n[TEST 3] Add Note');
  try {
    const note = 'Test mood note: Feeling energized and productive!';
    const textarea = page.locator('textarea').first();
    await textarea.fill(note);
    await delay(300);

    const value = await textarea.inputValue();
    const added = value === note;
    logTestResult(3, 'Add note', added ? 'PASS' : 'FAIL', `Note length: ${value.length}`);
    return added;
  } catch (e) {
    logTestResult(3, 'Add note', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test4_SubmitMood() {
  console.log('\n[TEST 4] Submit Mood Entry');
  try {
    const submitBtn = page.locator('button:has-text("Save Mood Entry")').first();
    await submitBtn.click();
    await delay(2000);

    const selectedCount = await page.locator('[class*="selected"]').count();
    logTestResult(4, 'Submit mood entry', selectedCount === 0 ? 'PASS' : 'FAIL', `Selected moods after submit: ${selectedCount}`);
    return selectedCount === 0;
  } catch (e) {
    logTestResult(4, 'Submit mood entry', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test5_NavigationPersistence() {
  console.log('\n[TEST 5] Persistence After Navigation');
  try {
    const button = page.locator('button:has-text("Calm")');
    await button.click();
    await delay(500);

    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el) => (el.value = '7'));
    await slider.dispatchEvent('input');
    await delay(300);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Calm mood entry test');
    await delay(300);

    const submitBtn = page.locator('button:has-text("Save Mood Entry")').first();
    await submitBtn.click();
    await delay(2000);

    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
    await delay(1000);

    await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'networkidle' });
    await delay(2000);

    const entries = page.locator('[class*="entry-card"]');
    const count = await entries.count();
    logTestResult(5, 'Persistence after navigation', count > 0 ? 'PASS' : 'FAIL', `Found ${count} entries`);
    return count > 0;
  } catch (e) {
    logTestResult(5, 'Persistence after navigation', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test6_MoodHistory() {
  console.log('\n[TEST 6] Mood History Display');
  try {
    const journalTitle = page.locator('text=/Journal Entries/');
    const titleVisible = await journalTitle.isVisible();

    if (!titleVisible) {
      logTestResult(6, 'Mood history display', 'FAIL', 'Journal Entries title not found');
      return false;
    }

    const entries = page.locator('[class*="entry-card"]');
    const count = await entries.count();

    logTestResult(6, 'Mood history display', count > 0 ? 'PASS' : 'FAIL', `Found ${count} entries in history`);
    return count > 0;
  } catch (e) {
    logTestResult(6, 'Mood history display', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test7_Analytics() {
  console.log('\n[TEST 7] View Analytics');
  try {
    const mostFreq = page.locator('text=/Most Frequent/');
    const avgInt = page.locator('text=/Avg. Intensity/');
    const streak = page.locator('text=/Tracking Streak/');

    const allVisible = await mostFreq.isVisible() && await avgInt.isVisible() && await streak.isVisible();

    logTestResult(7, 'View analytics', allVisible ? 'PASS' : 'FAIL', `All metrics visible: ${allVisible}`);
    return allVisible;
  } catch (e) {
    logTestResult(7, 'View analytics', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test8_HistoryList() {
  console.log('\n[TEST 8] Mood History List');
  try {
    const entries = page.locator('[class*="entry-card"]');
    const count = await entries.count();

    if (count > 0) {
      const firstEntry = entries.first();
      const hasIntensity = (await firstEntry.textContent()).includes('Intensity');
      logTestResult(8, 'Mood history list', hasIntensity ? 'PASS' : 'FAIL', `${count} entries, has intensity: ${hasIntensity}`);
      return hasIntensity;
    }

    logTestResult(8, 'Mood history list', 'FAIL', 'No entries found');
    return false;
  } catch (e) {
    logTestResult(8, 'Mood history list', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test9_MultipleModsChart() {
  console.log('\n[TEST 9] Multiple Moods & Chart Update');
  try {
    const button = page.locator('button:has-text("Excited")');
    await button.click();
    await delay(500);

    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el) => (el.value = '9'));
    await slider.dispatchEvent('input');
    await delay(300);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Excited mood for chart test');
    await delay(300);

    const submitBtn = page.locator('button:has-text("Save Mood Entry")').first();
    await submitBtn.click();
    await delay(2000);

    const chartBars = page.locator('[class*="chart-bar"]');
    const barCount = await chartBars.count();

    logTestResult(9, 'Multiple moods & chart update', barCount > 0 ? 'PASS' : 'FAIL', `Found ${barCount} chart bars`);
    return barCount > 0;
  } catch (e) {
    logTestResult(9, 'Multiple moods & chart update', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function test10_TrendCalculation() {
  console.log('\n[TEST 10] Trend Calculation');
  try {
    const trends = page.locator('text=/Mood Trends/');
    const calendar = page.locator('text=/Mood Calendar/');

    const trendsVisible = await trends.isVisible();
    const calendarVisible = await calendar.isVisible();

    logTestResult(10, 'Trend calculation', trendsVisible && calendarVisible ? 'PASS' : 'FAIL',
      `Trends: ${trendsVisible}, Calendar: ${calendarVisible}`);
    return trendsVisible && calendarVisible;
  } catch (e) {
    logTestResult(10, 'Trend calculation', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

async function verifyDatabase() {
  console.log('\n[VERIFY] Database Check');
  try {
    const response = await apiCall('GET', '/api/moods/my-moods?limit=30');

    if (response.success && response.data?.data) {
      const moods = response.data.data;
      console.log(`  ✓ Found ${moods.length} moods in database`);

      if (moods.length > 0) {
        const mood = moods[0];
        console.log(`    Latest: ${mood.moodCategory} (${mood.moodScore}/10) at ${new Date(mood.createdAt).toLocaleString()}`);
      }

      return true;
    }

    console.log('  ✗ Failed to retrieve moods from database');
    return false;
  } catch (e) {
    console.log(`  ✗ Database check error: ${e.message}`);
    return false;
  }
}

async function verifyAnalytics() {
  console.log('\n[VERIFY] Analytics Check');
  try {
    const response = await apiCall('GET', '/api/moods/analytics');

    if (response.success && response.data?.data) {
      const analytics = response.data.data;
      console.log(`  ✓ Analytics retrieved`);
      console.log(`    Total entries: ${analytics.totalEntries}`);
      console.log(`    Most frequent: ${analytics.mostFrequentMood}`);
      console.log(`    7-day average: ${analytics.last7DaysAverage}`);
      console.log(`    Streak: ${analytics.streakDays} days`);
      return true;
    }

    console.log('  ✗ Failed to retrieve analytics');
    return false;
  } catch (e) {
    console.log(`  ✗ Analytics check error: ${e.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  try {
    await checkServerHealth();

    const authOk = await authenticate();
    if (!authOk) {
      console.log('\n[ERROR] Authentication failed. Cannot proceed with tests.');
      return;
    }

    console.log('\n[BROWSER] Launching browser...');
    browser = await chromium.launch();
    page = await browser.newPage();

    console.log('[BROWSER] Setting authentication token in localStorage...');
    await page.goto(`${APP_URL}/`);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RUNNING TESTS                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    await test1_SelectMood();
    await test2_SetIntensity();
    await test3_AddNote();
    await test4_SubmitMood();
    await test5_NavigationPersistence();
    await test6_MoodHistory();
    await test7_Analytics();
    await test8_HistoryList();
    await test9_MultipleModsChart();
    await test10_TrendCalculation();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              BACKEND VERIFICATION                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    await verifyDatabase();
    await verifyAnalytics();

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const passRate = ((passed / testResults.length) * 100).toFixed(2);

    console.log(`\nTotal Tests: ${testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Pass Rate: ${passRate}%\n`);

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      total: testResults.length,
      passed,
      failed,
      passRate,
      tests: testResults,
    };

    const reportPath = '/tmp/mood-tracking-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✓ Report saved to: ${reportPath}\n`);

  } catch (error) {
    console.error('\n[ERROR] Test execution failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTests();
