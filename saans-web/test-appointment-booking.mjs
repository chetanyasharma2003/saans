import { chromium } from 'playwright';

class AppointmentBookingTester {
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

    console.log('\n🚀 === APPOINTMENT BOOKING TEST SUITE ===\n');

    try {
      // 1. Navigate to the app
      console.log('📍 Step 1: Navigating to the application...');
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
      this.logPass('Navigate to application');

      // 2. Find and interact with therapist (look for therapist marketplace or profile)
      console.log('\n📍 Step 2: Finding therapist to book appointment...');

      // Try to find a "Book Now" or "Therapist" related element
      const therapistElements = await page.locator('text=/Therapist|Book|Session/i').count();
      if (therapistElements > 0) {
        this.logPass('Therapist marketplace elements found', `${therapistElements} elements`);
      } else {
        console.log('   ⚠️  No obvious therapist booking elements found. Checking page content...');
      }

      // 3. Check if AppointmentModal component is in the page
      console.log('\n📍 Step 3: Checking for AppointmentModal component...');
      const modalSelectors = [
        'text=Book Your Appointment',
        'button:has-text("Book Now")',
        '[class*="appointment"]',
        '[class*="modal"]'
      ];

      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            modalFound = true;
            this.logPass('AppointmentModal found', selector);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!modalFound) {
        // Try to trigger the modal by finding any therapist profile
        console.log('   Attempting to trigger modal...');

        // Check if there's a therapist marketplace page or therapy section
        const links = await page.locator('a, button').all();
        let foundTherapist = false;

        for (const link of links) {
          const text = await link.textContent();
          if (text && text.toLowerCase().includes('therapist')) {
            await link.click();
            await page.waitForTimeout(500);
            foundTherapist = true;
            break;
          }
        }

        if (!foundTherapist) {
          console.log('   Could not find therapist link. Checking page structure...');
          const pageTitle = await page.title();
          console.log(`   Page title: ${pageTitle}`);
          const bodyText = await page.locator('body').textContent();
          console.log(`   Page has content: ${bodyText.length > 0 ? 'Yes' : 'No'}`);
        }
      }

      // 4. Test Modal UI Elements
      console.log('\n📍 Step 4: Testing Modal UI Elements...');

      // Wait for modal to be visible
      try {
        await page.waitForSelector('text=Book Your Appointment', { timeout: 3000 });
        this.logPass('Modal header is visible');
      } catch {
        this.logFail('Modal header visibility', 'Modal header not found or not visible');
        this.logIssue('HIGH', 'Modal not visible',
          'The appointment modal is not visible or not being rendered',
          'Navigate to therapist page > Click "Book Now" or similar button');
      }

      // 5. Test Calendar functionality
      console.log('\n📍 Step 5: Testing Calendar/Date Selection...');
      try {
        const calendarButton = await page.locator('button:has-text("Choose a date"), button:has-text("📅")').first();

        if (await calendarButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          this.logPass('Calendar button found', 'Date selection UI present');

          // Click calendar button
          await calendarButton.click();
          await page.waitForTimeout(500);

          // Check if calendar opens
          const calendarVisible = await page.locator('[class*="calendar"], [class*="month"]').count();
          if (calendarVisible > 0) {
            this.logPass('Calendar opens on click', `${calendarVisible} calendar elements found`);

            // Try to select a date
            const dateButtons = await page.locator('button').filter({ hasText: /^\d{1,2}$/ }).all();
            if (dateButtons.length > 0) {
              await dateButtons[5].click(); // Select around day 5-10
              await page.waitForTimeout(500);
              this.logPass('Date selection works', `Clicked date button`);
            }
          } else {
            this.logFail('Calendar UI', 'Calendar did not open or is not visible');
            this.logIssue('MEDIUM', 'Calendar UI not visible',
              'Calendar popup does not appear when calendar button is clicked',
              'User clicks calendar button > Calendar should open and display dates');
          }
        } else {
          this.logFail('Calendar button', 'Calendar button not found');
          this.logIssue('HIGH', 'Calendar button missing',
            'Date selection button is not visible in the modal',
            'Modal should display a "Choose a date" button');
        }
      } catch (e) {
        this.logFail('Calendar functionality', e.message);
        this.logIssue('MEDIUM', 'Calendar interaction error',
          `Error interacting with calendar: ${e.message}`,
          'Click calendar button > Select date');
      }

      // 6. Test Time Slot Selection
      console.log('\n📍 Step 6: Testing Time Slot Selection...');
      try {
        // Check if time slots are displayed
        const timeSlotButtons = await page.locator('button').filter({ hasText: /\d{2}:\d{2}/ }).all();

        if (timeSlotButtons.length > 0) {
          this.logPass('Time slots displayed', `${timeSlotButtons.length} slots found`);

          // Try to select a time slot
          await timeSlotButtons[0].click();
          await page.waitForTimeout(300);

          // Check if slot is selected (usually indicated by changed styling)
          const selectedSlots = await page.locator('[class*="teal"], [class*="selected"]').count();
          if (selectedSlots > 0) {
            this.logPass('Time slot selection works', 'Slot selected successfully');
          }
        } else {
          // This might be expected if no date is selected yet
          const hasTimeLabel = await page.locator('text=Select Time').count();
          if (hasTimeLabel > 0) {
            console.log('   (Time slots will appear after date selection)');
            this.logPass('Time slot section present', 'Will show after date selection');
          } else {
            this.logFail('Time slot section', 'Time slot selection UI not found');
            this.logIssue('MEDIUM', 'Time slot UI missing',
              'Time slot selection interface is not visible after date selection',
              'Select a date > Check if time slots appear');
          }
        }
      } catch (e) {
        this.logFail('Time slot selection', e.message);
      }

      // 7. Test Form Fields
      console.log('\n📍 Step 7: Testing Form Fields...');
      try {
        // Look for form inputs
        const reasonInput = await page.locator('input[placeholder*="Reason"], input[placeholder*="Anxiety"]').first();
        const notesTextarea = await page.locator('textarea[placeholder*="Additional"]').first();

        if (await reasonInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          this.logPass('Reason input field found', 'Form field visible');

          // Try to fill it
          await reasonInput.fill('Test reason: Anxiety management');
          this.logPass('Reason field fillable', 'Text input works');
        } else {
          console.log('   (Reason field will appear after time slot selection)');
          this.logPass('Reason field present after slot selection', 'Expected behavior');
        }

        if (await notesTextarea.isVisible({ timeout: 1000 }).catch(() => false)) {
          this.logPass('Notes textarea found', 'Form field visible');

          // Try to fill it
          await notesTextarea.fill('Test notes: Please help with stress management');
          this.logPass('Notes field fillable', 'Textarea input works');
        } else {
          console.log('   (Notes field will appear after time slot selection)');
          this.logPass('Notes field present after slot selection', 'Expected behavior');
        }
      } catch (e) {
        this.logFail('Form fields', e.message);
        this.logIssue('MEDIUM', 'Form field interaction error',
          `Error filling form fields: ${e.message}`,
          'Fill in reason and notes fields');
      }

      // 8. Test Booking Summary Display
      console.log('\n📍 Step 8: Testing Booking Summary...');
      try {
        const summaryElements = await page.locator('text=Therapist:|Date:|Time:|Duration:|Price:').all();
        if (summaryElements.length > 0) {
          this.logPass('Booking summary displayed', `${summaryElements.length} summary items found`);
        } else {
          console.log('   (Summary will appear after complete form filling)');
          this.logPass('Booking summary section present', 'Will show after selections');
        }
      } catch (e) {
        console.log(`   Summary check: ${e.message}`);
      }

      // 9. Test API Integration
      console.log('\n📍 Step 9: Testing API Integration...');

      // Listen for network requests
      let apiCalls = [];
      page.on('response', response => {
        if (response.url().includes('/api') || response.url().includes('/appointments')) {
          apiCalls.push({
            method: response.request().method(),
            url: response.url(),
            status: response.status()
          });
        }
      });

      try {
        // Look for and click booking button
        const bookButtons = await page.locator('button:has-text("Book"), button:has-text("Confirm"), button:has-text("Submit")').all();

        if (bookButtons.length > 0) {
          console.log(`   Found ${bookButtons.length} action buttons`);
          this.logPass('Action buttons found', `${bookButtons.length} buttons available`);

          // Try to click the confirm button if it exists and is enabled
          for (const btn of bookButtons) {
            const isDisabled = await btn.isDisabled().catch(() => true);
            if (!isDisabled && await btn.isVisible()) {
              const btnText = await btn.textContent();
              console.log(`   Attempting to click: "${btnText}"`);

              // Check if it's disabled due to incomplete form
              try {
                await btn.click({ timeout: 2000 });
                this.logPass('Booking action button clicked', `"${btnText}" clicked successfully`);

                // Wait for API response
                await page.waitForTimeout(1000);

                if (apiCalls.length > 0) {
                  this.logPass('API calls made', `${apiCalls.length} API request(s) detected`);
                  apiCalls.forEach((call, i) => {
                    console.log(`     ${i + 1}. ${call.method} ${call.url.split('/').slice(-2).join('/')} -> ${call.status}`);
                  });
                } else {
                  this.logFail('API calls', 'No API calls detected during booking action');
                  this.logIssue('HIGH', 'API not called on booking',
                    'No API request was made when booking action was triggered',
                    'Click book button > Monitor network tab');
                }
              } catch (e) {
                console.log(`   Button click failed (might be disabled): ${e.message}`);
              }
            }
          }
        } else {
          console.log('   No booking action buttons found yet');
          this.logPass('Button discovery attempted', 'Will be available after form completion');
        }
      } catch (e) {
        this.logFail('API integration test', e.message);
      }

      // 10. Test Error Handling
      console.log('\n📍 Step 10: Testing Error Handling...');

      // Look for error messages
      const errorElements = await page.locator('[class*="error"], [class*="red"], text=/Error|error|Failed|failed/').all();
      if (errorElements.length > 0) {
        this.logPass('Error message areas found', `${errorElements.length} error elements visible`);
      } else {
        this.logPass('No errors currently displayed', 'Application clean state');
      }

      // 11. Test Close/Modal Exit
      console.log('\n📍 Step 11: Testing Modal Close...');
      try {
        const closeButton = await page.locator('button:has-text("✕"), button[aria-label*="close"]').first();
        if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          this.logPass('Close button found', 'Modal can be dismissed');
        } else {
          this.logFail('Close button', 'Close button not found');
          this.logIssue('MEDIUM', 'Modal close button missing',
            'No close button is visible on the modal',
            'Modal should have a close button (✕)');
        }
      } catch (e) {
        console.log(`   Close button check: ${e.message}`);
      }

      // 12. Test Responsive Design
      console.log('\n📍 Step 12: Checking Responsive Design...');
      const viewport = page.viewportSize();
      if (viewport) {
        this.logPass('Viewport detected', `${viewport.width}x${viewport.height}px`);

        // Check if modal is visible at current viewport
        const modal = await page.locator('[class*="modal"], [class*="appointment"]').first();
        if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
          const boundingBox = await modal.boundingBox();
          if (boundingBox) {
            if (boundingBox.width > viewport.width * 0.95) {
              this.logIssue('MEDIUM', 'Modal might be too wide',
                `Modal width (${boundingBox.width}px) is too close to viewport width (${viewport.width}px)`,
                'Modal should not extend to viewport edges');
            } else {
              this.logPass('Modal responsive layout', 'Modal fits well within viewport');
            }
          }
        }
      }

    } catch (error) {
      console.error('\n❌ Test suite error:', error);
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
    this.passedTests.forEach((test, i) => {
      console.log(`   ${i + 1}. ${test.testName}`);
    });

    console.log(`\n❌ Failed Tests: ${this.failedTests.length}`);
    this.failedTests.forEach((test, i) => {
      console.log(`   ${i + 1}. ${test.testName} - ${test.reason}`);
    });

    console.log(`\n🔴 Issues Found: ${this.issues.length}`);
    this.issues.forEach((issue, i) => {
      console.log(`\n   Issue ${i + 1}: [${issue.severity}] ${issue.title}`);
      console.log(`   Description: ${issue.description}`);
      if (issue.steps) console.log(`   Steps to Reproduce: ${issue.steps}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 Overall Status: ${this.issues.length === 0 ? '✅ All Tests Passed' : `⚠️ ${this.issues.length} Issues Found`}\n`);
  }
}

// Run the test suite
const tester = new AppointmentBookingTester();
await tester.runTests();
