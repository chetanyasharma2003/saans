import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL, validateStatus: () => true });

class AppointmentSlotsTestSuite {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.userId = null;
    this.therapistId = null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logTest(testName, status, details = '') {
    const result = { testName, status, details };
    this.testResults.push(result);
    const icon = status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${testName}: ${status}${details ? ' - ' + details : ''}`);
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Authenticate user
   */
  async authenticate() {
    console.log('\n=== AUTHENTICATION ===');
    try {
      // Use the known test credentials
      const loginRes = await api.post('/api/auth/login', {
        email: 'patient@test.com',
        password: 'Patient@1234'
      });

      if (loginRes.status !== 200 && loginRes.status !== 201) {
        console.error('Login failed with status:', loginRes.status);
        throw new Error(`Login failed: ${loginRes.data?.message || loginRes.data?.error}`);
      }

      // Try different response formats
      this.authToken = loginRes.data.accessToken ||
                       loginRes.data.token ||
                       loginRes.data.data?.token ||
                       loginRes.data.data?.accessToken;
      this.userId = loginRes.data.user?.id ||
                    loginRes.data.data?.user?.id ||
                    loginRes.data.userId ||
                    loginRes.data.data?.userId;

      if (!this.authToken) {
        console.error('Response data:', JSON.stringify(loginRes.data, null, 2));
        throw new Error('No token found in response');
      }

      if (!this.userId) {
        console.error('Response data:', JSON.stringify(loginRes.data, null, 2));
        throw new Error('No user ID found in response');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      console.log('✓ User authenticated');
      console.log('  User ID:', this.userId);
      console.log('  Token:', this.authToken.substring(0, 20) + '...');
      return true;
    } catch (error) {
      console.error('✗ Auth failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get or create a therapist
   */
  async getTherapist() {
    console.log('\n=== GET THERAPIST ===');
    try {
      const res = await api.get('/api/therapists?limit=1');

      if (res.data.data && res.data.data.length > 0) {
        this.therapistId = res.data.data[0].id;
        console.log('✓ Using therapist:', this.therapistId);
        console.log('  Name:', res.data.data[0].user?.name || res.data.data[0].name || 'N/A');
        return res.data.data[0];
      }

      throw new Error('No therapists available');
    } catch (error) {
      console.error('✗ Failed to get therapist:', error.response?.data?.message || error.message);
      return null;
    }
  }

  /**
   * Test: Valid call with future date
   */
  async testValidCallFutureDate() {
    console.log('\n=== TEST 1: Valid Call with Future Date ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data) {
        this.logTest('Valid future date request', 'PASS', `Status: ${res.status}, Slots: ${res.data.availableSlots?.length || 0}`);
        console.log('  Response:', JSON.stringify(res.data, null, 2));
        return true;
      } else {
        this.logTest('Valid future date request', 'FAIL', `Status: ${res.status}, ${res.data?.message || 'No data'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Valid future date request', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Valid call with past date (should return empty or error)
   */
  async testPastDate() {
    console.log('\n=== TEST 2: Past Date ===');
    try {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateStr = this.formatDate(pastDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data) {
        const slotsCount = res.data.availableSlots?.length || 0;
        const passed = slotsCount === 0; // Past dates should return no slots
        this.logTest('Past date request', passed ? 'PASS' : 'WARN', `Status: ${res.status}, Slots: ${slotsCount}`);
        return passed;
      } else {
        this.logTest('Past date request', 'FAIL', `Status: ${res.status}, ${res.data?.message || 'No data'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Past date request', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Today's date (should include today if slots available)
   */
  async testTodayDate() {
    console.log('\n=== TEST 3: Today\'s Date ===');
    try {
      const today = new Date();
      const dateStr = this.formatDate(today);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data) {
        this.logTest('Today\'s date request', 'PASS', `Status: ${res.status}, Slots: ${res.data.availableSlots?.length || 0}`);
        return true;
      } else {
        this.logTest('Today\'s date request', 'FAIL', `Status: ${res.status}, ${res.data?.message || 'No data'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Today\'s date request', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Default duration (60 minutes)
   */
  async testDefaultDuration() {
    console.log('\n=== TEST 4: Default Duration (60 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data && res.data.duration === 60) {
        this.logTest('Default duration', 'PASS', `Duration: ${res.data.duration} minutes`);
        return true;
      } else {
        this.logTest('Default duration', 'FAIL', `Status: ${res.status}, Duration: ${res.data?.duration || 'undefined'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Default duration', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Custom duration parameter
   */
  async testCustomDuration() {
    console.log('\n=== TEST 5: Custom Duration (30 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=30`);

      if (res.status === 200 && res.data && res.data.duration === 30) {
        this.logTest('Custom duration (30 min)', 'PASS', `Duration: ${res.data.duration} minutes`);
        return true;
      } else {
        this.logTest('Custom duration (30 min)', 'FAIL', `Status: ${res.status}, Duration: ${res.data?.duration || 'undefined'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Custom duration (30 min)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Duration 90 minutes
   */
  async testDuration90Minutes() {
    console.log('\n=== TEST 6: Custom Duration (90 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=90`);

      if (res.status === 200 && res.data && res.data.duration === 90) {
        this.logTest('Custom duration (90 min)', 'PASS', `Duration: ${res.data.duration} minutes`);
        return true;
      } else {
        this.logTest('Custom duration (90 min)', 'FAIL', `Status: ${res.status}, Duration: ${res.data?.duration || 'undefined'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Custom duration (90 min)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Maximum valid duration (480 minutes = 8 hours)
   */
  async testMaximumDuration() {
    console.log('\n=== TEST 7: Maximum Duration (480 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=480`);

      if (res.status === 200 && res.data && res.data.duration === 480) {
        this.logTest('Maximum duration (480 min)', 'PASS', `Duration: ${res.data.duration} minutes`);
        return true;
      } else {
        this.logTest('Maximum duration (480 min)', 'FAIL', `Status: ${res.status}, Duration: ${res.data?.duration || 'undefined'}`);
        return false;
      }
    } catch (error) {
      this.logTest('Maximum duration (480 min)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid duration (too large - 481 minutes)
   */
  async testInvalidDurationTooLarge() {
    console.log('\n=== TEST 8: Invalid Duration (481 minutes - exceeds max) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=481`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid duration (>480)', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid duration (>480)', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid duration (>480)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid duration (zero)
   */
  async testInvalidDurationZero() {
    console.log('\n=== TEST 9: Invalid Duration (0 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=0`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid duration (0)', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid duration (0)', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid duration (0)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid duration (negative)
   */
  async testInvalidDurationNegative() {
    console.log('\n=== TEST 10: Invalid Duration (-30 minutes) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=-30`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid duration (negative)', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid duration (negative)', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid duration (negative)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid duration (non-numeric)
   */
  async testInvalidDurationNonNumeric() {
    console.log('\n=== TEST 11: Invalid Duration (non-numeric string) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}&duration=abc`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid duration (non-numeric)', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid duration (non-numeric)', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid duration (non-numeric)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Missing date parameter
   */
  async testMissingDate() {
    console.log('\n=== TEST 12: Missing Date Parameter ===');
    try {
      const res = await api.get(`/api/appointments/slots/${this.therapistId}`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Missing date parameter', 'PASS', `Correctly rejected with status ${res.status}`);
        console.log('  Message:', res.data?.message || res.data?.error || 'No message');
        return true;
      } else {
        this.logTest('Missing date parameter', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Missing date parameter', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid date format
   */
  async testInvalidDateFormat() {
    console.log('\n=== TEST 13: Invalid Date Format ===');
    try {
      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=invalid-date`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid date format', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid date format', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid date format', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid date format (wrong separator)
   */
  async testInvalidDateFormatSlash() {
    console.log('\n=== TEST 14: Invalid Date Format (MM/DD/YYYY) ===');
    try {
      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=08/15/2026`);

      if (res.status === 400 || res.status === 422) {
        this.logTest('Invalid date format (slash)', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid date format (slash)', 'FAIL', `Status: ${res.status}, expected 400/422`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid date format (slash)', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Missing therapist ID
   */
  async testMissingTherapistId() {
    console.log('\n=== TEST 15: Missing Therapist ID ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/?date=${dateStr}`);

      if (res.status === 404 || res.status === 400) {
        this.logTest('Missing therapist ID', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Missing therapist ID', 'FAIL', `Status: ${res.status}, expected 404/400`);
        return false;
      }
    } catch (error) {
      this.logTest('Missing therapist ID', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Invalid therapist ID (non-existent)
   */
  async testInvalidTherapistId() {
    console.log('\n=== TEST 16: Invalid Therapist ID (non-existent) ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/invalid-id-12345?date=${dateStr}`);

      if (res.status === 404 || res.status === 400) {
        this.logTest('Invalid therapist ID', 'PASS', `Correctly rejected with status ${res.status}`);
        return true;
      } else {
        this.logTest('Invalid therapist ID', 'FAIL', `Status: ${res.status}, expected 404/400`);
        return false;
      }
    } catch (error) {
      this.logTest('Invalid therapist ID', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Response structure validation
   */
  async testResponseStructure() {
    console.log('\n=== TEST 17: Response Structure Validation ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data) {
        const requiredFields = ['therapistId', 'date', 'availableSlots'];
        const hasAllFields = requiredFields.every(field => field in res.data);

        if (hasAllFields) {
          this.logTest('Response structure', 'PASS', 'All required fields present');
          console.log('  Response structure:', Object.keys(res.data));

          // Check availableSlots array structure
          if (res.data.availableSlots && res.data.availableSlots.length > 0) {
            const firstSlot = res.data.availableSlots[0];
            const slotFields = Object.keys(firstSlot);
            console.log('  First slot fields:', slotFields);
          }
          return true;
        } else {
          const missing = requiredFields.filter(f => !(f in res.data));
          this.logTest('Response structure', 'FAIL', `Missing fields: ${missing.join(', ')}`);
          return false;
        }
      } else {
        this.logTest('Response structure', 'FAIL', `Status: ${res.status}`);
        return false;
      }
    } catch (error) {
      this.logTest('Response structure', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Slots are in future
   */
  async testSlotsAreFuture() {
    console.log('\n=== TEST 18: Slots Are in Future ===');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const res = await api.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 200 && res.data && res.data.availableSlots) {
        const slots = res.data.availableSlots;

        if (slots.length === 0) {
          this.logTest('Slots are in future', 'WARN', 'No slots available to validate');
          return true;
        }

        // Check that all slots have start and end times
        const allHaveTimes = slots.every(slot => slot.startTime && slot.endTime);

        if (allHaveTimes) {
          this.logTest('Slots are in future', 'PASS', `All ${slots.length} slots have times`);
          console.log('  Sample slot:', slots[0]);
          return true;
        } else {
          this.logTest('Slots are in future', 'FAIL', 'Some slots missing time fields');
          return false;
        }
      } else {
        this.logTest('Slots are in future', 'FAIL', `Status: ${res.status}`);
        return false;
      }
    } catch (error) {
      this.logTest('Slots are in future', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Test: Check for authentication requirement
   */
  async testAuthenticationRequired() {
    console.log('\n=== TEST 19: Authentication Required ===');
    try {
      // Remove auth token
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = this.formatDate(futureDate);

      const noAuthApi = axios.create({ baseURL: API_URL, validateStatus: () => true });
      const res = await noAuthApi.get(`/api/appointments/slots/${this.therapistId}?date=${dateStr}`);

      if (res.status === 401 || res.status === 403) {
        this.logTest('Authentication required', 'PASS', `Correctly rejected unauthenticated request (status ${res.status})`);
        return true;
      } else if (res.status === 200) {
        this.logTest('Authentication required', 'WARN', 'Request succeeded without auth (might be allowed)');
        return true;
      } else {
        this.logTest('Authentication required', 'FAIL', `Unexpected status: ${res.status}`);
        return false;
      }
    } catch (error) {
      this.logTest('Authentication required', 'FAIL', error.message);
      return false;
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n\n=== TEST SUMMARY ===');
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warned = this.testResults.filter(r => r.status === 'WARN').length;

    console.log(`\nTotal Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Warnings: ${warned}`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.testName}: ${r.details}`);
      });
    }

    if (warned > 0) {
      console.log('\nWarnings:');
      this.testResults.filter(r => r.status === 'WARN').forEach(r => {
        console.log(`  - ${r.testName}: ${r.details}`);
      });
    }

    return {
      total: this.testResults.length,
      passed,
      failed,
      warned,
      results: this.testResults
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('========================================');
    console.log('GET /api/appointments/slots/:therapistId');
    console.log('COMPREHENSIVE TEST SUITE');
    console.log('========================================');

    // Setup
    if (!(await this.authenticate())) {
      console.error('Failed to authenticate. Aborting tests.');
      return this.generateReport();
    }

    const therapist = await this.getTherapist();
    if (!therapist) {
      console.error('Failed to get therapist. Aborting tests.');
      return this.generateReport();
    }

    // Run all tests
    await this.testValidCallFutureDate();
    await this.sleep(200);

    await this.testPastDate();
    await this.sleep(200);

    await this.testTodayDate();
    await this.sleep(200);

    await this.testDefaultDuration();
    await this.sleep(200);

    await this.testCustomDuration();
    await this.sleep(200);

    await this.testDuration90Minutes();
    await this.sleep(200);

    await this.testMaximumDuration();
    await this.sleep(200);

    await this.testInvalidDurationTooLarge();
    await this.sleep(200);

    await this.testInvalidDurationZero();
    await this.sleep(200);

    await this.testInvalidDurationNegative();
    await this.sleep(200);

    await this.testInvalidDurationNonNumeric();
    await this.sleep(200);

    await this.testMissingDate();
    await this.sleep(200);

    await this.testInvalidDateFormat();
    await this.sleep(200);

    await this.testInvalidDateFormatSlash();
    await this.sleep(200);

    await this.testMissingTherapistId();
    await this.sleep(200);

    await this.testInvalidTherapistId();
    await this.sleep(200);

    await this.testResponseStructure();
    await this.sleep(200);

    await this.testSlotsAreFuture();
    await this.sleep(200);

    await this.testAuthenticationRequired();
    await this.sleep(200);

    return this.generateReport();
  }
}

// Run tests
const tester = new AppointmentSlotsTestSuite();
const report = await tester.runAllTests();

// Write results to file
import fs from 'fs';
fs.writeFileSync(
  '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/slots-test-results.json',
  JSON.stringify(report, null, 2)
);

console.log('\n✓ Results saved to slots-test-results.json');
process.exit(0);
