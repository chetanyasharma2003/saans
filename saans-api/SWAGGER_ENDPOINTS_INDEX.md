# SAANS API Endpoints Index

Complete listing of all 69 documented API endpoints organized by feature.

## Access Documentation

**Swagger UI**: http://localhost:5000/api-docs  
**OpenAPI JSON**: http://localhost:5000/api-docs/swagger.json  
**OpenAPI YAML**: http://localhost:5000/api-docs/swagger.yaml

---

## Authentication (17 Endpoints)

### Registration & Login
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user account |
| POST | `/api/auth/login` | ❌ | Login to account |
| POST | `/api/auth/logout` | ❌ | Logout and invalidate tokens |

### Token Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/refresh-token` | ❌ | Get new access token |

### Email Verification
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/resend-verification` | ❌ | Resend verification email |
| GET | `/api/auth/verify-email` | ❌ | Verify email with token |

### Password Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| POST | `/api/auth/change-password` | ✅ | Change current password |

### Profile Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/me` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update user profile |

### Two-Factor Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/2fa/setup` | ✅ | Get QR code for 2FA setup |
| POST | `/api/auth/2fa/verify-setup` | ✅ | Complete 2FA setup |
| POST | `/api/auth/2fa/verify-login` | ❌ | Verify 2FA code at login |
| POST | `/api/auth/2fa/disable` | ✅ | Disable 2FA |
| GET | `/api/auth/2fa/status` | ✅ | Get 2FA status |
| POST | `/api/auth/2fa/regenerate-backup-codes` | ✅ | Get new backup codes |

---

## Therapists (10 Endpoints)

### Browse Therapists (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/therapists` | ❌ | List all therapists with filters |
| GET | `/api/therapists/{id}` | ❌ | Get therapist details |
| GET | `/api/therapists/search/{query}` | ❌ | Search therapists by name/specialty |

### Therapist Availability (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/therapists/availability/{id}` | ❌ | Get available time slots |

### Therapist Reviews & Stats (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/therapists/reviews/{id}` | ❌ | Get therapist reviews |
| GET | `/api/therapists/stats/{id}` | ❌ | Get therapist statistics |

### Therapist Profile Management (Protected)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/therapists/profile` | ✅ | Create therapist profile |
| PUT | `/api/therapists/profile/{id}` | ✅ | Update therapist profile |
| PUT | `/api/therapists/availability/{id}` | ✅ | Update availability slots |

---

## Appointments (9 Endpoints)

### Booking
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/appointments/book` | ✅ | Book new appointment |

### Availability Checking
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/appointments/availability/{therapistId}` | ✅ | Check if therapist available |
| GET | `/api/appointments/slots/{therapistId}` | ✅ | Get available time slots |

### Viewing Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/appointments/my-appointments` | ✅ | Get user's appointments |
| GET | `/api/appointments/therapist-appointments/{id}` | ✅ | Get therapist's appointments |
| GET | `/api/appointments/{id}` | ✅ | Get appointment details |

### Managing Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/appointments/{id}/status` | ✅ | Update appointment status |
| POST | `/api/appointments/{id}/reschedule` | ✅ | Reschedule appointment |
| POST | `/api/appointments/{id}/cancel` | ✅ | Cancel appointment |

---

## Mood Tracking (6 Endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/moods/track` | ✅ | Create new mood entry |
| GET | `/api/moods/my-moods` | ✅ | Get mood history |
| GET | `/api/moods/analytics` | ✅ | Get mood analytics & trends |
| GET | `/api/moods/date-range` | ✅ | Get moods for date range |
| PUT | `/api/moods/{id}` | ✅ | Update mood entry |
| DELETE | `/api/moods/{id}` | ✅ | Delete mood entry |

---

## Crisis Support (8 Endpoints)

### Public Crisis Tools
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/crisis/detect` | ❌ | Analyze message for crisis |
| GET | `/api/crisis/hotlines` | ❌ | Get emergency hotlines |

### Crisis Management (Protected)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/crisis/alert` | ✅ | Trigger emergency alert |
| GET | `/api/crisis/my-incidents` | ✅ | Get user's incidents |
| PUT | `/api/crisis/incident/{id}/status` | ✅ | Update incident status |
| POST | `/api/crisis/incident/{id}/escalate` | ✅ | Escalate to therapist |
| GET | `/api/crisis/statistics` | ✅ | Get crisis statistics |

---

## Community (12 Endpoints)

### Groups Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community/groups` | ✅ | List all groups |
| GET | `/api/community/groups/{id}` | ✅ | Get group details |
| POST | `/api/community/groups/{id}/join` | ✅ | Join group |
| POST | `/api/community/groups/{id}/leave` | ✅ | Leave group |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community/posts` | ✅ | Get all posts |
| GET | `/api/community/posts/{id}` | ✅ | Get post details |
| GET | `/api/community/groups/{id}/posts` | ✅ | Get group posts |
| POST | `/api/community/groups/{id}/posts` | ✅ | Create post in group |
| POST | `/api/community/posts/{id}/like` | ✅ | Like/unlike post |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community/posts/{id}/comments` | ✅ | Get post comments |
| POST | `/api/community/posts/{id}/comments` | ✅ | Add comment to post |
| POST | `/api/community/comments/{id}/like` | ✅ | Like/unlike comment |

---

## Payments (6 Endpoints)

### Plans (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payments/plans` | ❌ | Get subscription plans |

### Payment Processing
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-order` | ✅ | Create Razorpay order |
| POST | `/api/payments/verify-payment` | ✅ | Verify payment signature |

### Subscription Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payments/subscription-status` | ✅ | Get subscription status |
| POST | `/api/payments/cancel-subscription` | ✅ | Cancel subscription |
| GET | `/api/payments/payment-history` | ✅ | Get payment history |

---

## AI Counselor (1 Endpoint)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/chat` | ❌ | Chat with AI counselor |

---

## Summary by Method

### GET Endpoints (26 total)
```
Authentication (3): me, 2fa/status, verify-email
Therapists (6): list, get, search, availability, reviews, stats
Appointments (3): my-appointments, therapist-appointments, details, availability, slots
Mood (2): my-moods, analytics, date-range
Crisis (2): hotlines, my-incidents, statistics
Community (4): groups, group-details, posts, group-posts, comments
Payments (2): plans, subscription-status, payment-history
```

### POST Endpoints (35 total)
```
Authentication (6): register, login, refresh-token, forgot-password, reset-password, resend-verification
Therapists (1): profile
Appointments (3): book, reschedule, cancel
Mood (1): track
Crisis (3): detect, alert, escalate
Community (6): join-group, create-post, like-post, add-comment, like-comment
Payments (3): create-order, verify-payment, cancel-subscription
AI (1): chat
2FA (4): verify-setup, verify-login, disable, regenerate-codes
```

### PUT Endpoints (5 total)
```
Authentication (1): profile, change-password
Therapists (2): profile, availability
Appointments (1): status
Mood (1): update entry
Crisis (1): incident status
```

### DELETE Endpoints (1 total)
```
Mood (1): delete entry
```

---

## Summary by Authentication

### Public Endpoints (20 total)
- Register, Login, Refresh Token
- Forgot/Reset Password
- Resend Verification, Verify Email
- List Therapists, Get Therapist Details, Search, Availability, Reviews, Stats
- Detect Crisis, Get Hotlines
- Get Plans
- Chat with AI
- 2FA Verify Login

### Protected Endpoints (49 total)
- Everything else requires JWT Bearer Token
- All user-specific operations
- All appointment/therapist management
- All community features
- All payment operations
- All mood tracking
- Crisis management and statistics

---

## Common Tasks & Endpoints

### User Registration & Login
1. POST `/api/auth/register` - Create account
2. POST `/api/auth/login` - Get tokens
3. POST `/api/auth/verify-email` - Activate account

### Finding & Booking Therapist
1. GET `/api/therapists` - List therapists
2. GET `/api/therapists/{id}` - Get details
3. GET `/api/therapists/availability/{id}` - Check availability
4. GET `/api/appointments/slots/{therapistId}` - Get time slots
5. POST `/api/appointments/book` - Book appointment

### Mood Tracking & Analytics
1. POST `/api/moods/track` - Record mood
2. GET `/api/moods/my-moods` - View history
3. GET `/api/moods/analytics` - See trends

### Crisis Support
1. POST `/api/crisis/detect` - Check if crisis
2. GET `/api/crisis/hotlines` - Get emergency numbers
3. POST `/api/crisis/alert` - Trigger alert (if registered)
4. POST `/api/crisis/incident/{id}/escalate` - Get therapist help

### Community Engagement
1. GET `/api/community/groups` - Find groups
2. POST `/api/community/groups/{id}/join` - Join group
3. GET `/api/community/posts` - View posts
4. POST `/api/community/groups/{id}/posts` - Create post
5. POST `/api/community/posts/{id}/comments` - Add comment

### Subscription Management
1. GET `/api/payments/plans` - View plans
2. POST `/api/payments/create-order` - Start purchase
3. POST `/api/payments/verify-payment` - Complete purchase
4. GET `/api/payments/subscription-status` - Check status
5. POST `/api/payments/cancel-subscription` - Cancel

### 2FA Setup
1. GET `/api/auth/2fa/setup` - Get QR code
2. POST `/api/auth/2fa/verify-setup` - Enable 2FA
3. GET `/api/auth/2fa/status` - Check status
4. POST `/api/auth/2fa/disable` - Turn off 2FA

---

## Rate Limits

| Endpoint Pattern | Limit | Period |
|---|---|---|
| POST /auth/login | 5 | per minute |
| POST /auth/register | 3 | per minute |
| POST /auth/forgot-password | 5 | per minute |
| POST /auth/reset-password | 5 | per minute |
| POST /auth/change-password | 5 | per minute |
| GET/POST /auth/2fa/* | 10 | per minute |
| POST /crisis/detect | 10 | per minute |
| POST /payments/create-order | 5 | per minute |
| POST /payments/verify-payment | 5 | per minute |
| General API | 100 | per minute |

---

## Response Status Codes

| Code | Meaning | Common Endpoints |
|------|---------|---|
| 200 | OK - Success | GET, PUT, most POST |
| 201 | Created - Resource created | POST endpoints |
| 400 | Bad Request - Validation error | Most endpoints |
| 401 | Unauthorized - Missing/invalid token | Protected endpoints |
| 403 | Forbidden - Insufficient permissions | Admin/owner only |
| 404 | Not Found - Resource doesn't exist | GET by ID |
| 429 | Too Many Requests - Rate limited | Rate-limited endpoints |
| 500 | Server Error - Internal error | Any endpoint (rare) |

---

## Token Management

### Get Access Token
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
# Returns: { "accessToken": "...", "refreshToken": "..." }
```

### Use Token
```bash
Authorization: Bearer <accessToken>
```

### Refresh Token (expires in 1 hour)
```bash
POST /api/auth/refresh-token
{
  "refreshToken": "<refreshToken>"
}
```

---

## Quick Links

- **Swagger UI**: http://localhost:5000/api-docs
- **OpenAPI JSON**: http://localhost:5000/api-docs/swagger.json
- **OpenAPI YAML**: http://localhost:5000/api-docs/swagger.yaml
- **Setup Guide**: SWAGGER_SETUP_GUIDE.md
- **Quick Reference**: SWAGGER_QUICK_REFERENCE.md
- **Implementation**: SWAGGER_IMPLEMENTATION_SUMMARY.md

---

**Last Updated**: August 13, 2026  
**Total Endpoints**: 69  
**Public Endpoints**: 20  
**Protected Endpoints**: 49  
**Documentation**: ✅ COMPLETE
