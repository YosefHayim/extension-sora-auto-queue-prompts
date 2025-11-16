# Gemini AI Development Guide

## Project Overview for Gemini

**Project Name**: Sora Auto Queue Prompts
**Type**: Browser Extension (Chrome/Chromium)
**Framework**: Plasmo
**Purpose**: Automate prompt generation and queue management for Sora AI

## Quick Start for Gemini

When working on this codebase, here's everything you need to know:

### Project Structure at a Glance

```
sora-auto-queue-prompts/
├── src/
│   ├── popup.tsx              # Main user interface
│   ├── background.ts          # Background processing
│   ├── types/index.ts         # All TypeScript types
│   └── utils/
│       ├── storage.ts         # Data persistence
│       ├── promptGenerator.ts # AI integration
│       └── csvParser.ts       # File handling
├── tests/                     # Unit tests
└── config files               # package.json, tsconfig.json, etc.
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Plasmo | Browser extension development |
| Language | TypeScript | Type-safe development |
| UI Library | React 18 | User interface |
| Testing | Jest + RTL | Unit testing |
| API | OpenAI GPT-4 | Prompt generation |
| Storage | Chrome Storage API | Data persistence |

## Core Functionality

### 1. Prompt Generation Methods

The extension offers three distinct ways to add prompts:

#### A. AI-Powered Generation
```typescript
// Flow: User Context → OpenAI API → Generated Prompts → Queue
const generator = new PromptGenerator(apiKey);
const result = await generator.generatePrompts({
  context: "underwater scenes",
  count: 50,
  mediaType: "video"
});
```

**Configuration Options:**
- Batch size: 10, 25, 50, or 100 prompts
- Media type: Video or Image
- Variation count: 2 or 4 variations per prompt

#### B. Manual Entry
```typescript
// User pastes text (one prompt per line)
// Parsed and added to queue immediately
```

#### C. CSV Import
```typescript
// CSV format:
// prompt
// "First prompt text"
// "Second prompt text"
const result = await CSVParser.parseFile(file);
```

### 2. Data Models

```typescript
// Main configuration object
interface PromptConfig {
  contextPrompt: string;      // User's context for generation
  apiKey: string;             // OpenAI API key
  batchSize: number;          // 10, 25, 50, or 100
  mediaType: 'video' | 'image';
  variationCount: 2 | 4;
  autoRun: boolean;           // Auto-queue feature
}

// Individual prompt in queue
interface GeneratedPrompt {
  id: string;                 // Unique identifier
  text: string;               // The actual prompt
  timestamp: number;          // Creation time
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mediaType: 'video' | 'image';
}
```

### 3. Storage Architecture

Uses Chrome's local storage API with the following schema:

```typescript
{
  config: PromptConfig,        // User settings
  prompts: GeneratedPrompt[],  // Current queue
  history: GeneratedPrompt[]   // Completed prompts (max 1000)
}
```

**Key Operations:**
- `storage.getConfig()` - Load user configuration
- `storage.addPrompts(prompts)` - Add to queue
- `storage.updatePrompt(id, updates)` - Update status
- `storage.clearPrompts()` - Clear queue

## Development Guidelines

### Adding New Features

1. **Define types** in `src/types/index.ts`
2. **Implement logic** in appropriate utility file
3. **Update UI** in `src/popup.tsx`
4. **Write tests** in `tests/`
5. **Update docs**

### Code Quality Standards

- **Type Safety**: All functions must have explicit types
- **Testing**: 70%+ code coverage required
- **Error Handling**: Always handle API and storage errors
- **User Feedback**: Show loading states and error messages

### Testing Approach

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage Areas:**
- ✅ Storage operations (mocked Chrome API)
- ✅ API integration (mocked fetch)
- ✅ CSV parsing (edge cases)
- ✅ Utility functions (all paths)

## Common Development Scenarios

### Scenario 1: Modify AI Prompt Generation

**File**: `src/utils/promptGenerator.ts`

To change how prompts are generated:

```typescript
// System prompt template (line ~20)
messages: [
  {
    role: 'system',
    content: `You are a creative prompt generator for Sora AI...`
    // ↑ Modify this to change generation style
  }
]
```

**Parameters to adjust:**
- `temperature`: 0.7-1.0 (higher = more creative)
- `max_tokens`: 1000-3000 (longer = more detailed)
- `model`: 'gpt-4' or 'gpt-3.5-turbo'

### Scenario 2: Add New Configuration Option

1. Update `PromptConfig` interface in `src/types/index.ts`
2. Add default value in `src/utils/storage.ts`
3. Add UI control in `src/popup.tsx`
4. Update tests

Example:
```typescript
// 1. Add to interface
interface PromptConfig {
  // ... existing fields
  customField: string;
}

// 2. Add default
const DEFAULT_CONFIG: PromptConfig = {
  // ... existing defaults
  customField: 'default value',
};

// 3. Add UI
<input
  value={config.customField}
  onChange={(e) => handleConfigUpdate({ customField: e.target.value })}
/>
```

### Scenario 3: Improve CSV Handling

**File**: `src/utils/csvParser.ts`

Current features:
- ✅ Quote escaping
- ✅ Empty line filtering
- ✅ Header detection
- ✅ Export functionality

To add multi-line support:
```typescript
// Modify parseContent() to handle newlines within quotes
```

### Scenario 4: Optimize Performance

**Areas to focus on:**

1. **Large Queues**: Implement pagination
   ```typescript
   // In popup.tsx, show only 50 prompts at a time
   const visiblePrompts = prompts.slice(0, 50);
   ```

2. **Storage**: Use indexed storage for 1000+ items
   ```typescript
   // Switch from array to object with ID keys
   { [id: string]: GeneratedPrompt }
   ```

3. **API Calls**: Add debouncing for user input
   ```typescript
   const debouncedUpdate = useMemo(
     () => debounce(handleConfigUpdate, 500),
     []
   );
   ```

## API Integration Details

### OpenAI API Usage

**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Request Format**:
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a prompt generator..."},
    {"role": "user", "content": "user's context"}
  ],
  "temperature": 0.9,
  "max_tokens": 2000
}
```

**Cost Estimation**:
- 50 prompts ≈ $0.02-$0.05
- 100 prompts ≈ $0.04-$0.10
- Based on GPT-4 pricing

**Error Handling**:
```typescript
// Common errors to handle:
// 1. Invalid API key (401)
// 2. Rate limit (429)
// 3. Network failure
// 4. Invalid response format
```

### Alternative AI Providers

To add support for other providers (e.g., Anthropic Claude):

1. Create `src/utils/claudeGenerator.ts`
2. Implement same interface as `PromptGenerator`
3. Add provider selection in UI
4. Update tests

## Security & Privacy

### Data Handling

- **API Keys**: Stored in Chrome local storage (encrypted at rest)
- **Prompts**: Never leave user's device except to OpenAI
- **History**: Kept locally, max 1000 items
- **No Telemetry**: No analytics or tracking

### Best Practices

```typescript
// ✅ Good: Validate before storage
if (generator.validateApiKey()) {
  await storage.setConfig({ apiKey });
}

// ❌ Bad: Store without validation
await storage.setConfig({ apiKey: userInput });
```

## Extension Publishing

### Pre-Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Icons prepared (16x16, 48x48, 128x128)
- [ ] Screenshots for store listing
- [ ] Privacy policy written
- [ ] Version bumped in `package.json`

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Create distributable package
npm run package
```

## Debugging Guide

### Chrome Extension Debugging

1. **Popup Issues**
   - Right-click extension icon
   - Select "Inspect popup"
   - Check Console and Network tabs

2. **Background Worker Issues**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "Inspect views: service worker"

3. **Storage Issues**
   - DevTools → Application → Storage → Local Storage
   - Or run: `chrome.storage.local.get(null, console.log)`

### Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Prompts not generating | Invalid API key | Validate key format (sk-...) |
| CSV upload fails | Encoding issue | Ensure UTF-8 encoding |
| Storage quota exceeded | Too many prompts | Clear history or implement pagination |
| UI not updating | State not refreshing | Call `loadData()` after changes |

## Future Enhancement Ideas

### Short Term (1-2 weeks)

1. **Prompt Templates Library**
   - Pre-built templates for common scenarios
   - User-created template saving

2. **Queue Filtering**
   - Search prompts
   - Filter by status
   - Sort by timestamp

3. **Export Options**
   - JSON export
   - Plain text export
   - Clipboard copy

### Medium Term (1-2 months)

1. **Multi-Provider Support**
   - Anthropic Claude integration
   - Local LLM support
   - Provider comparison

2. **Advanced Queue Management**
   - Drag-and-drop reordering
   - Batch status updates
   - Scheduled generation

3. **Analytics Dashboard**
   - Generation success rates
   - Cost tracking
   - Usage statistics

### Long Term (3+ months)

1. **Sora Integration**
   - Auto-fill prompts in Sora UI
   - Track generated videos
   - Result comparison

2. **Collaboration Features**
   - Share prompt collections
   - Team workspaces
   - Prompt versioning

3. **Advanced AI Features**
   - Prompt optimization suggestions
   - Style transfer between prompts
   - Automatic variation generation

## Working Effectively with Gemini

### Best Practices for Prompts

**Effective:**
- "Add JSON export feature to the CSV tab"
- "Fix quote escaping in CSV parser for edge case where..."
- "Optimize storage layer to handle 10,000+ prompts"
- "Write integration test for background worker message handling"

**Less Effective:**
- "Improve the code"
- "Make it faster"
- "Add more features"

### Context to Provide

When asking for help:
1. Specific file paths
2. Error messages (full stack trace)
3. What you've already tried
4. Expected vs actual behavior
5. Relevant code snippets

## Additional Resources

- **Plasmo Docs**: https://docs.plasmo.com/
- **Chrome API**: https://developer.chrome.com/docs/extensions/
- **OpenAI API**: https://platform.openai.com/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Jest**: https://jestjs.io/docs/getting-started

---

**Last Updated**: November 2025
**Maintained By**: YosefHayim
**Status**: Active Development
