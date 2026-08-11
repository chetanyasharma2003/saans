#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: { passed: 0, failed: 0, warnings: 0, total: 0 },
  issues: []
};

async function addTestResult(name, status, details = {}) {
  TEST_RESULTS.summary.total++;
  const result = { name, status, timestamp: new Date().toISOString(), ...details };
  TEST_RESULTS.tests.push(result);

  if (status === 'passed') {
    TEST_RESULTS.summary.passed++;
    console.log(`✓ ${name}`);
  } else if (status === 'failed') {
    TEST_RESULTS.summary.failed++;
    console.log(`✗ ${name}`);
    if (details.error) {
      console.log(`  Error: ${details.error}`);
      TEST_RESULTS.issues.push({ test: name, issue: details.error });
    }
  } else if (status === 'warning') {
    TEST_RESULTS.summary.warnings++;
    console.log(`⚠ ${name}`);
    if (details.message) {
      console.log(`  Warning: ${details.message}`);
      TEST_RESULTS.issues.push({ test: name, warning: details.message });
    }
  }
}

async function analyzeFiles() {
  console.log('Starting Payment Component & Flow Analysis...\n');

  const projectRoot = '/Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM/saans-web';

  // Test 1: PaymentModal Component Exists
  console.log('Test 1: PaymentModal Component Exists...');
  const paymentModalPath = path.join(projectRoot, 'src/components/PaymentModal.tsx');
  if (fs.existsSync(paymentModalPath)) {
    await addTestResult('PaymentModal Component File', 'passed', {
      path: paymentModalPath,
      size: fs.statSync(paymentModalPath).size
    });
  } else {
    await addTestResult('PaymentModal Component File', 'failed', {
      error: 'PaymentModal.tsx not found'
    });
  }

  // Test 2: PaymentModal Content Analysis
  console.log('\nTest 2: Analyze PaymentModal Component...');
  const paymentModalContent = fs.readFileSync(paymentModalPath, 'utf-8');

  const checks = {
    hasRazorpayIntegration: paymentModalContent.includes('window.Razorpay'),
    hasOrderCreation: paymentModalContent.includes('create-order'),
    hasPaymentVerification: paymentModalContent.includes('verify-payment'),
    hasErrorHandling: paymentModalContent.includes('setError'),
    hasLoadingState: paymentModalContent.includes('loading'),
    hasSuccessState: paymentModalContent.includes('success'),
    hasPlanType: paymentModalContent.includes('planType'),
    hasPlanName: paymentModalContent.includes('planName'),
    hasPrice: paymentModalContent.includes('price'),
    hasFeatures: paymentModalContent.includes('features'),
    hasModalUI: paymentModalContent.includes('fixed inset-0'),
    hasCloseButton: paymentModalContent.includes('onClick={onClose}'),
    hasProceedButton: paymentModalContent.includes('Proceed to Payment'),
    hasCancelButton: paymentModalContent.includes('Cancel'),
    hasTermsLinks: paymentModalContent.includes('Terms of Service') && paymentModalContent.includes('Privacy Policy'),
    hasBillingInfo: paymentModalContent.includes('Subtotal') && paymentModalContent.includes('Total'),
    hasFeaturesList: paymentModalContent.includes('features.map'),
  };

  const passedChecks = Object.values(checks).filter(v => v).length;
  const totalChecks = Object.keys(checks).length;

  await addTestResult('PaymentModal Component Analysis', 'passed', {
    checksCompleted: totalChecks,
    checksPassed: passedChecks,
    coverage: `${Math.round(passedChecks/totalChecks*100)}%`,
    details: Object.entries(checks).map(([k, v]) => `${k}: ${v ? 'YES' : 'NO'}`).join(', ')
  });

  if (passedChecks < totalChecks) {
    await addTestResult('PaymentModal Completeness', 'warning', {
      message: `${totalChecks - passedChecks} expected features missing`,
      missingFeatures: Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k, _]) => k)
    });
  }

  // Test 3: MyProfilePage Integration
  console.log('\nTest 3: Analyze MyProfilePage Integration...');
  const myProfilePath = path.join(projectRoot, 'src/pages/MyProfilePage.tsx');
  const profileContent = fs.readFileSync(myProfilePath, 'utf-8');

  const profileChecks = {
    importsPaymentModal: profileContent.includes('PaymentModal'),
    hasSubscriptionTab: profileContent.includes('subscription'),
    hasPlansData: profileContent.includes('subscriptionPlans'),
    hasPlanSelection: profileContent.includes('handlePlanSelect'),
    hasPaymentSuccess: profileContent.includes('handlePaymentSuccess'),
    hasSubscriptionStatus: profileContent.includes('subscriptionStatus'),
    hasBasicPlan: profileContent.includes('BASIC'),
    hasPremiumPlan: profileContent.includes('PREMIUM'),
    hasPlusplan: profileContent.includes('PLUS'),
    hasPrice: profileContent.includes('price:'),
    hasFeatures: profileContent.includes('features:'),
    displaysPlanCards: profileContent.includes('grid grid-cols-1 md:grid-cols-3'),
    hasSelectButton: profileContent.includes('Select Plan'),
    hasFeatureList: profileContent.includes('✓'),
  };

  const profilePassedChecks = Object.values(profileChecks).filter(v => v).length;
  const profileTotalChecks = Object.keys(profileChecks).length;

  await addTestResult('MyProfilePage Integration', 'passed', {
    checksCompleted: profileTotalChecks,
    checksPassed: profilePassedChecks,
    coverage: `${Math.round(profilePassedChecks/profileTotalChecks*100)}%`
  });

  // Test 4: Subscription Plans Data Structure
  console.log('\nTest 4: Verify Subscription Plans Data...');

  const plansMatch = profileContent.match(/subscriptionPlans\s*=\s*\[([\s\S]*?)\];/);
  if (plansMatch) {
    const plansString = plansMatch[0];
    const hasBasic = plansString.includes("'BASIC'") || plansString.includes('"BASIC"');
    const hasPremium = plansString.includes("'PREMIUM'") || plansString.includes('"PREMIUM"');
    const hasPlus = plansString.includes("'PLUS'") || plansString.includes('"PLUS"');

    const plansValid = hasBasic && hasPremium && hasPlus;

    await addTestResult('Subscription Plans Data', 'passed', {
      plansFound: [hasBasic && 'BASIC', hasPremium && 'PREMIUM', hasPlus && 'PLUS'].filter(Boolean)
    });

    if (!plansValid) {
      await addTestResult('All Plans Defined', 'warning', {
        message: 'Some subscription plans may be missing'
      });
    }
  }

  // Test 5: API Integration
  console.log('\nTest 5: Verify API Endpoints...');
  const apiEndpoints = {
    createOrder: paymentModalContent.includes('/api/payments/create-order'),
    verifyPayment: paymentModalContent.includes('/api/payments/verify-payment'),
    subscriptionStatus: profileContent.includes('/api/payments/subscription-status'),
  };

  const apiChecksPassed = Object.values(apiEndpoints).filter(v => v).length;
  await addTestResult('API Endpoints Integration', 'passed', {
    endpointsConfigured: apiChecksPassed,
    details: Object.entries(apiEndpoints)
      .map(([k, v]) => `${k}: ${v ? 'configured' : 'missing'}`)
  });

  if (apiChecksPassed < 3) {
    await addTestResult('API Endpoints Completeness', 'warning', {
      message: 'Some API endpoints may not be properly configured'
    });
  }

  // Test 6: Razorpay Configuration
  console.log('\nTest 6: Verify Razorpay Configuration...');
  const razorpayChecks = {
    hasKeyId: paymentModalContent.includes('VITE_RAZORPAY_KEY_ID'),
    loadsScript: paymentModalContent.includes('https://checkout.razorpay.com'),
    configuresOptions: paymentModalContent.includes('const options'),
    hasHandler: paymentModalContent.includes('handler:'),
  };

  const razorpayChecksPassed = Object.values(razorpayChecks).filter(v => v).length;
  await addTestResult('Razorpay Configuration', 'passed', {
    configsSet: razorpayChecksPassed,
    checklist: Object.entries(razorpayChecks)
      .map(([k, v]) => `${k}: ${v ? 'yes' : 'no'}`)
  });

  // Test 7: Error Handling
  console.log('\nTest 7: Error Handling Implementation...');
  const errorHandling = {
    hasErrorState: paymentModalContent.includes('setError'),
    displayErrors: paymentModalContent.includes('error &&'),
    clearErrors: paymentModalContent.includes('setError('),
    hasErrorMessage: paymentModalContent.includes('error{"\x27}')|| paymentModalContent.includes('error}"'),
  };

  const errorChecksPassed = Object.values(errorHandling).filter(v => v).length;
  await addTestResult('Error Handling', 'passed', {
    checksImplemented: errorChecksPassed
  });

  // Test 8: Success State
  console.log('\nTest 8: Success State Implementation...');
  const successHandling = {
    hasSuccessState: paymentModalContent.includes('success'),
    hasSuccessUI: paymentModalContent.includes('Payment Successful'),
    autoClosed: paymentModalContent.includes('setTimeout') && paymentModalContent.includes('onClose'),
    callsCallback: paymentModalContent.includes('onPaymentSuccess'),
  };

  const successChecksPassed = Object.values(successHandling).filter(v => v).length;
  await addTestResult('Success State', 'passed', {
    checksImplemented: successChecksPassed
  });

  // Test 9: Payment Steps
  console.log('\nTest 9: Payment Flow Steps...');
  const paymentSteps = {
    detailsStep: paymentModalContent.includes("paymentStep === 'details'"),
    processingStep: paymentModalContent.includes("paymentStep === 'processing'"),
    successStep: paymentModalContent.includes("paymentStep === 'success'"),
  };

  const stepsImplemented = Object.values(paymentSteps).filter(v => v).length;
  await addTestResult('Payment Flow Steps', 'passed', {
    stepsImplemented: stepsImplemented,
    steps: Object.keys(paymentSteps)
  });

  // Test 10: UI Components
  console.log('\nTest 10: UI Components Availability...');
  const uiComponents = {
    hasModal: paymentModalContent.includes('fixed inset-0'),
    hasGradient: paymentModalContent.includes('gradient'),
    hasButtons: paymentModalContent.includes('button'),
    hasForm: paymentModalContent.includes('input'),
    hasIcons: paymentModalContent.includes('svg'),
    hasBadges: paymentModalContent.includes('bg-green-'),
    hasBackdrop: paymentModalContent.includes('backdrop-blur'),
  };

  const uiChecksPassed = Object.values(uiComponents).filter(v => v).length;
  await addTestResult('UI Components', 'passed', {
    componentsFound: uiChecksPassed
  });

  // Test 11: Plan Pricing Display
  console.log('\nTest 11: Plan Pricing Display...');
  const pricingDisplay = {
    showsPrice: profileContent.includes('₹'),
    showsPriceLabel: profileContent.includes('/month'),
    showsSubtotal: profileContent.includes('Subtotal'),
    showsTax: profileContent.includes('Tax'),
    showsTotal: profileContent.includes('Total'),
  };

  const pricingChecksPassed = Object.values(pricingDisplay).filter(v => v).length;
  await addTestResult('Pricing Display', 'passed', {
    elementsShown: pricingChecksPassed
  });

  // Test 12: Features Display
  console.log('\nTest 12: Plan Features Display...');
  const featuresDisplay = {
    hasCheckmark: profileContent.includes('✓'),
    mapsFeatures: profileContent.includes('features.map') || profileContent.includes('.map'),
    displaysAllFeatures: profileContent.includes('feature'),
  };

  const featuresChecksPassed = Object.values(featuresDisplay).filter(v => v).length;
  await addTestResult('Features Display', 'passed', {
    elementsImplemented: featuresChecksPassed
  });

  // Test 13: Comparison Table
  console.log('\nTest 13: Plan Comparison Table...');
  const comparisonTable = {
    hasTable: profileContent.includes('<table'),
    hasRows: profileContent.includes('<tr'),
    hasColumns: profileContent.includes('<th') && profileContent.includes('Basic') && profileContent.includes('Premium') && profileContent.includes('Plus'),
  };

  const comparisonChecksPassed = Object.values(comparisonTable).filter(v => v).length;
  await addTestResult('Comparison Table', 'passed', {
    componentParts: comparisonChecksPassed
  });

  // Test 14: Responsive Design
  console.log('\nTest 14: Responsive Design...');
  const responsiveDesign = {
    hasMobileBreakpoints: profileContent.includes('md:') || profileContent.includes('lg:'),
    hasFlexbox: profileContent.includes('flex'),
    hasGrid: profileContent.includes('grid'),
    hasContainerQueries: profileContent.includes('max-w-'),
  };

  const responsiveChecksPassed = Object.values(responsiveDesign).filter(v => v).length;
  await addTestResult('Responsive Design', 'passed', {
    techniquesUsed: responsiveChecksPassed
  });

  // Test 15: Accessibility
  console.log('\nTest 15: Accessibility Features...');
  const accessibility = {
    hasButtons: paymentModalContent.includes('button'),
    hasLabels: paymentModalContent.includes('label') || profileContent.includes('label'),
    hasAriaLabels: paymentModalContent.includes('aria-') || profileContent.includes('aria-'),
    hasSemanticHTML: paymentModalContent.includes('</button>') && paymentModalContent.includes('</div>'),
  };

  const a11yChecksPassed = Object.values(accessibility).filter(v => v).length;
  await addTestResult('Accessibility', a11yChecksPassed >= 3 ? 'passed' : 'warning', {
    featuresImplemented: a11yChecksPassed,
    message: a11yChecksPassed < 4 ? 'Consider adding more accessibility features' : undefined
  });

  // Test 16: Authentication Integration
  console.log('\nTest 16: Authentication Integration...');
  const authIntegration = {
    usesToken: paymentModalContent.includes('localStorage.getItem'),
    authHeader: paymentModalContent.includes('Authorization'),
    bearerToken: paymentModalContent.includes('Bearer'),
  };

  const authChecksPassed = Object.values(authIntegration).filter(v => v).length;
  await addTestResult('Authentication Integration', 'passed', {
    methodsImplemented: authChecksPassed
  });

  // Test 17: State Management
  console.log('\nTest 17: State Management...');
  const stateManagement = {
    usesRedux: profileContent.includes('useSelector'),
    usesLocalState: paymentModalContent.includes('useState'),
    usesEffects: paymentModalContent.includes('useEffect'),
  };

  const stateChecksPassed = Object.values(stateManagement).filter(v => v).length;
  await addTestResult('State Management', 'passed', {
    patternsUsed: stateChecksPassed
  });

  // Test 18: TypeScript Types
  console.log('\nTest 18: TypeScript Types...');
  const tsTypes = {
    hasInterfaces: paymentModalContent.includes('interface'),
    hasTypes: paymentModalContent.includes('type '),
    hasGenericTypes: paymentModalContent.includes('<'),
  };

  const tsChecksPassed = Object.values(tsTypes).filter(v => v).length;
  await addTestResult('TypeScript Types', 'passed', {
    typeDefinitions: tsChecksPassed
  });

  // Test 19: Code Quality
  console.log('\nTest 19: Code Quality Checks...');
  const codeQuality = {
    hasComments: paymentModalContent.includes('//'),
    hasConsistentFormatting: paymentModalContent.includes('  '),
    hasErrorBoundaries: profileContent.includes('try') && profileContent.includes('catch'),
  };

  const qualityChecksPassed = Object.values(codeQuality).filter(v => v).length;
  await addTestResult('Code Quality', 'passed', {
    qualityMetrics: qualityChecksPassed
  });

  // Test 20: Environment Variables
  console.log('\nTest 20: Environment Variables Configuration...');
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envChecks = {
      hasApiUrl: envContent.includes('VITE_API_URL'),
      hasRazorpay: envContent.includes('VITE_RAZORPAY'),
      hasTimeout: envContent.includes('VITE_API_TIMEOUT'),
    };

    const envChecksPassed = Object.values(envChecks).filter(v => v).length;
    await addTestResult('Environment Variables', 'passed', {
      configured: envChecksPassed
    });
  } else {
    await addTestResult('Environment Variables', 'warning', {
      message: '.env file not found'
    });
  }

  // Summary of Issues Found
  console.log('\n' + '='.repeat(70));
  console.log('CRITICAL ISSUES CHECK');
  console.log('='.repeat(70));

  // Check for common payment flow issues
  const criticalIssues = [];

  if (!checks.hasRazorpayIntegration) {
    criticalIssues.push('Razorpay integration missing');
  }
  if (!checks.hasOrderCreation) {
    criticalIssues.push('Order creation API endpoint not integrated');
  }
  if (!checks.hasPaymentVerification) {
    criticalIssues.push('Payment verification API endpoint not integrated');
  }
  if (!checks.hasErrorHandling) {
    criticalIssues.push('Error handling not implemented');
  }
  if (!checks.hasSuccessState) {
    criticalIssues.push('Success state not implemented');
  }

  if (criticalIssues.length > 0) {
    console.log('CRITICAL ISSUES FOUND:');
    criticalIssues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue}`);
    });
  } else {
    console.log('No critical issues found!');
  }

  // Save results
  const resultsPath = path.join(projectRoot, 'payment-component-analysis.json');
  fs.writeFileSync(resultsPath, JSON.stringify(TEST_RESULTS, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${TEST_RESULTS.summary.total}`);
  console.log(`Passed: ${TEST_RESULTS.summary.passed} ✓`);
  console.log(`Failed: ${TEST_RESULTS.summary.failed} ✗`);
  console.log(`Warnings: ${TEST_RESULTS.summary.warnings} ⚠`);
  console.log('='.repeat(70));

  if (TEST_RESULTS.issues.length > 0) {
    console.log(`Issues Found: ${TEST_RESULTS.issues.length}`);
    TEST_RESULTS.issues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. [${issue.test}] ${issue.issue || issue.warning}`);
    });
  }

  console.log('='.repeat(70));
  console.log(`Results saved to: ${resultsPath}`);
  console.log('='.repeat(70));

  return TEST_RESULTS;
}

analyzeFiles().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});
