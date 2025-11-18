# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that automates prompt generation and queue management for Sora AI video/image generation. Built with React 18 + TypeScript 5, featuring AI-powered prompt generation via OpenAI GPT-4, automated submission to sora.com with anti-bot protection, and comprehensive queue management.

**Current Version:** 1.0.1
**Test Coverage:** 93.82%
**Package Manager:** pnpm (migrated from npm in v1.0.1)

## Common Commands

### Development
```bash
pnpm install              # Install dependencies
pnpm run dev              # Watch mode build (development)
pnpm run build            # Production build
pnpm run clean            # Clean dist folder
```

### Testing
```bash
pnpm test                 # Run tests once
pnpm run test:watch       # Watch mode tests
pnpm run test:coverage    # Coverage report (90% threshold enforced)
```

### Code Quality
```bash
pnpm run lint             # Check TypeScript + Prettier formatting
pnpm run format           # Auto-format code with Prettier
pnpm exec tsc --noEmit    # Type check without emitting files
```

### Loading Extension in Chrome
1. Build: `pnpm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `dist/` folder

## Architecture

### Three-Component System

**Popup UI (popup.tsx)** - 804-line monolithic React component
- Single root component with six tabs: Generate, Manual, CSV, Queue, Settings, Debug
- Polls Chrome storage every 2 seconds for real-time updates
- All state managed via React hooks (useState)

**Background Service Worker (background.ts)**
- Central orchestration hub for all operations
- Handles 10+ message types from popup
- Manages OpenAI API integration
- Controls queue processor lifecycle
- Coordinates with content script

**Content Script (content.ts)**
- Injected into sora.com pages only
- Simulates human typing with 30-80ms delays between characters
- Monitors generation status via DOM selectors
- Two-phase completion detection: wait for start, then wait for completion

### Communication Flow
```
Popup (React UI)
    ↓ chrome.runtime.sendMessage()
Background Service Worker
    ↓ chrome.tabs.sendMessage()
Content Script (on sora.com)
    ↓ DOM interaction
Sora Website
```

All communication uses async/await with Chrome's message passing API.

## Source Code Organization

```
src/
├── popup.tsx              # Main UI (804 lines, monolithic)
├── background.ts          # Service worker coordinator
├── content.ts             # Sora page automation
├── types/index.ts         # TypeScript type definitions
└── utils/
    ├── storage.ts         # Chrome storage abstraction
    ├── promptGenerator.ts # OpenAI API integration
    ├── csvParser.ts       # CSV import/export
    ├── queueProcessor.ts  # Queue automation
    ├── promptActions.ts   # Prompt editing (edit/delete/refine/duplicate)
    └── logger.ts          # Debug logging system

tests/
├── setup.ts              # Jest + Chrome API mocks
└── utils/                # Unit tests (mirrors src/utils)
```

### Key Files You'll Work With Most
1. **src/popup.tsx** - All UI changes
2. **src/background.ts** - Adding new actions/message handlers
3. **src/types/index.ts** - Defining new data structures
4. **src/utils/storage.ts** - Storage schema changes
5. **.github/workflows/ci.yml** - CI/CD pipeline

## Build System

**Bundler:** esbuild (fast, TypeScript-native)
**Format:** IIFE (required for Chrome extensions)
**Target:** Chrome 90+, ES2020

Three entry points bundled separately:
1. `src/background.ts` → `dist/background.js` (33.7 KB)
2. `src/popup.tsx` → `dist/popup.js` (1.1 MB, includes React)
3. `src/content.ts` → `dist/content.js` (8.8 KB)

## Testing Strategy

**Framework:** Jest 29.7.0 + React Testing Library
**Coverage Enforcement:** 90% threshold (branches/functions/lines/statements)
**Current Coverage:** 93.82%

### What's Tested
- ✅ storage.ts - Chrome storage abstraction
- ✅ csvParser.ts - CSV parsing and export
- ✅ promptGenerator.ts - OpenAI API integration

### What's NOT Tested (Integration Components)
- ❌ popup.tsx - Complex React/DOM mocking
- ❌ background.ts - Chrome API integration
- ❌ content.ts - DOM manipulation
- ❌ queueProcessor.ts - Complex queue processor
- ❌ promptActions.ts - Complex action handlers
- ❌ logger.ts - Complex logging utility

Chrome API mocks are provided in `tests/setup.ts` for `chrome.runtime`, `chrome.storage`, `chrome.tabs`.

## Key Patterns & Conventions

### Storage Pattern
**NEVER use `chrome.storage.local` directly** - always use `storage.ts` abstraction:
```typescript
import { storage } from './utils/storage';
const config = await storage.getConfig();
await storage.saveConfig(newConfig);
```

### Error Handling Pattern
All functions return consistent structure:
```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

### Logging Pattern
Use categorized helpers, never raw `console.log()`:
```typescript
import { log } from './utils/logger';
log.queue.start();
log.api.error('Failed to generate prompts', error);
log.ui.info('Tab switched to Queue');
```

### Type Safety
- Strict TypeScript mode enabled
- No `any` types (except Chrome API mocks)
- All parameters and returns explicitly typed
- Enums for restricted values (AspectRatio, PresetType, LogLevel)

### Async/Await
All Chrome API calls and network requests use async/await, NOT callbacks.

## Important Implementation Details

### Queue Processor Singleton
`queueProcessor.ts` exports a singleton instance to maintain state across multiple message calls:
```typescript
export const queueProcessor = new QueueProcessor();
```
Multiple instances would conflict and cause race conditions.

### Content Script DOM Selectors
The content script relies on Sora's DOM structure. If Sora updates their UI, these selectors may break:
- `textarea[placeholder*="Describe your image"]` - Prompt input
- `svg circle[stroke-dashoffset]` - Loading indicator
- `[role="status"]` - Status toast

**If automation fails, check these selectors first.**

### Two-Phase Completion Detection
Content script must:
1. Wait for generation to START (loader appears)
2. Wait for generation to COMPLETE (loader disappears)

This prevents false positives from instant errors.

### Human-Like Typing
Content script simulates human typing with random 30-80ms delays between characters to avoid bot detection.

### Anti-Bot Delays
Queue processor waits a random delay (default 2-5 seconds, configurable 2-60s) between prompt submissions.

## Message Passing Protocol

### Background Message Handlers
```typescript
switch (request.action) {
  case 'generatePrompts':     // Generate batch via OpenAI
  case 'getNextPrompt':       // Get next pending prompt
  case 'markPromptComplete':  // Mark as completed
  case 'startQueue':          // Start queue processor
  case 'pauseQueue':          // Pause queue
  case 'resumeQueue':         // Resume queue
  case 'stopQueue':           // Stop queue completely
  case 'promptAction':        // Edit/delete/refine/duplicate/similar
  case 'enhancePrompt':       // Enhance single prompt
  case 'getLogs':             // Retrieve debug logs
  case 'clearLogs':           // Clear all logs
  case 'exportLogs':          // Download logs as file
}
```

### Content Script Message Handlers
```typescript
switch (request.action) {
  case 'submitPrompt':  // Submit prompt to Sora
  case 'checkReady':    // Check if Sora is ready
}
```

All handlers use async/await and return `{ success: boolean, data/error }`.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs three parallel jobs on push/PR:
1. **Test & Coverage** - Jest with 90% threshold enforcement
2. **Build** - Verifies extension builds successfully
3. **Lint** - TypeScript type checking + Prettier formatting

Pre-push hook (Husky) runs tests locally before pushing.

## Common Pitfalls

### Popup State Polling
Popup polls storage every 2 seconds. This can cause:
- Slight delays in UI updates
- Unnecessary re-renders

**Future improvement:** Use Chrome storage change listeners.

### Monolithic Popup Component
`popup.tsx` is a single 804-line component with no sub-components. This makes:
- Unit testing difficult
- Code reuse impossible
- Mental model complex

**Future improvement:** Break into smaller components.

### IIFE Bundle Format
All bundles use IIFE (not ES modules). This means:
- No tree shaking optimization
- React bundled entirely into popup.js (1.1 MB)
- Required for Chrome extension compatibility

### TypeScript Imports
When importing types, prefer named imports from `types/index.ts`:
```typescript
import type { GeneratedPrompt, PromptConfig } from './types';
```

## Adding New Features

1. **Define types** in `src/types/index.ts`
2. **Add business logic** in `src/utils/` or `src/background.ts`
3. **Add UI** in `src/popup.tsx` (or create new component)
4. **Add message handler** in `src/background.ts` if needed
5. **Write tests** in `tests/` directory
6. **Ensure coverage** with `pnpm run test:coverage` (90%+ required)
7. **Update documentation** if user-facing

## Debugging

### Enable Debug Logging
1. Click extension icon
2. Go to Debug tab
3. Enable logging categories
4. Export logs for analysis

### Chrome DevTools
- **Popup:** Right-click popup → Inspect
- **Background:** chrome://extensions → Details → "Inspect views: service worker"
- **Content script:** Normal page DevTools on sora.com

### Common Issues
1. **Automation fails** → Check content script selectors
2. **API errors** → Verify OpenAI API key in Settings
3. **Queue stuck** → Check Debug logs, try Stop → Start
4. **Build fails** → `pnpm run clean && pnpm install && pnpm run build`

## Chrome Extension Manifest

**Version:** Manifest V3
**Permissions:** activeTab, storage, scripting, tabs, host_permissions: ["https://*/*"]

**Content Script Injection:**
- Matches: `*://sora.com/*` and `*://*.sora.com/*`
- Timing: `document_end` (after DOM ready)

**Service Worker:** background.js (persistent)

## OpenAI API Integration

### Models Used
- **Batch generation:** GPT-4 (temperature 0.9 for creativity)
- **Refinement:** GPT-4 (temperature 0.7 for focus)
- **Variations:** GPT-4 (temperature 0.9)

### Enhanced Prompts Mode
When enabled, adds technical details:
- **Video:** Camera movements, lighting, color grading, cinematic techniques
- **Image:** Photography composition, aperture, focal length, lighting setup

### Cost Estimation
- 50 prompts: ~$0.02-$0.05 USD
- 100 prompts: ~$0.04-$0.10 USD
- Scales linearly

## CSV Format

### Import (5 columns)
```csv
prompt,type,aspect_ratio,variations,preset
"A cinematic shot of underwater coral reef",video,16:9,4,cinematic
```

**Valid values:**
- type: `video`, `image`
- aspect_ratio: `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `21:9`
- variations: `2`, `4`
- preset: `cinematic`, `documentary`, `artistic`, `realistic`, `animated`, `none`

Only `prompt` column is required; others default to config values.

## Storage Schema

Stored in `chrome.storage.local`:
- **config** - PromptConfig (16 fields)
- **prompts** - GeneratedPrompt[] (active queue)
- **queueState** - QueueState (running/paused status)
- **history** - GeneratedPrompt[] (completed, max 1000)

Never access directly - use `storage.ts` abstraction.

## Development Workflow Best Practices

1. **Run watch mode** during development: `pnpm run dev`
2. **Reload extension** in Chrome after each build
3. **Test manually** on actual sora.com page
4. **Write tests** for new utilities (target 90%+ coverage)
5. **Type check** before committing: `pnpm exec tsc --noEmit`
6. **Format code** before committing: `pnpm run format`
7. **Pre-push hook** runs tests automatically

## Version History

### v1.0.1 (Current)
- Migrated from npm to pnpm
- Updated CI/CD to use pnpm
- Updated Husky to 9.1.7

### v1.0.0
- Initial release
- 93.82% test coverage
- GitHub Actions CI/CD
- Husky pre-push hooks

## Privacy & Security

- API keys stored locally (Chrome storage, encrypted at rest)
- Prompts never leave device except to OpenAI API
- No telemetry or analytics
- No external servers - fully client-side
- Open source - auditable

## Known Limitations

1. Content script selectors may break if Sora updates UI
2. Queue processing requires active Sora tab to remain open
3. Large queues (1000+ prompts) may impact performance
4. Popup is monolithic - difficult to test/maintain
5. No tree shaking due to IIFE bundle format
