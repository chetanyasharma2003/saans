# Production-Ready Error Handling Guide

## Overview

This document describes the comprehensive error handling system implemented across all SAANS API controllers. The system provides:

- ✅ Centralized error management
- ✅ Structured logging with context tracking
- ✅ Proper HTTP status code responses
- ✅ Request ID tracing for debugging
- ✅ Security (no sensitive data exposure)
- ✅ Production-ready monitoring integration points
- ✅ Consistent API error responses

## Architecture

### Core Components

#### 1. **Error Handler Utility** (`src/utils/errorHandler.ts`)
- **ApiError Class**: Custom error class extending Error
- **ErrorMessages**: Standardized error message constants
- **ErrorCodes**: Machine-readable error codes for client handling
- **HttpStatus**: HTTP status code constants

```typescript
// Example usage
throw new ApiError(
  HttpStatus.NOT_FOUND,
  ErrorMessages.USER_NOT_FOUND,
  true,
  ErrorCodes.RESOURCE_NOT_FOUND,
  { userId: '123' }
);
```

**Key Features:**
- Captures error code, message, status, and timestamp
- Sanitizes output to exclude sensitive details
- Supports detailed error information in development mode
- Includes stack traces for debugging

---

#### 2. **Logger** (`src/utils/logger.ts`)
Structured logging system with multiple log levels and sanitization.

**Log Levels:**
- `DEBUG` - Detailed information for development
- `INFO` - General informational messages
- `WARN` - Warning messages for unusual situations
- `ERROR` - Error messages for failures

**Usage:**
```typescript
import { logger } from '../utils/logger.js';

// Log with context
logger.info(
  'Payment processed',
  { orderId: '123', amount: 99 },
  userId,
  requestId
);

// Log errors
logger.error(
  'Payment failed',
  error,
  { orderDetails },
  userId,
  requestId
);
```

**Features:**
- Structured JSON logging
- Context tracking (userId, requestId)
- Automatic error sanitization
  - Redacts emails
  - Hides API keys/tokens
  - Removes database URLs
  - Truncates long messages
- Color-coded console output in development
- Integration points for Sentry, DataDog, CloudWatch

---

#### 3. **Error Middleware** (`src/middleware/errorMiddleware.ts`)

**Components:**
- `asyncHandler()`: Wraps async route handlers
- `globalErrorHandler()`: Catches all errors
- `notFoundHandler()`: Handles 404s
- `requestIdMiddleware()`: Generates request IDs
- `requestLoggingMiddleware()`: Logs requests/responses

**Request Flow:**
```
Request → requestIdMiddleware → Routes → asyncHandler
                                    ↓
                            (Error thrown)
                                    ↓
                            globalErrorHandler
                                    ↓
                        Structured Error Response
```

---

## HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 | Success | GET request returns data |
| 201 | Created | POST creates new resource |
| 400 | Bad Request | Invalid input validation fails |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | User lacks permission for resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Unexpected internal error |

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "message": "User not found",
    "code": "RESOURCE_NOT_FOUND",
    "timestamp": "2026-08-11T10:30:45.123Z"
  }
}
```

**Development Mode** (includes additional details):
```json
{
  "error": {
    "message": "User not found",
    "code": "RESOURCE_NOT_FOUND",
    "timestamp": "2026-08-11T10:30:45.123Z",
    "details": {
      "userId": "user-123"
    }
  }
}
```

---

## Controller Implementation Pattern

All controllers follow this standardized pattern:

```typescript
async methodName(req: Request, res: Response, next: NextFunction): Promise<void> {
  const requestId = req.headers['x-request-id'] as string;
  const userId = (req as any).userId;

  try {
    // 1. Validate input
    if (!requiredField) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'Field is required',
        true,
        ErrorCodes.VALIDATION_FAILED
      );
    }

    // 2. Log action start
    logger.debug('Starting operation', { details }, userId, requestId);

    // 3. Execute business logic
    const result = await service.operation(data);

    // 4. Log success
    logger.info('Operation successful', { result }, userId, requestId);

    // 5. Return response
    res.status(HttpStatus.OK).json(result);

  } catch (error: any) {
    // 6. Handle custom errors
    if (error instanceof ApiError) {
      logger.warn(`Operation failed: ${error.message}`, error, undefined, userId, requestId);
      return next(error);
    }

    // 7. Handle specific error types
    if (error.message?.includes('not found')) {
      const apiError = new ApiError(
        HttpStatus.NOT_FOUND,
        ErrorMessages.NOT_FOUND,
        true,
        ErrorCodes.RESOURCE_NOT_FOUND
      );
      logger.warn('Resource not found', error, undefined, userId, requestId);
      return next(apiError);
    }

    // 8. Handle generic errors
    logger.error('Unexpected error', error, undefined, userId, requestId);
    next(
      new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorMessages.INTERNAL_SERVER_ERROR,
        false,
        ErrorCodes.INTERNAL_ERROR
      )
    );
  }
}
```

---

## Error Codes Reference

### Authentication
- `AUTH_MISSING_CREDENTIALS` - No credentials provided
- `AUTH_INVALID_CREDENTIALS` - Wrong username/password
- `AUTH_TOKEN_EXPIRED` - JWT token expired
- `AUTH_UNAUTHORIZED` - User not authenticated

### Validation
- `VALIDATION_FAILED` - Input validation error
- `INVALID_EMAIL` - Email format invalid
- `INVALID_DATE` - Date format invalid

### Resources
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `RESOURCE_EXISTS` - Resource already exists
- `RESOURCE_FORBIDDEN` - No permission to access

### Server
- `INTERNAL_ERROR` - Unexpected server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - Third-party API error

---

## Integration with Monitoring Services

The logger is pre-configured for monitoring integration. To enable production monitoring:

### Sentry (Recommended)
```typescript
// src/utils/logger.ts - uncomment and configure
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// In error handler
Sentry.captureException(error);
```

### DataDog
```typescript
// Send logs to DataDog
const axios = require('axios');

const sendToDataDog = (entry: LogEntry) => {
  axios.post(`https://http-intake.logs.datadoghq.com/v1/input/${process.env.DD_API_KEY}`, {
    hostname: os.hostname(),
    service: entry.service,
    ...entry,
  });
};
```

### CloudWatch
```typescript
// Send logs to AWS CloudWatch
import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch();
cloudwatch.putMetricData({
  Namespace: 'SAANS',
  MetricData: [
    {
      MetricName: `${level}:${message}`,
      Value: 1,
      Unit: 'Count',
    },
  ],
});
```

---

## Best Practices

### 1. **Always Validate Input**
```typescript
if (!email || !email.includes('@')) {
  throw new ApiError(
    HttpStatus.BAD_REQUEST,
    ErrorMessages.INVALID_EMAIL,
    true,
    ErrorCodes.INVALID_EMAIL
  );
}
```

### 2. **Use Appropriate Status Codes**
- 400 for client input errors
- 401 for authentication failures
- 403 for authorization failures
- 404 for missing resources
- 500 for server errors

### 3. **Log Context**
```typescript
logger.info('Operation done', { quantity: 10, total: 100 }, userId, requestId);
```

### 4. **Never Expose Sensitive Data**
```typescript
// ✅ Good - sanitized
logger.error('DB error', error, undefined, userId, requestId);

// ❌ Bad - exposes connection string
logger.error(`DB error: ${error.message}`, error);
```

### 5. **Use Error Codes for Clients**
```typescript
// Response includes code for client-side handling
{
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",  // Client can handle this specifically
    "message": "Your session has expired",
    "timestamp": "2026-08-11T10:30:45.123Z"
  }
}
```

### 6. **Separate Input Validation from Business Logic**
```typescript
// ✅ Good - validation at start
if (!userId) throw new ApiError(...);
if (amount <= 0) throw new ApiError(...);
// Then execute business logic

// ❌ Bad - validation mixed with logic
const user = await getUser(userId); // What if userId is invalid?
```

---

## Testing Error Handling

### Unit Test Example
```typescript
describe('UserController.updateProfile', () => {
  it('should return 400 for invalid name', async () => {
    const req = {
      body: { name: 123 },
      userId: 'user-1',
      headers: { 'x-request-id': 'req-123' }
    } as Request;
    const res = { status: jest.fn().returnThis(), json: jest.fn() };
    const next = jest.fn();

    await controller.updateProfile(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        errorCode: 'VALIDATION_FAILED'
      })
    );
  });
});
```

---

## Environment Configuration

Add these to `.env` for production:

```bash
# Logging
NODE_ENV=production
LOG_LEVEL=info

# Monitoring
SENTRY_DSN=https://...
DD_API_KEY=...
AWS_REGION=...

# API
API_PORT=3000
JWT_SECRET=...
```

---

## Checklist for Production Deployment

- [ ] All controllers updated with error handling
- [ ] Environment variables configured
- [ ] Monitoring service integrated (Sentry/DataDog)
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] HTTPS enforced
- [ ] Sensitive error details masked
- [ ] Request ID tracking enabled
- [ ] Log retention policy configured
- [ ] Error alerts configured
- [ ] Tested error scenarios (404, 500, validation)
- [ ] API documentation includes error codes

---

## Troubleshooting

### Error not being caught
- Ensure controller returns via `next(error)` for async errors
- Check that asyncHandler wrapper is used
- Verify middleware order in app.ts

### Missing request ID
- Ensure requestIdMiddleware is registered first
- Check that errors include requestId when logging

### Sensitive data in logs
- Sanitizer should redact emails, tokens, URLs
- Test logger with sensitive data
- Update sanitizeErrorMessage() for new patterns

---

## Monitoring Alerts

Set up alerts for:

```
- ERROR count > 10/minute
- AUTH_UNAUTHORIZED > 50/minute (potential attack)
- DATABASE_ERROR > 5/minute (connectivity issues)
- Response time > 5s (performance degradation)
- 500 errors (critical failures)
```

---

## Support

For questions or issues with error handling:
1. Check error code in ErrorCodes
2. Review controller implementation pattern
3. Check logs for request ID context
4. Verify monitoring integration is active

