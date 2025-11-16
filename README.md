# Sora Auto Queue Prompts

A powerful browser extension built with Plasmo framework that automates prompt generation and queueing for Sora AI (OpenAI's video/image generation tool).

## Features

### 🎯 Three Ways to Add Prompts

1. **AI-Powered Generation**: Use ChatGPT API to automatically generate creative prompts based on your context
2. **Manual Entry**: Paste prompts directly (one per line)
3. **CSV Import**: Bulk upload prompts from CSV files

### ⚙️ Flexible Configuration

- **Batch Sizes**: Generate 10, 25, 50, or 100 prompts at once
- **Media Types**: Support for both video and image generation
- **Variation Control**: Choose 2 or 4 variations per prompt
- **Auto-Queue**: Automatically queue prompts for processing

### 📊 Queue Management

- Real-time status tracking (pending, processing, completed)
- Export prompts to CSV for backup or sharing
- Clear queue with one click
- Historical tracking of completed prompts

## Installation

### For Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

### For Users

1. Download the latest release
2. Extract the ZIP file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `build/chrome-mv3-dev` folder

## Usage

### Setup

1. Click the extension icon to open the popup
2. Navigate to the "Generate" tab
3. Enter your OpenAI API key (starts with `sk-`)
4. Configure your preferences:
   - Batch size (how many prompts to generate)
   - Media type (video or image)
   - Variation count (2 or 4)

### Generate Prompts with AI

1. Enter a context prompt describing what kind of prompts you want
   - Example: "Create cinematic video prompts featuring underwater scenes with marine life"
2. Click "Generate Prompts"
3. Wait for the AI to generate your prompts
4. Prompts are automatically added to your queue

### Manual Entry

1. Switch to the "Manual" tab
2. Paste or type your prompts (one per line)
3. Click "Add Prompts"

### CSV Import/Export

**Import:**
1. Switch to the "CSV" tab
2. Click "Choose File" and select your CSV
3. CSV format should be:
   ```csv
   prompt
   "First prompt text"
   "Second prompt text"
   ```

**Export:**
1. Go to the "CSV" tab
2. Click "Export Current Prompts"
3. Save the CSV file

## Project Structure

```
sora-auto-queue-prompts/
├── src/
│   ├── popup.tsx              # Main popup UI
│   ├── popup.css              # Popup styles
│   ├── background.ts          # Background service worker
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── utils/
│       ├── storage.ts         # Chrome storage utilities
│       ├── promptGenerator.ts # AI prompt generation
│       └── csvParser.ts       # CSV import/export
├── tests/
│   ├── setup.ts              # Test configuration
│   └── utils/                # Unit tests for utilities
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Technology Stack

- **Framework**: [Plasmo](https://www.plasmo.com/) - The browser extension framework
- **Language**: TypeScript
- **UI**: React 18
- **Testing**: Jest + React Testing Library
- **API**: OpenAI GPT-4

## API Integration

This extension uses the OpenAI Chat Completions API to generate prompts. You'll need:

- An OpenAI API key (get one at [platform.openai.com](https://platform.openai.com/api-keys))
- API access enabled for GPT-4 (or modify to use GPT-3.5-turbo for lower costs)

**Cost Estimation:**
- Generating 50 prompts ≈ $0.02 - $0.05 USD
- Generating 100 prompts ≈ $0.04 - $0.10 USD

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Security & Privacy

- API keys are stored locally in your browser using Chrome's storage API
- No data is sent to any third-party servers except OpenAI's API
- All prompt generation happens client-side
- Your prompts and history are stored locally on your device

## Browser Compatibility

- Chrome/Chromium (recommended)
- Edge
- Brave
- Opera
- Any Chromium-based browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Roadmap

- [ ] Support for other AI providers (Anthropic Claude, etc.)
- [ ] Prompt templates library
- [ ] Advanced queue scheduling
- [ ] Integration with Sora web interface
- [ ] Prompt variation editor
- [ ] Multi-language support

## Credits

Built with love for the AI creative community.
