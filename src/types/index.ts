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

// ============================================
// Sora API Response Types (based on HAR analysis)
// ============================================

export type SoraTaskStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface SoraModerationResult {
  type: "passed" | "failed" | "pending";
  results_by_frame_index: Record<string, unknown>;
  code: string | null;
  is_output_rejection: boolean;
  task_id: string;
}

export interface SoraEncoding {
  path: string;
  size: number | null;
  width?: number | null;
  height?: number | null;
  duration_secs?: number | null;
  az_path?: string | null;
  codec?: string | null;
}

export interface SoraEncodings {
  source: SoraEncoding | null;
  source_c2pa: SoraEncoding | null;
  md: SoraEncoding | null;
  ld: SoraEncoding | null;
  thumbnail: {
    path: string;
    size: number | null;
    az_path: string | null;
  } | null;
  link_thumbnail: SoraEncoding | null;
  spritesheet: SoraEncoding | null;
  gif: SoraEncoding | null;
  mp3: SoraEncoding | null;
  source_wm: SoraEncoding | null;
  md_wm: SoraEncoding | null;
  ld_wm: SoraEncoding | null;
  thumbnail_wm: SoraEncoding | null;
  link_thumbnail_wm: SoraEncoding | null;
  spritesheet_wm: SoraEncoding | null;
  gif_wm: SoraEncoding | null;
  endcard_wm: SoraEncoding | null;
}

export interface SoraGeneration {
  id: string;
  task_id: string;
  created_at: string;
  deleted_at: string | null;
  url: string;
  seed: number;
  can_download: boolean;
  download_status: "ready" | "pending" | "failed";
  is_favorite: boolean | null;
  is_liked: boolean | null;
  is_public: boolean;
  is_archived: boolean;
  is_featured: boolean | null;
  featured_countries: string[];
  has_feedback: boolean | null;
  like_count: number;
  num_direct_children: number;
  cloudflare_metadata: unknown | null;
  cf_thumbnail_url: string | null;
  encodings: SoraEncodings;
  width: number;
  height: number;
  n_frames: number;
  prompt: string;
  title: string;
  actions: unknown | null;
  inpaint_items: unknown | null;
  interpolation: unknown | null;
  sdedit: unknown | null;
  operation: string;
  model: string | null;
  preset_id: string | null;
  user: { id: string; username: string };
  moderation_result: SoraModerationResult;
  paragen_status: unknown | null;
  task_type: "image_gen" | "video_gen";
  remix_config: unknown | null;
  quality: "standard" | "high" | null;
}

export interface SoraTaskResponse {
  id: string;
  user: string;
  created_at: string;
  status: SoraTaskStatus;
  progress_pct: number | null;
  progress_pos_in_queue: number | null;
  estimated_queue_wait_time: number | null;
  queue_status_message: string | null;
  priority: number;
  type: "image_gen" | "video_gen";
  prompt: string;
  n_variants: number;
  n_frames: number;
  height: number;
  width: number;
  model: string | null;
  operation: string;
  inpaint_items: unknown[];
  preset_id: string | null;
  caption: string | null;
  actions: unknown | null;
  interpolation: unknown | null;
  sdedit: unknown | null;
  remix_config: unknown | null;
  quality: "standard" | "high" | null;
  size: unknown | null;
  generations: SoraGeneration[];
  num_unsafe_generations: number;
  title: string;
  moderation_result: SoraModerationResult;
  failure_reason: string | null;
  needs_user_review: boolean;
}

export interface SoraPollingResponse {
  task_responses?: SoraTaskResponse[];
  data?: Array<{
    ordering_key: number;
    payload: SoraTaskResponse;
  }>;
  last_id: string;
  has_more: boolean;
}

export interface SoraTaskCreationResponse {
  id: string;
  priority: number | null;
  rate_limit_and_credit_balance: {
    remaining_credits?: number;
    max_credits?: number;
    reset_at?: string;
  } | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// State tracking for active Sora task
export interface SoraActiveTaskState {
  taskId: string;
  status: SoraTaskStatus;
  progress: number;
  startedAt: number;
  lastUpdatedAt: number;
  generations: SoraGeneration[];
  failureReason: string | null;
  isCompleted: boolean;
}
