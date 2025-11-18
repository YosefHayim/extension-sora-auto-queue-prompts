import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar } from './components/StatusBar';
import { QueueControls } from './components/QueueControls';
import { PromptCard } from './components/PromptCard';
import { EmptyState } from './components/EmptyState';
import { DebugPanel } from './components/DebugPanel';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Sparkles, Settings, List, Bug } from 'lucide-react';
import { storage } from './utils/storage';
import { log } from './utils/logger';
import type { PromptConfig, GeneratedPrompt, QueueState } from './types';

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
      log.ui.action('loadData', { timestamp: Date.now() });
      const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all([
        storage.getConfig(),
        storage.getPrompts(),
        storage.getQueueState(),
      ]);
      setConfig(loadedConfig);
      setPrompts(loadedPrompts);
      setQueueState(loadedQueueState);
      setLoading(false);
      log.ui.action('loadData:success', {
        promptCount: loadedPrompts.length,
        queueRunning: loadedQueueState.isRunning
      });
    } catch (error) {
      log.ui.error('loadData', error);
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
      log.ui.action('handleStartQueue:clicked', { promptCount: prompts.length });
      await chrome.runtime.sendMessage({ action: 'startQueue' });
      await loadData();
      log.ui.action('handleStartQueue:success');
    } catch (error) {
      log.ui.error('handleStartQueue', error);
    }
  }

  async function handlePauseQueue() {
    try {
      log.ui.action('handlePauseQueue:clicked');
      await chrome.runtime.sendMessage({ action: 'pauseQueue' });
      await loadData();
      log.ui.action('handlePauseQueue:success');
    } catch (error) {
      log.ui.error('handlePauseQueue', error);
    }
  }

  async function handleResumeQueue() {
    try {
      log.ui.action('handleResumeQueue:clicked');
      await chrome.runtime.sendMessage({ action: 'resumeQueue' });
      await loadData();
      log.ui.action('handleResumeQueue:success');
    } catch (error) {
      log.ui.error('handleResumeQueue', error);
    }
  }

  async function handleStopQueue() {
    try {
      log.ui.action('handleStopQueue:clicked');
      await chrome.runtime.sendMessage({ action: 'stopQueue' });
      await loadData();
      log.ui.action('handleStopQueue:success');
    } catch (error) {
      log.ui.error('handleStopQueue', error);
    }
  }

  async function handleEditPrompt(id: string) {
    log.ui.action('handleEditPrompt:clicked', { promptId: id });
    // TODO: Implement edit modal
    log.ui.action('handleEditPrompt:notImplemented', { promptId: id });
  }

  async function handleDuplicatePrompt(id: string) {
    try {
      log.ui.action('handleDuplicatePrompt:clicked', { promptId: id });
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'duplicate' }
      });
      await loadData();
      log.ui.action('handleDuplicatePrompt:success', { promptId: id });
    } catch (error) {
      log.ui.error('handleDuplicatePrompt', error);
    }
  }

  async function handleRefinePrompt(id: string) {
    try {
      log.ui.action('handleRefinePrompt:clicked', { promptId: id });
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'refine' }
      });
      await loadData();
      log.ui.action('handleRefinePrompt:success', { promptId: id });
    } catch (error) {
      log.ui.error('handleRefinePrompt', error);
    }
  }

  async function handleGenerateSimilar(id: string) {
    try {
      log.ui.action('handleGenerateSimilar:clicked', { promptId: id });
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'similar' }
      });
      await loadData();
      log.ui.action('handleGenerateSimilar:success', { promptId: id });
    } catch (error) {
      log.ui.error('handleGenerateSimilar', error);
    }
  }

  async function handleDeletePrompt(id: string) {
    try {
      log.ui.action('handleDeletePrompt:clicked', { promptId: id });
      await chrome.runtime.sendMessage({
        action: 'promptAction',
        data: { promptId: id, actionType: 'delete' }
      });
      await loadData();
      log.ui.action('handleDeletePrompt:success', { promptId: id });
    } catch (error) {
      log.ui.error('handleDeletePrompt', error);
    }
  }

  function handleGenerate() {
    log.ui.action('handleGenerate:clicked');
    // TODO: Implement generate modal
    log.ui.action('handleGenerate:notImplemented');
  }

  function handleImport() {
    log.ui.action('handleImport:clicked');
    // TODO: Implement CSV import modal
    log.ui.action('handleImport:notImplemented');
  }

  function handleSettings() {
    log.ui.action('handleSettings:clicked');
    // TODO: Implement settings modal
    log.ui.action('handleSettings:notImplemented');
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

      {/* Tabs Navigation */}
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue" className="flex-1">
            <List className="h-4 w-4 mr-2" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex-1">
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </TabsTrigger>
        </TabsList>

        {/* Queue Tab Content */}
        <TabsContent value="queue" className="space-y-4">
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
        </TabsContent>

        {/* Debug Tab Content */}
        <TabsContent value="debug">
          <DebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mount the React app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<IndexPopup />);
}
