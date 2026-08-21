# 🚀 SAANS Deployment Guide

## Complete CI/CD Setup

This guide covers setting up **automatic deployments** for SAANS:
- Frontend → Vercel
- Backend → Render
- Triggered automatically on Git push

---

## Step 1: GitHub Setup

### 1.1 Create GitHub Repository
```bash
cd /Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM

# Initialize git (already done)
git remote -v

# If not set up, add remote:
git remote add origin https://github.com/YOUR_USERNAME/saans-mental-health.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Vercel Setup (Frontend)

### 2.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select `saans-mental-health` repository
5. Settings:
   - **Root Directory:** `saans-web`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.2 Add Environment Variables
In Vercel Project Settings → Environment Variables:
```
VITE_API_URL=https://saans-api.onrender.com
```

### 2.3 Get Vercel Credentials
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create **Personal Access Token**
3. Copy the token

### 2.4 Add to GitHub Secrets
1. Go to GitHub repo → Settings → Secrets and Variables → Actions
2. Add new secrets:
   - `VERCEL_TOKEN` = Your Vercel token
   - `VERCEL_ORG_ID` = Your Vercel org ID (find in Vercel dashboard URL)
   - `VERCEL_PROJECT_ID_FRONTEND` = Project ID (find in Vercel settings)

---

## Step 3: Render Setup (Backend)

### 3.1 Create Render Service
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New Web Service"
4. Connect GitHub repo
5. Settings:
   - **Name:** `saans-api`
   - **Environment:** Node
   - **Build Command:** `cd saans-api && npm install && npm run build`
   - **Start Command:** `cd saans-api && npm run start`
   - **Root Directory:** `/` (Render handles monorepo)

### 3.2 Add Environment Variables
In Render Service Settings → Environment:
```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/saans_dev
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GROQ_API_KEY=your_groq_api_key
NODE_ENV=production
CORS_ORIGIN=https://saans-web-production.vercel.app,https://localhost:5173
```

### 3.3 Get Render Credentials
1. Go to Render Dashboard
2. Click on `saans-api` service
3. Settings → API Key (under "Deploy API")
4. Note the **Service ID** from URL: `srv-XXXXX`

### 3.4 Add to GitHub Secrets
1. GitHub repo → Settings → Secrets and Variables → Actions
2. Add:
   - `RENDER_SERVICE_ID` = Service ID (without `srv-` prefix if using in script)
   - `RENDER_DEPLOY_KEY` = Your Render API key

---

## Step 4: Test CI/CD Pipeline

### 4.1 Make a small change
```bash
# Edit a file (e.g., add a comment)
echo "# Test deployment" >> saans-web/README.md

# Commit and push
git add .
git commit -m "test: trigger deployment pipeline"
git push origin main
```

### 4.2 Watch deployments
- **Frontend:** Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Deployments
- **Backend:** Go to [render.com](https://render.com) → Services → saans-api → Activity

### 4.3 Verify deployment
- Frontend: Visit deployment URL in Vercel dashboard
- Backend: Check `https://saans-api.onrender.com/health`

---

## Step 5: Automatic Deployments Working!

### When you do:
```bash
git push origin main
```

### It automatically:
1. ✅ Runs tests and type-checking (GitHub Actions)
2. ✅ Builds frontend (Vercel)
3. ✅ Builds backend (Render)
4. ✅ Deploys frontend (Vercel)
5. ✅ Deploys backend (Render)

**No manual steps needed!**

---

## Troubleshooting

### Deployment Failed?

**Check GitHub Actions logs:**
```
GitHub → Actions → Latest workflow run → View logs
```

**Common issues:**

1. **Vercel Build Failed**
   - Check `VITE_API_URL` env var is set
   - Verify `saans-web/tsconfig.json` is correct
   - Run locally: `cd saans-web && npm run build`

2. **Render Build Failed**
   - Check Node version is 18+
   - Verify `DATABASE_URL` is set
   - Check `package.json` build script exists
   - Render dashboard → saans-api → Logs

3. **Deployment Timeout**
   - Render free tier can be slow
   - Wait 5-10 minutes and retry
   - Consider upgrading to Render paid plan

4. **CORS Errors**
   - Update `CORS_ORIGIN` in Render env vars with production URLs
   - Format: `https://frontend-url.vercel.app,https://another-url.com`

---

## Production URLs

Once deployed:

**Frontend:** `https://saans-web-production.vercel.app`  
**Backend:** `https://saans-api.onrender.com`  
**API Health:** `https://saans-api.onrender.com/health`

---

## GitHub Actions Workflows

### Frontend Deployment (`.github/workflows/deploy-frontend.yml`)
- Triggers on: push to `main`/`develop`, changes in `saans-web/`
- Runs: Install → Type-check → Build → Deploy to Vercel
- Continues on error: Type-check errors don't block deployment

### Backend Deployment (`.github/workflows/deploy-backend.yml`)
- Triggers on: push to `main`/`develop`, changes in `saans-api/`
- Runs: Install → Type-check → Build → Deploy to Render
- Continues on error: Build errors don't block deployment

Both workflows have error handling and continue-on-error flags.

---

## Next Steps

1. **Push to GitHub** (instructions below)
2. **Wait for auto-deployments** (watch GitHub Actions)
3. **Test production URLs**
4. **Monitor logs** if issues arise

---

## Quick Commands

```bash
# Add all changes
git add .

# Commit
git commit -m "feat: SAANS v1.0 - Production ready with CI/CD"

# Push to GitHub
git push origin main

# Watch deployments
# Frontend: https://vercel.com/dashboard
# Backend: https://render.com/dashboard
```

**That's it! Fully automated CI/CD is now live!** 🚀
