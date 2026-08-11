import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to therapist page...');
    await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'load' });

    await page.waitForTimeout(5000);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get page content
    const content = await page.content();
    console.log(`\nPage content length: ${content.length} bytes`);
    console.log('\nFirst 1000 characters of page content:');
    console.log(content.substring(0, 1000));

    // Check for specific elements
    console.log('\n=== ELEMENT CHECKS ===');
    console.log(`h1 elements: ${await page.locator('h1').count()}`);
    console.log(`h2 elements: ${await page.locator('h2').count()}`);
    console.log(`input elements: ${await page.locator('input').count()}`);
    console.log(`button elements: ${await page.locator('button').count()}`);
    console.log(`text "Find Your Therapist": ${await page.locator('text=Find Your Therapist').count()}`);

    // Check if React has rendered
    const rootDiv = await page.locator('#root').count();
    console.log(`\n#root div found: ${rootDiv > 0}`);

    const htmlContent = await page.locator('html').evaluate(el => el.innerHTML);
    console.log(`\nHTML content length: ${htmlContent.length}`);
    console.log('\nFirst 2000 chars of HTML:');
    console.log(htmlContent.substring(0, 2000));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
