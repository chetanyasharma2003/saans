import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = "http://localhost:5174";
let browser;
let page;
const pageSnapshots = [];

async function initialize() {
  browser = await chromium.launch();
  const context = await browser.newContext();
  page = await context.newPage();
}

async function inspectPage(name, url) {
  console.log(`\n\n========== INSPECTING: ${name} ==========`);
  console.log(`URL: ${url}`);

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await new Promise((r) => setTimeout(r, 1500));

    // Get page title
    const title = await page.title();
    console.log(`Title: ${title}`);

    // Get main heading
    const h1 = await page.locator("h1").first().textContent();
    if (h1) console.log(`Main Heading: ${h1}`);

    // Get visible text content (first 500 chars)
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 300);
    });
    console.log(`Visible Content (first 300 chars):\n${bodyText}\n`);

    // Get all buttons and links
    const buttons = await page.locator("button").all();
    const links = await page.locator("a").all();

    console.log(`\nButtons found: ${buttons.length}`);
    for (let i = 0; i < Math.min(10, buttons.length); i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`  ${i + 1}. "${text?.trim()}" ${isVisible ? "" : "[hidden]"}`);
    }

    console.log(`\nLinks found: ${links.length}`);
    for (let i = 0; i < Math.min(10, links.length); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute("href");
      const isVisible = await links[i].isVisible();
      console.log(`  ${i + 1}. "${text?.trim()}" -> ${href} ${isVisible ? "" : "[hidden]"}`);
    }

    // Get all input fields
    const inputs = await page.locator("input, textarea, select").all();
    console.log(`\nInput fields found: ${inputs.length}`);
    for (let i = 0; i < Math.min(8, inputs.length); i++) {
      const type = await inputs[i].getAttribute("type");
      const name = await inputs[i].getAttribute("name");
      const placeholder = await inputs[i].getAttribute("placeholder");
      const isVisible = await inputs[i].isVisible();
      console.log(`  ${i + 1}. Type: ${type || "text"}, Name: ${name || "N/A"}, Placeholder: ${placeholder || "N/A"} ${isVisible ? "" : "[hidden]"}`);
    }

    // Get all text content in divs/cards
    const cards = await page.locator("[class*='card'], [class*='item'], [role='article']").all();
    console.log(`\nCards/Items found: ${cards.length}`);
    if (cards.length > 0) {
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const text = await cards[i].textContent();
        console.log(`  ${i + 1}. ${text?.substring(0, 100)}...`);
      }
    }

    // Check for console errors
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Get network errors
    let hasNetworkError = false;
    page.on("requestfailed", (request) => {
      if (request.url().includes("404") || request.url().includes("error")) {
        console.log(`\n⚠️ Network Error: ${request.url()}`);
        hasNetworkError = true;
      }
    });

    // Take screenshot
    const screenshotPath = `/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/screenshot-${name.replace(/\s/g, "-").toLowerCase()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    pageSnapshots.push({
      name,
      url,
      title,
      hasElements: {
        buttons: buttons.length,
        links: links.length,
        inputs: inputs.length,
        cards: cards.length,
      },
      screenshotPath,
    });
  } catch (e) {
    console.log(`ERROR on ${name}: ${e.message}`);
  }
}

async function runInspection() {
  try {
    await initialize();
    console.log(`\n🔍 DETAILED PAGE INSPECTION\n`);

    await inspectPage("Landing Page", `${BASE_URL}/`);
    await inspectPage("Login Page", `${BASE_URL}/login`);
    await inspectPage("Register Page", `${BASE_URL}/register`);
    await inspectPage("Dashboard", `${BASE_URL}/dashboard`);
    await inspectPage("AI Counselor", `${BASE_URL}/ai-counselor`);
    await inspectPage("Find Therapist", `${BASE_URL}/therapist-marketplace`);
    await inspectPage("Mood Tracker", `${BASE_URL}/mood-tracker`);
    await inspectPage("Community", `${BASE_URL}/community`);
    await inspectPage("Crisis Support", `${BASE_URL}/crisis-support`);
    await inspectPage("Profile", `${BASE_URL}/profile`);

    // Summary
    console.log("\n\n========== SUMMARY ==========");
    console.log("Pages inspected:", pageSnapshots.length);
    pageSnapshots.forEach((snap) => {
      console.log(
        `\n${snap.name}:\n` +
          `  Buttons: ${snap.hasElements.buttons}\n` +
          `  Links: ${snap.hasElements.links}\n` +
          `  Inputs: ${snap.hasElements.inputs}\n` +
          `  Cards: ${snap.hasElements.cards}`
      );
    });

    await browser.close();
  } catch (e) {
    console.error("Fatal error:", e);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runInspection();
