# CI/CD Setup Summary

This document summarizes the comprehensive CI/CD setup created for the Sora Auto Queue Prompts Chrome extension, including 90% test coverage enforcement.

---

## What Was Created

### 1. GitHub Actions Workflow
**File:** `.github/workflows/ci.yml`

**Purpose:** Automated CI/CD pipeline that runs on every push to `main` and every pull request.

**Jobs:**
- **Test & Coverage**: Runs tests and enforces 90% coverage threshold (blocks merge if coverage < 90%)
- **Build Extension**: Compiles the extension and verifies output files
- **Lint**: TypeScript type checking and Prettier formatting validation

**Key Features:**
- Node.js 20 with npm caching for fast builds
- Parallel job execution (test runs first, build and lint run in parallel after)
- Artifacts uploaded for coverage reports and build output
- Concurrency control to cancel redundant runs
- Least-privilege permissions for security

---

### 2. Husky Pre-Push Hook
**File:** `.husky/pre-push`

**Purpose:** Local enforcement of 90% coverage before code is pushed to remote.

**How It Works:**
1. Developer runs `git push`
2. Git triggers the pre-push hook automatically
3. Hook runs `npm run test:coverage`
4. If coverage < 90%, push is blocked with clear error message
5. If coverage >= 90%, push proceeds normally

**Benefits:**
- Fast feedback loop (fails before pushing to remote)
- Saves GitHub Actions minutes
- Prevents accidental pushes with insufficient coverage
- Can be bypassed in emergencies with `--no-verify` (but CI still enforces)

---

### 3. Jest Configuration Update
**File:** `jest.config.js`

**Changes:**
- Updated coverage thresholds from 70% to 90% for all metrics:
  - Statements: 90%
  - Branches: 90%
  - Functions: 90%
  - Lines: 90%

**Effect:**
- `npm run test:coverage` now automatically fails if any metric is below 90%
- Both local pre-push hook and GitHub Actions CI use this configuration

---

### 4. Package.json Updates
**File:** `package.json`

**New Dependencies:**
```json
"husky": "^9.0.11"
```

**New Scripts:**
```json
"prepare": "husky"           // Auto-setup Husky on npm install
"lint": "prettier --check ..." // Check formatting (used by CI)
"format": "prettier --write ..." // Auto-fix formatting
```

**Effect:**
- Husky automatically installs Git hooks when developers run `npm install`
- Consistent code formatting enforced via Prettier
- CI can validate formatting without manual intervention

---

### 5. Developer Documentation
**Files:**
- `COVERAGE_SETUP.md` - Comprehensive guide to coverage enforcement
- `DEVELOPER_SETUP.md` - Quick start guide for new developers
- `CI_CD_SETUP_SUMMARY.md` - This file

**Contents:**
- Step-by-step setup instructions
- Development workflow guide
- Troubleshooting common issues
- Best practices and useful commands
- Explanation of coverage enforcement at both levels

---

## Architecture Overview

### Coverage Enforcement Flow

```
Developer makes changes
         │
         ↓
Writes tests (aiming for 90%+ coverage)
         │
         ↓
Runs: npm run test:coverage
         │
    ┌────┴────┐
    │ Jest    │
    │ checks  │
    │ 90%     │
    └────┬────┘
         │
         ├── FAIL: Coverage < 90%
         │   └─→ Add more tests, try again
         │
         └── PASS: Coverage >= 90%
                  │
                  ↓
            git commit -m "..."
                  │
                  ↓
            git push origin branch
                  │
         ┌────────┴────────┐
         │ Husky pre-push  │
         │ hook triggers   │
         └────────┬────────┘
                  │
         npm run test:coverage
                  │
         ┌────────┴────────┐
         │  Coverage OK?   │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │ < 90%       │ >= 90%      │
    ↓             ↓             │
Push blocked   Push succeeds   │
Add tests      │               │
               ↓               │
        Code pushed to GitHub  │
               │               │
        ┌──────┴──────┐        │
        │ GitHub      │        │
        │ Actions CI  │        │
        └──────┬──────┘        │
               │               │
     npm run test:coverage     │
               │               │
        ┌──────┴──────┐        │
        │ Coverage OK?│        │
        └──────┬──────┘        │
               │               │
    ┌──────────┼──────────┐   │
    │ < 90%    │ >= 90%   │   │
    ↓          ↓          │   │
CI fails   CI passes     │   │
Cannot     Run build     │   │
merge PR   and lint      │   │
           │             │   │
           ↓             │   │
      PR can be merged   │   │
```

---

## Next Steps for Developers

### 1. Install Dependencies

```bash
npm install
```

This automatically:
- Installs all packages (including Husky)
- Sets up Git hooks via `prepare` script
- Makes `.husky/pre-push` executable

### 2. Verify Setup

```bash
# Check Husky hook is installed
ls -la .husky/pre-push

# Expected output:
# -rwxr-xr-x ... .husky/pre-push
#  ^^^ (executable permission)

# Test coverage locally
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### 3. Current Coverage Status

**Before you can push, you MUST ensure coverage is >= 90%.**

Check current coverage:
```bash
npm run test:coverage
```

If coverage is below 90%, you will see output like:
```
Jest: "global" coverage threshold for statements (85%) not met: 90%
Jest: "global" coverage threshold for branches (82%) not met: 90%
...
```

Add tests until all metrics are >= 90%.

---

## How to Add Tests

### Example: Testing a Utility Function

**File:** `src/utils/storage.ts`
```typescript
export async function savePrompts(prompts: Prompt[]): Promise<void> {
  await chrome.storage.local.set({ prompts });
}
```

**Test:** `tests/utils/storage.test.ts`
```typescript
import { savePrompts } from '~/src/utils/storage';

describe('storage utils', () => {
  it('should save prompts to chrome storage', async () => {
    const prompts = [{ id: '1', text: 'Test prompt' }];

    await savePrompts(prompts);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ prompts });
  });
});
```

### Identify Uncovered Code

1. Run coverage:
   ```bash
   npm run test:coverage
   ```

2. Open HTML report:
   ```bash
   open coverage/lcov-report/index.html
   ```

3. Click on file with low coverage

4. Uncovered lines are highlighted in red

5. Write tests for those lines

6. Re-run coverage check

7. Repeat until >= 90%

---

## CI/CD Workflow Details

### When CI Runs

1. **Push to `main` branch**
   - Full pipeline executes
   - Must pass before code is in main
   - Protects main branch from low-quality code

2. **Pull Request to `main` branch**
   - Full pipeline executes on PR commits
   - PR cannot be merged until all checks pass
   - Status checks visible in PR interface

### What CI Does

**Job 1: Test & Coverage** (required)
```yaml
- Checkout code
- Setup Node.js 20 with npm cache
- Install dependencies (npm ci)
- Run: npm run test:coverage
  └─→ Jest enforces 90% threshold
  └─→ Fails if any metric < 90%
- Upload coverage report as artifact
```

**Job 2: Build Extension** (runs after test passes)
```yaml
- Checkout code
- Setup Node.js 20 with npm cache
- Install dependencies (npm ci)
- Run: npm run build
- Verify output files exist
- Upload build artifact
```

**Job 3: Lint** (runs in parallel with build)
```yaml
- Checkout code
- Setup Node.js 20 with npm cache
- Install dependencies (npm ci)
- Run: npx tsc --noEmit (TypeScript type check)
- Run: npx prettier --check ... (format check)
```

### CI Performance Optimizations

- **npm caching**: Dependencies cached between runs (saves ~30s per run)
- **Parallel jobs**: Build and lint run simultaneously after test
- **Concurrency control**: Old runs cancelled when new commits pushed
- **Timeouts**: Jobs fail fast if stuck (test: 10min, build/lint: 5min)
- **ubuntu-latest runner**: Fast, reliable, cost-effective

---

## Security Considerations

### GitHub Actions Security

**Least-Privilege Permissions:**
```yaml
permissions:
  contents: read
  pull-requests: read
```

- Workflow can only read code and PRs
- Cannot push, create releases, or modify settings
- Follows principle of least privilege

**Pinned Action Versions:**
```yaml
uses: actions/checkout@v4        # Major version pinning
uses: actions/setup-node@v4      # Allows automatic security updates
uses: actions/upload-artifact@v4 # within major version
```

- Prevents supply chain attacks
- Allows minor/patch updates for security fixes
- Consider SHA pinning for maximum security

**Secrets Management:**
- No secrets required for CI at this time
- If secrets needed (e.g., OpenAI API key for integration tests):
  - Store in GitHub Secrets
  - Never log or print secrets
  - Use `mask: true` in outputs

---

## Bypassing Coverage Checks (Emergency Only)

### Local Bypass

```bash
git push --no-verify
```

**WARNING:**
- Only use in true emergencies
- GitHub Actions CI will still enforce coverage
- PR will show failing checks
- Cannot merge until coverage is fixed

### When to Bypass Locally

- Never bypass unless absolutely necessary
- Acceptable scenarios:
  - Hotfix for production incident (but still must fix tests before merge)
  - CI is down and blocking critical release (rare)
- Unacceptable scenarios:
  - "I'll write tests later" (no you won't)
  - "Tests are too hard" (ask for help)
  - "Running out of time" (technical debt is worse)

### CI Bypass

**There is no way to bypass GitHub Actions CI enforcement.**

This is intentional and protects code quality. If tests are failing on CI:
1. Reproduce locally with same Node version (20.x)
2. Fix tests
3. Push again

---

## Monitoring and Reporting

### Coverage Reports

**Local:**
- Run: `npm run test:coverage`
- View: `open coverage/lcov-report/index.html`
- Location: `coverage/` (gitignored)

**CI:**
- Uploaded as workflow artifact after every run
- Accessible from GitHub Actions UI
- Retained for 7 days
- Download and extract to view

### Build Artifacts

**CI:**
- Extension build uploaded as artifact
- Accessible from GitHub Actions UI
- Contains: `dist/` folder with compiled extension
- Useful for manual testing without building locally

---

## Maintenance

### Updating Coverage Threshold

If you want to increase coverage requirement (e.g., 95%):

**File:** `jest.config.js`
```javascript
coverageThreshold: {
  global: {
    branches: 95,    // Change from 90
    functions: 95,   // Change from 90
    lines: 95,       // Change from 90
    statements: 95,  // Change from 90
  },
}
```

Both local and CI will automatically use new threshold.

### Updating Node.js Version

**File:** `.github/workflows/ci.yml`
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change from 20
    cache: 'npm'
```

Also update in documentation (`DEVELOPER_SETUP.md`).

### Adding New CI Jobs

Example: Add security scanning

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - name: Run npm audit
      run: npm audit --production
```

---

## Troubleshooting Common Issues

### Issue: "npm run prepare" fails

**Cause:** Husky not installed

**Solution:**
```bash
npm install --save-dev husky@^9.0.11
npm run prepare
```

### Issue: Pre-push hook doesn't trigger

**Cause:** Hook not executable

**Solution:**
```bash
chmod +x .husky/pre-push
git push # Try again
```

### Issue: Coverage varies between local and CI

**Cause:** Different environments

**Solution:**
```bash
# Match CI environment
nvm install 20
nvm use 20

# Clean install
rm -rf node_modules package-lock.json
npm install

# Run tests
npm run test:coverage
```

### Issue: CI is slow

**Possible causes:**
- npm cache not working
- Tests are slow
- Too many dependencies

**Solution:**
```bash
# Check test duration locally
npm run test:coverage -- --verbose

# Optimize slow tests
# - Remove unnecessary async operations
# - Mock external dependencies
# - Reduce test data size
```

---

## Resources

### Documentation Files
- `COVERAGE_SETUP.md` - Detailed coverage enforcement guide
- `DEVELOPER_SETUP.md` - Developer onboarding guide
- `CI_CD_SETUP_SUMMARY.md` - This file
- `.claude/CLAUDE.md` - Project context and architecture

### External Resources
- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Useful Commands
```bash
# Coverage
npm run test:coverage
open coverage/lcov-report/index.html

# Format
npm run format
npm run lint

# Build
npm run build
npm run dev

# Git hooks
npm run prepare
ls -la .husky/

# CI debugging
git push origin branch
# Then check: https://github.com/YosefHayim/extension-sora-auto-queue-prompts/actions
```

---

## Summary

**What you get:**
- 90% test coverage enforced at 2 levels (local + CI)
- Automated testing, building, and linting on every push/PR
- Fast feedback loop with pre-push hooks
- Comprehensive documentation for developers
- Secure, performant CI/CD pipeline with GitHub Actions

**Developer workflow:**
1. Write code
2. Write tests (aim for 90%+ coverage)
3. Run: `npm run test:coverage` (verify locally)
4. Commit and push
5. Pre-push hook validates coverage
6. GitHub Actions CI validates on remote
7. Merge PR when all checks pass

**Key files:**
- `.github/workflows/ci.yml` - CI pipeline
- `.husky/pre-push` - Local coverage enforcement
- `jest.config.js` - Coverage thresholds
- `COVERAGE_SETUP.md` - Detailed docs
- `DEVELOPER_SETUP.md` - Quick start guide

---

**Last Updated:** 2025-11-18
**Coverage Requirement:** 90% (statements, branches, functions, lines)
**CI Provider:** GitHub Actions
**Node.js Version:** 20.x
