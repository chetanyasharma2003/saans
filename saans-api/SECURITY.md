# Security Implementation Guide

## Overview

This document describes the comprehensive security middleware and configurations implemented for the SAANS Mental Health Platform API. The implementation follows OWASP security best practices and is production-ready.

## Security Features Implemented

### 1. CSRF (Cross-Site Request Forgery) Protection

**Location:** `src/middleware/securityMiddleware.ts`

#### How It Works:
- CSRF tokens are generated for each session/user
- Tokens are stored in Redis with configurable TTL (default: 3600 seconds)
- On GET requests, tokens are provided via `X-CSRF-Token` header
- On state-changing requests (POST, PUT, DELETE, PATCH), tokens must be validated
- One-time token consumption prevents replay attacks
- Timing-safe comparison prevents timing attacks

#### Usage:

**Frontend - Getting CSRF Token:**
```javascript
// On page load or before form submission
const response = await fetch('http://api.example.com/api/data', {
  method: 'GET',
  credentials: 'include'
});

// Extract token from response headers
const csrfToken = response.headers.get('X-CSRF-Token');
localStorage.setItem('csrfToken', csrfToken);
```

**Frontend - Sending CSRF Token:**
```javascript
// Include token in state-changing requests
const response = await fetch('http://api.example.com/api/data', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': localStorage.getItem('csrfToken')
  },
  body: JSON.stringify({ /* data */ })
});
```

**Backend - Automatic Validation:**
- CSRF tokens are automatically validated before processing
- Skipped for: safe methods (GET, HEAD, OPTIONS), webhooks, public auth routes
- Returns 403 error if token is missing or invalid

#### Configuration:
```env
# CSRF token expiry (in seconds)
CSRF_TOKEN_EXPIRY=3600
```

---

### 2. Security Headers

**Location:** `src/middleware/securityMiddleware.ts` → `securityHeadersMiddleware()`

#### Headers Added:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking attacks |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `X-DNS-Prefetch-Control` | `off` | Disable DNS prefetching |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Prevent caching of sensitive data |
| `Pragma` | `no-cache` | HTTP/1.0 cache control |

---

### 3. Content Security Policy (CSP)

**Location:** `src/middleware/securityMiddleware.ts` → `cspMiddleware()`

CSP rules vary by environment:

**Development Mode:**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' https: data: blob:
font-src 'self' data:
connect-src 'self' https: ws: wss:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Production Mode:**
```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' https: data:
font-src 'self' data:
connect-src 'self' https:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

#### Customization:
Edit the `cspMiddleware()` function to adjust policies based on your frontend requirements.

---

### 4. HSTS (HTTP Strict Transport Security)

**Location:** `src/middleware/securityMiddleware.ts` → `hstsMiddleware()`

**Production Only:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- Forces HTTPS connections
- Valid for 1 year (31536000 seconds)
- Applies to all subdomains
- Can be submitted to HSTS preload lists

**Configuration:**
Only enabled in production with HTTPS protocol. Set in environment:
```env
NODE_ENV=production
```

---

### 5. Permissions Policy (Feature Policy)

**Location:** `src/middleware/securityMiddleware.ts` → `permissionsPolicyMiddleware()`

Restricts access to sensitive browser APIs:

```
accelerometer=()
ambient-light-sensor=()
autoplay=()
battery=()
camera=()
document-domain=()
encrypted-media=()
fullscreen=(self)
geolocation=()
gyroscope=()
magnetometer=()
microphone=()
midi=()
payment=()
picture-in-picture=()
sync-xhr=()
usb=()
vr=()
xr-spatial-tracking=()
```

---

### 6. Secure Cookie Settings

**Location:** `src/middleware/securityMiddleware.ts` → `secureCookieMiddleware()`

All cookies are automatically set with:

```javascript
{
  httpOnly: true,        // Prevent XSS attacks
  secure: true,          // Only over HTTPS in production
  sameSite: 'strict',    // CSRF protection
  maxAge: 24 * 60 * 60 * 1000  // 24 hours default
}
```

**Usage in Controllers:**
```javascript
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
  // Additional secure settings auto-applied
});
```

---

### 7. Rate Limiting

**Location:** `src/middleware/securityMiddleware.ts` → `rateLimitMiddleware()`

**Default Configuration:**
- Window: 60 seconds
- Max requests: 100 per client (per IP or user ID)
- Response headers: `X-RateLimit-*`

**Configuration:**
```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1692345678000
Retry-After: 45
```

**Error Response (429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

### 8. Input Validation & Injection Prevention

**Location:** `src/middleware/securityMiddleware.ts` → `sanitizeInputMiddleware()`

Prevents:
- NoSQL Injection ($where, eval, function)
- SQL Injection (DROP, DELETE, UPDATE, INSERT)
- XSS (script tags, event handlers)

**Blocked Patterns:**
```javascript
/(\$where|eval|function)/gi      // NoSQL
/(drop|delete|update|insert)\s+/gi // SQL
/(<script|javascript:|onerror=|onload=)/gi // XSS
```

**Error Response (400):**
```json
{
  "error": "Invalid input detected",
  "code": "INVALID_INPUT"
}
```

---

### 9. CORS Configuration

**Location:** `src/app.ts`

**Current Configuration:**
```javascript
cors({
  origin: ['http://localhost:5173', ...],  // Multiple origins supported
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  maxAge: 3600
})
```

**Configuration:**
```env
CORS_ORIGIN="http://localhost:5173,https://app.example.com"
```

---

### 10. Request Size Validation

**Location:** `src/middleware/securityMiddleware.ts` → `validateRequestSizeMiddleware()`

**Default:** 10MB

**Configuration:**
```env
MAX_REQUEST_SIZE_MB=10
```

**Error Response (413):**
```json
{
  "error": "Payload too large",
  "maxSize": "10MB"
}
```

---

### 11. Request ID Tracking

**Location:** `src/middleware/securityMiddleware.ts` → `requestIdMiddleware()`

- Generates unique request IDs for all requests
- Uses `X-Request-ID` header if provided
- Includes request ID in logs
- Useful for debugging and request tracing

**Header:**
```
X-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### 12. Proxy Trust Configuration

**Location:** `src/app.ts`

For deployment behind a reverse proxy (Nginx, Vercel, AWS ALB):

```env
TRUST_PROXY=true
```

This ensures correct IP detection for rate limiting and logging.

---

## Production Deployment Checklist

### Environment Variables

```bash
# CRITICAL - Change these from defaults!
JWT_SECRET="<strong-random-secret>"
JWT_REFRESH_SECRET="<strong-random-secret>"

# HTTPS/Security
NODE_ENV="production"
TRUST_PROXY="true"  # If behind reverse proxy

# CORS
CORS_ORIGIN="https://app.example.com,https://www.example.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# Request Size
MAX_REQUEST_SIZE_MB=10

# CSRF
CSRF_TOKEN_EXPIRY=3600
```

### Security Validation

The API validates security configuration on startup. In production, ensure:

1. **JWT_SECRET** is changed from default
2. **NODE_ENV** is set to "production"
3. **CORS_ORIGIN** lists your frontend domains
4. **HTTPS** is enabled (HSTS will be active)
5. **Redis** is configured and accessible

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
ENV TRUST_PROXY=true

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

## API Usage Examples

### 1. Login (Public Endpoint - CSRF Skipped)

```javascript
// No CSRF token needed
const response = await fetch('http://api.example.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
```

### 2. Create Appointment (Protected - CSRF Required)

```javascript
// Step 1: Get CSRF token (GET request)
const tokenResponse = await fetch('http://api.example.com/api/appointments', {
  method: 'GET',
  credentials: 'include'
});
const csrfToken = tokenResponse.headers.get('X-CSRF-Token');

// Step 2: Create appointment with CSRF token
const response = await fetch('http://api.example.com/api/appointments', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    therapistId: '123',
    date: '2024-12-20',
    time: '14:00'
  })
});
```

### 3. Webhook Integration (CSRF Skipped)

```javascript
// Payment gateway webhook
POST /api/payments/webhook
Headers: {
  'Content-Type': 'application/json'
}
// No CSRF token required for webhooks
```

---

## Troubleshooting

### CSRF Token Missing Error (403)

**Issue:** `"error": "CSRF token missing"`

**Solution:**
1. Make a GET request first to get the token from response headers
2. Include token in next request via `X-CSRF-Token` header
3. Ensure cookies are included (`credentials: 'include'`)

### CORS Error (403)

**Issue:** Browser blocks cross-origin request

**Solution:**
1. Add frontend URL to `CORS_ORIGIN` environment variable
2. Separate multiple origins with commas
3. Reload API server after changing env vars

### Rate Limit Error (429)

**Issue:** `"error": "Too many requests"`

**Solution:**
1. Check `X-RateLimit-Reset` header for when limit resets
2. Increase `RATE_LIMIT_MAX_REQUESTS` if legitimate high traffic
3. Implement exponential backoff in client

### Content Security Policy Violations

**Issue:** Resources blocked by CSP

**Solution:**
1. Check browser console for CSP violations
2. Update `cspMiddleware()` with new content source
3. For inline scripts, consider moving to external files
4. Use nonces for dynamic scripts in production

---

## Monitoring & Logging

### Request Logging

Every request is logged with format:
```
[2024-08-07T10:30:45.123Z] [request-id] METHOD /path - STATUS (123ms)
```

### Rate Limit Monitoring

Monitor these metrics:
- `X-RateLimit-Remaining` responses
- 429 error frequency
- Blocked IPs/users

### CSRF Token Validation

Monitor in Redis:
```bash
redis-cli keys "csrf:*"  # View active tokens
```

### Security Header Validation

Test headers with curl:
```bash
curl -i -H "X-Request-ID: test-123" http://localhost:3000/health
```

---

## Additional Security Recommendations

### 1. Database
- Use strong passwords
- Enable SSL for database connections
- Implement row-level security policies
- Regular backups

### 2. API Keys & Secrets
- Rotate JWT secrets periodically
- Store in secure vaults (AWS Secrets Manager, Vault)
- Use API key versioning
- Implement key rotation policies

### 3. Dependency Management
- Regular `npm audit` checks
- Automated dependency updates
- Lock file in version control
- Monitor for CVEs

### 4. Logging & Monitoring
- Centralized logging (Sentry, ELK)
- Real-time alerting for security events
- Regular log reviews
- GDPR-compliant log retention

### 5. Testing
- Penetration testing
- OWASP Top 10 compliance checks
- Security code reviews
- Load testing

---

## Compliance Standards

This implementation meets or exceeds:
- **OWASP Top 10** protection
- **NIST Cybersecurity Framework**
- **CWE/SANS Top 25**
- **GDPR** security requirements (with proper configuration)

---

## Support & Updates

For security vulnerabilities or issues:
1. Check logs for detailed error messages
2. Review SECURITY.md for configuration guidance
3. Inspect request/response headers with curl
4. Monitor Redis for token status

---

## Version History

- **v1.0.0** (2024-08-11): Initial implementation
  - CSRF protection with Redis storage
  - Comprehensive security headers
  - Rate limiting
  - Input validation
  - CSP, HSTS, and Permissions Policy

