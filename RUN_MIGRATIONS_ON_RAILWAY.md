# Running Prisma Migrations on Railway

## Problem
The PostgreSQL database is only accessible from WITHIN Railway's network.  
Local machine cannot connect to run migrations.

## Solution: Create a Railway Job

### Step-by-Step Instructions

1. **Go to Railway Dashboard**
   - URL: https://railway.app
   - Click on your **SAANS project**

2. **Create a New Job**
   - Click the **"Create"** button (top right of the screen)
   - Select **"Job"** from the options
   
3. **Configure the Job**
   - **Name:** "Migrate Database" (or similar)
   - **Repository:** Select your `saans` repo
   - **Branch:** `main`
   - **Root Directory:** Leave empty (it will auto-detect)

4. **Override the Start Command**
   - In the "Start Command" field, enter:
     ```bash
     cd saans-api && npx prisma migrate deploy
     ```
   - **Do NOT include** `npm start` - it should ONLY run the migration

5. **Deploy the Job**
   - Click **"Deploy Now"**
   - Wait for the job to complete (~30-60 seconds)
   - You should see logs showing:
     ```
     ✅ 2 migrations applied successfully
     ```

6. **Redeploy Backend Service**
   - Once the job completes, go to the **SAANS backend service** (the Node.js service)
   - Click the **three dots** (...)
   - Select **"Redeploy"**
   - Wait ~2 minutes for deployment

7. **Verify Backend is Working**
   - In your terminal, run:
     ```bash
     curl https://saans-production-023e.up.railway.app/health
     ```
   - Expected response:
     ```json
     {"status":"ok","timestamp":"2026-08-22T...","uptime":...}
     ```
   - Status should be **200** (not 500)

---

## Alternative: Manual SQL via Railway Console

If the Job fails, you can manually run SQL:

1. Go to Railway Dashboard → PostgreSQL service
2. Click the **"Console"** tab
3. Copy-paste the SQL from this file: `RAILWAY_MIGRATION_SQL.sql`
4. Click "Execute"

---

## If Migration Job Succeeds

After the job completes successfully:
- ✅ Database tables created
- ✅ Backend can connect to database
- ✅ All API endpoints will start working
- ✅ `/health` returns 200 status
- ✅ Can signup/login users
- ✅ Mood tracker working
- ✅ Community features working

---

## Support

If the Job fails:
1. Check the job logs for errors
2. Common issues:
   - Prisma version mismatch → Run `npm install` first
   - Tables already exist → Job is idempotent, safe to re-run
   - Dependency missing → Check `npm install` completed

**Expected time:** 5-10 minutes total (including redeployment)
