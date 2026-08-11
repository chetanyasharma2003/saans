# Payment API Testing Guide

Complete testing guide for the Razorpay Payment Integration with curl examples.

## Prerequisites

1. Start the server: `npm run dev`
2. Get a valid JWT token by registering/logging in
3. Export variables for easy testing:

```bash
export TOKEN="your_jwt_token_here"
export API_URL="http://localhost:3000/api"
export USER_ID="user_id_from_token"
```

## 1. Get Available Plans (Public Endpoint)

**Description:** Fetch all available subscription plans

```bash
curl -X GET \
  http://localhost:3000/api/payments/plans \
  -H 'Content-Type: application/json'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "BASIC": {
      "name": "Basic",
      "price": 99,
      "currency": "INR",
      "billingCycle": "monthly",
      "features": [
        "Unlimited AI chat",
        "Mood tracking",
        "Therapy session booking (2/month)",
        "Resource library",
        "Crisis support"
      ]
    },
    "PREMIUM": { ... },
    "PLUS": { ... }
  }
}
```

## 2. Create Payment Order

**Description:** Create a Razorpay order for initiating payment

### BASIC Plan

```bash
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"BASIC"}'
```

### PREMIUM Plan

```bash
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"PREMIUM"}'
```

### PLUS Plan

```bash
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"PLUS"}'
```

**Expected Response (201):**
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

**Error Cases:**

```bash
# Missing plan type
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{}'
# Response (400): {"error":"Plan type is required"}

# Invalid plan type
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"INVALID"}'
# Response (400): {"error":"Invalid plan type. Valid options: FREE, BASIC, PREMIUM, PLUS"}

# Missing authorization
curl -X POST \
  http://localhost:3000/api/payments/create-order \
  -H 'Content-Type: application/json' \
  -d '{"planType":"BASIC"}'
# Response (401): {"error":"No token provided"}
```

## 3. Verify Payment

**Description:** Verify payment signature and activate subscription

```bash
curl -X POST \
  http://localhost:3000/api/payments/verify-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "razorpay_order_id": "order_ABC123XYZ",
    "razorpay_payment_id": "pay_XYZ123ABC",
    "razorpay_signature": "signature_hash_here",
    "planType": "PREMIUM"
  }'
```

**Expected Response (200):**
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
    "features": [
      "Unlimited AI chat",
      "Priority AI responses",
      "Mood tracking with insights",
      "Therapy sessions (4/month)",
      "Full resource library",
      "Crisis support with priority",
      "Personalized wellness plans"
    ],
    "aiChatLimit": -1,
    "aiChatsUsed": 0,
    "therapySessionLimit": 4,
    "therapySessionsUsed": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Cases:**

```bash
# Invalid signature
curl -X POST \
  http://localhost:3000/api/payments/verify-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "razorpay_order_id": "order_ABC123XYZ",
    "razorpay_payment_id": "pay_XYZ123ABC",
    "razorpay_signature": "wrong_signature",
    "planType": "PREMIUM"
  }'
# Response (400): {"error":"Invalid payment signature. Payment cannot be verified."}

# Missing required fields
curl -X POST \
  http://localhost:3000/api/payments/verify-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"PREMIUM"}'
# Response (400): {"error":"Order ID, Payment ID, and Signature are required"}
```

## 4. Get Subscription Status

**Description:** Check user's current subscription status

```bash
curl -X GET \
  http://localhost:3000/api/payments/subscription-status \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```

**Expected Response (200) - Active Subscription:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "subscription": {
      "id": "subscription_id",
      "userId": "user_id",
      "type": "PREMIUM",
      "startDate": "2024-01-15T10:30:00Z",
      "endDate": "2024-02-15T10:30:00Z",
      "autoRenewal": true,
      "features": [...],
      "aiChatLimit": -1,
      "aiChatsUsed": 0,
      "therapySessionLimit": 4,
      "therapySessionsUsed": 0,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "daysRemaining": 30
  }
}
```

**Expected Response (200) - No Active Subscription:**
```json
{
  "success": true,
  "data": {
    "isActive": false,
    "subscription": null,
    "daysRemaining": null
  }
}
```

## 5. Get Payment History

**Description:** Retrieve user's payment transaction history with pagination

### Get First 10 Payments

```bash
curl -X GET \
  "http://localhost:3000/api/payments/payment-history?limit=10&skip=0" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```

### Get Next 10 Payments

```bash
curl -X GET \
  "http://localhost:3000/api/payments/payment-history?limit=10&skip=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```

### Get 5 Payments

```bash
curl -X GET \
  "http://localhost:3000/api/payments/payment-history?limit=5&skip=0" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment_id_1",
      "userId": "user_id",
      "amount": 299,
      "currency": "INR",
      "subscriptionType": "PREMIUM",
      "billingCycle": "monthly",
      "status": "COMPLETED",
      "gateway": "razorpay",
      "transactionId": "pay_ABC123XYZ",
      "refundAmount": null,
      "refundedAt": null,
      "invoiceUrl": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "payment_id_2",
      "userId": "user_id",
      "amount": 99,
      "currency": "INR",
      "subscriptionType": "BASIC",
      "billingCycle": "monthly",
      "status": "COMPLETED",
      "gateway": "razorpay",
      "transactionId": "pay_XYZ123ABC",
      "refundAmount": null,
      "refundedAt": null,
      "invoiceUrl": null,
      "createdAt": "2024-01-10T08:15:00Z",
      "updatedAt": "2024-01-10T08:15:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "skip": 0,
    "pages": 1
  }
}
```

**Error Cases:**

```bash
# Invalid limit (too high)
curl -X GET \
  "http://localhost:3000/api/payments/payment-history?limit=101&skip=0" \
  -H "Authorization: Bearer $TOKEN"
# Response (400): {"error":"Limit must be between 1 and 100"}

# Invalid skip (negative)
curl -X GET \
  "http://localhost:3000/api/payments/payment-history?limit=10&skip=-1" \
  -H "Authorization: Bearer $TOKEN"
# Response (400): {"error":"Skip must be non-negative"}
```

## 6. Cancel Subscription

**Description:** Cancel active subscription and revert to FREE plan

```bash
curl -X POST \
  http://localhost:3000/api/payments/cancel-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": "subscription_id",
    "userId": "user_id",
    "type": "FREE",
    "startDate": "2024-01-15T10:30:00Z",
    "endDate": "2024-01-15T10:30:00Z",
    "autoRenewal": false,
    "features": [
      "Limited AI chat (5 per day)",
      "Mood tracking",
      "Basic resources"
    ],
    "aiChatLimit": 5,
    "aiChatsUsed": 0,
    "therapySessionLimit": 0,
    "therapySessionsUsed": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Cases:**

```bash
# No active subscription
curl -X POST \
  http://localhost:3000/api/payments/cancel-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'
# Response (400): {"error":"No active subscription to cancel"}

# Unauthorized
curl -X POST \
  http://localhost:3000/api/payments/cancel-subscription \
  -H 'Content-Type: application/json'
# Response (401): {"error":"No token provided"}
```

## Complete Payment Flow Test

This script demonstrates a complete payment workflow:

```bash
#!/bin/bash

# Set variables
TOKEN="your_jwt_token"
API_URL="http://localhost:3000/api"

echo "=== Step 1: Get Available Plans ==="
curl -X GET "$API_URL/payments/plans"
echo -e "\n\n"

echo "=== Step 2: Create Order ==="
ORDER_RESPONSE=$(curl -s -X POST \
  "$API_URL/payments/create-order" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"planType":"PREMIUM"}')

echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.orderId')
echo "Order ID: $ORDER_ID"
echo -e "\n\n"

echo "=== Step 3: Verify Payment (use actual Razorpay response) ==="
echo "Note: Use actual razorpay_payment_id and razorpay_signature from Razorpay"
curl -X POST \
  "$API_URL/payments/verify-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"razorpay_order_id\": \"$ORDER_ID\",
    \"razorpay_payment_id\": \"pay_xxx\",
    \"razorpay_signature\": \"signature_xxx\",
    \"planType\": \"PREMIUM\"
  }"
echo -e "\n\n"

echo "=== Step 4: Check Subscription Status ==="
curl -X GET \
  "$API_URL/payments/subscription-status" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n\n"

echo "=== Step 5: Get Payment History ==="
curl -X GET \
  "$API_URL/payments/payment-history?limit=10&skip=0" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n\n"

echo "=== Step 6: Cancel Subscription ==="
curl -X POST \
  "$API_URL/payments/cancel-subscription" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n\n"
```

## Test with Real Razorpay Integration

### Using Test Credentials

1. Create test order first to get `orderId`
2. Use Razorpay checkout to complete payment
3. Razorpay returns `razorpay_payment_id` and `razorpay_signature`
4. Call verify endpoint with these values

### Using Postman

1. Import the collection from `PAYMENT_POSTMAN_COLLECTION.json`
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: Your JWT token
3. Run requests in sequence

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Server Error |

## Common Issues and Solutions

### Issue: "Unauthorized" Error
**Solution:** Make sure you're sending a valid JWT token in the Authorization header:
```bash
-H "Authorization: Bearer $TOKEN"
```

### Issue: "Plan type is required"
**Solution:** Make sure the request body includes the `planType` field:
```json
{"planType":"PREMIUM"}
```

### Issue: "Invalid payment signature"
**Solution:** Ensure the signature is calculated correctly. Use the values from Razorpay webhook.

### Issue: "No active subscription to cancel"
**Solution:** User doesn't have an active subscription. Check subscription status first.

## Database Queries for Testing

Check if payment was recorded:
```sql
SELECT * FROM "Payment" WHERE "userId" = 'user_id' ORDER BY "createdAt" DESC LIMIT 10;
```

Check subscription status:
```sql
SELECT * FROM "Subscription" WHERE "userId" = 'user_id';
```

Check user premium status:
```sql
SELECT id, email, "isPremium", "subscriptionEndDate" FROM "User" WHERE id = 'user_id';
```
