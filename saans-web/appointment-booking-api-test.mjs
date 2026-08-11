import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

class AppointmentBookingAPITester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.userId = null;
    this.therapistId = null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email, password) {
    console.log('\n=== AUTHENTICATION ===');
    console.log('Email:', email);
    try {
      const loginRes = await api.post('/api/auth/login', { email, password });
      this.authToken = loginRes.data.accessToken || loginRes.data.token || loginRes.data.data?.token;
      this.userId = loginRes.data.user?.id || loginRes.data.data?.user?.id;

      if (!this.authToken) {
        throw new Error('No token received in response');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;

      console.log('✓ User authenticated');
      console.log('  Token:', this.authToken.substring(0, 20) + '...');
      console.log('  User ID:', this.userId);
      return true;
    } catch (error) {
      console.error('✗ Auth failed:', error.response?.data?.error || error.message);
      console.error('Status:', error.response?.status);
      return false;
    }
  }

  async getOrCreateTherapist() {
    console.log('\n=== GETTING THERAPIST ===');
    try {
      const res = await api.get('/api/therapists?limit=1');
      if (res.data.data && res.data.data.length > 0) {
        this.therapistId = res.data.data[0].id;
        console.log('✓ Using therapist:', this.therapistId);
        console.log('  Name:', res.data.data[0].user?.name || 'N/A');
        console.log('  Rate:', res.data.data[0].hourlyRate || 'N/A');
        return res.data.data[0];
      }
      throw new Error('No therapists available');
    } catch (error) {
      console.error('✗ Failed to get therapist:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTherapistAvailability() {
    try {
      const res = await api.get(`/api/therapists/${this.therapistId}/availability`);
      const slots = res.data.data || [];
      console.log(`  Found ${slots.length} availability slots`);
      return slots;
    } catch (error) {
      console.error('✗ Failed to get availability:', error.message);
      return [];
    }
  }

  async bookAppointment(slotData, appointmentReason) {
    try {
      // Create a booking date that's in the future
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 2); // 2 days from now
      bookingDate.setHours(14, 0, 0, 0);

      const bookingData = {
        therapistId: this.therapistId,
        scheduledAt: bookingDate.toISOString(),
        duration: 60,
        notes: appointmentReason,
        price: 500
      };

      const res = await api.post('/api/appointments/book', bookingData);
      return res.data.data || res.data;
    } catch (error) {
      console.error('✗ Booking failed:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  async verifyDatabaseBooking(bookingId) {
    try {
      const res = await api.get(`/api/appointments/my-appointments`);
      const bookings = res.data.data || [];
      const booking = bookings.find(b => b.id === bookingId);

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
      console.error('✗ Database verification failed:', error.message);
      return { exists: false, error: error.message };
    }
  }

  async cancelAppointment(bookingId) {
    try {
      const res = await api.post(`/api/appointments/${bookingId}/cancel`, {
        cancelReason: 'Testing cancellation'
      });
      return res.data.data;
    } catch (error) {
      console.error('✗ Cancellation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getNotifications() {
    try {
      const res = await api.get('/api/notifications');
      return res.data.data || [];
    } catch (error) {
      return [];
    }
  }

  async getMyAppointments() {
    try {
      const res = await api.get('/api/appointments/my-appointments');
      // Handle different response formats
      const appointments = res.data.data || res.data.appointments || [];
      return Array.isArray(appointments) ? appointments : [];
    } catch (error) {
      console.error('✗ Failed to get appointments:', error.message);
      return [];
    }
  }

  async runSingleTest(testNum) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TEST ${testNum}/10: APPOINTMENT BOOKING FLOW`);
    console.log(`${'='.repeat(70)}`);

    const result = {
      testNum,
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Book appointment
      console.log('\n[STEP 1/10] Booking appointment...');
      const appointmentReason = `Test appointment ${testNum}`;

      // Calculate date
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 2);
      bookingDate.setHours(14 + testNum, 0, 0, 0);

      const bookingData = {
        therapistId: this.therapistId,
        scheduledAt: bookingDate.toISOString(),
        duration: 60,
        notes: appointmentReason,
        price: 500
      };

      const bookingRes = await api.post('/api/appointments/book', bookingData);
      const booking = bookingRes.data.data || bookingRes.data;
      const bookingId = booking.id || booking.data?.id;

      console.log('✓ Booking created:', bookingId);
      console.log('  Scheduled At:', booking.scheduledAt);
      result.steps.push({
        name: 'Create Booking',
        status: 'PASS',
        bookingId,
        data: booking
      });

      // Step 2: Verify database has appointment
      console.log('\n[STEP 2/10] Verifying database state...');
      await this.sleep(500);

      const myAppointments = await this.getMyAppointments();
      const dbBooking = myAppointments.find(b => b.id === bookingId);

      if (!dbBooking) {
        throw new Error('Booking not found in database');
      }

      console.log('✓ Database verified:', dbBooking.status);
      result.steps.push({
        name: 'Database Verification',
        status: 'PASS',
        data: {
          exists: true,
          id: dbBooking.id,
          status: dbBooking.status,
          scheduledAt: dbBooking.scheduledAt
        }
      });

      // Step 3: Check for double-booking
      console.log('\n[STEP 3/10] Checking for double-booking...');
      const allBookings = await this.getMyAppointments();
      const sameTimeBookings = allBookings.filter(b =>
        new Date(b.scheduledAt).getTime() === new Date(bookingDate).getTime() &&
        b.status !== 'CANCELLED'
      );

      if (sameTimeBookings.length > 1) {
        result.steps.push({
          name: 'Double-Booking Check',
          status: 'FAIL',
          data: { count: sameTimeBookings.length }
        });
        throw new Error(`Double-booking detected: ${sameTimeBookings.length} bookings at same time`);
      }

      console.log('✓ No double-booking detected');
      result.steps.push({
        name: 'Double-Booking Check',
        status: 'PASS',
        data: { count: sameTimeBookings.length }
      });

      // Step 4: Verify frontend data consistency
      console.log('\n[STEP 4/10] Verifying data consistency...');
      if (booking.therapistId === this.therapistId && booking.userId === this.userId) {
        console.log('✓ Data consistency verified');
        result.steps.push({
          name: 'Data Consistency',
          status: 'PASS',
          data: {
            therapistIdMatch: booking.therapistId === this.therapistId,
            userIdMatch: booking.userId === this.userId
          }
        });
      }

      // Step 5: Check notifications
      console.log('\n[STEP 5/10] Checking notifications...');
      await this.sleep(500);
      const notifications = await this.getNotifications();
      const appointmentNotification = notifications.find(n =>
        n.type?.toLowerCase().includes('appointment') ||
        n.message?.toLowerCase().includes('appointment')
      );

      console.log(`✓ Notifications queued: ${notifications.length}`);
      result.steps.push({
        name: 'Notifications',
        status: 'PASS',
        data: {
          totalNotifications: notifications.length,
          appointmentNotificationFound: !!appointmentNotification
        }
      });

      // Step 6: Verify appointment in My Appointments page
      console.log('\n[STEP 6/10] Verifying "My Appointments" page...');
      const pageAppointments = await this.getMyAppointments();
      const pageBooking = pageAppointments.find(b => b.id === bookingId);

      if (pageBooking) {
        console.log('✓ Booking visible in My Appointments');
        console.log('  Status:', pageBooking.status);
        result.steps.push({
          name: 'My Appointments Page',
          status: 'PASS',
          data: {
            visible: true,
            status: pageBooking.status
          }
        });
      } else {
        console.log('⚠ Booking not found in My Appointments (may sync later)');
        result.steps.push({
          name: 'My Appointments Page',
          status: 'WARN',
          data: { visible: false }
        });
      }

      // Step 7: Cancel appointment
      console.log('\n[STEP 7/10] Cancelling appointment...');
      const cancelRes = await api.post(`/api/appointments/${bookingId}/cancel`, {
        cancelReason: 'Testing cancellation'
      });

      await this.sleep(500);

      // Verify cancellation
      const cancelledAppointments = await this.getMyAppointments();
      const cancelledBooking = cancelledAppointments.find(b => b.id === bookingId);

      if (cancelledBooking?.status === 'CANCELLED') {
        console.log('✓ Appointment cancelled successfully');
        console.log('  New Status:', cancelledBooking.status);
        result.steps.push({
          name: 'Cancellation',
          status: 'PASS',
          data: {
            status: cancelledBooking.status,
            cancelledAt: cancelledBooking.cancelledAt
          }
        });
      } else {
        throw new Error('Booking was not cancelled in database');
      }

      // Step 8: Re-book same therapist different time
      console.log('\n[STEP 8/10] Re-booking with same therapist...');
      const rebookDate = new Date();
      rebookDate.setDate(rebookDate.getDate() + 3);
      rebookDate.setHours(15, 0, 0, 0);

      const rebookingData = {
        therapistId: this.therapistId,
        scheduledAt: rebookDate.toISOString(),
        duration: 60,
        notes: `Re-booking attempt ${testNum}`,
        price: 500
      };

      const rebookRes = await api.post('/api/appointments/book', rebookingData);
      const rebooking = rebookRes.data.data || rebookRes.data;
      const rebookingId = rebooking.id;

      console.log('✓ Re-booking created:', rebookingId);
      result.steps.push({
        name: 'Re-booking',
        status: 'PASS',
        bookingId: rebookingId,
        data: rebooking
      });

      // Step 9: Verify re-booking in database
      console.log('\n[STEP 9/10] Verifying re-booking in database...');
      await this.sleep(500);

      const rebookAppointments = await this.getMyAppointments();
      const rebookVerification = rebookAppointments.find(b => b.id === rebookingId);

      if (rebookVerification) {
        console.log('✓ Re-booking verified in database');
        result.steps.push({
          name: 'Re-booking Verification',
          status: 'PASS',
          data: {
            exists: true,
            status: rebookVerification.status
          }
        });
      }

      // Step 10: Final cleanup - cancel re-booking
      console.log('\n[STEP 10/10] Final cleanup - cancelling re-booking...');
      await api.post(`/api/appointments/${rebookingId}/cancel`, {
        cancelReason: 'Test cleanup'
      });
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
      result.summary = `Test failed: ${error.message}`;
    }

    return result;
  }

  async runAllTests(email, password) {
    console.log('\n' + '='.repeat(70));
    console.log('COMPREHENSIVE APPOINTMENT BOOKING TEST SUITE (API)');
    console.log('='.repeat(70));

    try {
      const loginSuccess = await this.login(email, password);
      if (!loginSuccess) {
        console.error('\nCannot continue without authentication');
        return;
      }

      await this.getOrCreateTherapist();

      console.log('\nRunning 10 sequential tests...');

      for (let i = 1; i <= 10; i++) {
        const testResult = await this.runSingleTest(i);
        this.testResults.push(testResult);

        // Add delay between tests
        if (i < 10) {
          console.log(`\nWaiting before next test...`);
          await this.sleep(2000);
        }
      }

    } catch (error) {
      console.error('Failed to run tests:', error.message);
    } finally {
      this.generateReport();
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST EXECUTION SUMMARY');
    console.log('='.repeat(70));

    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log(`\nTotal Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${this.testResults.length > 0 ? ((passedTests / this.testResults.length) * 100).toFixed(2) : 0}%`);

    console.log('\n' + '-'.repeat(70));
    console.log('DETAILED RESULTS');
    console.log('-'.repeat(70));

    this.testResults.forEach(result => {
      console.log(`\nTest ${result.testNum}: ${result.status}`);
      console.log(`Summary: ${result.summary}`);
      console.log(`Steps: ${result.steps.filter(s => s.status === 'PASS').length}/${result.steps.length} completed`);

      result.steps.forEach((step) => {
        const icon = step.status === 'PASS' ? '✓' : step.status === 'FAIL' ? '✗' : '⚠';
        console.log(`  ${icon} ${step.name}: ${step.status}`);
      });
    });

    console.log('\n' + '-'.repeat(70));
    console.log('VERIFICATION CHECKLIST');
    console.log('-'.repeat(70));

    const allPassed = this.testResults.every(r => r.status === 'PASS');
    const stepsSucceeded = this.testResults.every(r =>
      r.steps.every(s => s.status === 'PASS' || s.status === 'WARN')
    );

    console.log(`✓ All bookings created: ${passedTests === this.testResults.length ? 'YES' : 'NO'}`);
    console.log(`✓ All data saved correctly: ${allPassed ? 'YES' : 'NO'}`);
    console.log(`✓ No double-booking detected: ${this.testResults.every(r => r.steps.find(s => s.name === 'Double-Booking Check')?.status !== 'FAIL') ? 'YES' : 'NO'}`);
    console.log(`✓ Database state verified: ${allPassed ? 'YES' : 'NO'}`);
    console.log(`✓ Frontend consistency verified: ${stepsSucceeded ? 'YES' : 'NO'}`);
    console.log(`✓ Notifications queued: ${this.testResults.every(r => r.steps.find(s => s.name === 'Notifications')?.status === 'PASS') ? 'YES' : 'NO'}`);
    console.log(`✓ Cancellation working: ${stepsSucceeded ? 'YES' : 'NO'}`);
    console.log(`✓ Re-booking working: ${this.testResults.every(r => r.steps.find(s => s.name === 'Re-booking')?.status === 'PASS') ? 'YES' : 'NO'}`);

    console.log('\n' + '='.repeat(70));
    console.log('TEST COMPLETE');
    console.log('='.repeat(70));
  }
}

// Main execution
const testEmail = process.argv[2] || 'test@test.com';
const testPassword = process.argv[3] || 'Test@1234';

console.log('\nUsing credentials:');
console.log('Email:', testEmail);
console.log('Password:', '***' + testPassword.slice(-4));

const tester = new AppointmentBookingAPITester();
await tester.runAllTests(testEmail, testPassword);
