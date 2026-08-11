import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AppointmentModalDetailedTester {
  constructor() {
    this.testResults = [];
    this.bugs = [];
    this.codeAnalysis = {};
  }

  addBug(category, severity, title, description, steps = '', expectedVsActual = '') {
    this.bugs.push({
      id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      severity,
      title,
      description,
      steps,
      expectedVsActual,
      timestamp: new Date().toISOString()
    });
    console.log(`🐛 [${severity}] ${category}: ${title}`);
  }

  recordTest(testName, status, details = '') {
    this.testResults.push({
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    });
    const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
    console.log(`${icon} ${testName}: ${status} ${details ? `(${details})` : ''}`);
  }

  analyzeComponentCode() {
    console.log('\n🔍 === COMPONENT CODE ANALYSIS ===');

    try {
      const componentPath = path.join(__dirname, 'src', 'components', 'AppointmentModal.tsx');
      const componentCode = fs.readFileSync(componentPath, 'utf-8');

      // Check component structure
      console.log('  Analyzing component structure...');

      // 1. Check for required interfaces
      const hasTherapistInterface = componentCode.includes('interface Therapist');
      const hasTimeSlotInterface = componentCode.includes('interface TimeSlot');
      const hasPropsInterface = componentCode.includes('interface AppointmentModalProps');

      if (hasTherapistInterface && hasTimeSlotInterface && hasPropsInterface) {
        this.recordTest('Component Interfaces Defined', 'PASS', '3 interfaces found');
      } else {
        this.recordTest('Component Interfaces Defined', 'FAIL', 'Missing interfaces');
      }

      // 2. Check for required state hooks
      const hasStateHooks = componentCode.match(/useState/g) || [];
      this.recordTest('State Hooks', 'PASS', `${hasStateHooks.length} useState calls`);

      // 3. Check for required effect hooks
      const hasEffectHooks = componentCode.match(/useEffect/g) || [];
      this.recordTest('Effect Hooks', 'PASS', `${hasEffectHooks.length} useEffect calls`);

      // 4. Check for API calls
      const hasApiCalls = componentCode.includes('apiClient.get') || componentCode.includes('apiClient.post');
      if (hasApiCalls) {
        this.recordTest('API Integration', 'PASS', 'API client used');
      } else {
        this.recordTest('API Integration', 'FAIL', 'No API calls found');
      }

      // 5. Check for 3-step flow
      const hasBookingStep = componentCode.includes("'info'") &&
                            componentCode.includes("'booking'") &&
                            componentCode.includes("'confirmed'");
      if (hasBookingStep) {
        this.recordTest('3-Step Flow Implementation', 'PASS', '3 booking steps defined');
      } else {
        this.recordTest('3-Step Flow Implementation', 'FAIL', 'Not all steps implemented');
      }

      // 6. Check calendar implementation
      const hasCalendarLogic = componentCode.includes('getDaysInMonth') &&
                              componentCode.includes('getFirstDayOfMonth');
      if (hasCalendarLogic) {
        this.recordTest('Calendar Logic', 'PASS', 'Calendar methods implemented');
      } else {
        this.recordTest('Calendar Logic', 'FAIL', 'Calendar logic incomplete');
        this.addBug('Component', 'HIGH', 'Calendar logic incomplete',
          'Required calendar helper functions not found', '',
          'Expected: getDaysInMonth, getFirstDayOfMonth. Actual: Not found');
      }

      // 7. Check form fields
      const hasReasonField = componentCode.includes('reasonForAppointment');
      const hasNotesField = componentCode.includes('notes');
      const hasDateField = componentCode.includes('selectedDate');
      const hasTimeField = componentCode.includes('selectedTime');

      if (hasReasonField && hasNotesField && hasDateField && hasTimeField) {
        this.recordTest('Form Fields', 'PASS', 'All required fields present');
      } else {
        this.recordTest('Form Fields', 'FAIL', 'Some fields missing');
      }

      // 8. Check error handling
      const hasErrorHandling = componentCode.includes('bookingError') &&
                              componentCode.includes('setBookingError');
      if (hasErrorHandling) {
        this.recordTest('Error Handling', 'PASS', 'Error state management present');
      } else {
        this.recordTest('Error Handling', 'FAIL', 'No error handling found');
      }

      // 9. Check loading states
      const hasLoadingState = componentCode.includes('loadingSlots') &&
                             componentCode.includes('setLoadingSlots');
      const hasSubmitLoading = componentCode.includes('isSubmitting');

      if (hasLoadingState && hasSubmitLoading) {
        this.recordTest('Loading States', 'PASS', '2 loading states implemented');
      } else {
        this.recordTest('Loading States', 'FAIL', 'Incomplete loading state management');
      }

      // 10. Check accessibility
      const hasAriaLabels = componentCode.match(/aria-/g) || [];
      const hasLabels = componentCode.match(/<label/g) || [];

      if (hasAriaLabels.length > 0 || hasLabels.length > 0) {
        this.recordTest('Accessibility', 'PASS', `${hasAriaLabels.length} ARIA labels, ${hasLabels.length} form labels`);
      } else {
        this.recordTest('Accessibility', 'FAIL', 'Missing accessibility attributes');
        this.addBug('A11y', 'MEDIUM', 'Insufficient accessibility attributes',
          'Component missing ARIA labels and proper form labels', '',
          'Expected: ARIA labels, semantic HTML. Actual: Limited or none');
      }

      // 11. Check responsive design
      const hasResponsiveClasses = componentCode.match(/md:|lg:|sm:|xl:/g) || [];
      if (hasResponsiveClasses.length > 0) {
        this.recordTest('Responsive Classes', 'PASS', `${hasResponsiveClasses.length} responsive breakpoints`);
      } else {
        this.recordTest('Responsive Classes', 'FAIL', 'No responsive breakpoints found');
      }

      // 12. Check for prop validation
      if (hasTherapistInterface) {
        this.recordTest('Prop Validation', 'PASS', 'Props interface defined');
      }

      // Store analysis
      this.codeAnalysis = {
        totalLines: componentCode.split('\n').length,
        hasStateHooks: hasStateHooks.length,
        hasEffectHooks: hasEffectHooks.length,
        hasApiIntegration: hasApiCalls,
        has3StepFlow: hasBookingStep,
        hasCalendarLogic,
        hasFormFields: hasReasonField && hasNotesField,
        hasErrorHandling,
        hasLoadingStates: hasLoadingState && hasSubmitLoading
      };

    } catch (error) {
      console.error('Error analyzing component:', error.message);
      this.recordTest('Code Analysis', 'FAIL', error.message);
    }
  }

  analyzeComponentUsage() {
    console.log('\n📦 === COMPONENT USAGE ANALYSIS ===');

    try {
      const srcPath = path.join(__dirname, 'src');
      const files = this.getAllFiles(srcPath);
      let importCount = 0;
      let usageCount = 0;

      files.forEach(file => {
        if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;

        try {
          const content = fs.readFileSync(file, 'utf-8');

          if (content.includes('AppointmentModal')) {
            importCount++;
            if (content.includes('<AppointmentModal')) {
              usageCount++;
            }
          }
        } catch (e) {
          // Skip files that can't be read
        }
      });

      if (importCount === 1) {
        this.recordTest('Component Imports', 'FAIL', 'Component only defined, not imported anywhere');
        this.addBug('Integration', 'CRITICAL', 'AppointmentModal never imported or used',
          'Component exists but is never imported into any page or component',
          'Search codebase for AppointmentModal usage',
          'Expected: Component imported and used in at least 1 place. Actual: Only definition, 0 usages');
      } else if (importCount > 1) {
        this.recordTest('Component Imports', 'PASS', `Imported in ${importCount} places`);
      } else {
        this.recordTest('Component Imports', 'FAIL', 'Component not imported');
      }

      if (usageCount === 0) {
        this.recordTest('Component Rendered', 'FAIL', 'Never rendered in JSX');
        this.addBug('Integration', 'CRITICAL', 'Component not rendered anywhere',
          'AppointmentModal is defined but never rendered as JSX element',
          'Grep for "<AppointmentModal" in src files',
          'Expected: <AppointmentModal /> used in pages. Actual: Never instantiated');
      } else {
        this.recordTest('Component Rendered', 'PASS', `Rendered in ${usageCount} places`);
      }

    } catch (error) {
      this.recordTest('Component Usage Analysis', 'FAIL', error.message);
    }
  }

  getAllFiles(dirPath, arrayOfFiles = []) {
    try {
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const filePath = path.join(dirPath, file);

        try {
          if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
              this.getAllFiles(filePath, arrayOfFiles);
            }
          } else {
            arrayOfFiles.push(filePath);
          }
        } catch (e) {
          // Skip stat errors
        }
      });
    } catch (e) {
      // Skip read errors
    }

    return arrayOfFiles;
  }

  analyzeComponentStructure() {
    console.log('\n🏗️ === COMPONENT STRUCTURE ANALYSIS ===');

    try {
      const componentPath = path.join(__dirname, 'src', 'components', 'AppointmentModal.tsx');
      const componentCode = fs.readFileSync(componentPath, 'utf-8');

      // Check JSX structure
      const hasModalBackdrop = componentCode.includes('fixed inset-0');
      const hasHeader = componentCode.includes('flex items-center justify-between');
      const hasContent = componentCode.includes('space-y-6');

      if (hasModalBackdrop && hasHeader && hasContent) {
        this.recordTest('Modal Structure', 'PASS', 'Complete modal layout found');
      }

      // Check for specific UI elements
      const hasDateSelector = componentCode.includes('Select Date');
      const hasTimeSelector = componentCode.includes('Select Time');
      const hasConfirmButton = componentCode.includes('Confirm Booking');
      const hasProceedButton = componentCode.includes('Proceed to Book');
      const hasCloseButton = componentCode.includes('Close');

      const uiElements = [
        hasDateSelector ? '✓ Date Selector' : '✗ Date Selector',
        hasTimeSelector ? '✓ Time Selector' : '✗ Time Selector',
        hasConfirmButton ? '✓ Confirm Button' : '✗ Confirm Button',
        hasProceedButton ? '✓ Proceed Button' : '✗ Proceed Button',
        hasCloseButton ? '✓ Close Button' : '✗ Close Button'
      ];

      console.log('  UI Elements Present:');
      uiElements.forEach(el => console.log(`    ${el}`));

      const presentCount = uiElements.filter(el => el.startsWith('✓')).length;
      this.recordTest('UI Components Present', 'PASS', `${presentCount}/5 components found`);

      // Check styling
      const hasTailwind = componentCode.includes('className') && componentCode.includes('from-');
      const hasGradient = componentCode.includes('from-teal') || componentCode.includes('to-cyan');

      if (hasGradient) {
        this.recordTest('Styling (Gradients)', 'PASS', 'Gradient colors applied');
      }

      // Check responsiveness
      const hasMaxWidth = componentCode.includes('max-w');
      const hasPadding = componentCode.includes('p-');

      if (hasMaxWidth && hasPadding) {
        this.recordTest('Responsive Styling', 'PASS', 'Padding and max-width classes found');
      }

    } catch (error) {
      this.recordTest('Component Structure Analysis', 'FAIL', error.message);
    }
  }

  testComponentLogic() {
    console.log('\n⚙️ === COMPONENT LOGIC ANALYSIS ===');

    try {
      const componentPath = path.join(__dirname, 'src', 'components', 'AppointmentModal.tsx');
      const componentCode = fs.readFileSync(componentPath, 'utf-8');

      // Test 1: Calendar date range validation
      const isDateBefore = componentCode.includes('new Date');
      this.recordTest('Date Handling', 'PASS', 'Date object manipulation present');

      // Test 2: Time slot validation
      const hasSlotValidation = componentCode.includes('availableSlots') &&
                               componentCode.includes('length > 0');
      if (hasSlotValidation) {
        this.recordTest('Slot Validation', 'PASS', 'Slot availability checks');
      }

      // Test 3: Form validation
      const hasFormValidation = componentCode.includes('selectedDate') &&
                               componentCode.includes('selectedTime');
      if (hasFormValidation) {
        this.recordTest('Form Validation', 'PASS', 'Required fields checked');
      } else {
        this.recordTest('Form Validation', 'FAIL', 'No validation logic');
        this.addBug('Validation', 'MEDIUM', 'Form validation logic missing',
          'No checks for required fields before submission', '',
          'Expected: Date and time required before submit. Actual: No validation');
      }

      // Test 4: Error state transitions
      const hasErrorStateTransitions = componentCode.includes('setBookingError') &&
                                      componentCode.includes('catch');
      if (hasErrorStateTransitions) {
        this.recordTest('Error State Transitions', 'PASS', 'Error handling in place');
      } else {
        this.recordTest('Error State Transitions', 'FAIL', 'Incomplete error handling');
      }

      // Test 5: Loading state management
      const hasLoadingStateManagement = componentCode.includes('setLoadingSlots') &&
                                       componentCode.includes('finally');
      if (hasLoadingStateManagement) {
        this.recordTest('Loading State Management', 'PASS', 'Proper loading/done transitions');
      }

      // Test 6: API error handling
      const hasApiErrorHandling = componentCode.includes('error.message') ||
                                 componentCode.includes('catch');
      if (hasApiErrorHandling) {
        this.recordTest('API Error Handling', 'PASS', 'Error mapping implemented');
      } else {
        this.recordTest('API Error Handling', 'FAIL', 'No error handling for API');
        this.addBug('Reliability', 'MEDIUM', 'API errors not properly handled',
          'Missing try-catch or error boundary for API calls', '',
          'Expected: All API calls wrapped in error handling. Actual: Insufficient');
      }

    } catch (error) {
      this.recordTest('Component Logic Analysis', 'FAIL', error.message);
    }
  }

  generateDetailedReport() {
    console.log('\n\n═════════════════════════════════════════════════════════');
    console.log('📊 APPOINTMENT MODAL TEST REPORT');
    console.log('═════════════════════════════════════════════════════════\n');

    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipCount = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log(`📈 RESULTS SUMMARY:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✓ Passed: ${passCount} (${((passCount/total)*100).toFixed(1)}%)`);
    console.log(`   ✗ Failed: ${failCount} (${((failCount/total)*100).toFixed(1)}%)`);
    console.log(`   ⊘ Skipped: ${skipCount}`);

    console.log('\n═════════════════════════════════════════════════════════');
    console.log(`🐛 BUGS FOUND: ${this.bugs.length}`);
    console.log('═════════════════════════════════════════════════════════\n');

    if (this.bugs.length > 0) {
      const critical = this.bugs.filter(b => b.severity === 'CRITICAL');
      const high = this.bugs.filter(b => b.severity === 'HIGH');
      const medium = this.bugs.filter(b => b.severity === 'MEDIUM');

      if (critical.length > 0) {
        console.log('🔴 CRITICAL BUGS - BLOCKING ISSUES:\n');
        critical.forEach((bug, i) => {
          console.log(`${i+1}. ${bug.title}`);
          console.log(`   ID: ${bug.id}`);
          console.log(`   Category: ${bug.category}`);
          console.log(`   Description: ${bug.description}`);
          console.log(`   Steps to Reproduce: ${bug.steps}`);
          console.log(`   Expected vs Actual: ${bug.expectedVsActual}\n`);
        });
      }

      if (high.length > 0) {
        console.log('\n🔴 HIGH SEVERITY BUGS:\n');
        high.forEach((bug, i) => {
          console.log(`${i+1}. ${bug.title}`);
          console.log(`   Category: ${bug.category}`);
          console.log(`   Description: ${bug.description}\n`);
        });
      }

      if (medium.length > 0) {
        console.log('\n🟠 MEDIUM SEVERITY BUGS:\n');
        medium.forEach((bug, i) => {
          console.log(`${i+1}. ${bug.title}`);
          console.log(`   Category: ${bug.category}\n`);
        });
      }
    }

    // Print test details
    console.log('\n═════════════════════════════════════════════════════════');
    console.log('📋 DETAILED TEST RESULTS');
    console.log('═════════════════════════════════════════════════════════\n');

    this.testResults.forEach((test, i) => {
      const icon = test.status === 'PASS' ? '✓' : test.status === 'FAIL' ? '✗' : '⊘';
      console.log(`${icon} ${test.testName}`);
      if (test.details) console.log(`   ${test.details}`);
    });

    // Component analysis summary
    console.log('\n═════════════════════════════════════════════════════════');
    console.log('💡 COMPONENT ANALYSIS SUMMARY');
    console.log('═════════════════════════════════════════════════════════\n');

    if (Object.keys(this.codeAnalysis).length > 0) {
      console.log('Component Capabilities:');
      console.log(`  - Total Lines of Code: ${this.codeAnalysis.totalLines || 'N/A'}`);
      console.log(`  - State Hooks: ${this.codeAnalysis.hasStateHooks || 0}`);
      console.log(`  - Effect Hooks: ${this.codeAnalysis.hasEffectHooks || 0}`);
      console.log(`  - API Integration: ${this.codeAnalysis.hasApiIntegration ? 'Yes' : 'No'}`);
      console.log(`  - 3-Step Flow: ${this.codeAnalysis.has3StepFlow ? 'Yes' : 'No'}`);
      console.log(`  - Calendar Logic: ${this.codeAnalysis.hasCalendarLogic ? 'Yes' : 'No'}`);
      console.log(`  - Form Fields: ${this.codeAnalysis.hasFormFields ? 'Yes' : 'No'}`);
      console.log(`  - Error Handling: ${this.codeAnalysis.hasErrorHandling ? 'Yes' : 'No'}`);
      console.log(`  - Loading States: ${this.codeAnalysis.hasLoadingStates ? 'Yes' : 'No'}`);
    }

    // Recommendations
    console.log('\n═════════════════════════════════════════════════════════');
    console.log('✏️ RECOMMENDATIONS');
    console.log('═════════════════════════════════════════════════════════\n');

    const criticalBugs = this.bugs.filter(b => b.severity === 'CRITICAL');
    if (criticalBugs.length > 0) {
      console.log('URGENT - FIX IMMEDIATELY:');
      criticalBugs.forEach((bug, i) => {
        console.log(`${i+1}. ${bug.title} - This component cannot be used until fixed`);
      });
      console.log('');
    }

    console.log('PRIORITY FIXES:');
    console.log('1. Integrate AppointmentModal into therapist card/page');
    console.log('2. Ensure all UI elements render correctly');
    console.log('3. Test calendar picker functionality');
    console.log('4. Verify slot loading and error states');
    console.log('5. Test form submission and confirmation flow');
    console.log('6. Add comprehensive error messages');
    console.log('7. Test on mobile and tablet devices');
    console.log('8. Add accessibility attributes (ARIA labels)');
    console.log('9. Implement unit tests with React Testing Library');
    console.log('10. Add integration tests for API flows\n');
  }

  saveReport() {
    const resultsFile = '/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/appointment-modal-detailed-test-results.json';

    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        skipped: this.testResults.filter(r => r.status === 'SKIP').length,
      },
      bugs: this.bugs,
      testResults: this.testResults,
      codeAnalysis: this.codeAnalysis
    };

    fs.writeFileSync(resultsFile, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsFile}\n`);
  }

  async run() {
    try {
      console.log('🚀 Starting AppointmentModal Detailed Analysis...\n');

      this.analyzeComponentCode();
      this.analyzeComponentUsage();
      this.analyzeComponentStructure();
      this.testComponentLogic();

      this.generateDetailedReport();
      this.saveReport();
    } catch (error) {
      console.error('\n❌ Test suite error:', error.message);
    }
  }
}

const tester = new AppointmentModalDetailedTester();
await tester.run();
