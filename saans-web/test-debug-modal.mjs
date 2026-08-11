import { chromium } from 'playwright';
import fs from 'fs';

class ModalDebugger {
  async run() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('🔍 DEBUG: Examining page structure...\n');

    try {
      // Navigate
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });

      // Go to therapist page
      const therapistLink = await page.locator('text=/Therapist|Marketplace|Find Therapist/i').first();
      if (await therapistLink.isVisible().catch(() => false)) {
        console.log('✓ Found therapist link');
        await therapistLink.click();
        await page.waitForTimeout(1000);
      }

      // Check page content
      console.log('\n📍 Current page after navigation:');
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log(`   Title: ${pageTitle}`);
      console.log(`   Body length: ${bodyText.length} chars`);

      // Find all buttons
      console.log('\n📍 All buttons on page:');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 15); i++) {
        const text = await buttons[i].textContent();
        const visible = await buttons[i].isVisible();
        console.log(`   ${i + 1}. "${text.trim()}" - ${visible ? 'visible' : 'hidden'}`);
      }

      // Find all elements with "book", "schedule", "select"
      console.log('\n📍 Booking-related elements:');
      const actionElements = await page.locator('*:has-text(/Book|Schedule|Select|Reserve/i)').all();
      for (let i = 0; i < Math.min(actionElements.length, 10); i++) {
        const tag = await actionElements[i].evaluate(el => el.tagName);
        const text = await actionElements[i].textContent();
        const visible = await actionElements[i].isVisible();
        console.log(`   ${i + 1}. <${tag}> "${text.trim().substring(0, 50)}" - ${visible ? 'visible' : 'hidden'}`);
      }

      // Look for the modal or appointment modal
      console.log('\n📍 Looking for modal elements:');
      const modals = await page.locator('[class*="modal"], [class*="appointment"], [class*="Modal"]').all();
      console.log(`   Found ${modals.length} modal-like elements`);
      for (let i = 0; i < Math.min(modals.length, 5); i++) {
        const className = await modals[i].getAttribute('class');
        const visible = await modals[i].isVisible();
        console.log(`   ${i + 1}. class="${className}" - ${visible ? 'visible' : 'hidden'}`);
      }

      // Try clicking on therapist cards
      console.log('\n📍 Looking for therapist cards...');
      const cards = await page.locator('[class*="card"], [class*="therapist"], [class*="profile"]').all();
      console.log(`   Found ${cards.length} card-like elements`);

      if (cards.length > 0) {
        console.log('\n   Trying to click first card to trigger modal...');
        try {
          await cards[0].click();
          await page.waitForTimeout(1000);
          console.log('   ✓ Clicked card');
        } catch (e) {
          console.log(`   Error clicking card: ${e.message}`);
        }
      }

      // Check for appointment modal specifically
      console.log('\n📍 Checking for AppointmentModal component:');
      const appointmentModals = await page.locator('[class*="appointment"]').all();
      console.log(`   Found ${appointmentModals.length} appointment-related elements`);

      // Save page HTML for inspection
      const html = await page.content();
      fs.writeFileSync('/Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM/saans-web/page-debug.html', html);
      console.log('\n✓ Saved full page HTML to page-debug.html');

      // Check if modal is in HTML but hidden
      if (html.includes('Book Your Appointment')) {
        console.log('✓ "Book Your Appointment" found in page HTML');
      } else if (html.includes('AppointmentModal')) {
        console.log('✓ "AppointmentModal" found in page HTML');
      } else {
        console.log('✗ No appointment modal text/component found in page HTML');
      }

      // Try to find and click any "Book" button
      console.log('\n📍 Attempting to find and click any booking button...');
      const bookButtons = await page.locator('button, [role="button"]').all();
      for (const btn of bookButtons) {
        const text = await btn.textContent();
        if (text && (text.includes('Book') || text.includes('Schedule') || text.includes('book'))) {
          console.log(`   Found: "${text.trim()}"`);
          const isVisible = await btn.isVisible();
          const isDisabled = await btn.isDisabled();
          console.log(`   Visible: ${isVisible}, Disabled: ${isDisabled}`);

          if (isVisible && !isDisabled) {
            console.log('   Clicking...');
            await btn.click();
            await page.waitForTimeout(1500);

            // Check page after click
            const newHtml = await page.content();
            if (newHtml.includes('Book Your Appointment')) {
              console.log('   ✓ Modal header appeared after click!');
            } else {
              console.log('   No modal header after click');
            }

            // Check for visible modal elements
            const visibleModals = await page.locator('[class*="modal"]').all();
            for (const modal of visibleModals) {
              const isVisible = await modal.isVisible();
              if (isVisible) {
                const text = await modal.textContent();
                console.log(`   ✓ Found visible modal with content: "${text.substring(0, 50)}..."`);
              }
            }
          }
          break;
        }
      }

    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const modalDebugger = new ModalDebugger();
await modalDebugger.run();
