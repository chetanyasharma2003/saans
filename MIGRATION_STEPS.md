# Running Prisma Migrations on Railway Production Database

## Quick Steps (2 minutes)

### Step 1: Get DATABASE_URL from Railway Dashboard

1. **Open Railway Dashboard** → https://railway.app
2. **Select SAANS project** (top left)
3. **Click on PostgreSQL service** (bottom left in services list)
4. **Click "Variables" tab** (next to Database, Backups, etc.)
5. **Find and COPY DATABASE_URL** (the full connection string)

It will look like:
```
postgresql://postgres:PASSWORD@containers.railway.app:PORT/railway
```

### Step 2: Run Migrations Locally

In your terminal:

```bash
cd /Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM/saans-api

# Set the production DATABASE_URL temporarily
export DATABASE_URL="<paste-the-url-from-railway-here>"

# Run the migrations
npx prisma migrate deploy

# Should show: ✅ 2 migrations applied successfully

# Cleanup (remove the environment variable)
unset DATABASE_URL
```

### Step 3: Verify Migrations Were Applied

Go back to Railway Dashboard:
1. Click PostgreSQL service
2. Click "Database" tab
3. Look for: `User`, `Therapist`, `Appointment`, `Mood`, `Community` tables (should show)

### Step 4: Redeploy Backend on Railway

1. Railway Dashboard → SAANS project
2. Click "Backend" service (or the Node.js service)
3. Click "..." → "Redeploy"
4. Wait for deployment (2-3 minutes)

### Step 5: Test the API

```bash
# Test backend health endpoint
curl https://saans-production-023e.up.railway.app/health

# Should return: {"status":"ok",...} with status 200
```

---

## What Happens

**Before Migrations:**
```
GET /health → 500 error (database connection fails)
```

**After Migrations:**
```
GET /health → 200 OK
POST /api/auth/register → Creates user in database
GET /api/therapists → Returns therapist list
```

---

## Complete List of Tables Created

After migrations, these tables will exist in PostgreSQL:

1. **User** - User accounts, authentication, profiles
2. **Therapist** - Therapist profiles, availability, ratings
3. **Appointment** - Booking appointments, status tracking
4. **Mood** - Daily mood entries, analytics
5. **Community** - Community groups, posts, discussions
6. **CrisisIncident** - Crisis detection logs, alerts
7. **ChatSession** - Chat history with AI/therapists
8. **ChatMessage** - Individual chat messages
9. **Subscription** - User subscription plans
10. **Payment** - Payment records (Razorpay)
11. **Review** - Therapist reviews from users
12. **HelpResource** - Mental health resources & hotlines

---

## Troubleshooting

### Error: "Can't reach database server"
- Check DATABASE_URL is correct (copy from Railway again)
- Verify PostgreSQL is "Online" in Railway dashboard
- Make sure you exported the DATABASE_URL variable

### Error: "migration.sql file not found"
- Check you're in the correct directory: `saans-api/`
- Verify `prisma/migrations/` folder exists

### Error: "User doesn't have permission"
- Use PostgreSQL user from DATABASE_URL (usually "postgres")
- Check password doesn't have special characters (escape if needed)

### Verification: Tables exist but backend still shows 500
- Run Vercel/Railway redeploy
- Check backend logs for database connection errors
- Verify CORS_ORIGIN is set in Railway variables

---

## Environment Variables Needed in Railway

Make sure these are set in Railway Dashboard → SAANS Project → Variables:

```
DATABASE_URL=postgresql://...      ✓ Auto-created by PostgreSQL add-on
NODE_ENV=production                ✓ Required
CORS_ORIGIN=https://saans-7x00v3qnz-chetanya-s-projects.vercel.app
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<secure-random-string>
```

---

## Success Indicators ✅

- [ ] Migrations run without errors
- [ ] PostgreSQL tables visible in Railway dashboard
- [ ] Backend service redeployed
- [ ] `/health` endpoint returns 200 status
- [ ] Can signup/login (users created in DB)

---

**Time required:** ~10 minutes total (including waiting for Railway to redeploy)
