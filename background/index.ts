import { storage } from '../src/utils/storage';
import { PromptGenerator } from '../src/utils/promptGenerator';
import { queueProcessor } from '../src/utils/queueProcessor';
import { PromptActions } from '../src/utils/promptActions';
import { logger, log } from '../src/utils/logger';
import type { GeneratedPrompt, PromptEditAction, AspectRatio, PresetType } from '../src/types';

/**
 * Network Activity Monitor
 * Tracks requests to DataDog RUM endpoint to detect when generation is complete
 */
class NetworkMonitor {
  private monitoredTabs: Map<number, {
    lastRequestTime: number;
    checkInterval: number | null;
    onComplete: () => void;
  }> = new Map();

  private readonly DATADOG_PATTERN = 'https://browser-intake-datadoghq.com/api/v2/rum';
  private readonly SILENCE_THRESHOLD = 30000; // 30 seconds
  private readonly CHECK_INTERVAL = 5000; // Check every 5 seconds

  constructor() {
    this.setupWebRequestListener();
  }

  private setupWebRequestListener() {
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        if (details.url.startsWith(this.DATADOG_PATTERN)) {
          this.handleRequest(details.tabId);
        }
      },
      { urls: ['https://browser-intake-datadoghq.com/*'] }
    );
  }

  private handleRequest(tabId: number) {
    const monitored = this.monitoredTabs.get(tabId);
    if (monitored) {
      monitored.lastRequestTime = Date.now();
      logger.debug('networkMonitor', `DataDog request detected for tab ${tabId}`, {
        lastRequestTime: new Date(monitored.lastRequestTime).toISOString(),
      });
    }
  }

  startMonitoring(tabId: number, onComplete: () => void) {
    logger.info('networkMonitor', `Starting network monitoring for tab ${tabId}`);

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

    logger.debug('networkMonitor', `Checking completion for tab ${tabId}`, {
      timeSinceLastRequest: `${timeSinceLastRequest / 1000}s`,
      threshold: `${this.SILENCE_THRESHOLD / 1000}s`,
    });

    if (timeSinceLastRequest >= this.SILENCE_THRESHOLD) {
      logger.info('networkMonitor', `Generation completed for tab ${tabId} - no requests for 30s`);
      this.stopMonitoring(tabId);
      monitored.onComplete();
    }
  }

  stopMonitoring(tabId: number) {
    const monitored = this.monitoredTabs.get(tabId);
    if (monitored) {
      logger.info('networkMonitor', `Stopping network monitoring for tab ${tabId}`);
      if (monitored.checkInterval !== null) {
        clearInterval(monitored.checkInterval as unknown as number);
      }
      this.monitoredTabs.delete(tabId);
    }
  }
}

// Initialize network monitor
const networkMonitor = new NetworkMonitor();

/**
 * Queue Recovery Mechanism
 * Resets any stale 'processing' prompts back to 'pending' on extension startup.
 * This handles cases where the extension was closed/crashed while processing prompts.
 */
async function recoverStalePrompts() {
  try {
    const prompts = await storage.getPrompts();
    const stalePrompts = prompts.filter((p) => p.status === 'processing');

    if (stalePrompts.length > 0) {
      logger.info('queue', `Recovering ${stalePrompts.length} stale prompts`);

      // Reset all processing prompts to pending
      for (const prompt of stalePrompts) {
        await storage.updatePrompt(prompt.id, { status: 'pending' });
      }

      logger.info('queue', `Successfully recovered ${stalePrompts.length} prompts to pending status`);
    } else {
      logger.debug('queue', 'No stale prompts found - queue is clean');
    }
  } catch (error) {
    log.extension.error('recoverStalePrompts', error instanceof Error ? error : new Error('Unknown error'));
  }
}

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  logger.info('extension', 'Service worker started');
  recoverStalePrompts();
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    log.extension.installed();
  } else if (details.reason === 'update') {
    log.extension.updated(chrome.runtime.getManifest().version);
  }

  // Recover stale prompts on install/update
  recoverStalePrompts();
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = async () => {
    logger.debug('background', `Message received: ${request.action}`, { data: request.data });

    try {
      switch (request.action) {
        case 'generatePrompts':
          return await handleGeneratePrompts(request.data);

        case 'getNextPrompt':
          return await handleGetNextPrompt();

        case 'markPromptComplete':
          return await handleMarkPromptComplete(request.promptId);

        case 'startQueue':
          await queueProcessor.startQueue();
          log.queue.start();
          return { success: true };

        case 'pauseQueue':
          await queueProcessor.pauseQueue();
          log.queue.pause();
          return { success: true };

        case 'resumeQueue':
          await queueProcessor.resumeQueue();
          log.queue.resume();
          return { success: true };

        case 'stopQueue':
          await queueProcessor.stopQueue();
          log.queue.stop();
          return { success: true };

        case 'promptAction':
          return await handlePromptAction(request.data);

        case 'enhancePrompt':
          return await handleEnhancePrompt(request.data);

        case 'getLogs':
          return { success: true, logs: await logger.getLogs(request.filter) };

        case 'clearLogs':
          await logger.clearLogs();
          return { success: true };

        case 'exportLogs':
          await logger.exportLogs(request.filename);
          return { success: true };

        case 'contentLog':
          // Log from content script - store in logger AND console
          const prefix = '[Content Script]';
          const logLevel = request.level || 'info';

          // Store in logger for Debug tab visibility
          log.content.log(logLevel, request.message, request.data);

          // Also log to console for real-time debugging
          if (logLevel === 'error') {
            console.error(prefix, request.message, request.data || '');
          } else if (logLevel === 'warn') {
            console.warn(prefix, request.message, request.data || '');
          } else {
            console.log(prefix, request.message, request.data || '');
          }
          return { success: true };

        case 'startNetworkMonitoring':
          return await handleStartNetworkMonitoring(request.tabId, sender.tab?.id);

        case 'stopNetworkMonitoring':
          networkMonitor.stopMonitoring(request.tabId || sender.tab?.id || 0);
          return { success: true };

        default:
          logger.warn('background', `Unknown action: ${request.action}`);
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
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

async function handleStartNetworkMonitoring(requestTabId: number | undefined, senderTabId: number | undefined) {
  const tabId = requestTabId || senderTabId;

  if (!tabId) {
    logger.error('background', 'Cannot start network monitoring - no tab ID');
    return { success: false, error: 'No tab ID provided' };
  }

  return new Promise<{ success: boolean }>((resolve) => {
    networkMonitor.startMonitoring(tabId, async () => {
      // Generation completed - notify the content script
      try {
        await chrome.tabs.sendMessage(tabId, {
          action: 'generationComplete',
        });
        logger.info('background', `Notified tab ${tabId} that generation is complete`);
        resolve({ success: true });
      } catch (error) {
        logger.error('background', `Failed to notify tab ${tabId} of completion`, { error });
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
  mediaType: 'video' | 'image';
  useSecretPrompt?: boolean;
  aspectRatio?: string;
  variations?: number;
  preset?: string;
}) {
  logger.info('background', 'Generating prompts', { count: data.count, mediaType: data.mediaType });

  const config = await storage.getConfig();
  const generator = new PromptGenerator(config.apiKey);

  const result = await generator.generatePrompts({
    context: data.context,
    count: data.count,
    mediaType: data.mediaType,
    useSecretPrompt: data.useSecretPrompt ?? config.useSecretPrompt,
  });

  if (result.success) {
    const prompts: GeneratedPrompt[] = result.prompts.map((text: string, index: number) => ({
      id: `${Date.now()}-${index}`,
      text,
      timestamp: Date.now(),
      status: 'pending' as const,
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

  logger.error('background', 'Failed to generate prompts', { error: result.error });
  return { success: false, error: result.error };
}

async function handleGetNextPrompt() {
  const prompts = await storage.getPrompts();
  const nextPrompt = prompts.find((p) => p.status === 'pending');

  if (nextPrompt) {
    await storage.updatePrompt(nextPrompt.id, { status: 'processing' });
    logger.debug('background', `Next prompt: ${nextPrompt.id}`);
    return { success: true, prompt: nextPrompt };
  }

  logger.warn('background', 'No pending prompts in queue');
  return { success: false, error: 'No pending prompts' };
}

async function handleMarkPromptComplete(promptId: string) {
  await storage.updatePrompt(promptId, { status: 'completed' });
  log.queue.completed(promptId);

  // Move to history
  const prompts = await storage.getPrompts();
  const completedPrompt = prompts.find((p) => p.id === promptId);
  if (completedPrompt) {
    await storage.addToHistory([completedPrompt]);
  }

  return { success: true };
}

async function handlePromptAction(action: PromptEditAction) {
  logger.info('background', `Prompt action: ${action.type}`, { promptId: action.promptId });

  const config = await storage.getConfig();

  // Check if API key is required for this action type
  const apiKeyRequired = ['refine', 'generate-similar'].includes(action.type);
  if (apiKeyRequired && !config.apiKey) {
    const errorMsg = 'OpenAI API key is required for this action. Please configure it in Settings.';
    logger.error('background', `Prompt action ${action.type} failed - no API key`, { promptId: action.promptId });
    return {
      success: false,
      error: errorMsg,
    };
  }

  const promptActions = new PromptActions(config.apiKey);

  const result = await promptActions.executeAction(action);

  if (result.success) {
    logger.info('background', `Prompt action ${action.type} completed`, { promptId: action.promptId });
  } else {
    logger.error('background', `Prompt action ${action.type} failed`, { promptId: action.promptId, error: result.error });
  }

  return result;
}

async function handleEnhancePrompt(data: { text: string; mediaType: 'video' | 'image' }) {
  logger.info('background', 'Enhancing prompt', { mediaType: data.mediaType });

  const config = await storage.getConfig();
  const generator = new PromptGenerator(config.apiKey);

  const result = await generator.enhancePrompt(data.text, data.mediaType);

  if (result.success) {
    logger.info('background', 'Prompt enhanced successfully');
  } else {
    logger.error('background', 'Failed to enhance prompt', { error: result.error });
  }

  return result;
}

