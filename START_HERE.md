# 🚀 START HERE - 3 Simple Steps

## ⏱️ Time Required: 5 Minutes (One-Time Setup)

---

## Step 1: Copy These Commands

Run in terminal:

```bash
cd /Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM

# Initialize git
git init
git add .
git commit -m "🚀 SAANS with Full CI/CD Automation"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/saans-mental-health.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

---

## Step 2: Create Vercel Projects (2 minutes)

### Frontend Project
1. Go to https://vercel.com/new
2. Select: Import Git Repository
3. Choose: `saans-mental-health` (from GitHub)
4. Framework: **Vite**
5. Root Directory: **saans-web**
6. Click Deploy
7. **Copy Project ID** (from URL)

### Backend Project
1. Go to https://vercel.com/new again
2. Import same repo
3. Root Directory: **saans-api**
4. Click Deploy
5. **Copy Project ID**

---

## Step 3: Add Secrets to GitHub (2 minutes)

Go to: https://github.com/YOUR_USERNAME/saans-mental-health/settings/secrets/actions

Click "New repository secret" and add:

```
Name: VERCEL_TOKEN
Value: <Get from https://vercel.com/account/tokens>

Name: VERCEL_ORG_ID
Value: <Your Vercel ID from dashboard>

Name: VERCEL_PROJECT_ID_WEB
Value: <Frontend Project ID from Vercel>

Name: VERCEL_PROJECT_ID_API
Value: <Backend Project ID from Vercel>
```

---

## 🎉 DONE!

Now whenever you push code:
```bash
git add .
git commit -m "Your message"
git push

# ✨ Everything happens automatically!
# - Tests run
# - Builds
# - Deploys to Vercel
# - Live in < 5 minutes
```

---

## 📊 Monitor Your Deployments

- **GitHub Actions:** https://github.com/YOUR_USERNAME/saans-mental-health/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Live App:** https://saans-web.vercel.app

---

## ❓ Need Help?

Read these files:
- `AUTOMATION_SETUP.md` - Full guide with all details
- `COMPLETE_AUTOMATION_READY.md` - What's included

---

**That's it! You're done! 🎊**

Your app is now fully automated. No more manual deployments! 🚀
