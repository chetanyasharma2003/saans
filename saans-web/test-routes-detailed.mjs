import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

const routes = [
  { name: 'Home / Landing Page', path: '/', isProtected: false, expectedText: ['SAANS', 'Mental Health'] },
  { name: 'Login Page', path: '/login', isProtected: false, expectedText: ['Email', 'Password', 'Log in'] },
  { name: 'Register Page', path: '/register', isProtected: false, expectedText: ['Email', 'Password', 'Sign up'] },
  { name: 'Dashboard', path: '/dashboard', isProtected: true, expectedText: ['Dashboard'] },
  { name: 'AI Counselor', path: '/ai-counselor', isProtected: true, expectedText: ['Counselor', 'Chat'] },
  { name: 'Find Therapist', path: '/therapist', isProtected: true, expectedText: ['Therapist'] },
  { name: 'Mood Tracker', path: '/mood-tracker', isProtected: true, expectedText: ['Mood'] },
  { name: 'Community', path: '/community', isProtected: true, expectedText: ['Community'] },
  { name: 'Crisis Support', path: '/crisis', isProtected: true, expectedText: ['Crisis'] },
  { name: 'Profile', path: '/profile', isProtected: true, expectedText: ['Profile'] }
];

async function testRoute(browser, route) {
  console.log(`\nTesting: ${route.name} (${route.path})`);

  try {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route.path}`;

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    if (!response) {
      console.log(`  ❌ Failed: No response`);
      await page.close();
      return { name: route.name, path: route.path, status: 'failed', reason: 'No response' };
    }

    const status = response.status();
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const currentUrl = page.url();

    console.log(`  HTTP: ${status} | Title: "${title}"`);
    console.log(`  URL: ${currentUrl}`);

    // Check if redirected to login
    const isLoginPage = currentUrl.includes('/login');

    if (route.isProtected && isLoginPage) {
      console.log(`  🔒 Protected route (correctly redirected to login)`);
      await page.close();
      return { name: route.name, path: route.path, status: 'redirected', finalUrl: currentUrl, hasLoginForm: bodyText.toLowerCase().includes('email') };
    }

    // Check for expected text elements
    const foundElements = [];
    const missingElements = [];

    for (const text of route.expectedText) {
      if (bodyText.includes(text) || bodyText.toLowerCase().includes(text.toLowerCase())) {
        foundElements.push(text);
      } else {
        missingElements.push(text);
      }
    }

    const allFound = missingElements.length === 0;
    let statusStr = allFound ? 'loaded' : 'partial';

    if (allFound) {
      console.log(`  ✅ Page loaded correctly`);
      console.log(`     Found: ${foundElements.join(', ')}`);
    } else {
      console.log(`  ⚠️  Page loaded but missing components`);
      console.log(`     Found: ${foundElements.join(', ')}`);
      console.log(`     Missing: ${missingElements.join(', ')}`);
      statusStr = 'missing-components';
    }

    await page.close();
    return {
      name: route.name,
      path: route.path,
      status: statusStr,
      finalUrl: currentUrl,
      foundElements,
      missingElements
    };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { name: route.name, path: route.path, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('========== FRONTEND ROUTE VERIFICATION ==========\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log(`Browser launched\n`);

    const results = [];
    for (const route of routes) {
      const result = await testRoute(browser, route);
      results.push(result);
    }

    await browser.close();

    console.log('\n========== SUMMARY ==========\n');

    const loaded = results.filter(r => r.status === 'loaded').length;
    const partial = results.filter(r => r.status === 'missing-components').length;
    const redirected = results.filter(r => r.status === 'redirected').length;
    const errors = results.filter(r => r.status === 'error' || r.status === 'failed').length;

    console.log(`Total Routes: ${results.length}`);
    console.log(`✅ Fully Loaded: ${loaded}/${results.length}`);
    console.log(`⚠️  Missing Components: ${partial}/${results.length}`);
    console.log(`🔒 Redirected to Login: ${redirected}/${results.length}`);
    console.log(`❌ Errors: ${errors}/${results.length}`);

    console.log('\n========== DETAILED RESULTS ==========\n');

    results.forEach(r => {
      const emoji = r.status === 'loaded' ? '✅' : r.status === 'redirected' ? '🔒' : r.status === 'missing-components' ? '⚠️' : '❌';
      console.log(`${emoji} ${r.name}`);
      console.log(`   Path: ${r.path}`);
      console.log(`   Status: ${r.status}`);

      if (r.finalUrl) console.log(`   Final URL: ${r.finalUrl}`);
      if (r.missingElements?.length > 0) {
        console.log(`   Missing: ${r.missingElements.join(', ')}`);
      }
      if (r.error) console.log(`   Error: ${r.error}`);
      console.log();
    });

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main();
