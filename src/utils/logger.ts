/**
 * Logger Utility for Sora Auto Queue Prompts
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Persistent storage in Chrome storage
 * - Export logs as text file
 * - Console output with formatting
 * - Automatic cleanup of old logs
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

interface LoggerConfig {
  maxLogs: number;
  enableConsole: boolean;
  enableStorage: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig = {
    maxLogs: 1000,
    enableConsole: true,
    enableStorage: true,
    minLevel: 'debug',
  };

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private async storeLogs(entry: LogEntry): Promise<void> {
    if (!this.config.enableStorage) return;

    try {
      const result = await chrome.storage.local.get('logs');
      const logs: LogEntry[] = (result && result.logs) ? result.logs : [];

      // Add new log
      logs.unshift(entry);

      // Keep only maxLogs entries
      const trimmedLogs = logs.slice(0, this.config.maxLogs);

      await chrome.storage.local.set({ logs: trimmedLogs });
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const timestamp = this.formatTimestamp(entry.timestamp);
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;

    const styles = {
      debug: 'color: #888',
      info: 'color: #2196F3',
      warn: 'color: #FF9800',
      error: 'color: #F44336; font-weight: bold',
    };

    switch (entry.level) {
      case 'debug':
        console.debug(`%c${prefix}`, styles.debug, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(`%c${prefix}`, styles.info, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(`%c${prefix}`, styles.warn, entry.message, entry.data || '');
        if (entry.stack) console.warn(entry.stack);
        break;
      case 'error':
        console.error(`%c${prefix}`, styles.error, entry.message, entry.data || '');
        if (entry.stack) console.error(entry.stack);
        break;
    }
  }

  private createEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack: error?.stack,
    };
  }

  debug(category: string, message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;

    const entry = this.createEntry('debug', category, message, data);
    this.logToConsole(entry);
    this.storeLogs(entry);
  }

  info(category: string, message: string, data?: any): void {
    if (!this.shouldLog('info')) return;

    const entry = this.createEntry('info', category, message, data);
    this.logToConsole(entry);
    this.storeLogs(entry);
  }

  warn(category: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog('warn')) return;

    const entry = this.createEntry('warn', category, message, data, error);
    this.logToConsole(entry);
    this.storeLogs(entry);
  }

  error(category: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog('error')) return;

    const entry = this.createEntry('error', category, message, data, error);
    this.logToConsole(entry);
    this.storeLogs(entry);
  }

  async getLogs(filter?: {
    level?: LogLevel;
    category?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    try {
      const result = await chrome.storage.local.get('logs');
      let logs: LogEntry[] = (result && result.logs) ? result.logs : [];

      // Apply filters
      if (filter?.level) {
        logs = logs.filter((log) => log.level === filter.level);
      }

      if (filter?.category) {
        logs = logs.filter((log) => log.category === filter.category);
      }

      if (filter?.limit) {
        logs = logs.slice(0, filter.limit);
      }

      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      // Don't log the clear action itself to avoid creating new logs
      await chrome.storage.local.set({ logs: [] });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  async exportLogs(filename?: string): Promise<void> {
    try {
      const logs = await this.getLogs();

      const logText = logs.map((log) => {
        const timestamp = this.formatTimestamp(log.timestamp);
        const dataStr = log.data ? `\n  Data: ${JSON.stringify(log.data, null, 2)}` : '';
        const stackStr = log.stack ? `\n  Stack: ${log.stack}` : '';

        return `[${timestamp}] [${log.level.toUpperCase()}] [${log.category}]\n  ${log.message}${dataStr}${stackStr}\n`;
      }).join('\n');

      // Convert to data URL for Chrome Downloads API
      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(logText);

      // Use Chrome Downloads API (works in service worker)
      await chrome.downloads.download({
        url: dataUrl,
        filename: filename || `sora-logs-${Date.now()}.txt`,
        saveAs: true
      });

      // Don't log the export action itself to avoid creating new logs
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions for common categories
export const log = {
  // Queue operations
  queue: {
    start: () => logger.info('queue', 'Queue started'),
    pause: () => logger.info('queue', 'Queue paused'),
    resume: () => logger.info('queue', 'Queue resumed'),
    stop: () => logger.info('queue', 'Queue stopped'),
    processing: (promptId: string, text: string) =>
      logger.debug('queue', `Processing prompt: ${promptId}`, { text }),
    completed: (promptId: string) =>
      logger.info('queue', `Prompt completed: ${promptId}`),
    failed: (promptId: string, error: any) =>
      logger.error('queue', `Prompt failed: ${promptId}`, { error }),
  },

  // API operations
  api: {
    request: (endpoint: string, data?: any) =>
      logger.debug('api', `Request to ${endpoint}`, data),
    response: (endpoint: string, success: boolean, data?: any) =>
      logger.debug('api', `Response from ${endpoint}: ${success ? 'success' : 'failed'}`, data),
    error: (endpoint: string, error: any) =>
      logger.error('api', `API error: ${endpoint}`, { error }),
  },

  // Storage operations
  storage: {
    read: (key: string) =>
      logger.debug('storage', `Reading: ${key}`),
    write: (key: string, data?: any) =>
      logger.debug('storage', `Writing: ${key}`, data),
    error: (operation: string, error: any) =>
      logger.error('storage', `Storage error: ${operation}`, { error }),
  },

  // Prompt operations
  prompt: {
    generated: (count: number, mediaType: string) =>
      logger.info('prompt', `Generated ${count} ${mediaType} prompts`),
    added: (count: number, source: string) =>
      logger.info('prompt', `Added ${count} prompts from ${source}`),
    edited: (promptId: string) =>
      logger.info('prompt', `Edited prompt: ${promptId}`),
    deleted: (promptId: string) =>
      logger.info('prompt', `Deleted prompt: ${promptId}`),
    refined: (promptId: string) =>
      logger.info('prompt', `Refined prompt: ${promptId}`),
    duplicated: (promptId: string, count: number) =>
      logger.info('prompt', `Duplicated prompt ${promptId} x${count}`),
    similar: (promptId: string, count: number) =>
      logger.info('prompt', `Generated ${count} similar prompts for ${promptId}`),
  },

  // CSV operations
  csv: {
    import: (rowCount: number) =>
      logger.info('csv', `Imported ${rowCount} rows from CSV`),
    export: (rowCount: number) =>
      logger.info('csv', `Exported ${rowCount} rows to CSV`),
    error: (error: any) =>
      logger.error('csv', 'CSV operation failed', { error }),
  },

  // UI operations
  ui: {
    action: (action: string, data?: any) =>
      logger.debug('ui', `User action: ${action}`, data),
    error: (component: string, error: any) =>
      logger.error('ui', `UI error in ${component}`, { error }),
  },

  // Extension lifecycle
  extension: {
    installed: () =>
      logger.info('extension', 'Extension installed'),
    updated: (version: string) =>
      logger.info('extension', `Extension updated to ${version}`),
    error: (context: string, error: any) =>
      logger.error('extension', `Extension error: ${context}`, { error }),
  },

  // Content script / DOM operations
  content: {
    init: (url: string) =>
      logger.info('content', `Content script initialized on: ${url}`),
    domSnapshot: (data: any) =>
      logger.debug('content', 'DOM snapshot captured', data),
    elementSearch: (selector: string, found: boolean, details?: any) =>
      logger.info('content', `Element search: ${selector}`, { found, ...details }),
    elementClick: (elementType: string, success: boolean, details?: any) =>
      logger.info('content', `Element click: ${elementType}`, { success, ...details }),
    inputSet: (elementType: string, value: string, success: boolean, details?: any) =>
      logger.info('content', `Input set: ${elementType}`, {
        valueLength: value.length,
        valuePreview: value.substring(0, 50),
        success,
        ...details
      }),
    submitAttempt: (method: string, success: boolean, details?: any) =>
      logger.info('content', `Submit attempt: ${method}`, { success, ...details }),
    generationStatus: (status: string, details?: any) =>
      logger.info('content', `Generation status: ${status}`, details),
    error: (context: string, error: any, domSnapshot?: any) =>
      logger.error('content', `Content script error: ${context}`, { error, domSnapshot }),
    log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) => {
      // Generic content script logging
      logger[level]('content', message, data);
    },
  },
};
