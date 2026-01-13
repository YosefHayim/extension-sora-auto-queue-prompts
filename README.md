# Sora Auto Queue Prompts

A production-grade Chrome extension that automates prompt generation and queue management for [Sora AI](https://sora.com) video/image generation. Built with a modern tech stack featuring React 18, TypeScript 5, and a component-based architecture.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kbpbdckjechbjmnjagfkgcplmhdkkgph?label=Chrome%20Web%20Store&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/sora-auto-queue-prompts/kbpbdckjechbjmnjagfkgcplmhdkkgph)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)

## What's New in v2.5.0

- **Side Panel UI**: Persistent queue visibility while working on Sora pages
- **Preset System**: Save and load prompt configuration presets for quick style switching
- **Onboarding Tour**: Interactive guided tour for new users
- **Batch Operations Panel**: Select, enable/disable, and delete multiple prompts at once
- **Queue Insertion Picker**: Choose exactly where new prompts are inserted
- **Auto-Download**: Automatically save generated media when complete
- **Bulk Download**: Download all visible media from your library with one click
- **Enhanced Completion Detection**: Dual detection (API + DOM) for more reliable processing
- **Improved Accessibility**: Thicker focus rings with theme-aware colors

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

## Installation

**Chrome Web Store (Recommended):**

[**Install from Chrome Web Store**](https://chromewebstore.google.com/detail/sora-auto-queue-prompts/kbpbdckjechbjmnjagfkgcplmhdkkgph)

**Manual Installation (Development):**

```bash
git clone https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git
cd extension-sora-auto-queue-prompts
pnpm install
pnpm run build
# Load dist/ folder as unpacked extension in chrome://extensions/
```

## Features

### AI-Powered Prompt Generation

- **Multi-Provider Support**: OpenAI GPT-4, Anthropic Claude, and Google Gemini
- **Batch Generation**: Generate up to 100 prompts at once
- **Enhanced Mode**: Automatically adds technical details (camera movements, lighting, cinematography)
- **Context-Aware**: Use custom context to guide prompt generation themes

### Queue Management

- **Side Panel UI**: Persistent queue visibility while working on Sora pages
- **Drag-and-Drop Reordering**: Intuitive queue organization with `@dnd-kit`
- **Bulk Operations**: Select, enable/disable, and delete multiple prompts at once
- **Batch Operations Panel**: Dedicated panel for managing multiple prompts
- **Queue Insertion Picker**: Choose where new prompts are inserted (top, bottom, or after specific prompt)
- **Status Filtering**: Filter by pending, processing, completed, or failed
- **Sort Options**: Sort by priority, date, status, or alphabetically
- **Search**: Real-time search across all prompts

### Preset System

- **Save Presets**: Store your favorite prompt configurations for quick access
- **Load Presets**: Switch between generation styles with one click
- **Preset Management**: Create, edit, and delete presets from Settings

### Automation

- **Human-Like Typing**: Simulates natural typing with 30-80ms delays between characters
- **Anti-Bot Protection**: Configurable random delays (2-60 seconds) between submissions
- **Dual Completion Detection**: API-based detection with DOM fallback for reliability
- **Direct Progress Tracking**: Real-time progress percentage from Sora API
- **Auto-Detection**: Reads current media type, aspect ratio, and variation settings from Sora

### Image Support

- **Local Image Upload**: Upload images directly from your device to attach to prompts
- **Cloud URL Support**: Paste image URLs for image-to-video generation
- **Automatic Cleanup**: Local images removed from storage after processing completes

### Auto-Download

- **Automatic Media Saving**: Automatically download generated images and videos when generation completes
- **Configurable Download Path**: Set a custom subfolder within Downloads (e.g., `Downloads/Sora/`)
- **Flexible Save Options**: Choose to auto-save or prompt for location on each download
- **Batch Download**: Download all visible media on the Sora page at once
- **Smart Filename Generation**: Files named using sanitized prompt text with timestamp

### Smart Rate Limiting

- **API Response Monitoring**: Real-time detection of Sora API responses
- **Rate Limit Detection**: Automatic queue pause when daily limits are reached
- **Browser Notifications**: Native alerts when rate limits hit

### Keyboard Shortcuts

- **Quick Submit**: Ctrl+Enter / Cmd+Enter in all dialog textareas
- **Standard Forms**: Enter key support in input fields

### Import/Export

- **CSV Import**: Bulk import prompts with custom settings per row
- **CSV Export**: Export queue or history for backup/sharing
- **Prompt Refinement**: AI-powered prompt improvement and variation generation

### Developer Features

- **Debug Panel**: Real-time categorized logging (queue, api, ui, content)
- **Error Boundary**: Graceful error handling with recovery options
- **Dark/Light Mode**: System-aware theme switching

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Popup / Side Panel UI (React)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  StatusBar   │ │QueueControls │ │     25+ UI Components    │ │
│  │  Presets     │ │ BatchOps     │ │  OnboardingTour, etc.    │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                              │                                   │
│              chrome.runtime.sendMessage()                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Background Service Worker                       │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │PromptGenerator │  │ QueueProcessor │  │  API Interceptor  │  │
│  │  (AI APIs)     │  │ (Orchestrator) │  │  (Dual Detection) │  │
│  └────────────────┘  └────────────────┘  └───────────────────┘  │
│                              │                                   │
│               chrome.tabs.sendMessage()                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Content Script (sora.com)                     │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │ DOM Selectors  │  │ Human Typing   │  │ Status Detection  │  │
│  │   & Actions    │  │  Simulation    │  │ (API + DOM)       │  │
│  └────────────────┘  └────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Three-Layer Communication Model

| Layer                  | Technology          | Responsibility                                            |
| ---------------------- | ------------------- | --------------------------------------------------------- |
| **Popup / Side Panel** | React 18 + Tailwind | User interaction, state display, component orchestration  |
| **Background Worker**  | Service Worker      | API calls, queue orchestration, cross-tab coordination    |
| **Content Script**     | DOM Manipulation    | Page automation, typing simulation, dual status detection |

All inter-layer communication uses Chrome's async message passing API with typed request/response contracts.

## Tech Stack

| Category          | Technology                                 |
| ----------------- | ------------------------------------------ |
| **Frontend**      | React 18, TypeScript 5.3, Tailwind CSS 3.4 |
| **UI Components** | Shadcn UI, Radix Primitives, React Icons   |
| **Drag & Drop**   | @dnd-kit/core, @dnd-kit/sortable           |
| **Build Tool**    | WXT (Vite-based extension framework)       |
| **Testing**       | Jest 29, React Testing Library, Playwright |
| **Code Quality**  | ESLint, Prettier, Husky pre-commit hooks   |
| **CI/CD**         | GitHub Actions with Codecov integration    |

## Project Structure

```
extension-sora-auto-queue-prompts/
├── entrypoints/              # WXT entry points
│   ├── popup.tsx             # Main React UI
│   ├── sidepanel.tsx         # Side Panel UI (same features, persistent view)
│   ├── background.ts         # Service worker orchestrator
│   └── content.ts            # Sora page automation
├── src/
│   ├── components/           # 25+ modular React components
│   │   ├── ui/               # Shadcn primitives (Button, Dialog, Tabs, Select, etc.)
│   │   ├── PromptCard.tsx    # Prompt display with actions menu
│   │   ├── QueueControls.tsx # Start/pause/resume/stop controls
│   │   ├── PresetSelector.tsx # Preset management UI
│   │   ├── BatchOperationsPanel.tsx # Bulk prompt operations
│   │   ├── OnboardingTour.tsx # New user guided tour
│   │   ├── QueueInsertionPicker.tsx # Prompt insertion location
│   │   ├── DebugPanel.tsx    # Real-time logging interface
│   │   └── ...
│   ├── utils/                # Business logic
│   │   ├── storage.ts        # Chrome storage abstraction (with preset support)
│   │   ├── promptGenerator.ts# Multi-provider AI integration
│   │   ├── queueProcessor.ts # Queue orchestration singleton
│   │   ├── csvParser.ts      # Import/export functionality
│   │   ├── downloader.ts     # Auto-download media utility
│   │   └── logger.ts         # Categorized logging system
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Tailwind CSS configuration
├── tests/                    # Unit tests (Jest)
├── e2e/                      # End-to-end tests (Playwright)
└── public/                   # Static assets (icons, sidepanel.html)
```

## Key Implementation Details

### Storage Abstraction Pattern

All Chrome storage operations use a typed abstraction layer:

```typescript
// Never use chrome.storage.local directly
import { storage } from "./utils/storage";
const config = await storage.getConfig();
await storage.saveConfig(newConfig);
```

### Queue Processor Singleton

Maintains consistent state across async message calls:

```typescript
export const queueProcessor = new QueueProcessor();
// Single instance prevents race conditions
```

### Two-Phase Completion Detection

Content script waits for:

1. Generation to **start** (loader appears)
2. Generation to **complete** (30s network silence)

This prevents false positives from instant API errors.

### Categorized Logging

```typescript
import { log } from "./utils/logger";
log.queue.start(); // [QUEUE] Starting queue...
log.api.error("Failed", e); // [API] Failed: ...
log.ui.action("Tab switch"); // [UI] Tab switch
```

## Development

```bash
# Install dependencies
pnpm install

# Development (watch mode)
pnpm run dev

# Production build
pnpm run build

# Run tests
pnpm test                    # Run once
pnpm run test:watch          # Watch mode
pnpm run test:coverage       # With coverage report

# E2E tests
pnpm run test:e2e            # Headless
pnpm run test:e2e:headed     # With browser UI

# Code quality
pnpm run lint                # Check formatting
pnpm run format              # Auto-format
```

## CSV Import Format

```csv
prompt,type,aspect_ratio,variations,preset
"A cinematic underwater shot of coral reef",video,16:9,4,cinematic
"Portrait of a woman in golden hour light",image,9:16,2,realistic
```

| Column         | Required | Values                                                                  |
| -------------- | -------- | ----------------------------------------------------------------------- |
| `prompt`       | Yes      | Any text                                                                |
| `type`         | No       | `video`, `image`                                                        |
| `aspect_ratio` | No       | `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `21:9`                             |
| `variations`   | No       | `2`, `4`                                                                |
| `preset`       | No       | `cinematic`, `documentary`, `artistic`, `realistic`, `animated`, `none` |

## Message Passing Protocol

### Background Worker Handlers

| Action                                                    | Description                            |
| --------------------------------------------------------- | -------------------------------------- |
| `generatePrompts`                                         | Batch generate via AI provider         |
| `startQueue` / `pauseQueue` / `resumeQueue` / `stopQueue` | Queue lifecycle                        |
| `promptAction`                                            | Edit/delete/refine/duplicate prompt    |
| `enhancePrompt`                                           | AI-powered prompt improvement          |
| `downloadMedia`                                           | Download single media file             |
| `extractAndDownloadMedia`                                 | Extract and download all visible media |
| `getLogs` / `clearLogs` / `exportLogs`                    | Debug logging                          |

### Content Script Handlers

| Action           | Description                            |
| ---------------- | -------------------------------------- |
| `submitPrompt`   | Type and submit prompt to Sora         |
| `checkReady`     | Verify Sora is ready for input         |
| `detectSettings` | Read current media type/aspect ratio   |
| `extractMedia`   | Extract all image/video URLs from page |

## Privacy & Security

- **Local Storage Only**: API keys stored in Chrome's encrypted local storage
- **No Telemetry**: Zero analytics or tracking
- **No External Servers**: All processing happens client-side
- **Open Source**: Fully auditable codebase
- **Minimal Permissions**: Only requests necessary Chrome APIs

See [PRIVACY-POLICY.md](PRIVACY-POLICY.md) for full details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Yosef Hayim** - [@YosefHayim](https://github.com/YosefHayim)

---

<p align="center">
  <a href="https://chromewebstore.google.com/detail/sora-auto-queue-prompts/kbpbdckjechbjmnjagfkgcplmhdkkgph">
    <img src="public/icon128.png" alt="Sora Auto Queue Prompts" width="64" height="64">
  </a>
</p>
<p align="center">
  <strong>Streamline your Sora AI workflow</strong>
</p>
