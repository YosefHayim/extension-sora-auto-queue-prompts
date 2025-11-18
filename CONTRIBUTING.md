# Contributing to Sora Auto Queue Prompts

First off, thank you for considering contributing to Sora Auto Queue Prompts! It's people like you that make this extension a great tool for the Sora AI community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Workflow](#development-workflow)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate in communication
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discriminatory jokes, or personal attacks
- Trolling, insulting comments, or off-topic discussions
- Publishing others' private information without permission
- Any conduct inappropriate for a professional setting

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before submitting a bug report:

1. **Check existing issues** to avoid duplicates
2. **Use the latest version** of the extension
3. **Test in a clean environment** (disable other extensions)

When submitting a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs **actual behavior**
- **Screenshots or videos** if applicable
- **Environment details** (Chrome version, OS)
- **Extension logs** from the Debug tab (export and attach)

**Example:**
```markdown
### Bug: Queue fails to process prompts after pause/resume

**Steps to reproduce:**
1. Add 10 prompts to queue
2. Click "Start Queue"
3. Wait for 2 prompts to process
4. Click "Pause"
5. Click "Resume"

**Expected:** Queue continues processing from prompt #3
**Actual:** Queue stops completely, no prompts process

**Environment:**
- Chrome 120.0.6099.109
- macOS 14.1
- Extension v1.0.0

**Logs:** (attached debug-logs.txt)
```

### 💡 Suggesting Features

We love feature suggestions! Before submitting:

1. **Check existing feature requests** to avoid duplicates
2. **Consider if it aligns** with the project's scope
3. **Think about edge cases** and potential issues

When suggesting a feature, include:

- **Clear use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: What other approaches did you think about?
- **Mockups or examples**: Visual aids if applicable

**Example:**
```markdown
### Feature: Prompt Templates Library

**Use Case:**
Users repeatedly create similar types of prompts (e.g., "cinematic landscape shots").
Having templates would save time and ensure consistency.

**Proposed Solution:**
- Add "Templates" tab to popup
- Users can save current prompts as template
- Templates include all metadata (aspect ratio, variations, etc.)
- Click template to auto-fill prompt generation

**Alternatives:**
- CSV import/export (already exists but requires file management)
- Auto-complete suggestions (less flexible than full templates)

**Mockups:** (attach screenshot)
```

### 🔧 Contributing Code

We welcome pull requests for:

- **Bug fixes**
- **New features** (discuss in an issue first)
- **Performance improvements**
- **Documentation updates**
- **Test coverage improvements**

---

## Development Setup

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **pnpm**
- **Git**
- **Chrome** or Chromium-based browser

### Initial Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/extension-sora-auto-queue-prompts.git
cd extension-sora-auto-queue-prompts

# 3. Add upstream remote
git remote add upstream https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git

# 4. Install dependencies
npm install

# 5. Build the extension
npm run build

# 6. Load extension in Chrome
# - Navigate to chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the `dist` folder
```

### Development Commands

```bash
# Development mode (watch mode with auto-rebuild)
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run tests in watch mode (great for TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Clean build artifacts
npm run clean
```

---

## Project Structure

Understanding the codebase structure will help you navigate and contribute effectively:

```
extension-sora-auto-queue-prompts/
├── src/                          # Source code
│   ├── popup.tsx                 # React UI (6 tabs: Generate, Manual, CSV, Queue, Settings, Debug)
│   ├── popup.css                 # Popup styles
│   ├── background.ts             # Service worker (message handling, coordination)
│   ├── content.ts                # Content script (Sora page interaction)
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions (centralized)
│   └── utils/
│       ├── storage.ts            # Chrome storage abstraction layer
│       ├── promptGenerator.ts    # OpenAI API integration
│       ├── csvParser.ts          # CSV import/export logic
│       ├── queueProcessor.ts     # Queue orchestration (singleton)
│       ├── promptActions.ts      # Prompt editing operations
│       └── logger.ts             # Debug logging system
│
├── tests/                        # Test files (mirror src/ structure)
│   ├── setup.ts                  # Jest configuration
│   └── utils/                    # Unit tests for utilities
│
├── assets/                       # Static assets
│   ├── popup.html                # Popup HTML template
│   └── popup.css                 # Popup styles
│
├── icons/                        # Extension icons (16x16, 48x48, 128x128)
├── manifest.json                 # Chrome extension manifest
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest test configuration
├── README.md                     # User documentation
├── CONTRIBUTING.md               # This file
├── CLAUDE.md                     # AI assistant context
└── LICENSE                       # MIT License
```

### Key Architecture Concepts

#### Three-Layer Architecture

1. **Popup Layer** (`src/popup.tsx`)
   - React-based UI
   - Manages user interactions
   - Polls for updates every 2 seconds
   - Communicates via message passing

2. **Background Worker** (`src/background.ts`)
   - Chrome service worker
   - Routes messages to handlers
   - Coordinates async operations
   - Centralizes error handling

3. **Content Script** (`src/content.ts`)
   - Injected into `sora.com`
   - DOM manipulation
   - Simulates human typing
   - Monitors completion state

#### Data Flow Example

```
User clicks "Generate Prompts" (popup.tsx)
    ↓
Message sent to background worker
    ↓
background.ts routes to handleGeneratePrompts()
    ↓
PromptGenerator.generatePrompts() calls OpenAI API
    ↓
Prompts stored in Chrome storage (storage.ts)
    ↓
Background sends success response
    ↓
Popup refreshes UI with new prompts
```

---

## Coding Standards

### TypeScript

- **Strict mode enabled**: All code must pass strict TypeScript checks
- **Explicit types**: Always define parameter and return types
- **No `any`**: Use proper types or `unknown` if necessary
- **Interface over type**: Prefer `interface` for object shapes

**Good:**
```typescript
interface GenerateRequest {
  context: string;
  count: number;
  mediaType: 'video' | 'image';
}

async function generatePrompts(request: GenerateRequest): Promise<GenerationResult> {
  // Implementation
}
```

**Bad:**
```typescript
function generatePrompts(request: any): any {
  // Implementation
}
```

### Naming Conventions

- **PascalCase**: React components, classes, interfaces, types
  ```typescript
  interface PromptConfig { }
  class QueueProcessor { }
  function IndexPopup() { }
  ```

- **camelCase**: Variables, functions, methods
  ```typescript
  const apiKey = 'sk-...';
  function handleGeneratePrompts() { }
  ```

- **SCREAMING_SNAKE_CASE**: Constants
  ```typescript
  const MAX_PROMPTS = 1000;
  const DEFAULT_BATCH_SIZE = 50;
  ```

### React Best Practices

- **Functional components only**: No class components
- **Hooks for state**: Use `useState`, `useEffect`, etc.
- **Small, focused components**: Each component should do one thing well
- **Prop types**: Define interfaces for component props

**Example:**
```typescript
interface PromptCardProps {
  prompt: GeneratedPrompt;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  return (
    <div className="prompt-card">
      <p>{prompt.text}</p>
      <button onClick={() => onEdit(prompt.id)}>Edit</button>
      <button onClick={() => onDelete(prompt.id)}>Delete</button>
    </div>
  );
}
```

### Code Organization

- **One component per file** (except small, related components)
- **Group imports**: React, third-party, local utilities, types
- **Keep files under 300 lines** (split if longer)

**Import order:**
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party
import SomeLibrary from 'some-library';

// 3. Local utilities
import { storage } from './utils/storage';
import { logger } from './utils/logger';

// 4. Types
import type { PromptConfig, GeneratedPrompt } from './types';
```

### Comments and Documentation

- **TSDoc for public functions**: Document parameters, returns, and purpose
- **Inline comments for complex logic**: Explain "why", not "what"
- **No obvious comments**: Code should be self-documenting

**Good:**
```typescript
/**
 * Generates prompts using OpenAI API with optional enhancement
 * @param request - Generation parameters (context, count, mediaType)
 * @returns Promise resolving to generation result with prompts or error
 */
async function generatePrompts(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
  // Use enhanced system prompt if enabled
  const systemPrompt = request.useSecretPrompt
    ? buildEnhancedSystemPrompt(request.mediaType)
    : DEFAULT_SYSTEM_PROMPT;

  // Implementation...
}
```

**Bad:**
```typescript
// This function generates prompts
function generatePrompts(request) {
  // Call API
  const result = callAPI();
  // Return result
  return result;
}
```

---

## Testing Guidelines

### Test Framework

- **Jest** with `ts-jest` preset
- **jsdom** environment for DOM testing
- **React Testing Library** for component tests
- **Chrome API mocks** in `tests/setup.ts`

### Coverage Requirements

Maintain **70%+ coverage** for:
- Branches
- Functions
- Lines
- Statements

### Writing Tests

#### Utility Tests

```typescript
// tests/utils/storage.test.ts
import { storage } from '../../src/utils/storage';

describe('storage.ts', () => {
  beforeEach(() => {
    // Clear mocks
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  it('should save config to storage', async () => {
    const config = { apiKey: 'sk-test', batchSize: 50 };

    await storage.setConfig(config);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      config: expect.objectContaining(config)
    });
  });
});
```

#### Component Tests

```typescript
// tests/components/PromptCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptCard } from '../../src/components/PromptCard';

describe('PromptCard', () => {
  const mockPrompt = {
    id: '123',
    text: 'Test prompt',
    status: 'pending' as const,
    mediaType: 'video' as const,
    timestamp: Date.now()
  };

  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();

    render(<PromptCard prompt={mockPrompt} onEdit={onEdit} onDelete={jest.fn()} />);

    fireEvent.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith('123');
  });
});
```

### Test Best Practices

- **Test behavior, not implementation**: Focus on user-visible outcomes
- **Use descriptive test names**: Clearly state what's being tested
- **Arrange-Act-Assert pattern**: Organize tests consistently
- **Mock external dependencies**: API calls, Chrome APIs, timers
- **Test edge cases**: Empty arrays, null values, errors

---

## Commit Guidelines

### Commit Message Format

Use clear, concise commit messages in imperative mood:

```
<type>: <subject>

<optional body>

<optional footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature change)
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Examples

**Good:**
```
feat: Add CSV export with full metadata columns

Implements 5-column CSV export including prompt, type, aspect_ratio,
variations, and preset. Users can now back up their complete prompt
configuration for later import.

Closes #42
```

```
fix: Queue processor skips prompts after pause/resume

The queue processor was not properly resuming from the last processed
prompt index. Fixed by storing currentPromptId in queue state.

Fixes #38
```

```
docs: Update README with CSV format examples

Added detailed CSV format section with column definitions and example
rows. Clarifies which columns are required vs optional.
```

**Bad:**
```
Updated stuff
```

```
Fixed bug
```

```
WIP
```

### Commit Scope

- **Keep commits focused**: One logical change per commit
- **Commit related changes together**: Code + tests + docs in same commit
- **Don't mix unrelated changes**: Separate bug fixes from features

---

## Pull Request Process

### Before Submitting

- [ ] **Run tests**: `npm test` passes
- [ ] **Build succeeds**: `npm run build` completes without errors
- [ ] **Test in browser**: Load extension and verify changes work
- [ ] **Update docs**: README, CLAUDE.md, or inline docs if needed
- [ ] **Check coverage**: `npm run test:coverage` meets 70% threshold
- [ ] **Review own code**: Read through your changes once more

### PR Title and Description

**Title format:**
```
<type>: <brief description>
```

**Description should include:**
- **What**: Summary of changes
- **Why**: Motivation and context
- **How**: Brief technical approach
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes
- **Breaking changes**: If any
- **Related issues**: Fixes #X, Closes #Y

**Example:**
```markdown
## Summary
Adds CSV export functionality with full 5-column metadata support.

## Motivation
Users requested ability to back up prompts with all configuration details
(aspect ratio, variations, presets) for later import or sharing with team.

## Changes
- Added `CSVParser.exportWithMetadata()` method
- Updated CSV format to include 5 columns
- Added "Export" button in CSV tab
- Added unit tests for export functionality

## Testing
- [x] Unit tests pass (100% coverage for csvParser.ts)
- [x] Manual testing: Exported 50 prompts, re-imported successfully
- [x] Edge cases: Empty queue, special characters in prompts

## Screenshots
![CSV Export Button](https://...)
![Exported CSV Example](https://...)

## Breaking Changes
None - export is backward compatible with existing CSV format.

Closes #42
```

### Review Process

1. **Automated checks run**: Tests, build, linting
2. **Maintainer review**: Code review and feedback
3. **Address feedback**: Make requested changes
4. **Approval and merge**: Maintainer merges PR

### After Merge

- **Delete your branch** (keep repo clean)
- **Pull latest main**: `git pull upstream main`
- **Celebrate!** 🎉 You've contributed!

---

## Development Workflow

### Standard Workflow

```bash
# 1. Sync with upstream
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feat/my-awesome-feature

# 3. Make changes
# ... code, code, code ...

# 4. Test frequently
npm run test:watch  # Run in separate terminal

# 5. Commit incrementally
git add src/utils/myFeature.ts tests/utils/myFeature.test.ts
git commit -m "feat: Add awesome feature core logic"

# 6. Build and test extension
npm run build
# Load in Chrome and test manually

# 7. Final checks before pushing
npm test                # All tests pass
npm run test:coverage   # Coverage meets threshold
npm run build           # Build succeeds

# 8. Push to your fork
git push origin feat/my-awesome-feature

# 9. Open PR on GitHub
# Navigate to your fork and click "New Pull Request"
```

### Working on Multiple Features

```bash
# Create separate branches for each feature
git checkout -b feat/csv-export
# Work on CSV export...
git commit -m "feat: Add CSV export"

git checkout main
git checkout -b fix/queue-bug
# Work on bug fix...
git commit -m "fix: Queue processor pause/resume"

# Submit separate PRs for each branch
```

### Staying in Sync

```bash
# Regularly sync with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Rebase feature branch if needed
git checkout feat/my-feature
git rebase main
```

---

## Additional Resources

### Documentation

- **[README.md](README.md)**: User-facing documentation
- **[CLAUDE.md](CLAUDE.md)**: AI assistant context and architecture
- **[logs/README.md](logs/README.md)**: Logging system documentation

### External Resources

- **[Chrome Extensions API](https://developer.chrome.com/docs/extensions/)**: Extension development
- **[React Documentation](https://react.dev/)**: UI development
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: Language features
- **[Jest Documentation](https://jestjs.io/)**: Testing framework
- **[OpenAI API Reference](https://platform.openai.com/docs/)**: AI integration

---

## Questions or Need Help?

- **Discord/Slack**: (if available)
- **GitHub Discussions**: Ask questions in Discussions tab
- **GitHub Issues**: Report bugs or suggest features
- **Email**: (if provided)

---

## Recognition

Contributors are recognized in the following ways:

- Listed in **CONTRIBUTORS.md** (if maintained)
- Mentioned in **release notes** for significant contributions
- GitHub's automatic contributor tracking

---

## Thank You!

Every contribution, whether it's code, documentation, bug reports, or feature suggestions, helps make Sora Auto Queue Prompts better for everyone. We appreciate your time and effort!

**Happy coding!** 🚀
