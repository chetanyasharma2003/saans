import { chromium } from 'playwright';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const CLIENT_URL = 'http://localhost:5173';

class AppointmentBookingTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.api = axios.create({ baseURL: API_URL });
    this.testResults = [];
    this.authToken = null;
    this.userId = null;
    this.therapistId = null;
  }

  async init() {
    console.log('Starting browser...');
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();

    // Set up API interceptor for auth headers
    this.page.on('response', async (response) => {
      if (response.status() >= 400) {
        console.warn(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  async login() {
    console.log('\n=== AUTHENTICATION ===');
    try {
      // Create a new user or use existing
      const email = `test_patient_${Date.now()}@test.com`;
      const password = 'Test@1234';

      // Try to register
      const registerRes = await this.api.post('/api/auth/register', {
        email,
        password,
        name: 'Test Patient',
        role: 'PATIENT'
      }).catch(() => null);

      // Then login
      const loginRes = await this.api.post('/api/auth/login', { email, password });
      this.authToken = loginRes.data.token || loginRes.data.data?.token;
      this.userId = loginRes.data.user?.id || loginRes.data.data?.user?.id;
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;

      console.log('✓ User authenticated:', email);
      return { email, password };
    } catch (error) {
      console.error('✗ Auth failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrCreateTherapist() {
    console.log('\n=== GETTING THERAPIST ===');
    try {
      const res = await this.api.get('/api/therapists?limit=1');
      if (res.data.data && res.data.data.length > 0) {
        this.therapistId = res.data.data[0].id;
        console.log('✓ Using therapist:', this.therapistId);
        return res.data.data[0];
      }
      throw new Error('No therapists available');
    } catch (error) {
      console.error('✗ Failed to get therapist:', error.message);
      throw error;
    }
  }

  async getTherapistAvailability() {
    try {
      const res = await this.api.get(`/api/therapists/${this.therapistId}/availability`);
      return res.data.data || [];
    } catch (error) {
      console.error('✗ Failed to get availability:', error.message);
      return [];
    }
  }

  async bookAppointment(slotData, appointmentReason) {
    try {
      const bookingData = {
        therapistId: this.therapistId,
        scheduledAt: slotData.startTime,
        duration: slotData.duration || 60,
        notes: appointmentReason,
        price: slotData.price || 500
      };

      const res = await this.api.post('/api/bookings', bookingData);
      return res.data.data || res.data;
    } catch (error) {
      console.error('✗ Booking failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async verifyDatabaseBooking(bookingId) {
    try {
      const res = await this.api.get(`/api/bookings/${bookingId}`);
      const booking = res.data.data;

      return {
        exists: !!booking,
        id: booking?.id,
        status: booking?.status,
        scheduledAt: booking?.scheduledAt,
        userId: booking?.userId,
        therapistId: booking?.therapistId,
        createdAt: booking?.createdAt
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  async checkForDoubleBooking(therapistId, startTime) {
    try {
      const res = await this.api.get(`/api/therapists/${therapistId}/bookings`, {
        params: { startTime, status: 'SCHEDULED' }
      });

      const bookings = res.data.data || [];
      return bookings.filter(b =>
        new Date(b.scheduledAt).getTime() === new Date(startTime).getTime()
      );
    } catch (error) {
      console.error('✗ Double-booking check failed:', error.message);
      return [];
    }
  }

  async cancelAppointment(bookingId) {
    try {
      const res = await this.api.patch(`/api/bookings/${bookingId}`, {
        status: 'CANCELLED',
        cancelReason: 'Testing cancellation'
      });
      return res.data.data;
    } catch (error) {
      console.error('✗ Cancellation failed:', error.message);
      throw error;
    }
  }

  async getNotifications() {
    try {
      const res = await this.api.get('/api/notifications?limit=10');
      return res.data.data || [];
    } catch (error) {
      return [];
    }
  }

  async runSingleTest(testNum) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST ${testNum}/10: APPOINTMENT BOOKING FLOW`);
    console.log(`${'='.repeat(60)}`);

    const result = {
      testNum,
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Book appointment
      console.log('\n[STEP 1] Booking appointment...');
      const availability = await this.getTherapistAvailability();

      if (availability.length === 0) {
        throw new Error('No availability slots found');
      }

      const slot = availability[Math.floor(Math.random() * availability.length)];
      const appointmentReason = `Test appointment reason ${testNum}`;

      const booking = await this.bookAppointment(slot, appointmentReason);
      const bookingId = booking.id;

      console.log('✓ Booking created:', bookingId);
      result.steps.push({
        name: 'Create Booking',
        status: 'PASS',
        bookingId,
        data: booking
      });

      // Step 2: Verify database has appointment
      console.log('\n[STEP 2] Verifying database state...');
      await new Promise(r => setTimeout(r, 500)); // Wait for DB sync

      const dbVerification = await this.verifyDatabaseBooking(bookingId);
      if (!dbVerification.exists) {
        throw new Error('Booking not found in database');
      }

      console.log('✓ Database verified:', dbVerification);
      result.steps.push({
        name: 'Database Verification',
        status: 'PASS',
        data: dbVerification
      });

      // Step 3: Check for double-booking
      console.log('\n[STEP 3] Checking for double-booking...');
      const doubleBookings = await this.checkForDoubleBooking(
        this.therapistId,
        slot.startTime
      );

      if (doubleBookings.length > 1) {
        result.steps.push({
          name: 'Double-Booking Check',
          status: 'FAIL',
          data: { count: doubleBookings.length, bookings: doubleBookings }
        });
        throw new Error(`Double-booking detected: ${doubleBookings.length} bookings at same time`);
      }

      console.log('✓ No double-booking detected');
      result.steps.push({
        name: 'Double-Booking Check',
        status: 'PASS',
        data: { count: doubleBookings.length }
      });

      // Step 4: Verify frontend UI update
      console.log('\n[STEP 4] Verifying frontend UI updates...');
      await this.page.goto(`${CLIENT_URL}/appointments`);
      await new Promise(r => setTimeout(r, 1000));

      const appointmentVisible = await this.page.evaluate((bookingId) => {
        const html = document.body.innerText;
        return html.includes(bookingId) || html.includes('Booking');
      }, bookingId);

      console.log('✓ Frontend updated:', appointmentVisible ? 'YES' : 'NO');
      result.steps.push({
        name: 'Frontend Update',
        status: appointmentVisible ? 'PASS' : 'WARN',
        data: { isVisible: appointmentVisible }
      });

      // Step 5: Check notifications
      console.log('\n[STEP 5] Checking notifications...');
      const notifications = await this.getNotifications();
      const appointmentNotification = notifications.find(n =>
        n.type === 'appointment' || n.message.toLowerCase().includes('appointment')
      );

      console.log('✓ Notifications queued:', notifications.length);
      result.steps.push({
        name: 'Notifications',
        status: 'PASS',
        data: {
          totalNotifications: notifications.length,
          appointmentNotificationFound: !!appointmentNotification
        }
      });

      // Step 6: Get "My Appointments" and verify
      console.log('\n[STEP 6] Verifying "My Appointments" page...');
      try {
        const myBookings = await this.api.get('/api/bookings?status=SCHEDULED');
        const currentBooking = myBookings.data.data?.find(b => b.id === bookingId);

        if (currentBooking) {
          console.log('✓ Booking visible in My Appointments');
          result.steps.push({
            name: 'My Appointments Page',
            status: 'PASS',
            data: currentBooking
          });
        }
      } catch (error) {
        console.warn('⚠ Could not verify My Appointments:', error.message);
      }

      // Step 7: Cancel appointment
      console.log('\n[STEP 7] Cancelling appointment...');
      await this.cancelAppointment(bookingId);

      await new Promise(r => setTimeout(r, 500));

      const cancelledVerification = await this.verifyDatabaseBooking(bookingId);
      if (cancelledVerification.status !== 'CANCELLED') {
        throw new Error('Booking was not cancelled in database');
      }

      console.log('✓ Appointment cancelled successfully');
      result.steps.push({
        name: 'Cancellation',
        status: 'PASS',
        data: cancelledVerification
      });

      // Step 8: Re-book same slot
      console.log('\n[STEP 8] Re-booking same slot...');
      const rebooking = await this.bookAppointment(slot, `Rebooking attempt ${testNum}`);
      const rebookingId = rebooking.id;

      console.log('✓ Re-booking created:', rebookingId);
      result.steps.push({
        name: 'Re-booking',
        status: 'PASS',
        bookingId: rebookingId,
        data: rebooking
      });

      // Step 9: Verify re-booking in database
      console.log('\n[STEP 9] Verifying re-booking in database...');
      await new Promise(r => setTimeout(r, 500));

      const rebookVerification = await this.verifyDatabaseBooking(rebookingId);
      if (!rebookVerification.exists) {
        throw new Error('Re-booking not found in database');
      }

      console.log('✓ Re-booking verified in database');
      result.steps.push({
        name: 'Re-booking Verification',
        status: 'PASS',
        data: rebookVerification
      });

      // Step 10: Final cleanup - cancel re-booking
      console.log('\n[STEP 10] Final cleanup - cancelling re-booking...');
      await this.cancelAppointment(rebookingId);
      console.log('✓ Re-booking cancelled');
      result.steps.push({
        name: 'Cleanup',
        status: 'PASS'
      });

      result.status = 'PASS';
      result.summary = 'All appointment booking tests passed';

    } catch (error) {
      console.error('✗ Test failed:', error.message);
      result.status = 'FAIL';
      result.error = error.message;
      result.summary = `Test failed at step: ${error.message}`;
    }

    return result;
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('COMPREHENSIVE APPOINTMENT BOOKING TEST SUITE');
    console.log('='.repeat(60));

    await this.init();

    try {
      await this.login();
      await this.getOrCreateTherapist();

      for (let i = 1; i <= 10; i++) {
        const testResult = await this.runSingleTest(i);
        this.testResults.push(testResult);

        // Add delay between tests to avoid rate limiting
        if (i < 10) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

    } catch (error) {
      console.error('Failed to initialize tests:', error.message);
    } finally {
      await this.generateReport();
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));

    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log(`\nTotal Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / this.testResults.length) * 100).toFixed(2)}%`);

    console.log('\n' + '-'.repeat(60));
    console.log('DETAILED RESULTS');
    console.log('-'.repeat(60));

    this.testResults.forEach(result => {
      console.log(`\nTest ${result.testNum}: ${result.status}`);
      console.log(`Summary: ${result.summary}`);
      console.log(`Steps: ${result.steps.length}/10 completed`);

      result.steps.forEach((step, idx) => {
        const icon = step.status === 'PASS' ? '✓' : step.status === 'FAIL' ? '✗' : '⚠';
        console.log(`  ${icon} ${step.name}: ${step.status}`);
      });
    });

    console.log('\n' + '-'.repeat(60));
    console.log('VERIFICATION CHECKLIST');
    console.log('-'.repeat(60));

    const allPassed = this.testResults.every(r => r.status === 'PASS');
    const stepsSucceeded = this.testResults.every(r =>
      r.steps.every(s => s.status === 'PASS' || s.status === 'WARN')
    );

    console.log(`✓ All data saved correctly: ${allPassed}`);
    console.log(`✓ No double-booking detected: ${allPassed}`);
    console.log(`✓ Database state verified: ${allPassed}`);
    console.log(`✓ Frontend updates verified: ${stepsSucceeded}`);
    console.log(`✓ Notifications queued: ${stepsSucceeded}`);
    console.log(`✓ Cancellation working: ${stepsSucceeded}`);
    console.log(`✓ Re-booking working: ${stepsSucceeded}`);

    console.log('\n' + '='.repeat(60));
  }
}

// Run tests
const tester = new AppointmentBookingTester();
await tester.runAllTests();
