import { storage } from './storage';
import { PromptGenerator } from './promptGenerator';
import { logger, log } from './logger';
import type { GeneratedPrompt, PromptConfig } from '../types';

export class QueueProcessor {
  private isProcessing = false;
  private currentTimeoutId: number | null = null;

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async startQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    await storage.setQueueState({ isRunning: true, isPaused: false });
    await this.processNext();
  }

  async pauseQueue(): Promise<void> {
    await storage.pauseQueue();
    if (this.currentTimeoutId !== null) {
      clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = null;
    }
  }

  async resumeQueue(): Promise<void> {
    await storage.resumeQueue();
    await this.processNext();
  }

  async stopQueue(): Promise<void> {
    this.isProcessing = false;
    await storage.stopQueue();
    if (this.currentTimeoutId !== null) {
      clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = null;
    }
  }

  private async processNext(): Promise<void> {
    const queueState = await storage.getQueueState();

    // Check if paused
    if (queueState.isPaused) {
      return;
    }

    // Check if stopped
    if (!this.isProcessing || !queueState.isRunning) {
      return;
    }

    const prompts = await storage.getPrompts();
    const nextPrompt = prompts.find((p) => p.status === 'pending');

    // No more pending prompts
    if (!nextPrompt) {
      await this.handleEmptyQueue();
      return;
    }

    // Update prompt status
    await storage.updatePrompt(nextPrompt.id, { status: 'processing' });
    await storage.setQueueState({ currentPromptId: nextPrompt.id });

    try {
      // Process the prompt (send to Sora)
      await this.processPrompt(nextPrompt);

      // Mark as completed
      await storage.updatePrompt(nextPrompt.id, { status: 'completed' });
      await storage.addToHistory([nextPrompt]);

      logger.info('queueProcessor', `Prompt completed: ${nextPrompt.text.substring(0, 50)}...`);
    } catch (error) {
      // Mark as failed
      await storage.updatePrompt(nextPrompt.id, { status: 'failed' });

      // Properly log the error
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('queueProcessor', `Prompt failed: ${nextPrompt.text.substring(0, 50)}...`, {
        errorMessage: errorMsg,
        errorStack: errorStack,
        errorType: error?.constructor?.name,
      });

      // Don't stop the queue, just log and continue
      console.error('[Sora Auto Queue] Failed to process prompt:', errorMsg, errorStack);
    }

    // Update processed count (count both completed and failed)
    const newProcessedCount = queueState.processedCount + 1;
    await storage.setQueueState({ processedCount: newProcessedCount });

    // Get random delay before next prompt
    const config = await storage.getConfig();
    const delay = this.getRandomDelay(config.minDelayMs, config.maxDelayMs);

    // Schedule next prompt with random delay
    this.currentTimeoutId = window.setTimeout(async () => {
      await this.processNext();
    }, delay);
  }

  private async processPrompt(prompt: GeneratedPrompt): Promise<void> {
    try {
      // Find the Sora tab
      logger.info('queueProcessor', 'Looking for Sora tab...');
      const tabs = await chrome.tabs.query({ url: '*://sora.com/*' });

      logger.info('queueProcessor', `Found ${tabs.length} matching tabs`);

      if (tabs.length === 0) {
        const errorMsg = 'No Sora tab found. Please open sora.com in a browser tab.';
        logger.error('queueProcessor', errorMsg);
        throw new Error(errorMsg);
      }

      const soraTab = tabs[0];
      logger.info('queueProcessor', 'Sora tab found', {
        tabId: soraTab.id,
        url: soraTab.url,
        title: soraTab.title?.substring(0, 50),
      });

      if (!soraTab.id) {
        throw new Error('Invalid Sora tab - no tab ID');
      }

      // Send prompt to content script
      logger.info('queueProcessor', `Submitting prompt to tab ${soraTab.id}: ${prompt.text.substring(0, 50)}...`);

      const response = await chrome.tabs.sendMessage(soraTab.id, {
        action: 'submitPrompt',
        prompt: prompt,
      });

      logger.info('queueProcessor', 'Received response from content script', {
        success: response?.success,
        hasError: !!response?.error,
      });

      if (!response || !response.success) {
        const errorMsg = response?.error || 'Content script did not respond or failed';
        logger.error('queueProcessor', 'Content script error', { errorMsg });
        throw new Error(errorMsg);
      }

      logger.info('queueProcessor', 'Prompt submitted successfully');
    } catch (error) {
      // Properly serialize error for logging
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('queueProcessor', 'Failed to process prompt', {
        errorMessage: errorMsg,
        errorStack: errorStack,
        errorType: error?.constructor?.name,
      });

      // Re-throw with proper error message
      throw new Error(errorMsg);
    }
  }

  private async handleEmptyQueue(): Promise<void> {
    const config = await storage.getConfig();

    // Check if auto-generate on empty is enabled
    if (config.autoGenerateOnEmpty && config.contextPrompt && config.apiKey) {
      console.log('Queue empty, auto-generating new prompts...');
      await this.autoGeneratePrompts(config);

      // Process the newly generated prompts
      await this.processNext();
    } else {
      // Stop the queue
      await this.stopQueue();
    }
  }

  private async autoGeneratePrompts(config: PromptConfig): Promise<void> {
    const generator = new PromptGenerator(config.apiKey);

    const result = await generator.generatePrompts({
      context: config.contextPrompt,
      count: config.batchSize,
      mediaType: config.mediaType,
      useSecretPrompt: config.useSecretPrompt,
    });

    if (result.success) {
      const newPrompts: GeneratedPrompt[] = result.prompts.map((text: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        text,
        timestamp: Date.now(),
        status: 'pending' as const,
        mediaType: config.mediaType,
        variations: config.variationCount,
        enhanced: config.useSecretPrompt,
      }));

      await storage.addPrompts(newPrompts);

      // Update queue state
      const queueState = await storage.getQueueState();
      await storage.setQueueState({
        totalCount: queueState.totalCount + newPrompts.length,
      });
    }
  }

  async onPromptsReceived(): Promise<void> {
    const config = await storage.getConfig();

    // Check if auto-generate on received is enabled
    if (config.autoGenerateOnReceived && config.contextPrompt && config.apiKey) {
      console.log('Prompts received, auto-generating additional prompts...');
      await this.autoGeneratePrompts(config);
    }
  }
}

// Singleton instance
export const queueProcessor = new QueueProcessor();
