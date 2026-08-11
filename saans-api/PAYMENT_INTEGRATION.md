# Razorpay Payment Integration Guide

This document covers the complete Razorpay payment integration for SAANS Mental Health Platform.

## Overview

The payment system supports subscription plans in INR (Indian Rupees):
- **BASIC**: ₹99/month
- **PREMIUM**: ₹299/month
- **PLUS**: ₹499/month

## Setup

### 1. Install Dependencies

```bash
npm install razorpay
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

Get these credentials from your [Razorpay Dashboard](https://dashboard.razorpay.com/):
1. Go to Settings → API Keys
2. Copy your Key ID and Key Secret
3. Add them to your `.env` file

### 3. Database Schema

The integration uses existing Prisma models:
- `User` - Has `isPremium`, `subscriptionEndDate` fields
- `Subscription` - Stores subscription details
- `Payment` - Records all payment transactions

## API Endpoints

### 1. Get Available Plans

**GET** `/api/payments/plans`

No authentication required.

**Response:**
```json
{
  "success": true,
  "data": {
    "BASIC": {
      "name": "Basic",
      "price": 99,
      "currency": "INR",
      "billingCycle": "monthly",
      "features": [...]
    },
    "PREMIUM": { ... },
    "PLUS": { ... }
  }
}
```

### 2. Create Payment Order

**POST** `/api/payments/create-order`

Creates a Razorpay order for a subscription plan.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planType": "PREMIUM"
}
```

**Valid Plan Types:** `BASIC`, `PREMIUM`, `PLUS`

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_ABC123XYZ",
    "amount": 299,
    "currency": "INR",
    "planType": "PREMIUM"
  }
}
```

### 3. Verify Payment

**POST** `/api/payments/verify-payment`

Verifies payment signature and activates subscription.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_ABC123XYZ",
  "razorpay_payment_id": "pay_XYZ123ABC",
  "razorpay_signature": "signature_hash",
  "planType": "PREMIUM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "subscription_id",
    "userId": "user_id",
    "type": "PREMIUM",
    "startDate": "2024-01-15T10:30:00Z",
    "endDate": "2024-02-15T10:30:00Z",
    "autoRenewal": true,
    "features": [...]
  }
}
```

### 4. Get Subscription Status

**GET** `/api/payments/subscription-status`

Check user's current subscription status.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "subscription": {
      "id": "subscription_id",
      "type": "PREMIUM",
      "endDate": "2024-02-15T10:30:00Z",
      "autoRenewal": true
    },
    "daysRemaining": 30
  }
}
```

### 5. Get Payment History

**GET** `/api/payments/payment-history?limit=10&skip=0`

Retrieve user's payment transaction history.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit`: Number of records (1-100, default: 10)
- `skip`: Number of records to skip for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment_id",
      "userId": "user_id",
      "amount": 299,
      "currency": "INR",
      "subscriptionType": "PREMIUM",
      "status": "COMPLETED",
      "transactionId": "pay_XYZ123ABC",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "skip": 0,
    "pages": 1
  }
}
```

### 6. Cancel Subscription

**POST** `/api/payments/cancel-subscription`

Cancel user's active subscription and revert to FREE plan.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": "subscription_id",
    "type": "FREE",
    "endDate": "2024-01-15T10:30:00Z",
    "autoRenewal": false
  }
}
```

## Frontend Integration Guide

### 1. Display Available Plans

```typescript
const response = await fetch('/api/payments/plans');
const plans = await response.json();
```

### 2. Initiate Payment

```typescript
// Step 1: Create order
const orderResponse = await fetch('/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ planType: 'PREMIUM' })
});

const orderData = await orderResponse.json();
const { orderId, amount, currency } = orderData.data;

// Step 2: Open Razorpay checkout
const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID,
  amount: amount * 100, // Amount in paise
  currency,
  name: 'SAANS Mental Health',
  description: 'Premium Subscription',
  order_id: orderId,
  handler: async (response) => {
    // Step 3: Verify payment
    const verifyResponse = await fetch('/api/payments/verify-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        planType: 'PREMIUM'
      })
    });

    if (verifyResponse.ok) {
      // Payment successful
      console.log('Payment successful');
    }
  },
  prefill: {
    name: 'User Name',
    email: 'user@example.com'
  },
  theme: {
    color: '#3399cc'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 3. Check Subscription Status

```typescript
const response = await fetch('/api/payments/subscription-status', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const status = await response.json();
console.log('Active:', status.data.isActive);
console.log('Days Remaining:', status.data.daysRemaining);
```

### 4. Cancel Subscription

```typescript
const response = await fetch('/api/payments/cancel-subscription', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
```

## Subscription Plans & Features

### BASIC - ₹99/month
- Unlimited AI chat
- Mood tracking
- Therapy session booking (2/month)
- Resource library
- Crisis support

### PREMIUM - ₹299/month
- Unlimited AI chat
- Priority AI responses
- Mood tracking with insights
- Therapy sessions (4/month)
- Full resource library
- Crisis support with priority
- Personalized wellness plans

### PLUS - ₹499/month
- Unlimited AI chat
- Priority AI responses
- Advanced mood analytics
- Unlimited therapy sessions
- Full resource library
- Dedicated crisis support
- Personalized wellness plans
- One-on-one consultation
- Monthly progress reports

## Testing

### Test Payment Credentials

Use these test credentials in Razorpay dashboard:

**Razorpay Test Mode:**
- Key ID: From Razorpay Dashboard (Test Mode)
- Key Secret: From Razorpay Dashboard (Test Mode)

**Test Card Numbers:**
- Visa: `4111111111111111`
- Mastercard: `5555555555554444`
- Rupay: `6523456789012341`

All test cards:
- Expiry: Any future date
- CVV: Any 3 digits

### Manual Testing Steps

1. **Create Order Test:**
```bash
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"planType":"PREMIUM"}'
```

2. **Verify Payment Test:**
```bash
curl -X POST http://localhost:3000/api/payments/verify-payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id":"order_xxx",
    "razorpay_payment_id":"pay_yyy",
    "razorpay_signature":"signature_zzz",
    "planType":"PREMIUM"
  }'
```

3. **Check Status Test:**
```bash
curl -X GET http://localhost:3000/api/payments/subscription-status \
  -H "Authorization: Bearer <token>"
```

## Error Handling

### Common Errors

1. **Invalid Plan Type**
   - Status: 400
   - Message: "Invalid plan type. Valid options: FREE, BASIC, PREMIUM, PLUS"

2. **Unauthorized**
   - Status: 401
   - Message: "Unauthorized"

3. **Invalid Signature**
   - Status: 400
   - Message: "Invalid payment signature. Payment cannot be verified."

4. **User Not Found**
   - Status: 400
   - Message: "User not found"

### Error Response Format

```json
{
  "error": "Error message here"
}
```

## Security Best Practices

1. **Never expose RAZORPAY_KEY_SECRET** in frontend code
2. **Always verify signatures** before updating subscriptions
3. **Use HTTPS** in production
4. **Store payment records** for audit trails
5. **Implement rate limiting** on payment endpoints
6. **Validate all input** before processing payments
7. **Log all payment attempts** for security monitoring

## Production Deployment Checklist

- [ ] Update Razorpay keys from test to production
- [ ] Set NODE_ENV to "production"
- [ ] Enable HTTPS on all endpoints
- [ ] Implement rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup payment method
- [ ] Test subscription renewal flow
- [ ] Set up payment webhooks for refunds
- [ ] Create user payment dispute handling process
- [ ] Document refund policy

## Database Queries

### Check User's Subscription

```prisma
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { subscription: true }
});
```

### Get Payment History

```prisma
const payments = await prisma.payment.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});
```

### Get All Premium Users

```prisma
const premiumUsers = await prisma.user.findMany({
  where: { isPremium: true },
  include: { subscription: true }
});
```

## Troubleshooting

### Issue: "Failed to create Razorpay order"
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
- Verify API keys are from the correct Razorpay account
- Check internet connectivity

### Issue: "Invalid payment signature"
- Ensure RAZORPAY_KEY_SECRET is correct
- Verify signature calculation logic
- Check that order and payment IDs match

### Issue: "User not found"
- Verify token is valid
- Check user exists in database
- Ensure userId is properly decoded from JWT

### Issue: Payment completed but subscription not updated
- Check database connection
- Verify Prisma migrations are run
- Check error logs for specific failures

## Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For SAANS integration issues:
- Check logs: `npm run dev`
- Review error response messages
- Verify .env configuration
