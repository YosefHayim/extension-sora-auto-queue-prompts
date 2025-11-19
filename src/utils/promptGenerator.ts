import type { PromptGenerationRequest, PromptGenerationResponse } from '../types';
import { log } from './logger';

// Secret prompt enhancements optimized for Sora
const SECRET_VIDEO_PROMPT = `Technical specifications: Use cinematic camera movements, dynamic lighting, and professional color grading. Include specific details about camera angles, movement speed, and scene transitions. Ensure temporal consistency and realistic physics. Specify atmosphere, mood, and visual style clearly.`;

const SECRET_IMAGE_PROMPT = `Technical specifications: Use professional photography techniques, optimal composition rules (rule of thirds, golden ratio), dramatic lighting setup, and specific artistic style. Include color palette, depth of field, and mood specification. Ensure photorealistic details and aesthetic appeal.`;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

export class PromptGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch with exponential backoff retry mechanism
   * Handles transient network failures and rate limits (429)
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt: number = 0
  ): Promise<Response> {
    try {
      log.api.request('OpenAI', { attempt: attempt + 1, maxAttempts: MAX_RETRY_ATTEMPTS });

      const response = await fetch(url, options);

      // Rate limit detection
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAYS_MS[attempt] || 4000;

        log.api.error('OpenAI', {
          status: 429,
          message: 'Rate limit exceeded',
          retryAfter: retryAfter || 'not specified',
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
        log.api.error('OpenAI', {
          status: response.status,
          message: 'Retryable error occurred',
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
        log.api.error('OpenAI', {
          error: error instanceof Error ? error.message : 'Network error',
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

  private getSecretPrompt(mediaType: 'video' | 'image'): string {
    return mediaType === 'video' ? SECRET_VIDEO_PROMPT : SECRET_IMAGE_PROMPT;
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

  async enhancePrompt(
    text: string,
    mediaType: 'video' | 'image'
  ): Promise<{ enhanced: string; success: boolean; error?: string }> {
    if (!this.apiKey) {
      return {
        enhanced: text,
        success: false,
        error: 'API key is required',
      };
    }

    try {
      const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert at enhancing prompts for Sora AI ${mediaType} generation. Take the user's basic prompt and enhance it with specific technical details, camera movements (for video), lighting, atmosphere, and visual style. ${this.getSecretPrompt(mediaType)} Return only the enhanced prompt, nothing else.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          enhanced: text,
          success: false,
          error: errorData.error?.message || 'API request failed',
        };
      }

      const data = await response.json();
      const enhanced = data.choices[0]?.message?.content?.trim() || text;

      return {
        enhanced,
        success: true,
      };
    } catch (error) {
      return {
        enhanced: text,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateSimilar(
    basePrompt: string,
    count: number,
    mediaType: 'video' | 'image'
  ): Promise<PromptGenerationResponse> {
    if (!this.apiKey) {
      return {
        prompts: [],
        success: false,
        error: 'API key is required',
      };
    }

    try {
      const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Generate ${count} creative variations of the given prompt for Sora AI ${mediaType} generation. Each variation should maintain the core concept but explore different angles, perspectives, styles, or scenarios. Return only the prompts, one per line.`,
            },
            {
              role: 'user',
              content: basePrompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          prompts: [],
          success: false,
          error: errorData.error?.message || 'API request failed',
        };
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const prompts = content
        .split('\n')
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generatePrompts(
    request: PromptGenerationRequest
  ): Promise<PromptGenerationResponse> {
    if (!this.apiKey) {
      return {
        prompts: [],
        success: false,
        error: 'API key is required',
      };
    }

    try {
      const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(request),
            },
            {
              role: 'user',
              content: request.context,
            },
          ],
          temperature: 0.9,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          prompts: [],
          success: false,
          error: errorData.error?.message || 'API request failed',
        };
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const prompts = content
        .split('\n')
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  validateApiKey(): boolean {
    return this.apiKey.startsWith('sk-') && this.apiKey.length > 20;
  }
}
