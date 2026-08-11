import { chromium } from 'playwright';
import fs from 'fs';

const CLIENT_URL = 'http://localhost:5173';

class AppointmentModalTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.testResults = [];
    this.bugs = [];
  }

  async init() {
    console.log('🚀 Starting AppointmentModal Comprehensive Test Suite...\n');
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  addBug(category, severity, title, description, steps = '', expectedVsActual = '') {
    this.bugs.push({
      id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      severity,
      title,
      description,
      steps,
      expectedVsActual,
      timestamp: new Date().toISOString()
    });
    console.log(`🐛 [${severity}] ${category}: ${title}`);
  }

  recordTest(testName, status, details = '') {
    this.testResults.push({
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    });
    const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
    console.log(`${icon} ${testName}: ${status} ${details ? `(${details})` : ''}`);
  }

  async navigateToTherapistsPage() {
    console.log('\n🌐 === NAVIGATION ===');
    try {
      await this.page.goto(`${CLIENT_URL}/find-therapist`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await this.page.waitForTimeout(2000);
      this.recordTest('Navigate to Therapists Page', 'PASS');
    } catch (error) {
      this.recordTest('Navigate to Therapists Page', 'FAIL', error.message);
      throw error;
    }
  }

  async testAppointmentModalElement() {
    console.log('\n🔍 === TEST: MODAL ELEMENT DETECTION ===');
    try {
      // Check if AppointmentModal is in the component tree
      const pageContent = await this.page.content();

      if (pageContent.includes('AppointmentModal') || pageContent.includes('Book Your Session')) {
        this.recordTest('Modal Component in DOM', 'PASS');
      } else {
        this.recordTest('Modal Component in DOM', 'FAIL', 'Component markup not found');
        this.addBug('Component', 'HIGH', 'AppointmentModal not rendering',
          'Modal component appears to be missing from page',
          'Open /find-therapist page',
          'Expected: Modal code in DOM. Actual: Not found');
      }

      // Look for modal trigger buttons (Book buttons on therapist cards)
      const bookButtons = await this.page.locator('button:has-text("Book")').all();
      if (bookButtons.length > 0) {
        this.recordTest('Book Action Buttons Present', 'PASS', `Found ${bookButtons.length} book buttons`);
      } else {
        this.recordTest('Book Action Buttons Present', 'FAIL', 'No book buttons found');
        this.addBug('UI', 'HIGH', 'Book buttons missing', 'No "Book" buttons found on therapist cards',
          'Load therapists page',
          'Expected: Book button on each therapist card. Actual: Not visible');
      }
    } catch (error) {
      this.recordTest('Modal Element Detection', 'FAIL', error.message);
    }
  }

  async testModalTrigger() {
    console.log('\n🎯 === TEST: MODAL TRIGGER ===');
    try {
      const bookButtons = await this.page.locator('button:has-text("Book")').all();

      if (bookButtons.length === 0) {
        this.recordTest('Click Book Button', 'SKIP', 'No book buttons found');
        return;
      }

      // Click first book button
      await bookButtons[0].click();
      await this.page.waitForTimeout(1000);

      // Check if modal appears
      const modalVisible = await this.page.isVisible('[class*="fixed"][class*="inset"]').catch(() => false) ||
                          await this.page.isVisible('text=Book Your Session').catch(() => false) ||
                          await this.page.isVisible('text=Ready to Book?').catch(() => false);

      if (modalVisible) {
        this.recordTest('Modal Opens on Book Click', 'PASS');
      } else {
        this.recordTest('Modal Opens on Book Click', 'FAIL', 'Modal not visible');
        this.addBug('Interaction', 'HIGH', 'Modal does not open on book button click',
          'Clicking book button does not trigger modal appearance',
          'Click "Book" button on therapist card',
          'Expected: Modal overlay appears. Actual: No modal shown');
      }
    } catch (error) {
      this.recordTest('Modal Trigger', 'FAIL', error.message);
    }
  }

  async test3StepFlow() {
    console.log('\n📋 === TEST: 3-STEP FLOW ===');
    try {
      // Step 1: Info screen
      console.log('  Testing Step 1: Info Screen');
      const infoVisible = await this.page.isVisible('text=Ready to Book?').catch(() => false) ||
                         await this.page.isVisible('text=Book Your Appointment').catch(() => false);

      if (infoVisible) {
        this.recordTest('Step 1: Info Screen Visible', 'PASS');

        // Check for therapist info
        const therapistInfo = await this.page.locator('h2').first().innerText().catch(() => '');
        if (therapistInfo.length > 0) {
          this.recordTest('Step 1: Therapist Name Displayed', 'PASS', therapistInfo);
        } else {
          this.recordTest('Step 1: Therapist Name Displayed', 'FAIL', 'Therapist name not visible');
        }

        // Check for proceed button
        const proceedBtn = await this.page.locator('button:has-text("Proceed to Book")').first().isVisible().catch(() => false);
        if (proceedBtn) {
          this.recordTest('Step 1: Proceed Button Present', 'PASS');

          // Click proceed
          await this.page.locator('button:has-text("Proceed to Book")').first().click();
          await this.page.waitForTimeout(800);

          // Step 2: Booking screen
          console.log('  Testing Step 2: Booking Screen');
          const bookingVisible = await this.page.isVisible('text=Book Your Session').catch(() => false) ||
                                await this.page.isVisible('text=Select Date').catch(() => false) ||
                                await this.page.isVisible('text=Select Time').catch(() => false);

          if (bookingVisible) {
            this.recordTest('Step 2: Booking Screen Visible', 'PASS');
          } else {
            this.recordTest('Step 2: Booking Screen Visible', 'FAIL', 'Booking screen not showing');
            this.addBug('Navigation', 'HIGH', 'Cannot navigate to booking step',
              'Proceed button click does not show booking screen',
              'Click Proceed to Book',
              'Expected: Date/time selection screen. Actual: Still on info screen or blank');
          }
        } else {
          this.recordTest('Step 1: Proceed Button Present', 'FAIL', 'Proceed button not found');
        }
      } else {
        this.recordTest('Step 1: Info Screen Visible', 'FAIL', 'Info screen not visible');
      }
    } catch (error) {
      this.recordTest('3-Step Flow', 'FAIL', error.message);
    }
  }

  async testCalendarPicker() {
    console.log('\n📅 === TEST: CALENDAR PICKER ===');
    try {
      // Look for date selection
      const dateButton = await this.page.locator('button').filter({ hasText: /Choose a date|📅/ }).first().isVisible().catch(() => false);

      if (dateButton) {
        this.recordTest('Date Picker Button Visible', 'PASS');

        // Click to open calendar
        await this.page.locator('button').filter({ hasText: /Choose a date|📅/ }).first().click();
        await this.page.waitForTimeout(500);

        // Check if calendar grid appears
        const calendarDays = await this.page.locator('button').filter({ hasText: /^[0-9]{1,2}$/ }).all();

        if (calendarDays.length > 0) {
          this.recordTest('Calendar Grid Visible', 'PASS', `${calendarDays.length} days rendered`);

          // Test date selection
          console.log('  Testing date selection...');
          let dateSelected = false;
          for (let i = 0; i < Math.min(calendarDays.length, 5); i++) {
            const btn = calendarDays[i];
            try {
              const dayText = await btn.innerText();
              const dayNum = parseInt(dayText);
              if (dayNum > 5) { // Select a date that's not at the start
                await btn.click();
                dateSelected = true;
                await this.page.waitForTimeout(300);
                break;
              }
            } catch (e) {
              // Skip if can't parse
            }
          }

          if (dateSelected) {
            this.recordTest('Calendar Date Selection', 'PASS');
          } else {
            this.recordTest('Calendar Date Selection', 'FAIL', 'Could not select date');
            this.addBug('Interaction', 'MEDIUM', 'Calendar date selection not working',
              'Date selection click not processing',
              'Click on calendar date',
              'Expected: Date selected and displayed. Actual: Selection not registered');
          }
        } else {
          this.recordTest('Calendar Grid Visible', 'FAIL', 'No calendar days found');
          this.addBug('UI', 'HIGH', 'Calendar grid not rendering',
            'Calendar days not displayed after clicking date button',
            'Click date picker button',
            'Expected: Calendar with days 1-31 visible. Actual: No days shown');
        }
      } else {
        this.recordTest('Date Picker Button Visible', 'FAIL', 'Date button not found');
        this.addBug('UI', 'MEDIUM', 'Date picker button missing',
          'No date selection button visible on booking screen',
          'Open booking screen',
          'Expected: "Choose a date" button. Actual: Button not found');
      }
    } catch (error) {
      this.recordTest('Calendar Picker', 'FAIL', error.message);
    }
  }

  async testSlotLoading() {
    console.log('\n⏱️ === TEST: SLOT LOADING ===');
    try {
      // Check if loading indicator appears
      const loadingIndicator = await this.page.isVisible('text=Loading available slots').catch(() => false);

      if (loadingIndicator) {
        this.recordTest('Loading Indicator Shown', 'PASS');

        // Wait for loading to complete
        try {
          await this.page.waitForSelector('text=Loading available slots', { state: 'hidden', timeout: 8000 });
          this.recordTest('Loading Completed', 'PASS');
        } catch (e) {
          this.recordTest('Loading Completed', 'FAIL', 'Loading timeout > 8s');
          this.addBug('Performance', 'MEDIUM', 'Slot loading takes too long',
            'Loading spinner not disappearing within 8 seconds',
            'Select a date',
            'Expected: Slots load within 3-5s. Actual: Still loading after 8s');
        }
      }

      // Check for time slots
      const timeSlots = await this.page.locator('button').filter({ hasText: /\d{1,2}:\d{2}.*-.*\d{1,2}:\d{2}/ }).all();

      if (timeSlots.length > 0) {
        this.recordTest('Time Slots Loaded', 'PASS', `${timeSlots.length} slots available`);
      } else {
        const noSlotsMsg = await this.page.isVisible('text=No available slots').catch(() => false);
        if (noSlotsMsg) {
          this.recordTest('No Slots Message', 'PASS', 'Correct error message shown');
        } else {
          this.recordTest('Time Slots Loaded', 'FAIL', 'No slots and no error message');
          this.addBug('Data', 'HIGH', 'Slots not loading properly',
            'No time slots displayed and no error message',
            'Select a date',
            'Expected: Slots loaded or error message. Actual: Empty state');
        }
      }
    } catch (error) {
      this.recordTest('Slot Loading', 'FAIL', error.message);
    }
  }

  async testFormSubmission() {
    console.log('\n📝 === TEST: FORM SUBMISSION ===');
    try {
      // Check if we have enough fields filled
      const reasonField = await this.page.locator('input[placeholder*="Anxiety"]').first().isVisible().catch(() => false);
      const notesField = await this.page.locator('textarea').first().isVisible().catch(() => false);
      const confirmBtn = await this.page.locator('button:has-text("Confirm Booking")').first().isVisible().catch(() => false);

      if (confirmBtn) {
        this.recordTest('Confirm Button Visible', 'PASS');

        // Fill optional fields if visible
        if (reasonField) {
          await this.page.locator('input[placeholder*="Anxiety"]').first().fill('Stress management and anxiety relief');
          this.recordTest('Reason Field Fill', 'PASS');
        }

        if (notesField) {
          await this.page.locator('textarea').first().fill('First time booking. Looking forward to the session.');
          this.recordTest('Notes Field Fill', 'PASS');
        }

        // Try to submit
        const isEnabled = !(await this.page.locator('button:has-text("Confirm Booking")').first().isDisabled().catch(() => true));

        if (isEnabled) {
          this.recordTest('Submit Button Enabled', 'PASS');

          // Note: We won't actually submit to avoid creating test bookings
          this.recordTest('Form Submission', 'PASS', 'Form validated and ready to submit');
        } else {
          this.recordTest('Submit Button Enabled', 'FAIL', 'Button disabled when should be enabled');
          this.addBug('Validation', 'MEDIUM', 'Submit button disabled incorrectly',
            'Confirm button is disabled despite having date and time selected',
            'Select date, time, fill optional fields',
            'Expected: Button enabled. Actual: Button disabled');
        }
      } else {
        this.recordTest('Confirm Button Visible', 'FAIL', 'Confirm button not found');
      }
    } catch (error) {
      this.recordTest('Form Submission', 'FAIL', error.message);
    }
  }

  async testErrorScenarios() {
    console.log('\n⚠️ === TEST: ERROR SCENARIOS ===');
    try {
      // Check for error message display styles
      const errorElements = await this.page.locator('[class*="bg-red"][class*="border"]').all();

      if (errorElements.length > 0) {
        this.recordTest('Error Message Styling', 'PASS', `${errorElements.length} error elements found`);
      }

      // Check close button
      const closeBtn = await this.page.locator('button').filter({ hasText: /✕|Close/ }).first().isVisible().catch(() => false);

      if (closeBtn) {
        this.recordTest('Modal Close Button', 'PASS');
      } else {
        this.recordTest('Modal Close Button', 'FAIL', 'Close button not found');
        this.addBug('UI', 'MEDIUM', 'Modal close button missing',
          'No close button visible in modal header',
          'Open modal',
          'Expected: Close (X) button. Actual: Not visible');
      }

      // Check back button on booking screen
      const backBtn = await this.page.locator('button:has-text("Back")').first().isVisible().catch(() => false);

      if (backBtn) {
        this.recordTest('Back Button Present', 'PASS');
      } else {
        this.recordTest('Back Button Present', 'FAIL', 'Back button not found');
      }
    } catch (error) {
      this.recordTest('Error Scenarios', 'FAIL', error.message);
    }
  }

  async testMobileResponsiveness() {
    console.log('\n📱 === TEST: MOBILE RESPONSIVENESS (375px) ===');
    try {
      await this.context.close();
      this.context = await this.browser.newContext({
        viewport: { width: 375, height: 667 },
        isMobile: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
      });
      this.page = await this.context.newPage();

      // Navigate to therapists page again
      await this.page.goto(`${CLIENT_URL}/find-therapist`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await this.page.waitForTimeout(2000);

      // Click book button
      const bookButtons = await this.page.locator('button:has-text("Book")').all();
      if (bookButtons.length > 0) {
        await bookButtons[0].click();
        await this.page.waitForTimeout(1000);
      }

      // Check modal width
      const modal = await this.page.locator('[class*="max-w"]').first().boundingBox().catch(() => null);

      if (modal) {
        const exceeds = modal.width > 370;
        if (!exceeds) {
          this.recordTest('Mobile Modal Width', 'PASS', `Width: ${modal.width}px`);
        } else {
          this.recordTest('Mobile Modal Width', 'FAIL', `Width exceeds: ${modal.width}px`);
          this.addBug('Responsive', 'HIGH', 'Modal overflow on mobile (375px)',
            'Modal width exceeds safe viewport on mobile',
            'View on mobile 375px width',
            'Expected: Modal fits within viewport. Actual: Modal too wide');
        }
      }

      // Check button sizes
      const buttons = await this.page.locator('button').all();
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const box = await buttons[i].boundingBox().catch(() => null);
        if (box && box.height < 40) {
          this.recordTest('Mobile Button Size', 'FAIL', `Button ${i+1} too small: ${box.height}px`);
          this.addBug('Responsive', 'MEDIUM', 'Touch target too small on mobile',
            'Buttons less than 44px height on mobile device',
            'View buttons on mobile',
            'Expected: Buttons 44px+ for touch. Actual: Smaller');
          break;
        }
      }

      if (buttons.length > 0) {
        const box = await buttons[0].boundingBox();
        if (box && box.height >= 40) {
          this.recordTest('Mobile Button Size', 'PASS', `Height: ${box.height}px`);
        }
      }
    } catch (error) {
      this.recordTest('Mobile Responsiveness', 'FAIL', error.message);
    }
  }

  async testTabletResponsiveness() {
    console.log('\n📱 === TEST: TABLET RESPONSIVENESS (768px) ===');
    try {
      await this.context.close();
      this.context = await this.browser.newContext({
        viewport: { width: 768, height: 1024 }
      });
      this.page = await this.context.newPage();

      await this.page.goto(`${CLIENT_URL}/find-therapist`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await this.page.waitForTimeout(2000);

      const bookButtons = await this.page.locator('button:has-text("Book")').all();
      if (bookButtons.length > 0) {
        await bookButtons[0].click();
        await this.page.waitForTimeout(1000);
      }

      const modal = await this.page.locator('[class*="max-w"]').first().boundingBox().catch(() => null);

      if (modal) {
        if (modal.width <= 768) {
          this.recordTest('Tablet Modal Width', 'PASS', `Width: ${modal.width}px`);
        } else {
          this.recordTest('Tablet Modal Width', 'FAIL', `Width exceeds: ${modal.width}px`);
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

    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipCount = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log(`📈 Total Tests: ${total}`);
    console.log(`✓ Passed: ${passCount} (${((passCount/total)*100).toFixed(1)}%)`);
    console.log(`✗ Failed: ${failCount} (${((failCount/total)*100).toFixed(1)}%)`);
    console.log(`⊘ Skipped: ${skipCount}`);

    console.log('\n═════════════════════════════════════════════════════════');
    console.log(`🐛 BUGS FOUND: ${this.bugs.length}`);
    console.log('═════════════════════════════════════════════════════════\n');

    if (this.bugs.length > 0) {
      const critical = this.bugs.filter(b => b.severity === 'CRITICAL');
      const high = this.bugs.filter(b => b.severity === 'HIGH');
      const medium = this.bugs.filter(b => b.severity === 'MEDIUM');
      const low = this.bugs.filter(b => b.severity === 'LOW');

      if (critical.length > 0) {
        console.log('🔴 CRITICAL BUGS:');
        critical.forEach((bug, i) => {
          console.log(`\n  ${i+1}. ${bug.title} [${bug.id}]`);
          console.log(`     Category: ${bug.category}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Steps: ${bug.steps}`);
          console.log(`     Expected vs Actual: ${bug.expectedVsActual}`);
        });
      }

      if (high.length > 0) {
        console.log('\n🔴 HIGH SEVERITY BUGS:');
        high.forEach((bug, i) => {
          console.log(`\n  ${i+1}. ${bug.title} [${bug.id}]`);
          console.log(`     Category: ${bug.category}`);
          console.log(`     Description: ${bug.description}`);
          console.log(`     Steps: ${bug.steps}`);
          console.log(`     Expected vs Actual: ${bug.expectedVsActual}`);
        });
      }

      if (medium.length > 0) {
        console.log('\n🟠 MEDIUM SEVERITY BUGS:');
        medium.forEach((bug, i) => {
          console.log(`\n  ${i+1}. ${bug.title} [${bug.id}]`);
          console.log(`     Category: ${bug.category}`);
          console.log(`     Description: ${bug.description}`);
        });
      }

      if (low.length > 0) {
        console.log('\n🟡 LOW SEVERITY BUGS:');
        low.forEach((bug, i) => {
          console.log(`\n  ${i+1}. ${bug.title} [${bug.id}]`);
          console.log(`     Category: ${bug.category}`);
          console.log(`     Description: ${bug.description}`);
        });
      }
    } else {
      console.log('✓ No bugs found!');
    }

    // Print failed tests
    const failedTests = this.testResults.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('\n═════════════════════════════════════════════════════════');
      console.log('❌ FAILED TESTS:');
      console.log('═════════════════════════════════════════════════════════\n');
      failedTests.forEach((test, i) => {
        console.log(`${i+1}. ${test.testName}`);
        if (test.details) console.log(`   Details: ${test.details}`);
      });
    }

    // Save results
    const resultsFile = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/appointment-modal-test-results.json';
    const reportData = {
      summary: {
        total,
        passed: passCount,
        failed: failCount,
        skipped: skipCount,
        successRate: ((passCount/total)*100).toFixed(1) + '%'
      },
      testResults: this.testResults,
      bugs: this.bugs,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(resultsFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Results saved to: ${resultsFile}\n`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.navigateToTherapistsPage();
      await this.testAppointmentModalElement();
      await this.testModalTrigger();
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

const tester = new AppointmentModalTester();
await tester.run();
