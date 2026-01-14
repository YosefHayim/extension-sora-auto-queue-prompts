import { useCallback } from "react";
import { log } from "../utils/logger";

export function useQueueActions(loadData: () => Promise<void>) {
  const startQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: "startQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("useQueueActions:startQueue", error);
    }
  }, [loadData]);

  const pauseQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: "pauseQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("useQueueActions:pauseQueue", error);
    }
  }, [loadData]);

  const resumeQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: "resumeQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("useQueueActions:resumeQueue", error);
    }
  }, [loadData]);

  const stopQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: "stopQueue" });
      await loadData();
    } catch (error) {
      log.ui.error("useQueueActions:stopQueue", error);
    }
  }, [loadData]);

  const cleanCompletedAndFailed = useCallback(
    async (prompts: Array<{ status: string }>) => {
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
        const { storage } = await import("../utils/storage");
        await storage.deleteCompletedAndFailed();
        await loadData();
      } catch (error) {
        log.ui.error("useQueueActions:cleanCompletedAndFailed", error);
      }
    },
    [loadData],
  );

  return {
    startQueue,
    pauseQueue,
    resumeQueue,
    stopQueue,
    cleanCompletedAndFailed,
  };
}
