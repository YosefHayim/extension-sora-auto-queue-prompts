# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
