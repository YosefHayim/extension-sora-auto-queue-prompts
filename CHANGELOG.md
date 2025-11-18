# Changelog

All notable changes to the Sora Auto Queue Prompts extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Task Master integration for project tracking
- Consolidated documentation structure in `/docs`
- Product Requirements Document (PRD) for future features

### Changed
- Reorganized documentation from root-level files to structured `/docs` folder
- Migrated from npm to pnpm for package management

## [1.0.1] - 2025-11-18

### Changed
- Migrated CI/CD from npm to pnpm
- Updated GitHub Actions workflow to use pnpm/action-setup@v4
- Replaced npm commands with pnpm equivalents across CI pipeline
- Updated package-lock.json to pnpm-lock.yaml

### Fixed
- Husky Git hooks now properly configured with pnpm

## [1.0.0] - 2025-11-18

### Added
- Initial release of Sora Auto Queue Prompts extension
- AI-powered prompt generation using OpenAI GPT-4
- Enhanced prompts mode with cinematography/photography optimization
- Queue management with pause/resume functionality
- Anti-bot delay system (configurable 2-60s random delays)
- CSV import/export with 5-column format
- In-queue prompt editing (edit, duplicate, generate similar, refine)
- Per-prompt customization (aspect ratio, variations, media type, presets)
- Auto-generation modes (on empty, on received)
- Chrome local storage persistence
- History tracking (configurable limit)
- Comprehensive debug logging system
- 93.82% test coverage
- GitHub Actions CI/CD pipeline with 90% coverage enforcement
- Husky pre-push hook for local coverage validation

### Features
- **Generate Tab**: AI prompt generation with GPT-4
- **Manual Tab**: Manual prompt entry (line-by-line)
- **CSV Tab**: Bulk import/export with metadata
- **Queue Tab**: Real-time queue monitoring and control
- **Settings Tab**: Configuration (delays, auto-generation)
- **Debug Tab**: System logs with export functionality

### Technical Details
- React 18.3.1 + TypeScript 5.3
- esbuild for fast bundling
- Jest + React Testing Library for testing
- Chrome Manifest V3
- Vanilla CSS (no frameworks)

---

## Future Releases (Planned)

### [1.1.0] - Planned

**Theme:** Quick Wins

#### Added
- Prompt Template Library with pre-built templates
- Community template sharing functionality
- Multi-Account & Workspace Management
- Workspace isolation for different projects
- Quick workspace switching

### [1.2.0] - Planned

**Theme:** Strategic Features

#### Added
- Live Result Capture & Asset Management
- Automatic download monitoring
- Asset library with thumbnails
- Search and filter generated assets
- A/B Testing & Performance Analytics
- Prompt effectiveness tracking
- Analytics dashboard with insights

### [1.3.0] - Planned

**Theme:** Advanced Features

#### Added
- Prompt Chain Workflows & Dependencies
- Multi-step prompt sequences
- Conditional prompt generation
- Smart Scheduling & Queue Optimization
- Time-based queue scheduling
- ML-based adaptive delays

### [2.0.0] - Planned

**Theme:** Collaboration & AI

#### Added
- Collaborative Prompt Sharing & Version Control (requires backend)
- Real-time collaboration features
- Team workspace functionality
- Cloud sync for multi-device access
- Advanced AI Features with TensorFlow.js
- Prompt quality prediction
- Style transfer between prompts

---

## Version History Summary

| Version | Date | Type | Key Features |
|---------|------|------|--------------|
| 1.0.0 | 2025-11-18 | Major | Initial release with core features |
| 1.0.1 | 2025-11-18 | Patch | pnpm migration |
| 1.1.0 | Planned | Minor | Templates & Workspaces |
| 1.2.0 | Planned | Minor | Asset Management & Analytics |
| 1.3.0 | Planned | Minor | Workflows & Scheduling |
| 2.0.0 | Planned | Major | Collaboration & Advanced AI |

---

## Release Notes Format

Each release will document:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## Contributing

When contributing, please:
1. Update this CHANGELOG with your changes
2. Follow semantic versioning guidelines
3. Group changes by type (Added, Changed, Fixed, etc.)
4. Include relevant issue/PR numbers
5. Update the version in `package.json` and `manifest.json`

---

## Links

- [GitHub Repository](https://github.com/YosefHayim/extension-sora-auto-queue-prompts)
- [Issues](https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues)
- [Product Roadmap](.taskmaster/docs/prd.txt)

---

**Maintained by:** Yosef Hayim Sabag
**License:** MIT
