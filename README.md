# Sora Auto Queue Prompts

> **Automate prompt generation and queue management for Sora AI video/image generation**

A powerful Chrome extension that eliminates the tedious manual work of creating, organizing, and submitting prompts to Sora AI. Generate hundreds of AI-optimized prompts instantly, manage them efficiently, and automate the submission process with intelligent anti-bot delays.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [CSV Format](#-csv-format)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 The Problem

If you're working with Sora AI for video or image generation, you've likely encountered these frustrations:

### Manual Prompt Creation is Tedious
- **Time-consuming**: Manually writing dozens or hundreds of prompts takes hours
- **Quality inconsistency**: Hard to maintain consistent prompt quality and style across batches
- **Creative bottleneck**: Coming up with unique variations exhausts creativity quickly

### Queue Management is Painful
- **Repetitive clicking**: Submitting each prompt individually to Sora is mind-numbing
- **No organization**: No way to track which prompts are pending, processing, or completed
- **Lost work**: Accidentally close the tab? Your prompts are gone

### Bulk Operations Don't Exist
- **No import/export**: Can't easily share prompt collections or back them up
- **No editing**: Spot a typo in a prompt? Start over
- **No automation**: Queue processing requires constant manual attention

### Risk of Bot Detection
- **Rapid submissions flagged**: Submitting prompts too quickly can trigger anti-bot measures
- **Manual delays are imprecise**: Trying to space out submissions manually is unreliable

---

## ✨ The Solution

**Sora Auto Queue Prompts** transforms the Sora workflow from manual drudgery into an automated, intelligent system:

### 🤖 AI-Powered Prompt Generation
- Generate **10-200 prompts** in seconds using GPT-4
- **Enhanced mode** automatically optimizes prompts with cinematography/photography techniques
- Maintains consistent style and quality across entire batches

### 📊 Smart Queue Management
- Visual queue with **real-time status tracking** (pending, processing, completed)
- **Pause/resume** functionality for complete control
- Automatic submission to Sora with configurable anti-bot delays
- Never lose work—everything is stored locally

### 🔄 Flexible Input Methods
1. **AI Generation**: Describe what you want, get hundreds of prompts
2. **Manual Entry**: Paste your own prompts, one per line
3. **CSV Import**: Bulk upload with full metadata (type, aspect ratio, variations, presets)

### ⚙️ Advanced Features
- **Per-prompt customization**: Different settings for each prompt (aspect ratio, variations, media type)
- **In-queue editing**: Edit, refine, duplicate, or delete prompts without stopping the queue
- **Auto-regeneration**: Automatically generate new batches when queue runs empty
- **CSV export**: Back up your prompts or share collections

---

## 🚀 Key Features

### Prompt Generation
- ✅ **AI-Powered**: Use GPT-4 to generate creative, high-quality prompts
- ✅ **Enhanced Prompts**: Automatically optimize with technical cinematography details
- ✅ **Custom Batch Sizes**: Generate 10, 25, 50, 100, or any custom number
- ✅ **Media Type Selection**: Video or Image generation support
- ✅ **Variation Control**: 2 or 4 variations per prompt

### Queue Management
- ✅ **Auto-Queue Processing**: Automatically submit prompts to Sora
- ✅ **Pause/Resume**: Full control over queue execution
- ✅ **Anti-Bot Delays**: Random delays (configurable 2-60 seconds) between submissions
- ✅ **Status Tracking**: Real-time monitoring of pending/processing/completed prompts
- ✅ **Queue Persistence**: Never lose your work—prompts saved locally

### Prompt Editing
- ✅ **In-Queue Editing**: Modify prompts without restarting
- ✅ **AI Refinement**: Let AI enhance individual prompts
- ✅ **Duplication**: Create exact copies with one click
- ✅ **Generate Similar**: AI creates variations based on existing prompts
- ✅ **Bulk Operations**: Delete, export, or clear prompts in batches

### Data Management
- ✅ **CSV Import**: 5-column format (prompt, type, aspect_ratio, variations, preset)
- ✅ **CSV Export**: Back up prompts with full metadata
- ✅ **Template Download**: Get CSV template for easy formatting
- ✅ **History Tracking**: Keep records of completed prompts

### Advanced Configuration
- ✅ **Per-Prompt Settings**: Aspect ratio, variations, media type, presets
- ✅ **Auto-Generate on Empty**: Endless prompt generation
- ✅ **Auto-Generate on Received**: Supplement manual prompts with AI
- ✅ **Debug Logging**: Comprehensive logging system for troubleshooting

---

## 📦 Installation

### For Users (Chrome Web Store)
*Coming soon—extension is currently in development*

### For Developers (Manual Install)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git
   cd extension-sora-auto-queue-prompts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

---

## 🎬 Quick Start

### 1. Set Up Your API Key
1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Click the extension icon in Chrome
3. Go to the **Generate** tab
4. Enter your API key (starts with `sk-`)

### 2. Generate Prompts with AI
1. In the **Generate** tab, enter a context prompt:
   ```
   Cinematic underwater scenes featuring bioluminescent marine life
   ```
2. Select batch size (e.g., 50)
3. Choose media type (Video or Image)
4. Enable "Enhanced Prompts" for AI optimization
5. Click **Generate Prompts**

### 3. Start the Queue
1. Switch to the **Queue** tab
2. Review your prompts
3. Open `sora.com` in another tab
4. Click **Start Queue**
5. The extension will automatically submit prompts with random delays

### 4. Monitor Progress
- Watch real-time status updates in the Queue tab
- Pause/Resume as needed
- Edit prompts in-queue without stopping

---

## 🔧 How It Works

### Architecture Overview

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

### Workflow

1. **Prompt Generation**
   - User provides context → Sent to OpenAI GPT-4 API
   - AI generates batch of prompts → Stored locally in Chrome storage
   - Optional: Enhanced mode adds technical cinematography details

2. **Queue Processing**
   - User starts queue → Background worker activates
   - For each prompt:
     - Content script injects into `sora.com` tab
     - Simulates human typing (30-80ms delays between characters)
     - Submits prompt to Sora
     - Waits for completion (monitors loader elements)
     - Marks prompt as completed
     - Waits random delay (anti-bot protection)
     - Processes next prompt

3. **Data Persistence**
   - All prompts stored in Chrome local storage
   - Survives browser restarts
   - History maintained (configurable limit)
   - Export to CSV for backups

---

## ⚙️ Configuration

### Batch Size
- **Presets**: 10, 25, 50, 100
- **Custom**: Enter any number (1-200)

### Media Type
- **Video**: Optimized for Sora video generation
- **Image**: Optimized for Sora image generation

### Variations
- **2 variations**: Standard (faster, cheaper)
- **4 variations**: More options per prompt

### Enhanced Prompts
When enabled, AI adds technical details:
- **Video**: Camera movements, lighting, color grading, cinematic techniques
- **Image**: Photography composition, aperture, focal length, lighting setup

### Anti-Bot Delays
- **Min Delay**: 2-30 seconds (default: 2s)
- **Max Delay**: 5-60 seconds (default: 5s)
- Random delay chosen between min/max for each prompt

### Auto-Generation
- **On Empty**: Generate new batch when queue finishes
- **On Received**: Generate additional prompts when manual/CSV prompts added

---

## 📊 CSV Format

### Import Format (5 Columns)

```csv
prompt,type,aspect_ratio,variations,preset
"A cinematic shot of underwater coral reef with sunlight rays",video,16:9,4,cinematic
"Portrait of a woman in golden hour light",image,4:3,2,realistic
"Animated character walking through enchanted forest",video,16:9,4,animated
"Abstract geometric patterns in vibrant colors",image,1:1,2,artistic
```

### Column Definitions

| Column | Type | Values | Required |
|--------|------|--------|----------|
| **prompt** | string | Any text | ✅ Yes |
| **type** | string | `video`, `image` | ❌ Optional (defaults to config) |
| **aspect_ratio** | string | `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `21:9` | ❌ Optional |
| **variations** | number | `2`, `4` | ❌ Optional (defaults to 2) |
| **preset** | string | `cinematic`, `documentary`, `artistic`, `realistic`, `animated`, `none` | ❌ Optional |

### Download Template
Click **Download Template** in the CSV tab to get a pre-formatted CSV file.

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/YosefHayim/extension-sora-auto-queue-prompts.git
cd extension-sora-auto-queue-prompts

# Install dependencies
npm install

# Run in development mode (watch mode)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Project Structure

```
src/
├── popup.tsx              # Main UI (React)
├── popup.css              # Popup styles
├── background.ts          # Background service worker
├── content.ts             # Sora page interaction script
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    ├── storage.ts         # Chrome storage abstraction
    ├── promptGenerator.ts # OpenAI API integration
    ├── csvParser.ts       # CSV import/export
    ├── queueProcessor.ts  # Queue automation
    ├── promptActions.ts   # Prompt editing actions
    └── logger.ts          # Debug logging system

tests/
├── setup.ts              # Test configuration
└── utils/                # Unit tests (mirror src/)

assets/
├── popup.html            # Popup HTML
└── popup.css             # Popup styles

icons/
└── icon*.png             # Extension icons
```

### Technology Stack

- **Build**: esbuild (custom build matching navigator extension architecture)
- **Language**: TypeScript 5.3
- **UI**: React 18
- **Testing**: Jest + React Testing Library
- **API**: OpenAI Chat Completions API (GPT-4)
- **Storage**: Chrome Storage API

### Build Process

The extension uses esbuild to bundle three entry points:
1. `src/background.ts` → `dist/background.js` (service worker, IIFE format)
2. `src/popup.tsx` → `dist/popup.js` (popup UI, IIFE format)
3. `src/content.ts` → `dist/content.js` (content script, IIFE format)

All bundles target Chrome 90+ with ES2020 output.

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: Fix bugs or implement features
4. **Improve Documentation**: Help make our docs clearer
5. **Share Feedback**: Tell us how you use the extension

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Write/update tests**: Ensure `npm test` passes
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (TypeScript strict mode)
- Write tests for new functionality (70%+ coverage required)
- Update documentation for user-facing changes
- Keep commits focused and well-described
- Test the extension in Chrome before submitting

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📋 Roadmap

### Current Version (v1.0)
- ✅ AI-powered prompt generation
- ✅ Queue management with pause/resume
- ✅ CSV import/export
- ✅ In-queue prompt editing
- ✅ Anti-bot delay system
- ✅ Enhanced prompts mode

### Planned Features
- [ ] Chrome Web Store publication
- [ ] Multi-provider AI support (Anthropic Claude, local LLMs)
- [ ] Prompt templates library
- [ ] Advanced queue scheduling
- [ ] Direct Sora integration (auto-fill prompt fields)
- [ ] Prompt analytics dashboard
- [ ] Team collaboration features
- [ ] Multi-language support

---

## 🐛 Known Issues

- Content script selectors may need updates if Sora UI changes
- Queue processing requires active Sora tab to remain open
- Large queues (1000+ prompts) may impact performance

---

## 💰 Cost Estimation

### OpenAI API Costs (GPT-4)
- **50 prompts**: ~$0.02-$0.05 USD
- **100 prompts**: ~$0.04-$0.10 USD
- **Custom batches**: Scales linearly

*Costs based on GPT-4 pricing as of 2025. Actual costs may vary.*

---

## 🔐 Privacy & Security

- **API keys** are stored locally in Chrome storage (encrypted at rest)
- **Prompts** never leave your device except to OpenAI API
- **No telemetry** or analytics tracking
- **No external servers**—everything runs client-side
- **Open source**—audit the code yourself

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [esbuild](https://esbuild.github.io/) for lightning-fast builds
- Powered by [OpenAI GPT-4](https://openai.com/) for intelligent prompt generation
- UI built with [React](https://reactjs.org/)
- Inspired by the creative Sora AI community

---

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YosefHayim/extension-sora-auto-queue-prompts/discussions)
- **Email**: [Create an issue for support requests]

---

## ⭐ Show Your Support

If this extension helps your Sora workflow, please consider:
- ⭐ **Starring the repository**
- 🐛 **Reporting bugs** you encounter
- 💡 **Suggesting features** you'd like to see
- 🤝 **Contributing code** or documentation
- 📢 **Sharing with others** who might find it useful

---

**Made with ❤️ for the Sora AI creative community**
