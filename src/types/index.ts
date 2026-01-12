export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
export type PresetType =
  | "cinematic"
  | "documentary"
  | "artistic"
  | "realistic"
  | "animated"
  | "none";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type ApiProvider = "openai" | "anthropic" | "google";

export interface PromptConfig {
  contextPrompt: string;
  apiKey: string;
  apiProvider?: ApiProvider; // Which API provider to use
  batchSize: number; // Custom input allowed
  mediaType: "video" | "image";
  variationCount: 2 | 4;
  autoRun: boolean;
  useSecretPrompt: boolean; // Enhance prompts with hidden optimizations
  autoGenerateOnEmpty: boolean; // Auto-generate when queue is empty
  autoGenerateOnReceived: boolean; // Auto-generate when prompts are received
  minDelayMs: number; // Minimum delay between prompts
  maxDelayMs: number; // Maximum delay between prompts
  setupCompleted: boolean; // First-time setup wizard completed
  telegramBotToken?: string; // Telegram Bot Token for notifications
  telegramChatId?: string; // Telegram Chat ID for notifications
  // Auto-download settings
  autoDownload: boolean; // Enable/disable auto-download of generated media
  downloadSubfolder: string; // Subfolder within Downloads (e.g., "Sora")
  promptSaveLocation: boolean; // If true, prompt user to choose location each time
}

export interface GeneratedPrompt {
  id: string;
  text: string;
  originalText?: string;
  timestamp: number;
  status: "pending" | "processing" | "completed" | "failed" | "editing";
  mediaType: "video" | "image";
  aspectRatio?: AspectRatio;
  variations?: number;
  preset?: PresetType;
  enhanced?: boolean;
  startTime?: number;
  completedTime?: number;
  duration?: number;
  progress?: number;
  imageUrl?: string;
  imageData?: string;
  imageName?: string;
  imageType?: string;
  batchLabel?: string;
  insertedAt?: number;
  insertedAfter?: string;
  priority?: "high" | "normal" | "low";
}

export interface QueueState {
  isRunning: boolean;
  isPaused: boolean;
  currentPromptId: string | null;
  processedCount: number;
  totalCount: number;
  queueStartTime?: number; // When queue started
}

export interface StorageData {
  config: PromptConfig;
  prompts: GeneratedPrompt[];
  history: GeneratedPrompt[];
  queueState: QueueState;
}

export interface PromptGenerationRequest {
  context: string;
  count: number;
  mediaType: "video" | "image";
  useSecretPrompt?: boolean;
}

export interface PromptGenerationResponse {
  prompts: string[];
  success: boolean;
  error?: string;
}

export interface CSVRow {
  prompt: string;
  type?: "video" | "image";
  aspectRatio?: AspectRatio;
  variations?: number;
  preset?: PresetType;
  imageUrl?: string; // Reference image URL
}

export interface PromptEditAction {
  type: "edit" | "delete" | "refine" | "duplicate" | "generate-similar";
  promptId: string;
  newText?: string;
  count?: number; // For duplicate/generate-similar
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

export interface DetectedSettings {
  mediaType: "video" | "image" | null;
  aspectRatio: AspectRatio | null;
  variations: number | null;
  success: boolean;
  error?: string;
}

export interface QueueInsertOptions {
  position: "end" | "after" | "before" | "start" | number;
  referenceId?: string;
  batchLabel?: string;
}

export interface InsertPromptsRequest {
  prompts: GeneratedPrompt[];
  options: QueueInsertOptions;
}
