import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

// Test Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

// Helper functions
function log(message: string, color: string = 'reset') {
  console.log(`${colors[color as keyof typeof colors]}${message}${colors.reset}`);
}

function pass(test: string, details: string = '') {
  results.push({ name: test, passed: true });
  log(`✓ ${test} ${details}`, 'green');
}

function fail(test: string, error: string) {
  results.push({ name: test, passed: false, error });
  log(`✗ ${test}: ${error}`, 'red');
}

// Test Data
const testEmail = `test_${Date.now()}@example.com`;
const testTherapistEmail = `therapist_${Date.now()}@example.com`;

async function testUserProfiles() {
  log('\n--- Testing User Profiles ---', 'cyan');

  try {
    // 1. Create user via API
    const createRes = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: 'Test@1234',
      name: 'Test User',
      role: 'PATIENT',
    });

    const userId = createRes.data.user?.id;
    if (!userId) throw new Error('No userId in response');

    pass('User created via API', `ID: ${userId}`);

    // 2. Query database directly
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) throw new Error('User not found in database');
    pass('User found in database', 'Data synced');

    // 3. Verify data matches
    if (dbUser.email !== testEmail) {
      throw new Error(`Email mismatch: API ${testEmail} vs DB ${dbUser.email}`);
    }
    if (dbUser.name !== 'Test User') {
      throw new Error(`Name mismatch: API "Test User" vs DB "${dbUser.name}"`);
    }
    pass('User data matches API response', 'Email and name verified');

    // 4. Update via API
    const updateRes = await axios.put(`${API_URL}/users/${userId}`, {
      name: 'Updated User',
      bio: 'Test bio',
      city: 'Test City',
    });

    pass('User updated via API', 'bio and city added');

    // 5. Verify database updated
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!updatedUser) throw new Error('Updated user not found');
    if (updatedUser.bio !== 'Test bio') {
      throw new Error(`Bio not updated in database`);
    }
    if (updatedUser.city !== 'Test City') {
      throw new Error(`City not updated in database`);
    }
    pass('Database updated correctly', 'Changes persisted');

    // 6. Delete via API
    await axios.delete(`${API_URL}/users/${userId}`);
    pass('User deleted via API', '');

    // 7. Verify database deleted
    const deletedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (deletedUser && deletedUser.isActive) {
      throw new Error('User still active in database');
    }
    pass('User deletion verified in database', 'Soft delete confirmed');

    return userId;
  } catch (error: any) {
    fail('User Profile Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testTherapistData() {
  log('\n--- Testing Therapist Data ---', 'cyan');

  try {
    // 1. Create therapist user via API
    const createRes = await axios.post(`${API_URL}/auth/register`, {
      email: testTherapistEmail,
      password: 'Test@1234',
      name: 'Dr. Test Therapist',
      role: 'THERAPIST',
    });

    const userId = createRes.data.user?.id;
    if (!userId) throw new Error('No userId in response');

    // 2. Create therapist profile
    const therapistRes = await axios.post(`${API_URL}/therapists`, {
      userId,
      licenseNumber: `LICENSE_${Date.now()}`,
      specialization: ['Depression', 'Anxiety'],
      yearsOfExperience: 5,
      hourlyRate: 500,
    });

    const therapistId = therapistRes.data.id;
    if (!therapistId) throw new Error('No therapistId in response');

    pass('Therapist created via API', `ID: ${therapistId}`);

    // 3. Query database
    const dbTherapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: { user: true },
    });

    if (!dbTherapist) throw new Error('Therapist not found in database');
    pass('Therapist found in database', 'Data synced');

    // 4. Verify data
    if (dbTherapist.licenseNumber !== `LICENSE_${Date.now()}`) {
      // Check with tolerance
      if (!dbTherapist.licenseNumber.startsWith('LICENSE_')) {
        throw new Error('License number not persisted correctly');
      }
    }
    pass('Therapist data matches', 'License and specialization verified');

    // 5. Update therapist
    const updateRes = await axios.put(
      `${API_URL}/therapists/${therapistId}`,
      {
        specialization: ['Depression', 'Anxiety', 'OCD'],
        hourlyRate: 600,
        yearsOfExperience: 6,
      }
    );

    // 6. Verify update in database
    const updatedTherapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!updatedTherapist) throw new Error('Updated therapist not found');
    if (updatedTherapist.hourlyRate !== 600) {
      throw new Error(`Hourly rate not updated in database`);
    }
    pass('Therapist updated in database', 'Rate change persisted');

    return { userId, therapistId };
  } catch (error: any) {
    fail('Therapist Data Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testAppointments(
  userId: string,
  therapistId: string
) {
  log('\n--- Testing Appointments ---', 'cyan');

  try {
    const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // 1. Create appointment via API
    const createRes = await axios.post(
      `${API_URL}/appointments`,
      {
        userId,
        therapistId,
        scheduledAt: appointmentDate.toISOString(),
        duration: 60,
        price: 500,
      }
    );

    const appointmentId = createRes.data.id;
    if (!appointmentId) throw new Error('No appointmentId in response');

    pass('Appointment created via API', `ID: ${appointmentId}`);

    // 2. Query database
    const dbAppointment = await prisma.therapyBooking.findUnique({
      where: { id: appointmentId },
      include: { user: true, therapist: true },
    });

    if (!dbAppointment) throw new Error('Appointment not found in database');
    pass('Appointment found in database', 'Data synced');

    // 3. Verify data
    if (dbAppointment.userId !== userId) {
      throw new Error('UserId mismatch in database');
    }
    if (dbAppointment.therapistId !== therapistId) {
      throw new Error('TherapistId mismatch in database');
    }
    pass('Appointment data matches', 'User and therapist IDs verified');

    // 4. Update appointment
    const newDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    const updateRes = await axios.put(
      `${API_URL}/appointments/${appointmentId}`,
      {
        scheduledAt: newDate.toISOString(),
        notes: 'Updated appointment notes',
      }
    );

    // 5. Verify update in database
    const updatedAppointment = await prisma.therapyBooking.findUnique({
      where: { id: appointmentId },
    });

    if (!updatedAppointment) throw new Error('Updated appointment not found');
    if (!updatedAppointment.notes?.includes('Updated')) {
      throw new Error('Notes not updated in database');
    }
    pass('Appointment updated in database', 'Notes and date persisted');

    // 6. Delete appointment
    await axios.delete(`${API_URL}/appointments/${appointmentId}`);
    pass('Appointment deleted via API', '');

    // 7. Verify deletion
    const deletedAppointment = await prisma.therapyBooking.findUnique({
      where: { id: appointmentId },
    });

    if (
      deletedAppointment &&
      deletedAppointment.status !== 'CANCELLED'
    ) {
      throw new Error('Appointment not cancelled in database');
    }
    pass('Appointment deletion verified in database', 'Status changed to CANCELLED');

    return appointmentId;
  } catch (error: any) {
    fail('Appointment Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testPayments(userId: string) {
  log('\n--- Testing Payments ---', 'cyan');

  try {
    // 1. Create payment via API
    const createRes = await axios.post(
      `${API_URL}/payments`,
      {
        userId,
        amount: 499,
        currency: 'INR',
        subscriptionType: 'PREMIUM',
        billingCycle: 'MONTHLY',
      }
    );

    const paymentId = createRes.data.id;
    if (!paymentId) throw new Error('No paymentId in response');

    pass('Payment created via API', `ID: ${paymentId}`);

    // 2. Query database
    const dbPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!dbPayment) throw new Error('Payment not found in database');
    pass('Payment found in database', 'Data synced');

    // 3. Verify data
    if (dbPayment.userId !== userId) {
      throw new Error('UserId mismatch in payment');
    }
    if (dbPayment.amount !== 499) {
      throw new Error('Amount mismatch in payment');
    }
    pass('Payment data matches', 'Amount and user verified');

    // 4. Update payment status
    const updateRes = await axios.put(
      `${API_URL}/payments/${paymentId}`,
      {
        status: 'COMPLETED',
      }
    );

    // 5. Verify update
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!updatedPayment) throw new Error('Updated payment not found');
    if (updatedPayment.status !== 'COMPLETED') {
      throw new Error('Payment status not updated in database');
    }
    pass('Payment status updated in database', 'Status: COMPLETED');

    return paymentId;
  } catch (error: any) {
    fail('Payment Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testMoodEntries(userId: string) {
  log('\n--- Testing Mood Entries ---', 'cyan');

  try {
    // 1. Create mood entry via API
    const createRes = await axios.post(
      `${API_URL}/moods`,
      {
        userId,
        moodScore: 7,
        moodCategory: 'Happy',
        symptoms: ['Energy', 'Positivity'],
        triggers: ['Morning walk', 'Coffee'],
        notes: 'Feeling good today',
        location: 'Home',
        weather: 'Sunny',
      }
    );

    const moodId = createRes.data.id;
    if (!moodId) throw new Error('No moodId in response');

    pass('Mood entry created via API', `ID: ${moodId}`);

    // 2. Query database
    const dbMood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
      include: { user: true },
    });

    if (!dbMood) throw new Error('Mood entry not found in database');
    pass('Mood entry found in database', 'Data synced');

    // 3. Verify data
    if (dbMood.moodScore !== 7) {
      throw new Error('Mood score mismatch');
    }
    if (dbMood.moodCategory !== 'Happy') {
      throw new Error('Mood category mismatch');
    }
    pass('Mood data matches', 'Score and category verified');

    // 4. Update mood entry
    const updateRes = await axios.put(
      `${API_URL}/moods/${moodId}`,
      {
        moodScore: 8,
        notes: 'Updated - feeling even better',
      }
    );

    // 5. Verify update
    const updatedMood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
    });

    if (!updatedMood) throw new Error('Updated mood not found');
    if (updatedMood.moodScore !== 8) {
      throw new Error('Mood score not updated in database');
    }
    pass('Mood entry updated in database', 'Score updated to 8');

    // 6. Delete mood entry
    await axios.delete(`${API_URL}/moods/${moodId}`);
    pass('Mood entry deleted via API', '');

    // 7. Verify deletion
    const deletedMood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
    });

    if (deletedMood) {
      throw new Error('Mood entry not deleted from database');
    }
    pass('Mood entry deletion verified', 'Record removed from database');

    return moodId;
  } catch (error: any) {
    fail('Mood Entry Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testCommunityPosts(userId: string) {
  log('\n--- Testing Community Posts ---', 'cyan');

  try {
    // First, ensure a community group exists
    const groupRes = await axios.post(
      `${API_URL}/community/groups`,
      {
        name: `Group_${Date.now()}`,
        description: 'Test Community Group',
        category: 'General',
      }
    );

    const groupId = groupRes.data.id;

    // 1. Create post via API
    const createRes = await axios.post(
      `${API_URL}/community/posts`,
      {
        groupId,
        userId,
        title: 'Test Community Post',
        content: 'This is a test community post',
        category: 'General',
      }
    );

    const postId = createRes.data.id;
    if (!postId) throw new Error('No postId in response');

    pass('Community post created via API', `ID: ${postId}`);

    // 2. Query database
    const dbPost = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: { author: true, group: true },
    });

    if (!dbPost) throw new Error('Post not found in database');
    pass('Community post found in database', 'Data synced');

    // 3. Verify data
    if (dbPost.userId !== userId) {
      throw new Error('UserId mismatch in post');
    }
    if (dbPost.title !== 'Test Community Post') {
      throw new Error('Title mismatch');
    }
    pass('Post data matches', 'Title and author verified');

    // 4. Update post
    const updateRes = await axios.put(
      `${API_URL}/community/posts/${postId}`,
      {
        title: 'Updated Community Post',
        content: 'Updated content here',
      }
    );

    // 5. Verify update
    const updatedPost = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!updatedPost) throw new Error('Updated post not found');
    if (updatedPost.title !== 'Updated Community Post') {
      throw new Error('Title not updated in database');
    }
    pass('Post updated in database', 'Title and content persisted');

    // 6. Delete post
    await axios.delete(`${API_URL}/community/posts/${postId}`);
    pass('Post deleted via API', '');

    // 7. Verify deletion
    const deletedPost = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (deletedPost && deletedPost.isActive) {
      throw new Error('Post still active in database');
    }
    pass('Post deletion verified', 'Soft deleted from database');

    return postId;
  } catch (error: any) {
    fail('Community Post Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testCrisisIncidents(userId: string) {
  log('\n--- Testing Crisis Incidents ---', 'cyan');

  try {
    // 1. Create crisis incident via API
    const createRes = await axios.post(
      `${API_URL}/crisis`,
      {
        userId,
        level: 'MEDIUM',
        content: 'User experiencing crisis',
      }
    );

    const crisisId = createRes.data.id;
    if (!crisisId) throw new Error('No crisisId in response');

    pass('Crisis incident created via API', `ID: ${crisisId}`);

    // 2. Query database
    const dbCrisis = await prisma.crisisIncident.findUnique({
      where: { id: crisisId },
      include: { user: true },
    });

    if (!dbCrisis) throw new Error('Crisis incident not found in database');
    pass('Crisis incident found in database', 'Data synced');

    // 3. Verify data
    if (dbCrisis.userId !== userId) {
      throw new Error('UserId mismatch in crisis incident');
    }
    if (dbCrisis.level !== 'MEDIUM') {
      throw new Error('Crisis level mismatch');
    }
    pass('Crisis data matches', 'Level and user verified');

    // 4. Update crisis status
    const updateRes = await axios.put(
      `${API_URL}/crisis/${crisisId}`,
      {
        status: 'RESOLVED',
        resolution: 'User stabilized',
      }
    );

    // 5. Verify update
    const updatedCrisis = await prisma.crisisIncident.findUnique({
      where: { id: crisisId },
    });

    if (!updatedCrisis) throw new Error('Updated crisis not found');
    if (updatedCrisis.status !== 'RESOLVED') {
      throw new Error('Crisis status not updated in database');
    }
    pass('Crisis updated in database', 'Status: RESOLVED');

    // 6. Delete/archive crisis
    await axios.delete(`${API_URL}/crisis/${crisisId}`);
    pass('Crisis incident deleted via API', '');

    return crisisId;
  } catch (error: any) {
    fail('Crisis Incident Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function runAllTests() {
  log('========================================', 'blue');
  log('SAANS Database Synchronization Tests', 'blue');
  log('========================================', 'blue');

  try {
    let userIds: any = {};

    // Test 1: User Profiles
    userIds.patient = await testUserProfiles();

    // Test 2: Therapist Data
    const therapist = await testTherapistData();
    userIds.therapist = therapist.userId;

    // Test 3: Appointments
    await testAppointments(userIds.patient, therapist.therapistId);

    // Test 4: Payments
    await testPayments(userIds.patient);

    // Test 5: Mood Entries
    await testMoodEntries(userIds.patient);

    // Test 6: Community Posts
    await testCommunityPosts(userIds.patient);

    // Test 7: Crisis Incidents
    await testCrisisIncidents(userIds.patient);

    // Summary
    log('\n========================================', 'blue');
    log('Test Summary', 'blue');
    log('========================================', 'blue');

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    log(`\nTotal Tests: ${results.length}`, 'cyan');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');

    if (failed > 0) {
      log('\nFailed Tests:', 'red');
      results.filter((r) => !r.passed).forEach((r) => {
        log(`  - ${r.name}: ${r.error}`, 'red');
      });
    }

    log('\n========================================', 'blue');
  } catch (error: any) {
    log(`\nTest execution failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit(results.some((r) => !r.passed) ? 1 : 0);
  }
}

// Run tests
runAllTests();
