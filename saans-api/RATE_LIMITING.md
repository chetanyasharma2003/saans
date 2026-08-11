# Rate Limiting Implementation

## Overview

This document describes the comprehensive rate limiting implementation for the SAANS Mental Health Platform API. The system uses Redis for distributed rate limiting and implements exponential backoff for failed attempts.

## Features

- ✅ **Distributed Rate Limiting**: Uses Redis for state management across multiple server instances
- ✅ **Multiple Limit Types**: Different limits for login, registration, API calls, password changes, etc.
- ✅ **Exponential Backoff**: Failed attempts trigger exponential backoff periods
- ✅ **Graceful Degradation**: If Redis is unavailable, requests are allowed to proceed with a warning
- ✅ **Production Ready**: Comprehensive error handling, logging, and monitoring
- ✅ **Flexible Configuration**: Easy to customize limits and behavior

## Rate Limit Configurations

### 1. Login Rate Limiter
- **Limit**: 5 attempts per minute per IP
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: Applied to `POST /api/auth/login`
- **Backoff Multiplier**: 2x

### 2. Registration Rate Limiter
- **Limit**: 3 attempts per hour per IP
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: Applied to `POST /api/auth/register`
- **Backoff Multiplier**: 2x

### 3. Password Change Rate Limiter
- **Limit**: 3 attempts per 24 hours per user
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: Applied to `POST /api/auth/change-password`
- **Backoff Multiplier**: 3x
- **Note**: Uses user ID for authenticated users, falls back to IP for unauthenticated

### 4. General API Rate Limiter
- **Limit**: 100 requests per minute per user/IP
- **File**: `src/app.ts`
- **Usage**: Applied globally to all routes
- **Backoff Multiplier**: 1.5x
- **Note**: Uses user ID for authenticated users, IP for unauthenticated

### 5. Strict API Rate Limiter
- **Limit**: 30 requests per minute per IP
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: For sensitive endpoints (optional)
- **Backoff Multiplier**: 2x

### 6. Crisis Endpoint Rate Limiter
- **Limit**: 10 requests per minute per IP
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: Applied to `POST /api/crisis/detect`
- **Backoff Multiplier**: 1.5x
- **Note**: Permissive limit to allow legitimate crisis detection

### 7. Payment Endpoint Rate Limiter
- **Limit**: 20 requests per minute per user
- **File**: `src/middleware/rateLimitMiddleware.ts`
- **Usage**: Applied to payment transaction endpoints
- **Backoff Multiplier**: 2x

## How It Works

### Basic Flow

1. **Request arrives** at an endpoint with rate limiting
2. **Middleware checks** if Redis is available
3. **Generates rate limit key** (e.g., `ratelimit:standard:login:192.168.1.1`)
4. **Retrieves current count** from Redis
5. **Checks if in backoff period** - if yes, returns 429 with Retry-After
6. **Increments hit count** and stores in Redis
7. **Checks if limit exceeded** - if yes:
   - Calculates exponential backoff time
   - Stores backoff info in Redis
   - Returns 429 with backoff information
8. **Allows request to proceed** with rate limit headers

### Exponential Backoff

When rate limit is exceeded, exponential backoff is triggered:

```
Backoff Time = Base Delay × (Multiplier ^ (Attempt Count - 1))

Example with multiplier 2:
- 1st violation: 1 second
- 2nd violation: 2 seconds
- 3rd violation: 4 seconds
- 4th violation: 8 seconds
- 5th violation: 16 seconds
```

## HTTP Headers

### Response Headers

The middleware sets the following headers:

```
X-RateLimit-Limit: 5                # Maximum requests allowed
X-RateLimit-Remaining: 2            # Requests remaining
X-RateLimit-Reset: 1628123456       # Unix timestamp when limit resets
Retry-After: 30                     # Seconds to wait before retry (on 429)
```

### Rate Limited Response (429)

```json
{
  "error": "Too many login attempts, please try again in a few minutes.",
  "retryAfter": 30,
  "backoffMultiplier": 2,
  "attemptCount": 2
}
```

## Usage Examples

### Importing Rate Limiters

```typescript
import {
  loginLimiter,
  registrationLimiter,
  passwordChangeLimiter,
  apiLimiter,
  crisisLimiter,
  paymentLimiter,
} from './middleware/rateLimitMiddleware';
```

### Applying to Routes

```typescript
import express from 'express';
import { loginLimiter, registrationLimiter } from './middleware/rateLimitMiddleware';
import authController from './controllers/authController';

const router = express.Router();

// Apply login rate limiter
router.post('/login', loginLimiter, (req, res) => {
  authController.login(req, res);
});

// Apply registration rate limiter
router.post('/register', registrationLimiter, (req, res) => {
  authController.register(req, res);
});

export default router;
```

### Creating Custom Rate Limiters

```typescript
import { createRateLimiter } from './middleware/rateLimitMiddleware';

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000,           // 1 minute window
  max: 50,                        // 50 requests max
  message: 'Custom rate limit',
  statusCode: 429,
  keyGenerator: (req) => {
    return `custom:${req.userId || req.ip}`;
  },
  backoffMultiplier: 2,
});

router.post('/custom-endpoint', customLimiter, handler);
```

## Configuration via Environment Variables

Add to `.env`:

```env
# Redis Configuration (already configured for rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

## Management API

### Using Rate Limit Manager

The `src/utils/rateLimitManager.ts` module provides utilities for monitoring and managing rate limits:

```typescript
import rateLimitManager from './utils/rateLimitManager';

// Get status for a specific client
const status = await rateLimitManager.getStatusForKey('login:192.168.1.1');
// Returns: {
//   key: 'login:192.168.1.1',
//   hits: 4,
//   limit: 5,
//   remaining: 1,
//   resetTime: 1628123456789,
//   resetTimeFormatted: '2024-08-11T12:30:45.789Z',
//   percentageUsed: 80,
//   isRateLimited: false,
//   backoffInfo: { ... }
// }

// Reset rate limit for a client
await rateLimitManager.resetKey('login:192.168.1.1');

// Get all clients matching a pattern
const keys = await rateLimitManager.getKeysMatchingPattern('login:*');

// Get all currently rate-limited clients
const limited = await rateLimitManager.getRateLimitedClients();

// Get dashboard summary
const summary = await rateLimitManager.getDashboardSummary();

// Generate report
const report = await rateLimitManager.generateReport();
console.log(report);
```

### Whitelist Management

```typescript
import rateLimitManager from './utils/rateLimitManager';

// Add IP/user to whitelist for 1 hour
await rateLimitManager.addToWhitelist('192.168.1.100', 3600000);

// Check if whitelisted
const isWhitelisted = await rateLimitManager.isWhitelisted('192.168.1.100');

// Remove from whitelist
await rateLimitManager.removeFromWhitelist('192.168.1.100');

// Get all whitelisted keys
const whitelist = await rateLimitManager.getWhitelistKeys();
```

## Creating an Admin Dashboard

You can create an admin endpoint to monitor rate limits:

```typescript
import express from 'express';
import { verifyToken, checkRole } from './middleware/authMiddleware';
import rateLimitManager from './utils/rateLimitManager';

const router = express.Router();

// Admin only - rate limit dashboard
router.get(
  '/admin/rate-limits/dashboard',
  verifyToken,
  checkRole('admin'),
  async (req, res) => {
    const summary = await rateLimitManager.getDashboardSummary();
    res.json(summary);
  }
);

// Admin only - get status for a specific key
router.get(
  '/admin/rate-limits/:key',
  verifyToken,
  checkRole('admin'),
  async (req, res) => {
    const status = await rateLimitManager.getStatusForKey(req.params.key);
    res.json(status);
  }
);

// Admin only - reset rate limit
router.post(
  '/admin/rate-limits/:key/reset',
  verifyToken,
  checkRole('admin'),
  async (req, res) => {
    const success = await rateLimitManager.resetKey(req.params.key);
    res.json({ success, key: req.params.key });
  }
);

// Admin only - generate report
router.get(
  '/admin/rate-limits/report',
  verifyToken,
  checkRole('admin'),
  async (req, res) => {
    const report = await rateLimitManager.generateReport();
    res.type('text/plain').send(report);
  }
);

export default router;
```

## Client-Side Handling

### Detecting Rate Limit Errors

```typescript
// Client code
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 429) {
      const error = await response.json();
      const retryAfter = response.headers.get('Retry-After');
      
      showError(`Too many attempts. Try again in ${retryAfter} seconds.`);
      
      // Disable form for retryAfter seconds
      disableLoginForm(parseInt(retryAfter) * 1000);
      return;
    }

    if (response.ok) {
      const data = await response.json();
      handleSuccessfulLogin(data);
    } else {
      showError('Login failed');
    }
  } catch (error) {
    showError('Network error');
  }
}

// Helper to disable form temporarily
function disableLoginForm(ms) {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = true;
  
  const countdown = ms / 1000;
  let remaining = countdown;
  
  const interval = setInterval(() => {
    button.textContent = `Try again in ${remaining}s`;
    remaining--;
    
    if (remaining < 0) {
      clearInterval(interval);
      button.disabled = false;
      button.textContent = 'Login';
    }
  }, 1000);
}
```

## Monitoring & Alerts

### Redis Monitoring

Monitor rate limit activity in Redis:

```bash
# Connect to Redis
redis-cli

# Watch rate limit keys
KEYS "ratelimit:*"

# Get specific rate limit data
GET "ratelimit:standard:login:192.168.1.1"

# Monitor all operations
MONITOR
```

### Logging

The middleware logs rate limit violations:

```
[2024-08-11T12:30:45.123Z] POST /api/auth/login - 429 (45ms)
```

To enable detailed logging, set `DEBUG=*` environment variable:

```bash
DEBUG=* npm start
```

## Testing

### Unit Tests Example

```typescript
import { loginLimiter } from '../middleware/rateLimitMiddleware';
import { getRedisClient } from '../utils/redis';

describe('Rate Limiting', () => {
  let redisClient;

  beforeAll(async () => {
    redisClient = getRedisClient();
  });

  it('should allow requests within limit', async () => {
    // Clean up
    await redisClient?.del('ratelimit:standard:login:127.0.0.1');

    // Make request
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .set('X-Forwarded-For', '127.0.0.1');

    expect(res.status).toBe(401); // Auth error, not rate limit
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
  });

  it('should block requests exceeding limit', async () => {
    const ip = '127.0.0.2';
    
    // Clean up
    await redisClient?.del('ratelimit:standard:login:' + ip);

    // Make 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .set('X-Forwarded-For', ip);

      if (i < 5) {
        expect(res.status).not.toBe(429);
      } else {
        expect(res.status).toBe(429);
        expect(res.body).toHaveProperty('retryAfter');
      }
    }
  });
});
```

## Best Practices

1. **Use appropriate limits** for different endpoints based on expected usage
2. **Monitor rate limit hits** regularly using the manager utilities
3. **Whitelist known clients** like health checks and internal services
4. **Log rate limit violations** for security analysis
5. **Communicate with users** when they hit limits using Retry-After header
6. **Test with production-like traffic** before deploying
7. **Have a fallback** in case Redis becomes unavailable
8. **Update limits** based on actual usage patterns
9. **Use exponential backoff** to prevent brute force attacks
10. **Consider geographic-based limits** for sensitive endpoints

## Troubleshooting

### Rate Limiting Not Working

**Problem**: Requests are not being rate limited

**Solutions**:
1. Check Redis connection: `redis-cli ping`
2. Verify Redis config in `.env`
3. Check middleware is applied: Look for import in `app.ts`
4. Check for Redis errors in logs

### False Positives

**Problem**: Legitimate users are being rate limited

**Solutions**:
1. Whitelist specific IPs or users
2. Increase rate limit values
3. Check if behind reverse proxy (use X-Forwarded-For)

### Backoff Not Working

**Problem**: Backoff period not being enforced

**Solutions**:
1. Check Redis is running
2. Verify backoff key is being set
3. Check TTL on Redis keys

## Performance Considerations

- **Redis Connection Pool**: Rate limiting uses connection pooling
- **Key Expiration**: Keys automatically expire from Redis (no manual cleanup needed)
- **Backoff Storage**: Backoff keys use TTL for automatic cleanup
- **Response Time**: Rate limit check adds < 5ms overhead
- **Memory**: Each active client takes ~200 bytes in Redis

## Security Considerations

1. **IP Spoofing**: Rate limiter respects X-Forwarded-For header. Ensure it's only set by trusted proxies
2. **Distributed Attacks**: Rate limiter works across multiple servers via Redis
3. **Brute Force Protection**: Exponential backoff makes brute forcing ineffective
4. **DOS Prevention**: Global API limit prevents DOS attacks
5. **Data Protection**: Rate limit data is stored in Redis, not in logs

## Future Enhancements

- [ ] Sliding window rate limiting
- [ ] Token bucket algorithm support
- [ ] Adaptive rate limiting based on load
- [ ] Per-endpoint custom limits
- [ ] WebSocket rate limiting
- [ ] GraphQL query complexity limiting
- [ ] Geographic-based rate limiting
- [ ] Machine learning-based anomaly detection

## Support & Debugging

For issues or questions:

1. Check Redis connection
2. Review rate limit configuration
3. Check logs for rate limit errors
4. Use `rateLimitManager.generateReport()` for diagnostics
5. Monitor Redis directly: `redis-cli`

---

**Last Updated**: August 11, 2024
**Version**: 1.0.0
**Production Ready**: Yes
