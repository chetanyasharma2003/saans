import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    // Get all text content
    const allText = await page.locator('body').innerText();
    console.log('=== ALL PAGE TEXT ===');
    console.log(allText.substring(0, 2000));

    // Get h1 text
    const h1Texts = await page.locator('h1').allTextContents();
    console.log('\n=== H1 TEXTS ===');
    console.log(h1Texts);

    // Get h2 text
    const h2Texts = await page.locator('h2').allTextContents();
    console.log('\n=== H2 TEXTS ===');
    console.log(h2Texts);

    // Get input values and placeholders
    const inputs = await page.locator('input').all();
    console.log('\n=== INPUTS ===');
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }

    // Get button texts
    const buttons = await page.locator('button').allTextContents();
    console.log('\n=== BUTTONS ===');
    console.log(buttons);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
