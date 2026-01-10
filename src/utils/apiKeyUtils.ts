import type { ApiProvider } from "../types";
import { log } from "./logger";

/**
 * Recognizes API provider based on API key pattern
 */
export function recognizeApiProvider(apiKey: string): ApiProvider | null {
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  const trimmedKey = apiKey.trim();

  // Anthropic: starts with "sk-ant-" and typically 50+ characters
  // Check this before OpenAI since "sk-ant-" also starts with "sk-"
  if (trimmedKey.startsWith("sk-ant-") && trimmedKey.length >= 20) {
    return "anthropic";
  }

  // OpenAI: starts with "sk-" and typically 51+ characters
  if (trimmedKey.startsWith("sk-") && trimmedKey.length >= 20) {
    return "openai";
  }

  // Google Gemini: typically starts with "AIza" or is a long alphanumeric string
  // Google API keys are usually 39 characters and start with "AIza"
  if (trimmedKey.startsWith("AIza") && trimmedKey.length >= 35) {
    return "google";
  }

  // Additional patterns for Google (some keys might not start with AIza)
  // But we'll be conservative and only match the most common pattern
  return null;
}

/**
 * Verifies an API key by making a simple request to the provider's API
 */
export async function verifyApiKey(
  apiKey: string,
  provider: ApiProvider,
): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: "API key is empty" };
  }

  try {
    switch (provider) {
      case "openai":
        return await verifyOpenAIKey(apiKey);
      case "anthropic":
        return await verifyAnthropicKey(apiKey);
      case "google":
        return await verifyGoogleKey(apiKey);
      default:
        return { valid: false, error: "Unknown API provider" };
    }
  } catch (error) {
    log.api.error("verifyApiKey", {
      provider,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Verifies OpenAI API key by listing models
 * Endpoint: GET https://api.openai.com/v1/models
 */
async function verifyOpenAIKey(
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      return { valid: false, error: "Invalid API key" };
    }

    if (response.status === 429) {
      return {
        valid: false,
        error: "Rate limit exceeded. Please try again later.",
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        error:
          errorData.error?.message ||
          `API request failed with status ${response.status}`,
      };
    }

    // If we get here, the key is valid
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

/**
 * Verifies Anthropic API key by making a simple message request
 * Endpoint: POST https://api.anthropic.com/v1/messages
 * We use a minimal request to verify the key
 */
async function verifyAnthropicKey(
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Anthropic doesn't have a simple "list models" endpoint
    // We'll make a minimal message request to verify the key
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1,
        messages: [
          {
            role: "user",
            content: "Hi",
          },
        ],
      }),
    });

    if (response.status === 401) {
      return { valid: false, error: "Invalid API key" };
    }

    if (response.status === 403) {
      return {
        valid: false,
        error: "API key does not have required permissions",
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        error: "Rate limit exceeded. Please try again later.",
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        error:
          errorData.error?.message ||
          `API request failed with status ${response.status}`,
      };
    }

    // If we get here, the key is valid
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

/**
 * Verifies Google Gemini API key by listing models
 * Endpoint: GET https://generativelanguage.googleapis.com/v1/models?key={API_KEY}
 */
async function verifyGoogleKey(
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.message?.includes("API key")) {
        return { valid: false, error: "Invalid API key" };
      }
      return {
        valid: false,
        error: errorData.error?.message || "Invalid API key or request",
      };
    }

    if (response.status === 403) {
      return {
        valid: false,
        error: "API key does not have required permissions",
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        error: "Rate limit exceeded. Please try again later.",
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        error:
          errorData.error?.message ||
          `API request failed with status ${response.status}`,
      };
    }

    // If we get here, the key is valid
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}
