import { chromium } from 'playwright';

const CLIENT_URL = 'http://localhost:5173';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🌐 Navigating to dashboard...');
  try {
    await page.goto(`${CLIENT_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => {
      console.log('Dashboard load error (expected if not logged in):', e.message);
    });
    
    // Try therapists page
    console.log('🌐 Navigating to therapists page...');
    await page.goto(`${CLIENT_URL}/find-therapist`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check what's on the page
    const content = await page.content();
    console.log('\n📄 Page loaded. Checking for modal elements...');
    
    // Look for modal or appointment related content
    if (content.includes('Book Your Session') || content.includes('AppointmentModal')) {
      console.log('✓ AppointmentModal code found in page');
    }
    
    if (content.includes('therapist')) {
      console.log('✓ Therapist content found');
    }
    
    // Wait a bit to see the page
    console.log('\n⏳ Keeping browser open for inspection...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

test();
