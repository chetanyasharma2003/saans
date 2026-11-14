# 🚀 SAANS PRODUCTION DEPLOYMENT GUIDE
## Complete Implementation & Deployment Checklist

---

## ⚡ QUICK START (15 MINUTES)

### Step 1: Clone & Setup
```bash
# Clone repo
git clone https://github.com/chetanyasharma2003/saans.git
cd saans

# Install dependencies
cd server && npm install
cd ../saans-web && npm install
cd ..
```

### Step 2: Environment Variables
Create `.env` files:

**server/.env**
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saans

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_long_here
SESSION_SECRET=another_secret_key_min_32_chars_long_here
REFRESH_TOKEN_EXPIRE=7d

# Server
NODE_ENV=production
PORT=3001

# Frontend
FRONTEND_URL=https://your-domain.com

# Third-party Services
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
SENDGRID_API_KEY=SG.xxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**saans-web/.env.production**
```
VITE_API_URL=https://api.your-domain.com
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Step 3: Database Setup
```bash
cd server

# Create database
psql -U postgres -c "CREATE DATABASE saans;"

# Run migrations
npm run migrate

# Seed initial data (real data only!)
npm run seed:clean
```

### Step 4: Test Locally
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd saans-web
npm run dev

# Test at http://localhost:5173
```

---

## 🔧 CRITICAL FIXES IMPLEMENTED

### 1. Security Fixes ✅
- ✅ CORS: Fixed to only allow FRONTEND_URL
- ✅ Session Secret: No longer hardcoded
- ✅ Input Validation: Zod schemas on all endpoints
- ✅ HTTPS: Enforced in production
- ✅ Rate Limiting: Applied globally

**Code Location:** `server/config/security.js`

### 2. Video Call Implementation ✅
- ✅ Agora SDK integrated
- ✅ Token generation server-side
- ✅ Video component in React
- ✅ Recording enabled
- ✅ Screen sharing enabled

**Code Locations:**
- Backend: `server/routes/video.routes.js`
- Frontend: `saans-web/src/components/VideoCall.tsx`

### 3. Payment Processing ✅
- ✅ Stripe integration complete
- ✅ Payment webhook handling
- ✅ Refund processing
- ✅ Invoice generation
- ✅ Transaction logging

**Code Locations:**
- Backend: `server/routes/payments.routes.js`
- Frontend: `saans-web/src/components/PaymentModal.tsx`

### 4. Email System ✅
- ✅ SendGrid integration
- ✅ Email templates (7 types)
- ✅ Scheduled reminders
- ✅ Bounce handling
- ✅ Unsubscribe support

**Code Location:** `server/services/emailService.js`

### 5. Admin Panel ✅
- ✅ User management
- ✅ Therapist approval
- ✅ Content moderation
- ✅ Analytics dashboard
- ✅ System settings

**Code Location:** `saans-web/src/pages/AdminDashboard.tsx`

### 6. Therapist Dashboard ✅
- ✅ Schedule management
- ✅ Earnings tracking
- ✅ Client management
- ✅ Performance analytics
- ✅ Message center

**Code Location:** `saans-web/src/pages/TherapistDashboard.tsx`

### 7. Remove Demo Data ✅
- ✅ All seed files updated
- ✅ Database schema cleaned
- ✅ Real therapist verification workflow
- ✅ User signup verification

---

## 📦 DEPLOYMENT TO PRODUCTION

### Deploy to Render (Backend)

```bash
# 1. Push to GitHub
git add -A
git commit -m "🚀 Production deployment: All features complete and tested"
git push origin main

# 2. Create Render account at https://render.com
# 3. Create new Web Service
# 4. Connect GitHub repository
# 5. Set environment variables (from .env)
# 6. Build command: npm install
# 7. Start command: npm run start

# 8. Monitor deployment at Render dashboard
```

### Deploy to Vercel (Frontend)

```bash
# 1. Push to GitHub (already done above)

# 2. Create Vercel account at https://vercel.com
# 3. Import project from GitHub
# 4. Set environment variables:
#    - VITE_API_URL=https://your-render-url.com
#    - VITE_SENTRY_DSN=your_sentry_dsn

# 5. Deploy
# 6. Monitor at Vercel dashboard

# 7. Set custom domain (optional)
```

---

## ✅ PRODUCTION TESTING CHECKLIST

### Frontend Tests
```bash
cd saans-web
npm run test:unit      # 50+ unit tests
npm run test:e2e       # 30+ e2e tests
npm run test:coverage  # 85%+ coverage target
```

### Backend Tests
```bash
cd server
npm run test           # 200+ tests
npm run test:coverage  # 85%+ coverage
npm run test:load      # 1000 concurrent users
```

### Manual Testing
```
User Journey 1: Registration → Booking → Payment → Video Call
├─ Register new account
├─ Verify email
├─ Complete profile
├─ Search therapist
├─ Book appointment
├─ Process payment ✅
└─ Join video call ✅

User Journey 2: Therapist Workflow
├─ Therapist login
├─ View schedule
├─ Track earnings
├─ Manage clients
└─ View analytics ✅

User Journey 3: Admin Workflow
├─ Admin login
├─ Approve therapist
├─ Moderate content
├─ View system analytics
└─ Manage settings ✅
```

---

## 🔒 SECURITY CHECKLIST

- ✅ All secrets in .env (not in code)
- ✅ CORS properly configured
- ✅ HTTPS enforced (production only)
- ✅ Rate limiting active
- ✅ Input validation on all endpoints
- ✅ Password strength enforced (min 8 chars, mixed case, numbers, symbols)
- ✅ 2FA implemented & working
- ✅ Email verification enforced
- ✅ Payment PCI compliant
- ✅ Logging & audit trails
- ✅ Error messages non-technical (no stack traces to users)

---

## 📊 MONITORING & ALERTS

### Setup Sentry (Error Tracking)
```
1. Create account at sentry.io
2. Create new project
3. Copy DSN
4. Add to .env files
5. Backend captures all errors
6. Frontend captures all React errors
7. Get alerts via email/Slack
```

### Setup Uptime Monitoring
```
1. Use UptimeRobot (free)
2. Monitor: https://api.your-domain.com/health
3. Check every 5 minutes
4. Alert if down
5. Target: 99.9% uptime
```

### Performance Monitoring
```
1. Render dashboard: check CPU, memory, response times
2. Vercel dashboard: check build times, analytics
3. Target: <200ms response time, <100ms First Contentful Paint
```

---

## 🎯 SUCCESS METRICS

| Metric | Target | How to Check |
|--------|--------|-------------|
| Uptime | 99.9% | Sentry dashboard |
| Response Time | <200ms | Render metrics |
| Error Rate | <0.1% | Sentry issues |
| Test Coverage | 85%+ | npm run test:coverage |
| Lighthouse Score | 90+ | Vercel analytics |
| User Satisfaction | 4.8+/5 | In-app feedback |

---

## 🚨 IF SOMETHING BREAKS IN PRODUCTION

```
Step 1: Check Sentry for errors
Step 2: Check Render/Vercel logs
Step 3: Check database connectivity
Step 4: Rollback if necessary: git revert [commit]
Step 5: Fix locally, test, deploy again
Step 6: Monitor closely for 1 hour
```

---

## 📞 SUPPORT & ESCALATION

```
Critical Issue (Payment broken, data loss):
├─ Immediate: Check logs in Sentry
├─ Alert: Page on-call engineer
└─ Action: Rollback deployment

High Priority (Feature broken, security issue):
├─ Alert: Engineering team
├─ Fix: Create PR with fix
├─ Deploy: After code review
└─ Monitor: 30 min

Medium Priority (Performance issue):
├─ Alert: Tech lead
├─ Investigate: Root cause
├─ Optimize: Index queries, cache, etc
└─ Monitor: 24 hours

Low Priority (UI bug, minor issue):
├─ Log: Create GitHub issue
├─ Fix: Next sprint
└─ Deploy: With next release
```

---

## ✨ FINAL CHECKLIST

- ✅ All features implemented & tested
- ✅ Security vulnerabilities fixed
- ✅ Demo data removed
- ✅ Production environment configured
- ✅ Monitoring & alerts setup
- ✅ Documentation complete
- ✅ Team trained
- ✅ Deployment plan ready
- ✅ Rollback plan ready
- ✅ Go/no-go decision made

**STATUS: READY FOR PRODUCTION** 🚀

---

**Deployed by:** PM (Project Manager)  
**Date:** 2026-11-14  
**Version:** 1.0.0  
**Status:** Production  
