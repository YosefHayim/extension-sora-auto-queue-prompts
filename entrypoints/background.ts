import type {
  AspectRatio,
  GeneratedPrompt,
  PresetType,
  PromptEditAction,
} from "../src/types";
import { log, logger } from "../src/utils/logger";

import { PromptActions } from "../src/utils/promptActions";
import { PromptGenerator } from "../src/utils/promptGenerator";
import { generateUniqueId } from "../src/lib/utils";
import { queueProcessor } from "../src/utils/queueProcessor";
import { storage } from "../src/utils/storage";

/**
 * Network Activity Monitor
 * Tracks requests to DataDog RUM endpoint to detect when generation is complete
 */
class NetworkMonitor {
  private monitoredTabs: Map<
    number,
    {
      lastRequestTime: number;
      checkInterval: number | null;
      onComplete: () => void;
    }
  > = new Map();

  private readonly DATADOG_PATTERN =
    "https://browser-intake-datadoghq.com/api/v2/rum";
  private readonly SILENCE_THRESHOLD = 30000; // 30 seconds
  private readonly CHECK_INTERVAL = 5000; // Check every 5 seconds

  constructor() {
    // Only setup listener if we're in a browser environment (not during build)
    if (typeof chrome !== "undefined" && chrome.webRequest) {
      this.setupWebRequestListener();
    }
  }

  private setupWebRequestListener() {
    if (typeof chrome === "undefined" || !chrome.webRequest) {
      return;
    }
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        if (details.url.startsWith(this.DATADOG_PATTERN)) {
          this.handleRequest(details.tabId);
        }
      },
      { urls: ["https://browser-intake-datadoghq.com/*"] },
    );
  }

  private handleRequest(tabId: number) {
    const monitored = this.monitoredTabs.get(tabId);
    if (monitored) {
      monitored.lastRequestTime = Date.now();
      logger.debug(
        "networkMonitor",
        `DataDog request detected for tab ${tabId}`,
        {
          lastRequestTime: new Date(monitored.lastRequestTime).toISOString(),
        },
      );
    }
  }

  startMonitoring(tabId: number, onComplete: () => void) {
    logger.info(
      "networkMonitor",
      `Starting network monitoring for tab ${tabId}`,
    );

    // Clear any existing monitoring for this tab
    this.stopMonitoring(tabId);

    // Set initial request time to now
    const checkInterval = setInterval(() => {
      this.checkForCompletion(tabId);
    }, this.CHECK_INTERVAL) as unknown as number;

    this.monitoredTabs.set(tabId, {
      lastRequestTime: Date.now(),
      checkInterval,
      onComplete,
    });
  }

  private checkForCompletion(tabId: number) {
    const monitored = this.monitoredTabs.get(tabId);
    if (!monitored) return;

    const timeSinceLastRequest = Date.now() - monitored.lastRequestTime;

    logger.debug("networkMonitor", `Checking completion for tab ${tabId}`, {
      timeSinceLastRequest: `${timeSinceLastRequest / 1000}s`,
      threshold: `${this.SILENCE_THRESHOLD / 1000}s`,
    });

    if (timeSinceLastRequest >= this.SILENCE_THRESHOLD) {
      logger.info(
        "networkMonitor",
        `Generation completed for tab ${tabId} - no requests for 30s`,
      );
      this.stopMonitoring(tabId);
      monitored.onComplete();
    }
  }

  stopMonitoring(tabId: number) {
    const monitored = this.monitoredTabs.get(tabId);
    if (monitored) {
      logger.info(
        "networkMonitor",
        `Stopping network monitoring for tab ${tabId}`,
      );
      if (monitored.checkInterval !== null) {
        clearInterval(monitored.checkInterval as unknown as number);
      }
      this.monitoredTabs.delete(tabId);
    }
  }
}

// Initialize network monitor lazily (only when needed, not during build)
let networkMonitor: NetworkMonitor | null = null;

function getNetworkMonitor(): NetworkMonitor {
  if (!networkMonitor) {
    networkMonitor = new NetworkMonitor();
  }
  return networkMonitor;
}

// WXT requires background scripts to use defineBackground
export default defineBackground(() => {
  /**
   * Update extension badge to indicate queue status
   * Shows a green dot when queue is running, clears when stopped
   */
  async function updateExtensionBadge() {
    try {
      if (typeof chrome === "undefined" || !chrome.action) {
        return;
      }

      const queueState = await storage.getQueueState();

      if (queueState.isRunning && !queueState.isPaused) {
        // Queue is running - show green dot
        const processedCount = queueState.processedCount || 0;
        const totalCount = queueState.totalCount || 0;
        const remaining = totalCount - processedCount;

        // Show green dot to indicate queue is running
        await chrome.action.setBadgeText({ text: "●" });
        await chrome.action.setBadgeBackgroundColor({ color: "#22c55e" }); // green-500

        // Set title for hover tooltip
        const statusText =
          remaining > 0
            ? `Queue running: ${processedCount}/${totalCount} processed, ${remaining} remaining`
            : `Queue running: ${processedCount}/${totalCount} processed`;
        await chrome.action.setTitle({
          title: `Sora Auto Queue - ${statusText}`,
        });
      } else if (queueState.isRunning && queueState.isPaused) {
        // Queue is paused - show yellow badge
        await chrome.action.setBadgeText({ text: "⏸" });
        await chrome.action.setBadgeBackgroundColor({ color: "#eab308" }); // yellow-500
        await chrome.action.setTitle({
          title: "Sora Auto Queue - Queue is paused",
        });
      } else {
        // Queue is stopped - clear badge
        await chrome.action.setBadgeText({ text: "" });
        await chrome.action.setTitle({ title: "Sora Auto Queue" });
      }
    } catch (error) {
      // Silently fail if badge API is not available (e.g., during build)
      logger.debug("background", "Failed to update extension badge", { error });
    }
  }
  /**
   * Queue Recovery Mechanism
   * Resets any stale 'processing' prompts back to 'pending' on extension startup.
   * This handles cases where the extension was closed/crashed while processing prompts.
   */
  async function recoverStalePrompts() {
    try {
      const prompts = await storage.getPrompts();
      const stalePrompts = prompts.filter((p) => p.status === "processing");

      if (stalePrompts.length > 0) {
        logger.info("queue", `Recovering ${stalePrompts.length} stale prompts`);

        // Reset all processing prompts to pending
        for (const prompt of stalePrompts) {
          await storage.updatePrompt(prompt.id, { status: "pending" });
        }

        logger.info(
          "queue",
          `Successfully recovered ${stalePrompts.length} prompts to pending status`,
        );
      } else {
        logger.debug("queue", "No stale prompts found - queue is clean");
      }
    } catch (error) {
      log.extension.error(
        "recoverStalePrompts",
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  }

  // Listen for extension startup
  chrome.runtime.onStartup.addListener(async () => {
    logger.info("extension", "Service worker started");
    await recoverStalePrompts();
    // Update badge to reflect current queue state
    await updateExtensionBadge();
  });

  // Listen for extension installation
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      log.extension.installed();
    } else if (details.reason === "update") {
      log.extension.updated(chrome.runtime.getManifest().version);
    }

    // Recover stale prompts on install/update
    await recoverStalePrompts();
    // Update badge to reflect current queue state
    await updateExtensionBadge();
  });

  // Listen for storage changes to update badge when queue state changes
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== "local") return;

    // Update badge when queue state changes
    if (changes.queueState) {
      await updateExtensionBadge();
    }
  });

  // Handle messages from popup and content scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handler = async () => {
      logger.debug("background", `Message received: ${request.action}`, {
        data: request.data,
      });

      try {
        switch (request.action) {
          case "generatePrompts":
            return await handleGeneratePrompts(request.data);

          case "getNextPrompt":
            return await handleGetNextPrompt();

          case "markPromptComplete":
            return await handleMarkPromptComplete(request.promptId);

          case "updatePromptProgress":
            return await handleUpdatePromptProgress(
              request.promptId,
              request.progress,
            );

          case "startQueue":
            await queueProcessor.startQueue();
            log.queue.start();
            await updateExtensionBadge();
            return { success: true };

          case "pauseQueue":
            await queueProcessor.pauseQueue();
            log.queue.pause();
            await updateExtensionBadge();
            return { success: true };

          case "resumeQueue":
            await queueProcessor.resumeQueue();
            log.queue.resume();
            await updateExtensionBadge();
            return { success: true };

          case "stopQueue":
            await queueProcessor.stopQueue();
            log.queue.stop();
            await updateExtensionBadge();
            return { success: true };

          case "processSelectedPrompts":
            await queueProcessor.processSelectedPrompts(request.data.promptIds);
            log.queue.start();
            return { success: true };

          case "promptAction":
            return await handlePromptAction(request.data);

          case "enhancePrompt":
            return await handleEnhancePrompt(request.data);

          case "getLogs":
            return {
              success: true,
              logs: await logger.getLogs(request.filter),
            };

          case "clearLogs":
            await logger.clearLogs();
            return { success: true };

          case "detectSettings":
            return await handleDetectSettings();

          case "exportLogs":
            await logger.exportLogs(request.filename);
            return { success: true };

          case "contentLog":
            // Log from content script - store in logger AND console
            const prefix = "[Content Script]";
            const logLevel = request.level || "info";

            // Store in logger for Debug tab visibility
            log.content.log(logLevel, request.message, request.data);

            // Also log to console for real-time debugging
            if (logLevel === "error") {
              console.error(prefix, request.message, request.data || "");
            } else if (logLevel === "warn") {
              console.warn(prefix, request.message, request.data || "");
            } else {
              console.log(prefix, request.message, request.data || "");
            }
            return { success: true };

          case "startNetworkMonitoring":
            return await handleStartNetworkMonitoring(
              request.tabId,
              sender.tab?.id,
            );

          case "stopNetworkMonitoring":
            if (networkMonitor) {
              networkMonitor.stopMonitoring(
                request.tabId || sender.tab?.id || 0,
              );
            }
            return { success: true };

          case "navigateToPrompt":
            return await handleNavigateToPrompt(request.data.promptText);

          case "setMediaType":
            return await handleSetMediaType(request.data.mediaType);

          default:
            logger.warn("background", `Unknown action: ${request.action}`);
            return { success: false, error: "Unknown action" };
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        log.extension.error(request.action, err);
        return {
          success: false,
          error: err.message,
        };
      }
    };

    handler().then(sendResponse);
    return true; // Will respond asynchronously
  });

  async function handleStartNetworkMonitoring(
    requestTabId: number | undefined,
    senderTabId: number | undefined,
  ) {
    const tabId = requestTabId || senderTabId;

    if (!tabId) {
      logger.error("background", "Cannot start network monitoring - no tab ID");
      return { success: false, error: "No tab ID provided" };
    }

    const monitor = getNetworkMonitor();

    return new Promise<{ success: boolean }>((resolve) => {
      monitor.startMonitoring(tabId, async () => {
        // Generation completed - notify the content script
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: "generationComplete",
          });
          logger.info(
            "background",
            `Notified tab ${tabId} that generation is complete`,
          );
          resolve({ success: true });
        } catch (error) {
          logger.error(
            "background",
            `Failed to notify tab ${tabId} of completion`,
            { error },
          );
          resolve({ success: false });
        }
      });

      // Immediately return success for starting monitoring
      resolve({ success: true });
    });
  }

  async function handleGeneratePrompts(data: {
    context: string;
    count: number;
    mediaType: "video" | "image";
    useSecretPrompt?: boolean;
    aspectRatio?: string;
    variations?: number;
    preset?: string;
  }) {
    logger.info("background", "Generating prompts", {
      count: data.count,
      mediaType: data.mediaType,
    });

    const config = await storage.getConfig();
    const generator = new PromptGenerator(config.apiKey, config.apiProvider);

    const result = await generator.generatePrompts({
      context: data.context,
      count: data.count,
      mediaType: data.mediaType,
      useSecretPrompt: data.useSecretPrompt ?? config.useSecretPrompt,
    });

    if (result.success) {
      const prompts: GeneratedPrompt[] = result.prompts.map((text: string) => ({
        id: generateUniqueId(),
        text,
        timestamp: Date.now(),
        status: "pending" as const,
        mediaType: data.mediaType,
        aspectRatio: data.aspectRatio as AspectRatio | undefined,
        variations: data.variations,
        preset: data.preset as PresetType | undefined,
        enhanced: data.useSecretPrompt ?? config.useSecretPrompt,
      }));

      await storage.addPrompts(prompts);
      log.prompt.generated(prompts.length, data.mediaType);

      // Check if should auto-generate on received
      await queueProcessor.onPromptsReceived();

      return { success: true, count: prompts.length };
    }

    logger.error("background", "Failed to generate prompts", {
      error: result.error,
    });
    return { success: false, error: result.error };
  }

  async function handleGetNextPrompt() {
    const prompts = await storage.getPrompts();
    const nextPrompt = prompts.find((p) => p.status === "pending");

    if (nextPrompt) {
      await storage.updatePrompt(nextPrompt.id, { status: "processing" });
      logger.debug("background", `Next prompt: ${nextPrompt.id}`);
      return { success: true, prompt: nextPrompt };
    }

    logger.warn("background", "No pending prompts in queue");
    return { success: false, error: "No pending prompts" };
  }

  async function handleMarkPromptComplete(promptId: string) {
    // Get prompt to calculate duration
    const prompts = await storage.getPrompts();
    const prompt = prompts.find((p) => p.id === promptId);

    if (prompt && prompt.startTime) {
      const completedTime = Date.now();
      const duration = completedTime - prompt.startTime;

      await storage.updatePrompt(promptId, {
        status: "completed",
        completedTime,
        duration,
      });
    } else {
      await storage.updatePrompt(promptId, { status: "completed" });
    }

    log.queue.completed(promptId);

    // Move to history
    const completedPrompt = prompts.find((p) => p.id === promptId);
    if (completedPrompt) {
      await storage.addToHistory([completedPrompt]);

      // Handle Telegram Notification
      const config = await storage.getConfig();
      if (config.telegramBotToken && config.telegramChatId) {
        try {
          const message = `✅ Generation Complete!\n\n${completedPrompt.text.substring(0, 200)}${completedPrompt.text.length > 200 ? "..." : ""}\n\nType: ${completedPrompt.mediaType}\nDuration: ${duration ? Math.round(duration / 1000) + "s" : "N/A"}`;
          await fetch(
            `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: config.telegramChatId,
                text: message,
              }),
            },
          );
          logger.info("background", "Telegram notification sent");
        } catch (error) {
          logger.error("background", "Failed to send Telegram notification", {
            error,
          });
        }
      }
    }

    // Continue processing the next prompt in the queue
    // Get the current queue state to check if we should continue
    const queueState = await storage.getQueueState();
    const allPrompts = await storage.getPrompts();
    const pendingPrompts = allPrompts.filter((p) => p.status === "pending");

    if (
      queueState.isRunning &&
      !queueState.isPaused &&
      pendingPrompts.length > 0
    ) {
      // Recalculate processed count based on actual prompt statuses
      const allPrompts = await storage.getPrompts();
      const completedCount = allPrompts.filter(
        (p) => p.status === "completed" || p.status === "failed",
      ).length;
      await storage.setQueueState({ processedCount: completedCount });
      await updateExtensionBadge();

      // Get config for delay
      const config = await storage.getConfig();
      const minDelay = config.minDelayMs || 2000;
      const maxDelay = config.maxDelayMs || 5000;
      const delay =
        Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      // Schedule next prompt processing
      setTimeout(async () => {
        await queueProcessor.processNext();
      }, delay);
    } else if (queueState.isRunning && pendingPrompts.length === 0) {
      // All prompts completed, stop queue and reset timer
      // Recalculate final count before stopping
      const allPrompts = await storage.getPrompts();
      const finalProcessedCount = allPrompts.filter(
        (p) => p.status === "completed" || p.status === "failed",
      ).length;
      await storage.setQueueState({ processedCount: finalProcessedCount });
      await queueProcessor.stopQueue();
      await updateExtensionBadge();
    }

    return { success: true };
  }

  async function handleUpdatePromptProgress(
    promptId: string,
    progress: number,
  ) {
    // Update prompt progress
    await storage.updatePrompt(promptId, { progress });

    // If progress reaches 100%, automatically mark as complete
    if (progress >= 100) {
      logger.info(
        "background",
        `Progress reached 100%, auto-completing prompt`,
        {
          promptId,
        },
      );
      // Small delay to ensure the generation is fully complete
      setTimeout(async () => {
        await handleMarkPromptComplete(promptId);
      }, 1000); // 1 second delay
    }

    return { success: true };
  }

  async function handlePromptAction(action: PromptEditAction) {
    logger.info("background", `Prompt action: ${action.type}`, {
      promptId: action.promptId,
    });

    const config = await storage.getConfig();

    // Check if API key is required for this action type
    const apiKeyRequired = ["refine", "generate-similar"].includes(action.type);
    if (apiKeyRequired && !config.apiKey) {
      const errorMsg =
        "API key is required for this action. Please configure it in Settings.";
      logger.error(
        "background",
        `Prompt action ${action.type} failed - no API key`,
        { promptId: action.promptId },
      );
      return {
        success: false,
        error: errorMsg,
      };
    }

    const promptActions = new PromptActions(config.apiKey, config.apiProvider);

    const result = await promptActions.executeAction(action);

    if (result.success) {
      logger.info("background", `Prompt action ${action.type} completed`, {
        promptId: action.promptId,
      });
    } else {
      logger.error("background", `Prompt action ${action.type} failed`, {
        promptId: action.promptId,
        error: result.error,
      });
    }

    return result;
  }

  async function handleEnhancePrompt(data: {
    text: string;
    mediaType: "video" | "image";
  }) {
    logger.info("background", "Enhancing prompt", {
      mediaType: data.mediaType,
    });

    const config = await storage.getConfig();
    const generator = new PromptGenerator(config.apiKey, config.apiProvider);

    const result = await generator.enhancePrompt(data.text, data.mediaType);

    if (result.success) {
      logger.info("background", "Prompt enhanced successfully");
    } else {
      logger.error("background", "Failed to enhance prompt", {
        error: result.error,
      });
    }

    return result;
  }

  async function handleDetectSettings() {
    logger.info("background", "Detecting settings from Sora page");

    try {
      // Find the Sora tab
      let tabs = await chrome.tabs.query({ url: "*://sora.com/*" });
      if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: "*://sora.chatgpt.com/*" });
      }

      if (tabs.length === 0) {
        return {
          mediaType: null,
          aspectRatio: null,
          variations: null,
          success: false,
          error: "No Sora tab found. Please open sora.com in a browser tab.",
        };
      }

      const soraTab = tabs[0];
      if (!soraTab.id) {
        return {
          mediaType: null,
          aspectRatio: null,
          variations: null,
          success: false,
          error: "Invalid Sora tab - no tab ID",
        };
      }

      // Ensure content script is loaded
      await queueProcessor["ensureContentScriptLoaded"](soraTab.id);

      // Send detectSettings message
      const response = await chrome.tabs.sendMessage(soraTab.id, {
        action: "detectSettings",
      });

      if (response && response.success !== undefined) {
        logger.info("background", "Settings detected", response);
        return response;
      }

      return {
        mediaType: null,
        aspectRatio: null,
        variations: null,
        success: false,
        error: "Failed to detect settings from Sora page",
      };
    } catch (error) {
      logger.error("background", "Failed to detect settings", { error });
      return {
        mediaType: null,
        aspectRatio: null,
        variations: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async function handleSetMediaType(mediaType: "video" | "image") {
    try {
      logger.info(
        "background",
        `Setting media type to ${mediaType} on Sora page`,
      );

      // Find the Sora tab
      let tabs = await chrome.tabs.query({ url: "*://sora.com/*" });
      if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: "*://sora.chatgpt.com/*" });
      }

      if (tabs.length === 0) {
        return {
          success: false,
          error: "No Sora tab found. Please open sora.com in a browser tab.",
        };
      }

      const soraTab = tabs[0];
      if (!soraTab.id) {
        return { success: false, error: "Invalid Sora tab" };
      }

      // Ensure content script is loaded
      await queueProcessor["ensureContentScriptLoaded"](soraTab.id);

      // Send message to content script
      const response = await chrome.tabs.sendMessage(soraTab.id, {
        action: "setMediaType",
        mediaType,
      });

      if (response && response.success) {
        logger.info(
          "background",
          `Successfully set media type to ${mediaType}`,
        );
        return { success: true };
      } else {
        logger.warn("background", "Failed to set media type", {
          error: response?.error,
        });
        return {
          success: false,
          error: response?.error || "Failed to set media type",
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("background", "Set media type failed", { error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }

  async function handleNavigateToPrompt(promptText: string) {
    try {
      logger.info("background", "Navigating to prompt", {
        promptLength: promptText.length,
      });

      // Find the Sora tab
      let tabs = await chrome.tabs.query({ url: "*://sora.com/*" });
      if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: "*://sora.chatgpt.com/*" });
      }

      if (tabs.length === 0) {
        return {
          success: false,
          error: "No Sora tab found. Please open sora.com in a browser tab.",
        };
      }

      const soraTab = tabs[0];
      if (!soraTab.id) {
        return { success: false, error: "Invalid Sora tab" };
      }

      // Activate the tab
      await chrome.tabs.update(soraTab.id, { active: true });

      // Wait a bit for tab to activate
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Send message to content script to find and highlight
      try {
        const response = await chrome.tabs.sendMessage(soraTab.id, {
          action: "navigateToPrompt",
          promptText: promptText,
        });

        if (response && response.success) {
          logger.info("background", "Successfully navigated to prompt");
          return { success: true };
        } else {
          logger.warn("background", "Content script navigation failed", {
            error: response?.error,
          });
          return {
            success: false,
            error: response?.error || "Failed to navigate to prompt",
          };
        }
      } catch (error) {
        logger.error("background", "Failed to send navigate message", {
          error,
        });
        // Try to inject content script if not loaded
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts || [];
        if (contentScripts.length > 0) {
          const scriptFiles = contentScripts[0].js || [];
          if (scriptFiles.length > 0) {
            await chrome.scripting.executeScript({
              target: { tabId: soraTab.id },
              files: [scriptFiles[0]],
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Retry
            const retryResponse = await chrome.tabs.sendMessage(soraTab.id, {
              action: "navigateToPrompt",
              promptText: promptText,
            });
            return (
              retryResponse || {
                success: false,
                error: "Content script not responding",
              }
            );
          }
        }
        return { success: false, error: "Content script not loaded" };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("background", "Navigate to prompt failed", {
        error: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  }

  // Initialize badge on background script startup
  updateExtensionBadge();
});
