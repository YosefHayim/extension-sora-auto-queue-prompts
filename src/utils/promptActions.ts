import type { ApiProvider, GeneratedPrompt, PromptEditAction } from "../types";

import { PromptGenerator } from "./promptGenerator";
import { generateUniqueId } from "../lib/utils";
import { storage } from "./storage";

export class PromptActions {
  private apiKey: string;
  private apiProvider?: ApiProvider;

  constructor(apiKey: string, apiProvider?: ApiProvider) {
    this.apiKey = apiKey;
    this.apiProvider = apiProvider;
  }

  async editPrompt(
    promptId: string,
    newText: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Set prompt to editing status to pause queue
      await storage.updatePrompt(promptId, {
        status: "editing",
        originalText: (await storage.getPrompts()).find(
          (p) => p.id === promptId,
        )?.text,
        text: newText,
      });

      // After edit is complete, set back to pending
      await storage.updatePrompt(promptId, { status: "pending" });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to edit prompt",
      };
    }
  }

  async deletePrompt(
    promptId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await storage.deletePrompt(promptId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete prompt",
      };
    }
  }

  async refinePrompt(
    promptId: string,
  ): Promise<{ success: boolean; refined?: string; error?: string }> {
    try {
      const prompts = await storage.getPrompts();
      const prompt = prompts.find((p) => p.id === promptId);

      if (!prompt) {
        return { success: false, error: "Prompt not found" };
      }

      const generator = new PromptGenerator(this.apiKey, this.apiProvider);
      const result = await generator.enhancePrompt(
        prompt.text,
        prompt.mediaType,
      );

      if (result.success) {
        await storage.updatePrompt(promptId, {
          text: result.enhanced,
          originalText: prompt.text,
          enhanced: true,
        });

        return { success: true, refined: result.enhanced };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to refine prompt",
      };
    }
  }

  async duplicatePrompt(
    promptId: string,
    count: number = 1,
  ): Promise<{
    success: boolean;
    duplicates?: GeneratedPrompt[];
    error?: string;
  }> {
    try {
      const prompts = await storage.getPrompts();
      const prompt = prompts.find((p) => p.id === promptId);

      if (!prompt) {
        return { success: false, error: "Prompt not found" };
      }

      const duplicates: GeneratedPrompt[] = [];
      for (let i = 0; i < count; i++) {
        duplicates.push({
          ...prompt,
          id: generateUniqueId(),
          timestamp: Date.now() + i,
          status: "pending",
        });
      }

      await storage.addPrompts(duplicates);

      return { success: true, duplicates };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to duplicate prompt",
      };
    }
  }

  async generateSimilar(
    promptId: string,
    count: number = 3,
  ): Promise<{
    success: boolean;
    similar?: GeneratedPrompt[];
    error?: string;
  }> {
    try {
      const prompts = await storage.getPrompts();
      const prompt = prompts.find((p) => p.id === promptId);

      if (!prompt) {
        return { success: false, error: "Prompt not found" };
      }

      const generator = new PromptGenerator(this.apiKey, this.apiProvider);
      const result = await generator.generateSimilar(
        prompt.text,
        count,
        prompt.mediaType,
      );

      if (result.success) {
        const similarPrompts: GeneratedPrompt[] = result.prompts.map(
          (text: string, index: number) => ({
            id: generateUniqueId(),
            text,
            timestamp: Date.now() + index,
            status: "pending" as const,
            mediaType: prompt.mediaType,
            aspectRatio: prompt.aspectRatio,
            variations: prompt.variations,
            preset: prompt.preset,
          }),
        );

        await storage.addPrompts(similarPrompts);

        return { success: true, similar: similarPrompts };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate similar prompts",
      };
    }
  }

  async executeAction(
    action: PromptEditAction,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    switch (action.type) {
      case "edit":
        if (!action.newText) {
          return {
            success: false,
            error: "New text is required for edit action",
          };
        }
        return await this.editPrompt(action.promptId, action.newText);

      case "delete":
        return await this.deletePrompt(action.promptId);

      case "refine":
        return await this.refinePrompt(action.promptId);

      case "duplicate":
        return await this.duplicatePrompt(action.promptId, action.count || 1);

      case "generate-similar":
        return await this.generateSimilar(action.promptId, action.count || 3);

      default:
        return { success: false, error: "Unknown action type" };
    }
  }
}
