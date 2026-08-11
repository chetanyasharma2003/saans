# Rate Limiting - Quick Reference Card

## ⚡ Quick Start

```bash
# 1. Verify Redis running
redis-cli ping  # Should return: PONG

# 2. Start API
npm run dev

# 3. Test (6 requests to login endpoint, limit is 5)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.1" \
    -d '{"email":"test@example.com","password":"password"}'; sleep 1
done

# Expected: 5 requests OK, 6th returns 429
```

## 📊 Rate Limits at a Glance

| Endpoint | Limit | Per |
|----------|-------|-----|
| Login | 5 | minute/IP |
| Register | 3 | hour/IP |
| Password Change | 3 | 24hrs/user |
| API (global) | 100 | minute/user |
| Crisis Detection | 10 | minute/IP |
| Payments | 20 | minute/user |

## 💻 Common Code Patterns

### Apply Existing Limiter

```typescript
import { loginLimiter } from './middleware/rateLimitMiddleware';

router.post('/login', loginLimiter, handler);
```

### Create Custom Limiter

```typescript
import { createRateLimiter } from './middleware/rateLimitMiddleware';

const myLimiter = createRateLimiter({
  windowMs: 60 * 1000,           // 1 minute
  max: 50,                        // 50 requests
  keyGenerator: (req) => `key:${req.userId || req.ip}`,
  backoffMultiplier: 2,
});

router.post('/endpoint', myLimiter, handler);
```

### Get Rate Limit Status

```typescript
import rateLimitManager from './utils/rateLimitManager';

const status = await rateLimitManager.getStatusForKey('login:192.168.1.1');
// Returns: { hits, limit, remaining, resetTime, isRateLimited, ... }
```

### Reset Rate Limit

```typescript
await rateLimitManager.resetKey('login:192.168.1.1');
```

### Whitelist IP/User

```typescript
// Whitelist for 24 hours
await rateLimitManager.addToWhitelist('192.168.1.100', 24 * 3600 * 1000);

// Remove from whitelist
await rateLimitManager.removeFromWhitelist('192.168.1.100');
```

## 📡 HTTP Headers

### Request
```
X-Forwarded-For: 192.168.1.1     # IP address (used for rate limiting)
Authorization: Bearer TOKEN       # Auth token for protected routes
```

### Response (Success)
```
X-RateLimit-Limit: 5              # Max requests allowed
X-RateLimit-Remaining: 3          # Requests left in window
X-RateLimit-Reset: 1628123456     # Unix timestamp when resets
```

### Response (429 - Rate Limited)
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1628123456

{
  "error": "Too many requests...",
  "retryAfter": 30,
  "backoffMultiplier": 2,
  "attemptCount": 2
}
```

## 🔧 Configuration

### Environment Variables
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
REDIS_DB=0
```

### Customize Limits
Edit `src/middleware/rateLimitMiddleware.ts`:

```typescript
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,           // Change window
  max: 10,                        // Change from 5 to 10
  // ...
});
```

## 🔍 Monitoring

### Redis CLI
```bash
# Connect to Redis
redis-cli

# View all rate limit keys
KEYS "ratelimit:*"

# Get specific rate limit data
GET "ratelimit:standard:login:192.168.1.1"

# Monitor in real-time
MONITOR

# Clear all (development only)
FLUSHDB
```

### Get Dashboard Report
```typescript
import rateLimitManager from './utils/rateLimitManager';

const summary = await rateLimitManager.getDashboardSummary();
const report = await rateLimitManager.generateReport();
console.log(report);
```

## 🚀 Admin API (Optional)

If added to app.ts:
```typescript
app.use('/admin/rate-limits', rateLimitAdminRoutes);
```

Available endpoints (all require admin auth):

```bash
# Get dashboard
GET /admin/rate-limits/dashboard

# Get report
GET /admin/rate-limits/report

# Get status for key
GET /admin/rate-limits/status/:key

# Reset rate limit
POST /admin/rate-limits/:key/reset

# Add to whitelist
POST /admin/rate-limits/:key/whitelist

# Remove from whitelist
DELETE /admin/rate-limits/:key/whitelist

# Get whitelist
GET /admin/rate-limits/whitelist
```

## 🧪 Testing

### Quick Test
```bash
# Test login rate limit
bash RATE_LIMITING_TESTS.md
```

### Load Test
```bash
# 110 requests in quick succession (limit is 100)
ab -n 110 -c 10 http://localhost:3000/health
```

## 📝 Available Limiters

```typescript
// Pre-built limiters
loginLimiter              // 5/min/IP
registrationLimiter       // 3/hr/IP
passwordChangeLimiter     // 3/day/user
apiLimiter                // 100/min/user
strictApiLimiter          // 30/min/IP
crisisLimiter             // 10/min/IP
paymentLimiter            // 20/min/user

// Create custom
createRateLimiter(config)
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Redis unavailable warning | Start Redis: `redis-server` |
| Rate limiting not working | Check Redis connection, verify middleware in app.ts |
| Same IP/user getting different limits | Check custom keyGenerator is correct |
| Want to allow specific IP | Whitelist it: `addToWhitelist('192.168.1.100')` |
| Need to reset limit | `resetKey('login:192.168.1.1')` |

## 📚 Full Documentation

- **RATE_LIMITING.md** - Complete documentation (400+ lines)
- **RATE_LIMITING_TESTS.md** - Testing guide & examples
- **RATE_LIMITING_INTEGRATION.md** - Step-by-step integration
- **RATE_LIMITING_SUMMARY.md** - Implementation overview

## 🎯 Key Files

```
Middleware:
  src/middleware/rateLimitMiddleware.ts

Utilities:
  src/utils/rateLimitManager.ts

Admin:
  src/controllers/rateLimitAdminController.ts
  src/routes/rateLimitAdminRoutes.ts

Modified Routes:
  src/routes/authRoutes.ts
  src/routes/crisisRoutes.ts
  src/routes/paymentRoutes.ts
  src/app.ts
```

## ✅ Production Checklist

- [ ] Redis running and configured
- [ ] All sensitive endpoints have limiters
- [ ] Rate limit values match expected usage
- [ ] Admin routes added to app (optional but recommended)
- [ ] Monitoring/alerts configured
- [ ] Load tested with production traffic
- [ ] Client handles 429 responses
- [ ] API documentation updated
- [ ] Whitelist configured for known services
- [ ] Redis persistence enabled

## 🔐 Security Notes

- Uses per-IP or per-user tracking
- Exponential backoff prevents brute force
- Respects X-Forwarded-For for proxies
- Whitelist management available
- Gracefully handles Redis failure
- No sensitive data in logs

## 💡 Tips

1. **Test before deploying** - Run test suite with expected traffic
2. **Monitor early** - Set up alerts for high rate limit hits
3. **Whitelist services** - Add internal services to whitelist
4. **Adjust based on usage** - Monitor and adjust limits if needed
5. **Use admin API** - Monitor dashboard regularly
6. **Handle gracefully** - Client-side retry logic recommended

## 🔗 Related Files

- `.env` - Redis configuration
- `package.json` - Dependencies (redis@^4.6.5)
- `src/utils/redis.ts` - Redis client initialization
- `src/index.ts` - Redis initialization on startup

---

**Quick Reference v1.0** | Last updated: Aug 11, 2024
