const BASE_URL = 'http://localhost:5174';

const tests = [
  {
    name: 'Home / Landing Page',
    path: '/',
    checks: ['SAANS', 'Mental Health'],
  },
  {
    name: 'Login Page',
    path: '/login',
    checks: ['Email', 'Password', 'Log in'],
  },
  {
    name: 'Register Page',
    path: '/register',
    checks: ['Email', 'Password', 'Sign up'],
  },
  {
    name: 'Dashboard (Protected)',
    path: '/dashboard',
    checks: ['Dashboard'],
  },
  {
    name: 'AI Counselor',
    path: '/ai-counselor',
    checks: ['Counselor', 'Chat'],
  },
  {
    name: 'Find Therapist',
    path: '/therapist',
    checks: ['Therapist'],
  },
  {
    name: 'Mood Tracker',
    path: '/mood-tracker',
    checks: ['Mood'],
  },
  {
    name: 'Community',
    path: '/community',
    checks: ['Community'],
  },
  {
    name: 'Crisis Support',
    path: '/crisis',
    checks: ['Crisis'],
  },
  {
    name: 'Profile',
    path: '/profile',
    checks: ['Profile'],
  }
];

async function testRoute(test) {
  console.log(`Testing: ${test.name} (${test.path})`);

  try {
    const url = `${BASE_URL}${test.path}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`  ❌ FAILED: HTTP ${response.status}`);
      return {
        name: test.name,
        path: test.path,
        status: 'FAILED',
        reason: `HTTP ${response.status}`
      };
    }

    const html = await response.text();
    let allChecksPass = true;
    const missingChecks = [];

    for (const check of test.checks) {
      if (!html.includes(check) && !html.toLowerCase().includes(check.toLowerCase())) {
        allChecksPass = false;
        missingChecks.push(check);
      }
    }

    if (allChecksPass) {
      console.log(`  ✅ PASSED`);
      return {
        name: test.name,
        path: test.path,
        status: 'PASSED',
      };
    } else {
      const foundChecks = test.checks.filter(c =>
        html.includes(c) || html.toLowerCase().includes(c.toLowerCase())
      );
      console.log(`  ⚠️  PARTIAL: Missing ${missingChecks.join(', ')}`);
      return {
        name: test.name,
        path: test.path,
        status: 'PARTIAL',
        missingChecks,
        foundChecks
      };
    }

  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return {
      name: test.name,
      path: test.path,
      status: 'ERROR',
      reason: error.message
    };
  }
}

async function runAllTests() {
  console.log('========== FRONTEND ROUTE VERIFICATION ==========\n');

  const results = [];
  for (const test of tests) {
    const result = await testRoute(test);
    results.push(result);
  }

  // Summary
  console.log('\n\n========== SUMMARY ==========\n');

  const passed = results.filter(r => r.status === 'PASSED').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const failed = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length;

  console.log(`Total Routes: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Partial: ${partial}`);
  console.log(`❌ Failed/Error: ${failed}`);

  console.log('\n--- Detailed Results ---\n');

  results.forEach(result => {
    const statusEmoji = result.status === 'PASSED' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${result.name} (${result.path})`);
    if (result.reason) console.log(`   Error: ${result.reason}`);
    if (result.missingChecks?.length > 0) console.log(`   Missing Elements: ${result.missingChecks.join(', ')}`);
    console.log();
  });
}

runAllTests().catch(console.error);
