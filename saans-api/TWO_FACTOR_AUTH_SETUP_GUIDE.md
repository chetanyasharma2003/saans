# 2FA Setup & Deployment Guide

Quick step-by-step guide to get 2FA working in your environment.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- PostgreSQL database running (or SQLite for development)
- Redis server running (for rate limiting)
- Git (for version control)

## Installation Steps

### Step 1: Install Dependencies

```bash
# Navigate to the API directory
cd saans-api

# Install new dependencies
npm install

# Verify installation
npm list speakeasy qrcode
```

### Step 2: Apply Database Migration

```bash
# Create and apply the 2FA migration
npx prisma migrate dev --name add_two_factor_auth

# This will:
# - Create TwoFactorBackupCode table
# - Create TwoFactorSession table
# - Add columns to User table
# - Generate Prisma client

# Verify migration
npx prisma db push
```

### Step 3: Verify Build

```bash
# Check TypeScript compilation
npm run type-check

# Build the project
npm run build

# Check for errors
echo "Build complete!"
```

### Step 4: Start the Server

```bash
# Development
npm run dev

# Production
npm run start
```

You should see:
```
[info] Server running on port 3000
[info] Database connected
[info] Redis connected for rate limiting
```

### Step 5: Test the Installation

#### Option A: Using Test Script (Recommended)

```bash
# In a separate terminal
node test-2fa.mjs

# This will test:
# ✓ User registration
# ✓ 2FA setup and QR code generation
# ✓ 2FA verification
# ✓ Login with 2FA
# ✓ Status checking
# ✓ Backup code regeneration
# ✓ 2FA disabling
```

#### Option B: Manual Testing with cURL

```bash
# 1. Register a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Save the accessToken from response

# 2. Setup 2FA
curl -X GET http://localhost:3000/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Save the secret from response

# 3. Verify setup with TOTP code
# Use speakeasy CLI or online tools to generate TOTP:
# npm install -g speakeasy-cli
# speakeasy-cli --secret "YOUR_SECRET"

curl -X POST http://localhost:3000/api/auth/2fa/verify-setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "totpCode": "123456"
  }'

# 4. Test login with 2FA
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Should return:
# {
#   "requiresTwoFactor": true,
#   "sessionToken": "...",
#   "user": {...}
# }

# 5. Verify 2FA login
curl -X POST http://localhost:3000/api/auth/2fa/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "sessionToken": "session_token",
    "totpCode": "123456",
    "useBackupCode": false
  }'

# Should return:
# {
#   "user": {...},
#   "accessToken": "..."
# }
```

## Configuration

### Environment Variables

Add these to your `.env` file (optional, uses sensible defaults):

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saans_db

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# 2FA Configuration (optional)
TWO_FACTOR_SESSION_EXPIRY_MS=600000
TWO_FACTOR_BACKUP_CODE_COUNT=10
```

### Redis Setup (if not running)

```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Linux (Ubuntu)
sudo apt-get install redis-server
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis:latest

# Verify Redis is running
redis-cli ping
# Should output: PONG
```

### PostgreSQL Setup (if needed)

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu)
sudo apt-get install postgresql
sudo systemctl start postgresql

# Create database
createdb saans_db

# Update .env with connection string
DATABASE_URL="postgresql://localhost:5432/saans_db"
```

## Troubleshooting

### Issue: Dependencies not installing

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### Issue: Migration fails

```bash
# Reset database (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Or resolve specific migration
npx prisma migrate resolve --rolled-back add_two_factor_auth
```

### Issue: Redis connection error

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
redis-server

# Check Redis logs:
redis-cli info
```

### Issue: TypeScript errors

```bash
# Regenerate Prisma client
npx prisma generate

# Run type check
npm run type-check

# Check for any missing types
npm install --save-dev @types/speakeasy @types/qrcode
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (macOS/Linux)
kill -9 <PID>

# Or use different port:
PORT=3001 npm run dev
```

### Issue: Rate limiting not working

```bash
# Verify Redis connection
redis-cli

# Inside redis-cli:
> PING
# Should respond: PONG

# Check if rate limiting is enabled (only in production)
NODE_ENV=production npm run dev
```

## Database Verification

After migration, verify tables were created:

```bash
# Using psql (PostgreSQL)
psql -d saans_db -c "\dt"

# Should show:
# - User table (updated with 2FA fields)
# - TwoFactorBackupCode table
# - TwoFactorSession table

# Check columns
psql -d saans_db -c "SELECT column_name FROM information_schema.columns WHERE table_name='User';"

# Should include:
# - twoFactorEnabled
# - twoFactorSecret
```

Using Prisma Studio:
```bash
npx prisma studio

# Opens http://localhost:5555
# Visual database browser
```

## Health Check

After deployment, verify everything is working:

```bash
# Check API health
curl http://localhost:3000/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00Z",
#   "uptime": 123.45
# }

# Check API status
curl http://localhost:3000/api/status

# Should return:
# {
#   "status": "operational",
#   "version": "0.1.0",
#   "environment": "development"
# }
```

## Production Deployment

### Checklist Before Production

- [ ] Update JWT secrets in environment
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Set up Redis for rate limiting
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Test all 2FA flows
- [ ] Review security settings
- [ ] Run full test suite

### Production Deployment Command

```bash
# Install dependencies (no dev deps)
npm ci --production

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start application
NODE_ENV=production npm start

# Monitor logs
npm install -g pm2
pm2 start dist/index.js --name saans-api
pm2 logs saans-api
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t saans-api:latest .

docker run -d \
  --name saans-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e JWT_SECRET="..." \
  saans-api:latest
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy:

```bash
# Using Vercel CLI
npx vercel deploy

# With environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add JWT_SECRET
```

## Performance Tuning

### Rate Limiting Configuration

Adjust in `src/middleware/rateLimitMiddleware.ts`:

```typescript
// More strict (production under attack)
export const twoFactorLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 3,  // Changed from 5
  backoffMultiplier: 4,  // Increased from 3
});

// More lenient (during high load)
export const twoFactorLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,  // Changed from 5
  backoffMultiplier: 2,  // Decreased from 3
});
```

### Database Optimization

```sql
-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE '%TwoFactor%';

-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename LIKE '%TwoFactor%';
```

### Redis Optimization

```bash
# Monitor Redis usage
redis-cli INFO

# Check memory
redis-cli INFO memory

# Flush old sessions (caution!)
redis-cli FLUSHDB
```

## Monitoring & Alerts

### Recommended Metrics

1. **2FA Adoption**: `SELECT COUNT(*) FROM "User" WHERE "twoFactorEnabled"=true`
2. **Verification Success Rate**: Monitor `/api/auth/2fa/verify-login` responses
3. **Rate Limit Triggers**: Monitor HTTP 429 responses
4. **Average Response Time**: Should be <100ms for TOTP verification

### Logging

```bash
# Check application logs
npm run dev 2>&1 | tee app.log

# Production logs (if using PM2)
pm2 logs saans-api

# Check error logs
grep ERROR app.log | head -20
```

## Cleanup & Maintenance

### Regular Tasks

```bash
# Weekly: Clean up expired sessions (run as cron job)
npx prisma db execute --stdin < cleanup-sessions.sql

# Monthly: Check database size
du -sh data/ # or database directory

# Quarterly: Update dependencies
npm update

# Annually: Security audit
npm audit
```

Cleanup SQL script (`cleanup-sessions.sql`):
```sql
-- Delete expired 2FA sessions older than 1 hour
DELETE FROM "TwoFactorSession" 
WHERE "expiresAt" < NOW() - INTERVAL '1 hour';

-- Delete used backup codes older than 90 days
DELETE FROM "TwoFactorBackupCode" 
WHERE "isUsed" = true 
AND "usedAt" < NOW() - INTERVAL '90 days';
```

## Rollback Procedure

If something goes wrong:

```bash
# Stop the server
npm stop
# or
pm2 stop saans-api

# Rollback migration
npx prisma migrate resolve --rolled-back add_two_factor_auth

# Restore from backup
# (Database specific)

# Restart
npm run start
```

## Support & Help

For issues:
1. Check `TWO_FACTOR_AUTH_IMPLEMENTATION.md` for detailed documentation
2. Run `node test-2fa.mjs` to identify specific failures
3. Check application logs for detailed error messages
4. Verify all environment variables are set
5. Ensure Redis and database are running

## Summary

You now have a production-ready 2FA system! The implementation:
- ✓ Is fully tested
- ✓ Handles all edge cases
- ✓ Implements security best practices
- ✓ Scales efficiently
- ✓ Is well-documented
- ✓ Provides comprehensive error handling

Start using it in your application with confidence!
