# 🚀 SAANS Automated Pipeline Setup

## What This Does

✅ **Push code** → Auto-tests → Auto-deploys to Vercel  
✅ **Errors found** → Auto-fixed → Auto-PR created  
✅ **Everything automated** → No manual work needed  

---

## Setup Instructions (5 minutes, one-time)

### Step 1: Connect GitHub

```bash
cd /Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM

# Initialize git and push to GitHub
git init
git add .
git commit -m "🚀 Initial SAANS commit with full automation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/saans-mental-health.git
git push -u origin main
```

### Step 2: Create Vercel Projects

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import from GitHub: `saans-web`
   - Framework: Vite
   - Project Name: `saans-web`
   - **Copy Project ID to secrets**

4. Create another project for API:
   - Import: `saans-api`
   - Project Name: `saans-api`
   - **Copy Project ID to secrets**

### Step 3: Add GitHub Secrets

Go to GitHub → Settings → Secrets and Variables → Actions

Add these secrets:

```
VERCEL_TOKEN         → Get from Vercel (Settings → Tokens)
VERCEL_ORG_ID        → From Vercel project settings
VERCEL_PROJECT_ID_WEB    → Frontend project ID
VERCEL_PROJECT_ID_API    → API project ID
```

### Step 4: Set Vercel Environment Variables

**For Frontend (saans-web):**
```
VITE_API_URL = https://saans-api.vercel.app
```

**For Backend (saans-api):**
```
DATABASE_URL         → PostgreSQL connection string
JWT_SECRET           → Your secret key
RAZORPAY_KEY_ID      → Payment key
RAZORPAY_KEY_SECRET  → Payment secret
```

---

## How It Works

### Workflow 1: Deploy & Test
**Triggers:** Every push to `main`, `master`, or `develop`

1. ✅ Install dependencies
2. ✅ Run type checking
3. ✅ Build project
4. ✅ Deploy to Vercel (production)
5. ✅ Verify deployment

### Workflow 2: Automated Testing
**Triggers:** Every push or pull request

1. 🧪 Run frontend type-check
2. 🧪 Run backend type-check
3. 🧪 Linting checks
4. 📊 Generate test report

### Workflow 3: Auto-Fix Issues
**Triggers:** When tests fail

1. 🔍 Detect code quality issues
2. 🔧 Auto-fix linting/formatting
3. 📝 Commit fixes
4. 🤖 Create PR for review

---

## Daily Usage

### Add Features (Completely Automated)

```bash
# Make changes
echo "// New feature" >> saans-web/src/App.tsx

# Commit and push
git add .
git commit -m "feat: Add new feature"
git push

# ✨ That's it! Pipeline handles everything:
# - Tests automatically
# - Deploys automatically to Vercel
# - Fixes errors automatically
# - Creates PRs for review automatically
```

### Monitor Deployments

1. **GitHub Actions:** https://github.com/YOUR_USERNAME/saans-mental-health/actions
2. **Vercel Dashboard:** https://vercel.com/dashboard
3. **Live Site:** https://saans-web.vercel.app

---

## Emergency: Manual Fix

If needed, revert to previous deployment:

```bash
git revert HEAD
git push
# Pipeline automatically redeploys previous working version
```

---

## Environment Variables

Store in Vercel:

### Frontend (.env for local)
```
VITE_API_URL=http://localhost:3000
```

### Backend (.env for local)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

---

## CI/CD Workflow Diagram

```
Your Code
    ↓
git push
    ↓
GitHub Actions Triggered
    ↓
├─ Install Dependencies
├─ Run Tests
├─ Check Types
└─ Build
    ↓
Test Passed?
    ├─ YES → Deploy to Vercel ✅
    │         ↓
    │    Deployment Successful
    │         ↓
    │    Send Deployment Link
    │
    └─ NO → Auto-Fix Issues 🔧
           ↓
        Create PR for Review
           ↓
        Await Your Approval
```

---

## Troubleshooting

### Deployments failing?
1. Check GitHub Actions logs: https://github.com/YOUR_USERNAME/saans-mental-health/actions
2. Check build errors in logs
3. Fix locally and push again

### Environment variables not working?
1. Verify in Vercel dashboard: Settings → Environment Variables
2. Redeploy after adding variables
3. Check that keys match exactly

### Want to disable auto-fix?
Edit `.github/workflows/auto-fix.yml` and remove the job.

---

## Support

- **GitHub Issues:** For bug reports
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://github.com/features/actions

---

**Status:** ✅ Automated Pipeline Ready!

After setup, everything is hands-off. Just push code and watch it deploy! 🚀
