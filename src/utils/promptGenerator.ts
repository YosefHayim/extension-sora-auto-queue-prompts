import type { PromptGenerationRequest, PromptGenerationResponse } from '~types';

export class PromptGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a creative prompt generator for Sora AI ${request.mediaType} generation. Generate ${request.count} unique, detailed prompts based on the user's context. Each prompt should be specific, vivid, and optimized for ${request.mediaType} generation. Return only the prompts, one per line, without numbering or additional formatting.`,
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
