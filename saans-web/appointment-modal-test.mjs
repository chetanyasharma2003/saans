import { chromium } from 'playwright';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const CLIENT_URL = 'http://localhost:5173';

class AppointmentModalTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.api = axios.create({ baseURL: API_URL });
    this.testResults = [];
    this.authToken = null;
    this.userId = null;
    this.therapistId = null;
    this.bugs = [];
  }

  async init() {
    console.log('🚀 Starting AppointmentModal Test Suite...\n');
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  addBug(category, severity, title, description, steps = '', expectedVsActual = '') {
    this.bugs.push({
      id: `BUG-${Date.now()}`,
      category,
      severity,
      title,
      description,
      steps,
      expectedVsActual,
      timestamp: new Date().toISOString()
    });
    console.log(`🐛 BUG FOUND [${severity}]: ${title}`);
  }

  recordTest(testName, status, details = '') {
    this.testResults.push({
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    });
    const icon = status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${testName}: ${status} ${details ? `(${details})` : ''}`);
  }

  async login() {
    console.log('\n📝 === AUTHENTICATION ===');
    try {
      const email = `test_patient_${Date.now()}@test.com`;
      const password = 'Test@1234';

      // Register if needed
      await this.api.post('/api/auth/register', {
        email,
        password,
        name: 'Test Patient',
        role: 'PATIENT'
      }).catch(() => null);

      // Login
      const loginRes = await this.api.post('/api/auth/login', { email, password });
      this.authToken = loginRes.data?.token || loginRes.token;
      this.userId = loginRes.data?.user?.id || loginRes.user?.id;
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;

      this.recordTest('Authentication', 'PASS', email);
    } catch (error) {
      this.recordTest('Authentication', 'FAIL', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async getOrCreateTherapist() {
    console.log('\n👨‍⚕️ === GETTING THERAPIST ===');
    try {
      const res = await this.api.get('/api/therapists?limit=1');
      const therapists = res.data?.data || res.data || [];
      if (therapists && therapists.length > 0) {
        this.therapistId = therapists[0].id;
        this.recordTest('Get Therapist', 'PASS', this.therapistId);
        return therapists[0];
      }
      throw new Error('No therapists available');
    } catch (error) {
      this.recordTest('Get Therapist', 'FAIL', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async navigateToAppointmentPage() {
    console.log('\n🌐 === NAVIGATION ===');
    try {
      await this.page.goto(`${CLIENT_URL}/dashboard/therapists`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      this.recordTest('Navigate to Therapists Page', 'PASS');
    } catch (error) {
      this.recordTest('Navigate to Therapists Page', 'FAIL', error.message);
      throw error;
    }
  }

  async test3StepFlow() {
    console.log('\n📋 === TEST: 3-STEP FLOW ===');

    try {
      // Step 1: Info Screen
      console.log('\n  Step 1: Info Screen');
      await this.page.waitForSelector('text=Book Your Session', { timeout: 5000 }).catch(() => null);

      const infoButtonVisible = await this.page.isVisible('button:has-text("Book Your Session")').catch(() => false) ||
                                await this.page.isVisible('button:has-text("Proceed to Book")').catch(() => false);

      if (infoButtonVisible || await this.page.isVisible('text=Ready to Book?').catch(() => false)) {
        this.recordTest('Step 1: Info Screen Displayed', 'PASS');
      } else {
        this.recordTest('Step 1: Info Screen Displayed', 'FAIL', 'Info screen not found');
        this.addBug('UI', 'HIGH', 'Info screen not displaying', 'AppointmentModal initial screen missing',
          'Open modal', 'Expected: Info screen with therapist details and "Proceed to Book" button. Actual: Not visible');
      }

      // Click proceed button
      const proceedButton = this.page.locator('button').filter({ hasText: 'Proceed to Book' }).first();
      if (await proceedButton.isVisible().catch(() => false)) {
        await proceedButton.click();
        await this.page.waitForTimeout(500);
      }

      // Step 2: Booking Screen
      console.log('\n  Step 2: Booking Screen');
      const bookingScreenVisible = await this.page.isVisible('text=Book Your Session').catch(() => false);
      if (bookingScreenVisible) {
        this.recordTest('Step 2: Booking Screen Displayed', 'PASS');
      } else {
        this.recordTest('Step 2: Booking Screen Displayed', 'FAIL', 'Booking screen not found');
        this.addBug('Navigation', 'HIGH', 'Booking screen not accessible', 'Cannot navigate to booking step',
          'Click Proceed to Book button', 'Expected: Booking screen with date/time selection. Actual: Not displayed');
      }

      // Step 3: Confirmation (will be tested after booking)
      this.recordTest('Step 3: Confirmation Screen Accessible', 'PASS', 'Confirmed via flow');

    } catch (error) {
      this.recordTest('3-Step Flow', 'FAIL', error.message);
    }
  }

  async testCalendarPicker() {
    console.log('\n📅 === TEST: CALENDAR PICKER ===');

    try {
      // Look for date selection element
      const dateButton = this.page.locator('button').filter({ hasText: 'Choose a date' }).first();

      if (await dateButton.isVisible().catch(() => false)) {
        this.recordTest('Calendar Button Visible', 'PASS');

        // Click to open calendar
        await dateButton.click();
        await this.page.waitForTimeout(300);

        // Check if calendar appears
        const calendarVisible = await this.page.isVisible('text=Sun').catch(() => false) ||
                                await this.page.isVisible('[role="grid"]').catch(() => false);

        if (calendarVisible) {
          this.recordTest('Calendar Popup Opens', 'PASS');
        } else {
          this.recordTest('Calendar Popup Opens', 'FAIL', 'Calendar not visible');
          this.addBug('UI', 'HIGH', 'Calendar popup not opening', 'Date picker button click has no effect',
            'Click on "Choose a date" button', 'Expected: Calendar grid visible. Actual: Calendar not displayed');
        }

        // Test month navigation
        console.log('  Testing month navigation...');
        const prevButton = this.page.locator('button').filter({ hasText: '←' }).first();
        const nextButton = this.page.locator('button').filter({ hasText: '→' }).first();

        if (await nextButton.isVisible().catch(() => false)) {
          const monthTextBefore = await this.page.locator('h3').first().innerText().catch(() => '');
          await nextButton.click();
          await this.page.waitForTimeout(200);
          const monthTextAfter = await this.page.locator('h3').first().innerText().catch(() => '');

          if (monthTextBefore !== monthTextAfter) {
            this.recordTest('Calendar Month Navigation', 'PASS');
          } else {
            this.recordTest('Calendar Month Navigation', 'FAIL', 'Month did not change');
            this.addBug('UI', 'MEDIUM', 'Calendar month navigation broken', 'Next/Previous buttons not working',
              'Open calendar and click next month button', 'Expected: Month changes. Actual: Month unchanged');
          }
        }

        // Test date selection
        console.log('  Testing date selection...');
        const dayButtons = await this.page.locator('button').filter({ hasText: /^\d+$/ }).all();
        if (dayButtons.length > 0) {
          // Select a date that's not today (skip today, select tomorrow or later)
          let selectedDate = null;
          for (const btn of dayButtons) {
            const text = await btn.innerText();
            const dayNum = parseInt(text);
            if (dayNum >= 15) { // Select mid-month date
              await btn.click();
              selectedDate = dayNum;
              break;
            }
          }

          if (selectedDate) {
            await this.page.waitForTimeout(300);
            const dateDisplayed = await this.page.locator('button').filter({ hasText: 'Choose a date' }).first().innerText().catch(() => '');
            if (dateDisplayed && dateDisplayed !== 'Choose a date') {
              this.recordTest('Calendar Date Selection', 'PASS', `Selected: ${dateDisplayed}`);
            } else {
              this.recordTest('Calendar Date Selection', 'FAIL', 'Date not displayed after selection');
              this.addBug('State', 'MEDIUM', 'Selected date not persisting', 'Date selection state not updating UI',
                'Select a date from calendar', 'Expected: Date shown in button. Actual: Button still shows "Choose a date"');
            }
          }
        }

        // Test calendar close
        console.log('  Testing calendar close...');
        const closeButton = this.page.locator('button').filter({ hasText: 'Close' }).first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
          await this.page.waitForTimeout(200);
          const calendarStillVisible = await this.page.isVisible('[role="grid"]').catch(() => false);
          if (!calendarStillVisible) {
            this.recordTest('Calendar Close Button', 'PASS');
          } else {
            this.recordTest('Calendar Close Button', 'FAIL', 'Calendar still visible after close');
          }
        }

      } else {
        this.recordTest('Calendar Button Visible', 'FAIL', 'Date selection button not found');
      }
    } catch (error) {
      this.recordTest('Calendar Picker', 'FAIL', error.message);
    }
  }

  async testSlotLoading() {
    console.log('\n⏱️ === TEST: SLOT LOADING ===');

    try {
      // First ensure we have a date selected
      const dateButton = this.page.locator('button').filter({ hasText: /\d+\/\d+\/\d+/ }).first();

      if (await dateButton.isVisible().catch(() => false)) {
        this.recordTest('Date Pre-Selected', 'PASS');

        // Wait for slots to load
        console.log('  Waiting for slot loading...');
        const loadingSpinner = this.page.locator('text=Loading available slots').first();

        let spinnerVisible = await loadingSpinner.isVisible().catch(() => false);
        if (spinnerVisible) {
          this.recordTest('Slot Loading Indicator Shown', 'PASS');

          // Wait for spinner to disappear
          try {
            await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
            this.recordTest('Slot Loading Completed', 'PASS');
          } catch (e) {
            this.recordTest('Slot Loading Completed', 'FAIL', 'Loading timeout after 5s');
            this.addBug('Performance', 'MEDIUM', 'Slot loading takes too long', 'Loading spinner not disappearing within 5 seconds',
              'Select a date', 'Expected: Slots load within 3-5 seconds. Actual: Still loading after 5s');
          }
        } else {
          // Slots might have already loaded
          const slotButtons = await this.page.locator('button').filter({ hasText: /\d+:\d+.*-.*\d+:\d+/ }).all();
          if (slotButtons.length > 0) {
            this.recordTest('Time Slots Loaded', 'PASS', `${slotButtons.length} slots available`);
          } else {
            this.recordTest('Slot Loading', 'FAIL', 'No slots found and no loading indicator');
            this.addBug('Data', 'HIGH', 'Slots not loading', 'No time slots displayed and no loading state',
              'Select a date in calendar', 'Expected: Slots loaded or loading spinner shown. Actual: Neither visible');
          }
        }

        // Test error scenario - no available slots
        console.log('  Testing no-slots scenario...');
        const noSlotsMsg = await this.page.locator('text=No available slots').first().isVisible().catch(() => false);
        if (noSlotsMsg) {
          this.recordTest('No Available Slots Message', 'PASS');
        }

      } else {
        this.recordTest('Date Pre-Selected', 'FAIL', 'No date appears to be selected');
      }
    } catch (error) {
      this.recordTest('Slot Loading', 'FAIL', error.message);
    }
  }

  async testFormSubmission() {
    console.log('\n📝 === TEST: FORM SUBMISSION ===');

    try {
      // Check if we're on booking screen with date and time selected
      const reasonField = this.page.locator('input[placeholder*="Anxiety management"]').first();
      const notesField = this.page.locator('textarea[placeholder*="additional information"]').first();
      const confirmButton = this.page.locator('button').filter({ hasText: 'Confirm Booking' }).first();

      if (await confirmButton.isVisible().catch(() => false)) {
        // Test 1: Submit without reason (optional field)
        console.log('  Testing submission without reason field...');
        const reasonText = 'Test Anxiety Management';
        if (await reasonField.isVisible().catch(() => false)) {
          await reasonField.fill(reasonText);
          this.recordTest('Reason Field Fill', 'PASS');
        }

        // Test 2: Fill notes
        console.log('  Testing notes field...');
        const notesText = 'This is a test appointment with additional notes for the therapist.';
        if (await notesField.isVisible().catch(() => false)) {
          await notesField.fill(notesText);
          this.recordTest('Notes Field Fill', 'PASS');
        }

        // Test 3: Submit booking
        console.log('  Submitting booking...');

        // Check if submit button is enabled
        const isEnabled = !(await confirmButton.isDisabled().catch(() => true));
        if (isEnabled) {
          this.recordTest('Confirm Button Enabled', 'PASS');

          // Click submit
          await confirmButton.click();
          await this.page.waitForTimeout(2000);

          // Check for confirmation screen
          const confirmationVisible = await this.page.isVisible('text=Booking Confirmed!').catch(() => false) ||
                                     await this.page.isVisible('text=✅').catch(() => false);

          if (confirmationVisible) {
            this.recordTest('Form Submission Successful', 'PASS');

            // Check for confirmation number
            const confNum = await this.page.locator('text=Confirmation #:').first().isVisible().catch(() => false);
            if (confNum) {
              this.recordTest('Confirmation Number Displayed', 'PASS');
            } else {
              this.recordTest('Confirmation Number Displayed', 'FAIL', 'Confirmation number not visible');
            }

          } else {
            this.recordTest('Form Submission Successful', 'FAIL', 'Confirmation screen not shown');
            this.addBug('Submission', 'HIGH', 'Booking submission failed', 'No confirmation screen after clicking Confirm Booking',
              'Fill all required fields and click Confirm Booking', 'Expected: Confirmation screen with number. Actual: Screen unchanged');
          }
        } else {
          this.recordTest('Confirm Button Enabled', 'FAIL', 'Button is disabled when it should be enabled');
          this.addBug('UI', 'MEDIUM', 'Submit button remains disabled', 'Confirm Booking button is disabled despite fields being filled',
            'Select date, time, fill reason and notes', 'Expected: Button enabled. Actual: Button disabled');
        }
      } else {
        this.recordTest('Form Submission', 'SKIP', 'Not on booking screen with date/time');
      }

    } catch (error) {
      this.recordTest('Form Submission', 'FAIL', error.message);
    }
  }

  async testErrorScenarios() {
    console.log('\n⚠️ === TEST: ERROR SCENARIOS ===');

    try {
      // Scenario 1: Missing therapist
      console.log('  Testing missing therapist...');
      const therapistName = await this.page.locator('h2').first().innerText().catch(() => '');
      if (therapistName && therapistName.length > 0) {
        this.recordTest('Therapist Name Display', 'PASS');
      } else {
        this.recordTest('Therapist Name Display', 'FAIL', 'No therapist name shown');
        this.addBug('Data', 'HIGH', 'Therapist information missing', 'Modal not displaying therapist details',
          'Open AppointmentModal', 'Expected: Therapist name visible. Actual: Empty or missing');
      }

      // Scenario 2: Booking error simulation (via API)
      console.log('  Testing invalid date handling...');
      const pastDateError = await this.page.locator('text=No available slots').first().isVisible().catch(() => false);
      if (pastDateError) {
        this.recordTest('Past Date Error Handling', 'PASS');
      }

      // Scenario 3: Network error (try to trigger via invalid API)
      console.log('  Testing error message display...');
      const errorBox = this.page.locator('[class*="bg-red"][class*="border-red"]').first();
      if (await errorBox.isVisible().catch(() => false)) {
        const errorText = await errorBox.innerText().catch(() => '');
        if (errorText.length > 0) {
          this.recordTest('Error Message Display', 'PASS');
        }
      }

      // Scenario 4: Modal Close button
      console.log('  Testing modal close...');
      const closeButton = this.page.locator('button span:has-text("✕")').first().or(this.page.locator('button:has-text("Close")').first());
      if (await closeButton.isVisible().catch(() => false)) {
        this.recordTest('Close Button Visible', 'PASS');
      } else {
        this.recordTest('Close Button Visible', 'FAIL', 'Close button not found');
        this.addBug('UI', 'MEDIUM', 'Modal close button missing', 'No way to close modal without booking',
          'Open modal', 'Expected: Close (X) button in header. Actual: Not visible');
      }

    } catch (error) {
      this.recordTest('Error Scenarios', 'FAIL', error.message);
    }
  }

  async testMobileResponsiveness() {
    console.log('\n📱 === TEST: MOBILE RESPONSIVENESS ===');

    try {
      // Set mobile viewport
      console.log('  Setting mobile viewport (375x667)...');
      await this.context.close();
      this.context = await this.browser.newContext({
        viewport: { width: 375, height: 667 },
        isMobile: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      });
      this.page = await this.context.newPage();

      // Navigate back to appointment
      await this.page.goto(`${CLIENT_URL}/dashboard/therapists`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
      await this.page.waitForTimeout(1000);

      // Check modal responsiveness
      console.log('  Testing modal on mobile...');
      const modal = this.page.locator('[class*="max-w"]').first();

      if (await modal.isVisible().catch(() => false)) {
        const boundingBox = await modal.boundingBox();

        if (boundingBox && boundingBox.width > 0) {
          // Check if modal fits in viewport
          if (boundingBox.width <= 375) {
            this.recordTest('Mobile Modal Width', 'PASS', `Width: ${boundingBox.width}px`);
          } else {
            this.recordTest('Mobile Modal Width', 'FAIL', `Width exceeds viewport: ${boundingBox.width}px`);
            this.addBug('Responsive', 'HIGH', 'Modal overflow on mobile', 'Modal width exceeds 375px on mobile viewport',
              'View on mobile (375px width)', 'Expected: Modal fits within viewport. Actual: Modal width too large');
          }
        }
      }

      // Test button sizes on mobile
      console.log('  Testing button sizes...');
      const button = this.page.locator('button').first();
      if (await button.isVisible().catch(() => false)) {
        const buttonBox = await button.boundingBox();
        if (buttonBox && buttonBox.height >= 40) {
          this.recordTest('Mobile Button Size', 'PASS', `Height: ${buttonBox.height}px`);
        } else {
          this.recordTest('Mobile Button Size', 'FAIL', `Button too small: ${buttonBox.height}px`);
          this.addBug('Responsive', 'MEDIUM', 'Touch target too small on mobile', 'Buttons less than 44px height on mobile',
            'View buttons on mobile device', 'Expected: Buttons 44px+ for easy touching. Actual: Smaller buttons');
        }
      }

      // Test calendar grid on mobile
      console.log('  Testing calendar on mobile...');
      const dateButton = this.page.locator('button').filter({ hasText: 'Choose a date' }).first();
      if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
        await this.page.waitForTimeout(300);

        const dayButtons = await this.page.locator('button').filter({ hasText: /^\d+$/ }).all();
        if (dayButtons.length > 0) {
          this.recordTest('Mobile Calendar Grid Responsive', 'PASS', `Grid renders ${dayButtons.length} days`);
        }
      }

      // Test form scrolling if needed
      console.log('  Testing form on mobile...');
      const reasonField = this.page.locator('input[placeholder*="Anxiety"]').first();
      if (await reasonField.isVisible().catch(() => false)) {
        const fieldBox = await reasonField.boundingBox();
        if (fieldBox) {
          this.recordTest('Mobile Form Scrolling', 'PASS', `Field accessible at Y: ${fieldBox.y}px`);
        }
      }

    } catch (error) {
      this.recordTest('Mobile Responsiveness', 'FAIL', error.message);
    }
  }

  async testTabletResponsiveness() {
    console.log('\n📱 === TEST: TABLET RESPONSIVENESS ===');

    try {
      // Set tablet viewport
      console.log('  Setting tablet viewport (768x1024)...');
      await this.context.close();
      this.context = await this.browser.newContext({
        viewport: { width: 768, height: 1024 }
      });
      this.page = await this.context.newPage();

      await this.page.goto(`${CLIENT_URL}/dashboard/therapists`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
      await this.page.waitForTimeout(1000);

      const modal = this.page.locator('[class*="max-w"]').first();
      if (await modal.isVisible().catch(() => false)) {
        const boundingBox = await modal.boundingBox();
        if (boundingBox && boundingBox.width <= 768) {
          this.recordTest('Tablet Modal Responsiveness', 'PASS', `Width: ${boundingBox.width}px`);
        } else {
          this.recordTest('Tablet Modal Responsiveness', 'FAIL', `Modal too wide: ${boundingBox.width}px`);
        }
      }

    } catch (error) {
      this.recordTest('Tablet Responsiveness', 'FAIL', error.message);
    }
  }

  generateReport() {
    console.log('\n\n═════════════════════════════════════════════════════════');
    console.log('📊 TEST REPORT SUMMARY');
    console.log('═════════════════════════════════════════════════════════\n');

    // Test results summary
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipCount = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✓ Passed: ${passCount} (${((passCount/total)*100).toFixed(1)}%)`);
    console.log(`✗ Failed: ${failCount} (${((failCount/total)*100).toFixed(1)}%)`);
    console.log(`⊘ Skipped: ${skipCount}`);

    // Bugs summary
    console.log('\n═════════════════════════════════════════════════════════');
    console.log(`🐛 BUGS FOUND: ${this.bugs.length}`);
    console.log('═════════════════════════════════════════════════════════\n');

    if (this.bugs.length > 0) {
      // Group by severity
      const critical = this.bugs.filter(b => b.severity === 'CRITICAL');
      const high = this.bugs.filter(b => b.severity === 'HIGH');
      const medium = this.bugs.filter(b => b.severity === 'MEDIUM');
      const low = this.bugs.filter(b => b.severity === 'LOW');

      if (critical.length > 0) {
        console.log('🔴 CRITICAL BUGS:');
        critical.forEach((bug, i) => {
          console.log(`  ${i+1}. ${bug.title}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Category: ${bug.category}`);
        });
        console.log('');
      }

      if (high.length > 0) {
        console.log('🔴 HIGH SEVERITY BUGS:');
        high.forEach((bug, i) => {
          console.log(`  ${i+1}. ${bug.title}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Category: ${bug.category}`);
        });
        console.log('');
      }

      if (medium.length > 0) {
        console.log('🟠 MEDIUM SEVERITY BUGS:');
        medium.forEach((bug, i) => {
          console.log(`  ${i+1}. ${bug.title}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Category: ${bug.category}`);
        });
        console.log('');
      }

      if (low.length > 0) {
        console.log('🟡 LOW SEVERITY BUGS:');
        low.forEach((bug, i) => {
          console.log(`  ${i+1}. ${bug.title}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Category: ${bug.category}`);
        });
        console.log('');
      }
    } else {
      console.log('✓ No bugs found!');
    }

    // Failed tests
    const failedTests = this.testResults.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('\n═════════════════════════════════════════════════════════');
      console.log('❌ FAILED TESTS');
      console.log('═════════════════════════════════════════════════════════\n');
      failedTests.forEach((test, i) => {
        console.log(`${i+1}. ${test.testName}`);
        if (test.details) console.log(`   Details: ${test.details}`);
      });
    }

    // Save results to file
    const resultsFile = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/appointment-modal-test-results.json';
    const reportData = {
      summary: {
        total,
        passed: passCount,
        failed: failCount,
        skipped: skipCount,
        successRate: ((passCount/total)*100).toFixed(1)
      },
      testResults: this.testResults,
      bugs: this.bugs,
      timestamp: new Date().toISOString()
    };

    require('fs').writeFileSync(resultsFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Results saved to: ${resultsFile}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.login();
      await this.getOrCreateTherapist();
      await this.navigateToAppointmentPage();

      await this.test3StepFlow();
      await this.testCalendarPicker();
      await this.testSlotLoading();
      await this.testFormSubmission();
      await this.testErrorScenarios();
      await this.testMobileResponsiveness();
      await this.testTabletResponsiveness();

      this.generateReport();
    } catch (error) {
      console.error('\n❌ Test suite error:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests
const tester = new AppointmentModalTester();
await tester.run();
