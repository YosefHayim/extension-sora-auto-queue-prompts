# Next Steps - CI/CD Setup Complete

The CI/CD infrastructure with 90% test coverage enforcement has been successfully set up. Here's what you need to do next.

---

## Immediate Actions Required

### 1. Install Husky

Husky is listed in `package.json` but needs to be installed:

```bash
npm install
```

This will:
- Install Husky and all dependencies
- Automatically run the `prepare` script
- Set up Git hooks including the pre-push hook

**Verify installation:**
```bash
ls -la .husky/
# Should show pre-push as executable (-rwxr-xr-x)

node_modules/.bin/husky --version
# Should show version 9.x.x
```

---

### 2. Verify Current Test Coverage

Before enforcing 90%, you need to know your current coverage:

```bash
npm run test:coverage
```

**Example output:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   XX.X  |   XX.X   |   XX.X  |   XX.X  |
--------------------------|---------|----------|---------|---------|
```

**If coverage is already >= 90%:**
- Great! You can push immediately
- The pre-push hook and CI will pass

**If coverage is < 90%:**
- You MUST add tests before pushing
- See "Increasing Coverage" section below

---

### 3. Review Uncovered Code

View detailed coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

This shows:
- Per-file coverage percentages
- Line-by-line coverage (red = uncovered)
- Branch coverage details

**Focus on:**
- Critical business logic (queue processor, prompt generator)
- Public APIs and exported functions
- Error handling paths

---

### 4. Add Tests to Reach 90%

**Priority order:**
1. Core utilities (`src/utils/`)
2. Background script (`src/background.ts`)
3. Content script (`src/content.ts`)
4. Popup UI (`src/popup.tsx`)

**Example: Testing storage utility**

**File:** `tests/utils/storage.test.ts`
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { savePrompts, getPrompts } from '~/src/utils/storage';

describe('storage utils', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('savePrompts', () => {
    it('should save prompts to chrome storage', async () => {
      const prompts = [
        { id: '1', text: 'Test prompt 1' },
        { id: '2', text: 'Test prompt 2' },
      ];

      await savePrompts(prompts);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ prompts });
    });

    it('should handle save errors', async () => {
      chrome.storage.local.set.mockRejectedValue(new Error('Storage full'));

      await expect(savePrompts([])).rejects.toThrow('Storage full');
    });
  });

  describe('getPrompts', () => {
    it('should retrieve prompts from chrome storage', async () => {
      const mockPrompts = [{ id: '1', text: 'Test' }];
      chrome.storage.local.get.mockResolvedValue({ prompts: mockPrompts });

      const result = await getPrompts();

      expect(result).toEqual(mockPrompts);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('prompts');
    });

    it('should return empty array when no prompts exist', async () => {
      chrome.storage.local.get.mockResolvedValue({});

      const result = await getPrompts();

      expect(result).toEqual([]);
    });
  });
});
```

**Run tests after adding:**
```bash
npm run test:coverage
```

Repeat until all metrics >= 90%.

---

### 5. Test the Pre-Push Hook

Once coverage is >= 90%, test that the hook works:

```bash
# Make a small change
echo "// Test" >> src/utils/logger.ts

# Commit
git add .
git commit -m "Test pre-push hook"

# Try pushing
git push origin your-branch
```

**Expected behavior:**
1. Pre-push hook triggers
2. Runs `npm run test:coverage`
3. If coverage >= 90%: Push succeeds
4. If coverage < 90%: Push blocked with error message

**If blocked:**
```
PUSH BLOCKED: Test coverage is below 90% threshold
Please add tests to increase coverage before pushing
```

Add more tests and try again.

---

### 6. Verify GitHub Actions CI

After successfully pushing:

1. Go to: https://github.com/YosefHayim/extension-sora-auto-queue-prompts/actions

2. Find your workflow run

3. Verify all jobs pass:
   - Test & Coverage
   - Build Extension
   - Lint

**If CI fails:**
- Check logs in GitHub Actions UI
- Reproduce locally with Node 20: `nvm use 20 && npm run test:coverage`
- Fix issues and push again

---

## Temporary: Lowering Coverage for Initial Setup

If you need to push immediately but can't reach 90% coverage yet, you have two options:

### Option A: Temporarily Lower Threshold (Recommended)

Edit `jest.config.js` temporarily:

```javascript
coverageThreshold: {
  global: {
    branches: 70,    // Temporarily lower from 90
    functions: 70,   // Temporarily lower from 90
    lines: 70,       // Temporarily lower from 90
    statements: 70,  // Temporarily lower from 90
  },
}
```

Then incrementally increase:
- Week 1: 70%
- Week 2: 75%
- Week 3: 80%
- Week 4: 85%
- Week 5: 90%

**Create a tracking issue on GitHub:**
```
Title: Increase test coverage to 90%

[ ] Week 1: Reach 70% (DONE)
[ ] Week 2: Reach 75%
[ ] Week 3: Reach 80%
[ ] Week 4: Reach 85%
[ ] Week 5: Reach 90%
```

### Option B: Bypass Pre-Push Hook (Not Recommended)

Only for emergencies:

```bash
git push --no-verify
```

**WARNING:** CI will still enforce the threshold and fail.

---

## Long-Term: Maintaining 90% Coverage

### For New Features

1. **Before coding:** Write test cases (TDD approach)
2. **During coding:** Run `npm run test:watch` in a terminal
3. **After coding:** Run `npm run test:coverage` to verify
4. **Before pushing:** Ensure coverage >= 90%

### For Bug Fixes

1. **Write failing test** reproducing the bug
2. **Fix the bug** until test passes
3. **Run coverage** to ensure no regression
4. **Push** with confidence

### Code Review Checklist

When reviewing PRs, check:
- [ ] All new code has tests
- [ ] Coverage report shows >= 90%
- [ ] Tests are meaningful (not just hitting lines)
- [ ] Edge cases are tested
- [ ] Error paths are tested

---

## Documentation Reference

Your setup includes comprehensive documentation:

### Quick Reference
**File:** `.github/QUICK_REFERENCE.md`
- Essential commands
- Common workflows
- Troubleshooting quick fixes

### Developer Setup
**File:** `DEVELOPER_SETUP.md`
- Complete onboarding guide
- Development workflow
- Troubleshooting section

### Coverage Details
**File:** `COVERAGE_SETUP.md`
- How coverage enforcement works
- Local vs remote enforcement
- Best practices

### CI/CD Overview
**File:** `CI_CD_SETUP_SUMMARY.md`
- Complete system architecture
- Workflow details
- Security considerations

---

## Setup Verification

Run the verification script anytime:

```bash
./verify-setup.sh
```

This checks:
- Node.js version (>= 20.x)
- Required files exist
- Executable permissions
- Husky installation
- Jest configuration
- npm scripts

---

## Getting Help

### Coverage Issues
1. Read: `COVERAGE_SETUP.md`
2. View report: `open coverage/lcov-report/index.html`
3. Ask team for help identifying critical paths to test

### CI/CD Issues
1. Read: `CI_CD_SETUP_SUMMARY.md`
2. Check GitHub Actions logs
3. Reproduce locally with same Node version

### General Questions
1. Read: `DEVELOPER_SETUP.md`
2. Check: `.github/QUICK_REFERENCE.md`
3. Open GitHub issue with "question" label

---

## Success Criteria

You'll know the setup is working when:

1. **Local enforcement works:**
   - `git push` triggers pre-push hook
   - Hook runs `npm run test:coverage`
   - Push blocked if coverage < 90%

2. **CI enforcement works:**
   - Every push/PR triggers GitHub Actions
   - Test job fails if coverage < 90%
   - Build job runs only after test passes

3. **Team workflow smooth:**
   - Developers run `npm run test:coverage` before pushing
   - Pre-push hook catches issues early
   - CI provides final validation

---

## Checklist: Setup Complete

- [ ] Husky installed (`npm install`)
- [ ] Pre-push hook verified (`.husky/pre-push` is executable)
- [ ] Current coverage measured (`npm run test:coverage`)
- [ ] Coverage >= 90% OR plan created to reach 90%
- [ ] Pre-push hook tested (tried pushing code)
- [ ] GitHub Actions CI verified (checked workflow run)
- [ ] Team notified about new requirements
- [ ] Documentation reviewed

---

## Timeline Recommendation

**If coverage is already high (> 80%):**
- Day 1: Install Husky, add missing tests
- Day 2: Verify setup, test workflow
- Day 3: Team onboarding

**If coverage is low (< 70%):**
- Week 1: Install Husky, start at 70% threshold
- Week 2-5: Incrementally increase to 90%
- Week 6: Team fully onboarded on 90% requirement

---

## Sample Team Announcement

```markdown
Team Update: Test Coverage Enforcement

Starting [DATE], we're enforcing 90% test coverage on all pushes:

**What this means:**
- Your `git push` will automatically run tests with coverage
- If coverage < 90%, push is blocked
- GitHub Actions CI also enforces this (cannot bypass)

**How to prepare:**
1. Run: `npm install` (sets up pre-push hook)
2. Run: `npm run test:coverage` (check current coverage)
3. Add tests if needed to reach 90%

**Documentation:**
- Quick start: `DEVELOPER_SETUP.md`
- Coverage guide: `COVERAGE_SETUP.md`
- Command reference: `.github/QUICK_REFERENCE.md`

**Questions?**
Reply here or check the docs above.
```

---

**Last Updated:** 2025-11-18
**Status:** Setup complete, ready for testing
**Next Deadline:** [Set based on your timeline]
