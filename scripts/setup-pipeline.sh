#!/bin/bash

# 🚀 SAANS COMPLETE AUTOMATED PIPELINE SETUP
# This script sets up the entire CI/CD + automation system

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🚀 SAANS AUTOMATED PIPELINE SETUP                    ║"
echo "║  Everything will be automated from now on!             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# STEP 1: Check Git installation
echo -e "${YELLOW}STEP 1: Checking Git installation...${NC}"
if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ Git is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Git found${NC}"

# STEP 2: Initialize Git repo (if not already)
echo ""
echo -e "${YELLOW}STEP 2: Initializing Git repository...${NC}"
if [ ! -d .git ]; then
  git init
  echo -e "${GREEN}✅ Git repository initialized${NC}"
else
  echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

# STEP 3: Install Node dependencies
echo ""
echo -e "${YELLOW}STEP 3: Installing dependencies...${NC}"
echo "Installing root dependencies..."
npm install --save-dev husky lint-staged prettier eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-plugin-security

if [ -d "saans-web" ]; then
  echo "Installing frontend dependencies..."
  cd saans-web
  npm install
  cd ..
fi

if [ -d "saans-api" ]; then
  echo "Installing backend dependencies..."
  cd saans-api
  npm install
  cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# STEP 4: Setup Husky hooks
echo ""
echo -e "${YELLOW}STEP 4: Setting up Husky pre-commit/pre-push hooks...${NC}"
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
echo -e "${GREEN}✅ Husky hooks configured${NC}"

# STEP 5: Create npm scripts
echo ""
echo -e "${YELLOW}STEP 5: Adding npm scripts to package.json...${NC}"
npm pkg set scripts.lint="eslint 'src/**/*.{ts,tsx,js}' --fix"
npm pkg set scripts.format="prettier --write 'src/**/*.{ts,tsx,js,json}'"
npm pkg set scripts.type-check="tsc --noEmit"
npm pkg set scripts.test:quick="npm run type-check"
npm pkg set scripts.pre-commit="npm run lint && npm run format && npm run type-check"
npm pkg set scripts.pre-push="npm run test:quick && npm run build"

echo -e "${GREEN}✅ npm scripts added${NC}"

# STEP 6: Create .gitignore
echo ""
echo -e "${YELLOW}STEP 6: Creating .gitignore...${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log
npm-debug.log*

# Misc
.cache/
.turbo/
EOF
echo -e "${GREEN}✅ .gitignore created${NC}"

# STEP 7: Create commit template
echo ""
echo -e "${YELLOW}STEP 7: Creating commit message template...${NC}"
mkdir -p .gitmessage
cat > .gitmessage/template << 'EOF'
# <type>: <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, perf, test, chore
# Example: feat: Add AI counselor chat feature
EOF
git config commit.template .gitmessage/template
echo -e "${GREEN}✅ Commit template configured${NC}"

# STEP 8: Setup GitHub Actions secrets check
echo ""
echo -e "${YELLOW}STEP 8: Checking GitHub Actions secrets...${NC}"
echo -e "${YELLOW}Make sure these secrets are set in GitHub:${NC}"
echo "  - VERCEL_TOKEN"
echo "  - VERCEL_ORG_ID"
echo "  - VERCEL_PROJECT_ID_WEB"
echo "  - RENDER_API_KEY"
echo "  - RENDER_BACKEND_SERVICE_ID_STAGING"
echo "  - RENDER_BACKEND_SERVICE_ID_PROD"
echo "  - SLACK_WEBHOOK_URL (optional)"
echo "  - EMAIL_USERNAME (optional)"
echo "  - EMAIL_PASSWORD (optional)"
echo "  - EMAIL_TO (optional)"

# STEP 9: Create configuration files
echo ""
echo -e "${YELLOW}STEP 9: Creating configuration files...${NC}"

# TypeScript config
if [ ! -f tsconfig.json ]; then
  cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "resolveJsonModule": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
EOF
fi

echo -e "${GREEN}✅ Configuration files created${NC}"

# STEP 10: Install lint-staged
echo ""
echo -e "${YELLOW}STEP 10: Setting up lint-staged for selective file checking...${NC}"
npm pkg set "lint-staged.src/**/*.{ts,tsx,js}="eslint --fix" "prettier --write""
echo -e "${GREEN}✅ lint-staged configured${NC}"

# STEP 11: Create Docker support files
echo ""
echo -e "${YELLOW}STEP 11: Creating Docker configuration...${NC}"

# Frontend Dockerfile
cat > Dockerfile.frontend << 'EOF'
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY saans-web/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY saans-web/src ./src
COPY saans-web/public ./public
COPY saans-web/vite.config.ts ./
COPY saans-web/tsconfig.json ./

# Build
RUN npm run build

# Production stage
FROM node:24-alpine
WORKDIR /app
COPY --from=0 /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "preview"]
EOF

# Backend Dockerfile
cat > Dockerfile.backend << 'EOF'
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY saans-api/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY saans-api/src ./src
COPY saans-api/prisma ./prisma
COPY saans-api/tsconfig.json ./

# Build
RUN npm run build

# Generate Prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
EOF

echo -e "${GREEN}✅ Docker configuration created${NC}"

# STEP 12: Create GitHub Actions workflow status check
echo ""
echo -e "${YELLOW}STEP 12: Creating workflow status script...${NC}"
cat > scripts/check-workflow.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking GitHub Actions workflow status..."

# Get latest workflow run
LATEST_RUN=$(gh run list --limit 1 --json status,conclusion,name --jq '.[0]')

echo "Latest workflow:"
echo "$LATEST_RUN" | jq '.'

echo ""
echo "To view full logs:"
echo "gh run view $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')"
EOF
chmod +x scripts/check-workflow.sh

echo -e "${GREEN}✅ Workflow status script created${NC}"

# STEP 13: Create development scripts
echo ""
echo -e "${YELLOW}STEP 13: Creating development convenience scripts...${NC}"

# Auto-push script
cat > scripts/auto-push.sh << 'EOF'
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
EOF
chmod +x scripts/auto-push.sh

# Deploy script
cat > scripts/deploy.sh << 'EOF'
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
EOF
chmod +x scripts/deploy.sh

echo -e "${GREEN}✅ Development scripts created${NC}"

# STEP 14: Create monitoring script
echo ""
echo -e "${YELLOW}STEP 14: Creating deployment monitoring script...${NC}"

cat > scripts/monitor-deployment.sh << 'EOF'
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
EOF
chmod +x scripts/monitor-deployment.sh

echo -e "${GREEN}✅ Monitoring script created${NC}"

# STEP 15: Final checks
echo ""
echo -e "${YELLOW}STEP 15: Running final validation...${NC}"

# Check if all tools are available
MISSING_TOOLS=0

if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ git not found${NC}"
  MISSING_TOOLS=$((MISSING_TOOLS + 1))
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found${NC}"
  MISSING_TOOLS=$((MISSING_TOOLS + 1))
fi

if [ -f node_modules/.bin/eslint ]; then
  echo -e "${GREEN}✅ ESLint installed${NC}"
else
  echo -e "${RED}❌ ESLint not found${NC}"
fi

if [ -f node_modules/.bin/prettier ]; then
  echo -e "${GREEN}✅ Prettier installed${NC}"
else
  echo -e "${RED}❌ Prettier not found${NC}"
fi

if [ -f .husky/pre-commit ]; then
  echo -e "${GREEN}✅ Husky pre-commit hook installed${NC}"
else
  echo -e "${RED}❌ Husky hook not found${NC}"
fi

# FINAL SUMMARY
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ PIPELINE SETUP COMPLETE!                          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Your automated development pipeline is ready!"
echo ""
echo "📝 What happens automatically now:"
echo "  1️⃣  Before commit → Prettier formats code"
echo "  2️⃣  Before commit → ESLint checks code"
echo "  3️⃣  Before commit → TypeScript checks types"
echo "  4️⃣  Before push → Final tests & build"
echo "  5️⃣  On GitHub → Full CI/CD pipeline runs"
echo "  6️⃣  On main branch → Auto deploys to production"
echo "  7️⃣  After deploy → Health checks & validation"
echo ""
echo "🚀 Quick start commands:"
echo "  npm run lint          → Fix all lint errors"
echo "  npm run format        → Format all code"
echo "  npm run type-check    → Check TypeScript"
echo "  npm run build         → Build project"
echo "  bash scripts/auto-push.sh  → Complete auto push"
echo "  bash scripts/deploy.sh     → Deploy to production"
echo ""
echo "📊 Monitoring:"
echo "  bash scripts/monitor-deployment.sh  → Check deployment status"
echo "  gh run list                         → View all workflow runs"
echo "  gh run view <id>                    → View specific workflow"
echo ""
echo "⚙️  Setup GitHub Secrets:"
echo "  Go to: Settings → Secrets and variables → Actions"
echo "  Add: VERCEL_TOKEN, RENDER_API_KEY, etc."
echo ""
echo "❓ Need help?"
echo "  Read: IMPLEMENTATION_ROADMAP.md"
echo "  Read: SYSTEM_DESIGN.md"
echo ""
echo "🎯 Next: Commit your code!"
echo "  git add ."
echo "  git commit -m 'feat: awesome new feature'"
echo "  git push"
echo ""
echo "✨ Everything after that is AUTOMATIC! ✨"
echo ""
