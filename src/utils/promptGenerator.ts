import type { ApiProvider, PromptGenerationRequest, PromptGenerationResponse } from "../types";

import { log } from "./logger";
import { recognizeApiProvider } from "./apiKeyUtils";

// Secret prompt enhancements optimized for Sora
const SECRET_VIDEO_PROMPT = `Technical specifications: Use cinematic camera movements, dynamic lighting, and professional color grading. Include specific details about camera angles, movement speed, and scene transitions. Ensure temporal consistency and realistic physics. Specify atmosphere, mood, and visual style clearly.`;

const SECRET_IMAGE_PROMPT = `Technical specifications: Use professional photography techniques, optimal composition rules (rule of thirds, golden ratio), dramatic lighting setup, and specific artistic style. Include color palette, depth of field, and mood specification. Ensure photorealistic details and aesthetic appeal.`;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

export class PromptGenerator {
  private apiKey: string;
  private apiProvider: ApiProvider;

  constructor(apiKey: string, apiProvider?: ApiProvider) {
    this.apiKey = apiKey;
    // Auto-detect provider if not provided
    this.apiProvider = apiProvider || recognizeApiProvider(apiKey) || "openai";
  }

  /**
   * Fetch with exponential backoff retry mechanism
   * Handles transient network failures and rate limits (429)
   */
  private async fetchWithRetry(url: string, options: RequestInit, attempt: number = 0): Promise<Response> {
    try {
      log.api.request(this.apiProvider, { attempt: attempt + 1, maxAttempts: MAX_RETRY_ATTEMPTS });

      const response = await fetch(url, options);

      // Rate limit detection
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAYS_MS[attempt] || 4000;

        log.api.error(this.apiProvider, {
          status: 429,
          message: "Rate limit exceeded",
          retryAfter: retryAfter || "not specified",
          waitMs,
          attempt: attempt + 1,
        });

        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await this.delay(waitMs);
          return this.fetchWithRetry(url, options, attempt + 1);
        }

        throw new Error(`Rate limit exceeded. Please try again later.`);
      }

      // Success or non-retryable error
      if (response.ok || !this.isRetryableStatus(response.status)) {
        return response;
      }

      // Retryable error (5xx server errors, network issues)
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        const delay = RETRY_DELAYS_MS[attempt];
        log.api.error(this.apiProvider, {
          status: response.status,
          message: "Retryable error occurred",
          delay,
          attempt: attempt + 1,
        });

        await this.delay(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      // Final attempt failed
      return response;
    } catch (error) {
      // Network errors (connection failed, timeout, etc.)
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        const delay = RETRY_DELAYS_MS[attempt];
        log.api.error(this.apiProvider, {
          error: error instanceof Error ? error.message : "Network error",
          delay,
          attempt: attempt + 1,
        });

        await this.delay(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if HTTP status code is retryable
   */
  private isRetryableStatus(status: number): boolean {
    // Retry on server errors (5xx) and specific client errors
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getSecretPrompt(mediaType: "video" | "image"): string {
    return mediaType === "video" ? SECRET_VIDEO_PROMPT : SECRET_IMAGE_PROMPT;
  }

  private buildSystemPrompt(request: PromptGenerationRequest): string {
    let basePrompt = `You are an expert prompt engineer for Sora AI ${request.mediaType} generation. Generate ${request.count} unique, highly detailed, and optimized prompts based on the user's context.`;

    if (request.useSecretPrompt) {
      basePrompt += `\n\n${this.getSecretPrompt(request.mediaType)}`;
      basePrompt += `\n\nApply these technical specifications to EVERY prompt you generate. Make each prompt vivid, specific, and production-ready.`;
    } else {
      basePrompt += ` Each prompt should be specific, vivid, and optimized for ${request.mediaType} generation.`;
    }

    basePrompt += `\n\nReturn only the prompts, one per line, without numbering or additional formatting.`;

    return basePrompt;
  }

  async enhancePrompt(text: string, mediaType: "video" | "image"): Promise<{ enhanced: string; success: boolean; error?: string }> {
    if (!this.apiKey) {
      return {
        enhanced: text,
        success: false,
        error: "API key is required",
      };
    }

    try {
      const systemPrompt = `You are an expert at enhancing prompts for Sora AI ${mediaType} generation. Take the user's basic prompt and enhance it with specific technical details, camera movements (for video), lighting, atmosphere, and visual style. ${this.getSecretPrompt(mediaType)} Return only the enhanced prompt, nothing else.`;

      const response = await this.makeApiRequest(systemPrompt, text, {
        temperature: 0.7,
        max_tokens: 500,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          enhanced: text,
          success: false,
          error: errorData.error?.message || "API request failed",
        };
      }

      const data = await response.json();
      const enhanced = this.extractContent(data).trim() || text;

      return {
        enhanced,
        success: true,
      };
    } catch (error) {
      return {
        enhanced: text,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generateSimilar(basePrompt: string, count: number, mediaType: "video" | "image"): Promise<PromptGenerationResponse> {
    if (!this.apiKey) {
      return {
        prompts: [],
        success: false,
        error: "API key is required",
      };
    }

    try {
      const systemPrompt = `Generate ${count} creative variations of the given prompt for Sora AI ${mediaType} generation. Each variation should maintain the core concept but explore different angles, perspectives, styles, or scenarios. Return only the prompts, one per line.`;

      const response = await this.makeApiRequest(systemPrompt, basePrompt, {
        temperature: 0.9,
        max_tokens: 2000,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          prompts: [],
          success: false,
          error: errorData.error?.message || "API request failed",
        };
      }

      const data = await response.json();
      const content = this.extractContent(data);
      const prompts = content
        .split("\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      return {
        prompts,
        success: true,
      };
    } catch (error) {
      return {
        prompts: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generatePrompts(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    if (!this.apiKey) {
      return {
        prompts: [],
        success: false,
        error: "API key is required",
      };
    }

    try {
      const response = await this.makeApiRequest(this.buildSystemPrompt(request), request.context, {
        temperature: 0.9,
        max_tokens: 2000,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          prompts: [],
          success: false,
          error: errorData.error?.message || "API request failed",
        };
      }

      const data = await response.json();
      const content = this.extractContent(data);
      const prompts = content
        .split("\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      return {
        prompts,
        success: true,
      };
    } catch (error) {
      return {
        prompts: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Makes an API request to the configured provider
   */
  private async makeApiRequest(systemPrompt: string, userPrompt: string, options: { temperature?: number; max_tokens?: number }): Promise<Response> {
    switch (this.apiProvider) {
      case "openai":
        return this.fetchWithRetry("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: options.temperature ?? 0.9,
            max_tokens: options.max_tokens ?? 2000,
          }),
        });

      case "anthropic":
        return this.fetchWithRetry("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: options.max_tokens ?? 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            temperature: options.temperature ?? 0.9,
          }),
        });

      case "google":
        return this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: options.temperature ?? 0.9,
              maxOutputTokens: options.max_tokens ?? 2000,
            },
          }),
        });

      default:
        throw new Error(`Unsupported API provider: ${this.apiProvider}`);
    }
  }

  /**
   * Extracts content from API response based on provider
   */
  private extractContent(data: any): string {
    switch (this.apiProvider) {
      case "openai":
        return data.choices[0]?.message?.content || "";
      case "anthropic":
        return data.content?.[0]?.text || "";
      case "google":
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      default:
        return "";
    }
  }

  validateApiKey(): boolean {
    if (!this.apiKey) return false;
    // Basic validation - more specific validation is done in apiKeyUtils
    return this.apiKey.length > 10;
  }
}
