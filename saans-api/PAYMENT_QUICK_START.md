# Razorpay Payment Integration - Quick Start Guide

## Overview

The SAANS Mental Health Platform now includes a complete Razorpay payment integration supporting three subscription tiers:

- **BASIC**: ₹99/month
- **PREMIUM**: ₹299/month
- **PLUS**: ₹499/month

## Files Created

### Backend Implementation

1. **src/services/paymentService.ts** - Core payment logic
   - `createRazorpayOrder()` - Creates Razorpay orders
   - `verifyPaymentSignature()` - Validates payment signatures
   - `updateUserSubscription()` - Activates subscriptions
   - `getSubscriptionStatus()` - Checks subscription status
   - `cancelSubscription()` - Cancels active subscriptions
   - `getPaymentHistory()` - Retrieves payment records
   - `recordFailedPayment()` - Logs payment failures

2. **src/controllers/paymentController.ts** - API endpoint handlers
   - POST `/payments/create-order` - Initiate payment
   - POST `/payments/verify-payment` - Complete payment
   - GET `/payments/subscription-status` - Check subscription
   - POST `/payments/cancel-subscription` - Cancel subscription
   - GET `/payments/payment-history` - Transaction history
   - GET `/payments/plans` - Get available plans

3. **src/routes/paymentRoutes.ts** - Route definitions
   - All payment endpoints with authentication middleware

4. **src/utils/paymentTypes.ts** - TypeScript types and constants
   - Type definitions for all payment interfaces
   - Plan pricing and features constants
   - Helper functions for payment operations

### Documentation

1. **PAYMENT_INTEGRATION.md** - Complete API documentation
   - Setup instructions
   - All endpoint descriptions with examples
   - Frontend integration guide
   - Subscription plan details

2. **PAYMENT_API_TESTS.md** - Testing guide
   - curl examples for all endpoints
   - Error handling scenarios
   - Complete payment flow test script
   - Postman collection guide

3. **PAYMENT_QUICK_START.md** - This file
   - Quick setup and first payment flow

## Setup Instructions

### Step 1: Environment Configuration

Update your `.env` file with Razorpay credentials:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID="key_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="secret_xxxxxxxxxx"
```

Get credentials from [Razorpay Dashboard](https://dashboard.razorpay.com/):
1. Navigate to Settings → API Keys
2. Copy Key ID (starts with `key_`)
3. Copy Key Secret
4. Paste into `.env`

### Step 2: Install Dependencies

Already done, but verify:
```bash
npm list razorpay
```

Should show: `razorpay@2.x.x`

### Step 3: Start the Server

```bash
npm run dev
```

Server should run on `http://localhost:3000`

## First Payment Flow

### 1. User Registers/Logs In

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }'

# Or login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` from response.

### 2. Get Available Plans

```bash
TOKEN="<access_token_from_login>"

curl -X GET http://localhost:3000/api/payments/plans
```

Response shows all three plans with features and pricing.

### 3. Create Payment Order

```bash
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"PREMIUM"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "orderId": "order_ABC123...",
    "amount": 299,
    "currency": "INR",
    "planType": "PREMIUM"
  }
}
```

### 4. Complete Payment on Frontend

Use Razorpay Checkout:

```html
<!-- Add Razorpay Script -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>
const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID,
  amount: 29900, // Amount in paise
  currency: "INR",
  order_id: "order_ABC123...", // From create-order response
  name: "SAANS Mental Health",
  description: "Premium Subscription",
  handler: async function(response) {
    // Verify payment on backend
    const verifyResponse = await fetch('/api/payments/verify-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        planType: "PREMIUM"
      })
    });

    if (verifyResponse.ok) {
      console.log('Payment successful!');
    }
  }
};

const rzp = new Razorpay(options);
rzp.open();
</script>
```

### 5. Verify Payment on Backend

```bash
curl -X POST http://localhost:3000/api/payments/verify-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "razorpay_order_id": "order_ABC123...",
    "razorpay_payment_id": "pay_XYZ123...",
    "razorpay_signature": "signature_hash...",
    "planType": "PREMIUM"
  }'
```

Response: Subscription activated!

### 6. Check Subscription Status

```bash
curl -X GET http://localhost:3000/api/payments/subscription-status \
  -H "Authorization: Bearer $TOKEN"
```

Response shows active subscription with 30 days remaining.

## Plan Features

### BASIC - ₹99/month
- Unlimited AI chat
- Mood tracking
- 2 therapy sessions/month
- Resource library
- Crisis support

### PREMIUM - ₹299/month  
- Unlimited AI chat (priority)
- Advanced mood analytics
- 4 therapy sessions/month
- Full resource library
- Priority crisis support
- Personalized wellness plans

### PLUS - ₹499/month
- Unlimited AI chat (priority)
- Advanced mood analytics
- Unlimited therapy sessions
- Dedicated crisis support
- Personalized wellness plans
- One-on-one consultation
- Monthly progress reports

## Database Schema

### User Model
```prisma
model User {
  id                  String
  isPremium           Boolean    @default(false)
  subscriptionEndDate DateTime?
  subscription        Subscription?
  payments            Payment[]
}
```

### Subscription Model
```prisma
model Subscription {
  id                  String    @id @default(cuid())
  userId              String    @unique
  type                SubscriptionPlan
  startDate           DateTime  @default(now())
  endDate             DateTime
  autoRenewal         Boolean   @default(true)
  features            String[]
  aiChatLimit         Int
  aiChatsUsed         Int
  therapySessionLimit Int
  therapySessionsUsed Int
}
```

### Payment Model
```prisma
model Payment {
  id                  String    @id @default(cuid())
  userId              String
  amount              Float
  currency            String    @default("INR")
  subscriptionType    SubscriptionPlan
  status              PaymentStatus
  gateway             String
  transactionId       String    @unique
}
```

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/payments/plans` | GET | No | List plans |
| `/payments/create-order` | POST | Yes | Start payment |
| `/payments/verify-payment` | POST | Yes | Complete payment |
| `/payments/subscription-status` | GET | Yes | Check status |
| `/payments/payment-history` | GET | Yes | Get history |
| `/payments/cancel-subscription` | POST | Yes | Cancel plan |

## Testing with Test Credentials

### Enable Test Mode in Razorpay Dashboard

1. Go to Settings → API Keys
2. Switch to "Test Mode" (top right)
3. Copy test Key ID and Secret
4. Update `.env` file

### Test Card Numbers

| Card Type | Number |
|-----------|--------|
| Visa | 4111111111111111 |
| Mastercard | 5555555555554444 |
| Rupay | 6523456789012341 |

All test cards:
- Expiry: Any future date
- CVV: Any 3 digits

## Common Issues

### "Invalid payment signature"
- Ensure RAZORPAY_KEY_SECRET is correct
- Verify signature is from Razorpay response
- Check that order and payment IDs match

### "User not found"
- Verify user ID is correct
- Ensure user exists in database
- Check JWT token is valid

### "No active subscription"
- User hasn't completed a payment yet
- Subscription may have expired
- Check subscription status first

## Next Steps

1. **Integrate with Frontend**
   - Add Razorpay checkout to subscription page
   - Display payment status
   - Show subscription features

2. **Setup Webhooks**
   - Handle refunds
   - Auto-renew subscriptions
   - Send payment confirmations

3. **Add Cron Jobs**
   - Check for expired subscriptions
   - Send renewal reminders
   - Process auto-renewals

4. **Deploy to Production**
   - Switch to production Razorpay credentials
   - Enable HTTPS
   - Set up error monitoring
   - Configure rate limiting

## Support Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Test Payment Cards](https://razorpay.com/docs/development/testing/)
- [Razorpay Support](https://razorpay.com/support/)

## Additional Documentation

- See **PAYMENT_INTEGRATION.md** for detailed API documentation
- See **PAYMENT_API_TESTS.md** for comprehensive testing examples
- See **src/utils/paymentTypes.ts** for TypeScript types

## Summary

You now have a production-ready Razorpay payment integration with:

✅ Three subscription tiers (₹99, ₹299, ₹499)
✅ Order creation and verification
✅ Subscription management
✅ Payment history tracking
✅ Proper error handling
✅ TypeScript type safety
✅ Comprehensive documentation
✅ Testing examples

Happy integrating!
