#!/bin/bash

# CI/CD Setup Verification Script
# This script verifies that the CI/CD setup is correctly installed

set -e

echo "🔍 Verifying CI/CD Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NOT FOUND"
    return 1
  fi
}

check_executable() {
  if [ -x "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 is executable"
    return 0
  else
    echo -e "${RED}✗${NC} $1 is NOT executable"
    return 1
  fi
}

check_node_version() {
  NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -ge 20 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node --version) (>= 20.x required)"
    return 0
  else
    echo -e "${RED}✗${NC} Node.js version: $(node --version) (>= 20.x required)"
    return 1
  fi
}

check_package_installed() {
  if grep -q "\"$1\"" package.json; then
    echo -e "${GREEN}✓${NC} $1 is in package.json"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NOT in package.json"
    return 1
  fi
}

check_jest_threshold() {
  THRESHOLD=$(grep -A 5 "coverageThreshold" jest.config.js | grep -o "[0-9]\+" | head -1)
  if [ "$THRESHOLD" = "90" ]; then
    echo -e "${GREEN}✓${NC} Jest coverage threshold set to 90%"
    return 0
  else
    echo -e "${RED}✗${NC} Jest coverage threshold NOT set to 90% (found: $THRESHOLD%)"
    return 1
  fi
}

ERRORS=0

# Check Node.js version
echo "1. Checking Node.js version..."
check_node_version || ERRORS=$((ERRORS + 1))
echo ""

# Check required files
echo "2. Checking required files..."
check_file ".github/workflows/ci.yml" || ERRORS=$((ERRORS + 1))
check_file ".husky/pre-push" || ERRORS=$((ERRORS + 1))
check_file "jest.config.js" || ERRORS=$((ERRORS + 1))
check_file "package.json" || ERRORS=$((ERRORS + 1))
check_file "COVERAGE_SETUP.md" || ERRORS=$((ERRORS + 1))
check_file "DEVELOPER_SETUP.md" || ERRORS=$((ERRORS + 1))
check_file "CI_CD_SETUP_SUMMARY.md" || ERRORS=$((ERRORS + 1))
check_file ".github/QUICK_REFERENCE.md" || ERRORS=$((ERRORS + 1))
echo ""

# Check executable permissions
echo "3. Checking executable permissions..."
check_executable ".husky/pre-push" || ERRORS=$((ERRORS + 1))
echo ""

# Check Husky is installed
echo "4. Checking Husky installation..."
check_package_installed "husky" || ERRORS=$((ERRORS + 1))
echo ""

# Check Jest threshold
echo "5. Checking Jest coverage threshold..."
check_jest_threshold || ERRORS=$((ERRORS + 1))
echo ""

# Check npm scripts
echo "6. Checking npm scripts..."
if grep -q '"prepare": "husky"' package.json; then
  echo -e "${GREEN}✓${NC} prepare script configured"
else
  echo -e "${RED}✗${NC} prepare script NOT configured"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"test:coverage"' package.json; then
  echo -e "${GREEN}✓${NC} test:coverage script exists"
else
  echo -e "${RED}✗${NC} test:coverage script NOT found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q '"lint"' package.json; then
  echo -e "${GREEN}✓${NC} lint script exists"
else
  echo -e "${YELLOW}⚠${NC} lint script NOT found (optional)"
fi

if grep -q '"format"' package.json; then
  echo -e "${GREEN}✓${NC} format script exists"
else
  echo -e "${YELLOW}⚠${NC} format script NOT found (optional)"
fi
echo ""

# Check if node_modules exists
echo "7. Checking dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules directory exists"

  if [ -d "node_modules/husky" ]; then
    echo -e "${GREEN}✓${NC} Husky is installed in node_modules"
  else
    echo -e "${YELLOW}⚠${NC} Husky NOT found in node_modules (run: npm install)"
  fi

  if [ -d "node_modules/jest" ]; then
    echo -e "${GREEN}✓${NC} Jest is installed in node_modules"
  else
    echo -e "${RED}✗${NC} Jest NOT found in node_modules (run: npm install)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠${NC} node_modules directory NOT found"
  echo -e "${YELLOW}  →${NC} Run: npm install"
fi
echo ""

# Summary
echo "=================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Setup verification PASSED!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run: npm install (if you haven't already)"
  echo "2. Run: npm run test:coverage"
  echo "3. Verify coverage is >= 90%"
  echo "4. Try pushing code to test pre-push hook"
  echo ""
  echo "Documentation:"
  echo "- DEVELOPER_SETUP.md - Quick start guide"
  echo "- COVERAGE_SETUP.md - Coverage enforcement details"
  echo "- .github/QUICK_REFERENCE.md - Command reference"
  exit 0
else
  echo -e "${RED}✗ Setup verification FAILED with $ERRORS error(s)${NC}"
  echo ""
  echo "Please fix the errors above and run this script again."
  echo ""
  echo "Common fixes:"
  echo "1. Install dependencies: npm install"
  echo "2. Run Husky setup: npm run prepare"
  echo "3. Fix permissions: chmod +x .husky/pre-push"
  exit 1
fi
