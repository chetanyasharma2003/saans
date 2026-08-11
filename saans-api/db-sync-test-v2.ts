import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

// Create axios instance with cookie jar support
const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  validateStatus: () => true, // Don't throw on any status code
});

// Track CSRF token and session ID globally
let globalCSRFToken: string = '';
let globalSessionId: string = '';

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

// Get CSRF token helper
async function getCSRFToken(): Promise<string> {
  try {
    // If we already have a token, reuse it
    if (globalCSRFToken) {
      client.defaults.headers.common['X-CSRF-Token'] = globalCSRFToken;
      client.defaults.headers.common['X-Session-ID'] = globalSessionId;
      return globalCSRFToken;
    }

    const res = await client.get('/api/status');
    const csrfToken = res.headers['x-csrf-token'];
    const sessionId = res.headers['x-session-id'];

    if (csrfToken && sessionId) {
      globalCSRFToken = csrfToken;
      globalSessionId = sessionId;
      client.defaults.headers.common['X-CSRF-Token'] = csrfToken;
      client.defaults.headers.common['X-Session-ID'] = sessionId;
      return csrfToken;
    }
    throw new Error('No CSRF token in response');
  } catch (error: any) {
    throw new Error(`Failed to get CSRF token: ${error.message}`);
  }
}

// Test Data
const testEmail = `test_${Date.now()}@example.com`;
const testTherapistEmail = `therapist_${Date.now()}@example.com`;

async function testUserProfiles() {
  log('\n--- Testing User Profiles ---', 'cyan');

  try {
    // Get CSRF token first
    await getCSRFToken();

    // 1. Create user via API
    const createRes = await client.post('/api/auth/register', {
      email: testEmail,
      password: 'Test@1234',
      name: 'Test User',
      role: 'PATIENT',
    });

    if (createRes.status !== 201) {
      throw new Error(
        `Failed to create user: ${createRes.status} - ${JSON.stringify(createRes.data)}`
      );
    }

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

    return userId;
  } catch (error: any) {
    fail('User Profile Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testTherapistData() {
  log('\n--- Testing Therapist Data ---', 'cyan');

  try {
    // Get CSRF token
    await getCSRFToken();

    // 1. Create therapist user via API
    const createRes = await client.post('/api/auth/register', {
      email: testTherapistEmail,
      password: 'Test@1234',
      name: 'Dr. Test Therapist',
      role: 'THERAPIST',
    });

    if (createRes.status !== 201) {
      throw new Error(
        `Failed to create therapist: ${createRes.status} - ${JSON.stringify(createRes.data)}`
      );
    }

    const userId = createRes.data.user?.id;
    if (!userId) throw new Error('No userId in response');

    // 2. Create therapist profile
    const therapistRes = await client.post('/api/therapists', {
      userId,
      licenseNumber: `LICENSE_${Date.now()}`,
      specialization: ['Depression', 'Anxiety'],
      yearsOfExperience: 5,
      hourlyRate: 500,
    });

    if (therapistRes.status !== 201) {
      throw new Error(
        `Failed to create therapist profile: ${therapistRes.status}`
      );
    }

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
    if (!dbTherapist.licenseNumber.includes('LICENSE_')) {
      throw new Error('License number not persisted correctly');
    }
    pass('Therapist data matches', 'License and specialization verified');

    return { userId, therapistId };
  } catch (error: any) {
    fail('Therapist Data Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testMoodEntries(userId: string) {
  log('\n--- Testing Mood Entries ---', 'cyan');

  try {
    // Get CSRF token
    await getCSRFToken();

    // 1. Create mood entry via API
    const createRes = await client.post('/api/moods', {
      userId,
      moodScore: 7,
      moodCategory: 'Happy',
      symptoms: ['Energy', 'Positivity'],
      triggers: ['Morning walk', 'Coffee'],
      notes: 'Feeling good today',
      location: 'Home',
      weather: 'Sunny',
    });

    if (createRes.status !== 201) {
      throw new Error(
        `Failed to create mood: ${createRes.status} - ${JSON.stringify(createRes.data)}`
      );
    }

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

    return moodId;
  } catch (error: any) {
    fail('Mood Entry Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testCommunityPosts(userId: string) {
  log('\n--- Testing Community Posts ---', 'cyan');

  try {
    // Get CSRF token
    await getCSRFToken();

    // First, ensure a community group exists
    const groupRes = await client.post('/api/community/groups', {
      name: `Group_${Date.now()}`,
      description: 'Test Community Group',
      category: 'General',
    });

    if (groupRes.status !== 201 && groupRes.status !== 200) {
      throw new Error(`Failed to create group: ${groupRes.status}`);
    }

    const groupId = groupRes.data.id;

    // 1. Create post via API
    const createRes = await client.post('/api/community/posts', {
      groupId,
      userId,
      title: 'Test Community Post',
      content: 'This is a test community post',
      category: 'General',
    });

    if (createRes.status !== 201) {
      throw new Error(
        `Failed to create post: ${createRes.status} - ${JSON.stringify(createRes.data)}`
      );
    }

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

    return postId;
  } catch (error: any) {
    fail('Community Post Tests', error.message || JSON.stringify(error));
    throw error;
  }
}

async function testCrisisIncidents(userId: string) {
  log('\n--- Testing Crisis Incidents ---', 'cyan');

  try {
    // Get CSRF token
    await getCSRFToken();

    // 1. Create crisis incident via API
    const createRes = await client.post('/api/crisis', {
      userId,
      level: 'MEDIUM',
      content: 'User experiencing crisis',
    });

    if (createRes.status !== 201) {
      throw new Error(
        `Failed to create crisis: ${createRes.status} - ${JSON.stringify(createRes.data)}`
      );
    }

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

    // Test 3: Mood Entries
    await testMoodEntries(userIds.patient);

    // Test 4: Community Posts
    await testCommunityPosts(userIds.patient);

    // Test 5: Crisis Incidents
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
