# SAANS API - Swagger/OpenAPI 3.0 Documentation Setup

Complete REST API documentation for SAANS Mental Health Platform with interactive Swagger UI for testing endpoints.

## Overview

This project now includes comprehensive OpenAPI 3.0 documentation using Swagger UI and swagger-jsdoc. All endpoints are documented with:

- Detailed descriptions
- Request/response schemas
- Security requirements
- Example values
- Error responses
- Parameter documentation

## Quick Start

### Access Swagger UI

Once the server is running, open your browser and navigate to:

```
http://localhost:5000/api-docs
```

### Get OpenAPI Specs

- **JSON Format**: `http://localhost:5000/api-docs/swagger.json`
- **YAML Format**: `http://localhost:5000/api-docs/swagger.yaml`

## Features

### Interactive Testing

- **Try it out** button on each endpoint
- Send test requests directly from Swagger UI
- View response status, headers, and body
- Automatic JWT token management with "Authorize" button

### Comprehensive Documentation

- All 60+ endpoints documented
- Request/response schemas with examples
- Security definitions (JWT Bearer tokens)
- Parameter descriptions and types
- Error response examples

### Production Ready

- Set to read-only in production environments
- Secure by default with HTTPS servers configured
- Supports both development and production URLs
- Export OpenAPI spec for external tools

## Documented Endpoints

### Authentication (17 endpoints)
- User registration & login
- Password reset & change
- Email verification
- Two-factor authentication (setup, verify, disable, backup codes)
- Profile management

### Therapists (10 endpoints)
- List & search therapists
- View therapist profiles & availability
- Get reviews & statistics
- Create/update therapist profile
- Manage availability slots

### Appointments (9 endpoints)
- Book appointments
- Reschedule & cancel
- Check availability & view slots
- Manage appointment status
- View user & therapist appointments

### Mood Tracking (6 endpoints)
- Track mood entries
- View mood history
- Get analytics & trends
- Query by date range
- Update & delete entries

### Crisis Support (8 endpoints)
- Detect crisis in messages
- Emergency hotlines
- Trigger alerts
- Manage incidents
- Escalate to therapist
- View statistics

### Community (11 endpoints)
- Join/leave groups
- Create & view posts
- Comment on posts
- Like posts & comments
- Browse community feed

### Payments (6 endpoints)
- Get subscription plans
- Create payment orders
- Verify payments
- Manage subscriptions
- View payment history

### AI Counselor (1 endpoint)
- Chat with AI counselor

## Security

### Authentication Methods

1. **JWT Bearer Token** (Protected endpoints)
   - Header: `Authorization: Bearer <token>`
   - Issued on login/registration
   - Expires in 1 hour

2. **Refresh Token** (HttpOnly Cookie)
   - Automatically sent with requests
   - Used to obtain new access tokens
   - Expires in 7 days

3. **Rate Limiting**
   - Login: 5 attempts per minute
   - Registration: 3 attempts per minute
   - Password reset: 5 attempts per minute
   - 2FA setup: 10 attempts per minute
   - 2FA verify: 10 attempts per minute
   - Crisis detection: 10 requests per minute

### Security Headers

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Permissions Policy

## API Response Format

All endpoints follow consistent response format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

## Example Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Book Appointment
```bash
curl -X POST http://localhost:5000/api/appointments/book \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "123e4567-e89b-12d3-a456-426614174000",
    "scheduledAt": "2024-08-20T14:00:00Z",
    "duration": 60,
    "reason": "Anxiety management"
  }'
```

### Track Mood
```bash
curl -X POST http://localhost:5000/api/moods/track \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "moodScore": 7,
    "moodCategory": "Happy",
    "notes": "Had a good day",
    "triggers": ["Work success"]
  }'
```

## Schema Definitions

Complete OpenAPI schemas defined for:

- **User** - User profile with role and auth status
- **AuthResponse** - Login/register response with tokens
- **Appointment** - Appointment details and status
- **Therapist** - Therapist profile and availability
- **Mood** - Mood entry with emotions and triggers
- **CrisisIncident** - Crisis detection and management
- **CommunityGroup** - Community group details
- **CommunityPost** - Post with likes and comments
- **Plan** - Subscription plan details
- **Payment** - Payment transaction record
- **Subscription** - Active subscription status

## Integration with External Tools

Export OpenAPI spec for integration with:

- **Postman** - Import from `/api-docs/swagger.json`
- **Insomnia** - Import from `/api-docs/swagger.yaml`
- **API Documentation Portals** - Use OpenAPI JSON/YAML
- **Code Generation** - Generate client libraries
- **API Testing** - Automated testing frameworks

## Development Setup

### Files Modified

1. **src/utils/swagger.ts** - Swagger configuration and setup
2. **src/app.ts** - Integrated Swagger UI into Express app
3. **src/routes/** - Added JSDoc comments to all route files:
   - authRoutes.ts
   - therapistRoutes.ts
   - appointmentRoutes.ts
   - moodRoutes.ts
   - crisisRoutes.ts
   - communityRoutes.ts
   - paymentRoutes.ts
   - aiRoutes.ts

### Environment Variables

No additional environment variables required. Swagger uses:
- `NODE_ENV` - Set servers based on environment
- `cors.origin` - Already configured for CORS

### Dependencies

- **swagger-ui-express** - Serve Swagger UI
- **swagger-jsdoc** - Extract OpenAPI specs from JSDoc
- **js-yaml** - Convert OpenAPI JSON to YAML

## Customization

### Update API Info

Edit `/src/utils/swagger.ts` in the `options.definition.info` section:

```typescript
info: {
  title: 'Your API Title',
  version: '1.0.0',
  description: 'Your description',
  contact: {
    name: 'Your Name',
    email: 'your@email.com',
    url: 'https://yoursite.com',
  },
}
```

### Add/Update Servers

Modify `options.definition.servers` to add development/staging/production URLs:

```typescript
servers: [
  {
    url: 'http://localhost:5000',
    description: 'Development',
  },
  {
    url: 'https://api.staging.saans.com',
    description: 'Staging',
  },
  {
    url: 'https://api.saans.com',
    description: 'Production',
  },
]
```

### Customize Swagger UI Appearance

Edit the `customCss` option in `setupSwagger()`:

```typescript
customCss: `
  .swagger-ui .info .title { font-size: 2em; color: #006400; }
  // Add your custom CSS
`
```

## Testing in Production

### Read-Only Mode

In production, disable interactive "Try it out" feature:

```typescript
swaggerOptions: {
  tryItOutEnabled: false,
  // ... other options
}
```

### Authentication

Swagger UI includes "Authorize" button for:
- Setting Bearer token
- Automatic token inclusion in requests
- Token persistence across requests

### Rate Limiting

- Production rate limiting is enabled
- Tests are rate-limited per endpoint
- See error responses for rate limit info

## Troubleshooting

### Swagger UI Not Loading

1. Ensure Express app is running: `npm run dev`
2. Check port configuration (default 5000)
3. Verify CORS is enabled for `/api-docs` route
4. Check browser console for errors

### Endpoints Not Showing

1. Verify JSDoc comments in route files
2. Ensure comments follow OpenAPI 3.0 syntax
3. Check `apis` array in swagger.ts includes all route files
4. Rebuild/restart server after changes

### Authorization Not Working

1. Click "Authorize" button in Swagger UI
2. Paste valid JWT token from login response
3. Token will be included in subsequent requests
4. Token expires in 1 hour (get new one with refresh endpoint)

### Import Errors

If importing from JSON/YAML in external tools:
1. Ensure server is running
2. Access `/api-docs/swagger.json` or `/api-docs/swagger.yaml`
3. Use correct file format for your tool
4. Verify CORS allows external access if applicable

## Best Practices

1. **Keep Documentation Updated** - Update JSDoc comments when modifying endpoints
2. **Use Examples** - Provide realistic example values in schemas
3. **Test Endpoints** - Use Swagger UI to test before deployment
4. **Export Specs** - Regularly export OpenAPI spec for version control
5. **Security** - Never expose sensitive data in documentation examples
6. **Version Control** - Document API version in responses
7. **Error Codes** - Document all possible error responses
8. **Pagination** - Include pagination schema in list endpoints

## Support

For issues or questions:
1. Check endpoint documentation in Swagger UI
2. Review OpenAPI specification
3. Check error response codes and messages
4. Refer to endpoint-specific guides

## Deployment

### Docker

Swagger UI works automatically with Docker:
- No additional configuration needed
- Accessible on containerized port
- OpenAPI spec exports work on container

### Vercel

Swagger UI works with Vercel serverless:
- Static files cached by Vercel
- API endpoints documented and testable
- Consider read-only mode in production

### Nginx Reverse Proxy

Ensure Swagger routes are proxied:
```nginx
location /api-docs {
  proxy_pass http://backend:5000/api-docs;
}
```

## Additional Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc GitHub](https://github.com/Surnet/swagger-jsdoc)
- [JSDoc Comment Syntax](https://jsdoc.app/)
