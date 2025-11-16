import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { storage } from './utils/storage';
import { CSVParser } from './utils/csvParser';
import type {
  PromptConfig,
  GeneratedPrompt,
  QueueState,
  AspectRatio,
  PresetType,
  PromptEditAction,
  LogEntry
} from './types';

type Tab = 'generate' | 'manual' | 'csv' | 'queue' | 'settings' | 'debug';

function IndexPopup() {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadData();
    // Refresh data every 2 seconds when queue is running
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all([
      storage.getConfig(),
      storage.getPrompts(),
      storage.getQueueState(),
    ]);
    setConfig(loadedConfig);
    setPrompts(loadedPrompts);
    setQueueState(loadedQueueState);
  }

  async function loadLogs() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getLogs',
        filter: { limit: 100 },
      });
      if (response.success) {
        setLogs(response.logs);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }

  useEffect(() => {
    if (activeTab === 'debug') {
      loadLogs();
    }
  }, [activeTab]);

  async function handleConfigUpdate(updates: Partial<PromptConfig>) {
    if (!config) return;
    const newConfig = { ...config, ...updates };
    await storage.setConfig(newConfig);
    setConfig(newConfig);
  }

  async function handleGeneratePrompts() {
    if (!config?.contextPrompt) {
      setError('Please enter a context prompt');
      return;
    }

    if (!config?.apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generatePrompts',
        data: {
          context: config.contextPrompt,
          count: config.batchSize,
          mediaType: config.mediaType,
          useSecretPrompt: config.useSecretPrompt,
        },
      });

      if (response.success) {
        await loadData();
        setSuccess(`Generated ${response.count} prompts!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to generate prompts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualAdd(text: string) {
    if (!text.trim()) return;

    const newPrompts: GeneratedPrompt[] = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, index) => ({
        id: `${Date.now()}-${index}`,
        text: line,
        timestamp: Date.now(),
        status: 'pending' as const,
        mediaType: config?.mediaType || 'video',
        variations: config?.variationCount,
      }));

    await storage.addPrompts(newPrompts);
    await loadData();
    setSuccess(`Added ${newPrompts.length} prompts!`);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const result = await CSVParser.parseFile(file);

      if (result.success) {
        const newPrompts: GeneratedPrompt[] = result.rows.map((row, index) => ({
          id: `${Date.now()}-${index}`,
          text: row.prompt,
          timestamp: Date.now(),
          status: 'pending' as const,
          mediaType: row.type || config?.mediaType || 'video',
          aspectRatio: row.aspectRatio,
          variations: row.variations || config?.variationCount || 2,
          preset: row.preset,
        }));

        await storage.addPrompts(newPrompts);
        await loadData();
        setSuccess(`Imported ${newPrompts.length} prompts from CSV!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to parse CSV');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  async function handleExportCSV() {
    CSVParser.downloadCSV(prompts, `sora-prompts-${Date.now()}.csv`);
    setSuccess('Exported prompts to CSV!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleDownloadTemplate() {
    CSVParser.downloadTemplate();
    setSuccess('Downloaded CSV template!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleClearPrompts() {
    if (confirm('Are you sure you want to clear all prompts?')) {
      await storage.clearPrompts();
      await loadData();
    }
  }

  async function handleStartQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'startQueue' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start queue');
    }
  }

  async function handlePauseQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'pauseQueue' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause queue');
    }
  }

  async function handleResumeQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'resumeQueue' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume queue');
    }
  }

  async function handleStopQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'stopQueue' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop queue');
    }
  }

  async function handlePromptAction(action: PromptEditAction) {
    setLoading(true);
    setError('');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: action,
      });

      if (response.success) {
        await loadData();
        setSuccess(`Action "${action.type}" completed!`);
        setTimeout(() => setSuccess(''), 3000);
        setEditingPromptId(null);
      } else {
        setError(response.error || `Failed to ${action.type} prompt`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(prompt: GeneratedPrompt) {
    setEditingPromptId(prompt.id);
    setEditText(prompt.text);
  }

  function cancelEdit() {
    setEditingPromptId(null);
    setEditText('');
  }

  function saveEdit(promptId: string) {
    handlePromptAction({
      type: 'edit',
      promptId,
      newText: editText,
    });
  }

  async function handleExportLogs() {
    try {
      await chrome.runtime.sendMessage({ action: 'exportLogs' });
      setSuccess('Logs exported!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export logs');
    }
  }

  async function handleClearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearLogs' });
        setLogs([]);
        setSuccess('Logs cleared!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to clear logs');
      }
    }
  }

  const pendingCount = prompts.filter((p) => p.status === 'pending').length;
  const processingCount = prompts.filter((p) => p.status === 'processing').length;
  const completedCount = prompts.filter((p) => p.status === 'completed').length;

  if (!config) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="popup-container">
      <header>
        <h1>Sora Auto Queue</h1>
        <div className="stats">
          <span className="stat pending">⏳ {pendingCount}</span>
          <span className="stat processing">▶ {processingCount}</span>
          <span className="stat completed">✓ {completedCount}</span>
        </div>
      </header>

      <div className="tabs">
        <button
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          Generate
        </button>
        <button
          className={activeTab === 'manual' ? 'active' : ''}
          onClick={() => setActiveTab('manual')}
        >
          Manual
        </button>
        <button
          className={activeTab === 'csv' ? 'active' : ''}
          onClick={() => setActiveTab('csv')}
        >
          CSV
        </button>
        <button
          className={activeTab === 'queue' ? 'active' : ''}
          onClick={() => setActiveTab('queue')}
        >
          Queue {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={activeTab === 'debug' ? 'active' : ''}
          onClick={() => setActiveTab('debug')}
        >
          Debug
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="tab-content">
          <div className="form-group">
            <label>OpenAI API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => handleConfigUpdate({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>

          <div className="form-group">
            <label>Context Prompt</label>
            <textarea
              value={config.contextPrompt}
              onChange={(e) => handleConfigUpdate({ contextPrompt: e.target.value })}
              placeholder="Describe what kind of prompts you want to generate..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Batch Size (Custom)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={config.batchSize}
                onChange={(e) =>
                  handleConfigUpdate({ batchSize: Number(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>Media Type</label>
              <select
                value={config.mediaType}
                onChange={(e) =>
                  handleConfigUpdate({ mediaType: e.target.value as 'video' | 'image' })
                }
              >
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Variations per Prompt</label>
            <select
              value={config.variationCount}
              onChange={(e) =>
                handleConfigUpdate({ variationCount: Number(e.target.value) as 2 | 4 })
              }
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.useSecretPrompt}
                onChange={(e) =>
                  handleConfigUpdate({ useSecretPrompt: e.target.checked })
                }
              />
              <span>
                Use Enhanced Prompts
                <small>AI will optimize prompts with technical details</small>
              </span>
            </label>
          </div>

          <button
            className="btn-primary"
            onClick={handleGeneratePrompts}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Prompts'}
          </button>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="tab-content">
          <div className="form-group">
            <label>Enter Prompts (one per line)</label>
            <textarea
              id="manual-prompts"
              placeholder="Enter your prompts here, one per line..."
              rows={10}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              const textarea = document.getElementById(
                'manual-prompts'
              ) as HTMLTextAreaElement;
              handleManualAdd(textarea.value);
              textarea.value = '';
            }}
          >
            Add Prompts
          </button>
        </div>
      )}

      {activeTab === 'csv' && (
        <div className="tab-content">
          <div className="form-group">
            <label>Upload CSV File (5-Column Format)</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={loading}
            />
            <small>
              Format: prompt, type, aspect_ratio, variations, preset
            </small>
          </div>

          <div className="csv-actions">
            <button className="btn-secondary" onClick={handleDownloadTemplate}>
              Download Template
            </button>
            <button className="btn-secondary" onClick={handleExportCSV}>
              Export Prompts
            </button>
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="tab-content queue-tab">
          <div className="queue-controls">
            <div className="queue-status">
              <span className={queueState?.isRunning ? 'running' : ''}>
                {queueState?.isRunning
                  ? queueState.isPaused
                    ? '⏸ Paused'
                    : '▶ Running'
                  : '⏹ Stopped'}
              </span>
              <span className="queue-progress">
                {queueState?.processedCount || 0} / {prompts.length}
              </span>
            </div>

            <div className="queue-buttons">
              {!queueState?.isRunning && (
                <button className="btn-primary" onClick={handleStartQueue}>
                  Start Queue
                </button>
              )}

              {queueState?.isRunning && !queueState.isPaused && (
                <button className="btn-warning" onClick={handlePauseQueue}>
                  Pause
                </button>
              )}

              {queueState?.isRunning && queueState.isPaused && (
                <button className="btn-primary" onClick={handleResumeQueue}>
                  Resume
                </button>
              )}

              {queueState?.isRunning && (
                <button className="btn-danger" onClick={handleStopQueue}>
                  Stop
                </button>
              )}
            </div>
          </div>

          <div className="prompt-list">
            {prompts.length === 0 && (
              <div className="empty-state">
                No prompts in queue. Generate or add prompts to get started.
              </div>
            )}

            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`prompt-card ${prompt.status} ${
                  editingPromptId === prompt.id ? 'editing' : ''
                }`}
              >
                {editingPromptId === prompt.id ? (
                  <div className="prompt-edit">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-small btn-primary"
                        onClick={() => saveEdit(prompt.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prompt-header">
                      <span className="prompt-type">{prompt.mediaType}</span>
                      {prompt.aspectRatio && (
                        <span className="prompt-aspect">{prompt.aspectRatio}</span>
                      )}
                      {prompt.preset && (
                        <span className="prompt-preset">{prompt.preset}</span>
                      )}
                      <span className={`prompt-status status-${prompt.status}`}>
                        {prompt.status}
                      </span>
                    </div>

                    <div className="prompt-text">{prompt.text}</div>

                    <div className="prompt-meta">
                      {prompt.variations && (
                        <span>Variations: {prompt.variations}</span>
                      )}
                      {prompt.enhanced && <span className="enhanced">✨ Enhanced</span>}
                    </div>

                    <div className="prompt-actions">
                      <button
                        className="btn-action"
                        onClick={() => startEdit(prompt)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action"
                        onClick={() =>
                          handlePromptAction({
                            type: 'duplicate',
                            promptId: prompt.id,
                            count: 1,
                          })
                        }
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        className="btn-action"
                        onClick={() =>
                          handlePromptAction({
                            type: 'refine',
                            promptId: prompt.id,
                          })
                        }
                        title="Refine with AI"
                      >
                        ✨
                      </button>
                      <button
                        className="btn-action"
                        onClick={() =>
                          handlePromptAction({
                            type: 'generate-similar',
                            promptId: prompt.id,
                            count: 3,
                          })
                        }
                        title="Generate 3 similar"
                      >
                        🔄
                      </button>
                      <button
                        className="btn-action danger"
                        onClick={() =>
                          handlePromptAction({
                            type: 'delete',
                            promptId: prompt.id,
                          })
                        }
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="tab-content settings-tab">
          <h3>Queue Automation</h3>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.autoGenerateOnEmpty}
                onChange={(e) =>
                  handleConfigUpdate({ autoGenerateOnEmpty: e.target.checked })
                }
              />
              <span>
                Auto-generate when queue is empty
                <small>Automatically create new batch when all prompts are processed</small>
              </span>
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.autoGenerateOnReceived}
                onChange={(e) =>
                  handleConfigUpdate({ autoGenerateOnReceived: e.target.checked })
                }
              />
              <span>
                Auto-generate when prompts are added
                <small>Generate additional prompts when manual/CSV prompts are added</small>
              </span>
            </label>
          </div>

          <h3>Anti-Bot Delays</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Min Delay (ms)</label>
              <input
                type="number"
                min="1000"
                max="30000"
                step="500"
                value={config.minDelayMs}
                onChange={(e) =>
                  handleConfigUpdate({ minDelayMs: Number(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>Max Delay (ms)</label>
              <input
                type="number"
                min="1000"
                max="60000"
                step="500"
                value={config.maxDelayMs}
                onChange={(e) =>
                  handleConfigUpdate({ maxDelayMs: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <small className="help-text">
            Random delay between {config.minDelayMs / 1000}s and{' '}
            {config.maxDelayMs / 1000}s helps avoid bot detection
          </small>

          <h3>Danger Zone</h3>

          <button className="btn-danger" onClick={handleClearPrompts}>
            Clear All Prompts
          </button>
        </div>
      )}

      {activeTab === 'debug' && (
        <div className="tab-content debug-tab">
          <div className="debug-header">
            <h3>Debug Logs</h3>
            <div className="debug-actions">
              <button className="btn-small btn-secondary" onClick={loadLogs}>
                Refresh
              </button>
              <button className="btn-small btn-secondary" onClick={handleExportLogs}>
                Export
              </button>
              <button className="btn-small btn-danger" onClick={handleClearLogs}>
                Clear
              </button>
            </div>
          </div>

          <div className="log-list">
            {logs.length === 0 && <div className="empty-state">No logs yet</div>}

            {logs.map((log, index) => (
              <div key={index} className={`log-entry log-${log.level}`}>
                <div className="log-header">
                  <span className="log-level">{log.level.toUpperCase()}</span>
                  <span className="log-category">{log.category}</span>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="log-message">{log.message}</div>
                {log.data && (
                  <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the React app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<IndexPopup />);
}
