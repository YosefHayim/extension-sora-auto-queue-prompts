# Logs Directory

This directory is used for debugging and troubleshooting the Sora Auto Queue Prompts extension.

## How Logging Works

The extension uses a comprehensive logging system that:
1. **Stores logs in Chrome storage** (up to 1000 entries)
2. **Outputs to browser console** with color-coded formatting
3. **Exports logs as text files** for debugging

## Log Levels

- **DEBUG** - Detailed information for debugging (gray)
- **INFO** - General information about operations (blue)
- **WARN** - Warning messages for potential issues (orange)
- **ERROR** - Error messages for failures (red)

## Viewing Logs

### In Browser Console
1. Open extension popup
2. Right-click and select "Inspect"
3. Go to Console tab
4. Logs are color-coded by level

### In Extension UI
1. Click extension icon
2. Go to "Debug" tab (if available)
3. View recent logs
4. Filter by level or category

### Export Logs
1. Open extension popup
2. Go to Settings or Debug panel
3. Click "Export Logs"
4. Save the `.txt` file
5. Share with developer or paste into debugging session

## Log Categories

The logger organizes logs by category:

- **queue** - Queue processing operations
- **api** - OpenAI API calls and responses
- **storage** - Chrome storage operations
- **prompt** - Prompt generation, editing, deletion
- **csv** - CSV import/export operations
- **ui** - User interface actions
- **extension** - Extension lifecycle events

## Example Log Entry

```
[2025-11-16T10:30:45.123Z] [INFO] [queue]
  Queue started

[2025-11-16T10:30:46.456Z] [DEBUG] [api]
  Request to /v1/chat/completions
  Data: {
    "model": "gpt-4",
    "messages": [...],
    "temperature": 0.9
  }

[2025-11-16T10:30:48.789Z] [ERROR] [api]
  API error: /v1/chat/completions
  Data: {
    "error": {
      "message": "Invalid API key",
      "type": "invalid_request_error"
    }
  }
  Stack: Error: Request failed
    at PromptGenerator.generatePrompts (promptGenerator.ts:173)
    at handleGeneratePrompts (background.ts:75)
```

## Debugging Workflow

When reporting issues:

1. **Reproduce the issue**
   - Perform the action that causes the problem

2. **Export logs**
   - Click "Export Logs" button
   - Save the file

3. **Share logs**
   - Paste log contents in issue report
   - Or attach the exported file

4. **Provide context**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Any error messages shown in UI?

## Common Issues & Logs

### API Key Invalid
```
[ERROR] [api] API error: /v1/chat/completions
  Data: { "error": { "message": "Invalid API key" } }
```
**Fix:** Check API key in settings

### Queue Not Processing
```
[INFO] [queue] Queue started
[ERROR] [queue] Prompt failed: prompt-123
  Data: { "error": "No pending prompts" }
```
**Fix:** Add prompts to queue first

### CSV Parse Error
```
[ERROR] [csv] CSV operation failed
  Data: { "error": "No valid prompts found in CSV file" }
```
**Fix:** Check CSV format matches template

### Storage Quota Exceeded
```
[ERROR] [storage] Storage error: write
  Data: { "error": "QUOTA_BYTES quota exceeded" }
```
**Fix:** Clear old prompts or history

## Programmatic Usage

```typescript
import { logger, log } from '~utils/logger';

// Basic logging
logger.info('myCategory', 'Operation completed');
logger.error('myCategory', 'Operation failed', { details }, error);

// Convenience functions
log.queue.start();
log.api.error('/endpoint', error);
log.prompt.generated(50, 'video');

// Get logs programmatically
const logs = await logger.getLogs({ level: 'error', limit: 50 });

// Export logs
await logger.exportLogs('debug-session.txt');

// Clear logs
await logger.clearLogs();
```

## Configuration

```typescript
logger.setConfig({
  maxLogs: 2000,           // Max logs to store
  enableConsole: true,     // Output to console
  enableStorage: true,     // Store in Chrome storage
  minLevel: 'info',        // Minimum level to log
});
```

## Privacy Note

Logs are stored locally in your browser and never sent to external servers. When sharing logs for debugging:
- **Remove sensitive data** like API keys
- **Review prompts** for personal information
- Logs can be cleared anytime from the extension

---

**Last Updated:** 2025-11-16
