# Swagger Quick Reference

## Access Documentation

```bash
# Start the server
npm run dev

# Open Swagger UI in browser
http://localhost:5000/api-docs

# Export specs
curl http://localhost:5000/api-docs/swagger.json > openapi.json
curl http://localhost:5000/api-docs/swagger.yaml > openapi.yaml
```

## Authentication in Swagger UI

1. Click **Authorize** button (top right)
2. Paste JWT token from login response
3. Token will be included in all subsequent requests
4. Click logout to clear token

## Base URL

```
Development: http://localhost:5000
Production: https://api.saans.com
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found |
| 429  | Too Many Requests (rate limited) |
| 500  | Server Error |

## Authentication

### Login & Get Token
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "refresh_token_here"
  }
}
```

### Use Token
```
Header: Authorization: Bearer <accessToken>
```

### Refresh Token (expires in 1 hour)
```
POST /api/auth/refresh-token
{
  "refreshToken": "<refreshToken>"
}
```

## Common Endpoints

### User Profile
```
GET  /api/auth/me                    - Get current user
PUT  /api/auth/profile               - Update profile
POST /api/auth/change-password       - Change password
POST /api/auth/logout                - Logout
```

### Therapists
```
GET  /api/therapists                 - List all therapists
GET  /api/therapists/{id}            - Get therapist details
GET  /api/therapists/availability/{id}  - Get available slots
GET  /api/therapists/reviews/{id}    - Get reviews
POST /api/therapists/profile         - Create profile (therapist)
PUT  /api/therapists/profile/{id}    - Update profile (therapist)
```

### Appointments
```
POST /api/appointments/book          - Book appointment
GET  /api/appointments/my-appointments  - My appointments
GET  /api/appointments/{id}          - Get details
PUT  /api/appointments/{id}/status   - Update status
POST /api/appointments/{id}/reschedule - Reschedule
POST /api/appointments/{id}/cancel   - Cancel
GET  /api/appointments/slots/{therapistId} - Available slots
```

### Mood Tracking
```
POST /api/moods/track                - Track mood
GET  /api/moods/my-moods             - Get history
GET  /api/moods/analytics            - Get analytics
GET  /api/moods/date-range           - Query by date
PUT  /api/moods/{id}                 - Update entry
DELETE /api/moods/{id}               - Delete entry
```

### Crisis Support
```
POST /api/crisis/detect              - Detect crisis (public)
GET  /api/crisis/hotlines            - Get hotlines (public)
POST /api/crisis/alert               - Trigger alert
GET  /api/crisis/my-incidents        - My incidents
PUT  /api/crisis/incident/{id}/status - Update status
POST /api/crisis/incident/{id}/escalate - Escalate
GET  /api/crisis/statistics          - Statistics
```

### Community
```
GET  /api/community/groups           - List groups
POST /api/community/groups/{id}/join - Join group
POST /api/community/groups/{id}/leave - Leave group
GET  /api/community/posts            - Feed
POST /api/community/groups/{id}/posts - Create post
POST /api/community/posts/{id}/like  - Like post
GET  /api/community/posts/{id}/comments - Get comments
POST /api/community/posts/{id}/comments - Add comment
```

### Payments
```
GET  /api/payments/plans             - Get plans (public)
POST /api/payments/create-order      - Create order
POST /api/payments/verify-payment    - Verify payment
GET  /api/payments/subscription-status - Subscription status
POST /api/payments/cancel-subscription - Cancel subscription
GET  /api/payments/payment-history   - Payment history
```

### AI Counselor
```
POST /api/ai/chat                    - Chat with AI (public)
```

### Authentication (2FA)
```
GET  /api/auth/2fa/setup             - Setup 2FA
POST /api/auth/2fa/verify-setup      - Verify 2FA setup
POST /api/auth/2fa/verify-login      - Verify 2FA login
POST /api/auth/2fa/disable           - Disable 2FA
GET  /api/auth/2fa/status            - Get 2FA status
POST /api/auth/2fa/regenerate-backup-codes - Get backup codes
```

## Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=SCHEDULED
?specialty=Anxiety
?minRating=4.5
?availability=true
```

### Date Range
```
?startDate=2024-08-01&endDate=2024-08-31
?days=30
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Token expired or missing",
  "code": "UNAUTHORIZED"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

## Tips

1. **Test Public Endpoints First** - Try crisis/detect or AI/chat without auth
2. **Use Authorize Button** - Easier than copying tokens manually
3. **Check Examples** - Each endpoint has example request/response
4. **Read Descriptions** - Hover over parameters for details
5. **Export Spec** - Use JSON/YAML for external tools or documentation

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Login | 5 req/min |
| Register | 3 req/min |
| Password Reset | 5 req/min |
| 2FA Setup | 10 req/min |
| 2FA Verify | 10 req/min |
| Crisis Detect | 10 req/min |
| General | 100 req/min |

## Response Time

- Typical: 100-500ms
- With auth: 200-800ms
- File upload: 1-5s
- AI response: 5-30s

## Common Tasks

### Get User Profile
1. Login to get token
2. Click Authorize, paste token
3. GET /api/auth/me
4. Copy user ID from response

### Book Appointment
1. GET /api/therapists - find therapist
2. GET /api/appointments/slots/{therapistId} - find slot
3. POST /api/appointments/book with therapist ID and date
4. Check response for confirmation

### Track Mood
1. POST /api/moods/track with score (1-10) and category
2. GET /api/moods/my-moods - view history
3. GET /api/moods/analytics - see trends

### Test Payment Flow
1. GET /api/payments/plans - view plans
2. POST /api/payments/create-order with plan ID
3. Use Razorpay test cards in payment form
4. POST /api/payments/verify-payment with order details

## Files to Reference

- **Endpoints**: See /src/routes/
- **Schemas**: See swagger.ts components.schemas
- **Auth**: /src/middleware/authMiddleware.ts
- **Rate Limiting**: /src/middleware/rateLimitMiddleware.ts

## Need Help?

1. Read endpoint description in Swagger UI
2. Check example request/response
3. Verify all required parameters are provided
4. Check response code and error message
5. Review SWAGGER_SETUP_GUIDE.md for detailed info

## Production Checklist

- [ ] Change servers to production URL
- [ ] Disable "Try it out" in production
- [ ] Use HTTPS only
- [ ] Verify rate limits are configured
- [ ] Test Swagger UI on production domain
- [ ] Export OpenAPI spec for documentation
- [ ] Update contact email in info
- [ ] Test authentication flow
- [ ] Verify error responses
- [ ] Check API response times

## Export for External Use

```bash
# JSON format
curl http://localhost:5000/api-docs/swagger.json > api-spec.json

# YAML format
curl http://localhost:5000/api-docs/swagger.yaml > api-spec.yaml

# Use with Postman
# File > Import > Link > paste JSON/YAML URL

# Use with Insomnia
# Create API > Design > Paste YAML/JSON
```
