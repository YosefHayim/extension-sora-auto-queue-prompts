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
  });
});
