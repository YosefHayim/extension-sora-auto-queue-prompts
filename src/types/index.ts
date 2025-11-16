export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
export type PresetType = 'cinematic' | 'documentary' | 'artistic' | 'realistic' | 'animated' | 'none';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface PromptConfig {
  contextPrompt: string;
  apiKey: string;
  batchSize: number; // Custom input allowed
  mediaType: 'video' | 'image';
  variationCount: 2 | 4;
  autoRun: boolean;
  useSecretPrompt: boolean; // Enhance prompts with hidden optimizations
  autoGenerateOnEmpty: boolean; // Auto-generate when queue is empty
  autoGenerateOnReceived: boolean; // Auto-generate when prompts are received
  minDelayMs: number; // Minimum delay between prompts
  maxDelayMs: number; // Maximum delay between prompts
  setupCompleted: boolean; // First-time setup wizard completed
}

export interface GeneratedPrompt {
  id: string;
  text: string;
  originalText?: string; // Before enhancement
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'editing';
  mediaType: 'video' | 'image';
  aspectRatio?: AspectRatio;
  variations?: number; // Per-prompt override
  preset?: PresetType;
  enhanced?: boolean; // Was secret prompt applied
}

export interface QueueState {
  isRunning: boolean;
  isPaused: boolean;
  currentPromptId: string | null;
  processedCount: number;
  totalCount: number;
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
  mediaType: 'video' | 'image';
  useSecretPrompt?: boolean;
}

export interface PromptGenerationResponse {
  prompts: string[];
  success: boolean;
  error?: string;
}

export interface CSVRow {
  prompt: string;
  type?: 'video' | 'image';
  aspectRatio?: AspectRatio;
  variations?: number;
  preset?: PresetType;
}

export interface PromptEditAction {
  type: 'edit' | 'delete' | 'refine' | 'duplicate' | 'generate-similar';
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
