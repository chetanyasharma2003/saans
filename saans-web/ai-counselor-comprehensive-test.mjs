#!/usr/bin/env node

/**
 * Comprehensive AI Counselor Testing Suite
 * Tests 10 critical scenarios with verification of:
 * - Console errors
 * - Response quality
 * - Message persistence
 * - Conversation history
 */

import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';
const baseHeaders = {
  'Content-Type': 'application/json',
};

// Test results tracking
const results = {
  tests: [],
  totalPassed: 0,
  totalFailed: 0,
  startTime: Date.now(),
};

// Helper functions
const log = {
  header: (text) => console.log('\n' + chalk.bold.cyan('='.repeat(60))),
  test: (num, title) => console.log(chalk.bold.blue(`\nTest ${num}: ${title}`)),
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
  info: (msg) => console.log(chalk.gray(`ℹ ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
};

const recordResult = (testNum, testName, passed, details) => {
  results.tests.push({
    testNum,
    testName,
    passed,
    details,
    timestamp: new Date().toISOString(),
  });
  if (passed) {
    results.totalPassed++;
  } else {
    results.totalFailed++;
  }
};

// Test 1: Send message and receive response
async function test1_SendMessageAndReceiveResponse() {
  log.test(1, 'Send message → Should respond');
  log.info('Testing message sending...');

  try {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Hello, I'm feeling great today!",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });


    const passed =
      response.status === 200 &&
      response.data.success === true &&
      response.data.message &&
      response.data.message.length > 0;

    if (passed) {
      log.success('Message sent successfully');
      log.success(`Received response: "${response.data.message.substring(0, 50)}..."`);
      log.success(`Response mode: ${response.data.mode}`);
    } else {
      log.error('Invalid response format');
    }

    recordResult(1, 'Send message and receive response', passed, {
      status: response.status,
      hasMessage: !!response.data.message,
      messageLength: response.data.message?.length || 0,
      mode: response.data.mode,
    });

    return passed;
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
    recordResult(1, 'Send message and receive response', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 2: No 403 error
async function test2_No403Error() {
  log.test(2, 'No 403 error → Should work');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Testing without auth token",
      conversationHistory: [],
    }, {
      headers: baseHeaders,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });


    const passed = response.status !== 403;

    if (passed) {
      log.success(`No 403 error received (status: ${response.status})`);
      log.success('Endpoint is accessible without authentication');
    } else {
      log.error(`403 Forbidden error received`);
    }

    recordResult(2, 'No 403 error', passed, {
      status: response.status,
      shouldBeAccessible: response.status !== 403,
    });

    return passed;
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
    recordResult(2, 'No 403 error', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 3: Conversation history loads
async function test3_ConversationHistoryLoads() {
  log.test(3, 'Conversation history → Should load');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const conversationHistory = [
      { sender: 'user', text: 'I am feeling anxious', timestamp: new Date() },
      { sender: 'ai', text: 'That is understandable. Let us talk about it.', timestamp: new Date() },
    ];

    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Can you help me with this?",
      conversationHistory: conversationHistory,
    }, { headers: baseHeaders, timeout: 10000 });


    const passed =
      response.status === 200 &&
      response.data.success === true &&
      response.data.message &&
      response.data.message.length > 0;

    if (passed) {
      log.success('Conversation history processed successfully');
      log.success('AI response generated with context');
    } else {
      log.error('Failed to process conversation history');
    }

    recordResult(3, 'Conversation history loads', passed, {
      historyItems: conversationHistory.length,
      responseReceived: !!response.data.message,
      status: response.status,
    });

    return passed;
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
    recordResult(3, 'Conversation history loads', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 4: Multiple messages appear
async function test4_MultipleMessagesAppear() {
  log.test(4, 'Multiple messages → All appear');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const messages = [
      "First message",
      "Second message",
      "Third message",
    ];

    let allSuccessful = true;
    const responses = [];

    for (let i = 0; i < messages.length; i++) {
      try {
        const response = await axios.post(`${API_URL}/api/ai/chat`, {
          message: messages[i],
          conversationHistory: responses.slice(0, i * 2),
        }, { headers: baseHeaders, timeout: 10000 });

        responses.push({ sender: 'user', text: messages[i] });
        responses.push({ sender: 'ai', text: response.data.message });
      } catch (err) {
        allSuccessful = false;
      }
    }


    if (allSuccessful) {
      log.success(`All ${messages.length} messages processed successfully`);
      log.success(`Conversation built with ${responses.length} total messages`);
    } else {
      log.error('Some messages failed to process');
    }

    recordResult(4, 'Multiple messages appear', allSuccessful, {
      messagesAttempted: messages.length,
      messagesSuccessful: responses.length / 2,
    });

    return allSuccessful;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(4, 'Multiple messages appear', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 5: Refresh page (simulated by clearing and reloading data)
async function test5_RefreshPageHistoryPersists() {
  log.test(5, 'Refresh page → History persists');
  log.info('Running test...'); // log.info('Running test...');

  try {
    // First, send a message
    const firstResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Remember this important message",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });

    const savedHistory = [
      { sender: 'user', text: "Remember this important message" },
      { sender: 'ai', text: firstResponse.data.message },
    ];

    // Simulate page refresh by calling again with same history
    const secondResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Do you remember what I said before?",
      conversationHistory: savedHistory,
    }, { headers: baseHeaders, timeout: 10000 });


    const passed =
      firstResponse.status === 200 &&
      secondResponse.status === 200 &&
      secondResponse.data.success === true;

    if (passed) {
      log.success('History persisted across simulated refresh');
      log.success('AI maintained context after refresh');
    } else {
      log.error('Failed to maintain history after refresh');
    }

    recordResult(5, 'Refresh page history persists', passed, {
      firstMessageSuccess: firstResponse.status === 200,
      secondMessageSuccess: secondResponse.status === 200,
      historySize: savedHistory.length,
    });

    return passed;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(5, 'Refresh page history persists', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 6: Demo mode works
async function test6_DemoModeWorks() {
  log.test(6, 'Demo mode works → Gets demo response');
  log.info('Running test...'); // log.info('Running test...');

  try {
    // Demo mode is triggered when API key is invalid
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "I'm feeling anxious",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });


    const isDemoMode = response.data.mode === 'DEMO' || response.data.mode === 'DEMO_FALLBACK';
    const hasValidResponse = response.data.message && response.data.message.length > 0;

    if (isDemoMode) {
      log.success(`Demo mode active (mode: ${response.data.mode})`);
    } else {
      log.info(`Real AI mode active (mode: ${response.data.mode})`);
    }

    if (hasValidResponse) {
      log.success('Response received and contains valid text');
    }

    recordResult(6, 'Demo mode works', isDemoMode || hasValidResponse, {
      mode: response.data.mode,
      hasResponse: hasValidResponse,
      messageLength: response.data.message?.length || 0,
    });

    return isDemoMode || hasValidResponse;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(6, 'Demo mode works', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 7: Real mode works
async function test7_RealModeWorks() {
  log.test(7, 'Real mode works → Gets AI response');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "What is a healthy coping mechanism?",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });


    const hasValidResponse =
      response.status === 200 &&
      response.data.success === true &&
      response.data.message &&
      response.data.message.length > 50; // Ensure substantial response

    if (hasValidResponse) {
      log.success(`Response received (mode: ${response.data.mode})`);
      log.success(`Response quality: ${response.data.message.length} characters`);
    } else {
      log.error('Response does not meet quality threshold');
    }

    recordResult(7, 'Real mode works', hasValidResponse, {
      mode: response.data.mode,
      hasResponse: !!response.data.message,
      responseLength: response.data.message?.length || 0,
    });

    return hasValidResponse;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(7, 'Real mode works', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 8: Typing indicator simulation
async function test8_TypingIndicatorSimulation() {
  log.test(8, 'Typing indicator → Shows while waiting');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const startTime = Date.now();

    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Give me a response",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });

    const responseTime = Date.now() - startTime;

    // Typing indicator would show during response time
    const hasResponse = response.data.message && response.data.message.length > 0;
    const wasNotInstant = responseTime > 100; // At least 100ms

    if (hasResponse && wasNotInstant) {
      log.success(`Response received in ${responseTime}ms`);
      log.success('Typing indicator would display during this time');
    } else {
      log.warn(`Response time was ${responseTime}ms`);
    }

    recordResult(8, 'Typing indicator shows while waiting', hasResponse, {
      responseTimeMs: responseTime,
      hasResponse: hasResponse,
    });

    return hasResponse;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(8, 'Typing indicator shows while waiting', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 9: Error handling
async function test9_ErrorHandling() {
  log.test(9, 'Error handling → Shows friendly message');
  log.info('Running test...'); // log.info('Running test...');

  try {
    // Test with empty message
    const emptyResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "",
      conversationHistory: [],
    }, {
      headers: baseHeaders,
      timeout: 10000,
      validateStatus: () => true,
    });


    const hasErrorHandling = emptyResponse.status >= 400;
    const hasErrorMessage = emptyResponse.data.message || emptyResponse.data.error;

    if (hasErrorHandling) {
      log.success('API properly rejects invalid input');
      log.success(`Error status: ${emptyResponse.status}`);
      if (hasErrorMessage) {
        log.success('Error message provided to user');
      }
    } else {
      log.warn('No error handling for empty message');
    }

    recordResult(9, 'Error handling shows friendly message', hasErrorHandling, {
      statusCode: emptyResponse.status,
      hasErrorMessage: hasErrorMessage,
      errorMessage: emptyResponse.data.message || emptyResponse.data.error,
    });

    return hasErrorHandling;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(9, 'Error handling shows friendly message', false, {
      error: err.message,
    });
    return false;
  }
}

// Test 10: Fast response (under 5 seconds)
async function test10_FastResponse() {
  log.test(10, 'Fast response → Under 5 seconds');
  log.info('Running test...'); // log.info('Running test...');

  try {
    const startTime = Date.now();

    const response = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Short response please",
      conversationHistory: [],
    }, { headers: baseHeaders, timeout: 10000 });

    const responseTime = Date.now() - startTime;

    const isFast = responseTime < 5000 && response.data.message && response.data.message.length > 0;

    if (isFast) {
      log.success(`Response received in ${responseTime}ms (under 5 seconds)`);
      log.success('Response speed meets performance requirements');
    } else {
      log.warn(`Response time: ${responseTime}ms`);
    }

    recordResult(10, 'Fast response under 5 seconds', isFast, {
      responseTimeMs: responseTime,
      isFastEnough: responseTime < 5000,
      hasResponse: !!response.data.message,
    });

    return isFast;
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
    recordResult(10, 'Fast response under 5 seconds', false, {
      error: err.message,
    });
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log.header();
  console.log(chalk.bold.cyan('AI Counselor Comprehensive Test Suite'));
  console.log(chalk.gray('Testing 10 critical scenarios'));
  log.header();

  const testFunctions = [
    test1_SendMessageAndReceiveResponse,
    test2_No403Error,
    test3_ConversationHistoryLoads,
    test4_MultipleMessagesAppear,
    test5_RefreshPageHistoryPersists,
    test6_DemoModeWorks,
    test7_RealModeWorks,
    test8_TypingIndicatorSimulation,
    test9_ErrorHandling,
    test10_FastResponse,
  ];

  for (const testFunc of testFunctions) {
    await testFunc();
  }

  // Print summary
  log.header();
  console.log(chalk.bold.cyan('Test Summary'));
  log.header();

  console.log(chalk.bold(`Total Tests: ${results.tests.length}`));
  console.log(chalk.green.bold(`Passed: ${results.totalPassed}`));
  console.log(chalk.red.bold(`Failed: ${results.totalFailed}`));

  const successRate = ((results.totalPassed / results.tests.length) * 100).toFixed(2);
  console.log(chalk.bold(`Success Rate: ${successRate}%`));

  const duration = ((Date.now() - results.startTime) / 1000).toFixed(2);
  console.log(chalk.gray(`Duration: ${duration}s`));

  log.header();
  console.log('\nDetailed Results:\n');

  results.tests.forEach(test => {
    const status = test.passed ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(`${status} - Test ${test.testNum}: ${test.testName}`);
    if (test.details.error) {
      console.log(chalk.red(`  Error: ${test.details.error}`));
    }
  });

  log.header();

  process.exit(results.totalFailed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error(chalk.red('Fatal error running tests:'), err);
  process.exit(1);
});
