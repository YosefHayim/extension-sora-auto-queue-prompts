import { storage } from '~utils/storage';
import { PromptGenerator } from '~utils/promptGenerator';
import { queueProcessor } from '~utils/queueProcessor';
import { PromptActions } from '~utils/promptActions';
import type { GeneratedPrompt, PromptEditAction } from '~types';

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sora Auto Queue Prompts extension installed');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = async () => {
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
          return { success: true };

        case 'pauseQueue':
          await queueProcessor.pauseQueue();
          return { success: true };

        case 'resumeQueue':
          await queueProcessor.resumeQueue();
          return { success: true };

        case 'stopQueue':
          await queueProcessor.stopQueue();
          return { success: true };

        case 'promptAction':
          return await handlePromptAction(request.data);

        case 'enhancePrompt':
          return await handleEnhancePrompt(request.data);

        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

    // Check if should auto-generate on received
    await queueProcessor.onPromptsReceived();

    return { success: true, count: prompts.length };
  }

  return { success: false, error: result.error };
}

async function handleGetNextPrompt() {
  const prompts = await storage.getPrompts();
  const nextPrompt = prompts.find((p) => p.status === 'pending');

  if (nextPrompt) {
    await storage.updatePrompt(nextPrompt.id, { status: 'processing' });
    return { success: true, prompt: nextPrompt };
  }

  return { success: false, error: 'No pending prompts' };
}

async function handleMarkPromptComplete(promptId: string) {
  await storage.updatePrompt(promptId, { status: 'completed' });

  // Move to history
  const prompts = await storage.getPrompts();
  const completedPrompt = prompts.find((p) => p.id === promptId);
  if (completedPrompt) {
    await storage.addToHistory([completedPrompt]);
  }

  return { success: true };
}

async function handlePromptAction(action: PromptEditAction) {
  const config = await storage.getConfig();
  const promptActions = new PromptActions(config.apiKey);

  return await promptActions.executeAction(action);
}

async function handleEnhancePrompt(data: { text: string; mediaType: 'video' | 'image' }) {
  const config = await storage.getConfig();
  const generator = new PromptGenerator(config.apiKey);

  return await generator.enhancePrompt(data.text, data.mediaType);
}
