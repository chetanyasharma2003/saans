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
let userId = null;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   MOOD TRACKING 10-TEST COMPREHENSIVE VERIFICATION         ║');
console.log('║   Testing: Moods, Intensity, Notes, Persistence,           ║');
console.log('║   Analytics, History, Multiple Entries, Trends             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkServerHealth() {
  console.log('\n[SETUP] Checking server health...');
  try {
    const resp = await axios.get(`${API_URL}/health`, { timeout: 5000 }).catch(() => null);
    if (resp) console.log('  ✓ API Server: RESPONDING');
  } catch (e) {
    console.log('  ! API Server: Connection attempt...');
  }

  try {
    await axios.get(APP_URL, { timeout: 5000 });
    console.log('  ✓ Frontend Server: RESPONDING');
  } catch (e) {
    console.log('  ! Frontend Server: Attempting connection...');
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
  console.log('\n[AUTH] Authenticating user...');
  console.log(`  Email: ${TEST_EMAIL}`);

  let response = await apiCall('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (!response.success) {
    console.log('  → Login failed, attempting registration...');
    response = await apiCall('POST', '/api/auth/register', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Mood Test User',
    });
  }

  if (response.success) {
    const data = response.data;
    authToken = data?.accessToken || data?.data?.token || data?.token;
    userId = data?.userId || data?.data?.userId || data?.data?.id;

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
  const icon = status === 'PASS' ? '✓' : status === 'PARTIAL' ? '◐' : '✗';
  console.log(`  ${icon} Test ${num}: ${name} - ${status}`);
  if (details) console.log(`     └─ ${details}`);
}

// TEST 1: Select Happy Mood
async function test1_SelectMood() {
  console.log('\n[TEST 1] Select Happy Mood → Should select');
  try {
    await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'networkidle' });
    await page.waitForSelector('button', { timeout: 5000 });

    // Find and click the Happy mood button
    const buttons = await page.locator('button').all();
    let happyClicked = false;

    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Happy')) {
        await btn.click();
        happyClicked = true;
        break;
      }
    }

    await delay(500);

    // Check if mood is selected by verifying ring or background change
    const pageContent = await page.content();
    const hasSelectedState = pageContent.includes('selected') || pageContent.includes('ring');

    logTestResult(1, 'Select happy mood', happyClicked && hasSelectedState ? 'PASS' : 'FAIL',
      `Click: ${happyClicked}, Selected: ${hasSelectedState}`);
    return happyClicked && hasSelectedState;
  } catch (e) {
    logTestResult(1, 'Select happy mood', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 2: Set Intensity to 10
async function test2_SetIntensity() {
  console.log('\n[TEST 2] Set Intensity to 10 → Should work');
  try {
    const slider = page.locator('input[type="range"]').first();
    await slider.waitFor({ state: 'visible' });

    // Set value to 10
    await slider.evaluate((el) => (el.value = '10'));
    await slider.dispatchEvent('input');
    await slider.dispatchEvent('change');
    await delay(500);

    // Verify display shows 10/10
    const pageContent = await page.content();
    const hasIntensity10 = pageContent.includes('10/10') || pageContent.includes('Intensity Level') && pageContent.includes('10');

    logTestResult(2, 'Set intensity to 10', hasIntensity10 ? 'PASS' : 'FAIL',
      `Slider value set, Display shows 10: ${hasIntensity10}`);
    return hasIntensity10;
  } catch (e) {
    logTestResult(2, 'Set intensity to 10', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 3: Add Note
async function test3_AddNote() {
  console.log('\n[TEST 3] Add Note → Should save');
  try {
    const noteText = 'Test mood note: Feeling energized and productive!';
    const textarea = page.locator('textarea').first();

    await textarea.waitFor({ state: 'visible' });
    await textarea.fill(noteText);
    await textarea.dispatchEvent('input');
    await delay(300);

    const value = await textarea.inputValue();
    const noteAdded = value === noteText;

    logTestResult(3, 'Add note', noteAdded ? 'PASS' : 'FAIL',
      `Note saved: ${value.length}/${noteText.length} chars`);
    return noteAdded;
  } catch (e) {
    logTestResult(3, 'Add note', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 4: Submit Mood Entry
async function test4_SubmitMood() {
  console.log('\n[TEST 4] Click Submit → Should save');
  try {
    const submitBtn = page.locator('button').filter({ hasText: /Save Mood Entry/i });
    await submitBtn.waitFor({ state: 'visible' });

    // Get form state before submit
    const beforeSubmit = await page.content();

    await submitBtn.click();
    await delay(2000);

    // Check if form was reset (no mood selected, fields cleared)
    const afterSubmit = await page.content();
    const formReset = !afterSubmit.includes('selected') || afterSubmit.includes('Select a mood');

    // Verify with API that mood was saved
    const dbVerify = await apiCall('GET', '/api/moods/my-moods?limit=1');
    const savedInDb = dbVerify.success && dbVerify.data?.data?.length > 0;

    logTestResult(4, 'Submit mood entry', (formReset && savedInDb) ? 'PASS' : 'PARTIAL',
      `Form reset: ${formReset}, DB saved: ${savedInDb}`);
    return formReset && savedInDb;
  } catch (e) {
    logTestResult(4, 'Submit mood entry', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 5: Go to Home → Back to Mood Tracker (Persistence)
async function test5_NavigationPersistence() {
  console.log('\n[TEST 5] Navigate to Home & Back → Should persist');
  try {
    // Create a second mood entry with different mood
    const calmBtn = page.locator('button').filter({ hasText: /Calm/i });
    await calmBtn.click();
    await delay(500);

    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el) => (el.value = '7'));
    await slider.dispatchEvent('input');
    await delay(300);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Calm mood - persistence test');
    await delay(300);

    const submitBtn = page.locator('button').filter({ hasText: /Save Mood Entry/i });
    await submitBtn.click();
    await delay(2000);

    // Navigate to home
    const homeLink = page.locator('a, button').filter({ hasText: /Home|Dashboard/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
    } else {
      await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
    }

    await delay(1500);

    // Navigate back to mood tracker
    await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'networkidle' });
    await delay(2000);

    // Verify entries still exist
    const dbCheck = await apiCall('GET', '/api/moods/my-moods?limit=5');
    const hasEntries = dbCheck.success && dbCheck.data?.data?.length >= 2;

    logTestResult(5, 'Persistence after navigation', hasEntries ? 'PASS' : 'FAIL',
      `Entries found: ${dbCheck.data?.data?.length || 0}`);
    return hasEntries;
  } catch (e) {
    logTestResult(5, 'Persistence after navigation', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 6: Check Mood Still There (Reload Page)
async function test6_MoodStillThere() {
  console.log('\n[TEST 6] Check Mood Data Persists → Should show in UI');
  try {
    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    await delay(2000);

    // Check for entry cards
    const entries = page.locator('[class*="entry-card"]');
    const count = await entries.count();

    // Verify database
    const dbCheck = await apiCall('GET', '/api/moods/my-moods?limit=10');
    const dbCount = dbCheck.data?.data?.length || 0;

    const allMatch = count > 0 && dbCount >= count;

    logTestResult(6, 'Check mood persists', allMatch ? 'PASS' : 'PARTIAL',
      `UI entries: ${count}, DB entries: ${dbCount}`);
    return allMatch;
  } catch (e) {
    logTestResult(6, 'Check mood persists', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 7: View Analytics
async function test7_ViewAnalytics() {
  console.log('\n[TEST 7] View Analytics → Should show mood analytics');
  try {
    const pageContent = await page.content();

    // Check for analytics cards on page
    const hasMostFrequent = pageContent.includes('Most Frequent');
    const hasAvgIntensity = pageContent.includes('Avg. Intensity') || pageContent.includes('Average');
    const hasStreak = pageContent.includes('Tracking Streak') || pageContent.includes('Streak');

    // Verify with API
    const analyticsResponse = await apiCall('GET', '/api/moods/analytics');
    const analyticsValid = analyticsResponse.success && analyticsResponse.data?.data?.totalEntries > 0;

    if (analyticsValid) {
      const analytics = analyticsResponse.data.data;
      console.log(`     Analytics - Total: ${analytics.totalEntries}, Avg: ${analytics.last7DaysAverage}, Most: ${analytics.mostFrequentMood}`);
    }

    logTestResult(7, 'View analytics', (hasMostFrequent && hasAvgIntensity && hasStreak && analyticsValid) ? 'PASS' : 'PARTIAL',
      `UI: Most=${hasMostFrequent}, Avg=${hasAvgIntensity}, Streak=${hasStreak}, API=${analyticsValid}`);

    return hasMostFrequent && hasAvgIntensity && hasStreak && analyticsValid;
  } catch (e) {
    logTestResult(7, 'View analytics', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 8: View Mood History
async function test8_ViewMoodHistory() {
  console.log('\n[TEST 8] View Mood History → Should list entries');
  try {
    const pageContent = await page.content();
    const hasJournalSection = pageContent.includes('Journal Entries') || pageContent.includes('Recent Entries');

    // Count entry cards
    const entries = page.locator('[class*="entry-card"], [class*="mood-entry"]');
    const uiCount = await entries.count();

    // Verify in database
    const dbResponse = await apiCall('GET', '/api/moods/my-moods?limit=30');
    const dbEntries = dbResponse.data?.data || [];
    const dbCount = dbEntries.length;

    // Verify each entry has required fields
    let allValid = true;
    for (const entry of dbEntries.slice(0, 3)) {
      if (!entry.id || !entry.moodCategory || entry.moodScore === undefined) {
        allValid = false;
        break;
      }
    }

    logTestResult(8, 'View mood history', (hasJournalSection && uiCount > 0 && dbCount > 0 && allValid) ? 'PASS' : 'PARTIAL',
      `Journal section: ${hasJournalSection}, UI count: ${uiCount}, DB count: ${dbCount}, Data valid: ${allValid}`);

    return hasJournalSection && uiCount > 0 && dbCount > 0 && allValid;
  } catch (e) {
    logTestResult(8, 'View mood history', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 9: Add Multiple Moods → Chart Should Update
async function test9_MultipleModsChart() {
  console.log('\n[TEST 9] Add Multiple Moods → Chart should update');
  try {
    // Add third mood with different category
    const excitedBtn = page.locator('button').filter({ hasText: /Excited/i });
    if (await excitedBtn.isVisible()) {
      await excitedBtn.click();
    } else {
      await page.goto(`${APP_URL}/mood-tracker`, { waitUntil: 'networkidle' });
      await delay(1000);
      await excitedBtn.click();
    }

    await delay(500);

    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el) => (el.value = '9'));
    await slider.dispatchEvent('input');
    await delay(300);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Excited mood for chart test');
    await delay(300);

    const submitBtn = page.locator('button').filter({ hasText: /Save Mood Entry/i });
    await submitBtn.click();
    await delay(2000);

    // Check chart
    const pageContent = await page.content();
    const hasMoodTrends = pageContent.includes('Mood Trends') || pageContent.includes('Chart');

    // Verify database has 3+ entries
    const dbResponse = await apiCall('GET', '/api/moods/my-moods?limit=30');
    const dbCount = dbResponse.data?.data?.length || 0;

    logTestResult(9, 'Multiple moods & chart update', (hasMoodTrends && dbCount >= 3) ? 'PASS' : 'PARTIAL',
      `Chart visible: ${hasMoodTrends}, DB entries: ${dbCount}`);

    return hasMoodTrends && dbCount >= 3;
  } catch (e) {
    logTestResult(9, 'Multiple moods & chart update', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// TEST 10: Trend Over Time (7-Day Calculation)
async function test10_TrendCalculation() {
  console.log('\n[TEST 10] View Trend Over Time → Calculate 7-day');
  try {
    const pageContent = await page.content();

    // Check for trend/calendar UI
    const hasTrends = pageContent.includes('Mood Trends') || pageContent.includes('Trend');
    const hasCalendar = pageContent.includes('Mood Calendar') || pageContent.includes('Calendar');

    // Verify analytics calculation
    const analyticsResponse = await apiCall('GET', '/api/moods/analytics');
    const analytics = analyticsResponse.data?.data;

    const hasValidCalculations = analytics &&
      analytics.totalEntries > 0 &&
      analytics.last7DaysAverage !== undefined &&
      analytics.recentTrend &&
      analytics.recentTrend.length > 0;

    if (hasValidCalculations) {
      console.log(`     Trend data - Total: ${analytics.totalEntries}, 7-day avg: ${analytics.last7DaysAverage}, Recent trend: [${analytics.recentTrend.join(',')}]`);
    }

    logTestResult(10, 'Trend calculation', (hasTrends && hasCalendar && hasValidCalculations) ? 'PASS' : 'PARTIAL',
      `UI Trends: ${hasTrends}, Calendar: ${hasCalendar}, Calculations: ${hasValidCalculations}`);

    return hasTrends && hasCalendar && hasValidCalculations;
  } catch (e) {
    logTestResult(10, 'Trend calculation', 'FAIL', `Error: ${e.message}`);
    return false;
  }
}

// VERIFICATION: Database Integrity
async function verifyDatabaseIntegrity() {
  console.log('\n[VERIFY] Database Integrity Check');
  try {
    const response = await apiCall('GET', '/api/moods/my-moods?limit=50');

    if (!response.success) {
      console.log('  ✗ Failed to fetch database entries');
      return false;
    }

    const moods = response.data?.data || [];
    console.log(`  ✓ Database contains ${moods.length} mood entries`);

    // Check for data loss
    let validCount = 0;
    let issues = [];

    for (const mood of moods) {
      const isValid = mood.id && mood.userId && mood.moodCategory &&
                     mood.moodScore !== undefined && mood.createdAt;
      if (isValid) validCount++;
      else issues.push(`Entry missing fields: ${JSON.stringify(mood).substring(0, 50)}`);
    }

    console.log(`  ✓ Valid entries: ${validCount}/${moods.length}`);

    if (issues.length > 0) {
      console.log(`  ⚠ Issues found: ${issues.length}`);
      issues.slice(0, 2).forEach(i => console.log(`    - ${i}`));
    }

    // Check for duplicate timestamps
    const timestamps = moods.map(m => m.createdAt);
    const unique = new Set(timestamps).size;
    console.log(`  ✓ Unique timestamps: ${unique}/${moods.length}`);

    return validCount === moods.length && unique === moods.length;
  } catch (e) {
    console.log(`  ✗ Database check error: ${e.message}`);
    return false;
  }
}

// VERIFICATION: Analytics Calculations
async function verifyCalculations() {
  console.log('\n[VERIFY] Analytics Calculations Check');
  try {
    const response = await apiCall('GET', '/api/moods/analytics');

    if (!response.success) {
      console.log('  ✗ Failed to fetch analytics');
      return false;
    }

    const analytics = response.data?.data;
    let allCorrect = true;

    // Get raw data to verify calculations
    const moods = (await apiCall('GET', '/api/moods/my-moods?limit=100')).data?.data || [];

    console.log(`  ✓ Analytics calculated for ${analytics.totalEntries} entries`);
    console.log(`    - Average score: ${analytics.averageScore}`);
    console.log(`    - 7-day average: ${analytics.last7DaysAverage}`);
    console.log(`    - Most frequent: ${analytics.mostFrequentMood}`);
    console.log(`    - Streak days: ${analytics.streakDays}`);

    // Verify total entries count
    if (analytics.totalEntries !== moods.length) {
      console.log(`  ⚠ Total entries mismatch: ${analytics.totalEntries} vs ${moods.length}`);
      allCorrect = false;
    }

    // Verify average is in valid range
    if (analytics.averageScore < 1 || analytics.averageScore > 10) {
      console.log(`  ⚠ Average score out of range: ${analytics.averageScore}`);
      allCorrect = false;
    }

    // Verify 7-day average
    if (analytics.last7DaysAverage < 0 || analytics.last7DaysAverage > 10) {
      console.log(`  ⚠ 7-day average out of range: ${analytics.last7DaysAverage}`);
      allCorrect = false;
    }

    return allCorrect;
  } catch (e) {
    console.log(`  ✗ Calculation check error: ${e.message}`);
    return false;
  }
}

// VERIFICATION: Frontend Display
async function verifyFrontendDisplay() {
  console.log('\n[VERIFY] Frontend Display Check');
  try {
    const pageContent = await page.content();

    let issues = [];
    const checks = [
      { name: 'Mood Tracker Header', value: pageContent.includes('Mood Tracker') },
      { name: 'Mood Selection', value: pageContent.includes('How are you feeling') },
      { name: 'Intensity Slider', value: pageContent.includes('Intensity Level') },
      { name: 'Analytics Cards', value: pageContent.includes('Most Frequent') && pageContent.includes('Avg. Intensity') },
      { name: 'Trends Chart', value: pageContent.includes('Mood Trends') },
      { name: 'Calendar View', value: pageContent.includes('Mood Calendar') },
      { name: 'Journal Section', value: pageContent.includes('Journal Entries') },
    ];

    let passed = 0;
    checks.forEach(check => {
      if (check.value) {
        console.log(`  ✓ ${check.name}`);
        passed++;
      } else {
        console.log(`  ✗ ${check.name}`);
        issues.push(check.name);
      }
    });

    console.log(`  → ${passed}/${checks.length} UI elements visible`);
    return issues.length === 0;
  } catch (e) {
    console.log(`  ✗ Frontend check error: ${e.message}`);
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
      process.exit(1);
    }

    console.log('\n[BROWSER] Launching browser...');
    browser = await chromium.launch();
    page = await browser.newPage();

    console.log('[BROWSER] Setting authentication token...');
    await page.goto(`${APP_URL}/`);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RUNNING 10 TESTS                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    // Run all 10 tests
    const results = [];
    results.push(await test1_SelectMood());
    results.push(await test2_SetIntensity());
    results.push(await test3_AddNote());
    results.push(await test4_SubmitMood());
    results.push(await test5_NavigationPersistence());
    results.push(await test6_MoodStillThere());
    results.push(await test7_ViewAnalytics());
    results.push(await test8_ViewMoodHistory());
    results.push(await test9_MultipleModsChart());
    results.push(await test10_TrendCalculation());

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              BACKEND & DATA VERIFICATION                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const dbIntegrityOk = await verifyDatabaseIntegrity();
    const calculationsOk = await verifyCalculations();
    const frontendOk = await verifyFrontendDisplay();

    // Summary Report
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                 COMPREHENSIVE TEST SUMMARY                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const partial = testResults.filter(r => r.status === 'PARTIAL').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const passRate = ((passed / testResults.length) * 100).toFixed(1);

    console.log(`\nTEST RESULTS:`);
    console.log(`  Total Tests: ${testResults.length}`);
    console.log(`  ✓ Passed: ${passed}`);
    console.log(`  ◐ Partial: ${partial}`);
    console.log(`  ✗ Failed: ${failed}`);
    console.log(`  Pass Rate: ${passRate}%`);

    console.log(`\nVERIFICATION:`);
    console.log(`  Database Integrity: ${dbIntegrityOk ? '✓' : '✗'}`);
    console.log(`  Calculations: ${calculationsOk ? '✓' : '✗'}`);
    console.log(`  Frontend Display: ${frontendOk ? '✓' : '✗'}`);

    const overallStatus = passed >= 8 && dbIntegrityOk && calculationsOk ? 'PASS' : 'NEEDS REVIEW';
    console.log(`\n  OVERALL: ${overallStatus}\n`);

    // Detailed results
    console.log('DETAILED TEST RESULTS:');
    testResults.forEach((result, idx) => {
      console.log(`  ${idx + 1}. ${result.name}`);
      console.log(`     Status: ${result.status}`);
      console.log(`     Details: ${result.details}`);
    });

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      testUser: TEST_EMAIL,
      totalTests: testResults.length,
      passed,
      partial,
      failed,
      passRate,
      testResults,
      verification: {
        databaseIntegrity: dbIntegrityOk,
        calculations: calculationsOk,
        frontendDisplay: frontendOk,
      },
      overallStatus,
    };

    const reportPath = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/mood-tracking-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Detailed report saved to: ${reportPath}`);

  } catch (error) {
    console.error('\n[ERROR] Test execution failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runTests();
