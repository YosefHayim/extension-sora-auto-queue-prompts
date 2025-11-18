# Development Guide

Complete guide for developers working on the Sora Auto Queue Prompts Chrome extension.

---

## Prerequisites

- **Node.js 20.x** or higher
- **pnpm** (preferred) or npm 10.x+
- **Git**

Check versions:
```bash
node --version   # Should be v20.x or higher
pnpm --version   # Recommended package manager
git --version    # Any recent version
```

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git
cd extension-sora-auto-queue-prompts
pnpm install
```

This automatically:
- Installs all project dependencies
- Sets up Husky Git hooks
- Configures pre-push hook for coverage enforcement

### 2. Development Commands

```bash
# Development
pnpm run dev              # Watch mode build
pnpm test                 # Run tests
pnpm run test:watch       # Watch mode tests
pnpm run test:coverage    # Generate coverage report

# Code Quality
pnpm run format           # Auto-fix formatting
pnpm run lint             # Check formatting

# Build
pnpm run build            # Production build
pnpm run clean            # Clean build artifacts
```

### 3. Load Extension in Chrome

1. Build the extension: `pnpm run build`
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `dist/` directory

---

## Project Structure

```
extension-sora-auto-queue-prompts/
├── src/
│   ├── popup.tsx              # Main React UI component
│   ├── background.ts          # Service worker (orchestration)
│   ├── content.ts             # Sora.com automation
│   ├── types/
│   │   └── index.ts           # TypeScript definitions
│   └── utils/
│       ├── storage.ts         # Chrome storage wrapper
│       ├── promptGenerator.ts # OpenAI API integration
│       ├── queueProcessor.ts  # Queue automation
│       ├── csvParser.ts       # CSV import/export
│       ├── promptActions.ts   # Prompt operations
│       └── logger.ts          # Debug logging
├── tests/                     # Unit tests (mirror src/)
├── assets/                    # Manifest, icons, static files
├── dist/                      # Build output (gitignored)
├── docs/                      # Documentation
└── .taskmaster/               # Task Master project tracking
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout dev
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes & Write Tests

**IMPORTANT:** This project enforces **90% test coverage**.

Add tests in `tests/` directory mirroring your source files:
```bash
tests/
└── utils/
    ├── storage.test.ts
    ├── promptGenerator.test.ts
    └── queueProcessor.test.ts
```

Run tests during development:
```bash
pnpm test                  # Run all tests
pnpm run test:watch        # Auto-rerun on changes
pnpm run test:coverage     # Check coverage
```

### 3. Check Coverage Before Pushing

**Required:** Coverage must be >= 90% for all metrics.

```bash
pnpm run test:coverage
```

View detailed coverage report:
```bash
open coverage/lcov-report/index.html
```

Uncovered code is highlighted in red. Add tests until >= 90%.

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add feature X with comprehensive tests"
git push origin feature/your-feature-name
```

**What happens:**
1. Husky pre-push hook triggers
2. `pnpm run test:coverage` runs automatically
3. If coverage < 90%, push is blocked
4. If coverage >= 90%, push proceeds

---

## Test Coverage Enforcement

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

### Why 90%?

- High code quality and maintainability
- Early bug detection
- Documentation through tests
- Reduced regression risk
- Confidence during refactoring

### Coverage Requirements

All metrics must be >= 90%:
- **Statements**: 90%
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **Test & Coverage** (required, runs first)
   - Runs `pnpm run test:coverage`
   - Fails if coverage < 90%
   - Uploads coverage report as artifact

2. **Build Extension** (runs after test passes)
   - Runs `pnpm run build`
   - Verifies output files exist
   - Uploads build artifact

3. **Lint** (runs in parallel with build)
   - TypeScript type check
   - Prettier formatting check

All jobs must pass before PR can be merged.

---

## Common Tasks

### Adding Tests

**Example:** Testing a utility function

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

### Debugging Tests

```bash
# Run specific test file
pnpm test -- storage.test.ts

# Run tests matching pattern
pnpm test -- --testNamePattern="should save prompts"

# Run with verbose output
pnpm test -- --verbose

# Watch mode (recommended)
pnpm run test:watch
```

### Debugging Build Issues

```bash
# Clean build artifacts
pnpm run clean

# Check TypeScript errors
pnpm exec tsc --noEmit

# Rebuild
pnpm run build
```

---

## Troubleshooting

### Problem: Pre-push hook not running

**Solution:**
```bash
# Reinstall Husky
pnpm run prepare

# Make hook executable
chmod +x .husky/pre-push

# Test hook manually
.husky/pre-push
```

### Problem: Coverage below 90%

**Solution:**
```bash
# Generate coverage report
pnpm run test:coverage

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
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Run tests
pnpm run test:coverage
```

---

## Useful Commands Cheat Sheet

```bash
# Development
pnpm run dev                # Watch mode build
pnpm test                   # Run tests
pnpm run test:watch         # Watch mode tests
pnpm run test:coverage      # Generate coverage report

# Code Quality
pnpm run format             # Auto-fix formatting
pnpm run lint               # Check formatting

# Build
pnpm run build              # Production build
pnpm run clean              # Clean build artifacts

# Coverage
open coverage/lcov-report/index.html  # View coverage report

# Git
git push                    # Normal push (triggers pre-push hook)
git push --no-verify        # Bypass hook (NOT RECOMMENDED)
```

---

## Getting Help

- **Coverage issues?** Read this document's coverage section
- **Architecture questions?** See `docs/architecture/overview.md`
- **UI questions?** See `docs/ui/components.md`
- **CI/CD issues?** See `docs/setup/ci-cd.md`
- **Bug reports?** Open issue on GitHub
- **Feature requests?** Open issue on GitHub

---

## Important Links

- **Repository:** https://github.com/YosefHayim/extension-sora-auto-queue-prompts
- **Issues:** https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues
- **CI Workflow:** `.github/workflows/ci.yml`

---

**Last Updated:** 2025-11-18
**Minimum Node.js Version:** 20.x
**Package Manager:** pnpm (preferred)
**Coverage Requirement:** 90%
**Manifest Version:** 3
