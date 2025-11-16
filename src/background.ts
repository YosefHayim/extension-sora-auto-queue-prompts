import { storage } from './utils/storage';
import { PromptGenerator } from './utils/promptGenerator';
import { queueProcessor } from './utils/queueProcessor';
import { PromptActions } from './utils/promptActions';
import { logger, log } from './utils/logger';
import type { GeneratedPrompt, PromptEditAction } from './types';

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    log.extension.installed();
  } else if (details.reason === 'update') {
    log.extension.updated(chrome.runtime.getManifest().version);
  }
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
    const prompts: GeneratedPrompt[] = result.prompts.map((text, index) => ({
      id: `${Date.now()}-${index}`,
      text,
      timestamp: Date.now(),
      status: 'pending',
      mediaType: data.mediaType,
      aspectRatio: data.aspectRatio as any,
      variations: data.variations,
      preset: data.preset as any,
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
