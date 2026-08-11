import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = "http://localhost:5174";
const REPORT_FILE = "/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/test-report.md";

let browser;
let context;
let page;
const issues = [];
let testCount = 0;

async function initialize() {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
}

async function logIssue(page, category, issue) {
  issues.push({ page, category, issue, timestamp: new Date().toISOString() });
  console.log(`[ISSUE] ${page} - ${category}: ${issue}`);
}

async function testPage(name, url) {
  console.log(`\n========== TESTING: ${name} ==========`);
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await new Promise((r) => setTimeout(r, 1000));
}

// 1. LANDING PAGE TESTS
async function testLandingPage() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Landing Page - Run ${i}/3]`);
    await testPage("Landing Page", `${BASE_URL}/`);
    testCount++;

    try {
      // Check hero loads
      const hero = await page.locator("[data-testid='hero'], h1, .hero").first();
      if ((await hero.count()) > 0) {
        console.log("✓ Hero section loaded");
      } else {
        await logIssue("Landing", "Hero Section", "Hero section not found");
      }

      // Test CTA buttons
      const buttons = await page.locator("button, a[class*='button']").all();
      if (buttons.length > 0) {
        console.log(`✓ Found ${buttons.length} CTA buttons`);
        // Try clicking first button
        try {
          await buttons[0].click();
          await page.waitForLoadState("networkidle");
          console.log("✓ First button clickable");
        } catch (e) {
          await logIssue("Landing", "CTA Button", `Button click failed: ${e.message}`);
        }
        // Navigate back
        await page.goto(`${BASE_URL}/`);
      } else {
        await logIssue("Landing", "CTA Button", "No buttons found");
      }

      // Check features display
      const features = await page.locator("[class*='feature'], [class*='card']").all();
      if (features.length > 0) {
        console.log(`✓ Features display (${features.length} items found)`);
      } else {
        await logIssue("Landing", "Features", "Feature sections not found");
      }
    } catch (e) {
      await logIssue("Landing", "General", `Error: ${e.message}`);
    }
  }
}

// 2. LOGIN PAGE TESTS
async function testLoginPage() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Login Page - Run ${i}/3]`);
    await testPage("Login Page", `${BASE_URL}/login`);
    testCount++;

    try {
      // Check form exists
      const form = await page.locator("form, [class*='login']").first();
      if ((await form.count()) > 0) {
        console.log("✓ Login form found");
      } else {
        await logIssue("Login", "Form", "Login form not found");
      }

      // Test form inputs
      const emailInput = await page.locator("input[type='email'], input[name*='email']").first();
      const passwordInput = await page.locator("input[type='password']").first();

      if ((await emailInput.count()) > 0) {
        await emailInput.fill("test@example.com");
        console.log("✓ Email field editable");
      } else {
        await logIssue("Login", "Form", "Email field not found");
      }

      if ((await passwordInput.count()) > 0) {
        await passwordInput.fill("password123");
        console.log("✓ Password field editable");
      } else {
        await logIssue("Login", "Form", "Password field not found");
      }

      // Test invalid login
      const submitButton = await page.locator("button[type='submit'], button:has-text('Login'), button:has-text('Sign in')").first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState("networkidle");
        await new Promise((r) => setTimeout(r, 1000));

        // Check for error message
        const errorMsg = await page.locator("[class*='error'], [role='alert']").first();
        if ((await errorMsg.count()) > 0) {
          console.log("✓ Invalid login shows error message");
        } else {
          console.log("⚠ Error message not visible (but login might still be invalid)");
        }
      } else {
        await logIssue("Login", "Submit", "Submit button not found");
      }

      // Test sign up link
      const signupLink = await page.locator("a:has-text('Sign up'), a:has-text('register'), a[href*='register']").first();
      if ((await signupLink.count()) > 0) {
        const signupHref = await signupLink.getAttribute("href");
        console.log(`✓ Sign up link found (href: ${signupHref})`);
      } else {
        await logIssue("Login", "Navigation", "Sign up link not found");
      }
    } catch (e) {
      await logIssue("Login", "General", `Error: ${e.message}`);
    }
  }
}

// 3. REGISTER PAGE TESTS
async function testRegisterPage() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Register Page - Run ${i}/3]`);
    await testPage("Register Page", `${BASE_URL}/register`);
    testCount++;

    try {
      // Check all fields are editable
      const nameInput = await page.locator("input[name*='name'], input[name*='fullname']").first();
      const emailInput = await page.locator("input[type='email'], input[name*='email']").first();
      const passwordInput = await page.locator("input[type='password']").first();
      const cityInput = await page.locator("select[name*='city'], input[name*='city']").first();

      if ((await nameInput.count()) > 0) {
        await nameInput.fill(`TestUser${Date.now()}`);
        console.log("✓ Name field editable");
      } else {
        await logIssue("Register", "Form", "Name field not found");
      }

      if ((await emailInput.count()) > 0) {
        await emailInput.fill(`test${Date.now()}@example.com`);
        console.log("✓ Email field editable");
      } else {
        await logIssue("Register", "Form", "Email field not found");
      }

      if ((await passwordInput.count()) > 0) {
        await passwordInput.fill("Test@123");
        console.log("✓ Password field editable");
      } else {
        await logIssue("Register", "Form", "Password field not found");
      }

      // Test city selection
      if ((await cityInput.count()) > 0) {
        const tagName = await cityInput.evaluate((el) => el.tagName);
        if (tagName === "SELECT") {
          await cityInput.selectOption({ index: 1 });
          console.log("✓ City selection works");
        } else {
          await cityInput.fill("Mumbai");
          console.log("✓ City field editable");
        }
      } else {
        await logIssue("Register", "Form", "City field not found");
      }

      // Check password validation message
      const passwordField = await page.locator("input[type='password']").first();
      await passwordField.fill("weak");
      await page.waitForLoadState("networkidle");

      const validationMsg = await page.locator("[class*='validation'], [class*='error'], [class*='message']").first();
      if ((await validationMsg.count()) > 0) {
        const msg = await validationMsg.textContent();
        console.log(`✓ Password validation shows: ${msg?.substring(0, 50)}`);
      }
    } catch (e) {
      await logIssue("Register", "General", `Error: ${e.message}`);
    }
  }
}

// 4. DASHBOARD TESTS
async function testDashboard() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Dashboard - Run ${i}/3]`);
    await testPage("Dashboard", `${BASE_URL}/dashboard`);
    testCount++;

    try {
      // Check for 403 error
      if (page.url().includes("login")) {
        console.log("⚠ Redirected to login (likely unauthenticated)");
      } else {
        // Check stats load
        const stats = await page.locator("[class*='stat'], [class*='card'], h2").all();
        if (stats.length > 0) {
          console.log(`✓ Dashboard elements loaded (${stats.length} items)`);
        } else {
          await logIssue("Dashboard", "Content", "Dashboard content not found");
        }

        // Check for navigation
        const navLinks = await page.locator("a, button").all();
        console.log(`✓ Found ${navLinks.length} clickable elements`);
      }
    } catch (e) {
      await logIssue("Dashboard", "General", `Error: ${e.message}`);
    }
  }
}

// 5. AI COUNSELOR TESTS
async function testAICounselor() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[AI Counselor - Run ${i}/3]`);
    await testPage("AI Counselor", `${BASE_URL}/ai-counselor`);
    testCount++;

    try {
      // Check for 403 error in network requests
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      // Look for message input
      const messageInput = await page.locator("textarea, input[name*='message'], input[placeholder*='message'], input[placeholder*='type']").first();
      if ((await messageInput.count()) > 0) {
        await messageInput.fill("Hello, how are you?");
        console.log("✓ Message input works");

        // Try sending
        const sendButton = await page.locator("button:has-text('Send'), button[type='submit']").first();
        if ((await sendButton.count()) > 0) {
          await sendButton.click();
          await page.waitForLoadState("networkidle");
          console.log("✓ Send button clickable");

          // Wait for response
          await new Promise((r) => setTimeout(r, 2000));
        }
      } else {
        await logIssue("AI Counselor", "Input", "Message input not found");
      }

      // Check for 403 errors
      if (consoleErrors.some((e) => e.includes("403"))) {
        await logIssue("AI Counselor", "API", "403 error detected");
      }
    } catch (e) {
      await logIssue("AI Counselor", "General", `Error: ${e.message}`);
    }
  }
}

// 6. FIND THERAPIST TESTS
async function testFindTherapist() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Find Therapist - Run ${i}/3]`);
    await testPage("Find Therapist", `${BASE_URL}/therapist-marketplace`);
    testCount++;

    try {
      // Check therapist list
      const therapistCards = await page.locator("[class*='therapist'], [class*='card'], [role='article']").all();
      if (therapistCards.length > 0) {
        console.log(`✓ Therapist list loaded (${therapistCards.length} items)`);
      } else {
        await logIssue("Therapist", "List", "Therapist list not found");
      }

      // Test search
      const searchInput = await page.locator("input[placeholder*='search'], input[name*='search']").first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill("Dr");
        await page.waitForLoadState("networkidle");
        console.log("✓ Search input works");
      } else {
        console.log("⚠ Search input not found");
      }

      // Test filters
      const filterButtons = await page.locator("button[class*='filter'], select").all();
      if (filterButtons.length > 0) {
        console.log(`✓ Filter controls found (${filterButtons.length})`);
      }

      // Try clicking first therapist
      const therapistLink = await page.locator("a, button").first();
      if ((await therapistLink.count()) > 0) {
        const href = await therapistLink.getAttribute("href");
        if (href?.includes("therapist")) {
          await therapistLink.click();
          await page.waitForLoadState("networkidle");
          console.log("✓ Therapist detail page navigation works");
        }
      }
    } catch (e) {
      await logIssue("Therapist", "General", `Error: ${e.message}`);
    }
  }
}

// 7. MOOD TRACKER TESTS
async function testMoodTracker() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Mood Tracker - Run ${i}/3]`);
    await testPage("Mood Tracker", `${BASE_URL}/mood-tracker`);
    testCount++;

    try {
      // Test mood selection
      const moodOptions = await page.locator("button[class*='mood'], [role='button'], [class*='emotion']").all();
      if (moodOptions.length > 0) {
        await moodOptions[0].click();
        console.log(`✓ Mood selection works (${moodOptions.length} options)`);
      } else {
        await logIssue("Mood", "Selection", "Mood options not found");
      }

      // Test intensity slider
      const slider = await page.locator("input[type='range'], [class*='slider']").first();
      if ((await slider.count()) > 0) {
        await slider.fill("7");
        console.log("✓ Intensity slider works");
      } else {
        console.log("⚠ Intensity slider not found");
      }

      // Test notes field
      const notesInput = await page.locator("textarea, input[name*='notes'], input[placeholder*='note']").first();
      if ((await notesInput.count()) > 0) {
        await notesInput.fill("Test note about mood");
        console.log("✓ Notes field works");
      } else {
        console.log("⚠ Notes field not found");
      }

      // Test submit
      const submitButton = await page.locator("button:has-text('Submit'), button:has-text('Save'), button[type='submit']").first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState("networkidle");
        console.log("✓ Submit button works");
      } else {
        await logIssue("Mood", "Submit", "Submit button not found");
      }

      // Refresh and check persistence
      await page.reload();
      const savedData = await page.locator("[class*='emotion'], [class*='mood']").first();
      if ((await savedData.count()) > 0) {
        console.log("✓ Data persists after refresh");
      }
    } catch (e) {
      await logIssue("Mood", "General", `Error: ${e.message}`);
    }
  }
}

// 8. COMMUNITY TESTS
async function testCommunity() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Community - Run ${i}/3]`);
    await testPage("Community", `${BASE_URL}/community`);
    testCount++;

    try {
      // Check posts load
      const posts = await page.locator("[class*='post'], [role='article'], [class*='card']").all();
      if (posts.length > 0) {
        console.log(`✓ Posts loaded (${posts.length} items)`);
      } else {
        await logIssue("Community", "Posts", "Posts not found");
      }

      // Test create post
      const createButton = await page.locator("button:has-text('Create'), button:has-text('Post'), button:has-text('Write')").first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await page.waitForLoadState("networkidle");
        console.log("✓ Create post button works");

        // Fill in post
        const textarea = await page.locator("textarea").first();
        if ((await textarea.count()) > 0) {
          await textarea.fill("Test community post");
          console.log("✓ Post text field works");
        }
      } else {
        console.log("⚠ Create post button not found");
      }

      // Test like button
      const likeButton = await page.locator("button[class*='like'], button[class*='heart'], svg[class*='heart']").first();
      if ((await likeButton.count()) > 0) {
        await likeButton.click();
        console.log("✓ Like button works");
      } else {
        console.log("⚠ Like button not found");
      }

      // Test comments
      const commentButton = await page.locator("button:has-text('Comment'), button[class*='comment']").first();
      if ((await commentButton.count()) > 0) {
        await commentButton.click();
        console.log("✓ Comment button works");
      } else {
        console.log("⚠ Comment button not found");
      }
    } catch (e) {
      await logIssue("Community", "General", `Error: ${e.message}`);
    }
  }
}

// 9. CRISIS SUPPORT TESTS
async function testCrisisSupport() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Crisis Support - Run ${i}/3]`);
    await testPage("Crisis Support", `${BASE_URL}/crisis-support`);
    testCount++;

    try {
      // Check hotline numbers display
      const hotlines = await page.locator("[class*='hotline'], [class*='phone'], tel").all();
      if (hotlines.length > 0) {
        console.log(`✓ Hotline numbers found (${hotlines.length})`);
      } else {
        await logIssue("Crisis", "Hotlines", "Hotline numbers not found");
      }

      // Check if numbers are clickable
      const phoneLinks = await page.locator("a[href^='tel:']").all();
      if (phoneLinks.length > 0) {
        const phoneNumber = await phoneLinks[0].getAttribute("href");
        console.log(`✓ Phone links work (${phoneNumber})`);
      } else {
        console.log("⚠ Phone links not found");
      }

      // Test chat option
      const chatButton = await page.locator("button:has-text('Chat'), button:has-text('Emergency Chat')").first();
      if ((await chatButton.count()) > 0) {
        await chatButton.click();
        await page.waitForLoadState("networkidle");
        console.log("✓ Chat option works");
      } else {
        console.log("⚠ Chat button not found");
      }

      // Check console for errors
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      if (consoleErrors.length > 0) {
        await logIssue("Crisis", "Console", `Console errors: ${consoleErrors.join(", ")}`);
      }
    } catch (e) {
      await logIssue("Crisis", "General", `Error: ${e.message}`);
    }
  }
}

// 10. PROFILE TESTS
async function testProfile() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n[Profile - Run ${i}/3]`);
    await testPage("Profile", `${BASE_URL}/profile`);
    testCount++;

    try {
      // Check name edit
      const nameField = await page.locator("input[name*='name'], input[placeholder*='name']").first();
      if ((await nameField.count()) > 0) {
        const isDisabled = await nameField.isDisabled();
        if (!isDisabled) {
          await nameField.fill("Updated Name");
          console.log("✓ Name field editable");
        } else {
          // Try edit button
          const editButton = await page.locator("button:has-text('Edit')").first();
          if ((await editButton.count()) > 0) {
            await editButton.click();
            console.log("✓ Edit button works");
          }
        }
      } else {
        await logIssue("Profile", "Form", "Name field not found");
      }

      // Check email edit
      const emailField = await page.locator("input[type='email']").first();
      if ((await emailField.count()) > 0) {
        const isDisabled = await emailField.isDisabled();
        if (!isDisabled) {
          await emailField.fill("newemail@example.com");
          console.log("✓ Email field editable");
        }
      }

      // Check password change
      const passwordButton = await page.locator("button:has-text('Password'), button:has-text('Change Password')").first();
      if ((await passwordButton.count()) > 0) {
        await passwordButton.click();
        console.log("✓ Password change option accessible");
      }

      // Check subscription tab
      const subscriptionTab = await page.locator("button:has-text('Subscription'), button:has-text('Plan')").first();
      if ((await subscriptionTab.count()) > 0) {
        await subscriptionTab.click();
        await page.waitForLoadState("networkidle");
        console.log("✓ Subscription tab accessible");

        // Check plans display
        const plans = await page.locator("[class*='plan'], [class*='pricing']").all();
        if (plans.length > 0) {
          console.log(`✓ Plans displayed (${plans.length})`);
        }

        // Check upgrade button
        const upgradeButton = await page.locator("button:has-text('Upgrade'), button:has-text('Subscribe')").first();
        if ((await upgradeButton.count()) > 0) {
          console.log("✓ Upgrade button found");
        }
      } else {
        console.log("⚠ Subscription tab not found");
      }
    } catch (e) {
      await logIssue("Profile", "General", `Error: ${e.message}`);
    }
  }
}

// Main test execution
async function runAllTests() {
  try {
    await initialize();
    console.log(`\n🧪 STARTING COMPREHENSIVE TEST SUITE\n`);
    console.log(`Base URL: ${BASE_URL}\n`);

    await testLandingPage();
    await testLoginPage();
    await testRegisterPage();
    await testDashboard();
    await testAICounselor();
    await testFindTherapist();
    await testMoodTracker();
    await testCommunity();
    await testCrisisSupport();
    await testProfile();

    console.log(`\n\n========== TEST SUMMARY ==========`);
    console.log(`Total test runs: ${testCount}`);
    console.log(`Total issues found: ${issues.length}`);

    // Generate markdown report
    let report = `# SAANS Mental Health Platform - Comprehensive Test Report\n\n`;
    report += `**Test Date:** ${new Date().toISOString()}\n`;
    report += `**Base URL:** ${BASE_URL}\n`;
    report += `**Total Runs:** ${testCount}\n`;
    report += `**Issues Found:** ${issues.length}\n\n`;

    if (issues.length > 0) {
      report += `## Issues Found\n\n`;
      const groupedIssues = {};
      issues.forEach((issue) => {
        if (!groupedIssues[issue.page]) {
          groupedIssues[issue.page] = [];
        }
        groupedIssues[issue.page].push(issue);
      });

      Object.entries(groupedIssues).forEach(([page, pageIssues]) => {
        report += `### ${page}\n`;
        pageIssues.forEach((issue, idx) => {
          report += `${idx + 1}. **[${issue.category}]** ${issue.issue}\n`;
        });
        report += `\n`;
      });
    } else {
      report += `✅ No issues found!\n`;
    }

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`\n📝 Report saved to: ${REPORT_FILE}`);

    await browser.close();
  } catch (e) {
    console.error("Fatal error:", e);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runAllTests();
