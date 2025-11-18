# Quick Reference Card

**Sora Auto Queue Prompts - CI/CD & Coverage**

---

## Essential Commands

```bash
# Setup (run once)
npm install              # Installs deps + sets up Husky hooks

# Development
npm run dev             # Watch mode build
npm test                # Run tests (fast)
npm run test:watch      # Watch mode tests
npm run test:coverage   # Check coverage (must be >= 90%)

# Code Quality
npm run format          # Auto-fix formatting
npm run lint            # Check formatting

# Build
npm run build           # Production build
npm run clean           # Clean artifacts

# Coverage Report
open coverage/lcov-report/index.html
```

---

## Before You Push - Checklist

- [ ] Tests written for new code
- [ ] `npm run test:coverage` shows >= 90% for all metrics
- [ ] `npm run format` applied
- [ ] `npm run build` succeeds
- [ ] Manual testing in Chrome complete

---

## Coverage Requirement

**MUST BE >= 90% FOR ALL:**
- Statements
- Branches
- Functions
- Lines

**Check with:**
```bash
npm run test:coverage
```

**If below 90%:**
1. View report: `open coverage/lcov-report/index.html`
2. Find uncovered code (highlighted in red)
3. Write tests for uncovered code
4. Repeat until >= 90%

---

## Git Workflow

```bash
# 1. Create branch
git checkout dev
git pull origin main
git checkout -b feature/your-feature

# 2. Make changes + write tests

# 3. Check coverage
npm run test:coverage

# 4. Commit
git add .
git commit -m "Add feature X"

# 5. Push (triggers pre-push hook)
git push origin feature/your-feature
```

**Pre-push hook will:**
- Run `npm run test:coverage`
- Block push if coverage < 90%
- Allow push if coverage >= 90%

---

## GitHub Actions CI

**Triggers on:**
- Push to `main`
- Pull requests to `main`

**Jobs:**
1. Test & Coverage (fails if < 90%)
2. Build Extension (verifies output)
3. Lint (TypeScript + Prettier)

**All must pass before PR can be merged.**

---

## Bypassing Coverage Check (Emergency Only)

```bash
git push --no-verify
```

**WARNING:**
- CI will still enforce coverage
- PR will fail checks
- Cannot merge until fixed
- Only use in true emergencies

---

## Troubleshooting

### Pre-push hook not running
```bash
npm run prepare
chmod +x .husky/pre-push
```

### Coverage below 90%
```bash
npm run test:coverage
open coverage/lcov-report/index.html
# Add tests for uncovered code (red lines)
```

### Tests pass locally, fail on CI
```bash
nvm use 20
rm -rf node_modules package-lock.json
npm install
npm run test:coverage
```

### Build fails
```bash
npm run clean
npx tsc --noEmit
npm run build
```

---

## Key Files

- `.github/workflows/ci.yml` - CI pipeline
- `.husky/pre-push` - Pre-push hook
- `jest.config.js` - Coverage thresholds (90%)
- `COVERAGE_SETUP.md` - Detailed docs
- `DEVELOPER_SETUP.md` - Setup guide

---

## Coverage Report Interpretation

```bash
npm run test:coverage
```

**Example output:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   92.5  |   88.3   |   95.1  |   91.8  |
 src/utils/storage.ts     |   95.0  |   90.0   |   100   |   94.5  |
 src/utils/logger.ts      |   85.0  |   80.0   |   85.7  |   84.2  | ⚠️
--------------------------|---------|----------|---------|---------|
```

⚠️ **logger.ts has coverage < 90% - needs more tests**

**View details:**
```bash
open coverage/lcov-report/src/utils/logger.ts.html
```

---

## Common Test Patterns

### Testing async functions
```typescript
it('should save data', async () => {
  const data = { key: 'value' };
  await saveData(data);
  expect(chrome.storage.local.set).toHaveBeenCalledWith(data);
});
```

### Testing error handling
```typescript
it('should handle errors', async () => {
  chrome.storage.local.set.mockRejectedValue(new Error('Failed'));
  await expect(saveData({})).rejects.toThrow('Failed');
});
```

### Testing React components
```typescript
it('should render button', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

---

## Documentation

**Full guides:**
- `COVERAGE_SETUP.md` - Coverage enforcement details
- `DEVELOPER_SETUP.md` - Developer onboarding
- `CI_CD_SETUP_SUMMARY.md` - CI/CD overview

**Help:**
- GitHub Issues: Report bugs or request features
- Project Context: `.claude/CLAUDE.md`

---

**Last Updated:** 2025-11-18
**Coverage Required:** 90%
**Node.js Version:** 20.x
