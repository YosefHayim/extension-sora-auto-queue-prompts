import "./styles/globals.css";

import * as React from "react";

import { Bug, Download, List, Moon, Play, Settings, Sparkles, Sun, Trash2, CheckSquare, Square } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { GeneratedPrompt, PromptConfig, QueueState } from "./types";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import { Button } from "./components/ui/button";
import { CSVImportDialog } from "./components/CSVImportDialog";
import { DebugPanel } from "./components/DebugPanel";
import type { DetectedSettings as DetectedSettingsType } from "./types";
import { EditPromptDialog } from "./components/EditPromptDialog";
import { EmptyState } from "./components/EmptyState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ExportDialog } from "./components/ExportDialog";
import { FilterBar } from "./components/FilterBar";
import { GenerateDialog } from "./components/GenerateDialog";
import { ManualAddDialog } from "./components/ManualAddDialog";
import { QueueControls } from "./components/QueueControls";
import ReactDOM from "react-dom/client";
import { SearchBar } from "./components/SearchBar";
import { SettingsDialog } from "./components/SettingsDialog";
import { SortablePromptCard } from "./components/SortablePromptCard";
import { StatusBar } from "./components/StatusBar";
import { Footer } from "./components/Footer";
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
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "processing" | "completed" | "failed">("all");
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<"all" | "video" | "image">("all");
  const [darkMode, setDarkMode] = React.useState(false);
  const [detectedSettings, setDetectedSettings] = React.useState<DetectedSettingsType | null>(null);
  const [detectingSettings, setDetectingSettings] = React.useState(false);
  const [selectedPrompts, setSelectedPrompts] = React.useState<Set<string>>(new Set());

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
    detectSettingsFromSora();

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }

    // Listen for storage changes for real-time updates (replaces 2-second polling)
    let debounceTimer: NodeJS.Timeout | null = null;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => {
      if (areaName !== "local") return;

      // Check if relevant keys changed
      const relevantKeys = ["config", "prompts", "queueState"];
      const hasRelevantChanges = relevantKeys.some((key) => key in changes);

      if (!hasRelevantChanges) return;

      log.ui.action("Storage change detected", Object.keys(changes));

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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Cmd/Ctrl + N for new prompt
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setGenerateDialogOpen(true);
      }
      // Escape to close dialogs
      if (e.key === "Escape") {
        if (generateDialogOpen) setGenerateDialogOpen(false);
        if (csvDialogOpen) setCsvDialogOpen(false);
        if (settingsDialogOpen) setSettingsDialogOpen(false);
        if (manualDialogOpen) setManualDialogOpen(false);
        if (editDialogOpen) setEditDialogOpen(false);
        if (exportDialogOpen) setExportDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generateDialogOpen, csvDialogOpen, settingsDialogOpen, manualDialogOpen, editDialogOpen, exportDialogOpen]);

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

  // Filter and search prompts
  const filteredPrompts = React.useMemo(() => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.text.toLowerCase().includes(query));
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply media type filter
    if (mediaTypeFilter !== "all") {
      filtered = filtered.filter((p) => p.mediaType === mediaTypeFilter);
    }

    return filtered;
  }, [prompts, searchQuery, statusFilter, mediaTypeFilter]);

  // Count prompts by status
  const pendingCount = prompts.filter((p) => p.status === "pending").length;
  const processingCount = prompts.filter((p) => p.status === "processing").length;
  const completedCount = prompts.filter((p) => p.status === "completed").length;

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Detect settings from Sora page
  async function detectSettingsFromSora() {
    setDetectingSettings(true);
    try {
      const response = await chrome.runtime.sendMessage({ action: "detectSettings" });
      if (response) {
        setDetectedSettings(response);
        log.ui.action("detectSettingsFromSora:success", response);
      }
    } catch (error) {
      log.ui.error("detectSettingsFromSora", error);
      setDetectedSettings({
        mediaType: null,
        aspectRatio: null,
        variations: null,
        success: false,
        error: error instanceof Error ? error.message : "Failed to detect settings",
      });
    } finally {
      setDetectingSettings(false);
    }
  }

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

  async function handleNavigateToPrompt(id: string, text: string) {
    try {
      log.ui.action("handleNavigateToPrompt:clicked", { promptId: id });
      await chrome.runtime.sendMessage({
        action: "navigateToPrompt",
        data: { promptId: id, promptText: text },
      });
      log.ui.action("handleNavigateToPrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleNavigateToPrompt", error);
    }
  }

  async function handleProcessPrompt(promptId: string) {
    try {
      log.ui.action("handleProcessPrompt:clicked", { promptId });
      await chrome.runtime.sendMessage({
        action: "processSelectedPrompts",
        data: { promptIds: [promptId] },
      });
      await loadData();
      log.ui.action("handleProcessPrompt:success", { promptId });
    } catch (error) {
      log.ui.error("handleProcessPrompt", error);
    }
  }

  async function handleProcessSelectedPrompts() {
    if (selectedPrompts.size === 0) {
      return;
    }

    try {
      log.ui.action("handleProcessSelectedPrompts:clicked", { count: selectedPrompts.size });
      await chrome.runtime.sendMessage({
        action: "processSelectedPrompts",
        data: { promptIds: Array.from(selectedPrompts) },
      });
      setSelectedPrompts(new Set());
      await loadData();
      log.ui.action("handleProcessSelectedPrompts:success", { count: selectedPrompts.size });
    } catch (error) {
      log.ui.error("handleProcessSelectedPrompts", error);
    }
  }

  function handleTogglePromptSelection(promptId: string) {
    setSelectedPrompts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  }

  function handleSelectAll() {
    if (selectedPrompts.size === filteredPrompts.length) {
      setSelectedPrompts(new Set());
    } else {
      setSelectedPrompts(new Set(filteredPrompts.map((p) => p.id)));
    }
  }

  async function handleDeleteAllPrompts() {
    if (prompts.length === 0) {
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete all ${prompts.length} prompt(s)? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      log.ui.action("handleDeleteAllPrompts:clicked", { count: prompts.length });

      // Stop queue if running
      if (queueState?.isRunning) {
        await handleStopQueue();
      }

      // Clear all prompts
      await storage.clearPrompts();
      await loadData();

      log.ui.action("handleDeleteAllPrompts:success", { count: prompts.length });
    } catch (error) {
      log.ui.error("handleDeleteAllPrompts", error);
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

    // Use detected settings if available, otherwise fall back to config
    const mediaType = detectedSettings?.mediaType || config.mediaType;
    const aspectRatio = detectedSettings?.aspectRatio;
    const variations = detectedSettings?.variations;

    const response = await chrome.runtime.sendMessage({
      action: "generatePrompts",
      data: {
        context,
        count,
        mediaType,
        useSecretPrompt: config.useSecretPrompt,
        aspectRatio,
        variations,
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
      <header className="flex items-center justify-between border-b pb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Sora Auto Queue</h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
              {darkMode ?
                <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <StatusBar pendingCount={pendingCount} processingCount={processingCount} completedCount={completedCount} />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerate} size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="icon" onClick={handleSettings} title="Settings">
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

          {/* Search and Filters */}
          {prompts.length > 0 && (
            <div className="space-y-3">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <FilterBar
                statusFilter={statusFilter}
                mediaTypeFilter={mediaTypeFilter}
                onStatusFilterChange={setStatusFilter}
                onMediaTypeFilterChange={setMediaTypeFilter}
                promptCount={prompts.length}
                filteredCount={filteredPrompts.length}
              />
            </div>
          )}

          {/* Bulk Actions */}
          {prompts.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                  title={selectedPrompts.size === filteredPrompts.length ? "Deselect all" : "Select all"}
                >
                  {selectedPrompts.size === filteredPrompts.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedPrompts.size > 0 ? `${selectedPrompts.size} selected` : "Select"}
                </Button>
                {selectedPrompts.size > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleProcessSelectedPrompts}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Process Selected ({selectedPrompts.size})
                  </Button>
                )}
                <div className="text-sm text-muted-foreground">
                  {filteredPrompts.length === prompts.length ?
                    <span>
                      {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
                    </span>
                  : <span>
                      Showing {filteredPrompts.length} of {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
                    </span>
                  }
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteAllPrompts} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete All
                </Button>
              </div>
            </div>
          )}

          {/* Prompt List */}
          <div className="space-y-3">
            {prompts.length === 0 ?
              <EmptyState onGenerate={handleGenerate} onImport={handleImport} onManual={handleManual} />
            : filteredPrompts.length === 0 ?
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No prompts match your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setMediaTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredPrompts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {filteredPrompts.map((prompt) => (
                      <SortablePromptCard
                        key={prompt.id}
                        prompt={prompt}
                        isSelected={selectedPrompts.has(prompt.id)}
                        onToggleSelection={handleTogglePromptSelection}
                        onProcess={handleProcessPrompt}
                        onNavigateToPrompt={handleNavigateToPrompt}
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
          <GenerateDialog
            config={config}
            isOpen={generateDialogOpen}
            onClose={() => setGenerateDialogOpen(false)}
            onGenerate={handleGeneratePrompts}
            detectedSettings={detectedSettings}
          />

          <CSVImportDialog config={config} isOpen={csvDialogOpen} onClose={() => setCsvDialogOpen(false)} onImport={handleImportCSV} />

          <ManualAddDialog config={config} isOpen={manualDialogOpen} onClose={() => setManualDialogOpen(false)} onAdd={handleManualAdd} />

          <SettingsDialog
            config={config}
            isOpen={settingsDialogOpen}
            onClose={() => setSettingsDialogOpen(false)}
            onSave={handleSaveSettings}
            detectedSettings={detectedSettings}
          />

          <EditPromptDialog
            prompt={editingPrompt}
            isOpen={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setEditingPrompt(null);
            }}
            onSave={handleSaveEditedPrompt}
          />

          <ExportDialog isOpen={exportDialogOpen} onClose={() => setExportDialogOpen(false)} prompts={filteredPrompts.length > 0 ? filteredPrompts : prompts} />
        </>
      )}

      {/* Footer */}
      <Footer />
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
