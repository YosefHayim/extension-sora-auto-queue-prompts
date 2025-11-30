import * as React from 'react';
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { FaSync, FaDownload, FaTrash } from 'react-icons/fa';
import { log } from '../utils/logger'
import type { LogEntry } from '../utils/logger'

export function DebugPanel() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setIsLoading(true);
      // Don't log during load operation to avoid creating new logs
      const response = await chrome.runtime.sendMessage({ action: 'getLogs' });
      if (response.success) {
        setLogs(response.logs);
      }
    } catch (error) {
      // Only log errors, which is acceptable as user should see failures
      log.ui.error('DebugPanel:LoadLogs', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportLogs() {
    try {
      // Don't log during export to keep export clean
      await chrome.runtime.sendMessage({ action: 'exportLogs' });
    } catch (error) {
      // Only log errors
      log.ui.error('DebugPanel:ExportLogs', error);
    }
  }

  async function handleClearLogs() {
    try {
      // Don't log during clear operation to avoid creating new logs
      await chrome.runtime.sendMessage({ action: 'clearLogs' });
      setLogs([]);
    } catch (error) {
      // Only log errors, which is acceptable as user should see failures
      log.ui.error('DebugPanel:ClearLogs', error);
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Debug Logs</h3>
              <p className="text-sm text-muted-foreground">
                {logs.length} log {logs.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
                disabled={isLoading}
              >
                <FaSync className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={logs.length === 0}
              >
                <FaDownload className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearLogs}
                disabled={logs.length === 0}
              >
                <FaTrash className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No logs yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Logs will appear here as you interact with the extension
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          logs.map((logEntry, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={getLevelColor(logEntry.level)}
                    >
                      {logEntry.level.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {logEntry.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(logEntry.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm text-foreground mb-2">
                  {logEntry.message}
                </p>

                {logEntry.data && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(logEntry.data, null, 2)}
                  </pre>
                )}

                {logEntry.stack && (
                  <pre className="text-xs bg-destructive/10 text-destructive p-2 rounded overflow-x-auto mt-2">
                    {logEntry.stack}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
