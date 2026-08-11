# Rate Limiting - Testing Guide

## Quick Test Commands

### 1. Login Rate Limiting Test (5 per minute per IP)

```bash
# Test script to make 6 login requests
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email":"test@example.com","password":"password"}' \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.'
  echo "---"
  sleep 1
done
```

**Expected Results:**
- Requests 1-5: 401 (authentication error - not rate limited)
- Request 6: 429 (rate limited)
- Header: `Retry-After: 30` (or similar backoff time)

### 2. Registration Rate Limiting Test (3 per hour per IP)

```bash
# Make 4 registration requests
for i in {1..4}; do
  echo "Registration Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.2.100" \
    -d "{
      \"email\":\"user$i@example.com\",
      \"password\":\"SecurePass123\",
      \"name\":\"User $i\"
    }" \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.'
  echo "---"
done
```

**Expected Results:**
- Requests 1-3: Successful or validation error (not rate limited)
- Request 4: 429 (rate limited)

### 3. General API Rate Limiting Test (100 per minute)

```bash
# Quick stress test - 101 requests to health endpoint
for i in {1..101}; do
  if [ $((i % 20)) -eq 0 ]; then
    echo "Request $i"
  fi
  
  curl -s -X GET http://localhost:3000/health \
    -H "X-Forwarded-For: 192.168.3.100" \
    -o /dev/null
done

# Check if 101st request was rate limited
echo "Final request:"
curl -X GET http://localhost:3000/health \
  -H "X-Forwarded-For: 192.168.3.100" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
```

### 4. Check Rate Limit Headers

```bash
# Make a request and view rate limit headers
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.4.100" \
  -d '{"email":"test@example.com","password":"password"}' \
  -s | head -20
```

**Expected Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1628123456
```

### 5. Test Different IPs (should have separate limits)

```bash
# IP 1 - 3 requests
for i in {1..3}; do
  curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 10.0.0.1" \
    -d '{"email":"test@example.com","password":"password"}' \
    -o /dev/null
done

# IP 2 - 3 requests (should NOT be rate limited)
for i in {1..3}; do
  curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 10.0.0.2" \
    -d '{"email":"test@example.com","password":"password"}' \
    -o /dev/null
done

echo "Both IPs should have made 3 requests without rate limiting"
```

## Bash Script for Comprehensive Testing

Save as `test-rate-limits.sh`:

```bash
#!/bin/bash

set -e

API_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  RATE LIMITING COMPREHENSIVE TEST SUITE${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# Test 1: Login Rate Limiting
echo -e "${YELLOW}TEST 1: Login Rate Limiting (5/min/IP)${NC}"
IP="test-login-$(date +%s)"
SUCCESS_COUNT=0
for i in {1..6}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: $IP" \
    -d '{"email":"test@example.com","password":"password"}')
  
  if [ $i -le 5 ]; then
    if [ "$STATUS" != "429" ]; then
      echo -e "  Attempt $i: ${GREEN}✓${NC} (Status: $STATUS - OK)"
      ((SUCCESS_COUNT++))
    else
      echo -e "  Attempt $i: ${RED}✗${NC} (Status: $STATUS - Should not be 429)"
    fi
  else
    if [ "$STATUS" = "429" ]; then
      echo -e "  Attempt $i: ${GREEN}✓${NC} (Status: $STATUS - Correctly rate limited)"
      ((SUCCESS_COUNT++))
    else
      echo -e "  Attempt $i: ${RED}✗${NC} (Status: $STATUS - Should be 429)"
    fi
  fi
done
echo -e "Result: $SUCCESS_COUNT/6 passed\n"

# Test 2: Different IPs have separate limits
echo -e "${YELLOW}TEST 2: Separate Limits per IP${NC}"
for ip_num in {1..3}; do
  IP="10.0.0.$ip_num"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: $IP" \
    -d '{"email":"test@example.com","password":"password"}')
  
  if [ "$STATUS" != "429" ]; then
    echo -e "  IP $IP: ${GREEN}✓${NC} (Status: $STATUS - Not rate limited)"
  else
    echo -e "  IP $IP: ${RED}✗${NC} (Status: $STATUS - Should not be rate limited)"
  fi
done
echo ""

# Test 3: Rate Limit Headers
echo -e "${YELLOW}TEST 3: Rate Limit Headers${NC}"
HEADERS=$(curl -s -i -X GET $API_URL/health \
  -H "X-Forwarded-For: test-headers" \
  2>/dev/null | head -20)

if echo "$HEADERS" | grep -q "X-RateLimit-Limit"; then
  echo -e "  ${GREEN}✓${NC} X-RateLimit-Limit header present"
else
  echo -e "  ${RED}✗${NC} X-RateLimit-Limit header missing"
fi

if echo "$HEADERS" | grep -q "X-RateLimit-Remaining"; then
  echo -e "  ${GREEN}✓${NC} X-RateLimit-Remaining header present"
else
  echo -e "  ${RED}✗${NC} X-RateLimit-Remaining header missing"
fi

if echo "$HEADERS" | grep -q "X-RateLimit-Reset"; then
  echo -e "  ${GREEN}✓${NC} X-RateLimit-Reset header present"
else
  echo -e "  ${RED}✗${NC} X-RateLimit-Reset header missing"
fi
echo ""

echo -e "${GREEN}✓ Testing complete!${NC}"
```

Run it:
```bash
chmod +x test-rate-limits.sh
./test-rate-limits.sh
```

## Redis Monitoring During Tests

### Monitor Redis Keys in Real-Time

```bash
# Terminal 1: Watch rate limit keys
redis-cli MONITOR

# Terminal 2: Run tests
npm run dev

# Terminal 3: Make requests
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Check Rate Limit Data in Redis

```bash
# Connect to Redis
redis-cli

# See all rate limit keys
KEYS "ratelimit:*"

# Get specific rate limit data
GET "ratelimit:standard:login:192.168.1.1"

# Get backoff data
GET "ratelimit:backoff:login:192.168.1.1"

# Count total rate limit keys
DBSIZE

# Delete test data
FLUSHDB
```

## Client-Side Testing with JavaScript/TypeScript

### Test Login with Rate Limit Handling

```typescript
async function testLoginRateLimit() {
  const attempts = [];
  
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });

      const retryAfter = response.headers.get('Retry-After');
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');

      attempts.push({
        attempt: i,
        status: response.status,
        rateLimitLimit: rateLimit,
        rateLimitRemaining: remaining,
        retryAfter,
        body: await response.json(),
      });

      console.log(`Attempt ${i}: Status ${response.status}`);
      
      if (response.status === 429) {
        console.log(`Rate limited! Retry after ${retryAfter} seconds`);
        break;
      }
    } catch (error) {
      console.error(`Error on attempt ${i}:`, error);
    }

    // Wait 1 second between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.table(attempts);
}

// Run test
testLoginRateLimit();
```

## Programmatic Testing with Node.js

### Test Rate Limit Manager

```typescript
import rateLimitManager from './utils/rateLimitManager';

async function testRateLimitManager() {
  console.log('Testing Rate Limit Manager...\n');

  // Get status for a key
  const status = await rateLimitManager.getStatusForKey('login:192.168.1.1', 'standard', 5);
  console.log('Status:', status);

  // Get dashboard summary
  const summary = await rateLimitManager.getDashboardSummary();
  console.log('\nDashboard Summary:', summary);

  // Check all configs
  const configs = rateLimitManager.getAllConfigs();
  console.log('\nAll Configurations:', configs);

  // Generate report
  const report = await rateLimitManager.generateReport();
  console.log('\nReport:\n', report);
}

testRateLimitManager().catch(console.error);
```

## Performance Testing

### Load Test with Apache Bench

```bash
# Install Apache Bench (macOS)
brew install httpd

# Test general API rate limit (100 per minute)
# Make 110 requests quickly
ab -n 110 -c 10 http://localhost:3000/health

# Expected: Most should succeed, some should get 429
```

### Gatling Load Test (Advanced)

Create `RateLimitSimulation.scala`:

```scala
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class RateLimitSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://localhost:3000")
    .acceptHeader("application/json")

  val loginScenario = scenario("Login Rate Limit Test")
    .repeat(6) {
      exec(
        http("Login")
          .post("/api/auth/login")
          .header("X-Forwarded-For", "192.168.1.1")
          .body(StringBody("""{"email":"test@example.com","password":"password"}"""))
          .check(status.is(401).or(status.is(429)))
      )
      .pace(1 second)
    }

  setUp(
    loginScenario.inject(atOnceUsers(1))
  ).protocols(httpProtocol)
}
```

## Troubleshooting Tests

### Test Failing: "Redis unavailable"

**Problem**: Rate limiting not working, logs show Redis unavailable

**Solution**:
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
```

### Test Failing: "No rate limiting"

**Problem**: Requests not being rate limited

**Solution**:
1. Check middleware is applied in app.ts
2. Verify Redis connection in console logs
3. Check correct route is being tested
4. Verify IP header is being set (X-Forwarded-For)

### Test Failing: "Wrong rate limit value"

**Problem**: Getting different limits than expected

**Solution**:
1. Check RATE_LIMIT_CONFIGS in rateLimitMiddleware.ts
2. Verify correct limiter is applied to route
3. Check custom limits were not applied elsewhere
4. Reset Redis: `FLUSHDB`

## Admin Panel Testing

### Test Admin Endpoints

```bash
# Get dashboard
curl -X GET http://localhost:3000/admin/rate-limits/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get specific key status
curl -X GET "http://localhost:3000/admin/rate-limits/status/login:192.168.1.1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Reset rate limit
curl -X POST http://localhost:3000/admin/rate-limits/login:192.168.1.1/reset \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get report
curl -X GET http://localhost:3000/admin/rate-limits/report \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Continuous Integration Testing

### GitHub Actions Example

```yaml
name: Rate Limit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:latest
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - run: npm install
      - run: npm run build
      - run: npm run test -- --testPathPattern=rate-limit
```

## Checklist for Production Testing

- [ ] Login rate limiting works (5/min/IP)
- [ ] Registration rate limiting works (3/hr/IP)
- [ ] Password change limiting works (3/day/user)
- [ ] General API limiting works (100/min/user)
- [ ] Different IPs have separate limits
- [ ] Backoff works correctly
- [ ] Rate limit headers present
- [ ] Retry-After header correct
- [ ] Redis failure doesn't crash server
- [ ] Admin endpoints work
- [ ] Whitelist functionality works
- [ ] Reset functionality works
- [ ] Performance acceptable (< 5ms overhead)
- [ ] No memory leaks under load
- [ ] Works with multiple server instances

---

**Last Updated**: August 11, 2024
**Version**: 1.0.0
