import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to therapist page...');
  await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'domcontentloaded' });

  console.log('Page loaded, waiting for network to settle...');
  await page.waitForTimeout(2000);

  // Check if search input exists
  console.log('\n=== SEARCHING FOR ELEMENTS ===\n');

  const searchInputs = await page.locator('input[type="text"]').count();
  console.log(`Found ${searchInputs} text inputs`);

  const searchByPlaceholder = await page.locator('input[placeholder*="Search"]').count();
  console.log(`Found ${searchByPlaceholder} inputs with "Search" placeholder`);

  const testIdInputs = await page.locator('[data-testid="therapist-search-input"]').count();
  console.log(`Found ${testIdInputs} inputs with data-testid="therapist-search-input"`);

  // Get all input attributes
  const inputs = await page.locator('input[type="text"]').all();
  console.log(`\nDetailed input info:`);
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const placeholder = await input.getAttribute('placeholder');
    const testId = await input.getAttribute('data-testid');
    const id = await input.getAttribute('id');
    console.log(`  Input ${i}: placeholder="${placeholder}", testid="${testId}", id="${id}"`);
  }

  // Check for buttons
  const buttons = await page.locator('button').count();
  console.log(`\nFound ${buttons} buttons total`);

  const viewButtons = await page.locator('button:has-text("View Profile & Book")').count();
  console.log(`Found ${viewButtons} "View Profile & Book" buttons`);

  const bookButtons = await page.locator('button:has-text("Book")').count();
  console.log(`Found ${bookButtons} buttons with "Book" text`);

  // Check for sliders
  const sliders = await page.locator('input[type="range"]').count();
  console.log(`\nFound ${sliders} range inputs (sliders)`);

  // Check for therapist cards
  const cards = await page.locator('[class*="bg-gradient"]').count();
  console.log(`Found ${cards} card elements`);

  // Take a screenshot
  console.log(`\nTaking screenshot...`);
  await page.screenshot({ path: '/tmp/therapist-page-debug.png' });

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('Debug complete');
}

debug().catch(console.error);
