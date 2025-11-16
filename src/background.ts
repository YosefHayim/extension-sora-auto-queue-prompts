import { storage } from '~utils/storage';
import { PromptGenerator } from '~utils/promptGenerator';
import type { GeneratedPrompt } from '~types';

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sora Auto Queue Prompts extension installed');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generatePrompts') {
    handleGeneratePrompts(request.data)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (request.action === 'getNextPrompt') {
    handleGetNextPrompt()
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'markPromptComplete') {
    handleMarkPromptComplete(request.promptId)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function handleGeneratePrompts(data: {
  context: string;
  count: number;
  mediaType: 'video' | 'image';
}) {
  const config = await storage.getConfig();
  const generator = new PromptGenerator(config.apiKey);

  const result = await generator.generatePrompts({
    context: data.context,
    count: data.count,
    mediaType: data.mediaType,
  });

  if (result.success) {
    const prompts: GeneratedPrompt[] = result.prompts.map((text, index) => ({
      id: `${Date.now()}-${index}`,
      text,
      timestamp: Date.now(),
      status: 'pending',
      mediaType: data.mediaType,
    }));

    await storage.addPrompts(prompts);
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
