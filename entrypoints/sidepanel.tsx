import "../src/styles/globals.css";

import * as React from "react";

import type {
  DetectedSettings as DetectedSettingsType,
  GeneratedPrompt,
  PromptConfig,
  QueueState,
} from "../src/types";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  FaCheckSquare,
  FaDownload,
  FaImages,
  FaList,
  FaMoon,
  FaPlay,
  FaQuestion,
  FaSpinner,
  FaSquare,
  FaSun,
  FaTrash,
} from "react-icons/fa";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";

import { Button } from "../src/components/ui/button";
import { CSVImportDialog } from "../src/components/CSVImportDialog";
import { EditPromptDialog } from "../src/components/EditPromptDialog";
import { EmptyState } from "../src/components/EmptyState";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { ExportDialog } from "../src/components/ExportDialog";
import { FilterDropdown } from "../src/components/FilterDropdown";
import { Footer } from "../src/components/Footer";
import { GenerateDialog } from "../src/components/GenerateDialog";
import { ManualAddDialog } from "../src/components/ManualAddDialog";
import { OnboardingTour } from "../src/components/OnboardingTour";
import { QueueControls } from "../src/components/QueueControls";
import ReactDOM from "react-dom/client";
import { SearchBar } from "../src/components/SearchBar";
import { SettingsDialog } from "../src/components/SettingsDialog";
import { SortablePromptCard } from "../src/components/SortablePromptCard";
import { StatusBar } from "../src/components/StatusBar";
import { Toaster } from "../src/components/ui/toaster";
import { BatchOperationsPanel } from "../src/components/BatchOperationsPanel";
import { QueueSortMenu, type SortType } from "../src/components/QueueSortMenu";
import { log } from "../src/utils/logger";
import { storage } from "../src/utils/storage";

function SidePanel() {
  const [config, setConfig] = React.useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = React.useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = React.useState<QueueState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [manualDialogOpen, setManualDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] =
    React.useState<GeneratedPrompt | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "processing" | "completed" | "failed"
  >("all");
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<
    "all" | "video" | "image"
  >("all");
  const [darkMode, setDarkMode] = React.useState(true);
  const [detectedSettings, setDetectedSettings] =
    React.useState<DetectedSettingsType | null>(null);
  const [detectingSettings, setDetectingSettings] = React.useState(false);
  const [selectedPrompts, setSelectedPrompts] = React.useState<Set<string>>(
    new Set(),
  );
  const [enabledPrompts, setEnabledPrompts] = React.useState<Set<string>>(
    new Set(),
  );
  const [bulkDownloading, setBulkDownloading] = React.useState(false);
  const [bulkDownloadResult, setBulkDownloadResult] = React.useState<{
    success: boolean;
    successCount?: number;
    failCount?: number;
    totalCount?: number;
    error?: string;
  } | null>(null);
  const [currentSort, setCurrentSort] = React.useState<SortType | undefined>();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  React.useEffect(() => {
    loadData();
    detectSettingsFromSora();
    checkFirstTimeUser();

    const savedDarkMode = localStorage.getItem("darkMode");
    const isDarkMode = savedDarkMode === null ? true : savedDarkMode === "true";
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== "local") return;

      const relevantKeys = ["config", "prompts", "queueState"];
      const hasRelevantChanges = relevantKeys.some((key) => key in changes);

      if (!hasRelevantChanges) return;

      const isCriticalChange =
        "prompts" in changes &&
        changes.prompts?.newValue &&
        Array.isArray(changes.prompts.newValue) &&
        changes.prompts.newValue.some(
          (p: GeneratedPrompt) =>
            p.status === "processing" ||
            p.status === "completed" ||
            p.status === "failed",
        );

      if (isCriticalChange) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        loadData();
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          loadData();
          debounceTimer = null;
        }, 50);
      }
    };

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

  async function checkFirstTimeUser() {
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }

  function handleOnboardingComplete() {
    localStorage.setItem("onboardingComplete", "true");
    setShowOnboarding(false);
  }

  async function loadData() {
    try {
      const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all(
        [storage.getConfig(), storage.getPrompts(), storage.getQueueState()],
      );
      setConfig(loadedConfig);
      setPrompts(loadedPrompts);
      setQueueState(loadedQueueState);
      setLoading(false);
    } catch (error) {
      log.ui.error("loadData", error);
      setLoading(false);
    }
  }

  const filteredPrompts = React.useMemo(() => {
    let filtered = prompts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.text.toLowerCase().includes(query));
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (mediaTypeFilter !== "all") {
      filtered = filtered.filter((p) => p.mediaType === mediaTypeFilter);
    }

    return filtered;
  }, [prompts, searchQuery, statusFilter, mediaTypeFilter]);

  const pendingCount = prompts.filter((p) => p.status === "pending").length;
  const processingCount = prompts.filter(
    (p) => p.status === "processing",
  ).length;
  const completedCount = prompts.filter((p) => p.status === "completed").length;

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

  async function detectSettingsFromSora() {
    setDetectingSettings(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: "detectSettings",
      });
      if (response) {
        setDetectedSettings(response);
      }
    } catch (error) {
      log.ui.error("detectSettingsFromSora", error);
      setDetectedSettings({
        mediaType: null,
        aspectRatio: null,
        variations: null,
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to detect settings",
      });
    } finally {
      setDetectingSettings(false);
    }
  }

  async function handleStartQueue() {
    try {
      await chrome.runtime.sendMessage({ action: "startQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("handleStartQueue", error);
    }
  }

  async function handlePauseQueue() {
    try {
      await chrome.runtime.sendMessage({ action: "pauseQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("handlePauseQueue", error);
    }
  }

  async function handleResumeQueue() {
    try {
      await chrome.runtime.sendMessage({ action: "resumeQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("handleResumeQueue", error);
    }
  }

  async function handleStopQueue() {
    try {
      await chrome.runtime.sendMessage({ action: "stopQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("handleStopQueue", error);
    }
  }

  async function handleCleanCompletedAndFailed() {
    const completedCount = prompts.filter(
      (p) => p.status === "completed",
    ).length;
    const failedCount = prompts.filter((p) => p.status === "failed").length;
    const totalToDelete = completedCount + failedCount;

    if (totalToDelete === 0) return;

    const confirmed = window.confirm(
      `Delete ${totalToDelete} prompt(s)? (${completedCount} completed, ${failedCount} failed)`,
    );
    if (!confirmed) return;

    try {
      await storage.deleteCompletedAndFailed();
      await loadData();
    } catch (error) {
      log.ui.error("handleCleanCompletedAndFailed", error);
    }
  }

  async function handleEditPrompt(id: string) {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setEditingPrompt(prompt);
      setEditDialogOpen(true);
    }
  }

  async function handleSaveEditedPrompt(id: string, newText: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "edit", promptId: id, newText },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleSaveEditedPrompt", error);
      throw error;
    }
  }

  async function handleDuplicatePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "duplicate", promptId: id },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleDuplicatePrompt", error);
    }
  }

  async function handleRefinePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "refine", promptId: id },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleRefinePrompt", error);
    }
  }

  async function handleGenerateSimilar(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "generate-similar", promptId: id },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleGenerateSimilar", error);
    }
  }

  async function handleDeletePrompt(id: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data: { type: "delete", promptId: id },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleDeletePrompt", error);
    }
  }

  async function handleRetryPrompt(id: string) {
    try {
      await storage.updatePrompt(id, { status: "pending" });
      await loadData();
      log.ui.action("handleRetryPrompt:success", { promptId: id });
    } catch (error) {
      log.ui.error("handleRetryPrompt", error);
    }
  }

  async function handleAddImage(id: string, imageUrl: string) {
    try {
      await storage.updatePrompt(id, { imageUrl });
      await loadData();
    } catch (error) {
      log.ui.error("handleAddImage", error);
    }
  }

  async function handleAddLocalImage(
    id: string,
    imageData: string,
    imageName: string,
    imageType: string,
  ) {
    try {
      await storage.updatePrompt(id, {
        imageData,
        imageName,
        imageType,
        imageUrl: undefined,
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleAddLocalImage", error);
    }
  }

  async function handleRemoveImage(id: string) {
    try {
      await storage.updatePrompt(id, {
        imageUrl: undefined,
        imageData: undefined,
        imageName: undefined,
        imageType: undefined,
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleRemoveImage", error);
    }
  }

  async function handleNavigateToPrompt(id: string, text: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "navigateToPrompt",
        data: { promptId: id, promptText: text },
      });
    } catch (error) {
      log.ui.error("handleNavigateToPrompt", error);
    }
  }

  async function handleProcessPrompt(promptId: string) {
    try {
      await chrome.runtime.sendMessage({
        action: "processSelectedPrompts",
        data: { promptIds: [promptId] },
      });
      await loadData();
    } catch (error) {
      log.ui.error("handleProcessPrompt", error);
    }
  }

  async function handleProcessSelectedPrompts() {
    if (selectedPrompts.size === 0) return;

    try {
      await chrome.runtime.sendMessage({
        action: "processSelectedPrompts",
        data: { promptIds: Array.from(selectedPrompts) },
      });
      setSelectedPrompts(new Set());
      await loadData();
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

  function handleTogglePromptEnabled(promptId: string) {
    setEnabledPrompts((prev) => {
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
    if (prompts.length === 0) return;

    const confirmed = window.confirm(
      `Delete all ${prompts.length} prompt(s)? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      if (queueState?.isRunning) {
        await handleStopQueue();
      }
      await storage.clearPrompts();
      await loadData();
    } catch (error) {
      log.ui.error("handleDeleteAllPrompts", error);
    }
  }

  function handleGenerate() {
    setGenerateDialogOpen(true);
  }

  async function handleBulkDownload() {
    setBulkDownloading(true);
    setBulkDownloadResult(null);

    try {
      const result = await chrome.runtime.sendMessage({
        action: "bulkDownloadAllMedia",
      });
      setBulkDownloadResult(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setBulkDownloadResult({ success: false, error: errorMsg });
      log.ui.error("handleBulkDownload", error);
    } finally {
      setBulkDownloading(false);
    }
  }

  function handleImport() {
    setCsvDialogOpen(true);
  }

  function handleManual() {
    setManualDialogOpen(true);
  }

  function handleSettings() {
    setSettingsDialogOpen(true);
  }

  async function handleSort(sortType: SortType) {
    setCurrentSort(sortType);
    const sorted = [...prompts];

    const priorityOrder: Record<string, number> = {
      high: 3,
      normal: 2,
      low: 1,
    };

    switch (sortType) {
      case "timestamp-asc":
        sorted.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case "timestamp-desc":
        sorted.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "priority-desc":
        sorted.sort((a, b) => {
          const aPriority = priorityOrder[a.priority || "normal"];
          const bPriority = priorityOrder[b.priority || "normal"];
          return bPriority - aPriority;
        });
        break;
      case "mediaType-video":
        sorted.sort((a, b) => (a.mediaType === "video" ? -1 : 1));
        break;
      case "mediaType-image":
        sorted.sort((a, b) => (a.mediaType === "image" ? -1 : 1));
        break;
      case "status-pending":
        sorted.sort((a, b) => (a.status === "pending" ? -1 : 1));
        break;
      case "batchLabel":
        sorted.sort((a, b) => {
          const aLabel = a.batchLabel || "zzz";
          const bLabel = b.batchLabel || "zzz";
          return aLabel.localeCompare(bLabel);
        });
        break;
    }

    setPrompts(sorted);
    await storage.setPrompts(sorted);
  }

  async function handleMoveSelectedToPosition(position: number) {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const selectedItems = prompts.filter((p) => selectedIds.includes(p.id));
    const remainingItems = prompts.filter((p) => !selectedIds.includes(p.id));

    const reordered = [
      ...remainingItems.slice(0, position),
      ...selectedItems,
      ...remainingItems.slice(position),
    ];

    setPrompts(reordered);
    await storage.setPrompts(reordered);
    setSelectedPrompts(new Set());
  }

  async function handleCreateBatchFromSelected(batchLabel: string) {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    await chrome.runtime.sendMessage({
      action: "updateBatchLabels",
      data: { promptIds: selectedIds, batchLabel },
    });

    await loadData();
    setSelectedPrompts(new Set());
  }

  async function handleSetPriorityForSelected(
    priority: "high" | "normal" | "low",
  ) {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    await chrome.runtime.sendMessage({
      action: "updatePromptPriority",
      data: { promptIds: selectedIds, priority },
    });

    await loadData();
    setSelectedPrompts(new Set());
  }

  async function handleDeleteSelected() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected prompt(s)?`,
    );
    if (!confirmed) return;

    for (const id of selectedIds) {
      await storage.deletePrompt(id);
    }

    await loadData();
    setSelectedPrompts(new Set());
  }

  async function handleGeneratePrompts(
    count: number,
    context: string,
    onProgress?: (current: number, total: number) => void,
  ) {
    if (!config) return;

    const mediaType = detectedSettings?.mediaType || config.mediaType;
    const aspectRatio = detectedSettings?.aspectRatio;
    const variations = detectedSettings?.variations;

    const batchSize = config.batchSize || 10;
    const batches = Math.ceil(count / batchSize);
    let totalGenerated = 0;

    try {
      for (let i = 0; i < batches; i++) {
        const remainingCount = count - totalGenerated;
        const batchCount = Math.min(remainingCount, batchSize);

        const response = await chrome.runtime.sendMessage({
          action: "generatePrompts",
          data: {
            context,
            count: batchCount,
            mediaType,
            useSecretPrompt: config.useSecretPrompt,
            aspectRatio,
            variations,
          },
        });

        if (response.success) {
          const actualCount = response.count || 0;
          totalGenerated += actualCount;

          if (onProgress) {
            onProgress(totalGenerated, count);
          }

          if (i < batches - 1 && totalGenerated < count) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } else {
          throw new Error(response.error || "Failed to generate prompts");
        }
      }

      await loadData();
    } catch (error) {
      log.ui.error("handleGeneratePrompts", error);
      throw error;
    }
  }

  async function handleImportCSV(newPrompts: GeneratedPrompt[]) {
    await storage.addPrompts(newPrompts);
    await loadData();
  }

  async function handleManualAdd(newPrompts: GeneratedPrompt[]) {
    await storage.addPrompts(newPrompts);
    await loadData();
  }

  async function handleSaveSettings(updates: Partial<PromptConfig>) {
    if (!config) return;

    const newConfig = { ...config, ...updates };
    await storage.setConfig(newConfig);
    setConfig(newConfig);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = prompts.findIndex((p) => p.id === active.id);
    const newIndex = prompts.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedPrompts = arrayMove(prompts, oldIndex, newIndex);
    setPrompts(reorderedPrompts);
    await storage.setPrompts(reorderedPrompts);
  }

  if (loading) {
    return (
      <div className="sidepanel-container flex items-center justify-center min-h-screen">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!config || !queueState) {
    return (
      <div className="sidepanel-container flex items-center justify-center min-h-screen">
        <div className="text-sm text-destructive">
          Failed to load configuration
        </div>
      </div>
    );
  }

  return (
    <div className="sidepanel-container bg-background space-y-3">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}

      <header className="border-b pb-2 space-y-2 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">
            Sora Queue
          </h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              title="Show tour"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
              data-tour="help"
            >
              <FaQuestion className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              title="Toggle dark mode"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
            >
              {darkMode ? (
                <FaSun className="h-3.5 w-3.5" />
              ) : (
                <FaMoon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <StatusBar
          pendingCount={pendingCount}
          processingCount={processingCount}
          completedCount={completedCount}
        />
      </header>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-9">
          <TabsTrigger value="queue" className="text-xs" data-tour="queue-tab">
            <FaList className="h-3 w-3 mr-1.5" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3 mt-3">
          <QueueControls
            queueState={queueState}
            totalCount={prompts.length}
            prompts={prompts}
            onStart={handleStartQueue}
            onPause={handlePauseQueue}
            onResume={handleResumeQueue}
            onStop={handleStopQueue}
            onCleanCompletedAndFailed={handleCleanCompletedAndFailed}
            onGeneratePrompts={handleGenerate}
            onManualAdd={handleManual}
            completedCount={
              prompts.filter((p) => p.status === "completed").length
            }
            failedCount={prompts.filter((p) => p.status === "failed").length}
          />

          <div className="p-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <FaImages className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Bulk Download</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                disabled={bulkDownloading}
                className="h-7 text-xs gap-1.5"
                title="Download all from Sora library"
              >
                {bulkDownloading ? (
                  <FaSpinner className="h-3 w-3 animate-spin" />
                ) : (
                  <FaDownload className="h-3 w-3" />
                )}
              </Button>
            </div>
            {bulkDownloadResult && (
              <div
                className={`mt-1.5 text-xs p-1.5 rounded ${
                  bulkDownloadResult.success
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {bulkDownloadResult.success
                  ? `${bulkDownloadResult.successCount}/${bulkDownloadResult.totalCount} downloaded`
                  : bulkDownloadResult.error}
              </div>
            )}
          </div>

          {prompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                <FilterDropdown
                  statusFilter={statusFilter}
                  mediaTypeFilter={mediaTypeFilter}
                  onStatusFilterChange={setStatusFilter}
                  onMediaTypeFilterChange={setMediaTypeFilter}
                  promptCount={prompts.length}
                  filteredCount={filteredPrompts.length}
                />
              </div>
            </div>
          )}

          {prompts.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 text-xs gap-1.5"
                >
                  {selectedPrompts.size === filteredPrompts.length ? (
                    <FaCheckSquare className="h-3 w-3" />
                  ) : (
                    <FaSquare className="h-3 w-3" />
                  )}
                  {selectedPrompts.size > 0
                    ? `${selectedPrompts.size}`
                    : "Select"}
                </Button>
                {selectedPrompts.size > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleProcessSelectedPrompts}
                    className="h-7 text-xs gap-1.5"
                  >
                    <FaPlay className="h-3 w-3" />
                    Run ({selectedPrompts.size})
                  </Button>
                )}
              </div>
              <div className="flex gap-1.5">
                <QueueSortMenu onSort={handleSort} currentSort={currentSort} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportDialogOpen(true)}
                  className="h-7 text-xs"
                >
                  <FaDownload className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAllPrompts}
                  className="h-7 text-xs"
                >
                  <FaTrash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <BatchOperationsPanel
            selectedCount={selectedPrompts.size}
            onMoveToPosition={handleMoveSelectedToPosition}
            onCreateBatch={handleCreateBatchFromSelected}
            onSetPriority={handleSetPriorityForSelected}
            onEnableAll={() => {
              selectedPrompts.forEach((id) => enabledPrompts.delete(id));
              setEnabledPrompts(new Set(enabledPrompts));
            }}
            onDisableAll={() => {
              selectedPrompts.forEach((id) => enabledPrompts.add(id));
              setEnabledPrompts(new Set(enabledPrompts));
            }}
            onDeleteSelected={handleDeleteSelected}
            onClearSelection={() => setSelectedPrompts(new Set())}
            totalPrompts={prompts.length}
          />

          <div className="space-y-2">
            {prompts.length === 0 ? (
              <EmptyState
                onGenerate={handleGenerate}
                onImport={handleImport}
                onManual={handleManual}
              />
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-2">
                  No prompts match filters
                </p>
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
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredPrompts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {filteredPrompts.map((prompt) => (
                      <SortablePromptCard
                        key={prompt.id}
                        prompt={prompt}
                        isSelected={selectedPrompts.has(prompt.id)}
                        isEnabled={!enabledPrompts.has(prompt.id)}
                        onToggleSelection={handleTogglePromptSelection}
                        onToggleEnabled={handleTogglePromptEnabled}
                        onProcess={handleProcessPrompt}
                        onNavigateToPrompt={handleNavigateToPrompt}
                        onEdit={handleEditPrompt}
                        onDuplicate={handleDuplicatePrompt}
                        onRefine={handleRefinePrompt}
                        onGenerateSimilar={handleGenerateSimilar}
                        onDelete={handleDeletePrompt}
                        onRetry={handleRetryPrompt}
                        onAddImage={handleAddImage}
                        onAddLocalImage={handleAddLocalImage}
                        onRemoveImage={handleRemoveImage}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3 mt-3">
          <SettingsDialog
            config={config}
            isOpen={true}
            onClose={() => {}}
            onSave={handleSaveSettings}
            detectedSettings={detectedSettings}
            embedded={true}
          />
        </TabsContent>
      </Tabs>

      {config && (
        <>
          <GenerateDialog
            config={config}
            isOpen={generateDialogOpen}
            onClose={() => setGenerateDialogOpen(false)}
            onGenerate={handleGeneratePrompts}
            detectedSettings={detectedSettings}
          />

          <CSVImportDialog
            config={config}
            isOpen={csvDialogOpen}
            onClose={() => setCsvDialogOpen(false)}
            onImport={handleImportCSV}
          />

          <ManualAddDialog
            config={config}
            isOpen={manualDialogOpen}
            onClose={() => setManualDialogOpen(false)}
            onAdd={handleManualAdd}
          />

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

          <ExportDialog
            isOpen={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            prompts={
              selectedPrompts.size > 0
                ? prompts.filter((p) => selectedPrompts.has(p.id))
                : filteredPrompts.length > 0
                  ? filteredPrompts
                  : prompts
            }
          />
        </>
      )}

      <Footer />
      <Toaster />
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <SidePanel />
    </ErrorBoundary>,
  );
}

export default SidePanel;
