import { useEffect, useState, useCallback } from "react";
import type {
  GeneratedPrompt,
  PromptConfig,
  QueueState,
  RateLimitState,
} from "../types";
import { storage } from "../utils/storage";
import { log } from "../utils/logger";

export function useQueueData() {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isLimited: false,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
      log.ui.error("useQueueData:loadData", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

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
  }, [loadData]);

  return {
    config,
    setConfig,
    prompts,
    setPrompts,
    queueState,
    setQueueState,
    rateLimitState,
    setRateLimitState,
    loading,
    loadData,
  };
}
