# 🚨 SAANS PROJECT - ISSUES & BUGS FOUND

## Critical Issues

### 1. CORS Too Permissive ⚠️
**File:** `server/server.js` (line 31-37)
```javascript
app.use(cors({
  origin: true,  // ❌ ALLOWS ALL ORIGINS - SECURITY RISK!
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
}));
```

**Problem:**
- `origin: true` accepts requests from ANY domain
- Combined with `credentials: true` = major security vulnerability
- Anyone can make requests from their website to SAANS API
- CSRF/XSS attacks possible

**Fix:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

### 2. Missing Dependencies ❌
**File:** `server/package.json`
```
UNMET DEPENDENCIES:
├─ @sentry/node@^11.1.0
├─ @testing-library/jest-dom@^7.0.1
├─ @types/jest@^30.0.0
├─ agora-token@^2.0.7
├─ aws-sdk@^2.1693.0
├─ axios@^1.20.0
├─ bcrypt@^6.0.0
├─ compression@^1.7.4
├─ cors@^2.8.5
├─ crypto-js@^4.2.0
└─ ... (many more)
```

**Problem:**
- `npm install` doesn't install all dependencies
- App will crash when trying to use these modules
- Cannot start server without running `npm install` first

**Fix:**
```bash
cd server
npm install
npm install --save @sentry/node axios bcrypt
```

---

### 3. Hardcoded Session Secret ⚠️
**File:** `server/server.js` (line 47)
```javascript
session({
  secret: process.env.SESSION_SECRET || 'saans-session-secret',  // ❌ HARDCODED!
  ...
})
```

**Problem:**
- If `SESSION_SECRET` not set, defaults to 'saans-session-secret'
- This hardcoded secret is visible in code
- Anyone can forge session cookies

**Fix:**
```javascript
session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  ...
})

// Or require it:
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET required');
```

---

## High Priority Issues

### 4. Password Strength Not Enforced
**File:** `server/routes/auth.routes.js`

**Problem:**
- No minimum password requirements
- Users can set weak passwords like "123456"
- No password complexity validation

**Fix:**
```javascript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char

if (!PASSWORD_REGEX.test(password)) {
  throw new Error('Password must contain uppercase, lowercase, number, special char');
}
```

---

### 5. No Rate Limiting on Data Fetches 🐌
**File:** `server/routes/`

**Problem:**
- Rate limiting only on `/auth/login` and `/auth/register`
- Other endpoints (therapist search, mood fetch, etc.) have NO rate limiting
- API can be abused/DDoS'd
- Bot can scrape all data

**Fix:**
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requests per IP
});

// Apply to all GET endpoints
app.get('/api/therapists', apiLimiter, getTherapists);
app.get('/api/resources', apiLimiter, getResources);
```

---

### 6. No Input Validation on Many Endpoints ❌
**Problem:**
- Only some routes use Zod validation
- User input not sanitized before DB query
- SQL injection risk possible
- XSS in community posts

**Example:**
```javascript
// ❌ DANGEROUS
app.get('/api/therapists/search', (req, res) => {
  const q = req.query.q; // NO VALIDATION!
  // If q = "'; DROP TABLE users;--" → DB destroyed!
})

// ✅ SAFE
const schema = z.object({
  q: z.string().min(1).max(100)
});
const q = schema.parse(req.query).q;
```

---

### 7. No HTTPS in Development Config
**File:** `.env.example` or code

**Problem:**
- Session cookies not marked `secure` in dev
- `httpOnly` flag might not be enforced
- JWT tokens sent over HTTP in dev

**Fix:**
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true, // REQUIRED
  sameSite: 'strict', // CSRF protection
  maxAge: 24 * 60 * 60 * 1000
}
```

---

### 8. No Email Verification Enforced
**File:** `server/routes/auth.routes.js`

**Problem:**
- Users register without verifying email
- Can register with fake emails
- Account takeover easy

**Fix:**
```javascript
// On registration:
const emailToken = crypto.randomBytes(32).toString('hex');
await User.create({
  ...userData,
  emailVerified: false,
  emailVerificationToken: emailToken
});

// Send verification email
// Then require GET /api/auth/verify-email?token=...
```

---

## Medium Priority Issues

### 9. No API Versioning
**Problem:**
- All endpoints at `/api/`
- Can't deprecate old endpoints
- Breaking changes affect all clients

**Fix:**
```
Use: /api/v1/therapists, /api/v1/appointments
Future: /api/v2/... (new schema)
```

---

### 10. No Request/Response Logging
**File:** `server/server.js` line 63

**Problem:**
- Morgan only logs to console
- No persistent logs for debugging
- Can't audit user actions

**Fix:**
```javascript
const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino/file',
    options: { destination: './logs/app.log' }
  }
});
app.use(pinoHttp({ logger }));
```

---

### 11. No Health Checks for Dependencies
**Problem:**
- No check if PostgreSQL connected
- No check if Redis available
- App starts even with DB down
- User requests fail cryptically

**Fix:**
```javascript
app.get('/api/health', async (req, res) => {
  const checks = {
    database: await testDB(),
    redis: await testRedis(),
    sentry: !!process.env.SENTRY_DSN,
  };
  
  const allHealthy = Object.values(checks).every(Boolean);
  res.status(allHealthy ? 200 : 503).json(checks);
});
```

---

### 12. Frontend Missing Error Boundaries
**File:** `saans-web/src/App.tsx`

**Problem:**
- One component error crashes entire app
- Users see blank page
- No fallback UI

**Fix:**
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

---

## Low Priority Issues (Polish)

### 13. No Loading States on Buttons
**Problem:**
- User clicks "Book Appointment" multiple times
- Creates duplicate bookings
- No visual feedback

**Fix:**
```javascript
<button 
  disabled={isLoading}
  onClick={handleBook}
>
  {isLoading ? 'Booking...' : 'Book Now'}
</button>
```

---

### 14. No Empty States
**Problem:**
- Empty therapist list shows nothing
- Confusing UX
- User thinks it's broken

**Fix:**
```javascript
if (therapists.length === 0) {
  return <EmptyState icon="👤" message="No therapists match your criteria" />;
}
```

---

### 15. No Search Debouncing
**Problem:**
- Each keystroke = API call
- 100 searches for "depression" = 100 API calls
- Wastes bandwidth

**Fix:**
```javascript
const debouncedSearch = useCallback(
  debounce((q) => searchTherapists(q), 500),
  []
);
```

---

## Summary

```
CRITICAL (Fix NOW):
├─ CORS too permissive ⚠️
├─ Missing dependencies ❌
└─ Hardcoded secrets ⚠️

HIGH PRIORITY (Fix soon):
├─ No password strength
├─ No rate limiting on GET
├─ No input validation
├─ No email verification
└─ No HTTPS enforcement

MEDIUM PRIORITY (Nice to have):
├─ No API versioning
├─ No persistent logging
├─ No health checks
└─ No error boundaries

TOTAL ISSUES FOUND: 15
SEVERITY: 🔴 3 Critical, 🟠 5 High, 🟡 4 Medium, 🟢 3 Low
```

---

## How to Fix (Priority Order)

```
WEEK 1:
1. Fix CORS (1 hour)
2. Install dependencies (30 min)
3. Fix hardcoded secrets (30 min)
4. Add email verification (2 hours)

WEEK 2:
5. Add password strength (1 hour)
6. Add rate limiting (2 hours)
7. Add input validation (3 hours)

WEEK 3:
8. Add health checks (1 hour)
9. Add error boundaries (1 hour)
10. Implement logging (2 hours)

Total: ~16 hours of work
```

