# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that automates prompt generation and queue management for Sora AI video/image generation. Built with React 18 + TypeScript 5 + Shadcn UI, featuring AI-powered prompt generation via OpenAI GPT-4, drag-and-drop queue reordering, automated submission to sora.com with anti-bot protection, and comprehensive queue management with debug panel.

**Current Version:** 2.1.0
**Test Coverage:** 93.82%
**Package Manager:** pnpm (migrated from npm in v1.0.1)
**Architecture:** Component-based (10 modular components)

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

### Three-Layer System

**Popup UI (popup.tsx)** - 422-line orchestrator component with modular architecture
- Main coordinator managing state and component communication
- Two tabs: Queue (with drag-and-drop reordering) and Debug
- Real-time updates via Chrome storage change listeners with 100ms debouncing
- State managed via React hooks (useState)
- **10 Specialized Components:**
  - `StatusBar` - Display pending/processing/completed counts
  - `QueueControls` - Start/pause/resume/stop queue buttons
  - `PromptCard` - Individual prompt display with actions menu
  - `SortablePromptCard` - Drag-and-drop wrapper for PromptCard
  - `EmptyState` - Call-to-action when queue is empty
  - `DebugPanel` - Comprehensive logging and diagnostics
  - `GenerateDialog` - AI prompt generation modal
  - `CSVImportDialog` - CSV file import modal
  - `ManualAddDialog` - Manual prompt entry modal
  - `SettingsDialog` - Configuration management modal

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
├── popup.tsx              # Main UI orchestrator (422 lines)
├── background.ts          # Service worker coordinator
├── content.ts             # Sora page automation
├── components/            # 10 modular UI components
│   ├── StatusBar.tsx      # Status display
│   ├── QueueControls.tsx  # Queue control buttons
│   ├── PromptCard.tsx     # Prompt display card
│   ├── SortablePromptCard.tsx  # Drag-and-drop wrapper
│   ├── EmptyState.tsx     # Empty queue state
│   ├── DebugPanel.tsx     # Debug logging UI
│   ├── GenerateDialog.tsx # AI generation modal
│   ├── CSVImportDialog.tsx # CSV import modal
│   ├── ManualAddDialog.tsx # Manual add modal
│   ├── SettingsDialog.tsx # Settings modal
│   └── ui/               # Shadcn UI components (button, dialog, tabs, etc.)
├── types/index.ts         # TypeScript type definitions
├── styles/               # Tailwind CSS
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

e2e/
├── prompt-generation.spec.ts  # E2E tests for generation flow
└── ui-validation.spec.ts      # E2E tests for UI components
```

### Key Files You'll Work With Most
1. **src/components/** - UI component changes (StatusBar, QueueControls, DebugPanel, etc.)
2. **src/popup.tsx** - State management and component orchestration
3. **src/background.ts** - Adding new actions/message handlers
4. **src/types/index.ts** - Defining new data structures
5. **src/utils/storage.ts** - Storage schema changes
6. **.github/workflows/ci.yml** - CI/CD pipeline

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

## Key Features

### Drag-and-Drop Queue Reordering (v2.1.0)
- Uses `@dnd-kit` library for smooth, accessible drag-and-drop
- 8px activation distance prevents accidental drags
- Optimistically updates UI before persisting to storage
- Wrapped in `SortablePromptCard` component
- See implementation: `src/popup.tsx:250-272`

### Debug Panel (v2.1.0)
- Comprehensive logging with categorized output (queue, api, ui, content)
- Real-time log viewing during queue processing
- Export logs functionality for troubleshooting
- Clear logs option
- Component-level logging with context
- See implementation: `src/components/DebugPanel.tsx`

### AI-Powered Prompt Generation
- OpenAI GPT-4 integration with temperature control
- Batch generation (up to 100 prompts)
- Context-aware prompts
- Enhanced mode adds technical details (camera angles, lighting, etc.)
- Refinement and variation generation

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

### Real-Time Storage Updates (Implemented v2.1.0+)
Popup now uses Chrome storage change listeners instead of polling:
- ✅ Instant UI updates when storage changes
- ✅ Reduced CPU usage (no polling overhead)
- ✅ 100ms debouncing for batch operations
- ✅ Only listens to relevant keys (config, prompts, queueState)

Previously polled storage every 2 seconds, which caused delays and unnecessary re-renders.

### Component-Based Architecture
`popup.tsx` was refactored in v2.0.0 from a monolithic 804-line component into 10 modular components:
- ✅ Improved maintainability and testability
- ✅ Better code reuse and separation of concerns
- ✅ Each component has a single responsibility

**Recent additions (v2.1.0):**
- Drag-and-drop queue reordering with `@dnd-kit`
- Component-level logging with categorized debug output

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
3. **Create UI component** in `src/components/` (follow existing component patterns)
4. **Integrate component** in `src/popup.tsx` orchestrator
5. **Add message handler** in `src/background.ts` if needed
6. **Write tests** in `tests/` directory (unit + E2E)
7. **Ensure coverage** with `pnpm run test:coverage` (90%+ required)
8. **Update documentation** if user-facing

**Component Guidelines:**
- Use Shadcn UI components for consistency
- Follow logging pattern with `log.[category].[level]`
- Implement loading states and error handling
- Use TypeScript strict mode (no `any` types)
- Prefer controlled components with props over internal state

## Debugging

### Enable Debug Logging (v2.1.0)
1. Click extension icon
2. Switch to **Debug** tab (adjacent to Queue tab)
3. View real-time categorized logs (queue, api, ui, content)
4. Use **Export Logs** button to download for analysis
5. Use **Clear Logs** button to reset log history

**Log Categories:**
- `queue` - Queue processor operations
- `api` - OpenAI API calls and responses
- `ui` - User interface interactions
- `content` - Content script DOM operations

**Component:** `src/components/DebugPanel.tsx`

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

### v2.1.0 (Current)
- Added drag-and-drop queue reordering with `@dnd-kit`
- Enhanced component logging system
- Added DebugPanel tab for comprehensive diagnostics
- Improved queue management UX

### v2.0.0
- Complete UI/UX redesign with Shadcn UI components
- Refactored from monolithic 804-line component to 10 modular components
- Added E2E testing with Playwright
- Component-based architecture for better maintainability
- Tailwind CSS integration

### v1.0.1
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
