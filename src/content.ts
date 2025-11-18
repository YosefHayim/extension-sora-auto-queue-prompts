/**
 * Content script for Sora page interaction
 * This script runs on sora.com pages and handles prompt submission
 */

import type { GeneratedPrompt } from './types';

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
  private log(level: 'log' | 'error' | 'warn', message: string, data?: any): void {
    const fullMessage = `[Sora Content] ${message}`;
    console[level](fullMessage, data || '');

    // Also send to background for visibility in service worker console
    chrome.runtime.sendMessage({
      action: 'contentLog',
      level,
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

      if (request.action === 'getDomSnapshot') {
        const snapshot = this.getDomSnapshot();
        sendResponse({ snapshot });
        return true;
      }
    });

    this.log('log', 'Content script loaded');
    if (this.debugMode) {
      this.log('log', 'Debug mode enabled');
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

  /**
   * Submit a prompt to Sora
   */
  private async submitPrompt(prompt: GeneratedPrompt): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Already processing a prompt');
    }

    this.isProcessing = true;
    this.currentPrompt = prompt;
    this.generationStarted = false; // Reset generation state

    try {
      console.log('[Sora Auto Queue] === SUBMIT PROMPT START ===');
      console.log('[Sora Auto Queue] Prompt text:', prompt.text);
      console.log('[Sora Auto Queue] Prompt length:', prompt.text.length);

      // Find the textarea
      console.log('[Sora Auto Queue] Step 1: Finding textarea...');
      const textarea = this.findTextarea();
      if (!textarea) {
        console.error('[Sora Auto Queue] ERROR: Could not find textarea');
        this.logDomState(); // Log DOM state on error
        throw new Error('Could not find Sora textarea input');
      }

      console.log('[Sora Auto Queue] Textarea found:', {
        placeholder: textarea.placeholder,
        currentValue: textarea.value,
        className: textarea.className,
        tagName: textarea.tagName,
      });

      // Clear existing text
      console.log('[Sora Auto Queue] Step 2: Clearing existing text...');
      textarea.value = '';
      console.log('[Sora Auto Queue] Value after clear:', textarea.value);

      // Type the prompt text (simulate human typing)
      console.log('[Sora Auto Queue] Step 3: Typing prompt...');
      await this.typeText(textarea, prompt.text);
      console.log('[Sora Auto Queue] Value after typing:', textarea.value);
      console.log('[Sora Auto Queue] Value length:', textarea.value.length);

      // Wait a bit before submitting
      console.log('[Sora Auto Queue] Step 4: Waiting 500ms before submit...');
      await this.delay(500);

      // Submit the prompt
      console.log('[Sora Auto Queue] Step 5: Submitting form...');
      await this.submitForm(textarea);

      // Wait for processing to complete
      console.log('[Sora Auto Queue] Step 6: Waiting for completion...');
      await this.waitForCompletion();

      console.log('[Sora Auto Queue] === SUBMIT PROMPT SUCCESS ===');
      this.isProcessing = false;
      this.currentPrompt = null;
      this.generationStarted = false;
    } catch (error) {
      console.error('[Sora Auto Queue] === SUBMIT PROMPT ERROR ===');
      console.error('[Sora Auto Queue] Error:', error);
      this.isProcessing = false;
      this.currentPrompt = null;
      this.generationStarted = false;
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
    console.log('[Sora Auto Queue] typeText: Starting to type', text.length, 'characters');

    // Focus the element
    element.focus();
    console.log('[Sora Auto Queue] typeText: Element focused');

    // Try to get React's internal instance
    const reactKey = Object.keys(element).find(key => key.startsWith('__react'));
    console.log('[Sora Auto Queue] typeText: React key found:', reactKey);

    // Clear first
    element.value = '';

    // Create and dispatch proper InputEvent (React expects this)
    const clearInputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      composed: true,
      data: null,
      inputType: 'deleteContentBackward',
    });
    element.dispatchEvent(clearInputEvent);
    console.log('[Sora Auto Queue] typeText: Cleared with InputEvent');

    // Set the full value at once (more reliable for React)
    element.value = text;
    console.log('[Sora Auto Queue] typeText: Set full value:', text.substring(0, 50), '...');

    // Dispatch proper InputEvent that React expects
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      composed: true,
      data: text,
      inputType: 'insertText',
    });
    element.dispatchEvent(inputEvent);
    console.log('[Sora Auto Queue] typeText: Dispatched InputEvent');

    // Also dispatch change event
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
    console.log('[Sora Auto Queue] typeText: Dispatched change event');

    // Trigger React's onChange handler directly if possible
    if (reactKey) {
      const reactProps = (element as any)[reactKey];
      console.log('[Sora Auto Queue] typeText: React props:', reactProps);

      if (reactProps?.onChange) {
        console.log('[Sora Auto Queue] typeText: Calling React onChange directly');
        reactProps.onChange({ target: element, currentTarget: element });
      }
    }

    // Final blur to trigger any onBlur handlers
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[Sora Auto Queue] typeText: Completed');

    // Verify the value stuck
    console.log('[Sora Auto Queue] typeText: Final value check:', element.value.substring(0, 50), '...');
    console.log('[Sora Auto Queue] typeText: Final value length:', element.value.length);
  }

  /**
   * Submit the form
   */
  private async submitForm(textarea: HTMLTextAreaElement): Promise<void> {
    console.log('[Sora Auto Queue] submitForm: Attempting to submit...');

    // Try to find submit button
    const submitButton = this.findSubmitButton();

    if (submitButton && !submitButton.disabled) {
      console.log('[Sora Auto Queue] submitForm: Found submit button:', {
        text: submitButton.textContent?.trim(),
        disabled: submitButton.disabled,
        className: submitButton.className,
      });
      submitButton.click();
      console.log('[Sora Auto Queue] submitForm: Button clicked');
      return;
    }

    console.log('[Sora Auto Queue] submitForm: No valid submit button found, trying Enter key...');

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
    console.log('[Sora Auto Queue] submitForm: Enter key dispatched');

    // Also try form submission
    const form = textarea.closest('form');
    if (form) {
      console.log('[Sora Auto Queue] submitForm: Found form, dispatching submit event');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    } else {
      console.log('[Sora Auto Queue] submitForm: No form found');
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

    console.log('[Sora Auto Queue] Waiting for generation to complete...');

    // Phase 1: Wait for generation to START (loader appears)
    const startWaitTime = 10000; // Wait up to 10 seconds for generation to start
    let startElapsed = 0;

    while (startElapsed < startWaitTime && !this.generationStarted) {
      if (this.checkIfGenerationStarted()) {
        this.generationStarted = true;
        console.log('[Sora Auto Queue] Generation started, waiting for completion...');
        break;
      }
      await this.delay(checkInterval);
      startElapsed += checkInterval;
    }

    // If generation never started, assume there was an error or instant completion
    if (!this.generationStarted) {
      console.log('[Sora Auto Queue] Generation did not start within 10 seconds, checking for errors...');
      // Check if there's an error message
      if (this.checkForError()) {
        throw new Error('Generation failed to start');
      }
      // If no error, assume instant completion (rare)
      return;
    }

    // Phase 2: Wait for generation to COMPLETE (loader disappears)
    while (elapsedTime < maxWaitTime) {
      if (this.checkIfReady()) {
        console.log('[Sora Auto Queue] Generation completed!');
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
   * Check if generation has started (loader appeared)
   */
  private checkIfGenerationStarted(): boolean {
    // Look for loading indicators that appear when generation starts
    const loadingSelectors = [
      'svg circle[stroke-dashoffset]', // Percentage loader
      '[aria-live="polite"]', // Loading status
      '.bg-token-bg-secondary svg circle', // Generic loader
    ];

    for (const selector of loadingSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Check if it's actually showing a loading state
        const parent = element.parentElement;
        if (parent?.textContent?.includes('%')) {
          return true; // Percentage indicator = loading
        }
        // Check if the element is visible (not display:none)
        if (element instanceof HTMLElement && element.offsetParent !== null) {
          return true;
        }
      }
    }

    // Check for status toast indicating processing
    const statusToast = document.querySelector<HTMLElement>('[role="status"]');
    if (statusToast) {
      const text = statusToast.textContent?.toLowerCase() || '';
      if (text.includes('generating') || text.includes('processing') || text.includes('%')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if there's an error message
   */
  private checkForError(): boolean {
    const statusToast = document.querySelector<HTMLElement>('[role="status"]');
    if (statusToast) {
      const text = statusToast.textContent?.toLowerCase() || '';
      if (text.includes('error') || text.includes('failed')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if Sora is ready for next prompt (generation completed)
   */
  private checkIfReady(): boolean {
    // Only check for completion if generation has started
    if (!this.generationStarted) {
      return false;
    }

    // Check if loader is still present with percentage
    const loader = document.querySelector('svg circle[stroke-dashoffset]');
    if (loader && loader.parentElement?.textContent?.includes('%')) {
      // Still loading
      return false;
    }

    // Check for any visible loading indicators
    const loadingSelectors = [
      'svg circle[stroke-dashoffset]',
      '[aria-live="polite"]',
      '.bg-token-bg-secondary svg circle',
    ];

    for (const selector of loadingSelectors) {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement && element.offsetParent !== null) {
        const parent = element.parentElement;
        if (parent?.textContent?.includes('%')) {
          return false; // Still showing percentage = still loading
        }
      }
    }

    // Check for "Ready" status toast
    const statusToast = document.querySelector<HTMLElement>('[role="status"]');
    if (statusToast) {
      const text = statusToast.textContent?.toLowerCase() || '';
      if (text.includes('ready')) {
        return true;
      }
      // If error or failed, consider it done (so we can move to next prompt)
      if (text.includes('error') || text.includes('failed')) {
        return true;
      }
    }

    // If no loader is visible and generation had started, consider it complete
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
