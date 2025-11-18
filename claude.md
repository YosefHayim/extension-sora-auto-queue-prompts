# Claude Code - Project Context

## Project Overview

**Sora Auto Queue Prompts** is a Chrome extension that automates prompt generation and queue management for Sora AI video/image generation. It eliminates manual work by enabling AI-powered batch prompt generation, intelligent queue processing, and automated submission to Sora with anti-bot protection.

### Key Technologies
- **TypeScript 5.3** - Type-safe development
- **React 18** - Modern UI framework
- **esbuild** - Fast, optimized builds
- **Chrome Extension Manifest V3** - Modern extension architecture
- **OpenAI GPT-4 API** - AI-powered prompt generation
- **Jest + React Testing Library** - Comprehensive testing

### Architecture
```
┌─────────────────┐
│  Popup UI       │  ← User interacts here (React)
│  (popup.tsx)    │
└────────┬────────┘
         │
         ↓ Messages
┌─────────────────┐
│  Background     │  ← Coordinates everything
│  (background.ts)│
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    ↓         ↓          ↓             ↓
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│ OpenAI │ │Sora  │ │ Storage │ │  Logger  │
│  API   │ │Page  │ │ (Local) │ │ (Debug)  │
└────────┘ └──────┘ └─────────┘ └──────────┘
```

## Available Specialized Agents

This project has several specialized agents configured to help with specific tasks. Use them proactively when working on related features.

### 1. chrome-extension-ux-architect
**Purpose**: Design complete user experience and interface structure for Chrome extensions

**When to use**:
- Designing new features or workflows
- Restructuring confusing UI
- Planning automation features
- Analyzing user pain points and friction
- Creating user journey maps

**Location**: `.claude/agents/chrome-extension-ux-architect.md`

**Example usage**:
```
User: "I want to add a feature to save favorite prompts"
→ Use chrome-extension-ux-architect to design the UX flow
```

### 2. browser-extension-architect
**Purpose**: Senior-level technical implementation, refactoring, and optimization of browser extensions

**When to use**:
- Implementing new features
- Refactoring existing code
- Reviewing content scripts, background scripts, messaging
- Upgrading Manifest V2 to V3
- Debugging extension-specific issues
- Security reviews and performance optimization
- Cross-browser compatibility

**Location**: `.claude/agents/browser-extension-architect.md`

**Example usage**:
```
User: "Review the content script for performance issues"
→ Use browser-extension-architect for expert analysis
```

### 3. vp-rnd-project-reviewer
**Purpose**: Comprehensive VP-level technical and product review

**When to use**:
- Before major releases
- After completing significant features
- Assessing technical debt
- Identifying security vulnerabilities
- Analyzing user journey alignment
- Finding UX/UI bloat and simplification opportunities

**Location**: `.claude/agents/vp-rnd-project-reviewer.md`

**Example usage**:
```
User: "We're about to release v2.0"
→ Use vp-rnd-project-reviewer for comprehensive pre-release review
```

### 4. github-actions-devops
**Purpose**: Create, modify, optimize, and troubleshoot GitHub Actions workflows

**When to use**:
- Setting up CI/CD pipelines
- Debugging failing workflows
- Optimizing slow pipelines
- Security hardening workflows
- Creating reusable workflows

**Location**: `.claude/agents/github-actions-devops.md`

**Example usage**:
```
User: "Set up CI workflow for testing and building the extension"
→ Use github-actions-devops to create optimized workflows
```

### 5. git-commit-versioner
**Purpose**: Create professional commit messages and determine semantic version bumps

**When to use**:
- After completing features/fixes
- Preparing pull requests
- Determining version numbers
- Creating changelog entries

**Location**: `.claude/agents/git-commit-versioner.md`

**Example usage**:
```
User: "I've added CSV export. What's the commit message?"
→ Use git-commit-versioner for professional commit guidance
```

### 6. testing-specialist
**Purpose**: Write, review, and improve tests for comprehensive quality assurance

**When to use**:
- Writing unit tests for new features
- Reviewing test coverage and identifying gaps
- Debugging failing or flaky tests
- Setting up testing infrastructure
- Creating test strategies for complex features
- Mocking external dependencies (APIs, Chrome APIs)

**Location**: `.claude/agents/testing-specialist.md`

**Example usage**:
```
User: "I've implemented the queue processor. Can you write tests for it?"
→ Use testing-specialist for comprehensive test coverage
```

## Project Structure

```
src/
├── popup.tsx              # Main UI (React) - queue management, settings
├── background.ts          # Service worker - orchestration, message handling
├── content.ts             # Sora page automation - prompt submission
├── types/
│   └── index.ts          # TypeScript definitions
└── utils/
    ├── storage.ts         # Chrome storage abstraction
    ├── promptGenerator.ts # OpenAI API integration
    ├── csvParser.ts       # CSV import/export
    ├── queueProcessor.ts  # Queue automation logic
    ├── promptActions.ts   # Prompt editing operations
    └── logger.ts          # Debug logging system

assets/
├── manifest.json         # Extension manifest (Manifest V3)
├── popup.html           # Popup HTML template
└── popup.css            # Popup styles

tests/
└── utils/               # Jest unit tests

.claude/
├── agents/              # Specialized agents
└── claude.md            # This file
```

## Common Development Tasks

### Adding New Features
1. **Design Phase**: Use `chrome-extension-ux-architect` to design UX
2. **Implementation**: Use `browser-extension-architect` for technical guidance
3. **Testing**: Use `testing-specialist` to write comprehensive tests
4. **Review**: Use `vp-rnd-project-reviewer` before release
5. **Commit**: Use `git-commit-versioner` for commit messages

### Bug Fixes
1. Reproduce and document the issue
2. Use `browser-extension-architect` for fix implementation
3. Use `testing-specialist` to add tests preventing regression
4. Use `git-commit-versioner` for commit message

### Improving Test Coverage
1. Use `testing-specialist` to analyze coverage gaps
2. Implement prioritized tests for critical paths
3. Review test quality and maintainability

### CI/CD Setup
1. Use `github-actions-devops` to create workflows
2. Set up build, test, and lint pipelines
3. Configure deployment automation

## Key Extension Components

### Background Script (`background.ts`)
- Message handler for popup ↔ background communication
- Coordinates prompt generation via OpenAI API
- Manages queue state and processing
- Handles prompt actions (edit, duplicate, refine, delete)

### Content Script (`content.ts`)
- Injected into `sora.com` pages
- Automates prompt submission
- Simulates human typing (anti-bot)
- Waits for generation completion
- Monitors page state

### Popup UI (`popup.tsx`)
- React-based interface
- Tabs: Generate, Manual, CSV, Queue, Settings, Debug
- Real-time queue status
- Prompt editing and management
- Configuration and logging

### Storage (`utils/storage.ts`)
- Abstracts Chrome Storage API
- Manages prompts, config, queue state, history
- Type-safe operations

### Prompt Generator (`utils/promptGenerator.ts`)
- OpenAI GPT-4 integration
- Batch prompt generation
- Enhanced mode (technical cinematography details)
- Prompt refinement

### Queue Processor (`utils/queueProcessor.ts`)
- Automated queue processing
- Anti-bot delays (random 2-60s)
- Auto-generate on empty
- Pause/resume/stop functionality

## Testing Strategy

### Unit Tests
- Jest + React Testing Library
- Focus on utils and business logic
- Target: 70%+ coverage

### Manual Testing Checklist
- [ ] Generate prompts with OpenAI
- [ ] Manual prompt entry
- [ ] CSV import/export
- [ ] Queue start/pause/resume/stop
- [ ] Prompt editing (edit, duplicate, refine, delete)
- [ ] Settings persistence
- [ ] Anti-bot delays working
- [ ] Content script on sora.com

## Security Considerations

### Current Measures
- API keys stored in Chrome local storage (encrypted at rest)
- No external servers (client-side only)
- No telemetry or tracking
- Open source for auditability

### Areas to Monitor
- Content script injection safety
- API key exposure in logs
- CSRF protection for API calls
- Input validation for user prompts
- Rate limiting on OpenAI API

## Performance Targets

- Build time: < 3 seconds (dev), < 5 seconds (prod)
- Popup load: < 200ms
- Queue processing: 2-60s delay per prompt (configurable)
- Large queues: Handle 1000+ prompts without lag

## Future Enhancements (Roadmap)

- [ ] Chrome Web Store publication
- [ ] Multi-provider AI (Claude, local LLMs)
- [ ] Prompt templates library
- [ ] Advanced queue scheduling
- [ ] Direct Sora API integration
- [ ] Prompt analytics dashboard
- [ ] Team collaboration
- [ ] Multi-language support

## API Integration

### OpenAI API
- **Endpoint**: Chat Completions API (GPT-4)
- **Purpose**: Prompt generation and enhancement
- **Cost**: ~$0.02-$0.05 per 50 prompts
- **Rate limits**: Managed by user's API key tier

### Future APIs
- Anthropic Claude (planned)
- Local LLMs (planned)
- Sora official API (when available)

## Extension Permissions

```json
{
  "permissions": [
    "activeTab",      // Access current tab
    "storage",        // Local data storage
    "scripting",      // Content script injection
    "tabs"            // Tab management
  ],
  "host_permissions": [
    "https://*/*"     // API calls (OpenAI, etc.)
  ]
}
```

## Build Process

### Commands
```bash
npm run dev          # Watch mode (development)
npm run build        # Production build
npm test             # Run tests
npm run test:watch   # Watch mode tests
npm run test:coverage # Coverage report
npm run clean        # Clean dist and zips
```

### Build Output
```
dist/
├── background.js    # Service worker bundle
├── popup.js         # Popup UI bundle
├── content.js       # Content script bundle
├── popup.html       # Popup HTML
├── popup.css        # Popup styles
├── manifest.json    # Extension manifest
└── icons/           # Extension icons
```

## Getting Help

### For UX/Design Questions
→ Use `chrome-extension-ux-architect`

### For Technical Implementation
→ Use `browser-extension-architect`

### For Pre-Release Reviews
→ Use `vp-rnd-project-reviewer`

### For CI/CD and Workflows
→ Use `github-actions-devops`

### For Commits and Versioning
→ Use `git-commit-versioner`

### For Testing and Quality Assurance
→ Use `testing-specialist`

---

# When finish todos by user request:
Preform a commit and push to the dev repo with a detailed proper commit using the commit agent.

**Last Updated**: 2025-11-18
**Extension Version**: 1.0.0
**Manifest Version**: 3
