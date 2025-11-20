import type { PromptConfig, GeneratedPrompt, QueueState } from '../types';

const DEFAULT_CONFIG: PromptConfig = {
  contextPrompt: '',
  apiKey: '',
  batchSize: 50,
  mediaType: 'video',
  variationCount: 4,
  autoRun: false,
  useSecretPrompt: true, // Default to enhanced prompts
  autoGenerateOnEmpty: false,
  autoGenerateOnReceived: false,
  minDelayMs: 2000, // 2 seconds minimum
  maxDelayMs: 5000, // 5 seconds maximum
  setupCompleted: false,
};

const DEFAULT_QUEUE_STATE: QueueState = {
  isRunning: false,
  isPaused: false,
  currentPromptId: null,
  processedCount: 0,
  totalCount: 0,
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

  async setPrompts(prompts: GeneratedPrompt[]): Promise<void> {
    await chrome.storage.local.set({ prompts });
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
    // Reset queue state when clearing all prompts
    await this.setQueueState({
      processedCount: 0,
      currentPromptId: null,
    });
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

  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter((p) => p.id !== id);
    await chrome.storage.local.set({ prompts: filtered });

    // Reset queue state if all prompts are now deleted
    if (filtered.length === 0) {
      await this.setQueueState({
        processedCount: 0,
        currentPromptId: null,
      });
    }
  },

  async getQueueState(): Promise<QueueState> {
    const result = await chrome.storage.local.get('queueState');
    return result.queueState || DEFAULT_QUEUE_STATE;
  },

  async setQueueState(state: Partial<QueueState>): Promise<void> {
    const currentState = await this.getQueueState();
    await chrome.storage.local.set({
      queueState: { ...currentState, ...state },
    });
  },

  async pauseQueue(): Promise<void> {
    await this.setQueueState({ isPaused: true });
  },

  async resumeQueue(): Promise<void> {
    await this.setQueueState({ isPaused: false });
  },

  async stopQueue(): Promise<void> {
    await this.setQueueState({
      isRunning: false,
      isPaused: false,
      currentPromptId: null,
      processedCount: 0, // Reset counter when stopping queue
    });
  },
};
