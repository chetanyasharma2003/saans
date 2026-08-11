# Razorpay Payment Integration - Developer Checklist

Complete checklist for implementing and testing the Razorpay payment integration.

## Backend Setup (✅ COMPLETED)

### Installation
- [x] Install Razorpay SDK: `npm install razorpay`
- [x] Create payment service layer
- [x] Create payment controller
- [x] Create payment routes
- [x] Register routes in app.ts
- [x] Create utility types and constants

### Configuration
- [x] Add Razorpay to environment variables template
- [ ] Add actual RAZORPAY_KEY_ID to .env
- [ ] Add actual RAZORPAY_KEY_SECRET to .env
- [ ] Verify environment variables are loaded

### Database
- [x] Verify Subscription model exists
- [x] Verify Payment model exists
- [x] Verify User model has isPremium field
- [ ] Run migrations if needed: `npx prisma migrate deploy`

### Testing Backend
- [ ] Start development server: `npm run dev`
- [ ] GET /api/payments/plans - verify plans endpoint
- [ ] POST /api/payments/create-order - verify order creation
- [ ] Test with valid JWT token
- [ ] Test error cases (invalid plan, missing auth)
- [ ] Verify database records created

## Frontend Integration

### Setup
- [ ] Install Razorpay checkout script
- [ ] Create payment page component
- [ ] Create plan selection component
- [ ] Create payment success/failure handlers

### Components to Create
- [ ] Plans Display Component
  - [ ] Show BASIC (₹99), PREMIUM (₹299), PLUS (₹499)
  - [ ] Display features for each plan
  - [ ] Add "Select Plan" button
  - [ ] Show current subscription status if active

- [ ] Payment Component
  - [ ] Call `/api/payments/create-order`
  - [ ] Open Razorpay checkout with order details
  - [ ] Handle payment response
  - [ ] Call `/api/payments/verify-payment`
  - [ ] Show success/error message

- [ ] Subscription Status Component
  - [ ] Display current plan
  - [ ] Show days remaining
  - [ ] Add "Cancel Subscription" button
  - [ ] Show payment history

### API Integration
- [ ] Setup API client/axios instance
- [ ] Add bearer token to headers
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Implement retry logic for failed requests

### UI/UX
- [ ] Add loading spinners during payment
- [ ] Show error messages to user
- [ ] Disable buttons during payment processing
- [ ] Redirect on success
- [ ] Show payment history in user profile

## Testing Procedures

### Unit Testing
- [ ] Test paymentService functions
- [ ] Test signature verification
- [ ] Test subscription calculations
- [ ] Test error handling

### Integration Testing
- [ ] Test complete payment flow
- [ ] Test subscription activation
- [ ] Test payment history retrieval
- [ ] Test subscription cancellation

### Manual Testing

#### Test Case 1: Create Order
```
Action: GET /api/payments/plans
Expected: Returns all three plans
Pass: [ ] Fail: [ ]

Action: POST /api/payments/create-order with planType=PREMIUM
Expected: Returns orderId, amount=299
Pass: [ ] Fail: [ ]
```

#### Test Case 2: Verify Payment (Use Test Card)
```
1. Create order
2. Open Razorpay checkout in browser
3. Use test card: 4111111111111111
4. Expiry: Any future date
5. CVV: Any 3 digits
6. Complete payment
7. Verify payment with response signature
Expected: Subscription activated
Pass: [ ] Fail: [ ]
```

#### Test Case 3: Check Subscription Status
```
Action: GET /api/payments/subscription-status after successful payment
Expected: isActive=true, daysRemaining=30
Pass: [ ] Fail: [ ]
```

#### Test Case 4: Get Payment History
```
Action: GET /api/payments/payment-history
Expected: Returns array with one payment record
Pass: [ ] Fail: [ ]
```

#### Test Case 5: Cancel Subscription
```
Action: POST /api/payments/cancel-subscription
Expected: type=FREE, autoRenewal=false
Pass: [ ] Fail: [ ]
```

### Error Case Testing

- [ ] Test without authorization token
  Expected: 401 Unauthorized
  Pass: [ ] Fail: [ ]

- [ ] Test with invalid planType
  Expected: 400 Bad Request
  Pass: [ ] Fail: [ ]

- [ ] Test with invalid signature
  Expected: 400 Invalid signature
  Pass: [ ] Fail: [ ]

- [ ] Test payment-history with limit > 100
  Expected: 400 Limit validation error
  Pass: [ ] Fail: [ ]

- [ ] Test cancel without active subscription
  Expected: 400 No active subscription
  Pass: [ ] Fail: [ ]

## Database Verification

### Verify Records Created
```sql
# Check subscription was created
SELECT * FROM "Subscription" WHERE "userId" = 'YOUR_USER_ID';

# Check payment was recorded
SELECT * FROM "Payment" WHERE "userId" = 'YOUR_USER_ID';

# Check user premium status updated
SELECT "isPremium", "subscriptionEndDate" FROM "User" WHERE id = 'YOUR_USER_ID';
```

Checklist:
- [ ] Subscription record exists
- [ ] Subscription type is correct plan
- [ ] Payment record exists
- [ ] Payment status is COMPLETED
- [ ] User isPremium = true
- [ ] User subscriptionEndDate is 30 days in future

## Security Verification

### Before Production
- [ ] RAZORPAY_KEY_SECRET is never logged or exposed
- [ ] RAZORPAY_KEY_SECRET is in .env (not in git)
- [ ] HTTPS is enabled in production
- [ ] JWT tokens are validated on all protected endpoints
- [ ] Payment signatures are verified server-side
- [ ] Rate limiting is implemented
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive data
- [ ] Database queries use parameterized statements
- [ ] Failed payments are logged with timestamps

## Performance Verification

- [ ] Payment endpoint responds in < 500ms
- [ ] Order creation doesn't block other requests
- [ ] Pagination works for large payment histories
- [ ] Database queries are indexed
- [ ] No N+1 query problems

## Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] No console.log statements left in production code
- [ ] Error monitoring configured (Sentry/etc)
- [ ] Database backups configured
- [ ] HTTPS certificates installed

### Deployment
- [ ] Switch to production Razorpay credentials
- [ ] Set NODE_ENV=production
- [ ] Verify environment variables in production
- [ ] Run database migrations
- [ ] Test payment flow in production environment
- [ ] Monitor logs for errors

### Post-Deployment
- [ ] Test complete payment flow with real money
- [ ] Verify payment records in production database
- [ ] Monitor for failed payments
- [ ] Check error logs
- [ ] Confirm emails sent to users
- [ ] Test subscription status endpoint

## Monitoring & Maintenance

### Daily Checks
- [ ] No failed payment errors
- [ ] API response times normal
- [ ] Database queries performant
- [ ] No security alerts

### Weekly Checks
- [ ] Review failed payments
- [ ] Check expired subscriptions
- [ ] Verify auto-renewals working (if implemented)
- [ ] Monitor API usage

### Monthly Checks
- [ ] Review payment trends
- [ ] Check churn rate
- [ ] Verify subscription features working
- [ ] Update documentation if needed

## Common Issues & Solutions

### Issue: "RAZORPAY_KEY_ID is undefined"
- [x] Check .env file
- [ ] Verify variable name spelling
- [ ] Restart server after adding variable
- [ ] Check dotenv.config() is called in app.ts

### Issue: "Invalid payment signature"
- [ ] Verify RAZORPAY_KEY_SECRET is correct
- [ ] Check signature calculation in service
- [ ] Ensure order/payment IDs match exactly
- [ ] Verify not using test credentials in production

### Issue: "User not found"
- [ ] Verify JWT token is from valid user
- [ ] Check user exists in database
- [ ] Confirm userId is properly decoded

### Issue: Payments not appearing in database
- [ ] Check verify-payment endpoint was called
- [ ] Verify signature validation passed
- [ ] Check database connection
- [ ] Review error logs

## Feature Expansion Ideas

After core integration is complete, consider:
- [ ] Webhook handlers for refunds
- [ ] Subscription auto-renewal (cron jobs)
- [ ] Invoice generation
- [ ] Email notifications
- [ ] Discount/coupon system
- [ ] Multiple payment methods
- [ ] Subscription downgrade/upgrade
- [ ] Prorated billing
- [ ] Trial periods
- [ ] Family plans

## Documentation Review

- [ ] Read PAYMENT_QUICK_START.md
- [ ] Review PAYMENT_INTEGRATION.md
- [ ] Study PAYMENT_API_TESTS.md
- [ ] Check paymentTypes.ts for available utilities
- [ ] Review paymentService.ts business logic
- [ ] Study paymentController.ts implementation

## Sign-Off

Frontend Integration Completed By: _____________ Date: _______

Testing Completed By: _____________ Date: _______

Production Deployment Approved By: _____________ Date: _______

## Additional Notes

```
Notes on implementation:
_______________________________
_______________________________
_______________________________
_______________________________
```

## Quick Command Reference

```bash
# Start development server
npm run dev

# Build TypeScript
npm run build

# Run tests (if configured)
npm test

# Check database
psql -U user -d saans_dev

# View Razorpay credentials
cat .env | grep RAZORPAY

# Test payment endpoint
curl -X GET http://localhost:3000/api/payments/plans

# View subscription in database
SELECT * FROM "Subscription" ORDER BY "createdAt" DESC LIMIT 1;
```

## Support Resources

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Test Cards: https://razorpay.com/docs/development/testing/
- API Reference: Check PAYMENT_INTEGRATION.md
- Test Examples: Check PAYMENT_API_TESTS.md
- Quick Reference: Check PAYMENT_QUICK_START.md

---

**Last Updated:** 2026-08-11
**Status:** ✅ Backend Complete - Frontend Integration Pending
**Next Steps:** Integrate with React/Vue frontend components
