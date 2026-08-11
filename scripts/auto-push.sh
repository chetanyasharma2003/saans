#!/bin/bash

echo "🚀 Running complete automated pipeline..."

# Step 1: Lint and format
echo "Step 1: Linting and formatting..."
npm run lint
npm run format

# Step 2: Type check
echo "Step 2: Type checking..."
npm run type-check

# Step 3: Build
echo "Step 3: Building..."
npm run build

# Step 4: Git operations
echo "Step 4: Git operations..."
git add -A
git commit -m "chore: automated code quality improvements"
git push

echo "✅ Complete automated push finished!"
