# Password Reset & Email Verification API Documentation

## Overview

The SAANS backend now includes a complete, production-ready password reset and email verification system with:

- Secure token generation using cryptographically strong random bytes
- Token hashing to prevent database leakage
- 24-hour token expiry with timing-safe verification
- Comprehensive email templates with HTML formatting
- Rate limiting on sensitive endpoints
- User enumeration protection
- SendGrid integration (with SMTP/logging fallback)
- Email confirmation for password changes

## Features

### 1. Email Verification on Signup
- Automatically sends verification email after user registration
- Verification link valid for 24 hours
- Marks user as verified after successful email verification
- Resend functionality with rate limiting
- Welcome email sent after verification

### 2. Password Reset Flow
- Request password reset with email only
- Secure reset link sent via email (24h expiry)
- Token validation with timing-safe comparison
- Password change confirmation email
- Expired token handling with re-request ability

### 3. Security Features
- **Token Hashing**: Tokens are hashed before storage (SHA-256)
- **Timing-Safe Comparison**: Prevents timing attacks
- **User Enumeration Protection**: Same response for existing/non-existing emails
- **Rate Limiting**: Applied to forgot-password and reset endpoints
- **Refresh Token Rotation**: Enhanced login security

---

## API Endpoints

### 1. User Registration (Updated)

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user and send verification email

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "role": "PATIENT",
  "city": "Mumbai"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": "user-id-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT",
    "city": "Mumbai"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Notes**:
- Verification email is automatically sent after registration
- User can login immediately but features may be restricted until verified
- `emailVerified` field is `false` until email verification is complete

---

### 2. Verify Email

**Endpoint**: `GET /api/auth/verify-email`

**Description**: Verify user's email address using token from email link

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Verification token sent via email |
| email | string | Yes | User's email address |

**Example URL**:
```
/api/auth/verify-email?token=abc123def456&email=user@example.com
```

**Response (200 OK)**:
```json
{
  "message": "Email has been verified successfully"
}
```

**Error Responses**:

**400 Bad Request** (Missing parameters):
```json
{
  "statusCode": 400,
  "message": "Missing required fields",
  "error": "VALIDATION_FAILED",
  "details": {
    "required": ["token", "email"]
  }
}
```

**400 Bad Request** (Invalid token):
```json
{
  "statusCode": 400,
  "message": "Invalid or expired token. Please try again.",
  "error": "VALIDATION_FAILED"
}
```

**410 Gone** (Token expired):
```json
{
  "statusCode": 410,
  "message": "Verification token has expired. Please request a new one.",
  "error": "TOKEN_EXPIRED"
}
```

---

### 3. Resend Verification Email

**Endpoint**: `POST /api/auth/resend-verification`

**Description**: Resend verification email for a user's email address

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "Verification email has been sent"
}
```

**Error Responses**:

**400 Bad Request** (Invalid email):
```json
{
  "statusCode": 400,
  "message": "Invalid email format",
  "error": "INVALID_EMAIL"
}
```

**429 Too Many Requests** (Rate limited):
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "RATE_LIMITED"
}
```

**Notes**:
- Rate limited to prevent abuse
- Can be called multiple times if email not received
- New verification token is generated on each request

---

### 4. Request Password Reset

**Endpoint**: `POST /api/auth/forgot-password`

**Description**: Request a password reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

**Notes**:
- Always returns success message (user enumeration protection)
- Email contains reset link with 24-hour expiry
- Reset link includes token and email as query parameters
- Rate limited to prevent brute force attacks

---

### 5. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Description**: Reset password using the token from reset email

**Request Body**:
```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses**:

**400 Bad Request** (Validation error):
```json
{
  "statusCode": 400,
  "message": "Passwords do not match",
  "error": "VALIDATION_FAILED"
}
```

**400 Bad Request** (Weak password):
```json
{
  "statusCode": 400,
  "message": "Password must be at least 6 characters long",
  "error": "VALIDATION_FAILED"
}
```

**400 Bad Request** (Invalid token):
```json
{
  "statusCode": 400,
  "message": "Invalid or expired token. Please try again.",
  "error": "VALIDATION_FAILED"
}
```

**410 Gone** (Token expired):
```json
{
  "statusCode": 410,
  "message": "Reset token has expired. Please request a new one.",
  "error": "TOKEN_EXPIRED"
}
```

---

## Email Templates

### 1. Verification Email

Sent immediately after user registration.

**Subject**: `SAANS - Verify Your Email Address`

**Content**:
- Welcome message
- Verification button with link
- Instructions to copy link manually
- 24-hour expiry warning
- Security reminder not to share link
- Call-to-action features after verification

---

### 2. Password Reset Email

Sent when user requests password reset.

**Subject**: `SAANS - Reset Your Password`

**Content**:
- Reset request acknowledgment
- Reset button with link
- Instructions to copy link manually
- 24-hour expiry warning
- Security warning if not requested by user
- Support team contact information

---

### 3. Welcome Email

Sent after successful email verification.

**Subject**: `Welcome to SAANS - Your Mental Health Companion`

**Content**:
- Personalized welcome
- Feature overview (Therapists, AI Chat, Mood Tracking, Community)
- Getting started guide
- Support contact information

---

### 4. Password Changed Confirmation

Sent when password is changed or reset.

**Subject**: `SAANS - Password Changed Successfully`

**Content**:
- Confirmation of password change
- Security recommendations
- Support contact if suspicious activity

---

### 5. Appointment Reminder (Future)

For therapy session reminders.

**Subject**: `SAANS - Appointment Reminder`

**Content**:
- Therapist name and appointment time
- Session duration
- Preparation tips
- Rescheduling instructions

---

## Database Schema

### User Model Updates

New fields added to `User` model in `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...

  // Email Verification
  emailVerified            Boolean   @default(false)
  emailVerificationToken   String?
  emailVerificationExpiry  DateTime?
  emailVerificationSentAt  DateTime?

  // Password Reset
  passwordResetToken       String?
  passwordResetExpiry      DateTime?
}
```

### Field Descriptions

| Field | Type | Purpose |
|-------|------|---------|
| `emailVerified` | Boolean | Tracks if email has been verified |
| `emailVerificationToken` | String | Hashed verification token |
| `emailVerificationExpiry` | DateTime | Token expiry timestamp |
| `emailVerificationSentAt` | DateTime | When verification email was sent |
| `passwordResetToken` | String | Hashed password reset token |
| `passwordResetExpiry` | DateTime | Token expiry timestamp |

---

## Security Considerations

### 1. Token Security

```typescript
// Tokens are generated using cryptographically secure random bytes
const token = crypto.randomBytes(32).toString('hex'); // 64 hex chars

// Tokens are hashed before storage (SHA-256)
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

// Verification uses timing-safe comparison
crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(stored_hash));
```

### 2. User Enumeration Protection

Both `/forgot-password` and `/resend-verification` endpoints return the same success message regardless of whether the email exists:

```
"If an account exists with that email, a password reset link has been sent."
```

This prevents attackers from discovering which emails are registered.

### 3. Rate Limiting

- `POST /forgot-password`: Same limiter as login (default: 5 requests per minute per IP)
- `POST /reset-password`: Same limiter as login
- `POST /resend-verification`: Same limiter as registration (default: 3 requests per minute per IP)
- `GET /verify-email`: No rate limit (user may retry after network issues)

### 4. Token Expiry

- Email verification tokens: **24 hours**
- Password reset tokens: **24 hours**
- Expired tokens are automatically cleared from database

### 5. Timing Attacks

Password comparisons use `crypto.timingSafeEqual()` to prevent timing-based attacks that could reveal password validity.

---

## Integration Guide

### Frontend Implementation

#### 1. Registration Flow

```typescript
// User registers
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123',
    name: 'John Doe',
  }),
});

// Backend sends verification email automatically
// Show message: "Please check your email to verify your account"
```

#### 2. Email Verification

```typescript
// User clicks link in email: /verify-email?token=xxx&email=yyy
const verifyResponse = await fetch(
  `/api/auth/verify-email?token=${token}&email=${email}`,
  { method: 'GET' }
);

if (verifyResponse.ok) {
  // Redirect to login or dashboard
  // Show success: "Email verified successfully!"
}
```

#### 3. Password Reset

```typescript
// Step 1: User requests reset
const resetRequestResponse = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
});
// Show: "Check your email for reset instructions"

// Step 2: User clicks email link
// Frontend shows password reset form

// Step 3: User submits new password
const resetResponse = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: resetToken,
    email: 'user@example.com',
    newPassword: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  }),
});

if (resetResponse.ok) {
  // Redirect to login
  // Show: "Password reset successfully. Please login with your new password."
}
```

---

## Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
SENDGRID_API_KEY="SG.xxxxx"          # SendGrid API key
SENDGRID_FROM_EMAIL="noreply@saans.app"

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:5173"

# Token Configuration (optional, uses defaults)
# PASSWORD_RESET_EXPIRY_HOURS=24
# EMAIL_VERIFICATION_EXPIRY_HOURS=24

# Rate Limiting (existing)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Email Service Providers

The system supports multiple email providers:

1. **SendGrid** (Recommended for production)
   - Requires: `SENDGRID_API_KEY`
   - Automatic fallback to logging if key not set

2. **SMTP** (Future implementation)
   - Will support custom SMTP servers
   - Requires: `SMTP_HOST`, `SMTP_PORT`, etc.

3. **Logging** (Development)
   - Prints email to console
   - Used when no provider is configured

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_FAILED` | 400 | Invalid input data |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `TOKEN_EXPIRED` | 410 | Token has expired |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Email already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing

Run tests with:

```bash
npm test -- auth-reset-verification.test.ts
```

Tests cover:
- Email verification flow
- Password reset flow
- Invalid/expired token handling
- Security features (hashing, expiry)
- Rate limiting
- Error handling

---

## Migration & Deployment

### Running Migration

```bash
# Development
npm run migrate

# Production
npm run migrate:prod
```

### Rollback

```bash
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate reset
```

---

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid Key**:
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Enable Fallback Logging**:
   - Remove `SENDGRID_API_KEY` to see emails in console

3. **Check Email Service Logs**:
   ```bash
   grep "Email sent" logs/app.log
   grep "Email sending failed" logs/app.log
   ```

### Tokens Not Working

1. **Check Token Expiry**:
   - Database: `SELECT passwordResetExpiry FROM "User" WHERE email = 'xxx'`

2. **Verify Token Hashing**:
   - Raw token should be different from stored hash

3. **Check Rate Limiting**:
   - May be blocking requests

---

## Performance Metrics

- Token generation: ~1-2ms (crypto.randomBytes)
- Token hashing: ~0.5-1ms (SHA-256)
- Token verification: ~0.5-1ms (timing-safe comparison)
- Email sending: ~500-2000ms (depends on provider)

---

## Future Enhancements

1. **Two-Factor Authentication**
   - SMS/TOTP codes for additional security

2. **Password Strength Meter**
   - Real-time feedback on password security

3. **Suspicious Login Detection**
   - Alert on logins from new devices/locations

4. **Session Management**
   - Invalidate old sessions on password change

5. **Email Change Flow**
   - Verify new email before switching

6. **Account Recovery**
   - Security questions or backup codes

---

## Support

For issues or questions:
- Email: support@saans.app
- GitHub Issues: [SAANS Repository]
- Documentation: [API Docs]
