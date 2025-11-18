# CI/CD Setup

Complete guide to the Continuous Integration and Continuous Deployment pipeline for the Sora Auto Queue Prompts extension.

---

## Overview

The project uses **GitHub Actions** for CI/CD with 90% test coverage enforcement at both local and remote levels.

**Key Features:**
- Automated testing on every push/PR
- 90% coverage requirement (enforced)
- Parallel job execution
- Artifact uploads (coverage reports, builds)
- Security hardening (least-privilege permissions)

---

## GitHub Actions Workflow

### File Location
`.github/workflows/ci.yml`

### Triggers

**Push Events:**
- Push to `main` branch

**Pull Request Events:**
- Pull requests to `main` branch

**Concurrency Control:**
- Cancels in-progress runs for same branch
- Prevents redundant workflow executions

---

## Workflow Jobs

### Job 1: Test & Coverage (Required)

**Purpose:** Run tests and enforce 90% coverage threshold

**Runs On:** `ubuntu-latest`
**Timeout:** 10 minutes

**Steps:**
1. Checkout code (`actions/checkout@v4`)
2. Setup Node.js 20 with pnpm caching (`actions/setup-node@v4`)
3. Install pnpm (`pnpm/action-setup@v4`)
4. Install dependencies (`pnpm install --frozen-lockfile`)
5. Run tests with coverage (`pnpm run test:coverage`)
6. Upload coverage report as artifact

**Fails If:** Any coverage metric < 90%

---

### Job 2: Build Extension (Depends on Test)

**Purpose:** Build extension and verify output files

**Runs On:** `ubuntu-latest`
**Timeout:** 5 minutes

**Steps:**
1. Checkout code
2. Setup Node.js 20 with pnpm caching
3. Install pnpm
4. Install dependencies
5. Run build (`pnpm run build`)
6. Verify output files exist (background.js, popup.js, content.js)
7. Upload build artifact

**Runs After:** Test job passes

---

### Job 3: Lint (Runs in Parallel with Build)

**Purpose:** TypeScript type checking and formatting validation

**Runs On:** `ubuntu-latest`
**Timeout:** 5 minutes

**Steps:**
1. Checkout code
2. Setup Node.js 20 with pnpm caching
3. Install pnpm
4. Install dependencies
5. Run TypeScript check (`pnpm exec tsc --noEmit`)
6. Run Prettier check (`pnpm exec prettier --check`)

**Runs After:** Test job passes

---

## Coverage Enforcement

### Two-Level Enforcement

```
┌─────────────────────────────┐
│  Developer writes code      │
│  with tests                 │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│  Level 1: Local             │
│  (Husky pre-push hook)      │
│  - Runs before push         │
│  - Fast feedback            │
│  - Can bypass (not advised) │
└──────────┬──────────────────┘
           │
           ↓ (if coverage >= 90%)
┌─────────────────────────────┐
│  Code pushed to GitHub      │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│  Level 2: Remote            │
│  (GitHub Actions CI)        │
│  - Absolute enforcement     │
│  - Cannot bypass            │
│  - Blocks PR merge          │
└──────────┬──────────────────┘
           │
           ↓ (if all checks pass)
┌─────────────────────────────┐
│  PR can be merged           │
└─────────────────────────────┘
```

### Why 90%?

- **High Code Quality:** Ensures well-tested codebase
- **Early Bug Detection:** Catches issues before production
- **Documentation:** Tests serve as living documentation
- **Refactoring Confidence:** Safe to refactor with test coverage
- **Team Standard:** Consistent quality across all contributors

---

## Local Pre-Push Hook

### Husky Configuration

**File:** `.husky/pre-push`

**What It Does:**
1. Triggers automatically on `git push`
2. Runs `pnpm run test:coverage`
3. Blocks push if coverage < 90%
4. Shows clear error message if blocked

**Setup:**
```bash
# Automatically set up with pnpm install
pnpm install

# Manually set up if needed
pnpm run prepare

# Verify hook is executable
ls -la .husky/pre-push
# Should show: -rwxr-xr-x (executable)
```

**Bypass (Emergency Only):**
```bash
git push --no-verify
```
**WARNING:** CI will still enforce coverage. Use only in emergencies.

---

## Jest Configuration

### Coverage Thresholds

**File:** `jest.config.js`

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

**Effect:**
- `pnpm run test:coverage` automatically fails if any metric < 90%
- Both local hook and CI use this configuration

---

## CI/CD Performance Optimizations

### 1. pnpm Caching

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
```

**Benefit:** Saves ~30 seconds per run by caching `node_modules`

### 2. Parallel Job Execution

```yaml
build:
  needs: [test]

lint:
  needs: [test]
```

**Benefit:** Build and lint run simultaneously after tests pass

### 3. Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Benefit:** Cancels old runs when new commits pushed

### 4. Job Timeouts

```yaml
test:
  timeout-minutes: 10

build:
  timeout-minutes: 5
```

**Benefit:** Fails fast if jobs hang

---

## Security Hardening

### Least-Privilege Permissions

```yaml
permissions:
  contents: read
  pull-requests: read
```

**Security Benefits:**
- Workflow can only read code and PRs
- Cannot push, create releases, or modify settings
- Follows principle of least privilege

### Pinned Action Versions

```yaml
uses: actions/checkout@v4        # Major version pinning
uses: actions/setup-node@v4      # Allows security updates
uses: pnpm/action-setup@v4       # within major version
```

**Security Benefits:**
- Prevents supply chain attacks
- Allows minor/patch updates for security fixes
- Consider SHA pinning for maximum security

---

## Artifacts

### Coverage Report Artifact

**Name:** `coverage-report`
**Contents:** Complete HTML coverage report
**Retention:** 7 days
**Download:** From GitHub Actions UI

**Use Case:**
- Detailed coverage analysis
- Identify uncovered code
- Share with team

### Build Artifact

**Name:** `extension-build`
**Contents:** Compiled `dist/` folder
**Retention:** 7 days
**Download:** From GitHub Actions UI

**Use Case:**
- Manual testing without building locally
- QA testing
- Release preparation

---

## Monitoring & Debugging

### Viewing Workflow Runs

1. Go to repository on GitHub
2. Click "Actions" tab
3. Select workflow run
4. View job logs and artifacts

### Debugging Failed Runs

**Check Test Failures:**
```yaml
# In workflow run, click "test" job
# Expand "Run pnpm run test:coverage" step
# Review failed test output
```

**Check Build Failures:**
```yaml
# Click "build" job
# Expand "Run pnpm run build" step
# Review build errors
```

**Check Lint Failures:**
```yaml
# Click "lint" job
# Review TypeScript or Prettier errors
```

---

## Common CI Issues & Solutions

### Issue: npm cache not working, using pnpm now

**Solution:**
```yaml
# Updated in workflow:
- uses: pnpm/action-setup@v4
  with:
    version: 9
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

### Issue: Coverage varies between local and CI

**Cause:** Different environments

**Solution:**
```bash
# Match CI environment locally
nvm install 20
nvm use 20

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Run tests
pnpm run test:coverage
```

### Issue: Tests timeout on CI

**Solution:**
1. Increase timeout in workflow:
   ```yaml
   timeout-minutes: 15  # Increase from 10
   ```
2. Optimize slow tests
3. Check for infinite loops or missing async/await

### Issue: Build fails on CI but works locally

**Cause:** Missing files or environment differences

**Solution:**
```bash
# Clean build
pnpm run clean
pnpm run build

# Check dist/ contents
ls -la dist/

# Verify all required files present
```

---

## Adding New CI Jobs

### Example: Add Security Scanning

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    - name: Run security audit
      run: pnpm audit --prod
```

---

## Updating Workflow

### Update Node.js Version

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change from 20
    cache: 'pnpm'
```

Also update in:
- `package.json` `engines` field
- `docs/DEVELOPMENT.md` prerequisites
- Local development environment

### Update Coverage Threshold

**File:** `jest.config.js`
```javascript
coverageThreshold: {
  global: {
    branches: 95,    // Increase from 90
    functions: 95,
    lines: 95,
    statements: 95,
  },
}
```

Both local and CI automatically use new threshold.

---

## Best Practices

### 1. Keep Jobs Fast
- Use caching (pnpm, npm)
- Run independent jobs in parallel
- Set appropriate timeouts

### 2. Fail Fast
- Run tests before build
- Set timeouts on all jobs
- Cancel in-progress runs on new pushes

### 3. Security First
- Use least-privilege permissions
- Pin action versions
- Never log secrets
- Use GitHub Secrets for sensitive data

### 4. Provide Clear Feedback
- Descriptive job names
- Helpful error messages
- Upload relevant artifacts

---

## Useful Commands

### Locally Replicate CI

```bash
# Match CI environment
nvm use 20

# Install exactly as CI does
pnpm install --frozen-lockfile

# Run tests as CI does
pnpm run test:coverage

# Build as CI does
pnpm run build

# Lint as CI does
pnpm exec tsc --noEmit
pnpm exec prettier --check .
```

---

## Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Action Setup](https://github.com/pnpm/action-setup)
- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [Husky Documentation](https://typicode.github.io/husky/)

### Internal Docs
- `docs/DEVELOPMENT.md` - Developer setup and workflow
- `.github/workflows/ci.yml` - Workflow configuration
- `jest.config.js` - Test configuration
- `.husky/pre-push` - Pre-push hook

---

## Summary

**What You Get:**
- 90% test coverage enforced at 2 levels
- Automated testing, building, and linting
- Fast feedback loop with pre-push hooks
- Secure, performant CI/CD pipeline
- Comprehensive documentation

**Developer Workflow:**
1. Write code + tests (aim for 90%+ coverage)
2. Run `pnpm run test:coverage` locally
3. Commit and push
4. Pre-push hook validates coverage
5. GitHub Actions validates on remote
6. Merge PR when all checks pass

**Key Files:**
- `.github/workflows/ci.yml` - CI pipeline
- `.husky/pre-push` - Local enforcement
- `jest.config.js` - Coverage thresholds

---

**Last Updated:** 2025-11-18
**Coverage Requirement:** 90%
**CI Provider:** GitHub Actions
**Package Manager:** pnpm
**Node.js Version:** 20.x
