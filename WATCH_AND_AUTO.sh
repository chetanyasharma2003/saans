#!/bin/bash

# 👀 FILE WATCHER - Monitors all code changes
# Automatically triggers AUTO_EVERYTHING.sh when files change

PROJECT_ROOT="/Users/chetanya/Documents/SAANS_MENTAL_HEALTH_PLATFORM"
AUTO_SCRIPT="$PROJECT_ROOT/AUTO_EVERYTHING.sh"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║          👀 FILE WATCHER - AUTO MODE ACTIVE 👀         ║"
echo "║                                                        ║"
echo "║  Monitoring for file changes...                        ║"
echo "║  When you save code, everything happens automatically! ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Watching these directories:"
echo "  📁 saans-web/src"
echo "  📁 saans-api/src"
echo ""
echo "What happens on each save:"
echo "  ✨ Format code (Prettier)"
echo "  🔍 Lint code (ESLint)"
echo "  📘 Type check (TypeScript)"
echo "  🏗️  Build project"
echo "  🧪 Run tests"
echo "  📤 Auto-commit & push"
echo "  🚀 Auto-deploy (GitHub Actions)"
echo ""
echo "Press Ctrl+C to stop watching"
echo ""

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
  echo "📦 Installing fswatch for file monitoring..."
  brew install fswatch
fi

# Watch for file changes
fswatch -r -e "node_modules" -e ".git" -e "dist" \
  "$PROJECT_ROOT/saans-web/src" \
  "$PROJECT_ROOT/saans-api/src" | \
  while read file; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 File changed: $file"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Run auto-everything
    bash "$AUTO_SCRIPT"

    echo ""
    echo "✅ READY FOR NEXT CHANGE"
    echo ""
  done
