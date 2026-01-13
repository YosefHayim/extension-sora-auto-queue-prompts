import { storage } from "~utils/storage";

describe("Storage Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConfig", () => {
    it("should return default config when no config exists", async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const config = await storage.getConfig();

      expect(config).toEqual({
        contextPrompt: "",
        apiKey: "",
        batchSize: 10,
        mediaType: "image",
        variationCount: 2,
        autoRun: false,
        useSecretPrompt: true,
        autoGenerateOnEmpty: false,
        autoGenerateOnReceived: false,
        minDelayMs: 2000,
        maxDelayMs: 5000,
        setupCompleted: false,
        autoDownload: false,
        downloadSubfolder: "Sora",
        promptSaveLocation: false,
        defaultPreset: "none",
      });
    });

    it("should return stored config when it exists", async () => {
      const mockConfig = {
        contextPrompt: "test prompt",
        apiKey: "sk-test",
        batchSize: 100,
        mediaType: "image" as const,
        variationCount: 2 as const,
        autoRun: true,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        config: mockConfig,
      });

      const config = await storage.getConfig();

      expect(config).toEqual(mockConfig);
    });
  });

  describe("setConfig", () => {
    it("should merge partial config with existing config", async () => {
      const existingConfig = {
        contextPrompt: "existing",
        apiKey: "sk-existing",
        batchSize: 50,
        mediaType: "video" as const,
        variationCount: 4 as const,
        autoRun: false,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        config: existingConfig,
      });

      await storage.setConfig({ apiKey: "sk-new" });

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        config: {
          ...existingConfig,
          apiKey: "sk-new",
        },
      });
    });
  });

  describe("getPrompts", () => {
    it("should return empty array when no prompts exist", async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const prompts = await storage.getPrompts();

      expect(prompts).toEqual([]);
    });

    it("should return stored prompts", async () => {
      const mockPrompts = [
        {
          id: "1",
          text: "test prompt",
          timestamp: 123456,
          status: "pending" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        prompts: mockPrompts,
      });

      const prompts = await storage.getPrompts();

      expect(prompts).toEqual(mockPrompts);
    });
  });

  describe("addPrompts", () => {
    it("should add new prompts to existing prompts", async () => {
      const existingPrompts = [
        {
          id: "1",
          text: "existing",
          timestamp: 123,
          status: "pending" as const,
          mediaType: "video" as const,
        },
      ];

      const newPrompts = [
        {
          id: "2",
          text: "new",
          timestamp: 456,
          status: "pending" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        prompts: existingPrompts,
      });

      await storage.addPrompts(newPrompts);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: [...existingPrompts, ...newPrompts],
      });
    });
  });

  describe("updatePrompt", () => {
    it("should update specific prompt by id", async () => {
      const prompts = [
        {
          id: "1",
          text: "prompt 1",
          timestamp: 123,
          status: "pending" as const,
          mediaType: "video" as const,
        },
        {
          id: "2",
          text: "prompt 2",
          timestamp: 456,
          status: "pending" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ prompts });

      await storage.updatePrompt("2", { status: "completed" });

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: [prompts[0], { ...prompts[1], status: "completed" }],
      });
    });
  });

  describe("clearPrompts", () => {
    it("should clear all prompts", async () => {
      await storage.clearPrompts();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ prompts: [] });
    });
  });

  describe("deletePrompt", () => {
    it("should delete prompt by id", async () => {
      const prompts = [
        {
          id: "1",
          text: "prompt 1",
          timestamp: 123,
          status: "pending" as const,
          mediaType: "video" as const,
        },
        {
          id: "2",
          text: "prompt 2",
          timestamp: 456,
          status: "pending" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ prompts });

      await storage.deletePrompt("1");

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: [prompts[1]],
      });
    });
  });

  describe("getHistory", () => {
    it("should return empty array when no history exists", async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const history = await storage.getHistory();

      expect(history).toEqual([]);
    });

    it("should return stored history", async () => {
      const mockHistory = [
        {
          id: "1",
          text: "completed prompt",
          timestamp: 123456,
          status: "completed" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        history: mockHistory,
      });

      const history = await storage.getHistory();

      expect(history).toEqual(mockHistory);
    });
  });

  describe("addToHistory", () => {
    it("should add prompts to history", async () => {
      const existingHistory = [
        {
          id: "1",
          text: "old",
          timestamp: 123,
          status: "completed" as const,
          mediaType: "video" as const,
        },
      ];

      const newPrompts = [
        {
          id: "2",
          text: "new",
          timestamp: 456,
          status: "completed" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        history: existingHistory,
      });

      await storage.addToHistory(newPrompts);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        history: [...newPrompts, ...existingHistory],
      });
    });

    it("should limit history to 1000 items", async () => {
      const existingHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        text: `prompt ${i}`,
        timestamp: i,
        status: "completed" as const,
        mediaType: "video" as const,
      }));

      const newPrompts = [
        {
          id: "1000",
          text: "new",
          timestamp: 1000,
          status: "completed" as const,
          mediaType: "video" as const,
        },
      ];

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        history: existingHistory,
      });

      await storage.addToHistory(newPrompts);

      const savedHistory = (chrome.storage.local.set as jest.Mock).mock
        .calls[0][0].history;
      expect(savedHistory).toHaveLength(1000);
      expect(savedHistory[0]).toEqual(newPrompts[0]);
    });
  });

  describe("getQueueState", () => {
    it("should return default queue state when none exists", async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const state = await storage.getQueueState();

      expect(state).toEqual({
        isRunning: false,
        isPaused: false,
        currentPromptId: null,
        processedCount: 0,
        totalCount: 0,
      });
    });

    it("should return stored queue state", async () => {
      const mockState = {
        isRunning: true,
        isPaused: false,
        currentPromptId: "prompt-123",
        processedCount: 5,
        totalCount: 10,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        queueState: mockState,
      });

      const state = await storage.getQueueState();

      expect(state).toEqual(mockState);
    });
  });

  describe("setQueueState", () => {
    it("should merge partial queue state with existing state", async () => {
      const existingState = {
        isRunning: true,
        isPaused: false,
        currentPromptId: "prompt-123",
        processedCount: 5,
        totalCount: 10,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        queueState: existingState,
      });

      await storage.setQueueState({ processedCount: 6 });

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        queueState: {
          ...existingState,
          processedCount: 6,
        },
      });
    });
  });

  describe("pauseQueue", () => {
    it("should set isPaused to true", async () => {
      const existingState = {
        isRunning: true,
        isPaused: false,
        currentPromptId: "prompt-123",
        processedCount: 5,
        totalCount: 10,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        queueState: existingState,
      });

      await storage.pauseQueue();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        queueState: {
          ...existingState,
          isPaused: true,
        },
      });
    });
  });

  describe("resumeQueue", () => {
    it("should set isPaused to false", async () => {
      const existingState = {
        isRunning: true,
        isPaused: true,
        currentPromptId: "prompt-123",
        processedCount: 5,
        totalCount: 10,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        queueState: existingState,
      });

      await storage.resumeQueue();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        queueState: {
          ...existingState,
          isPaused: false,
        },
      });
    });
  });

  describe("stopQueue", () => {
    it("should reset queue state", async () => {
      const existingState = {
        isRunning: true,
        isPaused: false,
        currentPromptId: "prompt-123",
        processedCount: 5,
        totalCount: 10,
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({
        queueState: existingState,
      });

      await storage.stopQueue();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        queueState: {
          ...existingState,
          isRunning: false,
          isPaused: false,
          currentPromptId: null,
          // Keep processedCount to show progress (not reset)
        },
      });
    });
  });
});
