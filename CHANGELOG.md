# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-01-29

### Added

- **Chrome Web Store Launch**: Complete professional branding ready for store submission.
- **14-Day Free Trial**: Full feature access without credit card requirement.
- **$0.99 Lifetime Access**: One-time payment pricing model for unlimited use.
- **5 Promotional Thumbnails (1280x800)**: Hero, Magic Moment, Secondary Power, Workflow Integration, Trust & CTA.
- **Small Promotional Image (440x280)**: Compact store listing asset.
- **Marquee Promotional Banner (1400x560)**: Featured store placement asset.
- **Logo Assets**: 500x500 and 128x128 app icons with sparkles branding.

### Changed

- **Brand Identity Redesign**: Clean black/white/gray design system replacing blue accents.
- **Logo Update**: Sparkles icon replacing zap icon for consistent branding.
- **Store Messaging**: Focus on "Never Miss a Sora Generation" value proposition.
- **Trust Indicators**: Manifest V3 compliant, Privacy First, Open Source badges.

### Marketing

- Consistent visual language across all 9 Chrome Web Store assets.
- Benefit-driven headlines and feature showcases.
- Social proof with 50+ users, 1,000+ prompts, 4.9 rating display.
- Clear CTA: "Start 14-Day Free Trial" with "No credit card required".

## [2.5.0] - 2025-01-14

### Added

- **Side Panel UI**: New dedicated side panel mode for persistent queue visibility while working on Sora. Access via the extension icon menu or keyboard shortcut.
- **Preset System**: Save and load prompt configuration presets for quick switching between different generation styles and settings.
- **Onboarding Tour**: Interactive guided tour for new users to quickly learn extension features.
- **Batch Operations Panel**: New panel for managing multiple prompts at once with select-all, bulk delete, and batch enable/disable.
- **Queue Insertion Picker**: Choose exactly where new prompts are inserted in the queue (top, bottom, or after specific prompt).
- **Insertion Indicator**: Visual indicator showing where dragged prompts will land in the queue.
- **Priority Badges**: Visual priority indicators on prompt cards for quick status recognition.
- **Queue Sort Menu**: Sort prompts by status, priority, date added, or alphabetically.
- **Auto-Download Feature**: Automatically download generated images and videos when generation completes.
- **Bulk Download**: Download all visible media from your Sora library with one click.
- **Enhanced API Interceptor**: Dual completion detection (API primary, DOM fallback) for more reliable processing.
- **Direct Progress Tracking**: Real-time progress percentage extracted directly from Sora API responses.
- **Radio Group Component**: New UI component for single-selection option groups.
- **Select Component**: Enhanced dropdown select component with better accessibility.

### Changed

- **Settings Dialog Redesign**: Reorganized into tabbed interface (General, API Keys, Automation, Presets) for better organization.
- **PromptCard Improvements**: Enhanced visual feedback, better action menus, and improved image handling.
- **Footer Enhancement**: Added preset selector and improved layout.
- **Focus Ring Styling**: Thicker, more visible focus rings (3px) with theme-aware colors for better accessibility.
- **Toast Notifications**: Improved styling with better dark mode support.
- **Storage Improvements**: Enhanced storage utilities with preset support and better type safety.

### Fixed

- **Completion Detection Timing**: Fixed race conditions in generation completion detection.
- **Checkbox Visibility**: Fixed visibility issues with selection checkboxes in dark mode.
- **Flex-Wrap Issues**: Fixed layout wrapping problems in queue controls.
- **Add Prompts Button**: Fixed button behavior and disabled states.
- **Textarea Ready Check**: Removed false positive textarea readiness detection.
- **Missing ARIA Selector**: Added missing aria-live selector for accessibility.

### Technical

- 10+ new React components for enhanced UI modularity.
- Comprehensive test coverage for new features (SettingsDialog, QueueControls, PromptCard).
- TypeScript interfaces for Sora API response types.
- Improved error logging with task state snapshots.
- New downloader utility (`src/utils/downloader.ts`) for media handling.

## [2.3.0] - 2025-01-10

### Added

- **Local Image Upload Support**: Upload images directly from your device to use with prompts, leveraging Sora's native file upload. Images are stored temporarily as base64 and automatically cleaned up after processing.
- **API Response Monitoring**: Real-time monitoring of Sora API responses to detect successful submissions and rate limit errors.
- **Rate Limit Detection**: Automatic detection of daily task limits with queue pause and browser notification alerts.
- **Keyboard Shortcuts**: Ctrl+Enter / Cmd+Enter support for quick form submission across all dialog textareas (Generate, Manual Add, Edit, Settings).
- **Image Upload Waiting**: Queue processor waits for image uploads to complete before submitting prompts.
- **Browser Notifications**: Native browser notifications for rate limit warnings.

### Changed

- CSV export now includes `image_url` column for better data portability.
- Improved image handling in PromptCard with support for both cloud URLs and local files.

### Technical

- Added `imageData`, `imageName`, `imageType` fields to GeneratedPrompt type.
- Implemented fetch interceptor in content script for API monitoring.
- Added `notifications` permission to manifest.

## [2.2.0] - 2025-01-08

### Added

- Drag-and-drop queue reordering with `@dnd-kit` library.
- Debug Panel tab for comprehensive real-time logging.
- Component-level categorized logging (queue, api, ui, content).
- Export logs functionality for troubleshooting.
- Real-time storage change listeners replacing polling.

### Changed

- Improved queue management UX with 8px drag activation distance.
- Optimistic UI updates before storage persistence.
- 100ms debouncing for batch storage operations.

## [2.1.0] - 2025-01-05

### Added

- Media type auto-detection from Sora page.
- Aspect ratio and variation settings detection.
- Settings sync to Sora page when changed in extension.

### Changed

- Improved status tracking accuracy.
- Fixed progress bar interval issues.
- Enhanced dropdown menu z-index handling.

## [2.0.0] - 2025-01-01

### Added

- Complete UI/UX redesign with Shadcn UI components.
- 18 modular React components replacing monolithic architecture.
- Multi-provider AI support (OpenAI, Anthropic, Google).
- CSV import/export functionality.
- Bulk operations (select, enable/disable, delete multiple).
- Search and filter capabilities.
- Dark/Light mode with system preference detection.
- Error boundary with recovery options.
- E2E testing with Playwright.

### Changed

- Refactored from 804-line monolithic component to component-based architecture.
- Migrated to WXT build framework.
- Improved TypeScript strict mode compliance.

### Technical

- React 18, TypeScript 5.3, Tailwind CSS 3.4.
- Jest 29 with React Testing Library.
- GitHub Actions CI/CD pipeline.

## [1.0.1] - 2024-12-15

### Changed

- Migrated from npm to pnpm package manager.
- Updated Husky to 9.1.7.
- Updated CI/CD workflows for pnpm.

## [1.0.0] - 2024-12-01

### Added

- Initial release.
- AI-powered prompt generation via OpenAI GPT-4.
- Automated queue processing with human-like typing.
- Anti-bot protection with configurable delays.
- Chrome storage for persistent configuration.
- 93.82% test coverage.
- Husky pre-push hooks.
- GitHub Actions CI/CD.
