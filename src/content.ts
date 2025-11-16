/**
 * Content script for Sora page interaction
 * This script runs on sora.com pages and handles prompt submission
 */

import type { GeneratedPrompt } from './types';

class SoraAutomation {
  private isProcessing = false;
  private currentPrompt: GeneratedPrompt | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'submitPrompt') {
        this.submitPrompt(request.prompt)
          .then(() => sendResponse({ success: true }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
      }

      if (request.action === 'checkReady') {
        const isReady = this.checkIfReady();
        sendResponse({ ready: isReady });
        return true;
      }
    });

    console.log('[Sora Auto Queue] Content script loaded');
  }

  /**
   * Submit a prompt to Sora
   */
  private async submitPrompt(prompt: GeneratedPrompt): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Already processing a prompt');
    }

    this.isProcessing = true;
    this.currentPrompt = prompt;

    try {
      // Find the textarea
      const textarea = this.findTextarea();
      if (!textarea) {
        throw new Error('Could not find Sora textarea input');
      }

      // Clear existing text
      textarea.value = '';

      // Type the prompt text (simulate human typing)
      await this.typeText(textarea, prompt.text);

      // Wait a bit before submitting
      await this.delay(500);

      // Submit the prompt
      await this.submitForm(textarea);

      // Wait for processing to complete
      await this.waitForCompletion();

      this.isProcessing = false;
      this.currentPrompt = null;
    } catch (error) {
      this.isProcessing = false;
      this.currentPrompt = null;
      throw error;
    }
  }

  /**
   * Find the Sora textarea input
   */
  private findTextarea(): HTMLTextAreaElement | null {
    // Try multiple selectors
    const selectors = [
      'textarea[placeholder*="Describe your image"]',
      'textarea[placeholder*="Describe"]',
      'textarea.bg-transparent',
      'textarea',
    ];

    for (const selector of selectors) {
      const element = document.querySelector<HTMLTextAreaElement>(selector);
      if (element && element.offsetParent !== null) {
        // Element is visible
        return element;
      }
    }

    return null;
  }

  /**
   * Simulate human typing
   */
  private async typeText(element: HTMLTextAreaElement, text: string): Promise<void> {
    element.focus();

    // Clear first
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Type character by character with random delays
    for (let i = 0; i < text.length; i++) {
      element.value = text.substring(0, i + 1);

      // Dispatch input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));

      // Random delay between keystrokes (30-80ms)
      await this.delay(Math.random() * 50 + 30);
    }

    // Final events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * Submit the form
   */
  private async submitForm(textarea: HTMLTextAreaElement): Promise<void> {
    // Try to find submit button
    const submitButton = this.findSubmitButton();

    if (submitButton && !submitButton.disabled) {
      submitButton.click();
      return;
    }

    // Alternative: trigger Enter key
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(enterEvent);

    // Also try form submission
    const form = textarea.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  /**
   * Find the submit button
   */
  private findSubmitButton(): HTMLButtonElement | null {
    // Look for buttons near the textarea
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));

    // Look for submit-like buttons
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';

      if (
        text.includes('generate') ||
        text.includes('create') ||
        text.includes('submit') ||
        ariaLabel.includes('generate') ||
        ariaLabel.includes('create')
      ) {
        return button;
      }
    }

    return null;
  }

  /**
   * Wait for the generation to complete
   */
  private async waitForCompletion(): Promise<void> {
    const maxWaitTime = 300000; // 5 minutes max
    const checkInterval = 1000; // Check every second
    let elapsedTime = 0;

    while (elapsedTime < maxWaitTime) {
      // Check if loader is gone or status shows ready
      if (this.checkIfReady()) {
        // Wait a bit more to ensure it's fully done
        await this.delay(2000);
        return;
      }

      await this.delay(checkInterval);
      elapsedTime += checkInterval;
    }

    throw new Error('Generation timed out after 5 minutes');
  }

  /**
   * Check if Sora is ready for next prompt
   */
  private checkIfReady(): boolean {
    // Check for loader/spinner
    const loaderSelectors = [
      'svg circle[stroke-dashoffset]', // The percentage loader
      '.surface-toast[role="status"]', // Status toast
      '[aria-live="polite"]',
    ];

    // Check if loader is present
    const loader = document.querySelector(loaderSelectors[0]);
    if (loader && loader.parentElement?.textContent?.includes('%')) {
      // Still loading
      return false;
    }

    // Check for "Ready" status toast
    const statusToast = document.querySelector<HTMLElement>('[role="status"]');
    if (statusToast) {
      const text = statusToast.textContent?.toLowerCase() || '';
      if (text.includes('ready')) {
        return true;
      }
      // If there's any other status (error, etc.), consider it ready to move on
      if (text.includes('error') || text.includes('failed')) {
        return true;
      }
    }

    // If no loader visible, consider ready
    const visibleLoader = document.querySelector('.bg-token-bg-secondary svg circle');
    if (!visibleLoader) {
      return true;
    }

    return false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize the automation
new SoraAutomation();
