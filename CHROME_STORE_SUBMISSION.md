# Chrome Web Store Submission Guide

## Version 2.5.0 Update Submission

Use the following copy-paste ready content for your Chrome Web Store developer dashboard submission.

---

## 1. STORE LISTING

### Extension Name

```
Sora Auto Queue Prompts
```

### Summary (132 characters max)

```
Automate prompt generation and queue management for Sora AI video/image generation with AI-powered prompts and batch processing.
```

### Description (16,000 characters max)

```
Sora Auto Queue Prompts is a productivity extension that automates prompt generation and queue management for Sora AI (sora.com).

NEW IN V2.5.0:
• Side Panel UI - Persistent queue view while you work
• Rate Limit Countdown - Know exactly when you can generate again
• Preset System - Save and switch between generation styles
• Onboarding Tour - Quick start guide for new users
• Auto-Download - Automatically save generated media
• Batch Operations - Manage multiple prompts at once

KEY FEATURES:

🤖 AI-Powered Prompt Generation
• Generate up to 100 prompts at once using OpenAI GPT-4, Anthropic Claude, or Google Gemini
• Enhanced mode adds cinematic details (camera movements, lighting, cinematography)
• Use custom context to guide prompt themes and styles
• Save presets for quick switching between generation styles

📋 Smart Queue Management
• Side Panel UI for persistent queue visibility while working
• Drag-and-drop queue reordering
• Bulk operations: select, enable/disable, delete multiple prompts
• Filter by status: pending, processing, completed, failed
• Sort by priority, date, status, or alphabetically
• Real-time progress tracking with visual indicators

⚡ Intelligent Automation
• Human-like typing simulation with natural delays
• Anti-detection with configurable random delays between submissions
• Dual completion detection (API + DOM) for reliability
• Smart rate limit detection with automatic queue pause
• Rate limit countdown timer showing when you can generate again

📥 Auto-Download
• Automatically save generated images and videos when complete
• Configurable download paths and naming
• Bulk download all visible media from your library

📤 Import/Export
• CSV import with custom settings per prompt
• Export queue or history for backup and sharing
• AI-powered prompt refinement

🔒 Privacy-Focused
• All data stored locally on your device
• No analytics, tracking, or external servers
• Your API keys never leave your browser
• Open source and fully auditable

REQUIREMENTS:
• Sora account (sora.com or sora.chatgpt.com)
• AI API key (OpenAI, Anthropic, or Google) for prompt generation

KEYBOARD SHORTCUTS:
• Ctrl+Enter / Cmd+Enter: Quick submit in dialogs
• Standard form navigation supported

This extension is open source. View the code, report issues, or contribute at:
https://github.com/YosefHayim/extension-sora-auto-queue-prompts
```

### Category

```
Productivity
```

### Language

```
English
```

---

## 2. PERMISSION JUSTIFICATIONS

### For Chrome Web Store Review Team

Copy each justification when prompted for permission explanations:

#### activeTab

```
Required to access the currently active Sora tab when the user initiates queue processing. This permission is only used when the user explicitly clicks "Start Queue" or performs other user-initiated actions. It allows the extension to interact with the Sora webpage to submit prompts.
```

#### storage

```
Required to save user preferences, prompt queue, and processing history locally on the user's device. All data is stored using Chrome's local storage API and never transmitted to external servers. This includes:
- User configuration (batch size, delays, theme)
- Prompt queue and history
- API provider settings (keys stored securely)
```

#### scripting

```
Required to inject the content script into Sora pages (sora.com and sora.chatgpt.com) when the extension needs to interact with the page. This is used to:
- Fill the prompt textarea with user's prompts
- Click the submit button to start generation
- Detect generation completion status
- Extract generated media URLs for auto-download
```

#### tabs

```
Required to find and communicate with Sora tabs. The extension needs to:
- Query for open Sora tabs to send prompts
- Send messages between the popup, background script, and content script
- Activate the Sora tab when processing starts
This permission is only used for sora.com and sora.chatgpt.com domains.
```

#### downloads

```
Required for two features:
1. Auto-download: Automatically save generated images and videos when generation completes
2. Export: Allow users to export their prompt queue/history as CSV or JSON files
Users can configure download location and naming preferences.
```

#### webRequest

```
Required to observe (not modify) network requests to Sora's API endpoints. This allows the extension to:
- Detect when generation starts and completes by monitoring API responses
- Extract progress percentage from API responses for accurate progress display
- Detect rate limit errors to automatically pause the queue
Note: This extension does NOT use webRequestBlocking and does NOT modify any requests.
```

#### notifications

```
Required to alert users about important queue events:
- Rate limit reached: Notifies when daily generation limit is hit
- Queue completion: Optional notification when all prompts are processed
Notifications are non-intrusive and respect system notification settings.
```

#### sidePanel

```
Required for the Side Panel UI feature introduced in v2.5.0. The side panel provides:
- Persistent queue visibility while working on Sora pages
- Access to all queue management features without opening popup
- Improved workflow for users managing large prompt queues
The side panel only displays extension UI and does not access additional user data.
```

---

## 3. HOST PERMISSIONS JUSTIFICATIONS

#### _://sora.com/_

```
Required to run the content script on Sora's main domain. The content script:
- Interacts with Sora's prompt input field
- Submits prompts on behalf of the user
- Detects generation status and completion
- Extracts generated media URLs for auto-download
```

#### _://sora.chatgpt.com/_

```
Required to run the content script on Sora's alternate domain (accessed via ChatGPT). Same functionality as sora.com - prompt submission and status detection.
```

#### https://browser-intake-datadoghq.com/*

```
Required for fallback completion detection. Sora uses DataDog for real-user monitoring. By observing request frequency to this endpoint, we can detect when generation activity has stopped (fallback method when API detection is unavailable). This is read-only observation - no requests are modified or blocked.
```

---

## 4. SINGLE PURPOSE DESCRIPTION

```
This extension has a single purpose: to automate prompt queue management for Sora AI (sora.com).

It helps users who want to generate multiple images or videos by:
1. Generating creative prompts using AI (OpenAI, Anthropic, or Google)
2. Managing a queue of prompts to be submitted
3. Automatically submitting prompts one-by-one with human-like delays
4. Tracking generation progress and completion
5. Auto-downloading generated media

All features directly support this single purpose of streamlining the Sora content creation workflow.
```

---

## 5. PRIVACY PRACTICES

### Data Use Disclosure (for Chrome Web Store Privacy tab)

#### Does your extension collect user data?

```
No - All data is stored locally on the user's device using Chrome's storage API.
```

#### List the types of user data collected:

```
None collected. The extension stores user preferences and prompt data locally but does not transmit any data to external servers operated by the developer.
```

#### Certify that your extension:

- [x] Does not sell user data to third parties
- [x] Does not use or transfer user data for purposes unrelated to the extension's single purpose
- [x] Does not use or transfer user data for creditworthiness or lending purposes

#### Data usage explanation:

```
This extension stores all data locally on the user's device:
- Prompt queue and history (stored in Chrome local storage)
- User preferences (batch size, delays, theme)
- API keys (stored securely in Chrome local storage, never transmitted to our servers)

External data transmission occurs only when:
1. User generates prompts → Sent to user's chosen AI provider (OpenAI/Anthropic/Google) using the user's own API key
2. User processes queue → Prompts submitted to sora.com via browser automation (as if typed manually)

The developer does not operate any servers and does not collect any telemetry or analytics.
```

---

## 6. REMOTE CODE POLICY

```
This extension does not use any remote code. All JavaScript is bundled locally within the extension package. The extension does not:
- Load scripts from external servers
- Execute dynamically fetched code
- Use eval() or similar code execution methods

All functionality is self-contained within the extension bundle.
```

---

## 7. VERSION UPDATE NOTES (for Review Team)

### Changes in v2.5.0:

```
MAJOR NEW FEATURES:
• Side Panel UI: New persistent side panel mode for queue visibility while working
• Rate Limit Countdown: Real-time countdown showing when daily limit resets
• Preset System: Save and load prompt configuration presets
• Onboarding Tour: Interactive guided tour for new users
• Batch Operations Panel: Manage multiple prompts at once
• Auto-Download: Automatically save generated media when complete
• Bulk Download: Download all visible media from library with one click

UI/UX IMPROVEMENTS:
• Settings Dialog redesigned with tabbed interface (General, API Keys, Automation, Presets)
• Queue Insertion Picker: Choose where new prompts appear in queue
• Priority Badges: Visual priority indicators on prompt cards
• Queue Sort Menu: Sort by status, priority, date, or alphabetically
• Enhanced focus ring styling for better accessibility
• Improved dark mode support throughout

ROBUSTNESS IMPROVEMENTS:
• Dual completion detection (API primary, DOM fallback)
• Direct progress tracking from Sora API responses
• Fixed completion detection timing race conditions
• Better checkbox visibility in dark mode
• Fixed layout issues in queue controls

TECHNICAL CHANGES:
• 10+ new React components for enhanced modularity
• New downloader utility for media handling
• Comprehensive test coverage for new features
• TypeScript interfaces for Sora API response types
• Improved error logging with task state snapshots

NO PERMISSION CHANGES - Same permissions as previous version.
```

---

## 8. SCREENSHOTS REQUIREMENTS

Prepare the following screenshots (1280x800 or 640x400):

1. **Side Panel Queue View** - Show the side panel with prompts in queue (main differentiator)
2. **Generation Progress** - Show active generation with progress bar and percentage
3. **Rate Limit Countdown** - Show the countdown timer when daily limit is reached
4. **Settings Dialog** - Show tabbed configuration options (General, API, Automation, Presets)
5. **Batch Operations** - Show multiple prompts selected with batch action buttons
6. **Auto-Download Notification** - Show media being downloaded automatically

### Screenshot Best Practices

- Use a clean Sora.com page in the background for context
- Show actual prompts (not placeholder text)
- Capture both light and dark mode if possible
- Highlight unique features like side panel and rate limit countdown

---

## 9. CONTACT INFORMATION

### Support URL

```
https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues
```

### Privacy Policy URL

```
https://github.com/YosefHayim/extension-sora-auto-queue-prompts/blob/main/PRIVACY-POLICY.md
```

---

## 10. COMMON REJECTION REASONS TO AVOID

### ⚠️ DataDog Host Permission

The `browser-intake-datadoghq.com` permission may raise questions. Be prepared to:

- Explain it's for completion detection only (30s silence = generation complete)
- Emphasize no request content is read or modified
- Point out the extension uses `onCompleted` only (not `onBeforeRequest`)

### ⚠️ webRequest Permission

This is a sensitive permission. Reviewers will check:

- That you only observe, not modify requests
- That it's necessary for core functionality (completion detection)
- That justification is clear and specific

### ✅ Single Purpose - PASS

The extension has a clear single purpose: "Automate Sora AI prompt queue management"
All features support this: queue management, prompt generation, auto-download, rate limit tracking.

### ✅ No Remote Code - PASS

All JavaScript is bundled locally. No eval(), no external script loading.

### ✅ Privacy Policy - PASS

Comprehensive privacy policy exists at PRIVACY-POLICY.md.

---

## 11. PROMOTIONAL ASSETS REQUIREMENTS

| Asset               | Size                | Required                | Status            |
| ------------------- | ------------------- | ----------------------- | ----------------- |
| Extension Icon      | 128×128px           | Yes                     | ✅ `icon128.png`  |
| Small Promo Tile    | 440×280px           | Yes                     | ❌ Need to create |
| Screenshots (min 1) | 1280×800 or 640×400 | Yes                     | ❌ Need to create |
| Marquee Promo       | 1400×560px          | No (featured placement) | Optional          |
| Promotional Video   | YouTube URL         | No                      | Optional          |

---

## 12. CHECKLIST BEFORE SUBMISSION

### Assets

- [ ] Screenshots created (minimum 1, recommended 5)
- [ ] Small promo tile created (440×280px PNG/JPEG)
- [ ] All screenshots show real functionality (not mockups)

### Code & Build

- [ ] Version number updated in wxt.config.ts
- [ ] `pnpm run build` completes successfully
- [ ] `pnpm test` all tests pass
- [ ] `pnpm exec tsc --noEmit` no TypeScript errors
- [ ] ZIP package created: `pnpm wxt zip`

### Documentation

- [ ] PRIVACY-POLICY.md is current
- [ ] CHANGELOG.md updated with new features
- [ ] All permissions have justifications ready (see Section 2)
- [ ] Host permissions have justifications ready (see Section 3)

### Testing

- [ ] Extension tested on latest Chrome stable
- [ ] Side panel opens and functions correctly
- [ ] Rate limit countdown displays properly
- [ ] Auto-download works when enabled
- [ ] All queue operations work (start, pause, resume, stop)

### Privacy Dashboard Answers Ready

- [ ] "Does your extension collect user data?" → No (local storage only)
- [ ] Data types collected → None transmitted to developer servers
- [ ] Third-party data sharing → Only user-configured services
- [ ] All certification checkboxes can be selected
