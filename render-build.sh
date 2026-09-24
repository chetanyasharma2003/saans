#!/bin/bash
set -e

echo "🚀 SAANS Build Script - Starting..."

# Set npm configuration to handle peer deps
export NODE_ENV=production
export NPM_CONFIG_LEGACY_PEER_DEPS=true

echo "📦 Installing dependencies with legacy peer deps..."
cd server
npm install --legacy-peer-deps --prefer-offline --no-audit

echo "✅ Dependencies installed successfully!"
echo "🎉 Build complete!"
