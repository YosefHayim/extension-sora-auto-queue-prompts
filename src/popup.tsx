import * as React from "react";

import { Bug, List, Settings, Sparkles } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { GeneratedPrompt, PromptConfig, QueueState } from "./types";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import { Button } from "./components/ui/button";
import { CSVImportDialog } from "./components/CSVImportDialog";
import { DebugPanel } from "./components/DebugPanel";
import { EditPromptDialog } from "./components/EditPromptDialog";
import { EmptyState } from "./components/EmptyState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GenerateDialog } from "./components/GenerateDialog";
import { ManualAddDialog } from "./components/ManualAddDialog";
import { QueueControls } from "./components/QueueControls";
import ReactDOM from "react-dom/client";
import { SettingsDialog } from "./components/SettingsDialog";
import { SortablePromptCard } from "./components/SortablePromptCard";
import { StatusBar } from "./components/StatusBar";
import { log } from "./utils/logger";
import { storage } from "./utils/storage";

function IndexPopup() {
  const [config, setConfig] = React.useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = React.useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = React.useState<QueueState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [manualDialogOpen, setManualDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<GeneratedPrompt | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts (prevents accidental drags)
      },
    })
  );

  React.useEffect(() => {
    loadData();

    // Listen for storage changes for real-time updates (replaces 2-second polling)
    let debounceTimer: NodeJS.Timeout | null = null;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => {
      if (areaName !== "local") return;

      // Check if relevant keys changed
      const relevantKeys = ["config", "prompts", "queueState"];
      const hasRelevantChanges = relevantKeys.some((key) => key in changes);

      if (!hasRelevantChanges) return;

      log.ui.info("Storage change detected", Object.keys(changes));

      // Debounce rapid changes (e.g., during batch operations)
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        loadData();
        debounceTimer = null;
      }, 100); // 100ms debounce
    };

    // Check if chrome.storage API is available
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  async function loadData() {
    try {
      const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all([storage.getConfig(), storage.getPrompts(), storage.getQueueState()]);
      setConfig(loadedConfig);
      setPrompts(loadedPrompts);
      setQueueState(loadedQueueState);
      setLoading(false);
    } catch (error) {
      log.ui.error("loadData", error);
      setLoading(false);
    }
  }

  // Count prompts by status
  const pendingCount = prompts.filter((p) => p.status === "pending").length;
  const processingCount = prompts.filter((p) => p.status === "processing").length;
  const completedCount = prompts.filter((p) => p.status === "completed").length;

  // Handler functions
  async function handleStartQueue() {
    try {
      log.ui.action("handleStartQueue:clicked", { promptCount: prompts.length });
      await chrome.runtime.sendMessage({ action: "startQueue" });
      await loadData();
      log.ui.action("handleStartQueue:success");
    } catch (error) {
      log.ui.error("handleStartQueue", error);
    }
  }

  async function handlePauseQueue() {
    try {
      log.ui.action("handlePauseQueue:clicked");
      await chrome.runtime.sendMessage({ action: "pauseQueue" });
      await loadData();
      log.ui.action("handlePauseQueue:success");
    } catch (error) {
      log.ui.error("handlePauseQueue", error);
    }
  }

  async function handleResumeQueue() {
    try {
      log.ui.action("handleResumeQueue:clicked");
      await chrome.runtime.sendMessage({ action: "resumeQueue" });
      await loadData();
      log.ui.action("handleResumeQueue:success");
    } catch (error) {
      log.ui.error("handleResumeQueue", error);
    }
  }

  async function handleStopQueue() {
    try {
      log.ui.action("handleStopQueue:clicked");
      await chrome.runtime.sendMessage({ action: "stopQueue" });
      await loadData();
      log.ui.action("handleStopQueue:success");
    } catch (error) {
      log.ui.error("handleStopQueue", error);
    }
  }

  async function handleEditPrompt(id: string) {
    log.ui.action("handleEditPrompt:clicked", { promptId: id });
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setEditingPrompt(prompt);
      setEditDialogOpen(true);
    }
  }

  async function handleSaveEditedPrompt(id: string, newText: string) {
    try {
      log.ui.action("handleSaveEditedPrompt", { promptId: id, newTextLength: newText.length });
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "edit", promptId: id, newText },
      });
      await loadData();
      log.ui.action("handleSaveEditedPrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleSaveEditedPrompt", error);
      throw error; // Re-throw to let dialog handle error display
    }
  }

  async function handleDuplicatePrompt(id: string) {
    try {
      log.ui.action("handleDuplicatePrompt:clicked", { promptId: id });
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "duplicate", promptId: id },
      });
      await loadData();
      log.ui.action("handleDuplicatePrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleDuplicatePrompt", error);
    }
  }

  async function handleRefinePrompt(id: string) {
    try {
      log.ui.action("handleRefinePrompt:clicked", { promptId: id });
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "refine", promptId: id },
      });
      await loadData();
      log.ui.action("handleRefinePrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleRefinePrompt", error);
    }
  }

  async function handleGenerateSimilar(id: string) {
    try {
      log.ui.action("handleGenerateSimilar:clicked", { promptId: id });
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "generate-similar", promptId: id },
      });
      await loadData();
      log.ui.action("handleGenerateSimilar:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleGenerateSimilar", error);
    }
  }

  async function handleDeletePrompt(id: string) {
    try {
      log.ui.action("handleDeletePrompt:clicked", { promptId: id });
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "delete", promptId: id },
      });
      await loadData();
      log.ui.action("handleDeletePrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleDeletePrompt", error);
    }
  }

  function handleGenerate() {
    log.ui.action("handleGenerate:clicked");
    setGenerateDialogOpen(true);
  }

  function handleImport() {
    log.ui.action("handleImport:clicked");
    setCsvDialogOpen(true);
  }

  function handleManual() {
    log.ui.action("handleManual:clicked");
    setManualDialogOpen(true);
  }

  function handleSettings() {
    log.ui.action("handleSettings:clicked");
    setSettingsDialogOpen(true);
  }

  async function handleGeneratePrompts(count: number, context: string) {
    if (!config) return;

    log.ui.action("handleGeneratePrompts", { count, contextLength: context.length });

    const response = await chrome.runtime.sendMessage({
      action: "generatePrompts",
      data: {
        context,
        count,
        mediaType: config.mediaType,
        useSecretPrompt: config.useSecretPrompt,
      },
    });

    if (response.success) {
      await loadData();
      log.ui.action("handleGeneratePrompts:success", { count: response.count });
    } else {
      log.ui.error("handleGeneratePrompts", response.error);
      throw new Error(response.error || "Failed to generate prompts");
    }
  }

  async function handleImportCSV(newPrompts: GeneratedPrompt[]) {
    log.ui.action("handleImportCSV", { count: newPrompts.length });

    await storage.addPrompts(newPrompts);
    await loadData();

    log.ui.action("handleImportCSV:success", { count: newPrompts.length });
  }

  async function handleManualAdd(newPrompts: GeneratedPrompt[]) {
    log.ui.action("handleManualAdd", { count: newPrompts.length });

    await storage.addPrompts(newPrompts);
    await loadData();

    log.ui.action("handleManualAdd:success", { count: newPrompts.length });
  }

  async function handleSaveSettings(updates: Partial<PromptConfig>) {
    if (!config) return;

    log.ui.action("handleSaveSettings");

    const newConfig = { ...config, ...updates };
    await storage.setConfig(newConfig);
    setConfig(newConfig);

    log.ui.action("handleSaveSettings:success");
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = prompts.findIndex((p) => p.id === active.id);
    const newIndex = prompts.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedPrompts = arrayMove(prompts, oldIndex, newIndex);

    // Optimistically update UI
    setPrompts(reorderedPrompts);

    // Save to storage
    await storage.setPrompts(reorderedPrompts);
    log.ui.action("handleDragEnd", { from: oldIndex, to: newIndex });
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
          <StatusBar pendingCount={pendingCount} processingCount={processingCount} completedCount={completedCount} />
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
            {prompts.length === 0 ?
              <EmptyState onGenerate={handleGenerate} onImport={handleImport} onManual={handleManual} />
            : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={prompts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {prompts.map((prompt) => (
                      <SortablePromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onEdit={handleEditPrompt}
                        onDuplicate={handleDuplicatePrompt}
                        onRefine={handleRefinePrompt}
                        onGenerateSimilar={handleGenerateSimilar}
                        onDelete={handleDeletePrompt}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            }
          </div>
        </TabsContent>

        {/* Debug Tab Content */}
        <TabsContent value="debug">
          <DebugPanel />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {config && (
        <>
          <GenerateDialog config={config} isOpen={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} onGenerate={handleGeneratePrompts} />

          <CSVImportDialog config={config} isOpen={csvDialogOpen} onClose={() => setCsvDialogOpen(false)} onImport={handleImportCSV} />

          <ManualAddDialog config={config} isOpen={manualDialogOpen} onClose={() => setManualDialogOpen(false)} onAdd={handleManualAdd} />

          <SettingsDialog config={config} isOpen={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} onSave={handleSaveSettings} />

          <EditPromptDialog
            prompt={editingPrompt}
            isOpen={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setEditingPrompt(null);
            }}
            onSave={handleSaveEditedPrompt}
          />
        </>
      )}
    </div>
  );
}

// Mount the React app
const root = document.getElementById("__plasmo");
if (root) {
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <IndexPopup />
    </ErrorBoundary>
  );
}
