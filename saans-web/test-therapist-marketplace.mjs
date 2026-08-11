#!/usr/bin/env node

/**
 * Therapist Marketplace Integration Tests
 * Tests all therapist API endpoints and marketplace functionality
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TIMEOUT = 5000;

const client = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`• ${message}`, 'blue');
}

async function test(name, fn) {
  try {
    info(`Testing: ${name}`);
    await fn();
    success(`Passed: ${name}`);
    return true;
  } catch (err) {
    error(`Failed: ${name}`);
    console.error(`  Error: ${err.message}`);
    if (err.response?.data) {
      console.error(`  Response: ${JSON.stringify(err.response.data, null, 2)}`);
    }
    return false;
  }
}

async function runTests() {
  log('\n=== THERAPIST MARKETPLACE INTEGRATION TESTS ===\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Get all therapists
  if (await test('GET /api/therapists - Get all therapists', async () => {
    const response = await client.get('/api/therapists');
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format');
    }
    if (!response.data.pagination) {
      throw new Error('Missing pagination data');
    }
    console.log(`  Found ${response.data.data.length} therapists`);
    console.log(`  Total: ${response.data.pagination.total}`);
  })) passed++; else failed++;

  // Test 2: Get therapists with filters
  if (await test('GET /api/therapists - With specialty filter', async () => {
    const response = await client.get('/api/therapists?specialty=Anxiety&page=1&limit=5');
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format');
    }
    console.log(`  Found ${response.data.data.length} therapists with Anxiety specialty`);
  })) passed++; else failed++;

  // Test 3: Get therapists with price filter
  if (await test('GET /api/therapists - With price range filter', async () => {
    const response = await client.get('/api/therapists?minPrice=70&maxPrice=85');
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format');
    }
    console.log(`  Found ${response.data.data.length} therapists in price range $70-$85`);
  })) passed++; else failed++;

  // Test 4: Get single therapist
  if (await test('GET /api/therapists/:id - Get single therapist', async () => {
    // First get all therapists to get a valid ID
    const listResponse = await client.get('/api/therapists?limit=1');
    if (!listResponse.data.data || listResponse.data.data.length === 0) {
      throw new Error('No therapists found to test');
    }

    const therapistId = listResponse.data.data[0].id;
    const response = await client.get(`/api/therapists/${therapistId}`);

    if (!response.data.id || !response.data.name) {
      throw new Error('Invalid therapist data');
    }
    console.log(`  Retrieved therapist: ${response.data.name}`);
    console.log(`  Specialization: ${response.data.specialization?.join(', ')}`);
    console.log(`  Experience: ${response.data.yearsOfExperience} years`);
    console.log(`  Rating: ${response.data.averageRating}`);
  })) passed++; else failed++;

  // Test 5: Search therapists
  if (await test('GET /api/therapists/search/:query - Search therapists', async () => {
    const response = await client.get('/api/therapists/search/Anxiety?limit=5');
    if (!response.data.results || !Array.isArray(response.data.results)) {
      throw new Error('Invalid search response');
    }
    console.log(`  Found ${response.data.results.length} therapists matching "Anxiety"`);
  })) passed++; else failed++;

  // Test 6: Get therapist reviews
  if (await test('GET /api/therapists/:id/reviews - Get therapist reviews', async () => {
    // First get a therapist
    const listResponse = await client.get('/api/therapists?limit=1');
    if (!listResponse.data.data || listResponse.data.data.length === 0) {
      throw new Error('No therapists found');
    }

    const therapistId = listResponse.data.data[0].id;
    const response = await client.get(`/api/therapists/reviews/${therapistId}`);

    if (!response.data.reviews || !Array.isArray(response.data.reviews)) {
      throw new Error('Invalid reviews response');
    }
    console.log(`  Found ${response.data.reviews.length} reviews`);
    console.log(`  Average rating: ${response.data.averageRating}`);
    console.log(`  Total reviews: ${response.data.totalReviews}`);
  })) passed++; else failed++;

  // Test 7: Get available slots
  if (await test('GET /api/therapists/:id/availability - Get available slots', async () => {
    // First get a therapist
    const listResponse = await client.get('/api/therapists?limit=1');
    if (!listResponse.data.data || listResponse.data.data.length === 0) {
      throw new Error('No therapists found');
    }

    const therapistId = listResponse.data.data[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await client.get(`/api/therapists/availability/${therapistId}?date=${dateStr}`);

    if (!response.data.slots || !Array.isArray(response.data.slots)) {
      throw new Error('Invalid slots response');
    }
    console.log(`  Date: ${response.data.date}`);
    console.log(`  Available slots: ${response.data.availableCount}`);
    console.log(`  Total slots: ${response.data.totalSlots}`);
  })) passed++; else failed++;

  // Test 8: Get therapist stats
  if (await test('GET /api/therapists/:id/stats - Get therapist statistics', async () => {
    // First get a therapist
    const listResponse = await client.get('/api/therapists?limit=1');
    if (!listResponse.data.data || listResponse.data.data.length === 0) {
      throw new Error('No therapists found');
    }

    const therapistId = listResponse.data.data[0].id;
    const response = await client.get(`/api/therapists/stats/${therapistId}`);

    if (!response.data.ratings || !response.data.bookings) {
      throw new Error('Invalid stats response');
    }
    console.log(`  Average Rating: ${response.data.ratings.average}`);
    console.log(`  Total Reviews: ${response.data.ratings.total}`);
    console.log(`  Total Bookings: ${response.data.bookings.total}`);
    console.log(`  Completion Rate: ${response.data.bookings.completionRate}%`);
  })) passed++; else failed++;

  // Test 9: Pagination test
  if (await test('GET /api/therapists - Pagination', async () => {
    const page1 = await client.get('/api/therapists?page=1&limit=3');
    const page2 = await client.get('/api/therapists?page=2&limit=3');

    if (page1.data.pagination.page !== 1) {
      throw new Error('Page 1 incorrect');
    }
    if (page2.data.pagination.page !== 2) {
      throw new Error('Page 2 incorrect');
    }
    if (page1.data.data[0].id === page2.data.data[0].id) {
      throw new Error('Same therapists on different pages');
    }
    console.log(`  Page 1: ${page1.data.data.length} therapists`);
    console.log(`  Page 2: ${page2.data.data.length} therapists`);
  })) passed++; else failed++;

  // Test 10: Validation test - invalid ID
  if (await test('GET /api/therapists/:id - Invalid ID error handling', async () => {
    try {
      await client.get('/api/therapists/invalid-id-12345');
      throw new Error('Should have thrown an error');
    } catch (err) {
      if (err.response?.status === 404) {
        console.log(`  Correctly returned 404 for invalid ID`);
      } else if (err.response?.status === 400) {
        console.log(`  Correctly returned 400 for invalid ID`);
      } else {
        throw err;
      }
    }
  })) passed++; else failed++;

  // Test 11: Performance test
  if (await test('Performance - Response time', async () => {
    const start = Date.now();
    await client.get('/api/therapists?limit=10');
    const duration = Date.now() - start;

    console.log(`  Response time: ${duration}ms`);
    if (duration > 2000) {
      error(`  WARNING: Response time is high (${duration}ms)`);
    }
  })) passed++; else failed++;

  // Test 12: Data consistency
  if (await test('Data Consistency - Same therapist on multiple requests', async () => {
    const list1 = await client.get('/api/therapists?limit=1');
    const therapistId = list1.data.data[0].id;

    const detail1 = await client.get(`/api/therapists/${therapistId}`);
    const detail2 = await client.get(`/api/therapists/${therapistId}`);

    if (detail1.data.name !== detail2.data.name) {
      throw new Error('Inconsistent therapist data');
    }
    if (detail1.data.averageRating !== detail2.data.averageRating) {
      throw new Error('Inconsistent rating data');
    }
    console.log(`  Therapist data is consistent across requests`);
  })) passed++; else failed++;

  // Summary
  log('\n=== TEST SUMMARY ===\n', 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Total: ${passed + failed}`, 'blue');

  if (failed === 0) {
    log('\n✓ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some tests failed', 'red');
    process.exit(1);
  }
}

// Check if API is running
async function checkApiHealth() {
  try {
    info('Checking API health...');
    await client.get('/api/status');
    success('API is running');
    return true;
  } catch (err) {
    error(`API is not running at ${API_URL}`);
    console.error(`  Make sure the API server is running: npm run dev`);
    return false;
  }
}

// Main execution
(async () => {
  const isHealthy = await checkApiHealth();
  if (isHealthy) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
