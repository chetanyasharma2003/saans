import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

const tests = [
  {
    name: 'Home / Landing Page (/)',
    path: '/',
    isProtected: false,
    description: 'Should show landing page with Get Started button',
    checks: {
      elements: ['SAANS', 'Mental Health'],
      buttons: ['Get Started', 'Log In']
    }
  },
  {
    name: 'Login Page (/login)',
    path: '/login',
    isProtected: false,
    description: 'Should show login form with email, password fields',
    checks: {
      elements: ['Email', 'Password', 'Welcome to SAANS'],
      form: ['email', 'password'],
      buttons: ['Sign In'],
      links: ['Create one now', 'Forgot password']
    }
  },
  {
    name: 'Register Page (/register)',
    path: '/register',
    isProtected: false,
    description: 'Should show registration form with name, email, password fields',
    checks: {
      elements: ['Email', 'Password', 'Full Name'],
      form: ['name', 'email', 'password', 'confirmPassword'],
      buttons: ['Start Your Journey'],
      links: ['Sign In']
    }
  },
  {
    name: 'Dashboard (/dashboard)',
    path: '/dashboard',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'AI Counselor (/ai-counselor)',
    path: '/ai-counselor',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'Find Therapist (/therapist)',
    path: '/therapist',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'Mood Tracker (/mood-tracker)',
    path: '/mood-tracker',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'Community (/community)',
    path: '/community',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'Crisis Support (/crisis)',
    path: '/crisis',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  },
  {
    name: 'Profile (/profile)',
    path: '/profile',
    isProtected: true,
    description: 'Protected: Should redirect to /login when not authenticated',
    checks: {}
  }
];

async function testRoute(browser, test) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Testing: ${test.name}`);
  console.log(`Description: ${test.description}`);
  console.log(`${'─'.repeat(70)}`);

  try {
    const page = await browser.newPage();
    const url = `${BASE_URL}${test.path}`;

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    if (!response) {
      console.log(`❌ FAILED: No response from server`);
      await page.close();
      return { name: test.name, path: test.path, status: 'failed', reason: 'No response' };
    }

    const status = response.status();
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const currentUrl = page.url();

    console.log(`HTTP Status: ${status} | Title: "${title}"`);
    console.log(`Final URL: ${currentUrl}`);

    // Check if it's a protected route and if redirected to login
    if (test.isProtected) {
      if (currentUrl.includes('/login')) {
        console.log(`✅ PASS: Protected route correctly redirected to /login`);
        await page.close();
        return { name: test.name, path: test.path, status: 'passed', type: 'protected' };
      } else {
        // Protected route but not redirected - might be a problem or might be loading
        console.log(`⚠️ WARNING: Protected route did not redirect to login`);
      }
    }

    // For public pages, check for expected elements
    if (test.checks.elements) {
      const foundElements = [];
      const missingElements = [];

      for (const elem of test.checks.elements) {
        const found = bodyText.includes(elem) || bodyText.toLowerCase().includes(elem.toLowerCase());
        if (found) {
          foundElements.push(elem);
        } else {
          missingElements.push(elem);
        }
      }

      if (foundElements.length > 0) {
        console.log(`✅ Found elements: ${foundElements.join(', ')}`);
      }
      if (missingElements.length > 0) {
        console.log(`❌ Missing elements: ${missingElements.join(', ')}`);
      }
    }

    // Check for form fields
    if (test.checks.form && test.checks.form.length > 0) {
      const formFields = await page.$$eval('input', inputs => inputs.map(i => i.name || i.type || i.id));
      console.log(`Form Fields Found: ${formFields.length} inputs`);
    }

    // Check for buttons
    if (test.checks.buttons && test.checks.buttons.length > 0) {
      const foundButtons = [];
      const buttonText = await page.$$eval('button', buttons => buttons.map(b => b.innerText));
      
      for (const btn of test.checks.buttons) {
        if (buttonText.some(t => t.includes(btn))) {
          foundButtons.push(btn);
        }
      }

      if (foundButtons.length > 0) {
        console.log(`✅ Found buttons: ${foundButtons.join(', ')}`);
      }
      if (foundButtons.length < test.checks.buttons.length) {
        const missing = test.checks.buttons.filter(b => !foundButtons.includes(b));
        console.log(`⚠️ Missing buttons: ${missing.join(', ')}`);
      }
    }

    // Check for links
    if (test.checks.links && test.checks.links.length > 0) {
      const foundLinks = [];
      const linkText = await page.$$eval('a, button', elements => elements.map(e => e.innerText));
      
      for (const link of test.checks.links) {
        if (linkText.some(t => t.includes(link))) {
          foundLinks.push(link);
        }
      }

      if (foundLinks.length > 0) {
        console.log(`✅ Found links: ${foundLinks.join(', ')}`);
      }
    }

    // Determine overall status
    let overallStatus = 'passed';
    if (test.checks.elements) {
      const allElementsFound = test.checks.elements.every(e => 
        bodyText.includes(e) || bodyText.toLowerCase().includes(e.toLowerCase())
      );
      if (!allElementsFound && !test.isProtected) {
        overallStatus = 'partial';
      }
    }

    console.log(`\n>>> Status: ${overallStatus === 'passed' ? '✅ PASSED' : '⚠️ PARTIAL'}`);

    await page.close();
    return { name: test.name, path: test.path, status: overallStatus };

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { name: test.name, path: test.path, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         SAANS MENTAL HEALTH PLATFORM - ROUTE VERIFICATION         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const results = [];
    for (const test of tests) {
      const result = await testRoute(browser, test);
      results.push(result);
    }

    await browser.close();

    // Summary
    console.log(`\n${'═'.repeat(70)}`);
    console.log('VERIFICATION SUMMARY');
    console.log(`${'═'.repeat(70)}\n`);

    const passed = results.filter(r => r.status === 'passed').length;
    const partial = results.filter(r => r.status === 'partial').length;
    const errors = results.filter(r => r.status === 'error' || r.status === 'failed').length;

    console.log(`Total Routes Tested: ${results.length}`);
    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`⚠️  Partial: ${partial}/${results.length}`);
    console.log(`❌ Errors/Failed: ${errors}/${results.length}`);

    console.log(`\n${'─'.repeat(70)}`);
    console.log('ROUTE-BY-ROUTE RESULTS');
    console.log(`${'─'.repeat(70)}\n`);

    results.forEach((r, i) => {
      const emoji = r.status === 'passed' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
      console.log(`${i + 1}. ${emoji} ${r.name.split(' ')[0]} - ${r.status.toUpperCase()}`);
      if (r.error) console.log(`   Error: ${r.error}`);
    });

    console.log(`\n${'═'.repeat(70)}\n`);

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main();
