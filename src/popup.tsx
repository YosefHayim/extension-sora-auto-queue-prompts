import { useEffect, useState } from 'react';
import { storage } from '~utils/storage';
import { CSVParser } from '~utils/csvParser';
import type { PromptConfig, GeneratedPrompt } from '~types';
import './popup.css';

function IndexPopup() {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generate' | 'manual' | 'csv'>('generate');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [loadedConfig, loadedPrompts] = await Promise.all([
      storage.getConfig(),
      storage.getPrompts(),
    ]);
    setConfig(loadedConfig);
    setPrompts(loadedPrompts);
  }

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

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generatePrompts',
        data: {
          context: config.contextPrompt,
          count: config.batchSize,
          mediaType: config.mediaType,
        },
      });

      if (response.success) {
        await loadData();
        setError('');
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
      }));

    await storage.addPrompts(newPrompts);
    await loadData();
  }

  async function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const result = await CSVParser.parseFile(file);

      if (result.success) {
        const newPrompts: GeneratedPrompt[] = result.prompts.map((text, index) => ({
          id: `${Date.now()}-${index}`,
          text,
          timestamp: Date.now(),
          status: 'pending' as const,
          mediaType: config?.mediaType || 'video',
        }));

        await storage.addPrompts(newPrompts);
        await loadData();
      } else {
        setError(result.error || 'Failed to parse CSV');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset input
    }
  }

  async function handleExportCSV() {
    const promptTexts = prompts.map((p) => p.text);
    CSVParser.downloadCSV(promptTexts, `sora-prompts-${Date.now()}.csv`);
  }

  async function handleClearPrompts() {
    if (confirm('Are you sure you want to clear all prompts?')) {
      await storage.clearPrompts();
      await loadData();
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
          <span className="stat">Pending: {pendingCount}</span>
          <span className="stat">Processing: {processingCount}</span>
          <span className="stat">Done: {completedCount}</span>
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
      </div>

      {error && <div className="error">{error}</div>}

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
              <label>Batch Size</label>
              <select
                value={config.batchSize}
                onChange={(e) =>
                  handleConfigUpdate({ batchSize: Number(e.target.value) })
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
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
            <label>Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={loading}
            />
            <small>CSV should have prompts in the first column</small>
          </div>

          <div className="csv-actions">
            <button className="btn-secondary" onClick={handleExportCSV}>
              Export Current Prompts
            </button>
          </div>
        </div>
      )}

      <footer>
        <button className="btn-danger" onClick={handleClearPrompts}>
          Clear All Prompts
        </button>
      </footer>
    </div>
  );
}

export default IndexPopup;
