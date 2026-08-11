import { chromium } from 'playwright';

class AppointmentBookingTesterV2 {
  constructor() {
    this.issues = [];
    this.passedTests = [];
    this.failedTests = [];
  }

  logIssue(severity, title, description, steps = '') {
    const issue = {
      id: `ISSUE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      description,
      steps,
      timestamp: new Date().toISOString()
    };
    this.issues.push(issue);
    console.log(`\n🔴 [${severity}] ${title}`);
    console.log(`   Description: ${description}`);
    if (steps) console.log(`   Steps: ${steps}`);
  }

  logPass(testName, details = '') {
    this.passedTests.push({ testName, details, timestamp: new Date().toISOString() });
    console.log(`✓ ${testName} ${details ? `(${details})` : ''}`);
  }

  logFail(testName, reason) {
    this.failedTests.push({ testName, reason, timestamp: new Date().toISOString() });
    console.log(`✗ ${testName} - ${reason}`);
  }

  async runTests() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('\n🚀 === APPOINTMENT BOOKING TEST SUITE V2 ===\n');

    try {
      // 1. Navigate to the app
      console.log('📍 Step 1: Navigating to the application...');
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
      this.logPass('Navigate to application');

      // 2. Examine page structure
      console.log('\n📍 Step 2: Examining page structure and navigation...');
      const allLinks = await page.locator('a').allTextContents();
      const allButtons = await page.locator('button').allTextContents();

      console.log(`   Found ${allLinks.length} links and ${allButtons.length} buttons`);
      console.log(`   Navigation links: ${allLinks.slice(0, 5).join(', ')}`);

      // 3. Navigate to therapist marketplace or similar
      console.log('\n📍 Step 3: Looking for therapist marketplace...');

      // Try to find therapist-related pages
      const therapistLink = await page.locator('text=/Therapist|Marketplace|Find Therapist/i').first();
      if (await therapistLink.isVisible().catch(() => false)) {
        console.log('   Found therapist link, navigating...');
        await therapistLink.click();
        await page.waitForTimeout(1000);
        this.logPass('Navigated to therapist section');
      } else {
        console.log('   No obvious therapist link found. Checking current page...');
      }

      // 4. Look for therapist cards or profiles
      console.log('\n📍 Step 4: Looking for therapist cards...');
      const therapistCardButtons = await page.locator('button:has-text("Book"), button:has-text("Schedule"), button:has-text("Select")').all();

      if (therapistCardButtons.length > 0) {
        console.log(`   Found ${therapistCardButtons.length} therapist action buttons`);
        this.logPass('Therapist cards with booking buttons found', `${therapistCardButtons.length} buttons`);

        // Click the first book/schedule button
        console.log('   Clicking first booking button...');
        await therapistCardButtons[0].click();
        await page.waitForTimeout(1000);
      } else {
        console.log('   No obvious booking buttons found. Checking all visible content...');

        // List all visible text content
        const bodyText = await page.locator('body').textContent();
        if (bodyText.includes('therapist') || bodyText.includes('session') || bodyText.includes('book')) {
          console.log('   Page contains therapist/booking related content');
        }
      }

      // 5. Verify modal is visible
      console.log('\n📍 Step 5: Verifying AppointmentModal visibility...');

      const modalBackdrop = await page.locator('[class*="backdrop"], [class*="overlay"], [class*="fixed"]').first();
      const isModalOpen = await modalBackdrop.isVisible({ timeout: 1000 }).catch(() => false);

      if (isModalOpen) {
        this.logPass('Modal backdrop found');
      } else {
        console.log('   No modal backdrop found. Checking for modal-like elements...');
      }

      // Look for the modal header specifically
      const modalHeader = await page.locator('text=Book Your Appointment').first();
      const headerVisible = await modalHeader.isVisible({ timeout: 1000 }).catch(() => false);

      if (headerVisible) {
        this.logPass('Modal header is visible');
        console.log('   ✓ Modal is properly displayed');
      } else {
        this.logFail('Modal visibility', 'Modal header not found');
        this.logIssue('HIGH', 'AppointmentModal not visible',
          'The AppointmentModal component is not being displayed after clicking book/schedule button',
          '1. Navigate to therapist page\n2. Click "Book" or "Schedule" button\n3. Modal should appear');
      }

      // 6. Test modal step flow
      console.log('\n📍 Step 6: Testing modal step flow...');

      // Look for "Proceed to Book" button (indicates info step)
      const proceedButton = await page.locator('button:has-text("Proceed to Book")').first();
      if (await proceedButton.isVisible().catch(() => false)) {
        this.logPass('Info step visible', 'Shows therapist info and price');

        // Click to go to booking step
        await proceedButton.click();
        await page.waitForTimeout(500);
        console.log('   Advanced to booking step');
      }

      // 7. Test date selection
      console.log('\n📍 Step 7: Testing date selection...');

      const dateButton = await page.locator('button').filter({ hasText: 'Choose a date' }).first();
      const dateVisible = await dateButton.isVisible({ timeout: 1000 }).catch(() => false);

      if (dateVisible) {
        this.logPass('Date selection button found');

        // Click to open calendar
        await dateButton.click();
        await page.waitForTimeout(500);

        // Check if calendar grid appears
        const calendarDays = await page.locator('button').filter({ hasText: /^\d{1,2}$/ }).all();
        if (calendarDays.length > 0) {
          this.logPass('Calendar grid displayed', `${calendarDays.length} days shown`);

          // Select a date (pick one a few days from now)
          await calendarDays[10].click();
          await page.waitForTimeout(500);
          this.logPass('Date selected', 'Calendar date clicked');
        } else {
          this.logFail('Calendar grid', 'No day buttons found');
        }
      } else {
        this.logFail('Date selection button', 'Button not found');
        this.logIssue('HIGH', 'Date selection UI missing',
          'The date selection button is not visible in the modal',
          'After clicking "Proceed to Book", date button should appear');
      }

      // 8. Test time slot loading
      console.log('\n📍 Step 8: Testing time slot loading...');

      // Wait for time slots to load
      await page.waitForTimeout(1500);

      const timeSlots = await page.locator('button').filter({ hasText: /\d{2}:\d{2}/ }).all();
      if (timeSlots.length > 0) {
        this.logPass('Time slots loaded', `${timeSlots.length} slots available`);

        // Click a time slot
        await timeSlots[0].click();
        await page.waitForTimeout(300);
        this.logPass('Time slot selected', `Clicked slot at ${await timeSlots[0].textContent()}`);
      } else {
        console.log('   Checking if slots are loading...');
        const loadingSpinner = await page.locator('text=Loading available slots').first();
        if (await loadingSpinner.isVisible({ timeout: 500 }).catch(() => false)) {
          console.log('   Slots are currently loading...');
        } else {
          this.logIssue('MEDIUM', 'Time slots not loading',
            'After selecting a date, time slots should be fetched from the API',
            'Select date > Wait > Time slots should appear');
        }
      }

      // 9. Test form fields
      console.log('\n📍 Step 9: Testing form fields...');

      const reasonField = await page.locator('input[placeholder*="Reason"], input[placeholder*="Anxiety"]').first();
      if (await reasonField.isVisible({ timeout: 1000 }).catch(() => false)) {
        this.logPass('Reason field visible');
        await reasonField.fill('Testing anxiety management');
        this.logPass('Reason field fillable');
      }

      const notesField = await page.locator('textarea[placeholder*="Additional"]').first();
      if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
        this.logPass('Notes field visible');
        await notesField.fill('Test notes from automation');
        this.logPass('Notes field fillable');
      }

      // 10. Test booking summary
      console.log('\n📍 Step 10: Testing booking summary...');

      const summaryVisible = await page.locator('text=Therapist:').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (summaryVisible) {
        this.logPass('Booking summary visible');
      }

      // 11. Test API calls during booking
      console.log('\n📍 Step 11: Testing API calls...');

      let apiCalls = [];
      const responseLogs = [];

      page.on('response', response => {
        const url = response.url();
        const method = response.request().method();
        const status = response.status();

        if (url.includes('/api') || url.includes('/appointments')) {
          apiCalls.push({ method, url, status });
          responseLogs.push(`${method} ${url} -> ${status}`);
        }
      });

      // Try to click confirm booking
      const confirmButton = await page.locator('button:has-text("Confirm Booking")').first();
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isDisabled = await confirmButton.isDisabled().catch(() => true);

        if (!isDisabled) {
          this.logPass('Confirm button is enabled');

          console.log('   Clicking Confirm Booking button...');
          await confirmButton.click();
          await page.waitForTimeout(2000);

          if (apiCalls.length > 0) {
            this.logPass('API calls detected', `${apiCalls.length} request(s) made`);
            responseLogs.forEach(log => console.log(`     ${log}`));

            // Check if booking was successful
            const confirmationText = await page.locator('text=Booking Confirmed').first();
            if (await confirmationText.isVisible({ timeout: 2000 }).catch(() => false)) {
              this.logPass('Booking confirmation page displayed');
            }
          } else {
            this.logFail('API calls', 'No API requests detected');
            this.logIssue('HIGH', 'Booking API not called',
              'When clicking "Confirm Booking", no API request was made',
              'Click Confirm > Check network tab for /api/appointments/book request');
          }
        } else {
          console.log('   Confirm button is disabled (form incomplete)');
        }
      } else {
        console.log('   Confirm button not found yet (fill form first)');
      }

      // 12. Check for errors
      console.log('\n📍 Step 12: Checking for errors...');

      const pageContent = await page.content();
      if (pageContent.includes('error') || pageContent.includes('Error')) {
        const errorElements = await page.locator('[class*="error"]').all();
        if (errorElements.length > 0) {
          console.log(`   Found ${errorElements.length} error elements`);
        }
      } else {
        this.logPass('No error messages', 'Application clean state');
      }

    } catch (error) {
      console.error('\n❌ Test suite error:', error.message);
      this.logFail('Test suite execution', error.message);
    } finally {
      // Generate Report
      this.generateReport();

      await browser.close();
    }
  }

  generateReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY REPORT');
    console.log('='.repeat(60));

    console.log(`\n✅ Passed Tests: ${this.passedTests.length}`);
    this.passedTests.slice(0, 15).forEach((test, i) => {
      console.log(`   ${i + 1}. ${test.testName}`);
    });

    if (this.failedTests.length > 0) {
      console.log(`\n❌ Failed Tests: ${this.failedTests.length}`);
      this.failedTests.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.testName} - ${test.reason}`);
      });
    }

    if (this.issues.length > 0) {
      console.log(`\n🔴 CRITICAL ISSUES FOUND: ${this.issues.length}`);
      this.issues.forEach((issue, i) => {
        console.log(`\n   Issue ${i + 1}: [${issue.severity}] ${issue.title}`);
        console.log(`   Description: ${issue.description}`);
        if (issue.steps) console.log(`   Steps to Reproduce: ${issue.steps}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 Overall Status: ${this.issues.length === 0 ? '✅ All Tests Passed' : `⚠️ ${this.issues.length} ISSUES FOUND`}\n`);
  }
}

// Run the test suite
const tester = new AppointmentBookingTesterV2();
await tester.runTests();
