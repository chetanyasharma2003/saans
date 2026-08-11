#!/bin/bash

BRANCH=${1:-main}

echo "🚀 Deploying to $BRANCH..."

# Ensure we're on the right branch
git checkout $BRANCH
git pull

# Run pipeline
npm run lint
npm run format
npm run type-check
npm run build
npm run test:quick

# Push to trigger GitHub Actions deployment
git push

echo "✅ Deployment triggered! Watch GitHub Actions for progress."
