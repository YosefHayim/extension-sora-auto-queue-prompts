import type { PromptConfig, GeneratedPrompt, StorageData } from '~types';

const DEFAULT_CONFIG: PromptConfig = {
  contextPrompt: '',
  apiKey: '',
  batchSize: 50,
  mediaType: 'video',
  variationCount: 4,
  autoRun: false,
};

export const storage = {
  async getConfig(): Promise<PromptConfig> {
    const result = await chrome.storage.local.get('config');
    return result.config || DEFAULT_CONFIG;
  },

  async setConfig(config: Partial<PromptConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    await chrome.storage.local.set({
      config: { ...currentConfig, ...config },
    });
  },

  async getPrompts(): Promise<GeneratedPrompt[]> {
    const result = await chrome.storage.local.get('prompts');
    return result.prompts || [];
  },

  async addPrompts(prompts: GeneratedPrompt[]): Promise<void> {
    const currentPrompts = await this.getPrompts();
    await chrome.storage.local.set({
      prompts: [...currentPrompts, ...prompts],
    });
  },

  async updatePrompt(id: string, updates: Partial<GeneratedPrompt>): Promise<void> {
    const prompts = await this.getPrompts();
    const updatedPrompts = prompts.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    await chrome.storage.local.set({ prompts: updatedPrompts });
  },

  async clearPrompts(): Promise<void> {
    await chrome.storage.local.set({ prompts: [] });
  },

  async getHistory(): Promise<GeneratedPrompt[]> {
    const result = await chrome.storage.local.get('history');
    return result.history || [];
  },

  async addToHistory(prompts: GeneratedPrompt[]): Promise<void> {
    const currentHistory = await this.getHistory();
    await chrome.storage.local.set({
      history: [...prompts, ...currentHistory].slice(0, 1000), // Keep last 1000
    });
  },
};
