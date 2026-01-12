import type {
  GeneratedPrompt,
  PromptConfig,
  QueueInsertOptions,
  QueueState,
} from "../types";

const DEFAULT_CONFIG: PromptConfig = {
  contextPrompt: "",
  apiKey: "",
  batchSize: 10,
  mediaType: "image",
  variationCount: 2,
  autoRun: false,
  useSecretPrompt: true, // Default to enhanced prompts
  autoGenerateOnEmpty: false,
  autoGenerateOnReceived: false,
  minDelayMs: 2000, // 2 seconds minimum
  maxDelayMs: 5000, // 5 seconds maximum
  setupCompleted: false,
  // Auto-download defaults
  autoDownload: false,
  downloadSubfolder: "Sora",
  promptSaveLocation: false,
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
    const result = await chrome.storage.local.get("config");
    return result.config || DEFAULT_CONFIG;
  },

  async setConfig(config: Partial<PromptConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    await chrome.storage.local.set({
      config: { ...currentConfig, ...config },
    });
  },

  async getPrompts(): Promise<GeneratedPrompt[]> {
    const result = await chrome.storage.local.get("prompts");
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

  async updatePrompt(
    id: string,
    updates: Partial<GeneratedPrompt>,
  ): Promise<void> {
    const prompts = await this.getPrompts();
    const updatedPrompts = prompts.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
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
    const result = await chrome.storage.local.get("history");
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

  async deleteCompletedAndFailed(): Promise<number> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter(
      (p) => p.status !== "completed" && p.status !== "failed",
    );
    const deletedCount = prompts.length - filtered.length;
    await chrome.storage.local.set({ prompts: filtered });

    // Recalculate processed count after deletion
    const queueState = await this.getQueueState();
    const newProcessedCount = Math.max(
      0,
      queueState.processedCount - deletedCount,
    );
    await this.setQueueState({
      processedCount: newProcessedCount,
      currentPromptId:
        filtered.length === 0 ? null : queueState.currentPromptId,
    });

    return deletedCount;
  },

  async getQueueState(): Promise<QueueState> {
    const result = await chrome.storage.local.get("queueState");
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
    });
  },

  async insertPromptsAfter(
    afterId: string,
    prompts: GeneratedPrompt[],
  ): Promise<void> {
    const currentPrompts = await this.getPrompts();
    const insertIndex = currentPrompts.findIndex((p) => p.id === afterId) + 1;

    if (insertIndex === 0) {
      throw new Error(`Prompt with ID ${afterId} not found`);
    }

    const updatedPrompts = [
      ...currentPrompts.slice(0, insertIndex),
      ...prompts,
      ...currentPrompts.slice(insertIndex),
    ];

    await this.setPrompts(updatedPrompts);
  },

  async insertPromptsBefore(
    beforeId: string,
    prompts: GeneratedPrompt[],
  ): Promise<void> {
    const currentPrompts = await this.getPrompts();
    const insertIndex = currentPrompts.findIndex((p) => p.id === beforeId);

    if (insertIndex === -1) {
      throw new Error(`Prompt with ID ${beforeId} not found`);
    }

    const updatedPrompts = [
      ...currentPrompts.slice(0, insertIndex),
      ...prompts,
      ...currentPrompts.slice(insertIndex),
    ];

    await this.setPrompts(updatedPrompts);
  },

  async insertPromptsAt(
    index: number,
    prompts: GeneratedPrompt[],
  ): Promise<void> {
    const currentPrompts = await this.getPrompts();

    if (index < 0 || index > currentPrompts.length) {
      throw new Error(
        `Invalid index: ${index} (valid range: 0-${currentPrompts.length})`,
      );
    }

    const updatedPrompts = [
      ...currentPrompts.slice(0, index),
      ...prompts,
      ...currentPrompts.slice(index),
    ];

    await this.setPrompts(updatedPrompts);
  },

  async insertPrompts(
    prompts: GeneratedPrompt[],
    options: QueueInsertOptions,
  ): Promise<void> {
    const enrichedPrompts = prompts.map((p) => ({
      ...p,
      insertedAt: Date.now(),
      insertedAfter:
        options.position === "after" ? options.referenceId : undefined,
      batchLabel: options.batchLabel || p.batchLabel,
    }));

    switch (options.position) {
      case "end":
        await this.addPrompts(enrichedPrompts);
        break;
      case "start":
        const current = await this.getPrompts();
        await this.setPrompts([...enrichedPrompts, ...current]);
        break;
      case "after":
        if (!options.referenceId) {
          throw new Error("referenceId required for 'after' position");
        }
        await this.insertPromptsAfter(options.referenceId, enrichedPrompts);
        break;
      case "before":
        if (!options.referenceId) {
          throw new Error("referenceId required for 'before' position");
        }
        await this.insertPromptsBefore(options.referenceId, enrichedPrompts);
        break;
      default:
        if (typeof options.position === "number") {
          await this.insertPromptsAt(options.position, enrichedPrompts);
        } else {
          throw new Error(`Invalid position: ${options.position}`);
        }
    }
  },

  async updateBatchLabel(
    promptIds: string[],
    batchLabel: string,
  ): Promise<void> {
    const prompts = await this.getPrompts();
    const updatedPrompts = prompts.map((p) =>
      promptIds.includes(p.id) ? { ...p, batchLabel } : p,
    );
    await this.setPrompts(updatedPrompts);
  },

  async updatePromptPriority(
    promptIds: string[],
    priority: "high" | "normal" | "low",
  ): Promise<void> {
    const prompts = await this.getPrompts();
    const updatedPrompts = prompts.map((p) =>
      promptIds.includes(p.id) ? { ...p, priority } : p,
    );
    await this.setPrompts(updatedPrompts);
  },
};
