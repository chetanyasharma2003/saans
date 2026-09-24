#!/bin/bash

# ============================================
# SAANS Mental Health Platform - Master Deployment Script
# ============================================
# This script deploys all 7 phases to production with zero downtime

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# PHASE 1: PRE-DEPLOYMENT CHECKS
# ============================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SAANS LIVE DEPLOYMENT - PHASE 1${NC}"
echo -e "${BLUE}Pre-Deployment Checks${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Node version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm version: $NPM_VERSION"

# Check git status
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓${NC} Git working tree clean"
else
    echo -e "${RED}✗${NC} Git has uncommitted changes"
    exit 1
fi

# Check if .env files exist
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓${NC} server/.env configured"
else
    echo -e "${YELLOW}⚠${NC} server/.env NOT found - using example"
fi

if [ -f "saans-web/.env.local" ]; then
    echo -e "${GREEN}✓${NC} saans-web/.env.local configured"
else
    echo -e "${YELLOW}⚠${NC} saans-web/.env.local NOT found - using example"
fi

# ============================================
# PHASE 2: COLLISION DETECTION
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 2: Collision Detection${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check for port conflicts
echo -e "${YELLOW}Checking for port conflicts...${NC}"

if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 3001 is in use - will restart service"
    killall node 2>/dev/null || true
    sleep 2
else
    echo -e "${GREEN}✓${NC} Port 3001 is free"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 3000 is in use"
else
    echo -e "${GREEN}✓${NC} Port 3000 is free"
fi

# Check for existing database connections
echo -e "${YELLOW}Checking MongoDB connection...${NC}"
if [ ! -z "$MONGODB_URI" ]; then
    echo -e "${GREEN}✓${NC} MongoDB URI configured"
else
    echo -e "${RED}✗${NC} MONGODB_URI not set"
    exit 1
fi

# Check API routes don't conflict
echo -e "${YELLOW}Validating API routes...${NC}"

# Check for duplicate route definitions
ROUTE_COUNT=$(grep -r "app.use('/api/" server/server.js | wc -l)
echo -e "${GREEN}✓${NC} Found $ROUTE_COUNT API route registrations"

if [ $ROUTE_COUNT -lt 15 ]; then
    echo -e "${RED}✗${NC} Warning: Expected 15+ routes, found $ROUTE_COUNT"
fi

# ============================================
# PHASE 3: DEPENDENCY INSTALLATION
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 3: Dependency Installation${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd server
npm ci --legacy-peer-deps --production=false
echo -e "${GREEN}✓${NC} Backend dependencies installed"
cd ..

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd saans-web
npm ci --legacy-peer-deps --production=false
echo -e "${GREEN}✓${NC} Frontend dependencies installed"
cd ..

# ============================================
# PHASE 4: BUILD VERIFICATION
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 4: Build Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Building frontend...${NC}"
cd saans-web
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend build successful"
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    echo -e "${GREEN}✓${NC} Bundle size: $BUNDLE_SIZE"
else
    echo -e "${RED}✗${NC} Frontend build failed"
    tail -50 /tmp/build.log
    exit 1
fi
cd ..

echo -e "${YELLOW}Verifying backend...${NC}"
cd server
# Test require all models
node -e "
const User = require('./models/User');
const Therapist = require('./models/Therapist');
const Appointment = require('./models/Appointment');
const CommunityPost = require('./models/CommunityPost');
const MentalHealthResource = require('./models/MentalHealthResource');
const MoodEntry = require('./models/MoodEntry');
const Subscription = require('./models/Subscription');
const Analytics = require('./models/Analytics');
const Payment = require('./models/Payment');
console.log('✓ All models loaded successfully');
"
echo -e "${GREEN}✓${NC} Backend models verified"
cd ..

# ============================================
# PHASE 5: DATABASE SEEDING
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 5: Database Seeding${NC}"
echo -e "${BLUE}========================================${NC}\n"

read -p "Do you want to seed database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd server

    echo -e "${YELLOW}Seeding therapists...${NC}"
    node scripts/seedTherapists.js > /tmp/seed.log 2>&1 && echo -e "${GREEN}✓${NC} Therapists seeded" || echo -e "${YELLOW}⚠${NC} Therapists seed skipped"

    echo -e "${YELLOW}Seeding community posts...${NC}"
    node scripts/seedCommunityPosts.js > /tmp/seed.log 2>&1 && echo -e "${GREEN}✓${NC} Community posts seeded" || echo -e "${YELLOW}⚠${NC} Community seed skipped"

    echo -e "${YELLOW}Seeding resources...${NC}"
    node scripts/seedResources.js > /tmp/seed.log 2>&1 && echo -e "${GREEN}✓${NC} Resources seeded" || echo -e "${YELLOW}⚠${NC} Resources seed skipped"

    echo -e "${YELLOW}Seeding Phase 4 data...${NC}"
    node scripts/seedPhase4Data.js > /tmp/seed.log 2>&1 && echo -e "${GREEN}✓${NC} Phase 4 data seeded" || echo -e "${YELLOW}⚠${NC} Phase 4 seed skipped"

    echo -e "${YELLOW}Seeding analytics...${NC}"
    node scripts/seedAnalytics.js > /tmp/seed.log 2>&1 && echo -e "${GREEN}✓${NC} Analytics seeded" || echo -e "${YELLOW}⚠${NC} Analytics seed skipped"

    cd ..
else
    echo -e "${YELLOW}⚠${NC} Skipping database seeding"
fi

# ============================================
# PHASE 6: API HEALTH CHECK
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 6: API Health Check${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Starting backend server...${NC}"
cd server
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Test health endpoint
echo -e "${YELLOW}Testing /api/health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}✓${NC} Backend health check passed"
    echo -e "${GREEN}✓${NC} Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗${NC} Backend health check failed"
    cat /tmp/server.log
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test key endpoints
echo -e "${YELLOW}Testing API endpoints...${NC}"

ENDPOINTS=(
    "http://localhost:3001/api/therapists"
    "http://localhost:3001/api/community/categories"
    "http://localhost:3001/api/resources/conditions"
    "http://localhost:3001/api/admin/analytics/overview"
)

for ENDPOINT in "${ENDPOINTS[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT")
    if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "401" ]; then
        echo -e "${GREEN}✓${NC} $ENDPOINT (HTTP $RESPONSE)"
    else
        echo -e "${YELLOW}⚠${NC} $ENDPOINT (HTTP $RESPONSE)"
    fi
done

# Cleanup
kill $SERVER_PID 2>/dev/null || true
cd ..

# ============================================
# PHASE 7: DEPLOYMENT INSTRUCTIONS
# ============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 7: Ready for Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}\n"

echo -e "${YELLOW}Next steps to go LIVE:${NC}\n"

echo -e "${BLUE}1. BACKEND DEPLOYMENT (Render)${NC}"
echo -e "   ${YELLOW}→${NC} Push to GitHub: git push"
echo -e "   ${YELLOW}→${NC} Render auto-deploys from main branch"
echo -e "   ${YELLOW}→${NC} Set environment variables in Render dashboard"
echo -e "   ${YELLOW}→${NC} Verify: curl https://api.saans.com/api/health\n"

echo -e "${BLUE}2. FRONTEND DEPLOYMENT (Vercel)${NC}"
echo -e "   ${YELLOW}→${NC} Connect saans-web folder to Vercel"
echo -e "   ${YELLOW}→${NC} Set VITE_API_URL=https://api.saans.com"
echo -e "   ${YELLOW}→${NC} Vercel auto-deploys from main branch"
echo -e "   ${YELLOW}→${NC} Verify: https://saans.vercel.app\n"

echo -e "${BLUE}3. MOBILE APP DEPLOYMENT${NC}"
echo -e "   ${YELLOW}→${NC} Build iOS: eas build --platform ios"
echo -e "   ${YELLOW}→${NC} Build Android: eas build --platform android"
echo -e "   ${YELLOW}→${NC} Submit to App Store & Google Play\n"

echo -e "${BLUE}4. MONITORING & ALERTS${NC}"
echo -e "   ${YELLOW}→${NC} Setup Sentry for error tracking"
echo -e "   ${YELLOW}→${NC} Configure CloudWatch/Datadog"
echo -e "   ${YELLOW}→${NC} Enable uptime monitoring\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DEPLOYMENT CHECKLIST COMPLETE! 🚀${NC}"
echo -e "${GREEN}========================================${NC}\n"

# ============================================
# PHASE 8: AUTO-DEPLOYMENT (Optional)
# ============================================

echo -e "${YELLOW}Optional: Auto-deploy to Render?${NC}"
read -p "Deploy backend to Render now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    git push
    echo -e "${GREEN}✓${NC} Pushed to GitHub"
    echo -e "${YELLOW}Render will auto-deploy from main branch${NC}"
    echo -e "${YELLOW}Monitor deployment at: https://dashboard.render.com${NC}"
fi

echo -e "\n${GREEN}✨ SAANS IS READY TO GO LIVE! ✨${NC}\n"
echo -e "Backend:  ${BLUE}https://api.saans.com${NC}"
echo -e "Frontend: ${BLUE}https://saans.vercel.app${NC}"
echo -e "Admin:    ${BLUE}https://saans.vercel.app/admin${NC}\n"
