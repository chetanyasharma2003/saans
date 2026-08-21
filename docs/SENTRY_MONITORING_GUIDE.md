# Sentry Monitoring & Troubleshooting Guide

## Error Dashboard Navigation

### Accessing Sentry Dashboard

1. Go to https://sentry.io
2. Select your organization
3. Select your project (backend or frontend)
4. View Issues, Releases, and Performance tabs

### Main Sections

#### Issues Tab
- Lists all errors in reverse chronological order
- Shows error count, frequency, and affected users
- Color coded by severity

#### Performance Tab
- Shows slowest transactions
- Web Vitals metrics
- Error rate vs response time

#### Releases Tab
- Track errors by deployment
- Source map associations
- Deployment timeline

## Common Error Patterns

### 1. API Errors (500 errors)

**Indicators**:
- Status code 500 in error title
- Database error codes (P2000, P2002, etc.)
- External API failure messages

**Investigation Steps**:
1. Check breadcrumbs for preceding actions
2. Look at database operation that failed
3. Check error details for specific error code
4. Review logs for exact error message
5. Search for similar errors in last 24h

**Common Causes**:
- Database connection failure
- Query constraint violation
- External API timeout
- Missing environment variable
- Resource exhaustion

**Resolution**:
- Check database status
- Verify external service connectivity
- Increase timeouts if needed
- Add retry logic
- Scale resources if needed

### 2. Authentication Errors (401/403)

**Indicators**:
- "Unauthorized" or "Forbidden" in error message
- JWT validation errors
- Token expired errors

**Investigation Steps**:
1. Check user context for user ID
2. Look at authentication action in breadcrumbs
3. Check token expiry configuration
4. Review auth middleware logs
5. Check rate limiting rules

**Common Causes**:
- Expired token
- Invalid token format
- Missing Bearer prefix
- CORS configuration issue
- Rate limit exceeded

**Resolution**:
- Extend token expiry if needed
- Verify token refresh logic
- Check CORS headers
- Review rate limit settings
- Clear browser cache/localStorage

### 3. Payment Errors

**Indicators**:
- "payment_error" in tags
- Provider mentioned (stripe, razorpay)
- Order/transaction ID in context

**Investigation Steps**:
1. Find payment method used (provider tag)
2. Check payment amount and currency
3. Look at user and order details
4. Search provider logs/dashboard
5. Review payment retry logic

**Common Causes**:
- Insufficient funds
- Card declined/expired
- Webhook failure
- Amount exceeds limit
- Currency mismatch
- API key configuration

**Resolution**:
- Contact customer about payment method
- Review webhook delivery
- Check transaction history in provider
- Verify API credentials
- Test payment flow

### 4. Performance Issues

**Indicators**:
- High response times (> 3 seconds)
- Slow database queries
- External API latency
- Memory usage spike

**Investigation Steps**:
1. Check transaction breakdown
2. Identify slowest operation
3. Look at database query times
4. Check external API response times
5. Review resource metrics

**Common Causes**:
- Missing database indexes
- N+1 query problem
- External API slowness
- Large payload transfer
- Database lock contention
- Memory leak

**Resolution**:
- Add database indexes
- Implement query caching
- Use pagination for large datasets
- Increase timeout for slow APIs
- Optimize payload size
- Profile and optimize code

### 5. Frontend/React Errors

**Indicators**:
- Component stack in error
- "Error Boundary" in error title
- Browser/device info available

**Investigation Steps**:
1. Check component stack for problematic component
2. Look at user interactions leading to error
3. Check browser version and OS
4. Look at Redux state (if available)
5. Check network tab breadcrumbs

**Common Causes**:
- Null/undefined value access
- Missing API response handling
- React state update on unmounted component
- Third-party library issue
- Browser compatibility issue

**Resolution**:
- Add null checks in component
- Add error handling for API calls
- Use useEffect cleanup
- Update library version
- Test on different browsers

## Monitoring Checklist

### Daily Monitoring

- [ ] Check new issues count
- [ ] Review any critical errors (red)
- [ ] Look at 24h error trend
- [ ] Check payment errors (if applicable)
- [ ] Verify alerts are working

### Weekly Monitoring

- [ ] Review error trends
- [ ] Check performance metrics
- [ ] Look for error spikes after deployments
- [ ] Review user feedback submitted
- [ ] Check unresolved issues count
- [ ] Verify integrations (Slack, etc.)

### Monthly Monitoring

- [ ] Generate error report
- [ ] Analyze error patterns
- [ ] Review performance trends
- [ ] Update alert rules
- [ ] Check quota usage
- [ ] Plan optimization efforts
- [ ] Review security issues

## Alert Setup

### Creating Alerts

1. **Navigate to Alerts**
   - Go to Alerts in top menu
   - Click "Create Alert"

2. **Set Conditions**
   ```
   Environment: production
   If: Error count
   Is greater than: 50
   In the last: 1 hour
   ```

3. **Set Actions**
   - Slack notification
   - Email notification
   - PagerDuty escalation

### Recommended Alert Rules

#### High Priority

**Rule 1: Critical Error Spike**
```
Condition: Error count > 100 in 30 minutes
Action: Slack #alerts + PagerDuty
```

**Rule 2: Payment Failures**
```
Condition: Any error with tag "type:payment_error"
Action: Slack #payments + Email devops@saans.com
```

**Rule 3: Auth Failures (Possible Attack)**
```
Condition: Error count > 20 in 5 minutes AND tag="type:auth_error"
Action: Slack #security + PagerDuty
```

#### Medium Priority

**Rule 4: Performance Degradation**
```
Condition: P95 transaction duration > 5s
Action: Slack #performance
```

**Rule 5: Database Errors**
```
Condition: Error count > 10 in 5 minutes AND tag="type:database_error"
Action: Slack #database
```

#### Low Priority

**Rule 6: Regular Error Increase**
```
Condition: Error count > 50 in 1 hour (daily summary)
Action: Daily Slack summary @monitoring
```

## Performance Analysis

### Understanding Web Vitals

#### LCP (Largest Contentful Paint)
- **Good**: < 2.5 seconds
- **Needs Improvement**: 2.5 - 4 seconds
- **Poor**: > 4 seconds

**How to improve**:
- Optimize images
- Reduce JavaScript
- Implement lazy loading
- Use CDN for assets

#### FID (First Input Delay)
- **Good**: < 100ms
- **Needs Improvement**: 100-300ms
- **Poor**: > 300ms

**How to improve**:
- Break up long JavaScript tasks
- Use Web Workers
- Defer non-critical code
- Profile JavaScript

#### CLS (Cumulative Layout Shift)
- **Good**: < 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

**How to improve**:
- Set image dimensions
- Avoid inserting content above existing content
- Use transform animations
- Set size for ads/embeds

### Database Performance

**Slow Query Thresholds**:
- Good: < 100ms
- Warning: 100-500ms
- Critical: > 500ms

**Optimization Steps**:
1. Add indexes to filtered/joined columns
2. Use EXPLAIN ANALYZE to review query plan
3. Consider denormalization for read-heavy operations
4. Implement caching for repeated queries
5. Use pagination for large result sets

### API Performance

**Response Time Targets**:
- Fast: < 200ms
- Acceptable: 200-1000ms
- Slow: > 1000ms

**Bottleneck Analysis**:
1. Check database query time
2. Check external API calls
3. Check processing time
4. Check serialization/deserialization
5. Check network transfer time

## Release Tracking

### Monitoring Deployments

1. **Create Release in Sentry**
   ```bash
   sentry-cli releases create -p backend v1.0.0
   sentry-cli releases create -p frontend v1.0.0
   ```

2. **Upload Source Maps**
   ```bash
   sentry-cli releases files upload-sourcemaps -r v1.0.0 ./dist
   ```

3. **Mark as Deployed**
   ```bash
   sentry-cli releases deploy v1.0.0 -e production
   ```

4. **Monitor Errors**
   - Check error count before/after
   - Look for new error types
   - Review errors by release
   - Identify problematic deploys

### Rolling Back

If deployment causes error spike:

1. **Immediate Actions**
   - Revert code changes
   - Contact team members
   - Notify stakeholders

2. **In Sentry**
   - Mark release as "archived"
   - Create new release for rollback
   - Monitor metrics during rollback

3. **Post-Incident**
   - Review error logs
   - Identify root cause
   - Add tests to prevent recurrence
   - Document in runbook

## User Feedback

### Collecting User Feedback

Frontend automatically shows feedback widget on errors.

**Feedback Dialog**:
- User name
- User email
- Comments about issue
- Automatically linked to error

### Reviewing Feedback

1. **In Sentry Dashboard**
   - Go to Issue details
   - Scroll to "User Feedback"
   - Read comments from users

2. **Responding to Users**
   - Note email for follow-up
   - Reference error ID in response
   - Provide status updates
   - Confirm fix when released

### Using Feedback for Prioritization

- Errors with user feedback = higher priority
- Multiple users reporting = urgent fix
- Specific reproduction steps = faster fix
- High satisfaction impact = prioritize

## Integration Setup

### Slack Integration

1. **Install Sentry App in Slack**
   - Go to Sentry Settings
   - Find Slack in Integrations
   - Click "Install"
   - Authorize Sentry app

2. **Configure Channels**
   - Go to Alerts
   - Create alert rules
   - Select Slack as action
   - Choose channel (#alerts, #payments, etc.)

3. **Message Format**
   - Error title and count
   - Link to issue in Sentry
   - Affected environment
   - Error frequency

### Email Integration

1. **Enable Email Notifications**
   - Settings → Notifications
   - Enable daily digests
   - Configure issue alerts

2. **Choose Recipients**
   - Team members
   - On-call engineers
   - Team leads

### PagerDuty Integration

1. **Connect PagerDuty**
   - Sentry Settings → Services
   - Find PagerDuty
   - Connect account

2. **Route to Services**
   - Map Sentry projects to PagerDuty services
   - Set escalation policies
   - Configure severity levels

## Quotas & Billing

### Understanding Quotas

- **Events**: Individual errors/transactions (both counted)
- **Replays**: Session recording minutes
- **Attachments**: File uploads (screenshots, network logs)

### Monitoring Usage

1. **Check Current Usage**
   - Settings → Usage & Billing
   - See events used this month
   - Compare to quota

2. **Estimate Monthly Cost**
   - 1M events/month ≈ $29/month
   - Includes all projects
   - Includes replay storage

### Reducing Costs

1. **Adjust Sampling**
   - Lower `tracesSampleRate` in production
   - Lower `replaysSessionSampleRate`
   - Sample errors only (not transactions)

2. **Filter Events**
   - Ignore non-critical errors in `beforeSend`
   - Filter out 404 errors
   - Exclude health check endpoints
   - Filter development URLs

3. **Example**:
   ```typescript
   beforeSend(event) {
     // Don't send 404 errors
     if (event.exception?.values?.[0]?.value?.includes('404')) {
       return null;
     }
     // Don't send from localhost
     if (event.request?.url?.includes('localhost')) {
       return null;
     }
     return event;
   }
   ```

## Troubleshooting Guide

### Issue: Events Not Appearing

**Checklist**:
- [ ] SENTRY_DSN is set and correct
- [ ] Environment is production (dev is filtered)
- [ ] Error is not filtered by beforeSend
- [ ] Project is not archived
- [ ] Quota not exceeded
- [ ] Network is working (test with curl)

**Debug Steps**:
```bash
# Test backend DSN
curl -X POST https://your-org.ingest.sentry.io/api/123/envelope/ \
  -d 'test event'

# Check frontend console
console.log(Sentry.getCurrentHub().getClient().getOptions())
```

### Issue: Source Maps Not Working

**Checklist**:
- [ ] Source maps uploaded to Sentry
- [ ] Release version matches in app
- [ ] Source maps include absolute paths
- [ ] SourceMapGenerator configured in webpack/vite

**Fix**:
```bash
# Upload source maps
sentry-cli releases files upload-sourcemaps ./dist -r v1.0.0

# Verify upload
sentry-cli releases files list -r v1.0.0
```

### Issue: High Event Costs

**Solutions**:
1. Lower trace sample rate: 0.1 (10%) instead of 1.0
2. Filter non-critical errors in beforeSend
3. Disable replays for non-error sessions
4. Use transaction filtering
5. Review alert rules - disable low-value alerts

### Issue: Alerts Not Triggering

**Checklist**:
- [ ] Alert rule condition is correct
- [ ] Environment filter matches
- [ ] Time window is reasonable (>= 5min)
- [ ] Integration is installed (Slack, email)
- [ ] Channel/recipient is correct
- [ ] Alert is not muted

**Test**:
1. Manually create test error
2. Check if alert fires
3. Verify notification in channel/email
4. Check notification settings

### Issue: Performance Data Incomplete

**Checklist**:
- [ ] tracesSampleRate > 0
- [ ] Response includes span data
- [ ] Middleware added before routes
- [ ] Integrations properly initialized
- [ ] Quota not exceeded

**Inspect**:
1. Look at transaction duration
2. Check if spans are recorded
3. Look for database queries
4. Check external API calls
5. Verify middleware order in Express

## Performance Optimization Tips

### Backend Optimization

1. **Query Optimization**
   - Add database indexes
   - Use SELECT specific columns (not *)
   - Implement pagination
   - Cache repeated queries

2. **Code Optimization**
   - Profile hot paths
   - Remove unnecessary loops
   - Batch operations
   - Use connection pooling

3. **Infrastructure**
   - Use CDN for static files
   - Enable response compression
   - Use database read replicas
   - Implement caching layer (Redis)

### Frontend Optimization

1. **Bundle Size**
   - Code split lazy routes
   - Dynamic imports
   - Tree shake unused code
   - Compress assets

2. **Rendering**
   - Virtualize long lists
   - Memoize expensive components
   - Avoid unnecessary re-renders
   - Suspense boundaries

3. **Network**
   - Minimize bundle size
   - Use GZIP compression
   - Lazy load images
   - Implement service worker

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Release Tracking](https://docs.sentry.io/product/releases/)
- [Alert Rules](https://docs.sentry.io/product/alerts/alert-types/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Source Maps](https://docs.sentry.io/product/source-maps/)

---

**Need help?** Check Sentry docs or contact the team.
