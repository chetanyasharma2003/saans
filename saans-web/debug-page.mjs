import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debugPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to:', `${BASE_URL}/find-therapist`);
    await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });

    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());

    // Get all headings
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Headings found:', headings);

    // Get all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('Buttons found:', buttons.slice(0, 10));

    // Get all inputs
    const inputs = await page.locator('input').all();
    console.log('Inputs found:', inputs.length);
    for (let i = 0; i < Math.min(5, inputs.length); i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`  Input ${i}: type=${type}, placeholder=${placeholder}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved to debug-screenshot.png');

    // Get page HTML
    const html = await page.content();
    console.log('HTML length:', html.length);

    // Save HTML to file
    const fs = await import('fs');
    fs.writeFileSync('debug-page.html', html);
    console.log('HTML saved to debug-page.html');

    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugPage().catch(console.error);
