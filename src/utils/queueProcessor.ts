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

    // Simulate processing (in real implementation, this would send to Sora)
    await this.processPrompt(nextPrompt);

    // Mark as completed
    await storage.updatePrompt(nextPrompt.id, { status: 'completed' });
    await storage.addToHistory([nextPrompt]);

    // Update processed count
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
      const tabs = await chrome.tabs.query({ url: '*://sora.com/*' });

      if (tabs.length === 0) {
        throw new Error('No Sora tab found. Please open sora.com');
      }

      const soraTab = tabs[0];

      if (!soraTab.id) {
        throw new Error('Invalid Sora tab');
      }

      // Send prompt to content script
      logger.info('queueProcessor', `Submitting prompt to Sora: ${prompt.text.substring(0, 50)}...`);

      const response = await chrome.tabs.sendMessage(soraTab.id, {
        action: 'submitPrompt',
        prompt: prompt,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit prompt');
      }

      logger.info('queueProcessor', 'Prompt submitted successfully');
    } catch (error) {
      logger.error('queueProcessor', 'Failed to process prompt', { error });
      throw error;
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
      const newPrompts: GeneratedPrompt[] = result.prompts.map((text, index) => ({
        id: `${Date.now()}-${index}`,
        text,
        timestamp: Date.now(),
        status: 'pending',
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
