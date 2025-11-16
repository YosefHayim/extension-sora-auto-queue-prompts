# Claude AI Development Guide

## Project Overview for Claude

This is the **Sora Auto Queue Prompts** browser extension - a tool to automate prompt generation and queue management for Sora AI.

### Quick Context

When working on this project with Claude AI, here's what you need to know:

## Architecture

### Core Components

1. **Popup UI** (`src/popup.tsx`)
   - React-based interface with 3 tabs: Generate, Manual, CSV
   - Manages user configuration and displays queue status
   - Handles user interactions for all prompt input methods

2. **Background Service Worker** (`src/background.ts`)
   - Handles message passing between popup and content scripts
   - Manages prompt generation requests
   - Tracks prompt status (pending → processing → completed)

3. **Storage Layer** (`src/utils/storage.ts`)
   - Abstracts Chrome storage API
   - Manages config, prompts, and history
   - Implements queue operations

4. **Prompt Generator** (`src/utils/promptGenerator.ts`)
   - Integrates with OpenAI Chat Completions API
   - Generates creative prompts based on context
   - Validates API keys and handles errors

5. **CSV Parser** (`src/utils/csvParser.ts`)
   - Imports prompts from CSV files
   - Exports current queue to CSV format
   - Handles quote escaping and formatting

### Data Flow

```
User Input (Popup)
    ↓
Background Worker (Message Handler)
    ↓
OpenAI API (if using Generate)
    ↓
Storage Layer (Chrome Storage)
    ↓
Queue Management
    ↓
Status Updates (UI)
```

## Development Workflow

### Common Tasks

#### Adding a New Feature

1. Update types in `src/types/index.ts`
2. Implement logic in appropriate utility file
3. Add UI controls in `src/popup.tsx`
4. Write unit tests in `tests/`
5. Update documentation

#### Modifying the API Integration

- Edit `src/utils/promptGenerator.ts`
- Update the system prompt for different generation styles
- Adjust temperature and token limits as needed

#### Changing Storage Schema

1. Update types in `src/types/index.ts`
2. Modify storage utilities in `src/utils/storage.ts`
3. Add migration logic if needed for existing users
4. Update all tests that use storage

### Testing Strategy

All utility functions have comprehensive unit tests:

- **Storage tests**: Mock Chrome storage API
- **Generator tests**: Mock fetch API
- **CSV tests**: Test parsing edge cases

Run tests before committing:
```bash
npm test
```

## Key Design Decisions

### Why Plasmo?

- Built-in HMR for rapid development
- TypeScript support out of the box
- Handles manifest generation automatically
- Simplifies Chrome extension boilerplate

### Why Chrome Storage?

- Persists across browser sessions
- Syncs across devices (if enabled)
- No external database needed
- Privacy-friendly (local-only)

### Why OpenAI GPT-4?

- Best prompt quality for creative generation
- Understands Sora-specific requirements
- Reliable API with good documentation
- Can be easily swapped for other models

## Common Issues & Solutions

### Issue: API Key Not Working

**Check:**
1. Key format (starts with `sk-`)
2. API access enabled for GPT-4
3. Billing account active
4. Network connectivity

**Fix:** Display clear error messages in UI

### Issue: Storage Quota Exceeded

**Check:**
1. Number of prompts in storage
2. History size (limited to 1000)

**Fix:** Implement periodic cleanup or user-triggered clear

### Issue: CSV Parse Errors

**Check:**
1. File encoding (should be UTF-8)
2. Quote escaping
3. Empty lines

**Fix:** Robust parser with error messages

## Code Style & Conventions

### TypeScript

- Use explicit types for all function parameters and returns
- Prefer interfaces over types for object shapes
- Use const assertions for literal types

### React

- Functional components only
- Use hooks for state management
- Keep components focused and small

### Testing

- Test behavior, not implementation
- Mock external dependencies (Chrome APIs, fetch)
- Aim for 70%+ code coverage

### File Organization

```
src/
  ├── popup.tsx           # UI components
  ├── background.ts       # Service worker
  ├── types/              # Type definitions
  └── utils/              # Reusable utilities

tests/
  └── utils/              # Unit tests (mirror src structure)
```

## Performance Considerations

### Storage Optimization

- Limit history to 1000 items
- Use indexed storage for large datasets
- Implement pagination for large lists

### API Rate Limiting

- Show loading states during generation
- Disable UI during requests
- Handle rate limit errors gracefully

### Memory Management

- Clear unused data from memory
- Limit concurrent operations
- Use React.memo for expensive components

## Security Best Practices

### API Key Handling

- Store in Chrome storage (encrypted at rest)
- Never log or expose in errors
- Use password input type in UI
- Validate format before storage

### User Data

- Store only necessary data
- Implement data export (CSV)
- Provide clear deletion options
- No telemetry or tracking

## Extension Publishing Checklist

Before submitting to Chrome Web Store:

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Icons and screenshots prepared
- [ ] Privacy policy written
- [ ] Permissions justified in manifest
- [ ] Version number updated
- [ ] Build optimized for production

## Future Enhancement Ideas

1. **Prompt Templates**
   - Pre-built templates for common use cases
   - User-saved templates
   - Template sharing

2. **Advanced Queue Management**
   - Priority ordering
   - Scheduled generation
   - Batch operations

3. **AI Provider Flexibility**
   - Support Anthropic Claude
   - Support local LLMs
   - Provider comparison mode

4. **Analytics & Insights**
   - Track generation success rates
   - Popular prompt patterns
   - Cost estimation per batch

5. **Integration Features**
   - Direct Sora web interface integration
   - Auto-fill detected prompt fields
   - Result tracking and management

## Debugging Tips

### Chrome Extension Debugging

1. **Popup issues**: Right-click extension icon → Inspect popup
2. **Background worker**: Go to `chrome://extensions/` → Inspect service worker
3. **Storage inspection**: Use Chrome DevTools → Application → Storage

### Common Debug Commands

```javascript
// Check storage contents
chrome.storage.local.get(null, console.log)

// Clear all storage
chrome.storage.local.clear()

// Send test message
chrome.runtime.sendMessage({ action: 'test' })
```

## Working with Claude

When asking Claude to help with this project:

### Good Prompts

✅ "Add a feature to export prompts as JSON"
✅ "Fix the CSV parser to handle multi-line prompts"
✅ "Write tests for the new queue ordering feature"
✅ "Optimize the storage layer for large datasets"

### Less Effective Prompts

❌ "Make it better"
❌ "Fix the bug" (without context)
❌ "Add AI" (too vague)

### Provide Context

- Mention specific files you're working with
- Share error messages or unexpected behavior
- Explain what you've already tried
- Reference existing patterns in the codebase

## Resources

- [Plasmo Documentation](https://docs.plasmo.com/)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [React Testing Library](https://testing-library.com/react)

---

Happy coding! 🚀
