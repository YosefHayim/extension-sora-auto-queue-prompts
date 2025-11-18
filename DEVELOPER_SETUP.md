# Developer Setup Guide

Quick setup guide for new developers joining the **Sora Auto Queue Prompts** project.

---

## Prerequisites

- **Node.js 20.x** or higher
- **npm 10.x** or higher
- **Git**

Check versions:
```bash
node --version   # Should be v20.x or higher
npm --version    # Should be v10.x or higher
git --version    # Any recent version
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git
cd extension-sora-auto-queue-prompts
```

### 2. Install Dependencies

```bash
npm install
```

This automatically:
- Installs all project dependencies
- Sets up Husky Git hooks (via `prepare` script)
- Configures pre-push hook for coverage enforcement

### 3. Verify Husky Installation

Check that the pre-push hook is properly installed:

```bash
ls -la .husky/pre-push
```

Expected output:
```
-rwxr-xr-x  1 user  staff  XXX  DATE .husky/pre-push
```

The `x` permission is critical - it makes the hook executable.

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Checkout dev branch
git checkout dev
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit code in `src/` directory:
- `src/popup.tsx` - UI components
- `src/background.ts` - Service worker logic
- `src/content.ts` - Sora page automation
- `src/utils/` - Utility functions

### 3. Write Tests

**IMPORTANT:** This project enforces 90% test coverage.

Add tests in `tests/` directory:
```bash
tests/
└── utils/
    ├── storage.test.ts
    ├── promptGenerator.test.ts
    └── queueProcessor.test.ts
```

Run tests during development:
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode (auto-rerun on changes)
npm run test:coverage     # Check coverage percentage
```

### 4. Check Coverage Before Pushing

**Required:** Coverage must be >= 90% for all metrics:
- Statements
- Branches
- Functions
- Lines

```bash
npm run test:coverage
```

View detailed coverage report:
```bash
open coverage/lcov-report/index.html
```

Uncovered code is highlighted in red. Add tests until all metrics are >= 90%.

### 5. Format Code

```bash
npm run format   # Auto-fix formatting
npm run lint     # Check formatting (without fixing)
```

### 6. Build the Extension

```bash
npm run build    # Production build
npm run dev      # Development build (watch mode)
```

Verify build output:
```bash
ls -la dist/
```

Should contain:
- `background.js`
- `popup.js`
- `content.js`
- `manifest.json`
- `popup.html`
- `popup.css`
- `icons/`

### 7. Commit Changes

```bash
git add .
git commit -m "Add feature X with comprehensive tests"
```

### 8. Push to Remote

```bash
git push origin feature/your-feature-name
```

**What happens:**
1. Husky pre-push hook triggers
2. `npm run test:coverage` runs automatically
3. If coverage < 90%, push is blocked
4. If coverage >= 90%, push proceeds

If blocked:
```
PUSH BLOCKED: Test coverage is below 90% threshold
Please add tests to increase coverage before pushing

To bypass this check (NOT RECOMMENDED), use:
git push --no-verify
```

DO NOT use `--no-verify`. Instead, add tests until coverage >= 90%.

### 9. Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Target branch: `main`
4. Fill in PR description
5. Submit

GitHub Actions CI will:
- Run tests with coverage validation (must be >= 90%)
- Build the extension
- Run lint checks

If any check fails, PR cannot be merged.

---

## Common Tasks

### Run Extension in Chrome (Manual Testing)

1. Build the extension:
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable "Developer mode" (toggle in top-right)

4. Click "Load unpacked"

5. Select the `dist/` directory

6. Test the extension:
   - Click extension icon in toolbar
   - Navigate to sora.com
   - Test prompt generation and queue management

### Debugging Tests

```bash
# Run specific test file
npm test -- storage.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should save prompts"

# Run with verbose output
npm test -- --verbose

# Run in watch mode (recommended during development)
npm run test:watch
```

### Debugging Build Issues

```bash
# Clean build artifacts
npm run clean

# Rebuild from scratch
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (use with caution)
npm update
```

---

## Project Structure Overview

```
extension-sora-auto-queue-prompts/
├── src/
│   ├── popup.tsx              # React UI (main interface)
│   ├── background.ts          # Service worker (orchestration)
│   ├── content.ts             # Content script (Sora page automation)
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       ├── storage.ts         # Chrome storage wrapper
│       ├── promptGenerator.ts # OpenAI API integration
│       ├── csvParser.ts       # CSV import/export
│       ├── queueProcessor.ts  # Queue automation logic
│       ├── promptActions.ts   # Prompt editing operations
│       └── logger.ts          # Debug logging
├── tests/
│   ├── setup.ts               # Jest setup
│   └── utils/                 # Unit tests for utils
├── assets/
│   ├── manifest.json          # Extension manifest (Manifest V3)
│   ├── popup.html             # Popup HTML template
│   └── popup.css              # Popup styles
├── dist/                      # Build output (gitignored)
├── coverage/                  # Coverage reports (gitignored)
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── .husky/
│   └── pre-push               # Pre-push Git hook
├── jest.config.js             # Jest configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── COVERAGE_SETUP.md          # Detailed coverage enforcement docs
└── DEVELOPER_SETUP.md         # This file
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **Test & Coverage** (required, runs first)
   - Runs `npm run test:coverage`
   - Fails if coverage < 90%
   - Uploads coverage report as artifact

2. **Build Extension** (runs after test passes)
   - Runs `npm run build`
   - Verifies output files exist
   - Uploads build artifact

3. **Lint** (runs in parallel with build)
   - Runs TypeScript type check
   - Runs Prettier formatting check

All jobs must pass before PR can be merged.

---

## Coverage Enforcement

### Two Levels of Enforcement

1. **Local (Pre-Push Hook)**
   - Runs before code is pushed to remote
   - Fast feedback loop
   - Saves CI minutes
   - Can be bypassed with `--no-verify` (NOT RECOMMENDED)

2. **Remote (GitHub Actions CI)**
   - Runs on every push to `main` and every PR
   - Absolute enforcement (cannot be bypassed)
   - Prevents merging of low-coverage code
   - Visible to entire team

### Why 90%?

- High code quality and maintainability
- Early bug detection
- Documentation through tests
- Reduced regression risk
- Confidence during refactoring

---

## Troubleshooting

### Problem: Pre-push hook not running

**Solution:**
```bash
# Reinstall Husky
npm run prepare

# Make hook executable
chmod +x .husky/pre-push

# Test hook manually
.husky/pre-push
```

### Problem: Coverage below 90%

**Solution:**
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Identify uncovered code (highlighted in red)
# Write tests for uncovered code
# Re-run coverage check
```

### Problem: Tests fail on CI but pass locally

**Solution:**
```bash
# Use same Node version as CI
nvm install 20
nvm use 20

# Clean install
rm -rf node_modules package-lock.json
npm install

# Run tests
npm run test:coverage
```

### Problem: Build fails

**Solution:**
```bash
# Clean build artifacts
npm run clean

# Check TypeScript errors
npx tsc --noEmit

# Rebuild
npm run build
```

---

## Useful Commands Cheat Sheet

```bash
# Development
npm run dev                # Watch mode build
npm test                   # Run tests
npm run test:watch         # Watch mode tests
npm run test:coverage      # Generate coverage report

# Code Quality
npm run format             # Auto-fix formatting
npm run lint               # Check formatting

# Build
npm run build              # Production build
npm run clean              # Clean build artifacts

# Coverage
open coverage/lcov-report/index.html  # View coverage report

# Git
git push                   # Normal push (triggers pre-push hook)
git push --no-verify       # Bypass hook (NOT RECOMMENDED)
```

---

## Getting Help

- **Coverage issues?** Read `COVERAGE_SETUP.md`
- **Architecture questions?** Read `.claude/CLAUDE.md`
- **Bug reports?** Open issue on GitHub
- **Feature requests?** Open issue on GitHub

---

## Important Links

- Repository: https://github.com/YosefHayim/extension-sora-auto-queue-prompts
- Issues: https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues
- Coverage Documentation: `COVERAGE_SETUP.md`
- Project Context: `.claude/CLAUDE.md`

---

**Last Updated:** 2025-11-18
**Minimum Node.js Version:** 20.x
**Coverage Requirement:** 90%
**Manifest Version:** 3
