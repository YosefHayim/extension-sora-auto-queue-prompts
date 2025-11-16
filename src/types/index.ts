export interface PromptConfig {
  contextPrompt: string;
  apiKey: string;
  batchSize: number;
  mediaType: 'video' | 'image';
  variationCount: 2 | 4;
  autoRun: boolean;
}

export interface GeneratedPrompt {
  id: string;
  text: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mediaType: 'video' | 'image';
}

export interface StorageData {
  config: PromptConfig;
  prompts: GeneratedPrompt[];
  history: GeneratedPrompt[];
}

export interface PromptGenerationRequest {
  context: string;
  count: number;
  mediaType: 'video' | 'image';
}

export interface PromptGenerationResponse {
  prompts: string[];
  success: boolean;
  error?: string;
}
