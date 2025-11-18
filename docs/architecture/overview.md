# Architecture Overview

Complete architectural overview of the Sora Auto Queue Prompts Chrome extension.

---

## Project Overview

**Extension Name:** Sora Auto Queue Prompts
**Version:** 1.0.1
**Purpose:** Chrome extension that automates prompt generation and queue management for Sora AI video/image generation

### Key Value Proposition
- Generate 10-200 AI-optimized prompts in seconds using GPT-4
- Automatically submit prompts to Sora.com with intelligent anti-bot delays
- Visual queue management with real-time status tracking
- Flexible input methods (AI generation, manual entry, CSV import)
- In-queue editing and advanced prompt manipulation

---

## Technology Stack

### Core Technologies
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.3
- **Bundler:** esbuild
- **Styling:** CSS (vanilla, no CSS-in-JS libraries)
- **Testing:** Jest 29.7.0 + React Testing Library 14.1.2
- **Package Manager:** pnpm

### Chrome APIs
- Chrome Runtime API (message passing)
- Chrome Storage API (local persistence)
- Chrome Tabs API (tab management)
- Chrome Scripting API (content script injection)

---

## Architecture Diagram

```
┌─────────────────┐
│  Popup UI       │  ← User interacts here (React)
│  (popup.tsx)    │
└────────┬────────┘
         │
         ↓ Messages (Chrome Runtime)
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

---

## Component Structure

### Main Components

**1. Popup (popup.tsx)** - 804 lines
- Main React UI component
- Single monolithic component (no sub-components)
- Handles all user interactions
- Manages state with React hooks
- Communicates with background via Chrome messages

**2. Background Service Worker (background.ts)**
- Orchestrates all operations
- Handles messages from popup
- Manages OpenAI API calls
- Controls queue processing
- Coordinates content script injection

**3. Content Script (content.ts)**
- Injected into sora.com pages
- Finds prompt textarea
- Simulates human typing
- Submits prompts
- Monitors completion status

---

## Data Flow

### Message Passing Architecture

**Popup → Background:**
```typescript
chrome.runtime.sendMessage({
  action: 'generatePrompts' | 'startQueue' | 'pauseQueue' |
          'promptAction' | 'getLogs',
  data: { /* action-specific data */ }
})
```

**Background → Popup:**
```typescript
{ success: true, data: /* response data */ }
{ success: false, error: 'Error message' }
```

### Storage Architecture

**Chrome Storage API** (`chrome.storage.local`)

Stored data:
- `config` - User configuration (persisted)
- `prompts` - Array of prompts (persisted)
- `queueState` - Current queue status (persisted)
- `logs` - System logs (persisted, limit 100 entries)

---

## Key Workflows

### 1. Prompt Generation Workflow

```
User enters context in Generate tab
         ↓
Popup sends "generatePrompts" message to background
         ↓
Background calls OpenAI GPT-4 API
         ↓
AI generates batch of prompts
         ↓
Prompts stored in Chrome storage
         ↓
Popup updates to show new prompts in queue
```

### 2. Queue Processing Workflow

```
User clicks "Start Queue" in Queue tab
         ↓
Popup sends "startQueue" message to background
         ↓
Background activates queue processor
         ↓
For each prompt:
  ├─ Inject content script into sora.com tab
  ├─ Content script finds textarea
  ├─ Simulates human typing (30-80ms delays)
  ├─ Submits form
  ├─ Waits for completion
  ├─ Marks prompt as completed
  └─ Random anti-bot delay (configurable 2-60s)
         ↓
Repeat until queue empty or paused
```

### 3. Data Persistence Workflow

```
User action (generate/edit/delete prompt)
         ↓
Background updates in-memory state
         ↓
Background saves to Chrome storage
         ↓
Storage persists across browser restarts
         ↓
Popup polls storage every 2 seconds for updates
```

---

## File Structure

```
src/
├── popup.tsx              # Main React UI component (804 lines)
├── popup.css              # Complete styling (640 lines)
├── background.ts          # Service worker orchestration
├── content.ts             # Sora.com automation
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    ├── storage.ts         # Chrome storage abstraction
    ├── promptGenerator.ts # OpenAI API integration
    ├── csvParser.ts       # CSV import/export
    ├── queueProcessor.ts  # Queue automation
    ├── promptActions.ts   # Prompt editing actions
    └── logger.ts          # Debug logging system

assets/
├── popup.html            # Popup HTML entry point
├── popup.css             # Popup styles
└── manifest.json         # Extension manifest (V3)

dist/                     # Build output
├── popup.html           # Compiled HTML
├── popup.js             # Compiled React (1.1 MB with React)
├── popup.css            # Compiled CSS (9.3 KB)
├── background.js        # Compiled service worker (33.7 KB)
├── content.js           # Compiled content script (8.8 KB)
└── manifest.json        # Extension manifest
```

---

## Build Process

### esbuild Configuration

Three entry points:
1. `src/background.ts` → `dist/background.js` (IIFE format)
2. `src/popup.tsx` → `dist/popup.js` (IIFE format)
3. `src/content.ts` → `dist/content.js` (IIFE format)

**Build output:**
- Target: Chrome 90+, ES2020
- Format: IIFE (Immediately Invoked Function Expression)
- Bundle: All dependencies included
- React: Bundled into popup.js (~1.1 MB)

### Build Commands

```bash
pnpm run build    # Production build
pnpm run dev      # Development build (watch mode)
pnpm run clean    # Clean build artifacts
```

---

## Extension Manifest (V3)

```json
{
  "manifest_version": 3,
  "name": "Sora Auto Queue Prompts",
  "version": "1.0.1",
  "description": "Automate prompt generation and queueing for Sora AI",
  "permissions": ["activeTab", "storage", "scripting", "tabs"],
  "host_permissions": ["https://*/*"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["*://sora.com/*", "*://*.sora.com/*"],
    "js": ["content.js"],
    "run_at": "document_end"
  }]
}
```

---

## State Management

### React Hooks (popup.tsx)

```typescript
const [config, setConfig]                 // User configuration
const [prompts, setPrompts]               // Queue prompts array
const [queueState, setQueueState]         // Running/paused/stopped
const [logs, setLogs]                     // Debug logs
const [loading, setLoading]               // UI loading state
const [error, setError]                   // Error message
const [success, setSuccess]               // Success message
const [activeTab, setActiveTab]           // Current active tab
const [editingPromptId, setEditingPromptId] // Editing mode
const [editText, setEditText]             // Text being edited
```

### Data Polling

- **Interval:** Every 2 seconds when popup is open
- **Updates:** Prompt statuses, queue state, processed counts
- **Real-time:** Stats header updates automatically

---

## Security Considerations

### API Key Storage
- Stored in Chrome local storage (encrypted at rest by Chrome)
- Never transmitted except to OpenAI API
- User-provided, not embedded in code

### Content Script Safety
- Only runs on sora.com domains
- DOM manipulation limited to textarea and form submission
- No data extraction except completion status

### Chrome Permissions
- `storage` - Required for persistence
- `activeTab` - Required for content script injection
- `scripting` - Required for dynamic content script injection
- `tabs` - Required for tab management
- `host_permissions` - Required for API calls

---

## Performance Considerations

### Bundle Sizes
- **popup.js:** 1.1 MB (includes React)
- **background.js:** 33.7 KB
- **content.js:** 8.8 KB

### Optimization Opportunities
- Virtual scrolling for large prompt lists
- Lazy loading of tabs
- Debouncing of storage updates
- Service worker caching

### Current Limitations
- 2-second polling interval (could be optimized)
- Large prompt lists (1000+) may slow rendering
- No pagination on queue display

---

## Testing Strategy

### Test Coverage: 93.82%

**Test Areas:**
- Popup component rendering
- State management (config, prompts, queue)
- Message passing to background
- CSV parsing and export
- Storage operations
- Queue processing logic
- Error handling

**Testing Stack:**
- Jest 29.7.0
- React Testing Library 14.1.2
- jsdom environment
- Chrome API mocks

---

## Key Technical Decisions

### Why React?
- Component-based UI architecture
- Strong ecosystem and tooling
- TypeScript support
- Testing library maturity

### Why Vanilla CSS?
- No build complexity
- Easy customization
- No framework lock-in
- Smaller bundle size (compared to styled-components)

### Why esbuild?
- Extremely fast builds
- Built-in TypeScript support
- Simple configuration
- Efficient bundling

### Why Monolithic Component?
- Simple mental model for small project
- No prop drilling complexity
- Fast development iteration
- Trade-off: Harder to scale

---

## Future Architecture Considerations

### Component Refactoring
- Break popup.tsx into smaller components
- Create reusable UI components (Button, Card, Form)
- Implement component composition

### State Management
- Consider Zustand or Context API for shared state
- Separate business logic from UI components

### CSS Framework
- Consider Tailwind CSS for utility-first styling
- Reduce CSS duplication

### Backend Integration
- Consider adding backend for:
  - Team collaboration features
  - Cloud sync
  - Template marketplace

---

## Dependencies

### Runtime Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Dev Dependencies
```json
{
  "@types/react": "^18.3.1",
  "@types/react-dom": "^18.3.0",
  "@types/chrome": "^0.0.258",
  "typescript": "^5.3.3",
  "esbuild": "^0.19.11",
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "husky": "^9.1.7",
  "prettier": "^3.2.4"
}
```

---

## Maintenance Guidelines

### Adding New Features
1. Update types in `src/types/index.ts`
2. Add UI in `src/popup.tsx`
3. Add business logic in `src/utils/` or `src/background.ts`
4. Write tests in `tests/`
5. Ensure >= 90% coverage
6. Update documentation

### Fixing Bugs
1. Reproduce bug locally
2. Write failing test
3. Fix bug
4. Verify test passes
5. Ensure no regression in other tests

### Updating Dependencies
```bash
# Check outdated packages
pnpm outdated

# Update specific package
pnpm update package-name

# Update all (use with caution)
pnpm update
```

---

## Known Issues

- Content script selectors may need updates if Sora UI changes
- Queue processing requires active Sora tab to remain open
- Large queues (1000+ prompts) may impact performance
- No offline support for OpenAI API calls

---

**Last Updated:** 2025-11-18
**Current Version:** 1.0.1
**Test Coverage:** 93.82%
**Lines of Code:** ~2,666 LOC
