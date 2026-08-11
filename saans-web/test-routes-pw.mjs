import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

const routes = [
  { name: 'Home / Landing Page', path: '/', isProtected: false },
  { name: 'Login Page', path: '/login', isProtected: false },
  { name: 'Register Page', path: '/register', isProtected: false },
  { name: 'Dashboard', path: '/dashboard', isProtected: true },
  { name: 'AI Counselor', path: '/ai-counselor', isProtected: true },
  { name: 'Find Therapist', path: '/therapist', isProtected: true },
  { name: 'Mood Tracker', path: '/mood-tracker', isProtected: true },
  { name: 'Community', path: '/community', isProtected: true },
  { name: 'Crisis Support', path: '/crisis', isProtected: true },
  { name: 'Profile', path: '/profile', isProtected: true }
];

async function testRoute(browser, route) {
  console.log(`\nTesting: ${route.name} (${route.path})`);

  try {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route.path}`;

    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    if (!response) {
      console.log(`  ❌ Failed: No response`);
      await page.close();
      return { name: route.name, path: route.path, status: 'failed', reason: 'No response' };
    }

    const status = response.status();
    console.log(`  HTTP Status: ${status}`);

    // Check page title and visible text
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log(`  Page Title: "${title}"`);
    console.log(`  Visible Text: ${bodyText.length} chars`);

    // Simple check - if protected route, check if we get redirected to login
    if (route.isProtected && bodyText.toLowerCase().includes('email') && bodyText.toLowerCase().includes('password')) {
      console.log(`  🔒 Protected route (redirected to login)`);
      const finalUrl = page.url();
      await page.close();
      return { name: route.name, path: route.path, status: 'redirected', redirectUrl: finalUrl };
    }

    console.log(`  ✅ Route accessible`);
    const finalUrl = page.url();
    await page.close();
    return { name: route.name, path: route.path, status: 'ok', url: finalUrl };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { name: route.name, path: route.path, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('========== ROUTE VERIFICATION TEST ==========');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log(`✅ Browser launched\n`);

    const results = [];
    for (const route of routes) {
      const result = await testRoute(browser, route);
      results.push(result);
    }

    await browser.close();

    console.log('\n\n========== SUMMARY ==========\n');
    const ok = results.filter(r => r.status === 'ok').length;
    const redirected = results.filter(r => r.status === 'redirected').length;
    const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;

    console.log(`Total Routes: ${results.length}`);
    console.log(`✅ Accessible: ${ok}`);
    console.log(`🔒 Redirected to login: ${redirected}`);
    console.log(`❌ Failed/Error: ${failed}`);

    console.log('\n--- Results ---\n');
    results.forEach(r => {
      const emoji = r.status === 'ok' ? '✅' : r.status === 'redirected' ? '🔒' : '❌';
      console.log(`${emoji} ${r.name} (${r.path})`);
      if (r.redirectUrl) console.log(`   Redirected to: ${r.redirectUrl}`);
      if (r.url) console.log(`   URL: ${r.url}`);
      if (r.reason) console.log(`   Reason: ${r.reason}`);
      if (r.error) console.log(`   Error: ${r.error}`);
    });

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main();
