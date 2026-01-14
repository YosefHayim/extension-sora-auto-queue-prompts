import { useCallback } from "react";
import { storage } from "../utils/storage";
import { log } from "../utils/logger";

export function usePromptActions(loadData: () => Promise<void>) {
  const editPrompt = useCallback(
    async (id: string, newText: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "edit", promptId: id, newText },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:editPrompt", error);
        throw error;
      }
    },
    [loadData],
  );

  const duplicatePrompt = useCallback(
    async (id: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "duplicate", promptId: id },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:duplicatePrompt", error);
      }
    },
    [loadData],
  );

  const refinePrompt = useCallback(
    async (id: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "refine", promptId: id },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:refinePrompt", error);
      }
    },
    [loadData],
  );

  const generateSimilar = useCallback(
    async (id: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "generate-similar", promptId: id },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:generateSimilar", error);
      }
    },
    [loadData],
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "promptAction",
          data: { type: "delete", promptId: id },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:deletePrompt", error);
      }
    },
    [loadData],
  );

  const retryPrompt = useCallback(
    async (id: string) => {
      try {
        await storage.updatePrompt(id, { status: "pending" });
        await loadData();
        log.ui.action("usePromptActions:retryPrompt:success", { promptId: id });
      } catch (error) {
        log.ui.error("usePromptActions:retryPrompt", error);
      }
    },
    [loadData],
  );

  const addImage = useCallback(
    async (id: string, imageUrl: string) => {
      try {
        await storage.updatePrompt(id, { imageUrl });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:addImage", error);
      }
    },
    [loadData],
  );

  const addLocalImage = useCallback(
    async (
      id: string,
      imageData: string,
      imageName: string,
      imageType: string,
    ) => {
      try {
        await storage.updatePrompt(id, {
          imageData,
          imageName,
          imageType,
          imageUrl: undefined,
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:addLocalImage", error);
      }
    },
    [loadData],
  );

  const removeImage = useCallback(
    async (id: string) => {
      try {
        await storage.updatePrompt(id, {
          imageUrl: undefined,
          imageData: undefined,
          imageName: undefined,
          imageType: undefined,
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:removeImage", error);
      }
    },
    [loadData],
  );

  const navigateToPrompt = useCallback(async (id: string, text: string) => {
    try {
      await chrome.runtime.sendMessage({
        action: "navigateToPrompt",
        data: { promptId: id, promptText: text },
      });
    } catch (error) {
      log.ui.error("usePromptActions:navigateToPrompt", error);
    }
  }, []);

  const processPrompt = useCallback(
    async (promptId: string) => {
      try {
        await chrome.runtime.sendMessage({
          action: "processSelectedPrompts",
          data: { promptIds: [promptId] },
        });
        await loadData();
      } catch (error) {
        log.ui.error("usePromptActions:processPrompt", error);
      }
    },
    [loadData],
  );

  return {
    editPrompt,
    duplicatePrompt,
    refinePrompt,
    generateSimilar,
    deletePrompt,
    retryPrompt,
    addImage,
    addLocalImage,
    removeImage,
    navigateToPrompt,
    processPrompt,
  };
}
