#!/bin/bash

echo "📊 Monitoring deployment status..."
echo ""

# Check Vercel deployment
echo "🌐 Frontend (Vercel):"
vercel ls | head -5

echo ""
echo "🌐 Backend (Render):"
echo "Check: https://dashboard.render.com"

echo ""
echo "📊 GitHub Actions:"
gh run list --limit 5

echo ""
echo "For detailed logs:"
echo "gh run view <run-id>"
