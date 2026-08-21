# Sentry Error Monitoring & Observability Setup Guide

## Overview

This guide explains how to set up and use Sentry error monitoring and observability for the SAANS Mental Health Platform. Sentry provides:

- **Error Tracking**: Capture and monitor all errors in production
- **Performance Monitoring**: Track API response times, page load times, and database queries
- **Crash Reporting**: Get alerts when critical errors occur
- **Session Replay**: Reconstruct user sessions to understand what led to errors
- **User Feedback**: Allow users to report errors directly from the application

## Quick Start

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new organization
4. Create two projects:
   - One for the backend (Node.js)
   - One for the frontend (React)

### 2. Get Your DSN

For each project:
1. Go to Settings → Projects
2. Find your project and click on it
3. Go to Client Keys (DSN)
4. Copy the DSN URL

### 3. Configure Environment Variables

#### Backend (.env)

```bash
# Sentry Configuration
SENTRY_DSN="https://your-public-key@your-organization.ingest.sentry.io/project-id"
SENTRY_RELEASE="$(npm_package_version)"
SENTRY_ENVIRONMENT="production"  # Only enables in production
NODE_ENV="production"
```

#### Frontend (.env)

```bash
# Sentry Configuration
VITE_SENTRY_DSN="https://your-public-key@your-organization.ingest.sentry.io/project-id"
VITE_APP_VERSION="0.1.0"
VITE_ENV="production"
```

### 4. Install Dependencies

```bash
# Backend
cd saans-api
npm install @sentry/node @sentry/tracing

# Frontend
cd saans-web
npm install @sentry/react @sentry/tracing
```

## Architecture

### Backend Sentry Integration

```
┌─────────────────────────────────────┐
│      Express Application            │
├─────────────────────────────────────┤
│  1. Sentry.init() in index.ts       │
│  2. Sentry middleware in app.ts     │
│  3. Error tracking utilities        │
│  4. Performance monitoring spans    │
└─────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Sentry.captureException()          │
│  Sentry.captureMessage()            │
│  Custom error handlers              │
└─────────────────────────────────────┘
         │
         ↓
   [Sentry Dashboard]
```

**Key Files:**
- `saans-api/src/utils/sentryBackend.ts` - Initialization and utilities
- `saans-api/src/middleware/sentryMiddleware.ts` - Express middleware
- `saans-api/src/index.ts` - Sentry initialization
- `saans-api/src/app.ts` - Sentry middleware integration

**Initialization Order:**
1. Import Sentry
2. Call `initializeSentry()` BEFORE any Express app setup
3. Add Sentry middleware early in the chain
4. Add error handler middleware at the end
5. Flush Sentry on shutdown

### Frontend Sentry Integration

```
┌─────────────────────────────────────┐
│      React Application              │
├─────────────────────────────────────┤
│  1. Sentry.init() in main.tsx       │
│  2. Error Boundary component        │
│  3. API error interceptors          │
│  4. User feedback widget            │
└─────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Sentry.captureException()          │
│  Breadcrumbs (page views, actions)  │
│  Performance metrics                │
└─────────────────────────────────────┘
         │
         ↓
   [Sentry Dashboard]
```

**Key Files:**
- `saans-web/src/utils/sentryFrontend.ts` - Initialization and utilities
- `saans-web/src/main.tsx` - Sentry initialization
- `saans-web/src/components/ErrorBoundary.tsx` - Error boundary with Sentry
- `saans-web/src/services/apiClient.ts` - API error tracking
- `saans-web/src/services/errorHandler.ts` - Sentry integration

## Backend Features

### 1. Error Tracking

Errors are automatically captured by:
- Global error handler middleware
- Express error handling
- Unhandled promise rejections

### 2. Custom Error Capture

```typescript
import { captureError, captureApiError, captureAuthError, capturePaymentError } from './utils/sentryBackend';

// Generic error
captureError(new Error('Something went wrong'), { userId: '123' });

// API error
captureApiError(error, {
  method: 'POST',
  url: '/api/appointments/book',
  statusCode: 500,
  userId: user.id,
});

// Authentication error
captureAuthError(error, {
  userId: user.id,
  email: user.email,
  action: 'login_failed',
});

// Payment error
capturePaymentError(error, {
  userId: user.id,
  orderId: order.id,
  amount: 50.00,
  provider: 'stripe',
});
```

### 3. Performance Monitoring

Track database operations:

```typescript
import { captureDbOperation } from './middleware/sentryMiddleware';

const start = Date.now();
try {
  await prisma.user.findUnique({ where: { id: userId } });
  captureDbOperation('findUnique', 'User', Date.now() - start, true);
} catch (error) {
  captureDbOperation('findUnique', 'User', Date.now() - start, false, error);
}
```

Track external API calls:

```typescript
import { captureExternalApiCall } from './middleware/sentryMiddleware';

const start = Date.now();
try {
  const response = await axios.post('https://api.service.com/endpoint', data);
  captureExternalApiCall('service', '/endpoint', response.status, Date.now() - start);
} catch (error) {
  captureExternalApiCall('service', '/endpoint', error.response?.status, Date.now() - start, error);
}
```

### 4. Breadcrumbs

Add breadcrumbs to track user actions:

```typescript
import { addBreadcrumb } from './utils/sentryBackend';

addBreadcrumb('User logged in', { userId: user.id, email: user.email });
addBreadcrumb('Appointment created', { appointmentId: apt.id });
addBreadcrumb('Payment processed', { amount: 50.00, orderId: order.id });
```

### 5. User Context

Set user information for error tracking:

```typescript
import { setUserContext } from './utils/sentryBackend';

setUserContext(user.id, user.email, user.name);
```

## Frontend Features

### 1. Error Boundary

Catches React component errors:

```tsx
<ErrorBoundary onReset={() => { /* reset logic */ }}>
  <App />
</ErrorBoundary>
```

The ErrorBoundary automatically:
- Captures errors with Sentry
- Shows user-friendly error message
- Provides error ID for support
- Offers user feedback option

### 2. API Error Tracking

Errors are automatically tracked in `apiClient.ts`:

```typescript
// Automatic breadcrumbs for all API calls
// Automatic error capture on 4xx/5xx responses
// Includes request/response details
```

### 3. Custom Error Capture

```typescript
import { captureError, captureApiError, captureReduxError } from './utils/sentryFrontend';

// Generic error
captureError(new Error('UI error'), { componentName: 'Profile' });

// API error
captureApiError(error, {
  method: 'GET',
  url: '/api/appointments',
  statusCode: 500,
});

// Redux/state management error
captureReduxError(error, {
  action: 'fetchAppointments',
  state: { /* relevant state */ },
});
```

### 4. User Feedback Widget

Show feedback dialog when errors occur:

```typescript
import { showUserFeedback } from './utils/sentryFrontend';

showUserFeedback({
  title: 'Something went wrong',
  subtitle: 'Our team has been notified',
  labelComments: 'What were you doing?',
});
```

### 5. Breadcrumbs & Page Tracking

```typescript
import { addBreadcrumb, capturePageView, captureUserInteraction } from './utils/sentryFrontend';

// Track page views
capturePageView('/appointments', { filter: 'upcoming' });

// Track user interactions
captureUserInteraction('click', 'Book Appointment Button');

// Add custom breadcrumbs
addBreadcrumb('Appointment scheduled', { appointmentId: '123' });
```

### 6. Performance Monitoring

Track Core Web Vitals:

```typescript
import { trackWebVitals } from './utils/sentryFrontend';

trackWebVitals({
  name: 'LCP',
  value: 2500,
  rating: 'good',
});
```

### 7. Session Replay

Automatically enabled when errors occur (in production):
- Records user interactions
- Captures network requests
- Masks sensitive data
- Available in Sentry dashboard

## Configuration

### Environment Variables

#### Backend

| Variable | Purpose | Example |
|----------|---------|---------|
| `SENTRY_DSN` | Sentry project DSN | `https://key@org.ingest.sentry.io/123` |
| `SENTRY_RELEASE` | Release version | `1.0.0` |
| `SENTRY_ENVIRONMENT` | Environment | `production` |
| `NODE_ENV` | Node environment | `production` |

#### Frontend

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SENTRY_DSN` | Sentry project DSN | `https://key@org.ingest.sentry.io/123` |
| `VITE_APP_VERSION` | App version | `0.1.0` |
| `VITE_ENV` | Environment | `production` |

### Sampling Rates

Adjust performance monitoring sampling:

**Backend (`sentryBackend.ts`):**
```typescript
tracesSampleRate: nodeEnv === 'production' ? 0.1 : 1.0,  // 10% prod, 100% dev
profilesSampleRate: nodeEnv === 'production' ? 0.05 : 0.1, // 5% prod, 10% dev
```

**Frontend (`sentryFrontend.ts`):**
```typescript
tracesSampleRate: nodeEnv === 'production' ? 0.1 : 1.0,
replaysSessionSampleRate: nodeEnv === 'production' ? 0.05 : 0.1,
replaysOnErrorSampleRate: 1.0,  // Always capture on error
```

Higher percentages = more complete data but more data costs.

## Monitoring Checklist

### Essential Metrics to Monitor

- [ ] **Error Rate**: Track 5xx errors
- [ ] **Performance**: P75 response time > 3 seconds
- [ ] **Authentication**: > 10 auth failures in 5 minutes
- [ ] **Payments**: Any payment failure
- [ ] **Database**: > 50 query failures in 1 hour
- [ ] **API**: 4xx client errors indicating bugs

### Alert Rules to Create

1. **Critical Errors**
   - Condition: Error count > 50 in 1 hour
   - Action: Notify Slack, create incident

2. **Performance Degradation**
   - Condition: P75 response time > 3 seconds
   - Action: Notify team, escalate if > 5 seconds

3. **Auth Failures**
   - Condition: > 10 auth failures in 5 minutes
   - Action: Notify security team

4. **Payment Failures**
   - Condition: Any payment error
   - Action: Immediate notification

5. **Database Issues**
   - Condition: > 10 DB errors in 5 minutes
   - Action: Page on-call engineer

## Best Practices

### Do's ✓

- Initialize Sentry as early as possible
- Set user context immediately after authentication
- Add breadcrumbs for important user actions
- Tag errors for easy filtering
- Use appropriate log levels
- Sanitize sensitive data before sending
- Track performance metrics
- Monitor error trends regularly

### Don'ts ✗

- Don't send Sentry in development (disable with SENTRY_DSN check)
- Don't expose sensitive data (passwords, tokens, API keys)
- Don't capture huge payloads (use maxValueLength)
- Don't ignore all errors in production
- Don't send PII (Personally Identifiable Information)
- Don't forget to set user context for authenticated users
- Don't disable error handling for "local" errors

### Data Privacy

Sentry respects privacy regulations:

**GDPR Compliance:**
- Configure data retention
- Set up filters for sensitive data
- Document data processing

**Sensitive Data Handling:**
- Use `beforeSend` to filter PII
- Mask email addresses and user IDs
- Don't send passwords or tokens
- Use allowlist for URLs

Example filtering:

```typescript
beforeSend(event, hint) {
  // Remove sensitive fields
  if (event.request?.url) {
    // Mask sensitive query params
    event.request.url = event.request.url.replace(/token=\w+/, 'token=[REDACTED]');
  }
  return event;
}
```

## Troubleshooting

### Sentry Not Capturing Errors

**Problem**: Errors aren't appearing in Sentry dashboard

**Solutions**:
1. Check `SENTRY_DSN` is set correctly
2. Verify environment is `production` (disabled in dev by default)
3. Check Sentry quota limits
4. Verify error isn't filtered by `beforeSend`
5. Check browser console for Sentry initialization errors

### Missing Context in Error Reports

**Problem**: Errors show but lack important context

**Solutions**:
1. Ensure `setUserContext()` is called after auth
2. Add breadcrumbs before error occurs
3. Use `captureApiError()` with full context
4. Set tags with `setTag()`

### Performance Data Not Showing

**Problem**: Transaction data missing

**Solutions**:
1. Check `tracesSampleRate` isn't too low
2. Verify requests pass Sentry middleware
3. Ensure health checks aren't captured
4. Check Sentry quota for transactions

### Source Maps Missing

**Problem**: Stack traces show minified code

**Solutions**:
1. Upload source maps to Sentry
2. Configure `release` version
3. Ensure build includes source maps
4. Check Sentry project organization

## Deployment

### Production Deployment

1. **Before Deployment**
   - Set `SENTRY_DSN` in production environment
   - Verify error handling works locally
   - Test with staging Sentry project first

2. **During Deployment**
   - Ensure `SENTRY_RELEASE` is set to commit SHA or version
   - Configure Sentry source map upload in CI/CD
   - Monitor error dashboard for deployment errors

3. **After Deployment**
   - Check for spike in errors
   - Verify user feedback is being collected
   - Monitor performance metrics
   - Review error trends

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Upload source maps to Sentry
  run: |
    npm run build
    sentry-cli releases files upload-sourcemaps ./dist
```

## Support & Resources

- **Documentation**: https://docs.sentry.io/
- **React Integration**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Node.js Integration**: https://docs.sentry.io/platforms/node/
- **Dashboard**: https://sentry.io/organizations/your-org/issues/

## Next Steps

1. Create Sentry account at https://sentry.io
2. Create projects for backend and frontend
3. Copy DSNs to environment variables
4. Deploy to production
5. Monitor error dashboard
6. Set up alerts for critical issues
7. Review errors weekly
8. Improve based on error patterns

---

**Questions?** Contact the development team or check Sentry documentation.
