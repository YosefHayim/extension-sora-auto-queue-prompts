# Test Coverage Enforcement Setup

This project enforces **90% minimum test coverage** at both local (pre-push) and remote (GitHub Actions CI) levels to ensure code quality and maintainability.

---

## Table of Contents

- [Overview](#overview)
- [Quick Setup for New Developers](#quick-setup-for-new-developers)
- [How Coverage Enforcement Works](#how-coverage-enforcement-works)
- [Running Tests Locally](#running-tests-locally)
- [Bypassing Local Coverage Check (Emergency Only)](#bypassing-local-coverage-check-emergency-only)
- [GitHub Actions CI Pipeline](#github-actions-ci-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Coverage Requirements:**
- Minimum 90% coverage for: statements, branches, functions, and lines
- Enforced at two levels:
  1. **Local (Husky pre-push hook)** - Blocks push if coverage < 90%
  2. **Remote (GitHub Actions CI)** - Blocks merge/push if coverage < 90%

**Why 90%?**
- Ensures high code quality and maintainability
- Catches bugs early in development
- Documents expected behavior through tests
- Reduces regression risk during refactoring

---

## Quick Setup for New Developers

### 1. Install Dependencies

```bash
npm install
```

This will automatically:
- Install all project dependencies including Husky
- Set up Git hooks via the `prepare` script
- Configure the pre-push hook

### 2. Verify Husky Setup

Check that the pre-push hook is installed:

```bash
ls -la .husky/pre-push
```

You should see:
```
-rwxr-xr-x  1 user  staff  XXX  DATE .husky/pre-push
```

The `x` indicates the file is executable.

### 3. Test Coverage Locally

Before pushing, run:

```bash
npm run test:coverage
```

This will:
- Run all tests
- Generate a coverage report
- Display coverage percentages for statements, branches, functions, lines
- Fail if any coverage metric is below 90%

### 4. Push Your Code

When you push, the pre-push hook automatically runs:

```bash
git push origin main
```

If coverage is below 90%, the push will be blocked with a clear error message.

---

## How Coverage Enforcement Works

### Local Enforcement (Husky Pre-Push Hook)

**Location:** `.husky/pre-push`

**Flow:**
1. You run `git push`
2. Git triggers the pre-push hook
3. Hook runs `npm run test:coverage`
4. Jest checks coverage against 90% threshold (defined in `jest.config.js`)
5. If coverage < 90%:
   - Push is blocked
   - Error message displayed
   - You must add tests before pushing
6. If coverage >= 90%:
   - Push proceeds normally

**Advantages:**
- Fast feedback (fails before pushing to remote)
- Saves CI minutes
- Prevents accidental pushes with low coverage

### Remote Enforcement (GitHub Actions CI)

**Location:** `.github/workflows/ci.yml`

**Flow:**
1. Code is pushed to `main` or PR is opened to `main`
2. GitHub Actions runner starts
3. Dependencies are installed (with caching for speed)
4. `npm run test:coverage` executes
5. If coverage < 90%:
   - Workflow fails
   - PR cannot be merged
   - Push is effectively rejected
6. If coverage >= 90%:
   - Workflow passes
   - Additional jobs (build, lint) run
   - PR can be merged

**Advantages:**
- Absolute enforcement (cannot be bypassed)
- Runs on clean environment
- Visible to all team members
- Prevents merging of low-coverage code

### Jest Configuration

**Location:** `jest.config.js`

```javascript
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

Jest automatically fails if any metric is below 90%.

---

## Running Tests Locally

### Run Tests Without Coverage

```bash
npm test
```

Fast feedback loop during development.

### Run Tests With Coverage

```bash
npm run test:coverage
```

Generates detailed coverage report in `coverage/` directory.

### Watch Mode (During Development)

```bash
npm run test:watch
```

Automatically re-runs tests when files change.

### View Coverage Report

After running `npm run test:coverage`, open:

```bash
open coverage/lcov-report/index.html
```

This shows:
- Line-by-line coverage
- Uncovered code highlighted in red
- Per-file coverage metrics

---

## Bypassing Local Coverage Check (Emergency Only)

**WARNING: This should only be used in emergencies and is strongly discouraged.**

If you absolutely must push without meeting coverage requirements:

```bash
git push --no-verify
```

**However:**
- The GitHub Actions CI will still enforce coverage
- Your push will trigger a failing CI build
- PRs cannot be merged until coverage is fixed
- This creates technical debt and blocks the team

**Instead, do this:**
1. Check which files lack coverage: `npm run test:coverage`
2. Write tests for uncovered code
3. Push normally

---

## GitHub Actions CI Pipeline

### Workflow Structure

**File:** `.github/workflows/ci.yml`

**Jobs:**

1. **Test & Coverage** (required)
   - Runs on: `ubuntu-latest`
   - Timeout: 10 minutes
   - Steps:
     - Checkout code
     - Setup Node.js 20 with npm caching
     - Install dependencies (`npm ci`)
     - Run `npm run test:coverage`
     - Upload coverage report as artifact
   - Fails if coverage < 90%

2. **Build Extension** (runs after test passes)
   - Runs on: `ubuntu-latest`
   - Timeout: 5 minutes
   - Steps:
     - Checkout code
     - Setup Node.js 20 with npm caching
     - Install dependencies
     - Run `npm run build`
     - Verify build output (background.js, popup.js, content.js)
     - Upload build artifact

3. **Lint** (runs in parallel with build)
   - Runs on: `ubuntu-latest`
   - Timeout: 5 minutes
   - Steps:
     - Checkout code
     - Setup Node.js 20 with npm caching
     - Install dependencies
     - Run TypeScript type check (`tsc --noEmit`)
     - Check code formatting with Prettier

### Triggers

- **Push to `main`**: Runs full pipeline
- **Pull Request to `main`**: Runs full pipeline
- Concurrency control: Cancels in-progress runs for same branch

### Permissions

Least-privilege model:
- `contents: read` - Read repository contents
- `pull-requests: read` - Read PR metadata

### Artifacts

Available for 7 days after workflow run:
- `coverage-report` - Full coverage HTML report
- `extension-build` - Compiled extension files

---

## Troubleshooting

### Problem: "PUSH BLOCKED: Test coverage is below 90% threshold"

**Solution:**
1. Run `npm run test:coverage` locally
2. Review coverage report: `open coverage/lcov-report/index.html`
3. Identify uncovered code (highlighted in red)
4. Write tests for uncovered code
5. Re-run `npm run test:coverage` to verify
6. Push again

### Problem: Husky hook not running

**Solution:**
```bash
# Reinstall Husky
npm run prepare

# Verify hook is executable
chmod +x .husky/pre-push

# Test hook manually
.husky/pre-push
```

### Problem: CI fails but local tests pass

**Possible causes:**
- Different Node.js versions (CI uses Node 20)
- Missing dependencies in `package.json`
- Tests depend on local environment

**Solution:**
```bash
# Use same Node version as CI
nvm use 20

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests
npm run test:coverage
```

### Problem: Coverage report shows unexpected files

**Solution:**
Check `jest.config.js` `collectCoverageFrom` array:

```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',       // Include all src files
  '!src/**/*.d.ts',          // Exclude type definitions
  '!src/**/*.stories.tsx',   // Exclude Storybook files
],
```

Add more exclusions if needed (e.g., `!src/**/*.test.tsx`).

### Problem: Tests timeout on CI

**Solution:**
1. Increase timeout in `.github/workflows/ci.yml`:
   ```yaml
   timeout-minutes: 15  # Increase from 10
   ```
2. Optimize slow tests (remove unnecessary `waitFor`, reduce test data)
3. Check for infinite loops or missing async/await

---

## Best Practices

1. **Write tests as you code** - Don't wait until the end
2. **Test the critical path first** - Focus on core functionality
3. **Aim for meaningful tests** - Coverage is a means, not an end
4. **Use TDD when appropriate** - Test-Driven Development helps reach 90%
5. **Review coverage reports regularly** - Identify gaps early
6. **Don't game the system** - Empty tests that hit lines without assertions are useless

---

## Useful Commands Reference

```bash
# Development
npm test                  # Run tests (fast feedback)
npm run test:watch        # Watch mode (during development)
npm run test:coverage     # Generate coverage report

# View coverage
open coverage/lcov-report/index.html

# Format code
npm run format            # Auto-fix formatting issues
npm run lint              # Check formatting (CI also runs this)

# Build
npm run build             # Production build
npm run dev               # Watch mode build

# Git
git push                  # Normal push (triggers pre-push hook)
git push --no-verify      # Bypass pre-push hook (NOT RECOMMENDED)
```

---

## Additional Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

---

**Last Updated:** 2025-11-18
**Minimum Node.js Version:** 20.x
**Coverage Requirement:** 90% (statements, branches, functions, lines)
