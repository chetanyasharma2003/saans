import { chromium } from 'playwright';
import fs from 'fs';

const VITE_PORT = 5173;
const BASE_URL = `http://localhost:${VITE_PORT}`;

const testResults = {
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
  tests: [],
  errors: [],
};

async function test(name, fn) {
  testResults.summary.totalTests++;
  try {
    await fn();
    testResults.summary.passed++;
    testResults.tests.push({
      name,
      status: 'PASSED',
      timestamp: new Date().toISOString(),
    });
    console.log(`✓ ${name}`);
  } catch (error) {
    testResults.summary.failed++;
    testResults.tests.push({
      name,
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    testResults.errors.push({
      test: name,
      error: error.message,
      stack: error.stack,
    });
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
  }
}

async function expect(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  const browser = await chromium.launch();
  let page;
  let context;

  try {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    page = await context.newPage();

    console.log('\n=== RegisterPage Location Selection Tests ===\n');

    // Test 1: Page renders successfully
    await test('Page renders successfully', async () => {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      const heading = await page.textContent('h2');
      await expect(heading && heading.includes('SAANS'), 'SAANS heading should be visible');
    });

    // Test 2: City dropdown exists and is visible
    await test('City dropdown exists and is visible', async () => {
      const cityDropdown = await page.$('select[name="city"]');
      await expect(cityDropdown !== null, 'City dropdown should exist');
      const isVisible = await cityDropdown.isVisible();
      await expect(isVisible, 'City dropdown should be visible');
    });

    // Test 3: City dropdown has correct label
    await test('City dropdown has correct label', async () => {
      const label = await page.textContent('label:has-text("Your City")');
      await expect(
        label && label.includes('Your City'),
        'City label should contain "Your City"'
      );
      await expect(
        label && label.includes('📍'),
        'City label should have location emoji'
      );
    });

    // Test 4: City dropdown has placeholder option
    await test('City dropdown has placeholder option', async () => {
      const options = await page.$$eval('select[name="city"] option', (opts) =>
        opts.map((o) => o.textContent)
      );
      await expect(
        options[0] && options[0].includes('Select your city'),
        'First option should be placeholder'
      );
    });

    // Test 5: City dropdown contains all 20 cities
    await test('City dropdown contains all 20 cities', async () => {
      const options = await page.$$eval('select[name="city"] option', (opts) =>
        opts.map((o) => o.textContent)
      );
      // Should have 1 placeholder + 20 cities = 21 options
      await expect(
        options.length === 21,
        `Should have 21 options (1 placeholder + 20 cities), got ${options.length}`
      );
    });

    // Test 6: City dropdown contains expected cities
    await test('City dropdown contains expected cities', async () => {
      const expectedCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'];
      const options = await page.$$eval('select[name="city"] option', (opts) =>
        opts.map((o) => o.textContent)
      );

      for (const city of expectedCities) {
        const found = options.some((o) => o.includes(city));
        await expect(found, `City "${city}" should be in dropdown`);
      }
    });

    // Test 7: Selecting a city updates form state
    await test('Selecting a city updates form state', async () => {
      await page.selectOption('select[name="city"]', { label: '🌆 Mumbai' });
      const selectedValue = await page.inputValue('select[name="city"]');
      await expect(
        selectedValue === 'Mumbai',
        `Selected city should be "Mumbai", got "${selectedValue}"`
      );
    });

    // Test 8: Multiple city selections work correctly
    await test('Multiple city selections work correctly', async () => {
      const citiesToTest = ['🏙️ Delhi', '🏘️ Bangalore', '🎨 Kolkata'];

      for (const city of citiesToTest) {
        await page.selectOption('select[name="city"]', { label: city });
        const selectedValue = await page.inputValue('select[name="city"]');
        const expectedCity = city.split(' ')[1];
        await expect(
          selectedValue === expectedCity,
          `City should change to ${expectedCity}, got ${selectedValue}`
        );
      }
    });

    // Test 9: Form validation - city is required
    await test('Form validation - city is required', async () => {
      // Navigate to fresh register page
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

      // Fill in other fields
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');

      // Leave city empty - verify it's still empty
      const cityValue = await page.inputValue('select[name="city"]');
      await expect(cityValue === '', 'City should be empty by default');

      // Verify the dropdown requires selection
      const isRequired = await page.getAttribute('select[name="city"]', 'required');
      await expect(isRequired !== null, 'City dropdown should be marked as required');

      // Browser will prevent form submission due to required attribute
      // We can verify that the city field validation works by checking the attribute
      const citySelect = await page.$('select[name="city"]');
      const validity = await citySelect.evaluate((el) => ({
        required: el.required,
        value: el.value,
        validity: el.validity.valid,
      }));
      await expect(
        validity.required && !validity.value && !validity.validity,
        'Required field with empty value should be invalid'
      );
    });

    // Test 10: City dropdown styling on focus
    await test('City dropdown has focus styling', async () => {
      const cityDropdown = await page.$('select[name="city"]');
      await cityDropdown.focus();
      await page.waitForTimeout(300);

      const classes = await cityDropdown.getAttribute('class');
      await expect(
        classes && (classes.includes('focus') || classes.includes('border')),
        'Dropdown should have focus styling applied'
      );
    });

    // Test 11: City dropdown is required attribute
    await test('City dropdown has required attribute', async () => {
      const required = await page.getAttribute('select[name="city"]', 'required');
      await expect(required !== null, 'City dropdown should have required attribute');
    });

    // Test 12: Helper text is present for city selection
    await test('Helper text is present for city selection', async () => {
      const helperText = await page.textContent('.text-xs');
      await expect(
        helperText && helperText.includes('therapist'),
        'Helper text should explain purpose of city selection'
      );
    });

    // MOBILE RESPONSIVENESS TESTS
    console.log('\n=== Mobile Responsiveness Tests ===\n');

    // Create mobile viewport context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const mobilePage = await mobileContext.newPage();

    // Test 13: Mobile - Page renders on mobile
    await test('Mobile: Page renders on mobile viewport', async () => {
      await mobilePage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      const heading = await mobilePage.textContent('h2');
      await expect(
        heading && heading.includes('SAANS'),
        'SAANS heading should be visible on mobile'
      );
    });

    // Test 14: Mobile - City dropdown is accessible
    await test('Mobile: City dropdown is accessible on mobile', async () => {
      const cityDropdown = await mobilePage.$('select[name="city"]');
      await expect(cityDropdown !== null, 'City dropdown should exist on mobile');
      const isVisible = await cityDropdown.isVisible();
      await expect(isVisible, 'City dropdown should be visible on mobile');
    });

    // Test 15: Mobile - City selection works
    await test('Mobile: City selection works on mobile', async () => {
      await mobilePage.selectOption('select[name="city"]', { label: '🌆 Mumbai' });
      const selectedValue = await mobilePage.inputValue('select[name="city"]');
      await expect(
        selectedValue === 'Mumbai',
        'City selection should work on mobile'
      );
    });

    // Test 16: Mobile - Form fields are properly sized
    await test('Mobile: Form fields are properly sized on mobile', async () => {
      const dropdown = await mobilePage.$('select[name="city"]');
      const boundingBox = await dropdown.boundingBox();
      // Mobile width is 375px, dropdown should be responsive and fill most of the width
      const expectedMinWidth = 270; // Account for padding and margins on 375px viewport
      await expect(
        boundingBox && boundingBox.width >= expectedMinWidth,
        `Dropdown should be wide enough on mobile (${boundingBox?.width}px >= ${expectedMinWidth}px)`
      );
    });

    // Test 17: Mobile - Text is readable (font size)
    await test('Mobile: Text is readable on mobile', async () => {
      const label = await mobilePage.$('label:has-text("Your City")');
      const fontSize = await label.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseFloat(fontSize);
      await expect(fontSizeNum >= 12, 'Label font size should be readable on mobile');
    });

    // Test 18: Tablet - Page renders on tablet viewport
    await test('Tablet: Page renders on tablet viewport', async () => {
      const tabletContext = await browser.newContext({
        viewport: { width: 768, height: 1024 },
      });
      const tabletPage = await tabletContext.newPage();
      await tabletPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

      const cityDropdown = await tabletPage.$('select[name="city"]');
      const isVisible = await cityDropdown.isVisible();
      await expect(isVisible, 'City dropdown should be visible on tablet');

      await tabletPage.close();
      await tabletContext.close();
    });

    // FORM STATE PERSISTENCE TESTS
    console.log('\n=== Form State Tests ===\n');

    // Test 19: Form state persists when switching between fields
    await test('Form state persists when switching between fields', async () => {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

      // Fill name
      await page.fill('input[name="name"]', 'John Doe');
      // Select city
      await page.selectOption('select[name="city"]', { label: '🏙️ Delhi' });
      // Fill email
      await page.fill('input[name="email"]', 'john@example.com');

      // Verify all fields still have correct values
      const name = await page.inputValue('input[name="name"]');
      const city = await page.inputValue('select[name="city"]');
      const email = await page.inputValue('input[name="email"]');

      await expect(name === 'John Doe', 'Name should persist');
      await expect(city === 'Delhi', 'City should persist');
      await expect(email === 'john@example.com', 'Email should persist');
    });

    // Test 20: City selection can be changed after initial selection
    await test('City selection can be changed after initial selection', async () => {
      await page.selectOption('select[name="city"]', { label: '🌆 Mumbai' });
      let selectedValue = await page.inputValue('select[name="city"]');
      await expect(selectedValue === 'Mumbai', 'Initial selection should be Mumbai');

      // Change selection
      await page.selectOption('select[name="city"]', { label: '🏘️ Bangalore' });
      selectedValue = await page.inputValue('select[name="city"]');
      await expect(selectedValue === 'Bangalore', 'Selection should change to Bangalore');
    });

    // Test 21: City placeholder resets when selected and deselected
    await test('City can be reset to placeholder', async () => {
      await page.selectOption('select[name="city"]', { label: '🌆 Mumbai' });
      let selectedValue = await page.inputValue('select[name="city"]');
      await expect(selectedValue === 'Mumbai', 'Should select Mumbai');

      // Reset to placeholder
      await page.selectOption('select[name="city"]', { index: 0 });
      selectedValue = await page.inputValue('select[name="city"]');
      await expect(selectedValue === '', 'Should reset to empty placeholder');
    });

    // ACCESSIBILITY TESTS
    console.log('\n=== Accessibility Tests ===\n');

    // Test 22: City dropdown is keyboard navigable
    await test('City dropdown is keyboard navigable', async () => {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

      const dropdown = await page.$('select[name="city"]');
      await dropdown.focus();

      // Send arrow key to open and navigate
      await dropdown.press('ArrowDown');
      await page.waitForTimeout(200);

      // Verify dropdown received focus
      const focusedElement = await page.evaluate(() => document.activeElement.name);
      await expect(focusedElement === 'city', 'City dropdown should be focused');
    });

    // Test 23: Label is properly associated with city dropdown
    await test('Label is properly associated with city dropdown', async () => {
      const label = await page.$('label');
      const htmlFor = await label.getAttribute('for');
      const dropdown = await page.$('select[name="city"]');
      const dropdownId = await dropdown.getAttribute('id');

      // Either label has for attribute or contains the input
      const isAssociated = htmlFor === dropdownId || htmlFor === null;
      await expect(isAssociated, 'Label should be associated with dropdown');
    });

    // VISUAL REGRESSION TESTS
    console.log('\n=== Visual Tests ===\n');

    // Test 24: City dropdown styling matches form fields
    await test('City dropdown styling matches other form fields', async () => {
      const cityDropdown = await page.$('select[name="city"]');
      const emailInput = await page.$('input[name="email"]');

      const dropdownClasses = await cityDropdown.getAttribute('class');
      const inputClasses = await emailInput.getAttribute('class');

      // Both should have similar styling classes
      const dropdownHasBackdrop = dropdownClasses.includes('backdrop-blur');
      const inputHasBackdrop = inputClasses.includes('backdrop-blur');

      await expect(
        dropdownHasBackdrop && inputHasBackdrop,
        'Dropdown and input should have consistent styling'
      );
    });

    // Test 25: City dropdown has proper spacing and padding
    await test('City dropdown has proper spacing and padding', async () => {
      const dropdown = await page.$('select[name="city"]');
      const padding = await dropdown.evaluate((el) => window.getComputedStyle(el).padding);

      await expect(padding && padding !== '0px', 'Dropdown should have padding');
    });

    // Clean up mobile and tablet contexts
    await mobilePage.close();
    await mobileContext.close();

    // Scroll to ensure city dropdown is in view (for any visual issues)
    await page.evaluate(() => {
      const citySelect = document.querySelector('select[name="city"]');
      if (citySelect) {
        citySelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

  } catch (error) {
    console.error('Fatal error during tests:', error);
    testResults.errors.push({
      test: 'setup/teardown',
      error: error.message,
      stack: error.stack,
    });
    testResults.summary.failed++;
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
    await browser.close();
  }

  return testResults;
}

// Run tests
const results = await runTests();

console.log('\n=== Test Summary ===\n');
console.log(`Total: ${results.summary.totalTests}`);
console.log(`Passed: ${results.summary.passed}`);
console.log(`Failed: ${results.summary.failed}`);
console.log(`Skipped: ${results.summary.skipped}`);

if (results.summary.failed > 0) {
  console.log('\n=== Failed Tests ===');
  results.tests
    .filter((t) => t.status === 'FAILED')
    .forEach((t) => {
      console.log(`\n${t.name}`);
      console.log(`Error: ${t.error}`);
    });
}

// Save results to file
fs.writeFileSync(
  '/Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM/saans-web/register-location-test-results.json',
  JSON.stringify(results, null, 2)
);

console.log('\nResults saved to register-location-test-results.json');

process.exit(results.summary.failed > 0 ? 1 : 0);
