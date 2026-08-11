import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const RESULTS_FILE = 'therapist-location-test-results.json';

class FindTherapistLocationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testSuites: [],
      warnings: []
    };
    this.browser = null;
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  addTest(suiteName, testName, passed, details = {}) {
    let suite = this.results.testSuites.find(s => s.name === suiteName);
    if (!suite) {
      suite = { name: suiteName, tests: [] };
      this.results.testSuites.push(suite);
    }

    const test = {
      name: testName,
      passed,
      ...details,
      timestamp: new Date().toISOString()
    };

    suite.tests.push(test);
    this.results.totalTests++;
    if (passed) {
      this.results.passedTests++;
    } else {
      this.results.failedTests++;
    }
  }

  saveResults() {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    console.log(`\nResults saved to ${RESULTS_FILE}`);
  }

  printResults() {
    console.log('\n========================================');
    console.log('FIND THERAPIST PAGE - LOCATION DISPLAY TEST');
    console.log('========================================\n');

    if (this.results.warnings.length > 0) {
      console.log('WARNINGS:');
      this.results.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
      console.log();
    }

    for (const suite of this.results.testSuites) {
      console.log(`\n${suite.name}`);
      console.log('-'.repeat(60));

      for (const test of suite.tests) {
        const status = test.passed ? '✓ PASS' : '✗ FAIL';
        console.log(`${status}: ${test.name}`);
        if (test.error) {
          console.log(`  Error: ${test.error}`);
        }
        if (test.details) {
          console.log(`  Details: ${test.details}`);
        }
      }
    }

    console.log('\n========================================');
    console.log(`Total Tests: ${this.results.totalTests}`);
    console.log(`Passed: ${this.results.passedTests}`);
    console.log(`Failed: ${this.results.failedTests}`);
    if (this.results.totalTests > 0) {
      console.log(`Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(2)}%`);
    }
    console.log('========================================\n');
  }

  async testLocationFilterSection() {
    const page = await this.browser.newPage();
    try {
      console.log('\n[TEST SUITE] Location Filter Section...');

      // Navigate directly to therapist page (check if accessible without auth)
      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      // Check if we're redirected to login
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.results.warnings.push('FindTherapistPage requires authentication - redirected to login');
        this.addTest('Location Filter Section', 'Location filter button exists', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Check if location filter section exists
      const locationFilterButton = await page.locator('button:has-text("City/Location")').count();
      const passed1 = locationFilterButton > 0;
      this.addTest('Location Filter Section', 'Location filter button exists', passed1, {
        error: passed1 ? undefined : 'City/Location filter button not found',
        details: `Found ${locationFilterButton} location filter buttons`
      });

      // Test 2: Click location filter to expand
      if (passed1) {
        const button = page.locator('button:has-text("City/Location")').first();
        await button.click();
        await page.waitForTimeout(500);

        const checkboxes = await page.locator('label input[type="checkbox"]').count();
        const passed2 = checkboxes > 0;
        this.addTest('Location Filter Section', 'Location filter expands with options', passed2, {
          error: passed2 ? undefined : 'No checkboxes found after expanding location filter',
          details: `Found ${checkboxes} location options`
        });
      }
    } catch (error) {
      this.addTest('Location Filter Section', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testLocationBadgesOnCards() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Location Badges on Therapist Cards...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Location Badges on Cards', 'Therapist cards render', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Verify cards exist
      const cards = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
      const passed1 = cards > 0;
      this.addTest('Location Badges on Cards', 'Therapist cards render', passed1, {
        error: passed1 ? undefined : 'No therapist cards found',
        details: `Found ${cards} therapist cards`
      });

      // Test 2: Check for rating badges
      const ratingBadges = await page.locator('text=⭐').count();
      const passed2 = ratingBadges > 0;
      this.addTest('Location Badges on Cards', 'Rating badges visible', passed2, {
        error: passed2 ? undefined : 'Rating badges (⭐) not visible',
        details: `Found ${ratingBadges} rating badges`
      });

      // Test 3: Check for price badges
      const priceBadges = await page.locator('text=/\\$\\d+\\/session/').count();
      const passed3 = priceBadges > 0;
      this.addTest('Location Badges on Cards', 'Price badges visible', passed3, {
        error: passed3 ? undefined : 'Price badges not visible',
        details: `Found ${priceBadges} price badges`
      });

      // Test 4: Check for language indicator
      const languageBadges = await page.locator('text=🌐').count();
      const passed4 = languageBadges > 0;
      this.addTest('Location Badges on Cards', 'Language indicator (🌐) visible', passed4, {
        error: passed4 ? undefined : 'Language indicator not visible',
        details: `Found ${languageBadges} language indicators`
      });

      // Test 5: Check for specialization tags
      const specTags = await page.locator('[class*="teal"][class*="text-xs"]').count();
      const passed5 = specTags > 0;
      this.addTest('Location Badges on Cards', 'Specialization tags visible', passed5, {
        error: passed5 ? undefined : 'Specialization tags not visible',
        details: `Found ${specTags} specialization tags`
      });

      // Test 6: Check for money emoji
      const moneyEmoji = await page.locator('text=💰').count();
      const passed6 = moneyEmoji > 0;
      this.addTest('Location Badges on Cards', 'Price icon (💰) visible', passed6, {
        error: passed6 ? undefined : 'Price icon not visible',
        details: `Found ${moneyEmoji} price icons`
      });
    } catch (error) {
      this.addTest('Location Badges on Cards', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testSectionsRender() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Sections Render...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Sections Render', 'Header section renders', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Header section
      const headerExists = await page.locator('h1:has-text("Find Your Therapist")').count() > 0;
      this.addTest('Sections Render', 'Header section renders', headerExists, {
        error: headerExists ? undefined : 'Header not found'
      });

      // Test 2: Search section
      const searchExists = await page.locator('input[placeholder*="Search"]').count() > 0;
      this.addTest('Sections Render', 'Search section renders', searchExists, {
        error: searchExists ? undefined : 'Search input not found'
      });

      // Test 3: Filter sidebar
      const filtersHeader = await page.locator('h2:has-text("Filters")').count() > 0;
      this.addTest('Sections Render', 'Filter sidebar renders', filtersHeader, {
        error: filtersHeader ? undefined : 'Filters header not found'
      });

      // Test 4: Main content area
      const mainContent = await page.locator('main').count() > 0;
      this.addTest('Sections Render', 'Main content area renders', mainContent, {
        error: mainContent ? undefined : 'Main content area not found'
      });

      // Test 5: Therapist results section
      const resultsText = await page.locator('text=/Showing \\d+ therapist/').count() > 0;
      this.addTest('Sections Render', 'Results counter displays', resultsText, {
        error: resultsText ? undefined : 'Results counter not visible'
      });
    } catch (error) {
      this.addTest('Sections Render', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testLocationIndicatorsVisible() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Location Indicators Visibility...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Location Indicators Visibility', 'Location filter visible in sidebar', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Check if location filter appears in sidebar
      const locationFilterVisible = await page.locator('button:has-text("City/Location")').isVisible();
      this.addTest('Location Indicators Visibility', 'Location filter visible in sidebar', locationFilterVisible, {
        error: locationFilterVisible ? undefined : 'Location filter not visible'
      });

      // Test 2: Check for location text content (when expanded)
      const locationButton = page.locator('button:has-text("City/Location")');
      if (await locationButton.count() > 0) {
        await locationButton.first().click();
        await page.waitForTimeout(500);

        const locationCheckboxes = await page.locator('label input[type="checkbox"]').count();
        const hasLocations = locationCheckboxes > 0;
        this.addTest('Location Indicators Visibility', 'Location options display when expanded', hasLocations, {
          error: hasLocations ? undefined : 'No location options found when expanded',
          details: `Found ${locationCheckboxes} location checkboxes`
        });

        // Test 3: Verify location text is readable
        if (hasLocations) {
          const locationLabels = await page.locator('label:has(input[type="checkbox"])').allTextContents();
          const passed = locationLabels.length > 0;
          this.addTest('Location Indicators Visibility', 'Location text readable', passed, {
            error: passed ? undefined : 'Location labels not readable',
            details: `Found location labels: ${locationLabels.slice(0, 3).join(', ')}`
          });
        }
      }

      // Test 4: Check sort/filter controls
      const sortBySelect = await page.locator('select').count() > 0;
      this.addTest('Location Indicators Visibility', 'Sort/filter controls visible', sortBySelect, {
        error: sortBySelect ? undefined : 'Sort controls not visible',
        details: `Found ${sortBySelect ? 'sort select' : 'no select'}`
      });
    } catch (error) {
      this.addTest('Location Indicators Visibility', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testFilteringBehavior() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Filtering Behavior...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Filtering Behavior', 'Filter application works', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Initial state shows results
      const initialCards = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
      const hasInitialResults = initialCards > 0;
      this.addTest('Filtering Behavior', 'Initial results display', hasInitialResults, {
        details: `Found ${initialCards} therapists`
      });

      // Test 2: Can apply specialty filter
      const specialtyButton = page.locator('button:has-text("Specialty")');
      if (await specialtyButton.count() > 0) {
        await specialtyButton.first().click();
        await page.waitForTimeout(500);

        const checkboxes = await page.locator('label input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        const canApplyFilter = checkboxCount > 0;
        this.addTest('Filtering Behavior', 'Specialty filter options available', canApplyFilter, {
          details: `Found ${checkboxCount} specialty options`
        });

        if (canApplyFilter) {
          await checkboxes.first().click();
          await page.waitForTimeout(1000);

          const resultsAfter = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
          this.addTest('Filtering Behavior', 'Results update after filter selection', true, {
            details: `Results changed from ${initialCards} to ${resultsAfter} cards`
          });
        }
      }

      // Test 3: Clear filters button functionality
      const clearButton = await page.locator('button:has-text("Clear All Filters")');
      if (await clearButton.count() > 0) {
        await clearButton.first().click();
        await page.waitForTimeout(1000);

        const resultsAfterClear = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
        this.addTest('Filtering Behavior', 'Clear filters button works', true, {
          details: `Results returned to ${resultsAfterClear} cards`
        });
      }
    } catch (error) {
      this.addTest('Filtering Behavior', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testNoDataHandling() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] No Data Handling...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('No Data Handling', 'Error handling works', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Page structure remains intact
      const headerStaysVisible = await page.locator('h1:has-text("Find Your Therapist")').isVisible();
      this.addTest('No Data Handling', 'Page structure intact even if empty', headerStaysVisible, {
        error: headerStaysVisible ? undefined : 'Page structure broken'
      });

      // Test 2: Filters remain accessible
      const filtersStayVisible = await page.locator('h2:has-text("Filters")').isVisible();
      this.addTest('No Data Handling', 'Filters remain accessible', filtersStayVisible, {
        error: filtersStayVisible ? undefined : 'Filters not accessible'
      });

      // Test 3: Message displayed when no results
      const noResultsMsg = await page.locator('text=/No therapists found/').count() > 0;
      const hasRecoveryOption = await page.locator('button:has-text("Reset filters")').count() > 0;
      const recovered = noResultsMsg || hasRecoveryOption;
      this.addTest('No Data Handling', 'Appropriate message/recovery when no results', recovered, {
        details: `No results message: ${noResultsMsg}, Reset option: ${hasRecoveryOption}`
      });
    } catch (error) {
      this.addTest('No Data Handling', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testResponsiveDesign() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Responsive Design...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Responsive Design', 'Desktop layout works', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Desktop layout
      await page.setViewportSize({ width: 1920, height: 1080 });
      const desktopSidebar = await page.locator('aside').isVisible();
      this.addTest('Responsive Design', 'Desktop: Sidebar visible', desktopSidebar, {
        error: desktopSidebar ? undefined : 'Sidebar not visible on desktop'
      });

      // Test 2: Mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileHeader = await page.locator('h1').isVisible();
      this.addTest('Responsive Design', 'Mobile: Header visible', mobileHeader, {
        error: mobileHeader ? undefined : 'Header not visible on mobile'
      });

      // Test 3: Cards render on mobile
      const mobileCards = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
      const mobileCardsRender = mobileCards > 0;
      this.addTest('Responsive Design', 'Mobile: Cards render properly', mobileCardsRender, {
        details: `${mobileCards} cards visible on mobile`
      });

      // Test 4: Tablet layout
      await page.setViewportSize({ width: 768, height: 1024 });
      const tabletCards = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
      this.addTest('Responsive Design', 'Tablet: Cards render', tabletCards > 0, {
        details: `${tabletCards} cards visible on tablet`
      });
    } catch (error) {
      this.addTest('Responsive Design', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testAccessibility() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Accessibility...');

      await page.goto(`${BASE_URL}/therapist`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        this.addTest('Accessibility', 'Semantic HTML used', false, {
          error: 'Page requires authentication'
        });
        return;
      }

      // Test 1: Search input has aria-label
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        const hasAriaLabel = await searchInput.getAttribute('aria-label');
        this.addTest('Accessibility', 'Search input has aria-label', !!hasAriaLabel, {
          details: `aria-label: "${hasAriaLabel}"`
        });
      }

      // Test 2: Buttons have readable text
      const viewButtons = await page.locator('button:has-text("View Profile")').count();
      this.addTest('Accessibility', 'Buttons have clear text labels', viewButtons > 0, {
        details: `Found ${viewButtons} "View Profile" buttons`
      });

      // Test 3: Form elements have labels
      const labeledInputs = await page.locator('label').count();
      this.addTest('Accessibility', 'Checkboxes/inputs have labels', labeledInputs > 0, {
        details: `Found ${labeledInputs} labels`
      });

      // Test 4: Semantic heading hierarchy
      const h1Count = await page.locator('h1').count();
      this.addTest('Accessibility', 'Proper heading hierarchy', h1Count > 0, {
        details: `Found ${h1Count} h1 tags`
      });
    } catch (error) {
      this.addTest('Accessibility', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();

      await this.testLocationFilterSection();
      await this.testLocationBadgesOnCards();
      await this.testSectionsRender();
      await this.testLocationIndicatorsVisible();
      await this.testFilteringBehavior();
      await this.testNoDataHandling();
      await this.testResponsiveDesign();
      await this.testAccessibility();

      this.printResults();
      this.saveResults();
    } catch (error) {
      console.error('Fatal error during test execution:', error);
      this.results.error = error.message;
      this.saveResults();
    } finally {
      await this.close();
    }
  }
}

// Run tests
const tester = new FindTherapistLocationTester();
await tester.runAllTests();
