import "../src/styles/globals.css";

import * as React from "react";

import type {
  DetectedSettings as DetectedSettingsType,
  GeneratedPrompt,
  PromptConfig,
  QueueState,
  RateLimitState,
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
  LuCheck,
  LuDownload,
  LuEllipsis,
  LuList,
  LuMoon,
  LuPlay,
  LuCircleHelp,
  LuArrowUpDown,
  LuLoader,
  LuSquare,
  LuSun,
  LuTrash2,
  LuSparkles,
} from "react-icons/lu";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
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
import { RateLimitCountdown } from "../src/components/RateLimitCountdown";
import ReactDOM from "react-dom/client";
import { SearchBar } from "../src/components/SearchBar";
import { SettingsDialog } from "../src/components/SettingsDialog";
import { SortablePromptCard } from "../src/components/SortablePromptCard";
import { PromptCard } from "../src/components/PromptCard";
import {
  BulkInputDialog,
  type BulkInputType,
  type SelectOption,
} from "../src/components/BulkInputDialog";
import {
  LuChevronLeft,
  LuChevronRight,
  LuReplace,
  LuCirclePlus,
  LuCircleMinus,
  LuImagePlus,
  LuPalette,
  LuFilm,
  LuRatio,
  LuLayers,
} from "react-icons/lu";
import { StatusBar } from "../src/components/StatusBar";
import { Toaster } from "../src/components/ui/toaster";
import { BatchOperationsPanel } from "../src/components/BatchOperationsPanel";
import type { SortType } from "../src/components/QueueSortMenu";
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
  const [rateLimitState, setRateLimitState] = React.useState<RateLimitState>({
    isLimited: false,
  });

  const [bulkDialog, setBulkDialog] = React.useState<{
    isOpen: boolean;
    type: BulkInputType;
    title: string;
    description?: string;
    inputLabel: string;
    inputPlaceholder?: string;
    confirmLabel: string;
    options?: SelectOption[];
    icon?: React.ReactNode;
    onConfirm: (value: string | { search: string; replace: string }) => void;
  } | null>(null);

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

      const relevantKeys = [
        "config",
        "prompts",
        "queueState",
        "rateLimitState",
      ];
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

  async function handleLaunchDemo() {
    const demoPrompt: GeneratedPrompt = {
      id: `demo-${Date.now()}`,
      text: "A cinematic slow-motion shot of a golden retriever running through a field of sunflowers at sunset, with lens flares and warm golden hour lighting",
      timestamp: Date.now(),
      status: "pending",
      mediaType: "video",
      aspectRatio: "16:9",
      variations: 2,
      enhanced: true,
    };

    const updatedPrompts = [demoPrompt, ...prompts];
    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
  }

  async function loadData() {
    try {
      const [
        loadedConfig,
        loadedPrompts,
        loadedQueueState,
        loadedRateLimitState,
      ] = await Promise.all([
        storage.getConfig(),
        storage.getPrompts(),
        storage.getQueueState(),
        storage.getRateLimitState(),
      ]);
      setConfig(loadedConfig);
      setPrompts(loadedPrompts);
      setQueueState(loadedQueueState);
      setRateLimitState(loadedRateLimitState);
      setLoading(false);
    } catch (error) {
      log.ui.error("loadData", error);
      setLoading(false);
    }
  }

  async function handleDismissRateLimit() {
    await chrome.runtime.sendMessage({ action: "clearRateLimitState" });
    setRateLimitState({ isLimited: false });
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

  async function handleSaveEditedPrompt(
    id: string,
    newText: string,
    mediaType?: "video" | "image",
  ) {
    try {
      const data: any = { type: "edit", promptId: id, newText };
      if (mediaType) {
        data.mediaType = mediaType;
      }
      await chrome.runtime.sendMessage({
        action: "promptAction",
        data,
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

  async function handleOpenPriorityDialog() {
    const priority = window.prompt(
      "Set priority for selected prompts:\n\nEnter: high, normal, or low",
      "normal",
    );
    if (priority && ["high", "normal", "low"].includes(priority)) {
      await handleSetPriorityForSelected(priority as "high" | "normal" | "low");
    }
  }

  async function handleOpenBatchLabelDialog() {
    const batchLabel = window.prompt(
      "Enter batch label for selected prompts:",
      "",
    );
    if (batchLabel && batchLabel.trim()) {
      await handleCreateBatchFromSelected(batchLabel);
    }
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

  // ============================================
  // Bulk Operations Handlers
  // ============================================

  // Text Operations
  function handleAddPrefix() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "text",
      title: "Add Prefix",
      description:
        "Text will be added to the beginning of each selected prompt.",
      inputLabel: "Prefix text",
      inputPlaceholder: "e.g., 'Cinematic shot of'",
      confirmLabel: "Add Prefix",
      icon: <LuChevronLeft className="h-5 w-5" />,
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, text: `${value.trim()} ${p.text}` }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleAddSuffix() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "text",
      title: "Add Suffix",
      description: "Text will be added to the end of each selected prompt.",
      inputLabel: "Suffix text",
      inputPlaceholder: "e.g., ', 4K, cinematic lighting'",
      confirmLabel: "Add Suffix",
      icon: <LuChevronRight className="h-5 w-5" />,
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, text: `${p.text} ${value.trim()}` }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleSearchReplace() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "search-replace",
      title: "Search & Replace",
      description: "Find and replace text in all selected prompts.",
      inputLabel: "",
      confirmLabel: "Replace All",
      icon: <LuReplace className="h-5 w-5" />,
      onConfirm: async (value) => {
        if (typeof value === "string") return;
        const { search, replace } = value;
        if (!search) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, text: p.text.split(search).join(replace) }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleAddPositivePrompt() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "textarea",
      title: "Add Positive Prompt",
      description:
        "Quality-enhancing terms will be appended to each selected prompt.",
      inputLabel: "Positive prompt text",
      inputPlaceholder:
        "e.g., high quality, detailed, 4K, cinematic lighting, sharp focus",
      confirmLabel: "Add to All",
      icon: <LuCirclePlus className="h-5 w-5 text-green-500" />,
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, text: `${p.text}, ${value.trim()}` }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleAddNegativePrompt() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "textarea",
      title: "Add Negative Prompt",
      description: "Terms to avoid will be appended to each selected prompt.",
      inputLabel: "Negative prompt text",
      inputPlaceholder: "e.g., blurry, low quality, distorted, watermark",
      confirmLabel: "Add to All",
      icon: <LuCircleMinus className="h-5 w-5 text-red-500" />,
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, text: `${p.text}. Avoid: ${value.trim()}` }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleAddImageToAll() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "text",
      title: "Add Image to All",
      description: "Enter an image URL to attach to all selected prompts.",
      inputLabel: "Image URL",
      inputPlaceholder: "https://example.com/image.jpg",
      confirmLabel: "Add Image",
      icon: <LuImagePlus className="h-5 w-5" />,
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id) ? { ...p, imageUrl: value.trim() } : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleSetPresetForAll() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "select",
      title: "Set Preset",
      description: "Choose a preset to apply to all selected prompts.",
      inputLabel: "Select preset",
      confirmLabel: "Apply Preset",
      icon: <LuPalette className="h-5 w-5 text-amber-500" />,
      options: [
        { value: "cinematic", label: "Cinematic" },
        { value: "documentary", label: "Documentary" },
        { value: "artistic", label: "Artistic" },
        { value: "realistic", label: "Realistic" },
        { value: "animated", label: "Animated" },
        { value: "none", label: "None" },
      ],
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id) ? { ...p, preset: value } : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  async function handleRandomPresetToEach() {
    if (selectedPrompts.size === 0) return;
    const selectedIds = Array.from(selectedPrompts);
    const presets = [
      "cinematic",
      "documentary",
      "artistic",
      "realistic",
      "animated",
    ];
    const updatedPrompts = prompts.map((p) => {
      if (selectedIds.includes(p.id)) {
        const randomPreset =
          presets[Math.floor(Math.random() * presets.length)];
        return { ...p, preset: randomPreset };
      }
      return p;
    });
    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
    setSelectedPrompts(new Set());
  }

  function handleSetMediaType() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "select",
      title: "Set Media Type",
      description: "Choose the media type for all selected prompts.",
      inputLabel: "Select media type",
      confirmLabel: "Apply",
      icon: <LuFilm className="h-5 w-5" />,
      options: [
        { value: "video", label: "Video" },
        { value: "image", label: "Image" },
      ],
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id)
            ? { ...p, mediaType: value as "video" | "image" }
            : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleSetAspectRatio() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "select",
      title: "Set Aspect Ratio",
      description: "Choose the aspect ratio for all selected prompts.",
      inputLabel: "Select aspect ratio",
      confirmLabel: "Apply",
      icon: <LuRatio className="h-5 w-5" />,
      options: [
        { value: "16:9", label: "16:9 (Landscape)" },
        { value: "9:16", label: "9:16 (Portrait)" },
        { value: "1:1", label: "1:1 (Square)" },
        { value: "4:3", label: "4:3 (Standard)" },
        { value: "3:4", label: "3:4 (Portrait)" },
        { value: "21:9", label: "21:9 (Ultrawide)" },
      ],
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value) return;
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id) ? { ...p, aspectRatio: value as any } : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  function handleSetVariations() {
    if (selectedPrompts.size === 0) return;

    setBulkDialog({
      isOpen: true,
      type: "select",
      title: "Set Variations",
      description: "Choose the number of variations for all selected prompts.",
      inputLabel: "Select variations count",
      confirmLabel: "Apply",
      icon: <LuLayers className="h-5 w-5" />,
      options: [
        { value: "2", label: "2 variations" },
        { value: "4", label: "4 variations" },
      ],
      onConfirm: async (value) => {
        if (typeof value !== "string" || !value) return;
        const numVariations = parseInt(value, 10);
        const selectedIds = Array.from(selectedPrompts);
        const updatedPrompts = prompts.map((p) =>
          selectedIds.includes(p.id) ? { ...p, variations: numVariations } : p,
        );
        setPrompts(updatedPrompts);
        await storage.setPrompts(updatedPrompts);
        setSelectedPrompts(new Set());
      },
    });
  }

  // Order & Organization Operations
  async function handleDuplicateAllSelected() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const selectedItems = prompts.filter((p) => selectedIds.includes(p.id));
    const duplicates = selectedItems.map((p) => ({
      ...p,
      id: `${p.id}-dup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: "pending" as const,
    }));

    const updatedPrompts = [...prompts, ...duplicates];
    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
    setSelectedPrompts(new Set());
  }

  async function handleShuffleSelected() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length < 2) return;

    const selectedIndices = prompts
      .map((p, i) => (selectedIds.includes(p.id) ? i : -1))
      .filter((i) => i !== -1);

    const selectedItems = selectedIndices.map((i) => prompts[i]);

    // Fisher-Yates shuffle
    for (let i = selectedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedItems[i], selectedItems[j]] = [
        selectedItems[j],
        selectedItems[i],
      ];
    }

    const updatedPrompts = [...prompts];
    selectedIndices.forEach((originalIndex, newIndex) => {
      updatedPrompts[originalIndex] = selectedItems[newIndex];
    });

    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
  }

  async function handleSortSelectedAZ() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length < 2) return;

    const selectedIndices = prompts
      .map((p, i) => (selectedIds.includes(p.id) ? i : -1))
      .filter((i) => i !== -1);

    const selectedItems = selectedIndices.map((i) => prompts[i]);
    selectedItems.sort((a, b) => a.text.localeCompare(b.text));

    const updatedPrompts = [...prompts];
    selectedIndices.forEach((originalIndex, newIndex) => {
      updatedPrompts[originalIndex] = selectedItems[newIndex];
    });

    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
  }

  async function handleSortSelectedZA() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length < 2) return;

    const selectedIndices = prompts
      .map((p, i) => (selectedIds.includes(p.id) ? i : -1))
      .filter((i) => i !== -1);

    const selectedItems = selectedIndices.map((i) => prompts[i]);
    selectedItems.sort((a, b) => b.text.localeCompare(a.text));

    const updatedPrompts = [...prompts];
    selectedIndices.forEach((originalIndex, newIndex) => {
      updatedPrompts[originalIndex] = selectedItems[newIndex];
    });

    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
  }

  // AI Enhancement Operations
  async function handleEnhanceAllSelected() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Enhance ${selectedIds.length} selected prompt(s) with AI? This may take a moment.`,
    );
    if (!confirmed) return;

    try {
      for (const id of selectedIds) {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "refine", promptId: id },
        });
      }
      await loadData();
      setSelectedPrompts(new Set());
    } catch (error) {
      log.ui.error("handleEnhanceAllSelected", error);
    }
  }

  async function handleGenerateSimilarForAll() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Generate similar prompts for ${selectedIds.length} selected prompt(s)?`,
    );
    if (!confirmed) return;

    try {
      for (const id of selectedIds) {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "generate-similar", promptId: id },
        });
      }
      await loadData();
      setSelectedPrompts(new Set());
    } catch (error) {
      log.ui.error("handleGenerateSimilarForAll", error);
    }
  }

  async function handleResetToOriginal() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const promptsWithOriginal = prompts.filter(
      (p) => selectedIds.includes(p.id) && p.originalText,
    );

    if (promptsWithOriginal.length === 0) {
      window.alert("No selected prompts have original text to restore.");
      return;
    }

    const confirmed = window.confirm(
      `Reset ${promptsWithOriginal.length} prompt(s) to their original text?`,
    );
    if (!confirmed) return;

    const updatedPrompts = prompts.map((p) => {
      if (selectedIds.includes(p.id) && p.originalText) {
        return { ...p, text: p.originalText };
      }
      return p;
    });

    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
    setSelectedPrompts(new Set());
  }

  // Queue Operations
  async function handleMoveSelectedToTop() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const selectedItems = prompts.filter((p) => selectedIds.includes(p.id));
    const remainingItems = prompts.filter((p) => !selectedIds.includes(p.id));

    const reordered = [...selectedItems, ...remainingItems];

    setPrompts(reordered);
    await storage.setPrompts(reordered);
    setSelectedPrompts(new Set());
  }

  async function handleMoveSelectedToBottom() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const selectedItems = prompts.filter((p) => selectedIds.includes(p.id));
    const remainingItems = prompts.filter((p) => !selectedIds.includes(p.id));

    const reordered = [...remainingItems, ...selectedItems];

    setPrompts(reordered);
    await storage.setPrompts(reordered);
    setSelectedPrompts(new Set());
  }

  async function handleExportSelected() {
    if (selectedPrompts.size > 0) {
      setExportDialogOpen(true);
    }
  }

  // Danger Zone Operations
  async function handleClearAttachedImages() {
    const selectedIds = Array.from(selectedPrompts);
    if (selectedIds.length === 0) return;

    const promptsWithImages = prompts.filter(
      (p) => selectedIds.includes(p.id) && (p.imageUrl || p.imageData),
    );

    if (promptsWithImages.length === 0) {
      window.alert("No selected prompts have attached images.");
      return;
    }

    const confirmed = window.confirm(
      `Clear attached images from ${promptsWithImages.length} prompt(s)?`,
    );
    if (!confirmed) return;

    const updatedPrompts = prompts.map((p) => {
      if (selectedIds.includes(p.id)) {
        return {
          ...p,
          imageUrl: undefined,
          imageData: undefined,
          imageName: undefined,
          imageType: undefined,
        };
      }
      return p;
    });

    setPrompts(updatedPrompts);
    await storage.setPrompts(updatedPrompts);
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
        <LuLoader className="h-6 w-6 animate-spin text-primary" />
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
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onLaunchDemo={handleLaunchDemo}
        />
      )}

      <header className="border-b py-3 px-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuSparkles className="h-5 w-5 text-foreground" />
            <h1 className="text-base font-semibold text-foreground">
              Sora Queue
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              title="Show tour"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
              data-tour="help"
            >
              <LuCircleHelp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              title="Toggle dark mode"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
            >
              {darkMode ? (
                <LuSun className="h-3.5 w-3.5" />
              ) : (
                <LuMoon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="py-2 px-4">
        <StatusBar
          pendingCount={pendingCount}
          processingCount={processingCount}
          completedCount={completedCount}
        />
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-9">
          <TabsTrigger value="queue" className="text-xs" data-tour="queue-tab">
            <LuList className="h-3 w-3 mr-1.5" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3 mt-3">
          {rateLimitState.isLimited && (
            <RateLimitCountdown
              rateLimitState={rateLimitState}
              onDismiss={handleDismissRateLimit}
            />
          )}

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

              <div className="flex justify-between items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs gap-1.5"
                  >
                    {selectedPrompts.size === filteredPrompts.length &&
                    filteredPrompts.length > 0 ? (
                      <LuCheck className="h-3 w-3" />
                    ) : (
                      <LuSquare className="h-3 w-3" />
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
                      <LuPlay className="h-3 w-3" />
                      Run ({selectedPrompts.size})
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2.5 text-xs gap-1.5">
                    <LuEllipsis className="h-3 w-3" />
                    More
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
                      <LuArrowUpDown className="h-3 w-3" />
                      Sort by
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onSelect={() => handleSort("timestamp-asc")}
                      className={
                        currentSort === "timestamp-asc" ? "bg-accent/50" : ""
                      }
                    >
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("timestamp-desc")}
                      className={
                        currentSort === "timestamp-desc" ? "bg-accent/50" : ""
                      }
                    >
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("priority-desc")}
                      className={
                        currentSort === "priority-desc" ? "bg-accent/50" : ""
                      }
                    >
                      Priority (High → Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("mediaType-video")}
                      className={
                        currentSort === "mediaType-video" ? "bg-accent/50" : ""
                      }
                    >
                      Videos First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("mediaType-image")}
                      className={
                        currentSort === "mediaType-image" ? "bg-accent/50" : ""
                      }
                    >
                      Images First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("status-pending")}
                      className={
                        currentSort === "status-pending" ? "bg-accent/50" : ""
                      }
                    >
                      Pending First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleSort("batchLabel")}
                      className={
                        currentSort === "batchLabel" ? "bg-accent/50" : ""
                      }
                    >
                      Group by Batch
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={() => setExportDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <LuDownload className="h-3 w-3" />
                      Export Queue
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={handleDeleteAllPrompts}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LuTrash2 className="h-3 w-3" />
                      Delete All Prompts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          <BatchOperationsPanel
            selectedCount={selectedPrompts.size}
            onRunSelected={handleProcessSelectedPrompts}
            onMoveToPosition={handleMoveSelectedToPosition}
            onCreateBatch={handleOpenBatchLabelDialog}
            onSetPriority={handleOpenPriorityDialog}
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
            onAddPrefix={handleAddPrefix}
            onAddSuffix={handleAddSuffix}
            onSearchReplace={handleSearchReplace}
            onAddPositivePrompt={handleAddPositivePrompt}
            onAddNegativePrompt={handleAddNegativePrompt}
            onAddImageToAll={handleAddImageToAll}
            onSetPresetForAll={handleSetPresetForAll}
            onRandomPresetToEach={handleRandomPresetToEach}
            onSetMediaType={handleSetMediaType}
            onSetAspectRatio={handleSetAspectRatio}
            onSetVariations={handleSetVariations}
            onDuplicateAll={handleDuplicateAllSelected}
            onShuffle={handleShuffleSelected}
            onSortAZ={handleSortSelectedAZ}
            onSortZA={handleSortSelectedZA}
            onEnhanceAll={handleEnhanceAllSelected}
            onGenerateSimilar={handleGenerateSimilarForAll}
            onResetToOriginal={handleResetToOriginal}
            onMoveToTop={handleMoveSelectedToTop}
            onMoveToBottom={handleMoveSelectedToBottom}
            onExportTo={handleExportSelected}
            onClearAttachedImages={handleClearAttachedImages}
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
            ) : searchQuery ||
              statusFilter !== "all" ||
              mediaTypeFilter !== "all" ? (
              <div className="space-y-2">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
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
                    showDragHandle={false}
                  />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={prompts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
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
            onBulkDownload={handleBulkDownload}
            bulkDownloading={bulkDownloading}
            bulkDownloadResult={bulkDownloadResult}
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

      {bulkDialog && (
        <BulkInputDialog
          isOpen={bulkDialog.isOpen}
          onClose={() => setBulkDialog(null)}
          onConfirm={bulkDialog.onConfirm}
          title={bulkDialog.title}
          description={bulkDialog.description}
          inputType={bulkDialog.type}
          inputLabel={bulkDialog.inputLabel}
          inputPlaceholder={bulkDialog.inputPlaceholder}
          confirmLabel={bulkDialog.confirmLabel}
          options={bulkDialog.options}
          icon={bulkDialog.icon}
          selectedCount={selectedPrompts.size}
        />
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
