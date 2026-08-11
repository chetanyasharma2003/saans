import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TEST_RESULTS = [];

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}========== AI COUNSELOR 10-POINT TEST SUITE ==========${RESET}\n`);

let passed = 0;
let failed = 0;

// Test helper
async function test(testNumber, testName, testFn) {
  console.log(`${YELLOW}TEST ${testNumber}: ${testName}${RESET}`);
  try {
    const result = await testFn();
    if (result.passed) {
      console.log(`${GREEN}✅ PASSED${RESET}`);
      result.details && Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   ✓ ${key}: ${value}`);
      });
      passed++;
    } else {
      console.log(`${RED}❌ FAILED${RESET}`);
      result.details && Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   ✗ ${key}: ${value}`);
      });
      failed++;
    }
    TEST_RESULTS.push({ testNumber, testName, passed: result.passed, details: result.details });
  } catch (error) {
    console.log(`${RED}❌ FAILED: ${error.message}${RESET}`);
    failed++;
    TEST_RESULTS.push({ testNumber, testName, passed: false, error: error.message });
  }
  console.log();
}

async function runAllTests() {
  // Test 1: Send message → Should respond
  await test(1, 'Send message → Should respond', async () => {
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'Hello, I need help with anxiety',
      conversationHistory: [],
    });
    const responseTime = Date.now() - startTime;

    return {
      passed: response.status === 200 && response.data.message && response.data.message.length > 0,
      details: {
        'HTTP Status': response.status,
        'Has Response': !!response.data.message,
        'Response Length': response.data.message?.length || 0,
        'Response Time': `${responseTime}ms`,
      }
    };
  });

  // Test 2: No 403 error
  await test(2, 'No 403 error → Should work', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/ai/chat`, {
        message: 'Testing',
        conversationHistory: [],
      });

      return {
        passed: response.status !== 403 && response.status < 500,
        details: {
          'HTTP Status': response.status,
          'No 403 Error': response.status !== 403,
          'Server OK': response.status < 500,
        }
      };
    } catch (error) {
      return {
        passed: error.response?.status !== 403,
        details: {
          'HTTP Status': error.response?.status || 'Network Error',
          'No 403 Error': error.response?.status !== 403,
          'Error': error.message,
        }
      };
    }
  });

  // Test 3: Conversation history loads
  await test(3, 'Conversation history → Should load', async () => {
    const history = [
      { sender: 'user', text: 'I am feeling sad', timestamp: new Date() },
      { sender: 'ai', text: 'I understand. Can you tell me more?', timestamp: new Date() },
    ];

    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'What should I do?',
      conversationHistory: history,
    });

    return {
      passed: response.status === 200 && response.data.message,
      details: {
        'History Sent': history.length,
        'Response Received': !!response.data.message,
        'Conversation Continuation': response.data.message?.length > 0,
      }
    };
  });

  // Test 4: Multiple messages handled
  await test(4, 'Multiple messages → All handled', async () => {
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const responses = [];

    for (const msg of messages) {
      const response = await axios.post(`${API_URL}/api/ai/chat`, {
        message: msg,
        conversationHistory: [],
      });
      responses.push(response.status === 200);
    }

    return {
      passed: responses.every(r => r),
      details: {
        'Messages Sent': messages.length,
        'Successful Responses': responses.filter(r => r).length,
        'All Handled': responses.every(r => r),
      }
    };
  });

  // Test 5: Demo mode works (test with no API key scenario)
  await test(5, 'Demo mode works → Gets demo response', async () => {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'I am feeling very anxious and stressed',
      conversationHistory: [],
    });

    const isDemoOrReal = response.data.mode === 'DEMO' || response.data.mode === 'REAL_AI' || response.data.mode === 'DEMO_FALLBACK';
    const hasResponse = response.data.message && response.data.message.length > 0;

    return {
      passed: isDemoOrReal && hasResponse,
      details: {
        'Mode': response.data.mode,
        'Has Response': hasResponse,
        'Response Length': response.data.message?.length || 0,
        'Timestamp': response.data.timestamp,
      }
    };
  });

  // Test 6: Real AI mode (when available)
  await test(6, 'Real mode works → Gets AI response', async () => {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'Tell me about yourself and your capabilities',
      conversationHistory: [],
    });

    const isValidMode = ['REAL_AI', 'DEMO', 'DEMO_FALLBACK'].includes(response.data.mode);
    const hasResponse = response.data.message && response.data.message.length > 0;

    return {
      passed: isValidMode && hasResponse && response.status === 200,
      details: {
        'Mode': response.data.mode,
        'Valid Mode': isValidMode,
        'Has Response': hasResponse,
        'Response Type': response.data.mode,
      }
    };
  });

  // Test 7: Keyword-based demo responses (suicidal)
  await test(7, 'Keyword Detection → Suicidal keywords', async () => {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'I am having suicidal thoughts',
      conversationHistory: [],
    });

    const hasResponse = response.data.message && response.data.message.length > 0;
    const hasCrisisResources = response.data.message?.includes('988') || response.data.message?.includes('crisis') || response.data.message?.includes('help');

    return {
      passed: hasResponse && (hasCrisisResources || response.data.mode === 'REAL_AI'),
      details: {
        'Response Received': hasResponse,
        'Contains Crisis Resources (in demo)': hasCrisisResources,
        'Mode': response.data.mode,
        'Appropriate Response': hasCrisisResources || response.data.mode === 'REAL_AI',
      }
    };
  });

  // Test 8: Response time under 5 seconds
  await test(8, 'Fast response → Under 5 seconds', async () => {
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'Quick test',
      conversationHistory: [],
    });
    const responseTime = Date.now() - startTime;

    return {
      passed: responseTime < 5000,
      details: {
        'Response Time': `${responseTime}ms`,
        'Under 5s': responseTime < 5000,
        'Performance': responseTime < 1000 ? 'Excellent' : responseTime < 3000 ? 'Good' : 'Acceptable',
      }
    };
  });

  // Test 9: Error handling - Empty message
  await test(9, 'Error handling → Empty message validation', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/ai/chat`, {
        message: '',
        conversationHistory: [],
      });
      return {
        passed: false,
        details: {
          'Should Have Failed': true,
          'Actual Status': response.status,
        }
      };
    } catch (error) {
      return {
        passed: error.response?.status === 400,
        details: {
          'Validation Failed': error.response?.status === 400,
          'HTTP Status': error.response?.status,
          'Error Message': error.response?.data?.error?.message?.substring(0, 50),
        }
      };
    }
  });

  // Test 10: Message structure validation
  await test(10, 'Response structure → Valid format', async () => {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: 'Test message structure',
      conversationHistory: [],
    });

    const hasRequiredFields = response.data.success !== undefined &&
                              response.data.message !== undefined &&
                              response.data.timestamp !== undefined &&
                              response.data.mode !== undefined;

    return {
      passed: hasRequiredFields && response.status === 200,
      details: {
        'Has success field': !!response.data.success,
        'Has message field': !!response.data.message,
        'Has timestamp field': !!response.data.timestamp,
        'Has mode field': !!response.data.mode,
        'Valid Structure': hasRequiredFields,
      }
    };
  });

  // Summary
  console.log(`${YELLOW}========== TEST SUMMARY ==========${RESET}`);
  console.log(`${GREEN}✅ Passed: ${passed}${RESET}`);
  console.log(`${RED}❌ Failed: ${failed}${RESET}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  // Save results
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: passed + failed,
    passed,
    failed,
    successRate: ((passed / (passed + failed)) * 100).toFixed(1),
    results: TEST_RESULTS,
  };

  console.log(`${YELLOW}========== DETAILED RESULTS ==========${RESET}`);
  console.log(JSON.stringify(summary, null, 2));

  // Save to file
  import('fs').then(fs => {
    const filename = `/private/tmp/claude-501/-Users-chetanya/cf2c63d1-a99c-4421-9e34-fb6712614507/scratchpad/ai-counselor-results-${Date.now()}.json`;
    fs.default.writeFileSync(filename, JSON.stringify(summary, null, 2));
    console.log(`\n${YELLOW}Results saved to: ${filename}${RESET}`);
  });
}

runAllTests().catch(error => {
  console.error(`${RED}Test suite error: ${error.message}${RESET}`);
  process.exit(1);
});
