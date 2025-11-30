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
    const queueStartTime = Date.now();
    
    // Recalculate processed count based on actual prompt statuses
    const processedCount = await this.recalculateProcessedCount();
    const prompts = await storage.getPrompts();
    const totalCount = prompts.length;
    
    await storage.setQueueState({ 
      isRunning: true, 
      isPaused: false, 
      queueStartTime,
      processedCount,
      totalCount
    });
    await this.processNext();
  }

  async pauseQueue(): Promise<void> {
    await storage.pauseQueue();
    if (this.currentTimeoutId !== null) {
      clearTimeout(this.currentTimeoutId as unknown as number);
      this.currentTimeoutId = null;
    }
  }

  async resumeQueue(): Promise<void> {
    // Recalculate processed count based on actual prompt statuses before resuming
    const processedCount = await this.recalculateProcessedCount();
    await storage.setQueueState({ 
      isPaused: false,
      processedCount 
    });
    await this.processNext();
  }

  async stopQueue(): Promise<void> {
    this.isProcessing = false;
    await storage.stopQueue();
    // Reset queue start time when stopping
    await storage.setQueueState({ queueStartTime: undefined });
    if (this.currentTimeoutId !== null) {
      clearTimeout(this.currentTimeoutId as unknown as number);
      this.currentTimeoutId = null;
    }
  }

  /**
   * Recalculate processed count based on actual prompt statuses
   * This ensures accuracy when resuming after pause
   */
  private async recalculateProcessedCount(): Promise<number> {
    const prompts = await storage.getPrompts();
    // Count completed and failed prompts as processed
    const processed = prompts.filter(
      (p) => p.status === 'completed' || p.status === 'failed'
    ).length;
    return processed;
  }

  async processNext(): Promise<void> {
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
    // Only find prompts that are pending (skip completed, processing, and failed)
    const nextPrompt = prompts.find((p) => p.status === 'pending');

    // No more pending prompts
    if (!nextPrompt) {
      await this.handleEmptyQueue();
      return;
    }

    // Update prompt status and track start time
    const startTime = Date.now();
    await storage.updatePrompt(nextPrompt.id, { status: 'processing', startTime });
    await storage.setQueueState({ currentPromptId: nextPrompt.id });

    try {
      // Process the prompt (send to Sora)
      // Note: The content script will notify us via markPromptComplete when generation is done
      await this.processPrompt(nextPrompt);

      // Don't mark as completed here - wait for markPromptComplete message from content script
      // The content script will call markPromptComplete when generation actually finishes
      logger.info('queueProcessor', `Prompt submitted: ${nextPrompt.text.substring(0, 50)}...`);
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

      // Recalculate processed count based on actual statuses
      const newProcessedCount = await this.recalculateProcessedCount();
      await storage.setQueueState({ processedCount: newProcessedCount });

      // Get random delay before next prompt
      const config = await storage.getConfig();
      const delay = this.getRandomDelay(config.minDelayMs, config.maxDelayMs);

      // Schedule next prompt with random delay
      this.currentTimeoutId = setTimeout(async () => {
        await this.processNext();
      }, delay) as unknown as number;
    }
    // Note: For successful prompts, continuation is handled by handleMarkPromptComplete
    // in the background script when the content script notifies completion
  }

  private async processPrompt(prompt: GeneratedPrompt): Promise<void> {
    try {
      // Find the Sora tab (supports both sora.com and sora.chatgpt.com)
      logger.info('queueProcessor', 'Looking for Sora tab...');
      let tabs = await chrome.tabs.query({ url: '*://sora.com/*' });

      // If not found, try sora.chatgpt.com
      if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: '*://sora.chatgpt.com/*' });
      }

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

      // Ensure content script is loaded before sending message
      await this.ensureContentScriptLoaded(soraTab.id);

      // Check for generation limit before processing
      try {
        const limitCheck = await chrome.tabs.sendMessage(soraTab.id, {
          action: 'checkLimit',
        });
        
        if (limitCheck && limitCheck.found) {
          logger.warn('queueProcessor', 'Generation limit detected - stopping queue', {
            message: limitCheck.message,
          });
          
          // Stop the queue
          await this.stopQueue();
          
          // Switch to the tab
          await chrome.tabs.update(soraTab.id, { active: true });
          
          throw new Error(`Generation limit reached: ${limitCheck.message || 'Please try again later'}`);
        }
      } catch (limitError) {
        // If it's our limit error, re-throw it
        if (limitError instanceof Error && limitError.message.includes('Generation limit reached')) {
          throw limitError;
        }
        // Otherwise, it might be a connection error - continue with processing
        logger.debug('queueProcessor', 'Limit check failed (might be connection issue), continuing', {
          error: limitError instanceof Error ? limitError.message : String(limitError),
        });
      }

      // Send prompt to content script with retries
      logger.info('queueProcessor', `Submitting prompt to tab ${soraTab.id}: ${prompt.text.substring(0, 50)}...`);

      const response = await this.sendMessageWithRetry(soraTab.id, {
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

  /**
   * Ensure content script is loaded in the tab
   * Checks if content script is loaded and injects it if needed
   */
  private async ensureContentScriptLoaded(tabId: number): Promise<void> {
    const maxWaitTime = 3000; // 3 seconds max wait
    const checkInterval = 200; // Check every 200ms
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      try {
        // Try to ping the content script
        const pingResponse = await chrome.tabs.sendMessage(tabId, {
          action: 'ping',
        });
        
        if (pingResponse && pingResponse.loaded) {
          logger.debug('queueProcessor', 'Content script is loaded and ready');
          return;
        }
      } catch (pingError) {
        // Content script not loaded yet, wait and retry
        const errorMsg = pingError instanceof Error ? pingError.message : String(pingError);
        
        if (errorMsg.includes('Receiving end does not exist')) {
          // Content script not loaded, wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          elapsed += checkInterval;
          continue;
        } else {
          // Different error, might be a real problem
          logger.warn('queueProcessor', 'Unexpected error pinging content script', {
            error: errorMsg,
          });
          // Wait a bit and try one more time
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          elapsed += checkInterval;
          continue;
        }
      }
    }

    // If we get here, content script didn't respond - try to inject it manually
    logger.info('queueProcessor', 'Content script not loaded, attempting to inject manually', {
      tabId,
    });

    try {
      // Get the content script file from manifest
      const manifest = chrome.runtime.getManifest();
      const contentScripts = manifest.content_scripts || [];
      
      if (contentScripts.length > 0) {
        const contentScript = contentScripts[0];
        const scriptFiles = contentScript.js || [];
        
        if (scriptFiles.length > 0) {
          const scriptPath = scriptFiles[0];
          logger.info('queueProcessor', `Injecting content script: ${scriptPath}`);
          
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: [scriptPath],
            });
            
            logger.info('queueProcessor', 'Content script injected successfully, waiting for initialization...');
            
            // Wait for script to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try ping again
            const pingResponse = await chrome.tabs.sendMessage(tabId, {
              action: 'ping',
            });
            
            if (pingResponse && pingResponse.loaded) {
              logger.info('queueProcessor', 'Content script loaded after manual injection');
              return;
            }
          } catch (injectError) {
            const injectErrorMsg = injectError instanceof Error ? injectError.message : String(injectError);
            logger.error('queueProcessor', 'Failed to inject content script', {
              error: injectErrorMsg,
              scriptPath,
            });
          }
        }
      }
    } catch (error) {
      logger.error('queueProcessor', 'Error attempting to inject content script', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // If we still can't reach the content script, throw an error
    throw new Error('Content script is not loaded. Please refresh the Sora tab and try again.');
  }

  /**
   * Send message to content script with retries
   */
  private async sendMessageWithRetry(
    tabId: number,
    message: { action: string; prompt?: GeneratedPrompt },
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        lastError = error instanceof Error ? error : new Error(String(error));

        // If it's a connection error and we have retries left, try again
        if (errorMsg.includes('Receiving end does not exist') && attempt < maxRetries) {
          logger.warn('queueProcessor', `Message send failed (attempt ${attempt}/${maxRetries}), retrying...`, {
            error: errorMsg,
          });

          // Try to re-inject the content script
          await this.ensureContentScriptLoaded(tabId);
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        // If it's not a connection error or we're out of retries, throw
        throw error;
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Failed to send message after retries');
  }

  private async handleEmptyQueue(): Promise<void> {
    const config = await storage.getConfig();
    const prompts = await storage.getPrompts();
    
    // Recalculate final processed count
    const finalProcessedCount = await this.recalculateProcessedCount();
    await storage.setQueueState({ processedCount: finalProcessedCount, totalCount: prompts.length });

    // Check if auto-generate on empty is enabled
    if (config.autoGenerateOnEmpty && config.contextPrompt && config.apiKey) {
      console.log('Queue empty, auto-generating new prompts...');
      await this.autoGeneratePrompts(config);

      // Process the newly generated prompts
      await this.processNext();
    } else {
      // Stop the queue and reset timer
      await this.stopQueue();
    }
  }

  private async autoGeneratePrompts(config: PromptConfig): Promise<void> {
    const generator = new PromptGenerator(config.apiKey, config.apiProvider);

    const result = await generator.generatePrompts({
      context: config.contextPrompt,
      count: config.batchSize,
      mediaType: config.mediaType,
      useSecretPrompt: config.useSecretPrompt,
    });

    if (result.success) {
      const { generateUniqueId } = await import('../lib/utils');
      const newPrompts: GeneratedPrompt[] = result.prompts.map((text: string) => ({
        id: generateUniqueId(),
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

  /**
   * Process specific prompts by their IDs
   * This allows manual processing of selected prompts
   */
  async processSelectedPrompts(promptIds: string[]): Promise<void> {
    if (promptIds.length === 0) {
      return;
    }

    const prompts = await storage.getPrompts();
    const selectedPrompts = prompts.filter((p) => promptIds.includes(p.id) && p.status === 'pending');

    if (selectedPrompts.length === 0) {
      logger.warn('queueProcessor', 'No pending prompts found in selection');
      return;
    }

    logger.info('queueProcessor', `Processing ${selectedPrompts.length} selected prompt(s)`);

    // Process prompts sequentially with delays
    for (let i = 0; i < selectedPrompts.length; i++) {
      const prompt = selectedPrompts[i];
      
      try {
        // Update prompt status and track start time
        const startTime = Date.now();
        await storage.updatePrompt(prompt.id, { status: 'processing', startTime });
        await storage.setQueueState({ currentPromptId: prompt.id });

        // Process the prompt
        await this.processPrompt(prompt);
        logger.info('queueProcessor', `Prompt submitted: ${prompt.text.substring(0, 50)}...`);

        // Add delay between prompts (except for the last one)
        if (i < selectedPrompts.length - 1) {
          const config = await storage.getConfig();
          const delay = this.getRandomDelay(config.minDelayMs || 2000, config.maxDelayMs || 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        // Mark as failed
        await storage.updatePrompt(prompt.id, { status: 'failed' });

        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        logger.error('queueProcessor', `Prompt failed: ${prompt.text.substring(0, 50)}...`, {
          errorMessage: errorMsg,
          errorStack: errorStack,
          errorType: error?.constructor?.name,
        });

        // Continue with next prompt even if one fails
        console.error('[Sora Auto Queue] Failed to process prompt:', errorMsg, errorStack);
      }
    }
  }
}

// Singleton instance
export const queueProcessor = new QueueProcessor();
