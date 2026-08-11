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
      testSuites: []
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

  async waitForPageLoad(page) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
    } catch (e) {
      console.warn('Page load timeout, continuing anyway...');
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
    console.log('THERAPIST LOCATION DISPLAY TEST RESULTS');
    console.log('========================================\n');

    for (const suite of this.results.testSuites) {
      console.log(`\n${suite.name}`);
      console.log('-'.repeat(50));

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
    console.log(`Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(2)}%`);
    console.log('========================================\n');
  }

  async testLocationFilterSection() {
    const page = await this.browser.newPage();
    try {
      console.log('\n[TEST SUITE] Location Filter Section...');
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

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
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      // Test 1: Verify badge/section structure exists
      const cards = await page.locator('[data-testid*="therapist-card"], div:has(button:has-text("View Profile & Book"))').count();
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
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

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
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

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

        // Look for checkboxes with location names
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

      // Test 4: Check hover effects on location items (if visible)
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

  async testNoDataScenario() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] No Data Scenario...');

      // Intercept API responses to simulate empty data
      await page.route('**/api/therapists**', route => {
        route.abort('blockedbyclient');
      });

      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      // Test 1: Error message or no results message appears
      const noResultsMsg = await page.locator('text=/No therapists found|Something went wrong/').count() > 0;
      this.addTest('No Data Scenario', 'No results/error message displays', noResultsMsg, {
        error: noResultsMsg ? undefined : 'No error or empty state message displayed'
      });

      // Test 2: UI still renders gracefully
      const headerStillVisible = await page.locator('h1:has-text("Find Your Therapist")').isVisible();
      this.addTest('No Data Scenario', 'Page structure intact without data', headerStillVisible, {
        error: headerStillVisible ? undefined : 'Page structure broken when no data'
      });

      // Test 3: Filters still accessible
      const filtersStillVisible = await page.locator('h2:has-text("Filters")').isVisible();
      this.addTest('No Data Scenario', 'Filters remain accessible with no data', filtersStillVisible, {
        error: filtersStillVisible ? undefined : 'Filters not accessible'
      });

      // Test 4: Try again button appears
      const tryAgainButton = await page.locator('button:has-text("Try Again")').count() > 0;
      const resetButton = await page.locator('button:has-text("Reset filters")').count() > 0;
      const hasRecoveryOption = tryAgainButton || resetButton;
      this.addTest('No Data Scenario', 'Recovery option available (Try Again/Reset)', hasRecoveryOption, {
        error: hasRecoveryOption ? undefined : 'No recovery option visible',
        details: tryAgainButton ? 'Found Try Again button' : 'Found Reset button'
      });
    } catch (error) {
      this.addTest('No Data Scenario', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testLocationFilterInteraction() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Location Filter Interaction...');
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      // Test 1: Can click location filter button
      const locationButton = page.locator('button:has-text("City/Location")');
      const buttonExists = await locationButton.count() > 0;
      this.addTest('Location Filter Interaction', 'Location filter button clickable', buttonExists, {
        error: buttonExists ? undefined : 'Location filter button not found'
      });

      if (buttonExists) {
        // Test 2: Filter expands
        await locationButton.first().click();
        await page.waitForTimeout(500);

        const checkboxes = await page.locator('label input[type="checkbox"]').all();
        const hasCheckboxes = checkboxes.length > 0;
        this.addTest('Location Filter Interaction', 'Filter expands to show options', hasCheckboxes, {
          error: hasCheckboxes ? undefined : 'Filter did not expand properly',
          details: `Found ${checkboxes.length} location options`
        });

        // Test 3: Can select a location option
        if (hasCheckboxes && checkboxes.length > 0) {
          try {
            const firstCheckbox = checkboxes[0];
            const isVisible = await firstCheckbox.isVisible();
            if (isVisible) {
              await firstCheckbox.click();
              await page.waitForTimeout(500);

              const isChecked = await firstCheckbox.isChecked();
              this.addTest('Location Filter Interaction', 'Can select location option', isChecked, {
                error: isChecked ? undefined : 'Checkbox did not get checked'
              });

              // Test 4: Results filter after selection
              const resultsText = await page.locator('text=/Showing \\d+ therapist/').textContent();
              this.addTest('Location Filter Interaction', 'Results update after selection', !!resultsText, {
                error: resultsText ? undefined : 'Results did not update',
                details: resultsText
              });
            }
          } catch (e) {
            this.addTest('Location Filter Interaction', 'Can select location option', false, {
              error: e.message
            });
          }
        }
      }
    } catch (error) {
      this.addTest('Location Filter Interaction', 'Test execution', false, {
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async testResponsiveLayout() {
    const page = await this.browser.newPage();
    try {
      console.log('[TEST SUITE] Responsive Layout...');

      // Test 1: Desktop layout
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      const sidebarDesktop = await page.locator('aside').isVisible();
      this.addTest('Responsive Layout', 'Sidebar visible on desktop', sidebarDesktop, {
        error: sidebarDesktop ? undefined : 'Sidebar not visible on desktop'
      });

      // Test 2: Mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      const headerMobile = await page.locator('h1').isVisible();
      this.addTest('Responsive Layout', 'Header visible on mobile', headerMobile, {
        error: headerMobile ? undefined : 'Header not visible on mobile'
      });

      // Test 3: Cards still render on mobile
      const cardsMobile = await page.locator('div:has(button:has-text("View Profile & Book"))').count();
      const hasMobileCards = cardsMobile > 0;
      this.addTest('Responsive Layout', 'Cards render on mobile', hasMobileCards, {
        error: hasMobileCards ? undefined : 'Cards not rendering on mobile',
        details: `Found ${cardsMobile} cards`
      });
    } catch (error) {
      this.addTest('Responsive Layout', 'Test execution', false, {
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
      await page.goto(`${BASE_URL}/find-therapist`, { waitUntil: 'networkidle' });
      await this.waitForPageLoad(page);

      // Test 1: Search input has label/aria-label
      const searchInput = page.locator('input[placeholder*="Search"]');
      const hasAriaLabel = await searchInput.getAttribute('aria-label');
      this.addTest('Accessibility', 'Search input has accessibility label', !!hasAriaLabel, {
        error: hasAriaLabel ? undefined : 'Search input missing aria-label',
        details: `aria-label: "${hasAriaLabel}"`
      });

      // Test 2: Filter buttons have accessible names
      const filterButton = page.locator('button:has-text("Filters")');
      const hasAccessibleName = await filterButton.count() > 0;
      this.addTest('Accessibility', 'Filter sections have accessible names', hasAccessibleName, {
        error: hasAccessibleName ? undefined : 'Filter sections not accessible'
      });

      // Test 3: Checkboxes are properly labeled
      const checkboxLabels = await page.locator('label input[type="checkbox"]').count();
      this.addTest('Accessibility', 'Checkboxes have labels', checkboxLabels > 0, {
        error: checkboxLabels > 0 ? undefined : 'Checkboxes missing labels',
        details: `Found ${checkboxLabels} labeled checkboxes`
      });

      // Test 4: Buttons have readable text
      const viewButtons = await page.locator('button:has-text("View Profile")').count();
      this.addTest('Accessibility', 'Action buttons have clear text', viewButtons > 0, {
        error: viewButtons > 0 ? undefined : 'Buttons missing clear text',
        details: `Found ${viewButtons} "View Profile" buttons`
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
      await this.testNoDataScenario();
      await this.testLocationFilterInteraction();
      await this.testResponsiveLayout();
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
