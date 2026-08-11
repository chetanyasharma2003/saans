#!/bin/bash

echo "🚀 SAANS Automated Pipeline Setup"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📝 Initializing Git repository..."
    git init
    git config user.email "dev@saans.com"
    git config user.name "SAANS Dev"
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "📝 Creating initial commit..."
git commit -m "🚀 SAANS Platform with Full CI/CD Automation" 2>/dev/null || echo "Already committed"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Connect to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/saans.git"
echo "   git push -u origin main"
echo ""
echo "2️⃣  Go to Vercel & create 2 projects:"
echo "   - Frontend: saans-web"
echo "   - Backend: saans-api"
echo ""
echo "3️⃣  Add GitHub Secrets:"
echo "   Go to: Settings → Secrets and Variables → Actions"
echo "   Add:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID_WEB"
echo "   - VERCEL_PROJECT_ID_API"
echo ""
echo "4️⃣  Add Vercel Environment Variables"
echo ""
echo "5️⃣  Push changes:"
echo "   git push"
echo ""
echo "🎉 Everything will deploy automatically!"
echo ""
echo "📖 Full guide: cat AUTOMATION_SETUP.md"
