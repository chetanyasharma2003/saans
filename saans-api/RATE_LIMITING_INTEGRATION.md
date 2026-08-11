# Rate Limiting Integration Guide

## Quick Start

The rate limiting middleware has been fully implemented and is ready to use. Here's how to integrate it into your application:

## Step 1: Verify Installation (✅ Already Done)

The following files have been created:

```
src/
├── middleware/
│   └── rateLimitMiddleware.ts          ✅ Core rate limiting logic
├── utils/
│   └── rateLimitManager.ts             ✅ Management utilities
├── controllers/
│   └── rateLimitAdminController.ts     ✅ Admin API endpoints
└── routes/
    └── rateLimitAdminRoutes.ts         ✅ Admin route definitions
```

## Step 2: Verify Routes Are Protected (✅ Already Done)

Rate limiters have been added to:
- `POST /api/auth/login` - loginLimiter (5/min/IP)
- `POST /api/auth/register` - registrationLimiter (3/hr/IP)
- `POST /api/auth/change-password` - passwordChangeLimiter (3/day/user)
- `POST /api/crisis/detect` - crisisLimiter (10/min/IP)
- `POST /api/payments/create-order` - paymentLimiter (20/min/user)
- `POST /api/payments/verify-payment` - paymentLimiter (20/min/user)
- Global API limiter on all routes (100/min/user)

## Step 3: Add Admin Routes (OPTIONAL - Do This For Admin Dashboard)

To enable the admin dashboard for rate limit management, add the admin routes to `src/app.ts`:

```typescript
// At the top of app.ts, add import
import rateLimitAdminRoutes from './routes/rateLimitAdminRoutes.js';

// In the ROUTES section, add before error handlers
// Admin routes (protected)
app.use('/admin/rate-limits', rateLimitAdminRoutes);
```

**Example update to src/app.ts**:

```typescript
// Find this section in app.ts:
// =============== ROUTES ===============

// Add this line after crisis routes:
app.use('/admin/rate-limits', rateLimitAdminRoutes);

// So it looks like:
app.use('/api/crisis', crisisRoutes);
app.use('/admin/rate-limits', rateLimitAdminRoutes);  // ADD THIS LINE

// =============== ERROR HANDLING ===============
```

## Step 4: Verify Redis Configuration (✅ Already Configured)

Redis is already configured in `src/utils/redis.ts` and initialized in `src/index.ts`.

Check your `.env` file has:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=           # Optional, for production
REDIS_DB=0
```

## Step 5: Test the Implementation

### Quick Test

```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Test login rate limiting
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email":"test@example.com","password":"password"}' \
    -s | jq '.error'
  sleep 1
done
```

Expected output:
- Attempts 1-5: `"Invalid or expired token"` or auth error (not rate limited)
- Attempt 6: `"Too many login attempts, please try again in a few minutes."` (429 status)

### Comprehensive Testing

```bash
# Run the test script
bash RATE_LIMITING_TESTS.md
```

## Step 6: Monitor Rate Limits (Optional)

### Via Redis CLI

```bash
# Connect to Redis
redis-cli

# See rate limit keys
KEYS "ratelimit:*"

# Get specific rate limit data
GET "ratelimit:standard:login:192.168.1.1"

# Monitor in real-time
MONITOR
```

### Via Rate Limit Manager

Create an admin endpoint:

```typescript
// In src/controllers/debugController.ts (create if doesn't exist)
import { Request, Response } from 'express';
import rateLimitManager from '../utils/rateLimitManager.js';

export async function getRateLimitReport(req: Request, res: Response) {
  const report = await rateLimitManager.generateReport();
  res.type('text/plain').send(report);
}

// In src/routes/debugRoutes.ts
import { Router } from 'express';
import { getRateLimitReport } from '../controllers/debugController.js';

const router = Router();
router.get('/rate-limit-report', getRateLimitReport);
export default router;

// In src/app.ts (add before error handlers)
import debugRoutes from './routes/debugRoutes.js';
app.use('/debug', debugRoutes);  // Protect this in production!
```

Then access: `http://localhost:3000/debug/rate-limit-report`

## Configuration Reference

### Rate Limiter Configurations

| Endpoint | Limit | Window | Backoff |
|----------|-------|--------|---------|
| `/api/auth/login` | 5 | 1 minute | 2x |
| `/api/auth/register` | 3 | 1 hour | 2x |
| `/api/auth/change-password` | 3 | 24 hours | 3x |
| `/api/crisis/detect` | 10 | 1 minute | 1.5x |
| `/api/payments/*` | 20 | 1 minute | 2x |
| Global API | 100 | 1 minute | 1.5x |

### Customizing Limits

To change rate limit values, edit `src/middleware/rateLimitMiddleware.ts`:

```typescript
// Example: Change login limit to 10 per minute
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,           // 1 minute
  max: 10,                        // Changed from 5 to 10
  statusCode: 429,
  message: 'Too many login attempts, please try again in a few minutes.',
  keyGenerator: (req: Request) => {
    return `login:${getClientIP(req)}`;
  },
  backoffMultiplier: 2,
});
```

### Creating Custom Limiters

```typescript
import { createRateLimiter } from './middleware/rateLimitMiddleware';

// Create custom limiter
const myCustomLimiter = createRateLimiter({
  windowMs: 60 * 1000,              // 1 minute
  max: 50,                           // 50 requests
  message: 'Custom rate limit exceeded',
  keyGenerator: (req) => {
    return `custom:${req.userId || req.ip}`;
  },
  backoffMultiplier: 2,
});

// Use in route
router.post('/my-endpoint', myCustomLimiter, handler);
```

## Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100           # Maximum requests allowed
X-RateLimit-Remaining: 95        # Requests remaining in window
X-RateLimit-Reset: 1628123456    # Unix timestamp when limit resets
Retry-After: 45                  # Seconds to wait (on 429 responses)
```

## 429 Response Format

When rate limited, responses look like:

```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 30,
  "backoffMultiplier": 2,
  "attemptCount": 2
}
```

HTTP Status: **429 Too Many Requests**

## Handling Rate Limits on Client

### JavaScript Example

```typescript
async function makeApiCall(endpoint: string, data: any) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.status === 429) {
      const error = await response.json();
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeApiCall(endpoint, data);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## Admin API Endpoints (Optional)

If you've added the admin routes, these endpoints are available:

### Get Dashboard

```bash
curl -X GET http://localhost:3000/admin/rate-limits/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Rate Limit Status

```bash
curl -X GET "http://localhost:3000/admin/rate-limits/status/login:192.168.1.1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Reset Rate Limit

```bash
curl -X POST "http://localhost:3000/admin/rate-limits/login:192.168.1.1/reset" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Whitelisted Keys

```bash
curl -X GET http://localhost:3000/admin/rate-limits/whitelist \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Add to Whitelist

```bash
curl -X POST "http://localhost:3000/admin/rate-limits/192.168.1.100/whitelist" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiryHours": 24}'
```

## Whitelist Management

Whitelist specific IPs/users to exempt them from rate limiting:

```typescript
import rateLimitManager from './utils/rateLimitManager';

// Add to whitelist for 24 hours
await rateLimitManager.addToWhitelist('192.168.1.100', 24 * 60 * 60 * 1000);

// Check if whitelisted
const isWhitelisted = await rateLimitManager.isWhitelisted('192.168.1.100');

// Remove from whitelist
await rateLimitManager.removeFromWhitelist('192.168.1.100');

// Get all whitelisted
const whitelist = await rateLimitManager.getWhitelistKeys();
```

## Monitoring & Alerts

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

### Check Redis Connection

```bash
redis-cli ping
```

### Monitor Rate Limit Activity

```typescript
// In a monitoring service or cron job
import rateLimitManager from './utils/rateLimitManager';

async function monitorRateLimits() {
  const summary = await rateLimitManager.getDashboardSummary();
  
  // Alert if many clients are rate limited
  const total = Object.values(summary.summary).reduce(
    (sum, s) => sum + s.limited,
    0
  );
  
  if (total > 10) {
    console.warn(`⚠️  ${total} clients currently rate limited`);
    // Send alert to Sentry, Slack, etc.
  }
}

// Run every 5 minutes
setInterval(monitorRateLimits, 5 * 60 * 1000);
```

## Production Checklist

- [ ] Redis is properly configured and running
- [ ] All rate limiters are applied to sensitive endpoints
- [ ] Rate limit values match your expected usage
- [ ] Admin routes are protected by authentication
- [ ] Monitoring/alerts are set up
- [ ] Backup strategy exists for rate limit data
- [ ] Load testing done with expected traffic
- [ ] Client-side handling for 429 responses implemented
- [ ] Documentation updated for API users
- [ ] Rate limit policies documented in API docs

## Troubleshooting

### Rate Limiting Not Working

1. Check Redis is running: `redis-cli ping`
2. Check middleware is imported in app.ts
3. Check logs for Redis connection errors
4. Verify X-Forwarded-For header in requests

### Getting Different Errors Than Expected

1. Check rate limit values in rateLimitMiddleware.ts
2. Verify correct limiter is applied to route
3. Check for conflicting middleware
4. Reset Redis: `redis-cli FLUSHDB`

### Performance Issues

1. Check Redis connection pooling
2. Monitor Redis memory usage: `redis-cli info memory`
3. Check for long-running operations
4. Consider Redis cluster for distributed deployments

## Next Steps

1. ✅ Core implementation is complete
2. Optional: Add admin routes to app.ts for monitoring
3. Optional: Create monitoring dashboard
4. Test with production-like traffic
5. Update API documentation with rate limit info
6. Set up monitoring and alerting

## Support

For issues or questions:
- Check RATE_LIMITING.md for detailed documentation
- Check RATE_LIMITING_TESTS.md for testing examples
- Review rateLimitManager utility functions
- Check Redis logs: `redis-cli`
- Enable debug logging: `DEBUG=* npm run dev`

---

**Last Updated**: August 11, 2024
**Production Ready**: Yes
**Version**: 1.0.0
