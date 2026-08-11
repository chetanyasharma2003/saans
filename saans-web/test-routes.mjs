import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

const tests = [
  {
    name: 'Home / Landing Page',
    path: '/',
    checks: ['SAANS', 'Mental Health', 'Get Started'],
  },
  {
    name: 'Login Page',
    path: '/login',
    checks: ['Email', 'Password', 'Log in', 'Sign up'],
  },
  {
    name: 'Register Page',
    path: '/register',
    checks: ['Email', 'Password', 'Sign up'],
  },
  {
    name: 'Dashboard (Protected)',
    path: '/dashboard',
    checks: ['Dashboard', 'Welcome'],
  },
  {
    name: 'AI Counselor',
    path: '/ai-counselor',
    checks: ['Counselor', 'Chat', 'Message'],
  },
  {
    name: 'Find Therapist',
    path: '/therapist',
    checks: ['Therapist', 'Search'],
  },
  {
    name: 'Mood Tracker',
    path: '/mood-tracker',
    checks: ['Mood', 'Track'],
  },
  {
    name: 'Community',
    path: '/community',
    checks: ['Community', 'Post'],
  },
  {
    name: 'Crisis Support',
    path: '/crisis',
    checks: ['Crisis', 'Emergency', 'Support'],
  },
  {
    name: 'Profile',
    path: '/profile',
    checks: ['Profile', 'Settings'],
  }
];

async function runTests() {
  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  const results = [];

  for (const test of tests) {
    console.log(`\nTesting: ${test.name} (${test.path})`);

    try {
      const url = `${BASE_URL}${test.path}`;

      // Navigate to the page
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

      if (!response) {
        results.push({
          name: test.name,
          path: test.path,
          status: 'FAILED',
          reason: 'No response from server'
        });
        console.log(`  ❌ FAILED: No response from server`);
        continue;
      }

      const status = response.status();
      if (status >= 400) {
        results.push({
          name: test.name,
          path: test.path,
          status: 'FAILED',
          reason: `HTTP ${status}`
        });
        console.log(`  ❌ FAILED: HTTP ${status}`);
        continue;
      }

      const pageTitle = await page.title();
      const pageText = await page.innerText('body').catch(() => '');

      let allChecksPass = true;
      const missingChecks = [];

      for (const check of test.checks) {
        const found = pageText.includes(check) || pageText.toLowerCase().includes(check.toLowerCase());
        if (!found) {
          allChecksPass = false;
          missingChecks.push(check);
        }
      }

      if (allChecksPass) {
        results.push({
          name: test.name,
          path: test.path,
          status: 'PASSED',
          title: pageTitle,
        });
        console.log(`  ✅ PASSED`);
        console.log(`     Title: "${pageTitle}"`);
      } else {
        const foundChecks = test.checks.filter(c =>
          pageText.includes(c) || pageText.toLowerCase().includes(c.toLowerCase())
        );
        results.push({
          name: test.name,
          path: test.path,
          status: 'PARTIAL',
          title: pageTitle,
          foundChecks: foundChecks,
          missingChecks: missingChecks
        });
        console.log(`  ⚠️  PARTIAL`);
        console.log(`     Found: ${foundChecks.join(', ')}`);
        console.log(`     Missing: ${missingChecks.join(', ')}`);
      }

    } catch (error) {
      results.push({
        name: test.name,
        path: test.path,
        status: 'ERROR',
        reason: error.message
      });
      console.log(`  ❌ ERROR: ${error.message}`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n\n========== ROUTE VERIFICATION SUMMARY ==========\n');

  const passed = results.filter(r => r.status === 'PASSED').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const failed = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length;

  console.log(`Total Routes: ${results.length}`);
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`⚠️  Partial: ${partial}/${results.length}`);
  console.log(`❌ Failed/Error: ${failed}/${results.length}`);

  console.log('\n--- Detailed Results ---\n');

  results.forEach(result => {
    const statusEmoji = result.status === 'PASSED' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${result.name} (${result.path})`);
    if (result.title) console.log(`   Title: "${result.title}"`);
    if (result.reason) console.log(`   Error: ${result.reason}`);
    if (result.missingChecks?.length > 0) console.log(`   Missing: ${result.missingChecks.join(', ')}`);
    console.log();
  });

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
