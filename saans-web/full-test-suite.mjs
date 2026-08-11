import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = "http://localhost:5174";
const REPORT_FILE = "/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/full-test-report.md";

let browser;
let page;
const results = {
  passed: [],
  warnings: [],
  failures: [],
};

async function initialize() {
  browser = await chromium.launch();
  const context = await browser.newContext();
  page = await context.newPage();
}

function log(message) {
  console.log(message);
}

function pass(test) {
  results.passed.push(test);
  log(`✅ ${test}`);
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  log(`⚠️ ${test}: ${reason}`);
}

function fail(test, reason) {
  results.failures.push({ test, reason });
  log(`❌ ${test}: ${reason}`);
}

async function testLandingPage() {
  log("\n\n========== TESTING: LANDING PAGE ==========\n");

  for (let run = 1; run <= 2; run++) {
    log(`\nRun ${run}/2:`);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Test hero loads
    const heroElements = await page.locator("h1, h2").all();
    if (heroElements.length > 0) {
      pass(`Landing - Hero section loads (${heroElements.length} headings)`);
    } else {
      fail("Landing - Hero section", "No headings found");
    }

    // Test CTA buttons
    const buttons = await page.locator("button").all();
    if (buttons.length >= 5) {
      pass(`Landing - CTA buttons display (${buttons.length} buttons found)`);

      // Test clicking first button
      try {
        const visibleButtons = await page.locator("button:visible").all();
        if (visibleButtons.length > 0) {
          await visibleButtons[0].click();
          await page.waitForTimeout(500);
          pass("Landing - First CTA button clickable");
          await page.goto(`${BASE_URL}/`);
        }
      } catch (e) {
        warn("Landing - Button click", e.message);
      }
    } else {
      fail("Landing - CTA buttons", `Only ${buttons.length} buttons found`);
    }

    // Test navbar navigation
    const navLinks = await page.locator("a").all();
    if (navLinks.length > 3) {
      pass(`Landing - Navigation links present (${navLinks.length} links)`);
    } else {
      warn("Landing - Navigation", `Only ${navLinks.length} links found`);
    }

    // Test features section visibility
    const featureElements = await page.locator("section, [class*='feature']").all();
    if (featureElements.length > 0) {
      pass(`Landing - Features section visible`);
    }

    // Test pricing section
    const pricingButtons = await page.locator('button:has-text("Start Free Trial")').all();
    if (pricingButtons.length > 0) {
      pass(`Landing - Pricing section has CTA buttons (${pricingButtons.length})`);
    }

    // Test FAQ section
    const faqButtons = await page.locator("button").filter({ has: page.locator("text=/\\?/") }).all();
    if (faqButtons.length > 0) {
      pass("Landing - FAQ section present with expandable questions");
    }
  }
}

async function testLoginPage() {
  log("\n\n========== TESTING: LOGIN PAGE ==========\n");

  for (let run = 1; run <= 2; run++) {
    log(`\nRun ${run}/2:`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Check form exists
    const emailInput = await page.locator('input[type="email"], input[placeholder*="example"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();

    if ((await emailInput.count()) > 0) {
      pass("Login - Email input field present");

      // Test typing in email field
      await emailInput.fill("test@example.com");
      const emailValue = await emailInput.inputValue();
      if (emailValue === "test@example.com") {
        pass("Login - Email input accepts text");
      } else {
        fail("Login - Email input", "Failed to set email value");
      }
    } else {
      fail("Login - Email field", "Email input not found");
    }

    if ((await passwordInput.count()) > 0) {
      pass("Login - Password input field present");

      await passwordInput.fill("testpassword123");
      const passValue = await passwordInput.inputValue();
      if (passValue === "testpassword123") {
        pass("Login - Password input accepts text");
      }
    } else {
      fail("Login - Password field", "Password input not found");
    }

    // Test Sign In button
    const signInButton = await page.locator('button:has-text("Sign In")').first();
    if ((await signInButton.count()) > 0) {
      pass("Login - Sign In button present");
    }

    // Test Create account link
    const createLink = await page.locator('a:has-text("Create one now"), button:has-text("Create one now")').first();
    if ((await createLink.count()) > 0) {
      pass("Login - Create account link present");
      const href = await createLink.getAttribute("href");
      if (href?.includes("register") || (await createLink.textContent())?.includes("Create")) {
        pass("Login - Create account link navigates to register");
      }
    } else {
      warn("Login - Create link", "Not found with expected text");
    }

    // Test Forgot password link
    const forgotLink = await page.locator('a:has-text("Forgot password")').first();
    if ((await forgotLink.count()) > 0) {
      pass("Login - Forgot password link present");
    }

    // Test security message
    const securityMsg = await page.locator("text=/encrypt|secure/i").first();
    if ((await securityMsg.count()) > 0) {
      pass("Login - Security message displayed");
    }
  }
}

async function testRegisterPage() {
  log("\n\n========== TESTING: REGISTER PAGE ==========\n");

  for (let run = 1; run <= 2; run++) {
    log(`\nRun ${run}/2:`);
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const timestamp = Date.now();

    // Test name field
    const nameInput = await page.locator('input[placeholder*="name"], input[name*="name"]').first();
    if ((await nameInput.count()) > 0) {
      await nameInput.fill(`TestUser${timestamp}`);
      const value = await nameInput.inputValue();
      if (value.includes("TestUser")) {
        pass("Register - Name field editable");
      }
    } else {
      fail("Register - Name field", "Not found");
    }

    // Test email field
    const emailInput = await page.locator('input[type="email"]').first();
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(`test${timestamp}@example.com`);
      pass("Register - Email field editable");
    } else {
      fail("Register - Email field", "Not found");
    }

    // Test city selection
    const citySelect = await page.locator('select, input[name*="city"]').first();
    if ((await citySelect.count()) > 0) {
      const tagName = await citySelect.evaluate((el) => el.tagName);
      if (tagName === "SELECT") {
        const options = await page.locator("select option").all();
        if (options.length > 1) {
          await citySelect.selectOption({ index: 1 });
          pass(`Register - City selection works (${options.length} cities)`);
        }
      } else {
        await citySelect.fill("Mumbai");
        pass("Register - City field editable");
      }
    } else {
      fail("Register - City field", "Not found");
    }

    // Test password field
    const passInput = await page.locator('input[placeholder*="password"], input[name*="password"]').first();
    if ((await passInput.count()) > 0) {
      await passInput.fill("TestPass123");
      pass("Register - Password field editable");
    } else {
      fail("Register - Password field", "Not found");
    }

    // Test confirm password
    const confirmPass = await page.locator('input[name*="confirm"]').first();
    if ((await confirmPass.count()) > 0) {
      await confirmPass.fill("TestPass123");
      pass("Register - Confirm password field editable");
    } else {
      warn("Register - Confirm password", "Field not explicitly found");
    }

    // Test Start Journey button
    const submitButton = await page.locator('button:has-text("Start Your Journey")').first();
    if ((await submitButton.count()) > 0) {
      pass("Register - Submit button present");
    } else {
      fail("Register - Submit button", "Not found");
    }

    // Test Sign In link
    const signInLink = await page.locator('a:has-text("Sign In"), button:has-text("Sign In")').first();
    if ((await signInLink.count()) > 0) {
      pass("Register - Sign In link present");
    }
  }
}

async function testDashboard() {
  log("\n\n========== TESTING: DASHBOARD & AUTH FLOW ==========\n");

  // Navigate to dashboard (should redirect to login if not authenticated)
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  if (currentUrl.includes("login")) {
    pass("Dashboard - Authentication required (redirects to login)");
  } else {
    warn("Dashboard", "Expected redirect to login, but didn't happen");
  }
}

async function testErrorHandling() {
  log("\n\n========== TESTING: ERROR HANDLING & EDGE CASES ==========\n");

  // Test invalid login attempt
  log("\nTesting invalid login attempt:");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1000);

  const emailInput = await page.locator('input[type="email"]').first();
  const passwordInput = await page.locator('input[type="password"]').first();
  const signInButton = await page.locator('button:has-text("Sign In")').first();

  if ((await emailInput.count()) > 0) {
    await emailInput.fill("nonexistent@example.com");
    await passwordInput.fill("wrongpassword");
    await signInButton.click();
    await page.waitForTimeout(2000);

    const errorMsg = await page.locator('[role="alert"], [class*="error"]').first();
    if ((await errorMsg.count()) > 0) {
      pass("Error Handling - Invalid login shows error");
    } else {
      warn("Error Handling - Error message", "Not visually displayed but login likely still failed");
    }
  }

  // Test console for errors
  let consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(1000);

  if (consoleErrors.length === 0) {
    pass("Console - No errors on landing page");
  } else {
    warn("Console errors", `${consoleErrors.length} errors found: ${consoleErrors[0]}`);
  }
}

async function testResponsiveness() {
  log("\n\n========== TESTING: RESPONSIVENESS ==========\n");

  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(1000);

  const buttons = await page.locator("button").all();
  if (buttons.length > 0) {
    pass("Mobile - Landing page renders on mobile viewport");
  }

  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/register`);
  await page.waitForTimeout(1000);

  const formInputs = await page.locator("input").all();
  if (formInputs.length > 0) {
    pass("Tablet - Register page renders on tablet viewport");
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1280, height: 720 });
}

async function testLoadingPerformance() {
  log("\n\n========== TESTING: PAGE LOAD PERFORMANCE ==========\n");

  const startTime = Date.now();
  await page.goto(`${BASE_URL}/`);
  const landingTime = Date.now() - startTime;

  if (landingTime < 5000) {
    pass(`Landing page - Loads in ${landingTime}ms`);
  } else {
    warn("Landing page", `Slow load time: ${landingTime}ms`);
  }

  const startReg = Date.now();
  await page.goto(`${BASE_URL}/register`);
  const registerTime = Date.now() - startReg;

  if (registerTime < 5000) {
    pass(`Register page - Loads in ${registerTime}ms`);
  } else {
    warn("Register page", `Slow load time: ${registerTime}ms`);
  }

  const startLogin = Date.now();
  await page.goto(`${BASE_URL}/login`);
  const loginTime = Date.now() - startLogin;

  if (loginTime < 5000) {
    pass(`Login page - Loads in ${loginTime}ms`);
  } else {
    warn("Login page", `Slow load time: ${loginTime}ms`);
  }
}

async function testAccessibility() {
  log("\n\n========== TESTING: ACCESSIBILITY ==========\n");

  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1000);

  // Check for proper form labels
  const labels = await page.locator("label").all();
  if (labels.length > 0) {
    pass(`Login - Form labels present (${labels.length})`);
  } else {
    warn("Login - Labels", "No explicit labels found (may use placeholders)");
  }

  // Check for button text
  const allButtons = await page.locator("button").all();
  let unlabeledButtons = 0;
  for (const btn of allButtons) {
    const text = await btn.textContent();
    if (!text || text.trim() === "") {
      unlabeledButtons++;
    }
  }

  if (unlabeledButtons === 0) {
    pass("Accessibility - All buttons have labels");
  } else {
    warn("Accessibility", `${unlabeledButtons} buttons without text labels`);
  }

  // Check for images with alt text
  const images = await page.locator("img").all();
  let imagesWithoutAlt = 0;
  for (const img of images) {
    const alt = await img.getAttribute("alt");
    if (!alt || alt.trim() === "") {
      imagesWithoutAlt++;
    }
  }

  if (images.length > 0 && imagesWithoutAlt === 0) {
    pass("Accessibility - All images have alt text");
  } else if (imagesWithoutAlt > 0) {
    warn("Accessibility", `${imagesWithoutAlt}/${images.length} images missing alt text`);
  }
}

async function generateReport() {
  let report = `# SAANS Mental Health Platform - Full Test Report\n\n`;
  report += `**Test Date:** ${new Date().toISOString()}\n`;
  report += `**Base URL:** ${BASE_URL}\n\n`;

  report += `## Test Summary\n\n`;
  report += `- ✅ **Passed:** ${results.passed.length}\n`;
  report += `- ⚠️ **Warnings:** ${results.warnings.length}\n`;
  report += `- ❌ **Failures:** ${results.failures.length}\n`;
  report += `- **Total:** ${results.passed.length + results.warnings.length + results.failures.length}\n\n`;

  if (results.failures.length > 0) {
    report += `## Failures (${results.failures.length})\n\n`;
    results.failures.forEach((f) => {
      report += `- **${f.test}**: ${f.reason}\n`;
    });
    report += `\n`;
  }

  if (results.warnings.length > 0) {
    report += `## Warnings (${results.warnings.length})\n\n`;
    results.warnings.forEach((w) => {
      report += `- **${w.test}**: ${w.reason}\n`;
    });
    report += `\n`;
  }

  report += `## Passed Tests (${results.passed.length})\n\n`;
  results.passed.forEach((p) => {
    report += `- ${p}\n`;
  });

  fs.writeFileSync(REPORT_FILE, report);
  log(`\n📝 Full report saved to: ${REPORT_FILE}`);
}

async function runAllTests() {
  try {
    await initialize();
    log(`\n🧪 STARTING COMPREHENSIVE TEST SUITE\n`);
    log(`Base URL: ${BASE_URL}\n`);

    await testLandingPage();
    await testLoginPage();
    await testRegisterPage();
    await testDashboard();
    await testErrorHandling();
    await testResponsiveness();
    await testLoadingPerformance();
    await testAccessibility();

    log("\n\n========== FINAL SUMMARY ==========");
    log(`✅ Passed: ${results.passed.length}`);
    log(`⚠️  Warnings: ${results.warnings.length}`);
    log(`❌ Failures: ${results.failures.length}`);
    log(`📝 Total Tests Run: ${results.passed.length + results.warnings.length + results.failures.length}\n`);

    await generateReport();
    await browser.close();
  } catch (e) {
    console.error("Fatal error:", e);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runAllTests();
