import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar } from './components/StatusBar';
import { QueueControls } from './components/QueueControls';
import { PromptCard } from './components/PromptCard';
import { EmptyState } from './components/EmptyState';
import { Button } from './components/ui/button';
import { Sparkles, Settings } from 'lucide-react';
import { storage } from './utils/storage';
import type { PromptConfig, GeneratedPrompt, QueueState } from './types';
import './styles/globals.css';

function IndexPopup() {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Poll for updates every 2 seconds when queue is running
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all([
        storage.getConfig(),
        storage.getPrompts(),
        storage.getQueueState(),
      ]);
      setConfig(loadedConfig);
      setPrompts(loadedPrompts);
      setQueueState(loadedQueueState);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  }

  // Count prompts by status
  const pendingCount = prompts.filter((p) => p.status === 'pending').length;
  const processingCount = prompts.filter((p) => p.status === 'processing').length;
  const completedCount = prompts.filter((p) => p.status === 'completed').length;

  // Handler functions
  async function handleStartQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'startQueue' });
      await loadData();
    } catch (error) {
      console.error('Failed to start queue:', error);
    }
  }

  async function handlePauseQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'pauseQueue' });
      await loadData();
    } catch (error) {
      console.error('Failed to pause queue:', error);
    }
  }

  async function handleResumeQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'resumeQueue' });
      await loadData();
    } catch (error) {
      console.error('Failed to resume queue:', error);
    }
  }

  async function handleStopQueue() {
    try {
      await chrome.runtime.sendMessage({ action: 'stopQueue' });
      await loadData();
    } catch (error) {
      console.error('Failed to stop queue:', error);
    }
  }

  async function handleEditPrompt(id: string) {
    // TODO: Implement edit modal
    console.log('Edit prompt:', id);
  }

  async function handleDuplicatePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'duplicate' }
      });
      await loadData();
    } catch (error) {
      console.error('Failed to duplicate prompt:', error);
    }
  }

  async function handleRefinePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'refine' }
      });
      await loadData();
    } catch (error) {
      console.error('Failed to refine prompt:', error);
    }
  }

  async function handleGenerateSimilar(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'similar' }
      });
      await loadData();
    } catch (error) {
      console.error('Failed to generate similar:', error);
    }
  }

  async function handleDeletePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'delete' }
      });
      await loadData();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  }

  function handleGenerate() {
    // TODO: Implement generate modal
    console.log('Open generate modal');
  }

  function handleImport() {
    // TODO: Implement CSV import modal
    console.log('Open import modal');
  }

  function handleSettings() {
    // TODO: Implement settings modal
    console.log('Open settings');
  }

  if (loading) {
    return (
      <div className="popup-container flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!config || !queueState) {
    return (
      <div className="popup-container flex items-center justify-center">
        <div className="text-sm text-destructive">Failed to load configuration</div>
      </div>
    );
  }

  return (
    <div className="popup-container bg-background space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sora Auto Queue</h1>
          <StatusBar
            pendingCount={pendingCount}
            processingCount={processingCount}
            completedCount={completedCount}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerate}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="icon" onClick={handleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Queue Controls */}
      <QueueControls
        queueState={queueState}
        totalCount={prompts.length}
        onStart={handleStartQueue}
        onPause={handlePauseQueue}
        onResume={handleResumeQueue}
        onStop={handleStopQueue}
      />

      {/* Prompt List */}
      <div className="space-y-3">
        {prompts.length === 0 ? (
          <EmptyState
            onGenerate={handleGenerate}
            onImport={handleImport}
          />
        ) : (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditPrompt}
              onDuplicate={handleDuplicatePrompt}
              onRefine={handleRefinePrompt}
              onGenerateSimilar={handleGenerateSimilar}
              onDelete={handleDeletePrompt}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Mount the React app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<IndexPopup />);
}
