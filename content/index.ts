/**
 * Content script for Sora page interaction
 * This script runs on sora.com pages and handles prompt submission
 */

import type { GeneratedPrompt } from '../src/types';

class SoraAutomation {
  private isProcessing = false;
  private currentPrompt: GeneratedPrompt | null = null;
  private generationStarted = false; // Track if generation has started
  private debugMode = true; // Enable detailed logging

  constructor() {
    this.init();
  }

  /**
   * Log to both console and background (for visibility)
   */
  private log(level: 'log' | 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void {
    const fullMessage = `[Sora Content] ${message}`;
    const consoleLevel = level === 'log' || level === 'debug' ? 'log' : level;
    console[consoleLevel](fullMessage, data || '');

    // Map to logger levels
    const loggerLevel = level === 'log' ? 'info' : level === 'debug' ? 'debug' : level;

    // Also send to background for storage in logger
    chrome.runtime.sendMessage({
      action: 'contentLog',
      level: loggerLevel,
      message,
      data,
    }).catch(() => {
      // Ignore errors if background isn't listening
    });
  }

  private init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'submitPrompt') {
        this.log('info', '📥 Received submitPrompt request', {
          promptLength: request.prompt?.text?.length,
          promptPreview: request.prompt?.text?.substring(0, 50),
        });
        this.submitPrompt(request.prompt)
          .then(() => {
            this.log('info', '✅ submitPrompt completed successfully');
            sendResponse({ success: true });
          })
          .catch((error) => {
            this.log('error', '❌ submitPrompt failed', {
              error: error.message,
              stack: error.stack,
              domSnapshot: this.getDomSnapshot(),
            });
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep channel open for async response
      }

      if (request.action === 'checkReady') {
        const isReady = this.checkIfReady();
        this.log('debug', 'checkReady request', { isReady });
        sendResponse({ ready: isReady });
        return true;
      }

      if (request.action === 'getDomSnapshot') {
        const snapshot = this.getDomSnapshot();
        this.log('debug', 'getDomSnapshot request');
        sendResponse({ snapshot });
        return true;
      }

      if (request.action === 'generationComplete') {
        this.log('info', '🎉 Generation completed notification received');
        this.handleGenerationComplete();
        sendResponse({ success: true });
        return true;
      }
    });

    this.log('info', `🚀 Content script initialized on ${window.location.href}`);
    if (this.debugMode) {
      this.log('info', '🐛 Debug mode enabled');
      this.logDomState();
    }
  }

  /**
   * Log current DOM state for debugging
   */
  private logDomState(): void {
    console.log('[Sora Auto Queue] === DOM STATE ===');
    console.log('URL:', window.location.href);
    console.log('Document ready state:', document.readyState);

    // Log all textareas
    const allTextareas = document.querySelectorAll('textarea');
    console.log(`Found ${allTextareas.length} textarea(s):`, allTextareas);
    allTextareas.forEach((ta, i) => {
      console.log(`  Textarea ${i}:`, {
        placeholder: ta.placeholder,
        value: ta.value,
        className: ta.className,
        visible: ta.offsetParent !== null,
        disabled: ta.disabled,
        readOnly: ta.readOnly,
      });
    });

    // Log potential submit buttons
    const buttons = document.querySelectorAll('button');
    console.log(`Found ${buttons.length} button(s)`);
    Array.from(buttons).slice(0, 5).forEach((btn, i) => {
      console.log(`  Button ${i}:`, {
        text: btn.textContent?.trim().substring(0, 50),
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        className: btn.className,
      });
    });
  }

  /**
   * Get DOM snapshot for debugging
   */
  private getDomSnapshot(): any {
    const allTextareas = Array.from(document.querySelectorAll('textarea')).map((ta, i) => ({
      index: i,
      placeholder: ta.placeholder,
      value: ta.value,
      className: ta.className,
      visible: ta.offsetParent !== null,
      disabled: ta.disabled,
      readOnly: ta.readOnly,
      id: ta.id,
      name: ta.getAttribute('name'),
    }));

    const buttons = Array.from(document.querySelectorAll('button')).map((btn, i) => ({
      index: i,
      text: btn.textContent?.trim().substring(0, 100),
      ariaLabel: btn.getAttribute('aria-label'),
      disabled: btn.disabled,
      className: btn.className.substring(0, 100),
      type: btn.type,
    }));

    return {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      textareas: allTextareas,
      buttons: buttons.slice(0, 10), // First 10 buttons
      timestamp: Date.now(),
    };
  }

  private async submitPrompt(prompt: GeneratedPrompt): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Already processing a prompt');
    }

    this.isProcessing = true;
    this.currentPrompt = prompt;
    this.generationStarted = false;

    try {
      this.log('info', '🔍 Looking for prompt textarea...');

      // Wait for page to be ready
      await this.waitForElement('textarea[placeholder*="prompt"], textarea[placeholder*="Prompt"], textarea[id*="prompt"], textarea[name*="prompt"]', 10000);

      const textarea = document.querySelector('textarea[placeholder*="prompt"], textarea[placeholder*="Prompt"], textarea[id*="prompt"], textarea[name*="prompt"]') as HTMLTextAreaElement;

      if (!textarea) {
        throw new Error('Prompt textarea not found');
      }

      this.log('info', '✅ Found textarea', {
        placeholder: textarea.placeholder,
        id: textarea.id,
        name: textarea.name,
      });

      // Clear existing text
      textarea.value = '';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      // Type the prompt with human-like delays
      await this.typeText(textarea, prompt.text);

      this.log('info', '✅ Finished typing prompt');

      // Find and click submit button
      await this.submitForm(textarea);

      this.log('info', '✅ Form submitted, waiting for generation to start...');

      // Wait for generation to start (look for loading indicators)
      await this.waitForGenerationStart();

      this.log('info', '✅ Generation started, monitoring for completion...');

      // Notify background to start network monitoring
      const tabId = (await chrome.runtime.sendMessage({ action: 'getCurrentTabId' }))?.tabId;
      if (tabId) {
        await chrome.runtime.sendMessage({
          action: 'startNetworkMonitoring',
          tabId,
        });
      }

    } catch (error) {
      this.log('error', '❌ Error submitting prompt', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      // Don't set isProcessing to false here - let generationComplete handle it
    }
  }

  private async waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Element not found: ${selector}`);
  }

  private async typeText(element: HTMLTextAreaElement, text: string): Promise<void> {
    const chars = text.split('');
    const baseDelay = 30; // Base delay between characters (ms)
    const randomDelay = 50; // Random additional delay (ms)

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));

      // Human-like typing delay with randomness
      const delay = baseDelay + Math.random() * randomDelay;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private async submitForm(textarea: HTMLTextAreaElement): Promise<void> {
    // Try multiple strategies to find and click submit button

    // Strategy 1: Look for button near textarea
    const form = textarea.closest('form');
    if (form) {
      const submitButton = form.querySelector('button[type="submit"], button:not([type]), input[type="submit"]') as HTMLElement;
      if (submitButton) {
        this.log('info', '✅ Found submit button in form');
        submitButton.click();
        return;
      }
    }

    // Strategy 2: Look for common submit button selectors
    const commonSelectors = [
      'button[aria-label*="Generate"]',
      'button[aria-label*="Submit"]',
      'button:has-text("Generate")',
      'button:has-text("Submit")',
      '[data-testid*="submit"]',
      '[data-testid*="generate"]',
    ];

    for (const selector of commonSelectors) {
      try {
        const button = document.querySelector(selector) as HTMLElement;
        if (button && button.offsetParent !== null) {
          this.log('info', `✅ Found submit button with selector: ${selector}`);
          button.click();
          return;
        }
      } catch (e) {
        // Selector might not be valid, continue
      }
    }

    // Strategy 3: Press Enter on textarea
    this.log('info', '⚠️ Submit button not found, trying Enter key');
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(enterEvent);

    // Also try keyup
    const enterEventUp = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(enterEventUp);
  }

  private async waitForGenerationStart(): Promise<void> {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      // Look for loading indicators
      const loadingIndicators = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[aria-busy="true"]',
        '[data-loading="true"]',
      ];

      for (const selector of loadingIndicators) {
        const element = document.querySelector(selector);
        if (element) {
          this.generationStarted = true;
          this.log('info', '✅ Generation started (loading indicator found)');
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // If we get here, assume generation started anyway
    this.generationStarted = true;
    this.log('warn', '⚠️ Generation start not detected, assuming it started');
  }

  private async handleGenerationComplete(): Promise<void> {
    this.log('info', '🎉 Handling generation complete');

    // Notify background that this prompt is complete
    if (this.currentPrompt) {
      try {
        await chrome.runtime.sendMessage({
          action: 'markPromptComplete',
          promptId: this.currentPrompt.id,
        });
        this.log('info', '✅ Notified background of completion', { promptId: this.currentPrompt.id });
      } catch (error) {
        this.log('error', '❌ Failed to notify background', { error });
      }
    }

    // Reset state
    this.isProcessing = false;
    this.currentPrompt = null;
    this.generationStarted = false;
  }
}

// Initialize automation when content script loads
new SoraAutomation();

