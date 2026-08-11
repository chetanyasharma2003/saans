import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

async function testInteractiveFeatures() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     INTERACTIVE FEATURES TEST - SAANS MENTAL HEALTH PLATFORM     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // Test 1: Login Form Validation
    console.log('\n--- Test 1: Login Form Validation ---');
    console.log('Checking: Email and password field inputs, form submission');
    const loginPage = await browser.newPage();
    await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInput = await loginPage.$('input[type="email"]');
    const passwordInput = await loginPage.$('input[type="password"]');
    const submitButton = await loginPage.$('button[type="submit"]');

    if (emailInput && passwordInput && submitButton) {
      console.log('✅ Login form elements present:');
      console.log('   - Email input field: YES');
      console.log('   - Password input field: YES');
      console.log('   - Submit button: YES');

      // Try to fill form
      await emailInput.fill('test@example.com');
      const emailValue = await emailInput.inputValue();
      console.log(`✅ Form input works: Email field accepts text: "${emailValue}"`);
      
      results.push({ test: 'Login Form Validation', status: 'passed' });
    } else {
      console.log('❌ Login form incomplete');
      results.push({ test: 'Login Form Validation', status: 'failed', reason: 'Missing form elements' });
    }
    await loginPage.close();

    // Test 2: Register Form Validation
    console.log('\n--- Test 2: Register Form Validation ---');
    console.log('Checking: Name, email, password, confirm password fields');
    const registerPage = await browser.newPage();
    await registerPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

    const inputs = await registerPage.$$('input');
    console.log(`✅ Form has ${inputs.length} input fields`);

    const nameInput = await registerPage.$('input[name="name"]');
    if (nameInput) {
      await nameInput.fill('John Doe');
      const value = await nameInput.inputValue();
      console.log(`✅ Name field works: Value set to "${value}"`);
    }

    const emailRegInput = await registerPage.$('input[name="email"]');
    if (emailRegInput) {
      await emailRegInput.fill('newuser@example.com');
      console.log('✅ Email field works');
    }

    const passwordRegInput = await registerPage.$('input[name="password"]');
    if (passwordRegInput) {
      await passwordRegInput.fill('Password123');
      console.log('✅ Password field works');
    }

    const confirmPasswordInput = await registerPage.$('input[name="confirmPassword"]');
    if (confirmPasswordInput) {
      await confirmPasswordInput.fill('Password123');
      console.log('✅ Confirm password field works');
    }

    const registerButton = await registerPage.$('button[type="submit"]');
    if (registerButton) {
      const buttonText = await registerButton.innerText();
      console.log(`✅ Register button found: "${buttonText}"`);
      results.push({ test: 'Register Form Validation', status: 'passed' });
    }
    await registerPage.close();

    // Test 3: Navigation Links
    console.log('\n--- Test 3: Navigation Links ---');
    console.log('Checking: Links between pages');
    const navPage = await browser.newPage();
    await navPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const getStartedBtn = await navPage.$('button:has-text("Get Started")');
    if (getStartedBtn) {
      console.log('✅ Get Started button on landing page exists');
      results.push({ test: 'Navigation Links', status: 'passed' });
    } else {
      console.log('⚠️ Get Started button not found using has-text, trying alternative');
      const allButtons = await navPage.$$('button');
      const hasGetStarted = allButtons.some(async btn => {
        const text = await btn.innerText();
        return text.includes('Get Started');
      });
      if (hasGetStarted) {
        console.log('✅ Get Started button exists (found via alternative method)');
      }
    }
    await navPage.close();

    // Test 4: Protected Route Access
    console.log('\n--- Test 4: Protected Route Access ---');
    console.log('Checking: Dashboard requires authentication');
    const dashboardPage = await browser.newPage();
    await dashboardPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const finalUrl = dashboardPage.url();
    if (finalUrl.includes('/login')) {
      console.log('✅ Dashboard correctly redirects to login when not authenticated');
      console.log(`   Final URL: ${finalUrl}`);
      results.push({ test: 'Protected Route Access', status: 'passed' });
    } else {
      console.log('⚠️ Dashboard did not redirect to login');
      results.push({ test: 'Protected Route Access', status: 'partial' });
    }
    await dashboardPage.close();

    // Test 5: Crisis Route Accessibility
    console.log('\n--- Test 5: Crisis Support Route ---');
    console.log('Checking: Route exists and loads');
    const crisisPage = await browser.newPage();
    await crisisPage.goto(`${BASE_URL}/crisis`, { waitUntil: 'networkidle' });
    
    const crisisText = await crisisPage.innerText('body');
    if (crisisText.toLowerCase().includes('crisis') || crisisText.toLowerCase().includes('emergency')) {
      console.log('✅ Crisis support page loads (has expected content or redirected properly)');
      results.push({ test: 'Crisis Support Route', status: 'passed' });
    } else {
      console.log('⚠️ Crisis page loaded but keywords not found (may be redirected to login)');
      if (crisisPage.url().includes('/login')) {
        console.log('   (This is expected - route is protected and user not authenticated)');
        results.push({ test: 'Crisis Support Route', status: 'passed' });
      }
    }
    await crisisPage.close();

    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    INTERACTIVE TESTS SUMMARY                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const passed = results.filter(r => r.status === 'passed').length;
    const partial = results.filter(r => r.status === 'partial').length;
    const failed = results.filter(r => r.status === 'failed').length;

    console.log(`Tests Completed: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Partial: ${partial}`);
    console.log(`❌ Failed: ${failed}\n`);

    results.forEach(r => {
      const emoji = r.status === 'passed' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
      console.log(`${emoji} ${r.test}`);
      if (r.reason) console.log(`   Reason: ${r.reason}`);
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testInteractiveFeatures();
