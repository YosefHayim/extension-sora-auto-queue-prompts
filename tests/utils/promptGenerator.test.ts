import { PromptGenerator } from '~utils/promptGenerator';

global.fetch = jest.fn();

describe('PromptGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateApiKey', () => {
    it('should validate correct API key format', () => {
      const generator = new PromptGenerator('sk-proj-1234567890abcdefghijk');
      expect(generator.validateApiKey()).toBe(true);
    });

    it('should reject invalid API key format', () => {
      const generator = new PromptGenerator('invalid-key');
      expect(generator.validateApiKey()).toBe(false);
    });

    it('should reject short API keys', () => {
      const generator = new PromptGenerator('sk-short');
      expect(generator.validateApiKey()).toBe(false);
    });
  });

  describe('generatePrompts', () => {
    it('should return error when API key is missing', async () => {
      const generator = new PromptGenerator('');
      const result = await generator.generatePrompts({
        context: 'test context',
        count: 10,
        mediaType: 'video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('should generate prompts successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Prompt 1\nPrompt 2\nPrompt 3',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generatePrompts({
        context: 'Generate creative video prompts',
        count: 3,
        mediaType: 'video',
      });

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(['Prompt 1', 'Prompt 2', 'Prompt 3']);
    });

    it('should filter out empty lines', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Prompt 1\n\n\nPrompt 2\n',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generatePrompts({
        context: 'test',
        count: 2,
        mediaType: 'video',
      });

      expect(result.prompts).toEqual(['Prompt 1', 'Prompt 2']);
    });

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          message: 'Invalid API key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      });

      const generator = new PromptGenerator('sk-invalid-key-1234567890abc');
      const result = await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle API error without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('API request failed');
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('string error');

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should use correct API parameters for video generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generatePrompts({
        context: 'underwater scenes',
        count: 50,
        mediaType: 'video',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.model).toBe('gpt-4');
      expect(body.messages[0].content).toContain('video generation');
      expect(body.messages[0].content).toContain('50');
      expect(body.messages[1].content).toBe('underwater scenes');
    });

    it('should use correct API parameters for image generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generatePrompts({
        context: 'portraits',
        count: 25,
        mediaType: 'image',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).toContain('image generation');
      expect(body.messages[0].content).toContain('25');
    });

    it('should use secret prompt when useSecretPrompt is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
        useSecretPrompt: true,
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).toContain('Technical specifications');
      expect(body.messages[0].content).toContain('camera movements');
    });

    it('should not use secret prompt when useSecretPrompt is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generatePrompts({
        context: 'test',
        count: 10,
        mediaType: 'video',
        useSecretPrompt: false,
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).not.toContain('Technical specifications');
    });
  });

  describe('enhancePrompt', () => {
    it('should return error when API key is missing', async () => {
      const generator = new PromptGenerator('');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API key is required');
      expect(result.enhanced).toBe('basic prompt');
    });

    it('should enhance prompt successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Enhanced prompt with cinematic details and lighting',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(true);
      expect(result.enhanced).toBe('Enhanced prompt with cinematic details and lighting');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
      expect(result.enhanced).toBe('basic prompt');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failed'));

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'image');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failed');
      expect(result.enhanced).toBe('basic prompt');
    });

    it('should fallback to original text when response has no content', async () => {
      const mockResponse = {
        choices: [
          {
            message: {},
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(true);
      expect(result.enhanced).toBe('basic prompt');
    });

    it('should handle API error without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API request failed');
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('string error');

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.enhancePrompt('basic prompt', 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should use correct prompt for video enhancement', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Enhanced' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.enhancePrompt('test prompt', 'video');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).toContain('camera movements');
    });

    it('should use correct prompt for image enhancement', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Enhanced' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.enhancePrompt('test prompt', 'image');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).toContain('photography techniques');
    });
  });

  describe('generateSimilar', () => {
    it('should return error when API key is missing', async () => {
      const generator = new PromptGenerator('');
      const result = await generator.generateSimilar('base prompt', 5, 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API key is required');
      expect(result.prompts).toEqual([]);
    });

    it('should generate similar prompts successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Variation 1\nVariation 2\nVariation 3',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base prompt', 3, 'video');

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(['Variation 1', 'Variation 2', 'Variation 3']);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'API error' } }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base prompt', 3, 'image');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
      expect(result.prompts).toEqual([]);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base prompt', 3, 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.prompts).toEqual([]);
    });

    it('should handle API error without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base', 3, 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API request failed');
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('string error');

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base', 3, 'video');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should use correct parameters for video variations', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generateSimilar('base prompt', 5, 'video');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.model).toBe('gpt-4');
      expect(body.messages[0].content).toContain('5 creative variations');
      expect(body.messages[0].content).toContain('video generation');
      expect(body.temperature).toBe(0.9);
    });

    it('should use correct parameters for image variations', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Test' } }] }),
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      await generator.generateSimilar('base prompt', 3, 'image');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.messages[0].content).toContain('image generation');
    });

    it('should filter out empty lines from response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Variation 1\n\n\n\nVariation 2\n',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const generator = new PromptGenerator('sk-test-key-1234567890abcdefg');
      const result = await generator.generateSimilar('base', 2, 'video');

      expect(result.prompts).toEqual(['Variation 1', 'Variation 2']);
    });
  });
});
