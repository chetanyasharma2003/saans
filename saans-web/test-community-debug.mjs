import playwright from 'playwright';

const APP_BASE = process.env.APP_BASE || 'http://localhost:5179';

async function test() {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${APP_BASE}/community`);
  await page.goto(`${APP_BASE}/community`, { waitUntil: 'domcontentloaded' });

  // Wait a bit more
  await page.waitForTimeout(2000);

  console.log(`Current URL: ${page.url()}`);
  console.log(`Page title: ${await page.title()}`);

  // Get page content
  const content = await page.content();
  console.log('\n--- Page HTML (first 2000 chars) ---');
  console.log(content.slice(0, 2000));

  // Check for specific elements
  console.log('\n--- Element Detection ---');

  const heading = await page.locator('h1').textContent().catch(() => 'NOT FOUND');
  console.log(`Main heading: ${heading}`);

  const communityText = await page.locator('text=Community').count();
  console.log(`"Community" text instances: ${communityText}`);

  const postCards = await page.locator('[class*="post"]').count();
  console.log(`Elements with "post" in class: ${postCards}`);

  const textContent = await page.textContent('body');
  if (textContent.includes('error')) {
    console.log('\n⚠️ ERROR detected on page');
    const errorElement = await page.locator('text=/[Ee]rror/').first().textContent();
    console.log(`Error message: ${errorElement}`);
  }

  const supportGroups = await page.locator('text=Support Groups').isVisible().catch(() => false);
  console.log(`\n"Support Groups" heading visible: ${supportGroups}`);

  const allText = await page.innerText('body');
  if (!allText || allText.length < 50) {
    console.log('\n⚠️ Page appears empty or minimal content');
  } else {
    console.log(`\nPage text content length: ${allText.length} chars`);
    console.log('First 500 chars of body text:');
    console.log(allText.slice(0, 500));
  }

  await browser.close();
}

test().catch(console.error);
