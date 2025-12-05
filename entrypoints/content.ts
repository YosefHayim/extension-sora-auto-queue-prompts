/**
 * Content script for Sora page interaction
 * This script runs on sora.com pages and handles prompt submission
 */

import type { GeneratedPrompt } from "../src/types";
import { defineContentScript } from "#imports";

export default defineContentScript({
  matches: ["*://sora.chatgpt.com/*", "*://sora.com/*"],
  runAt: "document_end",
  main() {
    class SoraAutomation {
      private isProcessing = false;
      private currentPrompt: GeneratedPrompt | null = null;
      private generationStarted = false; // Track if generation has started
      private debugMode = true; // Enable detailed logging
      private progressInterval: number | null = null; // Interval for progress polling

      constructor() {
        this.init();
      }

      /**
       * Log to both console and background (for visibility)
       */
      private log(level: "log" | "error" | "warn" | "info" | "debug", message: string, data?: any): void {
        const fullMessage = `[Sora Content] ${message}`;
        const consoleLevel = level === "log" || level === "debug" ? "log" : level;
        console[consoleLevel](fullMessage, data || "");

        // Map to logger levels
        const loggerLevel =
          level === "log" ? "info"
          : level === "debug" ? "debug"
          : level;

        // Also send to background for storage in logger
        chrome.runtime
          .sendMessage({
            action: "contentLog",
            level: loggerLevel,
            message,
            data,
          })
          .catch(() => {
            // Ignore errors if background isn't listening
          });
      }

      private init() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === "ping") {
            // Simple ping to check if content script is loaded
            sendResponse({ success: true, loaded: true });
            return true;
          }

          if (request.action === "submitPrompt") {
            this.log("info", "📥 Received submitPrompt request", {
              promptLength: request.prompt?.text?.length,
              promptPreview: request.prompt?.text?.substring(0, 50),
            });
            this.submitPrompt(request.prompt)
              .then(() => {
                this.log("info", "✅ submitPrompt completed successfully");
                sendResponse({ success: true });
              })
              .catch((error) => {
                this.log("error", "❌ submitPrompt failed", {
                  error: error.message,
                  stack: error.stack,
                  domSnapshot: this.getDomSnapshot(),
                });
                sendResponse({ success: false, error: error.message });
              });
            return true; // Keep channel open for async response
          }

          if (request.action === "checkReady") {
            const isReady = this.checkIfReady();
            this.log("debug", "checkReady request", { isReady });
            sendResponse({ ready: isReady });
            return true;
          }

          if (request.action === "getDomSnapshot") {
            const snapshot = this.getDomSnapshot();
            this.log("debug", "getDomSnapshot request");
            sendResponse({ snapshot });
            return true;
          }

          if (request.action === "generationComplete") {
            this.log("info", "🎉 Generation completed notification received");
            this.handleGenerationComplete();
            sendResponse({ success: true });
            return true;
          }

          if (request.action === "detectSettings") {
            const settings = this.detectCurrentSettings();
            this.log("info", "🔍 Detected settings from Sora page", settings);
            sendResponse(settings);
            return true;
          }

          if (request.action === "navigateToPrompt") {
            this.navigateToPrompt(request.promptText)
              .then(() => {
                sendResponse({ success: true });
              })
              .catch((error) => {
                this.log("error", "Failed to navigate to prompt", {
                  error: error.message,
                });
                sendResponse({ success: false, error: error.message });
              });
            return true;
          }
        });

        this.log("info", `🚀 Content script initialized on ${window.location.href}`);
        if (this.debugMode) {
          this.log("info", "🐛 Debug mode enabled");
          this.logDomState();
        }
      }

      /**
       * Log current DOM state for debugging
       */
      private logDomState(): void {
        console.log("[Sora Auto Queue] === DOM STATE ===");
        console.log("URL:", window.location.href);
        console.log("Document ready state:", document.readyState);

        // Log all textareas
        const allTextareas = document.querySelectorAll("textarea");
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
        const buttons = document.querySelectorAll("button");
        console.log(`Found ${buttons.length} button(s)`);
        Array.from(buttons)
          .slice(0, 5)
          .forEach((btn, i) => {
            console.log(`  Button ${i}:`, {
              text: btn.textContent?.trim().substring(0, 50),
              ariaLabel: btn.getAttribute("aria-label"),
              disabled: btn.disabled,
              className: btn.className,
            });
          });
      }

      /**
       * Get DOM snapshot for debugging
       */
      private getDomSnapshot(): any {
        const allTextareas = Array.from(document.querySelectorAll("textarea")).map((ta, i) => ({
          index: i,
          placeholder: ta.placeholder,
          value: ta.value,
          className: ta.className,
          visible: ta.offsetParent !== null,
          disabled: ta.disabled,
          readOnly: ta.readOnly,
          id: ta.id,
          name: ta.getAttribute("name"),
        }));

        const buttons = Array.from(document.querySelectorAll("button")).map((btn, i) => ({
          index: i,
          text: btn.textContent?.trim().substring(0, 100),
          ariaLabel: btn.getAttribute("aria-label"),
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
          this.log("warn", "Already processing a prompt, rejecting new request");
          throw new Error("Already processing a prompt");
        }

        this.isProcessing = true;
        this.currentPrompt = prompt;
        this.generationStarted = false;

        this.log("info", "═══ SUBMIT PROMPT START ═══");
        this.log("info", "Prompt details", {
          text: prompt.text,
          length: prompt.text.length,
          mediaType: prompt.mediaType,
          aspectRatio: prompt.aspectRatio,
        });

        try {
          // Step 1: Find textarea
          this.log("info", "📍 Step 1: Finding textarea...");
          const textarea = this.findTextarea();
          if (!textarea) {
            this.log("error", "❌ Step 1 FAILED: Could not find textarea");
            this.logDomState();
            throw new Error("Could not find Sora textarea input");
          }
          this.log("info", "✅ Step 1 SUCCESS: Textarea found");

          // Step 2: Type prompt
          this.log("info", "📍 Step 2: Typing prompt text...");
          await this.typeText(textarea, prompt.text);
          this.log("info", "✅ Step 2 SUCCESS: Text typed");

          // Step 3: Wait before submit
          this.log("info", "📍 Step 3: Waiting 500ms before submit...");
          await this.delay(500);
          this.log("info", "✅ Step 3 SUCCESS: Wait completed");

          // Step 4: Submit form
          this.log("info", "📍 Step 4: Submitting form...");
          await this.submitForm(textarea);
          this.log("info", "✅ Step 4 SUCCESS: Form submitted");

          // Step 5: Wait for completion
          this.log("info", "📍 Step 5: Waiting for generation completion...");
          await this.waitForCompletion();
          this.log("info", "✅ Step 5 SUCCESS: Generation completed");
          this.stopProgressMonitoring();

          this.log("info", "═══ SUBMIT PROMPT SUCCESS ═══");
          this.isProcessing = false;
          this.currentPrompt = null;
          this.generationStarted = false;
        } catch (error) {
          this.log("error", "═══ SUBMIT PROMPT FAILED ═══", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            currentStep: this.isProcessing ? "unknown" : "cleanup",
          });
          this.stopProgressMonitoring();
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
        this.log("info", "🔍 Starting textarea search...");

        // Try multiple selectors
        const selectors = ['textarea[placeholder*="Describe your image"]', 'textarea[placeholder*="Describe"]', "textarea.bg-transparent", "textarea"];

        for (const selector of selectors) {
          this.log("debug", `Trying selector: ${selector}`);
          const element = document.querySelector<HTMLTextAreaElement>(selector);

          if (element) {
            const isVisible = element.offsetParent !== null;
            this.log("info", `Element found with selector: ${selector}`, {
              found: true,
              visible: isVisible,
              placeholder: element.placeholder,
              className: element.className,
              disabled: element.disabled,
              readOnly: element.readOnly,
              currentValue: element.value,
            });

            if (isVisible) {
              this.log("info", `✅ Textarea found and visible: ${selector}`);
              return element;
            } else {
              this.log("warn", `⚠️ Element found but not visible: ${selector}`);
            }
          } else {
            this.log("debug", `❌ No element found for selector: ${selector}`);
          }
        }

        this.log("error", "❌ Failed to find any visible textarea", {
          totalSelectors: selectors.length,
          domSnapshot: this.getDomSnapshot(),
        });

        return null;
      }

      /**
       * Simulate human typing
       */
      private async typeText(element: HTMLTextAreaElement, text: string): Promise<void> {
        this.log("info", `⌨️ Starting to type ${text.length} characters`);

        // Focus the element first
        element.focus();
        this.log("debug", "Element focused");
        await this.delay(100); // Give React time to register focus

        // Try to get React's internal instance
        const reactKey = Object.keys(element).find((key) => key.startsWith("__react"));
        this.log("debug", "React key detection", {
          reactKeyFound: !!reactKey,
          reactKey,
        });

        // Use React's native setter pattern - this is CRITICAL for React to detect changes
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

        if (nativeInputValueSetter) {
          this.log("info", "✅ Using native React setter pattern");
          // Call the native setter (bypasses React's controlled input)
          nativeInputValueSetter.call(element, text);
        } else {
          this.log("warn", "⚠️ Native setter not found, falling back to direct assignment");
          element.value = text;
        }

        this.log("info", "Set input value", {
          valueLength: text.length,
          valuePreview: text.substring(0, 50),
          actualValue: element.value.substring(0, 50),
          valueStuck: element.value === text,
        });

        // Dispatch the critical input event that React listens for
        const inputEvent = new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        element.dispatchEvent(inputEvent);
        this.log("debug", "Dispatched InputEvent");

        // Give React time to process the input event
        await this.delay(100);

        // Also dispatch change event for good measure
        const changeEvent = new Event("change", {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(changeEvent);
        this.log("debug", "Dispatched change event");

        // Trigger keydown/keyup events to simulate typing (some apps check for this)
        element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true }));
        element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true }));
        this.log("debug", "Dispatched keyboard events");

        // Re-focus to ensure React sees the element as active
        element.focus();
        this.log("debug", "Re-focused element");

        // Small delay to let React update its state
        await this.delay(200);

        // Verify the value stuck
        const finalValueCheck = element.value === text;
        this.log("info", `✅ Input set ${finalValueCheck ? "successfully" : "FAILED"}`, {
          expectedLength: text.length,
          actualLength: element.value.length,
          valuePreview: element.value.substring(0, 50),
          success: finalValueCheck,
        });

        if (!finalValueCheck) {
          this.log("error", "❌ Input value did not stick!", {
            expected: text.substring(0, 100),
            actual: element.value.substring(0, 100),
          });
        }

        // Log submit button state for debugging
        const submitButton = this.findSubmitButton();
        if (submitButton) {
          this.log("info", "🔍 Submit button state after input", {
            disabled: submitButton.disabled,
            text: submitButton.textContent?.trim(),
          });
        }
      }

      /**
       * Submit the form
       */
      private async submitForm(textarea: HTMLTextAreaElement): Promise<void> {
        this.log("info", "📤 Attempting to submit form...");

        // Wait a bit for React to process the input and enable the button
        await this.delay(300);

        // Try to find submit button with retries
        let submitButton = this.findSubmitButton();
        let retries = 0;
        const maxRetries = 5;

        // Retry finding enabled button (React might take time to update)
        while (retries < maxRetries && (!submitButton || submitButton.disabled)) {
          this.log("info", `⏳ Retry ${retries + 1}/${maxRetries}: Waiting for submit button to be enabled...`);
          await this.delay(500);
          submitButton = this.findSubmitButton();
          retries++;
        }

        if (submitButton && !submitButton.disabled) {
          this.log("info", "✅ Found enabled submit button", {
            text: submitButton.textContent?.trim(),
            disabled: submitButton.disabled,
            className: submitButton.className,
            ariaLabel: submitButton.getAttribute("aria-label"),
            retriesNeeded: retries,
          });
          submitButton.click();
          this.log("info", "🖱️ Submit button clicked");
          return;
        }

        if (submitButton && submitButton.disabled) {
          this.log("error", "❌ Submit button still disabled after retries", {
            text: submitButton.textContent?.trim(),
            className: submitButton.className,
            textareaValue: textarea.value.substring(0, 50),
            textareaValueLength: textarea.value.length,
          });
          throw new Error("Submit button remained disabled - React may not have detected the input change");
        } else {
          this.log("warn", "⚠️ No submit button found after retries");
        }

        this.log("info", "Trying alternative: Enter key...");

        // Alternative: trigger Enter key
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });
        textarea.dispatchEvent(enterEvent);
        this.log("debug", "Enter key event dispatched");

        // Also try form submission
        const form = textarea.closest("form");
        if (form) {
          this.log("info", "📝 Found form element, dispatching submit event");
          form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        } else {
          this.log("warn", "⚠️ No form element found");
        }
      }

      /**
       * Find the submit button
       */
      private findSubmitButton(): HTMLButtonElement | null {
        this.log("info", "🔍 Searching for submit button...");
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
        this.log("debug", `Found ${buttons.length} total buttons on page`);

        // Look for submit-like buttons
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const text = button.textContent?.toLowerCase() || "";
          const ariaLabel = button.getAttribute("aria-label")?.toLowerCase() || "";

          const isSubmitButton =
            text.includes("generate") || text.includes("create") || text.includes("submit") || ariaLabel.includes("generate") || ariaLabel.includes("create");

          if (isSubmitButton) {
            this.log("info", `✅ Found submit button (index ${i})`, {
              text: button.textContent?.trim(),
              ariaLabel: button.getAttribute("aria-label"),
              disabled: button.disabled,
              className: button.className.substring(0, 100),
              isVisible: button.offsetParent !== null,
            });
            return button;
          }
        }

        this.log("warn", "❌ No submit button found", {
          totalButtons: buttons.length,
          buttonSample: buttons.slice(0, 5).map((btn, i) => ({
            index: i,
            text: btn.textContent?.trim().substring(0, 50),
            ariaLabel: btn.getAttribute("aria-label"),
            disabled: btn.disabled,
          })),
        });

        return null;
      }

      /**
       * Wait for the generation to complete using network monitoring
       */
      private async waitForCompletion(): Promise<void> {
        this.log("info", "⏳ Starting completion detection...");

        // Start network monitoring in background
        try {
          const response = await chrome.runtime.sendMessage({
            action: "startNetworkMonitoring",
          });

          if (!response || !response.success) {
            this.log("warn", "Failed to start network monitoring, falling back to DOM detection");
            return this.waitForCompletionDOMFallback();
          }

          this.log("info", "✅ Network monitoring started - waiting for DataDog requests to stop...");

          // Start progress monitoring
          this.startProgressMonitoring();

          // Wait for the generationComplete message from background
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(
              () => {
                this.log("error", "❌ Network monitoring timed out after 10 minutes");
                reject(new Error("Network monitoring timed out after 10 minutes"));
              },
              10 * 60 * 1000
            ); // 10 minutes max

            const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
              if (message.action === "generationComplete") {
                this.log("info", "✅ Generation completed (detected via network monitoring - 30s silence)");
                this.stopProgressMonitoring();
                clearTimeout(timeout);
                chrome.runtime.onMessage.removeListener(messageListener);

                // Stop monitoring in background
                chrome.runtime.sendMessage({ action: "stopNetworkMonitoring" }).catch(() => {
                  // Ignore errors
                });

                resolve();
              }
            };

            chrome.runtime.onMessage.addListener(messageListener);
          });
        } catch (error) {
          this.log("error", "Network monitoring error, falling back to DOM detection", {
            error: error instanceof Error ? error.message : String(error),
          });
          return this.waitForCompletionDOMFallback();
        }
      }

      /**
       * Fallback completion detection using DOM (old method)
       */
      private async waitForCompletionDOMFallback(): Promise<void> {
        const maxWaitTime = 300000; // 5 minutes max
        const checkInterval = 1000; // Check every second
        let elapsedTime = 0;

        this.log("info", "⏳ Using DOM-based completion detection (fallback mode)...");

        // Start progress monitoring
        this.startProgressMonitoring();

        // Phase 1: Wait for generation to START (loader appears)
        const startWaitTime = 10000; // Wait up to 10 seconds for generation to start
        let startElapsed = 0;

        while (startElapsed < startWaitTime && !this.generationStarted) {
          if (this.checkIfGenerationStarted()) {
            this.generationStarted = true;
            this.log("info", "✅ Generation started (DOM detected)");
            break;
          }
          await this.delay(checkInterval);
          startElapsed += checkInterval;
        }

        // If generation never started, this is an error condition
        if (!this.generationStarted) {
          this.log("error", "❌ Generation did not start within 10 seconds");
          // Check if there's an error message
          if (this.checkForError()) {
            throw new Error("Generation failed to start - error detected on page");
          }
          // If no error visible, still throw - something went wrong
          throw new Error("Generation failed to start within 10 seconds - check Sora page for issues");
        }

        // Phase 2: Wait for generation to COMPLETE (loader disappears)
        this.log("info", "⏳ Phase 2: Waiting for DOM completion...", {
          maxWaitTime: maxWaitTime / 1000 + "s",
          checkInterval: checkInterval / 1000 + "s",
        });

        while (elapsedTime < maxWaitTime) {
          const isReady = this.checkIfReady();

          // Log status every 10 seconds
          if (elapsedTime % 10000 === 0) {
            this.log("debug", `⏳ Still waiting... (${elapsedTime / 1000}s elapsed)`, { isReady });
          }

          if (isReady) {
            this.log("info", "✅ Generation completed (DOM detected)!", {
              totalTime: elapsedTime / 1000 + "s",
            });
            this.stopProgressMonitoring();
            // Wait a bit more to ensure it's fully done
            await this.delay(2000);
            return;
          }

          await this.delay(checkInterval);
          elapsedTime += checkInterval;
        }

        this.log("error", "❌ Generation timed out", {
          maxWaitTime: maxWaitTime / 1000 + "s",
          elapsedTime: elapsedTime / 1000 + "s",
        });
        throw new Error("Generation timed out after 5 minutes");
      }

      /**
       * Check if generation has started (loader appeared)
       */
      private checkIfGenerationStarted(): boolean {
        // Look for loading indicators that appear when generation starts
        const loadingSelectors = [
          "svg circle[stroke-dashoffset]", // Percentage loader
          '[aria-live="polite"]', // Loading status
          ".bg-token-bg-secondary svg circle", // Generic loader
        ];

        for (const selector of loadingSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            // Check if it's actually showing a loading state
            const parent = element.parentElement;
            if (parent?.textContent?.includes("%")) {
              this.log("debug", `✅ Generation started - found loader with %: ${selector}`);
              return true; // Percentage indicator = loading
            }
            // Check if the element is visible (not display:none)
            if (element instanceof HTMLElement && element.offsetParent !== null) {
              this.log("debug", `✅ Generation started - found visible loader: ${selector}`);
              return true;
            }
          }
        }

        // Check for status toast indicating processing
        const statusToast = document.querySelector<HTMLElement>('[role="status"]');
        if (statusToast) {
          const text = statusToast.textContent?.toLowerCase() || "";
          if (text.includes("generating") || text.includes("processing") || text.includes("%")) {
            this.log("debug", `✅ Generation started - status toast: ${text.substring(0, 50)}`);
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
          const text = statusToast.textContent?.toLowerCase() || "";
          if (text.includes("error") || text.includes("failed")) {
            return true;
          }
        }
        return false;
      }

      /**
       * Extract current progress percentage from DOM
       */
      private extractProgress(): number | null {
        // Try multiple selectors to find progress percentage
        const selectors = ["svg circle[stroke-dashoffset]", '[aria-live="polite"]', ".bg-token-bg-secondary svg circle"];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            const parent = element.parentElement;
            if (parent?.textContent?.includes("%")) {
              const match = parent.textContent.match(/(\d+)%/);
              if (match && match[1]) {
                const percentage = parseInt(match[1], 10);
                if (percentage >= 0 && percentage <= 100) {
                  return percentage;
                }
              }
            }
          }
        }

        // Also check for percentage in status toast
        const statusToast = document.querySelector<HTMLElement>('[role="status"]');
        if (statusToast?.textContent?.includes("%")) {
          const match = statusToast.textContent.match(/(\d+)%/);
          if (match && match[1]) {
            const percentage = parseInt(match[1], 10);
            if (percentage >= 0 && percentage <= 100) {
              return percentage;
            }
          }
        }

        return null;
      }

      /**
       * Start monitoring progress and sending updates to background
       */
      private startProgressMonitoring(): void {
        if (this.progressInterval) {
          return; // Already monitoring
        }

        this.log("info", "📊 Starting progress monitoring...");
        this.progressInterval = setInterval(() => {
          const progress = this.extractProgress();
          if (progress !== null && this.currentPrompt) {
            // Send progress update to background
            chrome.runtime
              .sendMessage({
                action: "updatePromptProgress",
                promptId: this.currentPrompt.id,
                progress,
              })
              .catch(() => {
                // Ignore errors
              });

            // If progress reaches 100%, mark as complete
            if (progress >= 100) {
              this.log("info", "✅ Progress reached 100%, marking as complete");
              this.stopProgressMonitoring();
              chrome.runtime
                .sendMessage({
                  action: "markPromptComplete",
                  promptId: this.currentPrompt.id,
                })
                .catch(() => {
                  // Ignore errors
                });
            }
          }
        }, 1000) as unknown as number; // Check every second
      }

      /**
       * Stop monitoring progress
       */
      private stopProgressMonitoring(): void {
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
          this.log("info", "📊 Stopped progress monitoring");
        }
      }

      /**
       * Check if Sora is ready for next prompt (generation completed)
       */
      private checkIfReady(): boolean {
        // Only check for completion if generation has started
        if (!this.generationStarted) {
          this.log("debug", "⏸️ Not checking completion - generation not started yet");
          return false;
        }

        // Check if loader is still present with percentage
        const loader = document.querySelector("svg circle[stroke-dashoffset]");
        if (loader && loader.parentElement?.textContent?.includes("%")) {
          // Still loading
          const percentage = loader.parentElement?.textContent?.match(/\d+%/)?.[0];
          this.log("debug", `⏳ Still loading: ${percentage || "checking..."}`);
          return false;
        }

        // Check for any visible loading indicators
        const loadingSelectors = ["svg circle[stroke-dashoffset]", '[aria-live="polite"]', ".bg-token-bg-secondary svg circle"];

        for (const selector of loadingSelectors) {
          const element = document.querySelector(selector);
          if (element instanceof HTMLElement && element.offsetParent !== null) {
            const parent = element.parentElement;
            if (parent?.textContent?.includes("%")) {
              this.log("debug", `⏳ Still loading - found active loader: ${selector}`);
              return false; // Still showing percentage = still loading
            }
          }
        }

        // Check for "Ready" status toast
        const statusToast = document.querySelector<HTMLElement>('[role="status"]');
        if (statusToast) {
          const text = statusToast.textContent?.toLowerCase() || "";
          if (text.includes("ready")) {
            this.log("info", '✅ Generation ready - status toast shows "ready"');
            return true;
          }
          // If error or failed, consider it done (so we can move to next prompt)
          if (text.includes("error") || text.includes("failed")) {
            this.log("warn", `⚠️ Generation failed - status toast: ${text.substring(0, 50)}`);
            return true;
          }
        }

        // If no loader is visible and generation had started, consider it complete
        const visibleLoader = document.querySelector(".bg-token-bg-secondary svg circle");
        if (!visibleLoader) {
          this.log("info", "✅ No visible loader - generation appears complete");
          return true;
        }

        this.log("debug", "⏳ Still checking... loader visible but no percentage");
        return false;
      }

      /**
       * Detect current settings from Sora interface
       */
      private detectCurrentSettings(): import("../src/types").DetectedSettings {
        try {
          this.log("info", "🔍 Detecting current settings from Sora page...");

          // Find media type (Image/Video)
          let mediaType: "video" | "image" | null = null;
          const mediaTypeButtons = document.querySelectorAll('button[role="combobox"]');
          for (const button of Array.from(mediaTypeButtons)) {
            const text = button.textContent?.toLowerCase() || "";
            const span = button.querySelector("span");
            const buttonText = span?.textContent?.toLowerCase() || text;

            if (buttonText.includes("image") || buttonText.includes("img")) {
              mediaType = "image";
              this.log("debug", "Found Image media type");
              break;
            } else if (buttonText.includes("video") || buttonText.includes("vid")) {
              mediaType = "video";
              this.log("debug", "Found Video media type");
              break;
            }
          }

          // Find aspect ratio (1:1, 16:9, etc.)
          let aspectRatio: import("../src/types").AspectRatio | null = null;
          const aspectRatioButtons = document.querySelectorAll('button[role="combobox"]');
          const aspectRatioPatterns: Record<string, import("../src/types").AspectRatio> = {
            "1:1": "1:1",
            "16:9": "16:9",
            "9:16": "9:16",
            "4:3": "4:3",
            "3:4": "3:4",
            "21:9": "21:9",
          };

          for (const button of Array.from(aspectRatioButtons)) {
            const text = button.textContent?.trim() || "";
            const span = button.querySelector("span");
            const buttonText = span?.textContent?.trim() || text;

            for (const [pattern, ratio] of Object.entries(aspectRatioPatterns)) {
              if (buttonText.includes(pattern)) {
                aspectRatio = ratio;
                this.log("debug", `Found aspect ratio: ${ratio}`);
                break;
              }
            }
            if (aspectRatio) break;
          }

          // Find variations (2v, 4v, etc.)
          let variations: number | null = null;
          const variationButtons = document.querySelectorAll('button[role="combobox"]');
          for (const button of Array.from(variationButtons)) {
            const text = button.textContent?.trim() || "";
            const span = button.querySelector("span");
            const buttonText = span?.textContent?.trim() || text;

            // Look for patterns like "2v", "4v", "2", "4"
            const variationMatch = buttonText.match(/(\d+)[v]?/);
            if (variationMatch) {
              const num = parseInt(variationMatch[1], 10);
              if (num === 2 || num === 4) {
                variations = num;
                this.log("debug", `Found variations: ${variations}`);
                break;
              }
            }
          }

          // Alternative: Look for buttons with specific SVG icons or classes
          // Try to find buttons in the flex container with gap-1.5
          const flexContainers = document.querySelectorAll('.flex.gap-1\\.5, .flex.gap-1, [class*="gap-1"]');
          for (const container of Array.from(flexContainers)) {
            const buttons = container.querySelectorAll('button[role="combobox"]');

            for (const button of Array.from(buttons)) {
              const text = button.textContent?.toLowerCase() || "";
              const span = button.querySelector("span");
              const buttonText = (span?.textContent || button.textContent || "").toLowerCase();

              // Check for media type
              if (!mediaType) {
                if (buttonText.includes("image") || buttonText.includes("img")) {
                  mediaType = "image";
                } else if (buttonText.includes("video") || buttonText.includes("vid")) {
                  mediaType = "video";
                }
              }

              // Check for aspect ratio
              if (!aspectRatio) {
                for (const [pattern, ratio] of Object.entries(aspectRatioPatterns)) {
                  if (buttonText.includes(pattern)) {
                    aspectRatio = ratio;
                    break;
                  }
                }
              }

              // Check for variations
              if (!variations) {
                const variationMatch = buttonText.match(/(\d+)[v]?/);
                if (variationMatch) {
                  const num = parseInt(variationMatch[1], 10);
                  if (num === 2 || num === 4) {
                    variations = num;
                  }
                }
              }
            }
          }

          const result: import("../src/types").DetectedSettings = {
            mediaType,
            aspectRatio,
            variations,
            success: true,
          };

          this.log("info", "✅ Settings detected", result);
          return result;
        } catch (error) {
          this.log("error", "❌ Failed to detect settings", { error });
          return {
            mediaType: null,
            aspectRatio: null,
            variations: null,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }

      /**
       * Handle generation completion notification
       */
      private async handleGenerationComplete(): Promise<void> {
        this.log("info", "🎉 Handling generation complete");

        // Notify background that this prompt is complete
        if (this.currentPrompt) {
          try {
            await chrome.runtime.sendMessage({
              action: "markPromptComplete",
              promptId: this.currentPrompt.id,
            });
            this.log("info", "✅ Notified background of completion", {
              promptId: this.currentPrompt.id,
            });
          } catch (error) {
            this.log("error", "❌ Failed to notify background", { error });
          }
        }

        // Reset state
        this.isProcessing = false;
        this.currentPrompt = null;
        this.generationStarted = false;
      }

      /**
       * Navigate to a specific prompt in the DOM and highlight generated images
       */
      private async navigateToPrompt(promptText: string): Promise<void> {
        this.log("info", "🔍 Navigating to prompt in DOM", {
          promptLength: promptText.length,
        });

        // First, try to find generated image/video by matching prompt text
        const searchText = promptText.trim().toLowerCase();

        // Look for generated images/videos - find divs with class "group/tile" that contain images
        const generatedTiles = Array.from(document.querySelectorAll<HTMLElement>(".group\\/tile"));
        let targetImage: HTMLElement | null = null;

        for (const tile of generatedTiles) {
          // Find the parent container that should have the prompt text
          let parent = tile.closest(".flex.flex-col.gap-4") || tile.parentElement;

          // Look for prompt text in nearby elements
          while (parent && parent !== document.body) {
            const promptDiv = parent.querySelector(".truncate.text-token-text-primary");
            if (promptDiv) {
              const promptTextContent = promptDiv.textContent?.trim().toLowerCase() || "";
              if (promptTextContent.includes(searchText) || searchText.includes(promptTextContent)) {
                targetImage = tile;
                this.log("info", "✅ Found matching generated image/video", {
                  promptMatch: promptTextContent.substring(0, 50),
                });
                break;
              }
            }
            parent = parent.parentElement;
          }

          if (targetImage) break;
        }

        if (targetImage) {
          // Scroll to and highlight the image
          targetImage.scrollIntoView({ behavior: "smooth", block: "center" });
          await this.delay(300);

          // Add a temporary highlight
          const originalOutline = targetImage.style.outline;
          targetImage.style.outline = "3px solid #3b82f6";
          targetImage.style.outlineOffset = "4px";
          setTimeout(() => {
            targetImage!.style.outline = originalOutline;
            targetImage!.style.outlineOffset = "";
          }, 2000);

          return;
        }

        // Fallback: Find textarea with matching text (for prompts not yet generated)
        const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>("textarea"));
        let targetTextarea: HTMLTextAreaElement | null = null;

        for (const textarea of textareas) {
          // Check if textarea contains the prompt text (exact match or contains)
          const textareaValue = textarea.value.trim();

          if (textareaValue === searchText || textareaValue.includes(searchText) || searchText.includes(textareaValue)) {
            targetTextarea = textarea;
            this.log("info", "✅ Found matching textarea", {
              valueLength: textareaValue.length,
              matchType: textareaValue === searchText ? "exact" : "partial",
            });
            break;
          }
        }

        if (!targetTextarea) {
          // Try to find by scrolling through page and checking all textareas
          this.log("info", "Textarea not found in current view, searching page...");

          // Scroll to top first
          window.scrollTo({ top: 0, behavior: "smooth" });
          await this.delay(500);

          for (const textarea of textareas) {
            // Scroll to textarea
            textarea.scrollIntoView({ behavior: "smooth", block: "center" });
            await this.delay(300);

            const textareaValue = textarea.value.trim();
            const searchText = promptText.trim();

            if (textareaValue === searchText || textareaValue.includes(searchText) || searchText.includes(textareaValue)) {
              targetTextarea = textarea;
              this.log("info", "✅ Found matching textarea after scroll");
              break;
            }
          }
        }

        if (targetTextarea) {
          // Scroll to textarea and highlight it
          targetTextarea.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          await this.delay(300);

          // Highlight textarea temporarily
          const originalBorder = targetTextarea.style.border;
          const originalBoxShadow = targetTextarea.style.boxShadow;
          targetTextarea.style.border = "3px solid #10b981";
          targetTextarea.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.5)";
          targetTextarea.focus();

          // Remove highlight after 3 seconds
          setTimeout(() => {
            if (targetTextarea) {
              targetTextarea.style.border = originalBorder;
              targetTextarea.style.boxShadow = originalBoxShadow;
            }
          }, 3000);

          this.log("info", "✅ Textarea highlighted");
        } else {
          this.log("warn", "⚠️ Could not find textarea with matching prompt text");
        }

        // Find and highlight generated images/videos
        await this.highlightGeneratedMedia(promptText);
      }

      /**
       * Highlight generated images/videos that match the prompt
       */
      private async highlightGeneratedMedia(promptText: string): Promise<void> {
        this.log("info", "🎨 Highlighting generated media...");

        // Find all images and videos on the page
        const images = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
        const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video"));
        const allMedia = [...images, ...videos];

        this.log("info", `Found ${allMedia.length} media elements on page`);

        let highlightedCount = 0;
        const highlightStyle = {
          border: "4px solid #10b981",
          borderRadius: "8px",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
          transition: "all 0.3s ease",
        };

        // Find the textarea position
        const textarea = document.querySelector("textarea");
        if (textarea) {
          const textareaRect = textarea.getBoundingClientRect();
          const textareaBottom = textareaRect.bottom + window.scrollY;

          // Highlight images/videos that appear after the textarea (likely generated from it)
          for (const media of allMedia) {
            const mediaRect = media.getBoundingClientRect();
            const mediaTop = mediaRect.top + window.scrollY;

            // If media is below the textarea and within reasonable distance
            if (mediaTop > textareaBottom && mediaTop < textareaBottom + 2000) {
              const container = media.closest("div, article, section") as HTMLElement;
              if (container && !container.hasAttribute("data-sora-highlighted")) {
                // Store original styles
                const originalBorder = container.style.border;
                const originalBoxShadow = container.style.boxShadow;
                const originalBorderRadius = container.style.borderRadius;
                const originalTransition = container.style.transition;

                // Apply green highlight
                Object.assign(container.style, highlightStyle);
                container.setAttribute("data-sora-highlighted", "true");

                // Scroll to first highlighted media
                if (highlightedCount === 0) {
                  container.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  await this.delay(500);
                }

                // Remove highlight after 5 seconds
                setTimeout(() => {
                  container.style.border = originalBorder;
                  container.style.boxShadow = originalBoxShadow;
                  container.style.borderRadius = originalBorderRadius;
                  container.style.transition = originalTransition;
                  container.removeAttribute("data-sora-highlighted");
                }, 5000);

                highlightedCount++;
              }
            }
          }
        } else {
          // Fallback: Highlight recent media elements (last 4-8 items)
          const recentMedia = allMedia.slice(-8);
          for (const media of recentMedia) {
            const container = media.closest("div, article, section") as HTMLElement;
            if (container && !container.hasAttribute("data-sora-highlighted")) {
              const originalBorder = container.style.border;
              const originalBoxShadow = container.style.boxShadow;
              const originalBorderRadius = container.style.borderRadius;
              const originalTransition = container.style.transition;

              Object.assign(container.style, highlightStyle);
              container.setAttribute("data-sora-highlighted", "true");

              if (highlightedCount === 0) {
                container.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                await this.delay(500);
              }

              setTimeout(() => {
                container.style.border = originalBorder;
                container.style.boxShadow = originalBoxShadow;
                container.style.borderRadius = originalBorderRadius;
                container.style.transition = originalTransition;
                container.removeAttribute("data-sora-highlighted");
              }, 5000);

              highlightedCount++;
            }
          }
        }

        this.log("info", `✅ Highlighted ${highlightedCount} media elements`);
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
  },
});
