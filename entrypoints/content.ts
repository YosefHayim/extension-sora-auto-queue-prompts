/**
 * Content script for Sora page interaction
 * This script runs on sora.com pages and handles prompt submission
 */

import type {
  GeneratedPrompt,
  SoraTaskResponse,
  SoraPollingResponse,
  SoraTaskCreationResponse,
  SoraActiveTaskState,
  SoraGeneration,
} from "../src/types";

export default defineContentScript({
  matches: ["*://sora.chatgpt.com/*", "*://sora.com/*"],
  runAt: "document_end",
  main() {
    class SoraAutomation {
      private isProcessing = false;
      private currentPrompt: GeneratedPrompt | null = null;
      private generationStarted = false;
      private debugMode = true;
      private progressInterval: number | null = null;
      private completionObserver: MutationObserver | null = null;

      private lastApiResponse: {
        success: boolean;
        data?: SoraTaskCreationResponse;
        error?: string;
        isRateLimited?: boolean;
      } | null = null;
      private apiResponsePromise: Promise<void> | null = null;
      private apiResponseResolve: (() => void) | null = null;

      private activeTask: SoraActiveTaskState | null = null;
      private taskCompletionPromise: Promise<SoraActiveTaskState> | null = null;
      private taskCompletionResolve:
        | ((state: SoraActiveTaskState) => void)
        | null = null;
      private taskCompletionReject: ((error: Error) => void) | null = null;

      constructor() {
        this.init();
        this.setupApiInterceptor();
      }

      private setupApiInterceptor(): void {
        const self = this;
        const originalFetch = window.fetch;

        window.fetch = async function (
          input: RequestInfo | URL,
          init?: RequestInit,
        ): Promise<Response> {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : input.url;

          const isTaskCreationApi =
            url.includes("/backend/video_gen") ||
            url.includes("/backend/image_gen");

          const isTaskPollingApi =
            url.includes("/backend/tasks") ||
            url.includes("/v1/video/tasks") ||
            url.includes("/api/tasks");

          if (isTaskCreationApi) {
            self.log("info", "🔍 Intercepted Sora task creation API", { url });
            self.lastApiResponse = null;
            self.apiResponsePromise = new Promise((resolve) => {
              self.apiResponseResolve = resolve;
            });
          }

          try {
            const response = await originalFetch.call(window, input, init);

            if (isTaskCreationApi) {
              await self.handleTaskCreationResponse(response.clone());
            } else if (isTaskPollingApi && self.activeTask) {
              await self.handleTaskPollingResponse(response.clone());
            }

            return response;
          } catch (fetchError) {
            if (isTaskCreationApi) {
              self.lastApiResponse = {
                success: false,
                error:
                  fetchError instanceof Error
                    ? fetchError.message
                    : "Network error",
              };
              if (self.apiResponseResolve) {
                self.apiResponseResolve();
              }
            }
            throw fetchError;
          }
        };

        this.log("info", "✅ API interceptor installed");
      }

      private async handleTaskCreationResponse(
        response: Response,
      ): Promise<void> {
        try {
          const data = await response.json();
          this.log("info", "📡 Task creation response", {
            status: response.status,
            ok: response.ok,
            hasError: !!data.error,
            taskId: data.id,
          });

          if (data.error) {
            const errorCode = data.error.code;
            const errorMessage = data.error.message;

            this.lastApiResponse = {
              success: false,
              error: errorMessage,
              isRateLimited: errorCode === "too_many_daily_tasks",
              data,
            };

            this.log("error", "❌ Sora API error", {
              code: errorCode,
              message: errorMessage,
              details: data.error.details,
            });

            if (errorCode === "too_many_daily_tasks") {
              this.log("error", "🚫 Rate limit reached - stopping queue");
              chrome.runtime
                .sendMessage({
                  action: "rateLimitReached",
                  error: errorMessage,
                  details: data.error.details,
                })
                .catch(() => {});
            }
          } else if (data.id) {
            this.lastApiResponse = {
              success: true,
              data,
            };

            this.activeTask = {
              taskId: data.id,
              status: "queued",
              progress: 0,
              startedAt: Date.now(),
              lastUpdatedAt: Date.now(),
              generations: [],
              failureReason: null,
              isCompleted: false,
            };

            this.log("info", "✅ Sora task created, tracking started", {
              taskId: data.id,
            });
          }
        } catch (jsonError) {
          this.log("warn", "⚠️ Could not parse task creation response");
          this.lastApiResponse = { success: true, data: undefined };
        }

        if (this.apiResponseResolve) {
          this.apiResponseResolve();
        }
      }

      private async handleTaskPollingResponse(
        response: Response,
      ): Promise<void> {
        if (!this.activeTask) return;

        try {
          const data = await response.json();
          const taskData = this.extractTaskFromPollingResponse(data);

          if (!taskData || taskData.id !== this.activeTask.taskId) {
            return;
          }

          const prevStatus = this.activeTask.status;
          const prevProgress = this.activeTask.progress;

          this.activeTask.status = taskData.status;
          this.activeTask.progress = (taskData.progress_pct ?? 0) * 100;
          this.activeTask.lastUpdatedAt = Date.now();
          this.activeTask.failureReason = taskData.failure_reason;

          if (taskData.generations && taskData.generations.length > 0) {
            this.activeTask.generations = taskData.generations;
          }

          if (
            prevStatus !== taskData.status ||
            Math.abs(prevProgress - this.activeTask.progress) >= 5
          ) {
            this.log("info", "📊 Task status update from API", {
              taskId: taskData.id,
              status: taskData.status,
              progress: `${this.activeTask.progress.toFixed(1)}%`,
              generationsCount: this.activeTask.generations.length,
            });
          }

          if (
            this.currentPrompt &&
            Math.abs(prevProgress - this.activeTask.progress) >= 1
          ) {
            chrome.runtime
              .sendMessage({
                action: "updatePromptProgress",
                promptId: this.currentPrompt.id,
                progress: Math.round(this.activeTask.progress),
              })
              .catch(() => {});
          }

          if (taskData.status === "succeeded" && !this.activeTask.isCompleted) {
            this.activeTask.isCompleted = true;
            this.log("info", "✅ Task completed via API status", {
              taskId: taskData.id,
              generations: this.activeTask.generations.length,
            });

            if (this.taskCompletionResolve) {
              this.taskCompletionResolve(this.activeTask);
            }
          } else if (
            taskData.status === "failed" &&
            !this.activeTask.isCompleted
          ) {
            this.activeTask.isCompleted = true;
            this.log("error", "❌ Task failed via API status", {
              taskId: taskData.id,
              reason: taskData.failure_reason,
            });

            if (this.taskCompletionReject) {
              this.taskCompletionReject(
                new Error(taskData.failure_reason || "Task failed"),
              );
            }
          }
        } catch (err) {
          this.log("debug", "Could not parse polling response");
        }
      }

      private extractTaskFromPollingResponse(
        data: SoraPollingResponse | SoraTaskResponse | SoraTaskResponse[],
      ): SoraTaskResponse | null {
        if (Array.isArray(data)) {
          return data.find((t) => t.id === this.activeTask?.taskId) || null;
        }

        if ("task_responses" in data && Array.isArray(data.task_responses)) {
          return (
            data.task_responses.find((t) => t.id === this.activeTask?.taskId) ||
            null
          );
        }

        if ("data" in data && Array.isArray(data.data)) {
          const match = data.data.find(
            (d) => d.payload?.id === this.activeTask?.taskId,
          );
          return match?.payload || null;
        }

        if ("id" in data && "status" in data) {
          return data as SoraTaskResponse;
        }

        return null;
      }

      private getApiExtractedMedia(): Array<{
        url: string;
        mediaType: "video" | "image";
        generationId?: string;
        width?: number;
        height?: number;
      }> {
        if (
          !this.activeTask?.generations ||
          this.activeTask.generations.length === 0
        ) {
          return [];
        }

        const media: Array<{
          url: string;
          mediaType: "video" | "image";
          generationId?: string;
          width?: number;
          height?: number;
        }> = [];

        for (const gen of this.activeTask.generations) {
          const mediaType: "video" | "image" =
            gen.task_type === "video_gen" ? "video" : "image";

          const url = gen.encodings?.source?.path || gen.url;
          if (url) {
            media.push({
              url,
              mediaType,
              generationId: gen.id,
              width: gen.width,
              height: gen.height,
            });
          }
        }

        return media;
      }

      /**
       * Wait for the Sora API response after form submission
       */
      private async waitForApiResponse(timeout: number = 30000): Promise<{
        success: boolean;
        error?: string;
        isRateLimited?: boolean;
      }> {
        this.log("info", "⏳ Waiting for Sora API response...");

        if (!this.apiResponsePromise) {
          // No pending request, return success
          return { success: true };
        }

        // Wait for the API response with timeout
        const timeoutPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, timeout),
        );

        await Promise.race([this.apiResponsePromise, timeoutPromise]);

        if (this.lastApiResponse) {
          return {
            success: this.lastApiResponse.success,
            error: this.lastApiResponse.error,
            isRateLimited: this.lastApiResponse.isRateLimited,
          };
        }

        // Timeout reached without response
        this.log("warn", "⚠️ API response wait timed out");
        return { success: true }; // Assume success on timeout
      }

      /**
       * Log to both console and background (for visibility)
       */
      private log(
        level: "log" | "error" | "warn" | "info" | "debug",
        message: string,
        data?: any,
      ): void {
        const fullMessage = `[Sora Content] ${message}`;
        const consoleLevel =
          level === "log" || level === "debug" ? "log" : level;
        console[consoleLevel](fullMessage, data || "");

        // Map to logger levels
        const loggerLevel =
          level === "log" ? "info" : level === "debug" ? "debug" : level;

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
        chrome.runtime.onMessage.addListener(
          (request, sender, sendResponse) => {
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

            if (request.action === "setMediaType") {
              this.setMediaType(request.mediaType)
                .then(() => {
                  sendResponse({ success: true });
                })
                .catch((error) => {
                  this.log("error", "Failed to set media type", {
                    error: error.message,
                  });
                  sendResponse({ success: false, error: error.message });
                });
              return true;
            }

            if (request.action === "extractMedia") {
              this.extractGeneratedMediaUrls()
                .then((mediaUrls) => {
                  this.log("info", `Extracted ${mediaUrls.length} media URLs`);
                  sendResponse({ success: true, mediaUrls });
                })
                .catch((error) => {
                  this.log("error", "Failed to extract media URLs", {
                    error: error.message,
                  });
                  sendResponse({
                    success: false,
                    error: error.message,
                    mediaUrls: [],
                  });
                });
              return true;
            }

            if (request.action === "bulkExtractAllMedia") {
              this.bulkExtractAllVisibleMedia()
                .then((result) => {
                  this.log(
                    "info",
                    `Bulk extracted ${result.totalCount} media items`,
                  );
                  sendResponse({ success: true, ...result });
                })
                .catch((error) => {
                  this.log("error", "Failed to bulk extract media", {
                    error: error.message,
                  });
                  sendResponse({
                    success: false,
                    error: error.message,
                    mediaUrls: [],
                    totalCount: 0,
                  });
                });
              return true;
            }

            if (request.action === "getActiveTaskState") {
              sendResponse({
                success: true,
                activeTask: this.activeTask,
                hasGenerations: (this.activeTask?.generations?.length ?? 0) > 0,
              });
              return true;
            }

            if (request.action === "getApiExtractedMedia") {
              const media = this.getApiExtractedMedia();
              sendResponse({
                success: true,
                mediaUrls: media,
                source: media.length > 0 ? "api" : "none",
              });
              return true;
            }
          },
        );

        this.log(
          "info",
          `🚀 Content script initialized on ${window.location.href}`,
        );
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
        const allTextareas = Array.from(
          document.querySelectorAll("textarea"),
        ).map((ta, i) => ({
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

        const buttons = Array.from(document.querySelectorAll("button")).map(
          (btn, i) => ({
            index: i,
            text: btn.textContent?.trim().substring(0, 100),
            ariaLabel: btn.getAttribute("aria-label"),
            disabled: btn.disabled,
            className: btn.className.substring(0, 100),
            type: btn.type,
          }),
        );

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
          this.log(
            "warn",
            "Already processing a prompt, rejecting new request",
          );
          throw new Error("Already processing a prompt");
        }

        this.isProcessing = true;
        this.currentPrompt = prompt;
        this.generationStarted = false;
        this.activeTask = null;
        this.taskCompletionPromise = null;
        this.taskCompletionResolve = null;
        this.taskCompletionReject = null;

        this.log("info", "═══ SUBMIT PROMPT START ═══");
        this.log("info", "Prompt details", {
          text: prompt.text,
          length: prompt.text.length,
          mediaType: prompt.mediaType,
          aspectRatio: prompt.aspectRatio,
          hasImageData: !!prompt.imageData,
          hasImageUrl: !!prompt.imageUrl,
        });

        try {
          // Step 0: Handle local image upload if present
          if (prompt.imageData && prompt.imageName && prompt.imageType) {
            this.log("info", "📍 Step 0: Uploading local image...");
            await this.uploadLocalImage(
              prompt.imageData,
              prompt.imageName,
              prompt.imageType,
            );
            this.log("info", "✅ Step 0 SUCCESS: Image uploaded");
          } else if (prompt.imageUrl) {
            this.log(
              "info",
              "📍 Image URL present - URL-based images require manual attachment",
            );
          }

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

          // Reset API response tracking before submission
          this.lastApiResponse = null;
          this.apiResponsePromise = null;

          // Step 4: Submit form
          this.log("info", "📍 Step 4: Submitting form...");
          await this.submitForm(textarea);
          this.log("info", "✅ Step 4 SUCCESS: Form submitted");

          // Step 4.5: Wait for API response and check for errors
          this.log("info", "📍 Step 4.5: Checking API response...");
          const apiResult = await this.waitForApiResponse(15000);

          if (!apiResult.success) {
            if (apiResult.isRateLimited) {
              this.log(
                "error",
                "❌ Step 4.5 FAILED: Rate limit reached",
                apiResult.error,
              );
              throw new Error(`RATE_LIMIT:${apiResult.error}`);
            } else {
              this.log(
                "error",
                "❌ Step 4.5 FAILED: API error",
                apiResult.error,
              );
              throw new Error(`API_ERROR:${apiResult.error}`);
            }
          }
          this.log("info", "✅ Step 4.5 SUCCESS: API accepted the request");

          // Step 5: Wait for completion
          this.log("info", "📍 Step 5: Waiting for generation completion...");
          await this.waitForCompletion();
          this.log("info", "✅ Step 5 SUCCESS: Generation completed");
          this.stopProgressMonitoring();
          this.stopCompletionObserver();

          this.log("info", "═══ SUBMIT PROMPT SUCCESS ═══");
          this.cleanupAfterPrompt();
        } catch (error) {
          const activeTaskRef = this.activeTask as SoraActiveTaskState | null;
          this.log("error", "═══ SUBMIT PROMPT FAILED ═══", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            currentStep: this.isProcessing ? "unknown" : "cleanup",
            taskState: activeTaskRef
              ? {
                  status: activeTaskRef.status,
                  progress: activeTaskRef.progress,
                }
              : null,
          });
          this.stopProgressMonitoring();
          this.stopCompletionObserver();
          this.cleanupAfterPrompt();
          throw error;
        }
      }

      private cleanupAfterPrompt(): void {
        this.isProcessing = false;
        this.currentPrompt = null;
        this.generationStarted = false;
        this.activeTask = null;
        this.taskCompletionPromise = null;
        this.taskCompletionResolve = null;
        this.taskCompletionReject = null;
      }
      private findTextarea(): HTMLTextAreaElement | null {
        this.log("info", "🔍 Starting textarea search...");

        // Try multiple selectors
        const selectors = [
          'textarea[placeholder*="Describe your image"]',
          'textarea[placeholder*="Describe"]',
          "textarea.bg-transparent",
          "textarea",
        ];

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
       * Upload a local image file to Sora's file input
       */
      private async uploadLocalImage(
        imageData: string,
        imageName: string,
        imageType: string,
      ): Promise<void> {
        this.log("info", "📤 Uploading local image to Sora...", {
          imageName,
          imageType,
          dataLength: imageData.length,
        });

        try {
          // Convert base64 to Blob
          const binaryString = atob(imageData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: imageType });

          // Create File object
          const file = new File([blob], imageName, { type: imageType });
          this.log("info", "✅ Created File object", {
            name: file.name,
            size: file.size,
            type: file.type,
          });

          // Find Sora's file upload input
          const fileInputSelectors = [
            'input[type="file"][accept*="image"]',
            'input[type="file"]',
            '[data-testid="file-upload-input"]',
          ];

          let fileInput: HTMLInputElement | null = null;
          for (const selector of fileInputSelectors) {
            fileInput = document.querySelector<HTMLInputElement>(selector);
            if (fileInput) {
              this.log(
                "info",
                `✅ Found file input with selector: ${selector}`,
              );
              break;
            }
          }

          if (!fileInput) {
            // Try to find and click a button that triggers file upload
            this.log(
              "info",
              "File input not found, looking for upload button...",
            );
            const uploadButton = this.findUploadButton();
            if (uploadButton) {
              this.log(
                "info",
                "Found upload button, clicking to reveal file input...",
              );
              uploadButton.click();
              await this.delay(500);

              // Try finding file input again
              for (const selector of fileInputSelectors) {
                fileInput = document.querySelector<HTMLInputElement>(selector);
                if (fileInput) {
                  this.log(
                    "info",
                    `✅ Found file input after button click: ${selector}`,
                  );
                  break;
                }
              }
            }
          }

          if (!fileInput) {
            this.log(
              "error",
              "❌ Could not find file upload input on Sora page",
            );
            throw new Error("Could not find file upload input on Sora page");
          }

          // Create DataTransfer and add file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          // Set files on input
          fileInput.files = dataTransfer.files;
          this.log("info", "✅ Set file on input element");

          // Dispatch events to trigger React's file handling
          fileInput.dispatchEvent(new Event("change", { bubbles: true }));
          fileInput.dispatchEvent(new Event("input", { bubbles: true }));
          this.log("info", "✅ Dispatched change and input events");

          // Wait for the image to be fully uploaded and processed by Sora
          await this.waitForImageUploadComplete();

          this.log("info", "✅ Image uploaded and processed successfully");
        } catch (error) {
          this.log("error", "❌ Failed to upload image", {
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }

      /**
       * Wait for Sora to finish processing the uploaded image
       * Looks for image preview elements or upload completion indicators
       */
      private async waitForImageUploadComplete(
        timeout: number = 30000,
      ): Promise<void> {
        this.log("info", "⏳ Waiting for image upload to complete...");

        const startTime = Date.now();
        const checkInterval = 500;

        // Selectors that indicate image upload is complete
        const imageLoadedSelectors = [
          // Image preview in the input area
          'img[src*="blob:"]',
          'img[src*="oaiusercontent"]',
          'img[src*="sora"]',
          // Upload success indicators
          '[data-testid="uploaded-image"]',
          '[data-testid="image-preview"]',
          // Common patterns for uploaded images
          ".uploaded-image",
          ".image-preview",
          // Look for thumbnail/preview containers with images
          '[class*="preview"] img',
          '[class*="thumbnail"] img',
          '[class*="upload"] img:not([src=""])',
        ];

        // Selectors that indicate upload is in progress
        const uploadingSelectors = [
          '[class*="loading"]',
          '[class*="uploading"]',
          '[class*="progress"]',
          'svg[class*="spinner"]',
          '[role="progressbar"]',
        ];

        while (Date.now() - startTime < timeout) {
          // First check if upload is still in progress
          let isUploading = false;
          for (const selector of uploadingSelectors) {
            const uploadIndicator = document.querySelector(selector);
            if (uploadIndicator) {
              const isVisible =
                uploadIndicator instanceof HTMLElement &&
                uploadIndicator.offsetParent !== null;
              if (isVisible) {
                isUploading = true;
                this.log("debug", `Upload in progress: ${selector}`);
                break;
              }
            }
          }

          // Check for image loaded indicators
          for (const selector of imageLoadedSelectors) {
            const imageElement = document.querySelector(selector);
            if (imageElement) {
              const isVisible =
                imageElement instanceof HTMLElement &&
                imageElement.offsetParent !== null;
              // For img elements, also check if src is not empty
              const hasValidSrc =
                imageElement instanceof HTMLImageElement
                  ? imageElement.src && imageElement.src.length > 0
                  : true;

              if (isVisible && hasValidSrc && !isUploading) {
                this.log("info", `✅ Image upload complete: ${selector}`);
                // Give a small buffer for React to finish processing
                await this.delay(500);
                return;
              }
            }
          }

          await this.delay(checkInterval);
        }

        // If we timeout but no uploading indicator, assume it's ready
        this.log(
          "warn",
          "⚠️ Image upload wait timed out, proceeding anyway...",
        );
      }

      /**
       * Find an upload button that might trigger file selection
       */
      private findUploadButton(): HTMLElement | null {
        const buttonSelectors = [
          'button[aria-label*="upload" i]',
          'button[aria-label*="image" i]',
          'button[aria-label*="attach" i]',
          'button[aria-label*="add image" i]',
          '[data-testid="upload-button"]',
        ];

        for (const selector of buttonSelectors) {
          const button = document.querySelector<HTMLElement>(selector);
          if (button) {
            this.log("info", `Found upload button with selector: ${selector}`);
            return button;
          }
        }

        // Try finding by text content
        const buttons = Array.from(document.querySelectorAll("button"));
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || "";
          const ariaLabel =
            button.getAttribute("aria-label")?.toLowerCase() || "";
          if (
            text.includes("upload") ||
            text.includes("attach") ||
            text.includes("add image") ||
            ariaLabel.includes("upload") ||
            ariaLabel.includes("attach") ||
            ariaLabel.includes("add image")
          ) {
            this.log("info", `Found upload button by text/aria-label: ${text}`);
            return button;
          }
        }

        // Look for image/attachment icons (common patterns)
        const iconButtons = document.querySelectorAll(
          'button svg, button [class*="icon"]',
        );
        for (const icon of Array.from(iconButtons)) {
          const button = icon.closest("button");
          if (button) {
            const title = button.getAttribute("title")?.toLowerCase() || "";
            if (
              title.includes("upload") ||
              title.includes("image") ||
              title.includes("attach")
            ) {
              this.log("info", `Found upload button by icon title: ${title}`);
              return button;
            }
          }
        }

        this.log("warn", "⚠️ No upload button found");
        return null;
      }

      /**
       * Simulate human typing
       */
      private async typeText(
        element: HTMLTextAreaElement,
        text: string,
      ): Promise<void> {
        this.log("info", `⌨️ Starting to type ${text.length} characters`);

        // Focus the element first
        element.focus();
        this.log("debug", "Element focused");
        await this.delay(100); // Give React time to register focus

        // Try to get React's internal instance
        const reactKey = Object.keys(element).find((key) =>
          key.startsWith("__react"),
        );
        this.log("debug", "React key detection", {
          reactKeyFound: !!reactKey,
          reactKey,
        });

        // Use React's native setter pattern - this is CRITICAL for React to detect changes
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        )?.set;

        if (nativeInputValueSetter) {
          this.log("info", "✅ Using native React setter pattern");
          // Call the native setter (bypasses React's controlled input)
          nativeInputValueSetter.call(element, text);
        } else {
          this.log(
            "warn",
            "⚠️ Native setter not found, falling back to direct assignment",
          );
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
        element.dispatchEvent(
          new KeyboardEvent("keydown", { bubbles: true, cancelable: true }),
        );
        element.dispatchEvent(
          new KeyboardEvent("keyup", { bubbles: true, cancelable: true }),
        );
        this.log("debug", "Dispatched keyboard events");

        // Re-focus to ensure React sees the element as active
        element.focus();
        this.log("debug", "Re-focused element");

        // Small delay to let React update its state
        await this.delay(200);

        // Verify the value stuck
        const finalValueCheck = element.value === text;
        this.log(
          "info",
          `✅ Input set ${finalValueCheck ? "successfully" : "FAILED"}`,
          {
            expectedLength: text.length,
            actualLength: element.value.length,
            valuePreview: element.value.substring(0, 50),
            success: finalValueCheck,
          },
        );

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
        while (
          retries < maxRetries &&
          (!submitButton || submitButton.disabled)
        ) {
          this.log(
            "info",
            `⏳ Retry ${retries + 1}/${maxRetries}: Waiting for submit button to be enabled...`,
          );
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
          throw new Error(
            "Submit button remained disabled - React may not have detected the input change",
          );
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
          form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
          );
        } else {
          this.log("warn", "⚠️ No form element found");
        }
      }

      /**
       * Find the submit button
       */
      private findSubmitButton(): HTMLButtonElement | null {
        this.log("info", "🔍 Searching for submit button...");
        const buttons = Array.from(
          document.querySelectorAll<HTMLButtonElement>("button"),
        );
        this.log("debug", `Found ${buttons.length} total buttons on page`);

        // Look for submit-like buttons
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const text = button.textContent?.toLowerCase() || "";
          const ariaLabel =
            button.getAttribute("aria-label")?.toLowerCase() || "";

          const isSubmitButton =
            text.includes("generate") ||
            text.includes("create") ||
            text.includes("submit") ||
            ariaLabel.includes("generate") ||
            ariaLabel.includes("create");

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

      private async waitForCompletion(): Promise<void> {
        this.log(
          "info",
          "⏳ Starting completion detection (API + DOM fallback)...",
        );

        const maxWaitTime = 300000;
        let timeoutId: ReturnType<typeof setTimeout>;

        this.taskCompletionPromise = new Promise<SoraActiveTaskState>(
          (resolve, reject) => {
            this.taskCompletionResolve = resolve;
            this.taskCompletionReject = reject;
          },
        );

        this.startProgressMonitoring();

        const startWaitTime = 15000;
        let startElapsed = 0;
        const checkInterval = 500;

        while (startElapsed < startWaitTime && !this.generationStarted) {
          if (
            this.activeTask?.status === "running" ||
            this.activeTask?.status === "queued"
          ) {
            this.generationStarted = true;
            this.log("info", "✅ Generation started (API detected)", {
              status: this.activeTask.status,
            });
            break;
          }

          if (this.checkIfGenerationStarted()) {
            this.generationStarted = true;
            this.log("info", "✅ Generation started (DOM detected)");
            break;
          }

          await this.delay(checkInterval);
          startElapsed += checkInterval;
        }

        if (!this.generationStarted) {
          if (
            this.activeTask?.status === "running" ||
            this.checkIfGenerationStarted()
          ) {
            this.generationStarted = true;
          } else {
            this.log("error", "❌ Generation did not start within 15 seconds");
            if (this.checkForError()) {
              throw new Error(
                "Generation failed to start - error detected on page",
              );
            }
            throw new Error("Generation failed to start within 15 seconds");
          }
        }

        return new Promise<void>((resolve, reject) => {
          timeoutId = setTimeout(() => {
            this.stopCompletionObserver();
            this.taskCompletionResolve = null;
            this.taskCompletionReject = null;
            this.log("error", "❌ Generation timed out", {
              maxWaitTime: maxWaitTime / 1000 + "s",
            });
            reject(new Error("Generation timed out after 5 minutes"));
          }, maxWaitTime);

          if (this.activeTask?.isCompleted) {
            this.log("info", "✅ Generation already completed (API)!");
            clearTimeout(timeoutId);
            resolve();
            return;
          }

          if (this.checkIfReady()) {
            this.log("info", "✅ Generation completed immediately (DOM)!");
            clearTimeout(timeoutId);
            resolve();
            return;
          }

          const apiCompletionHandler = this.taskCompletionPromise!.then(
            (state) => {
              this.log("info", "✅ Generation completed via API!", {
                generations: state.generations.length,
                progress: state.progress,
              });
              clearTimeout(timeoutId);
              this.stopCompletionObserver();
              resolve();
            },
          ).catch((err) => {
            this.log("error", "❌ Task failed via API", { error: err.message });
            clearTimeout(timeoutId);
            this.stopCompletionObserver();
            reject(err);
          });

          this.completionObserver = new MutationObserver(() => {
            if (this.checkIfReady()) {
              this.log("info", "✅ Generation completed (DOM Observer)!");
              this.stopCompletionObserver();
              clearTimeout(timeoutId);
              this.delay(1000).then(() => resolve());
            }
          });

          this.log(
            "info",
            "👀 Watching for completion (API primary, DOM fallback)...",
          );
          this.completionObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
              "aria-live",
              "stroke-dashoffset",
              "class",
              "role",
            ],
          });
        });
      }

      /**
       * Stop the completion observer
       */
      private stopCompletionObserver(): void {
        if (this.completionObserver) {
          this.completionObserver.disconnect();
          this.completionObserver = null;
          this.log("info", "👀 Stopped completion observer");
        }
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
              this.log(
                "debug",
                `✅ Generation started - found loader with %: ${selector}`,
              );
              return true; // Percentage indicator = loading
            }
            // Check if the element is visible (not display:none)
            if (
              element instanceof HTMLElement &&
              element.offsetParent !== null
            ) {
              this.log(
                "debug",
                `✅ Generation started - found visible loader: ${selector}`,
              );
              return true;
            }
          }
        }

        // Check for status toast indicating processing
        const statusToast =
          document.querySelector<HTMLElement>('[role="status"]');
        if (statusToast) {
          const text = statusToast.textContent?.toLowerCase() || "";
          if (
            text.includes("generating") ||
            text.includes("processing") ||
            text.includes("%")
          ) {
            this.log(
              "debug",
              `✅ Generation started - status toast: ${text.substring(0, 50)}`,
            );
            return true;
          }
        }

        return false;
      }

      /**
       * Check if there's an error message
       */
      private checkForError(): boolean {
        const statusToast =
          document.querySelector<HTMLElement>('[role="status"]');
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
        const selectors = [
          "svg circle[stroke-dashoffset]",
          '[aria-live="polite"]',
          ".bg-token-bg-secondary svg circle",
        ];

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
        const statusToast =
          document.querySelector<HTMLElement>('[role="status"]');
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
          return;
        }

        this.log("info", "📊 Starting progress monitoring...");
        this.progressInterval = setInterval(async () => {
          const progress = this.extractProgress();
          if (progress !== null && this.currentPrompt) {
            try {
              await chrome.runtime.sendMessage({
                action: "updatePromptProgress",
                promptId: this.currentPrompt.id,
                progress,
              });
            } catch (error) {
              this.log("debug", "Progress update send failed", {
                error: error instanceof Error ? error.message : String(error),
              });
            }

            if (progress >= 100) {
              this.log("info", "✅ Progress reached 100%, marking as complete");
              this.stopProgressMonitoring();

              try {
                const response = await chrome.runtime.sendMessage({
                  action: "markPromptComplete",
                  promptId: this.currentPrompt.id,
                });

                if (!response?.success) {
                  this.log("warn", "❌ Mark complete returned non-success", {
                    error: response?.error,
                  });
                }
              } catch (error) {
                this.log("error", "❌ Mark complete message failed at 100%", {
                  error: error instanceof Error ? error.message : String(error),
                });
              }
            }
          }
        }, 500) as unknown as number;
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
          this.log(
            "debug",
            "⏸️ Not checking completion - generation not started yet",
          );
          return false;
        }

        // Check if loader is still present with percentage
        const loader = document.querySelector("svg circle[stroke-dashoffset]");
        if (loader && loader.parentElement?.textContent?.includes("%")) {
          // Still loading
          const percentage =
            loader.parentElement?.textContent?.match(/\d+%/)?.[0];
          this.log("debug", `⏳ Still loading: ${percentage || "checking..."}`);
          return false;
        }

        // Check for any visible loading indicators
        const loadingSelectors = [
          "svg circle[stroke-dashoffset]",
          '[aria-live="polite"]',
          ".bg-token-bg-secondary svg circle",
        ];

        for (const selector of loadingSelectors) {
          const element = document.querySelector(selector);
          if (element instanceof HTMLElement && element.offsetParent !== null) {
            const parent = element.parentElement;
            if (parent?.textContent?.includes("%")) {
              this.log(
                "debug",
                `⏳ Still loading - found active loader: ${selector}`,
              );
              return false; // Still showing percentage = still loading
            }
          }
        }

        // Check for "Ready" status toast
        const statusToast =
          document.querySelector<HTMLElement>('[role="status"]');
        if (statusToast) {
          const text = statusToast.textContent?.toLowerCase() || "";
          if (text.includes("ready")) {
            this.log(
              "info",
              '✅ Generation ready - status toast shows "ready"',
            );
            return true;
          }
          // If error or failed, consider it done (so we can move to next prompt)
          if (text.includes("error") || text.includes("failed")) {
            this.log(
              "warn",
              `⚠️ Generation failed - status toast: ${text.substring(0, 50)}`,
            );
            return true;
          }
        }

        // If no loader is visible and generation had started, consider it complete
        const visibleLoader = document.querySelector(
          ".bg-token-bg-secondary svg circle",
        );
        if (!visibleLoader) {
          this.log(
            "info",
            "✅ No visible loader - generation appears complete",
          );
          return true;
        }

        this.log(
          "debug",
          "⏳ Still checking... loader visible but no percentage",
        );
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
          const mediaTypeButtons = document.querySelectorAll(
            'button[role="combobox"]',
          );
          for (const button of Array.from(mediaTypeButtons)) {
            const text = button.textContent?.toLowerCase() || "";
            const span = button.querySelector("span");
            const buttonText = span?.textContent?.toLowerCase() || text;

            if (buttonText.includes("image") || buttonText.includes("img")) {
              mediaType = "image";
              this.log("debug", "Found Image media type");
              break;
            } else if (
              buttonText.includes("video") ||
              buttonText.includes("vid")
            ) {
              mediaType = "video";
              this.log("debug", "Found Video media type");
              break;
            }
          }

          // Find aspect ratio (1:1, 16:9, etc.)
          let aspectRatio: import("../src/types").AspectRatio | null = null;
          const aspectRatioButtons = document.querySelectorAll(
            'button[role="combobox"]',
          );
          const aspectRatioPatterns: Record<
            string,
            import("../src/types").AspectRatio
          > = {
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

            for (const [pattern, ratio] of Object.entries(
              aspectRatioPatterns,
            )) {
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
          const variationButtons = document.querySelectorAll(
            'button[role="combobox"]',
          );
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
          const flexContainers = document.querySelectorAll(
            '.flex.gap-1\\.5, .flex.gap-1, [class*="gap-1"]',
          );
          for (const container of Array.from(flexContainers)) {
            const buttons = container.querySelectorAll(
              'button[role="combobox"]',
            );

            for (const button of Array.from(buttons)) {
              const text = button.textContent?.toLowerCase() || "";
              const span = button.querySelector("span");
              const buttonText = (
                span?.textContent ||
                button.textContent ||
                ""
              ).toLowerCase();

              // Check for media type
              if (!mediaType) {
                if (
                  buttonText.includes("image") ||
                  buttonText.includes("img")
                ) {
                  mediaType = "image";
                } else if (
                  buttonText.includes("video") ||
                  buttonText.includes("vid")
                ) {
                  mediaType = "video";
                }
              }

              // Check for aspect ratio
              if (!aspectRatio) {
                for (const [pattern, ratio] of Object.entries(
                  aspectRatioPatterns,
                )) {
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
       * Set media type on Sora page (Image or Video)
       */
      private async setMediaType(mediaType: "video" | "image"): Promise<void> {
        this.log("info", `🎬 Setting media type to: ${mediaType}`);

        try {
          // Find the media type button - it's the first combobox button that contains "Image" or "Video"
          const buttons = Array.from(
            document.querySelectorAll('button[role="combobox"]'),
          );
          let mediaTypeButton: HTMLButtonElement | null = null;

          for (const button of buttons) {
            const text = button.textContent?.toLowerCase() || "";
            if (text.includes("image") || text.includes("video")) {
              mediaTypeButton = button as HTMLButtonElement;
              this.log("debug", `Found media type button with text: "${text}"`);
              break;
            }
          }

          if (!mediaTypeButton) {
            throw new Error("Could not find media type button on Sora page");
          }

          // Check current media type
          const currentText = mediaTypeButton.textContent?.toLowerCase() || "";
          const currentMediaType = currentText.includes("video")
            ? "video"
            : "image";

          if (currentMediaType === mediaType) {
            this.log("info", `✅ Media type already set to ${mediaType}`);
            return;
          }

          // Click to open dropdown
          this.log("debug", "Clicking media type button to open dropdown...");
          mediaTypeButton.click();
          await this.delay(500); // Wait longer for Radix dropdown to appear

          // Find the Radix popper content wrapper (the dropdown)
          const popperWrapper = document.querySelector(
            "[data-radix-popper-content-wrapper]",
          );
          if (!popperWrapper) {
            this.log("error", "Could not find dropdown wrapper");
            throw new Error("Dropdown did not open");
          }

          this.log(
            "debug",
            "Found Radix popper wrapper, looking for options...",
          );

          // Find all options within the dropdown
          const options = popperWrapper.querySelectorAll('[role="option"]');
          this.log("debug", `Found ${options.length} options in dropdown`);

          let targetOption: HTMLElement | null = null;

          for (const option of Array.from(options)) {
            const optionText = option.textContent?.toLowerCase() || "";
            this.log("debug", `Checking option: "${optionText}"`);

            // Look for the unchecked option that matches our target
            const isUnchecked =
              option.getAttribute("data-state") === "unchecked";
            const matchesTarget =
              (mediaType === "video" && optionText.includes("video")) ||
              (mediaType === "image" && optionText.includes("image"));

            if (matchesTarget) {
              targetOption = option as HTMLElement;
              this.log(
                "debug",
                `Found target option: "${optionText}", unchecked: ${isUnchecked}`,
              );
              break;
            }
          }

          if (targetOption) {
            this.log("debug", `Clicking ${mediaType} option...`);

            // Try multiple click methods for Radix UI
            targetOption.focus();
            await this.delay(100);

            // Dispatch pointer events for better Radix compatibility
            targetOption.dispatchEvent(
              new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
              }),
            );
            targetOption.dispatchEvent(
              new PointerEvent("pointerup", {
                bubbles: true,
                cancelable: true,
              }),
            );
            targetOption.click();

            await this.delay(300);
            this.log("info", `✅ Media type changed to ${mediaType}`);
          } else {
            // Close dropdown if we couldn't find option
            this.log("error", "Could not find target option, closing dropdown");
            document.body.click();
            throw new Error(`Could not find ${mediaType} option in dropdown`);
          }
        } catch (error) {
          this.log("error", "❌ Failed to set media type", {
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }

      /**
       * Handle generation completion notification
       * Includes retry logic and fallback to direct storage update
       */
      private async handleGenerationComplete(): Promise<void> {
        this.log("info", "🎉 Handling generation complete");

        // Notify background that this prompt is complete
        if (this.currentPrompt) {
          const maxRetries = 3;
          let retries = 0;
          let success = false;

          while (retries < maxRetries && !success) {
            try {
              const response = await chrome.runtime.sendMessage({
                action: "markPromptComplete",
                promptId: this.currentPrompt.id,
              });

              if (response?.success) {
                this.log("info", "✅ Successfully marked prompt complete", {
                  promptId: this.currentPrompt.id,
                  attempt: retries + 1,
                });
                success = true;
              } else {
                throw new Error(
                  response?.error || "Background returned non-success response",
                );
              }
            } catch (error) {
              retries++;
              this.log(
                "warn",
                `⚠️ Mark complete attempt ${retries}/${maxRetries} failed`,
                {
                  error: error instanceof Error ? error.message : String(error),
                },
              );

              if (retries < maxRetries) {
                // Exponential backoff: 1s, 2s, 3s
                await this.delay(1000 * retries);
              } else {
                this.log("error", "❌ All retry attempts exhausted", { error });

                // Last resort: try direct storage update
                try {
                  const result = await chrome.storage.local.get("prompts");
                  const prompts = result.prompts || [];
                  const promptId = this.currentPrompt?.id;
                  const updated = prompts.map((p: any) =>
                    p.id === promptId
                      ? {
                          ...p,
                          status: "completed",
                          completedTime: Date.now(),
                          duration: p.startTime
                            ? Date.now() - p.startTime
                            : undefined,
                        }
                      : p,
                  );
                  await chrome.storage.local.set({ prompts: updated });
                  this.log(
                    "info",
                    "✅ Status updated via direct storage access",
                  );
                  success = true;
                } catch (storageError) {
                  this.log("error", "❌ Direct storage update also failed", {
                    error:
                      storageError instanceof Error
                        ? storageError.message
                        : String(storageError),
                  });
                }
              }
            }
          }
        }

        // Reset state
        this.isProcessing = false;
        this.currentPrompt = null;
        this.generationStarted = false;
      }

      private async extractGeneratedMediaUrls(): Promise<
        Array<{ url: string; mediaType: "video" | "image" }>
      > {
        this.log("info", "📥 Extracting generated media URLs...");

        const mediaUrls: Array<{ url: string; mediaType: "video" | "image" }> =
          [];
        const seenUrls = new Set<string>();

        if (
          this.activeTask?.generations &&
          this.activeTask.generations.length > 0
        ) {
          this.log("info", "📡 Using API-provided generation URLs", {
            count: this.activeTask.generations.length,
          });

          for (const gen of this.activeTask.generations) {
            const mediaType: "video" | "image" =
              gen.task_type === "video_gen" ? "video" : "image";

            if (gen.url && !seenUrls.has(gen.url)) {
              seenUrls.add(gen.url);
              mediaUrls.push({ url: gen.url, mediaType });
              this.log(
                "debug",
                `API URL (${mediaType}): ${gen.url.substring(0, 80)}...`,
              );
            }

            const sourcePath = gen.encodings?.source?.path;
            if (sourcePath && !seenUrls.has(sourcePath)) {
              seenUrls.add(sourcePath);
              mediaUrls.push({ url: sourcePath, mediaType });
              this.log(
                "debug",
                `API source (${mediaType}): ${sourcePath.substring(0, 80)}...`,
              );
            }
          }

          if (mediaUrls.length > 0) {
            this.log("info", `✅ Extracted ${mediaUrls.length} URLs from API`);
            return mediaUrls;
          }
        }

        this.log("info", "📋 Falling back to DOM extraction...");
        await this.delay(500);

        const tiles = document.querySelectorAll<HTMLElement>(".group\\/tile");
        this.log("debug", `Found ${tiles.length} generated tiles`);

        for (const tile of Array.from(tiles)) {
          // Extract images from tile
          const images = tile.querySelectorAll<HTMLImageElement>("img");
          for (const img of Array.from(images)) {
            if (img.src && !seenUrls.has(img.src)) {
              // Skip tiny images (likely icons) and data URIs that are too small
              if (img.naturalWidth > 100 || img.width > 100) {
                seenUrls.add(img.src);
                mediaUrls.push({ url: img.src, mediaType: "image" });
                this.log(
                  "debug",
                  `Found image: ${img.src.substring(0, 100)}...`,
                );
              }
            }
          }

          // Extract videos from tile
          const videos = tile.querySelectorAll<HTMLVideoElement>("video");
          for (const video of Array.from(videos)) {
            const videoSrc = video.src || video.querySelector("source")?.src;
            if (videoSrc && !seenUrls.has(videoSrc)) {
              seenUrls.add(videoSrc);
              mediaUrls.push({ url: videoSrc, mediaType: "video" });
              this.log(
                "debug",
                `Found video: ${videoSrc.substring(0, 100)}...`,
              );
            }
          }
        }

        // Also check for images/videos with OpenAI CDN URLs (oaiusercontent)
        const allImages = document.querySelectorAll<HTMLImageElement>(
          'img[src*="oaiusercontent"], img[src*="sora"]',
        );
        for (const img of Array.from(allImages)) {
          if (img.src && !seenUrls.has(img.src)) {
            if (img.naturalWidth > 100 || img.width > 100) {
              seenUrls.add(img.src);
              mediaUrls.push({ url: img.src, mediaType: "image" });
              this.log(
                "debug",
                `Found CDN image: ${img.src.substring(0, 100)}...`,
              );
            }
          }
        }

        const allVideos = document.querySelectorAll<HTMLVideoElement>(
          'video[src*="oaiusercontent"], video[src*="sora"]',
        );
        for (const video of Array.from(allVideos)) {
          const videoSrc = video.src || video.querySelector("source")?.src;
          if (videoSrc && !seenUrls.has(videoSrc)) {
            seenUrls.add(videoSrc);
            mediaUrls.push({ url: videoSrc, mediaType: "video" });
            this.log(
              "debug",
              `Found CDN video: ${videoSrc.substring(0, 100)}...`,
            );
          }
        }

        // Handle blob URLs - convert to data URLs for download
        const processedUrls: Array<{
          url: string;
          mediaType: "video" | "image";
        }> = [];

        for (const media of mediaUrls) {
          if (media.url.startsWith("blob:")) {
            try {
              // Fetch blob and convert to data URL
              const response = await fetch(media.url);
              const blob = await response.blob();
              const dataUrl = await this.blobToDataUrl(blob);
              processedUrls.push({ url: dataUrl, mediaType: media.mediaType });
              this.log(
                "debug",
                `Converted blob URL to data URL for ${media.mediaType}`,
              );
            } catch (error) {
              this.log("warn", `Failed to convert blob URL: ${error}`);
              // Still include the original URL in case it works
              processedUrls.push(media);
            }
          } else {
            processedUrls.push(media);
          }
        }

        this.log("info", `✅ Extracted ${processedUrls.length} media URLs`, {
          images: processedUrls.filter((m) => m.mediaType === "image").length,
          videos: processedUrls.filter((m) => m.mediaType === "video").length,
        });

        return processedUrls;
      }

      /**
       * Convert a Blob to a data URL
       */
      private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to convert blob to data URL"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      /**
       * Bulk extract ALL visible media from Sora's virtualized flat list
       * Groups media by date headers for organized download
       * Handles the absolute-positioned virtualized grid structure
       */
      private async bulkExtractAllVisibleMedia(): Promise<{
        mediaUrls: Array<{
          url: string;
          mediaType: "video" | "image";
          date?: string;
          alt?: string;
        }>;
        totalCount: number;
        byDate: Record<
          string,
          Array<{ url: string; mediaType: "video" | "image"; alt?: string }>
        >;
      }> {
        this.log(
          "info",
          "📥 Bulk extracting all visible media from Sora library...",
        );

        // Wait for DOM to stabilize
        await this.delay(500);

        const mediaUrls: Array<{
          url: string;
          mediaType: "video" | "image";
          date?: string;
          alt?: string;
        }> = [];
        const byDate: Record<
          string,
          Array<{ url: string; mediaType: "video" | "image"; alt?: string }>
        > = {};
        const seenUrls = new Set<string>();

        // Find the main container that holds all virtualized items
        // This is the large container with relative positioning that holds all tiles
        const containers = document.querySelectorAll<HTMLElement>(
          'div[style*="height"][style*="position: relative"]',
        );

        let mainContainer: HTMLElement | null = null;
        for (const container of Array.from(containers)) {
          // Look for the largest container (likely the virtualized list)
          const height = parseInt(container.style.height);
          if (height > 1000) {
            mainContainer = container;
            this.log(
              "debug",
              `Found virtualized container with height: ${height}px`,
            );
            break;
          }
        }

        if (!mainContainer) {
          this.log(
            "warn",
            "Could not find virtualized container, falling back to standard extraction",
          );
          // Fallback to standard extraction method
          const standardResults = await this.extractGeneratedMediaUrls();
          return {
            mediaUrls: standardResults,
            totalCount: standardResults.length,
            byDate: { "All Media": standardResults },
          };
        }

        // Get all children sorted by their data-index attribute
        const items = Array.from(mainContainer.children).sort((a, b) => {
          const aIndex = parseInt(a.getAttribute("data-index") || "0");
          const bIndex = parseInt(b.getAttribute("data-index") || "0");
          return aIndex - bIndex;
        });

        this.log(
          "debug",
          `Found ${items.length} items in virtualized container`,
        );

        let currentDay = "Unsorted";

        for (const item of items) {
          // Check if this is a date header
          const dateHeader = item.querySelector(".text-token-text-secondary");
          if (dateHeader && dateHeader.textContent) {
            const dateText = dateHeader.textContent.trim();
            // Verify it looks like a date (contains month name or date pattern)
            if (
              dateText.match(
                /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i,
              ) ||
              dateText.match(/\d{1,2}[\/\-]\d{1,2}/)
            ) {
              currentDay = dateText;
              if (!byDate[currentDay]) {
                byDate[currentDay] = [];
              }
              this.log("debug", `Found date header: ${currentDay}`);
              continue;
            }
          }

          // Initialize current day's array if needed
          if (!byDate[currentDay]) {
            byDate[currentDay] = [];
          }

          // Extract images from this item
          const images = item.querySelectorAll<HTMLImageElement>("img");
          for (const img of Array.from(images)) {
            if (img.src && !seenUrls.has(img.src)) {
              // Filter out tiny images (likely icons/thumbnails)
              const width = img.naturalWidth || img.width;
              if (width > 100) {
                seenUrls.add(img.src);
                const mediaItem = {
                  url: img.src,
                  mediaType: "image" as const,
                  date: currentDay,
                  alt: img.alt || undefined,
                };
                mediaUrls.push(mediaItem);
                byDate[currentDay].push({
                  url: img.src,
                  mediaType: "image",
                  alt: img.alt || undefined,
                });
              }
            }
          }

          // Extract videos from this item
          const videos = item.querySelectorAll<HTMLVideoElement>("video");
          for (const video of Array.from(videos)) {
            const videoSrc = video.src || video.querySelector("source")?.src;
            if (videoSrc && !seenUrls.has(videoSrc)) {
              seenUrls.add(videoSrc);
              const mediaItem = {
                url: videoSrc,
                mediaType: "video" as const,
                date: currentDay,
              };
              mediaUrls.push(mediaItem);
              byDate[currentDay].push({ url: videoSrc, mediaType: "video" });
            }
          }
        }

        // Also look for any media with OpenAI CDN URLs that might have been missed
        const cdnImages = document.querySelectorAll<HTMLImageElement>(
          'img[src*="oaiusercontent"], img[src*="sora"], img[src*="openai"]',
        );
        for (const img of Array.from(cdnImages)) {
          if (img.src && !seenUrls.has(img.src)) {
            const width = img.naturalWidth || img.width;
            if (width > 100) {
              seenUrls.add(img.src);
              const mediaItem = {
                url: img.src,
                mediaType: "image" as const,
                date: "CDN Media",
                alt: img.alt || undefined,
              };
              mediaUrls.push(mediaItem);
              if (!byDate["CDN Media"]) {
                byDate["CDN Media"] = [];
              }
              byDate["CDN Media"].push({
                url: img.src,
                mediaType: "image",
                alt: img.alt || undefined,
              });
            }
          }
        }

        const cdnVideos = document.querySelectorAll<HTMLVideoElement>(
          'video[src*="oaiusercontent"], video[src*="sora"], video[src*="openai"]',
        );
        for (const video of Array.from(cdnVideos)) {
          const videoSrc = video.src || video.querySelector("source")?.src;
          if (videoSrc && !seenUrls.has(videoSrc)) {
            seenUrls.add(videoSrc);
            const mediaItem = {
              url: videoSrc,
              mediaType: "video" as const,
              date: "CDN Media",
            };
            mediaUrls.push(mediaItem);
            if (!byDate["CDN Media"]) {
              byDate["CDN Media"] = [];
            }
            byDate["CDN Media"].push({ url: videoSrc, mediaType: "video" });
          }
        }

        // Process blob URLs - convert to data URLs for download compatibility
        const processedUrls: Array<{
          url: string;
          mediaType: "video" | "image";
          date?: string;
          alt?: string;
        }> = [];

        for (const media of mediaUrls) {
          if (media.url.startsWith("blob:")) {
            try {
              const response = await fetch(media.url);
              const blob = await response.blob();
              const dataUrl = await this.blobToDataUrl(blob);
              processedUrls.push({ ...media, url: dataUrl });
              this.log(
                "debug",
                `Converted blob URL to data URL for ${media.mediaType}`,
              );
            } catch (error) {
              this.log("warn", `Failed to convert blob URL: ${error}`);
              processedUrls.push(media);
            }
          } else {
            processedUrls.push(media);
          }
        }

        // Remove empty date categories
        for (const date of Object.keys(byDate)) {
          if (byDate[date].length === 0) {
            delete byDate[date];
          }
        }

        this.log(
          "info",
          `✅ Bulk extracted ${processedUrls.length} media items from ${Object.keys(byDate).length} categories`,
          {
            images: processedUrls.filter((m) => m.mediaType === "image").length,
            videos: processedUrls.filter((m) => m.mediaType === "video").length,
            dates: Object.keys(byDate),
          },
        );

        return {
          mediaUrls: processedUrls,
          totalCount: processedUrls.length,
          byDate,
        };
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
        const generatedTiles = Array.from(
          document.querySelectorAll<HTMLElement>(".group\\/tile"),
        );
        let targetImage: HTMLElement | null = null;

        for (const tile of generatedTiles) {
          // Find the parent container that should have the prompt text
          let parent =
            tile.closest(".flex.flex-col.gap-4") || tile.parentElement;

          // Look for prompt text in nearby elements
          while (parent && parent !== document.body) {
            const promptDiv = parent.querySelector(
              ".truncate.text-token-text-primary",
            );
            if (promptDiv) {
              const promptTextContent =
                promptDiv.textContent?.trim().toLowerCase() || "";
              if (
                promptTextContent.includes(searchText) ||
                searchText.includes(promptTextContent)
              ) {
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
        const textareas = Array.from(
          document.querySelectorAll<HTMLTextAreaElement>("textarea"),
        );
        let targetTextarea: HTMLTextAreaElement | null = null;

        for (const textarea of textareas) {
          // Check if textarea contains the prompt text (exact match or contains)
          const textareaValue = textarea.value.trim();

          if (
            textareaValue === searchText ||
            textareaValue.includes(searchText) ||
            searchText.includes(textareaValue)
          ) {
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
          this.log(
            "info",
            "Textarea not found in current view, searching page...",
          );

          // Scroll to top first
          window.scrollTo({ top: 0, behavior: "smooth" });
          await this.delay(500);

          for (const textarea of textareas) {
            // Scroll to textarea
            textarea.scrollIntoView({ behavior: "smooth", block: "center" });
            await this.delay(300);

            const textareaValue = textarea.value.trim();
            const searchText = promptText.trim();

            if (
              textareaValue === searchText ||
              textareaValue.includes(searchText) ||
              searchText.includes(textareaValue)
            ) {
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
          this.log(
            "warn",
            "⚠️ Could not find textarea with matching prompt text",
          );
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
        const images = Array.from(
          document.querySelectorAll<HTMLImageElement>("img"),
        );
        const videos = Array.from(
          document.querySelectorAll<HTMLVideoElement>("video"),
        );
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
              const container = media.closest(
                "div, article, section",
              ) as HTMLElement;
              if (
                container &&
                !container.hasAttribute("data-sora-highlighted")
              ) {
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
            const container = media.closest(
              "div, article, section",
            ) as HTMLElement;
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

      private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    }

    new SoraAutomation();
  },
});
