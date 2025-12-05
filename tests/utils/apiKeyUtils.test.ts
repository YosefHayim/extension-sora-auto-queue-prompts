import { recognizeApiProvider, verifyApiKey } from "../../src/utils/apiKeyUtils";
import type { ApiProvider } from "../../src/types";

// Mock fetch globally
global.fetch = jest.fn();

describe("apiKeyUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("recognizeApiProvider", () => {
    it("should return null for empty string", () => {
      expect(recognizeApiProvider("")).toBeNull();
    });

    it("should return null for whitespace-only string", () => {
      expect(recognizeApiProvider("   ")).toBeNull();
    });

    it("should return null for null or undefined", () => {
      expect(recognizeApiProvider(null as unknown as string)).toBeNull();
      expect(recognizeApiProvider(undefined as unknown as string)).toBeNull();
    });

    it("should recognize OpenAI API key", () => {
      expect(recognizeApiProvider("sk-12345678901234567890123456789012345678901234567890")).toBe("openai");
    });

    it("should recognize OpenAI API key with minimum length", () => {
      expect(recognizeApiProvider("sk-12345678901234567890")).toBe("openai");
    });

    it("should not recognize OpenAI key that is too short", () => {
      expect(recognizeApiProvider("sk-123")).toBeNull();
    });

    it("should recognize Anthropic API key", () => {
      expect(recognizeApiProvider("sk-ant-12345678901234567890123456789012345678901234567890")).toBe("anthropic");
    });

    it("should recognize Anthropic API key with minimum length", () => {
      expect(recognizeApiProvider("sk-ant-12345678901234567890")).toBe("anthropic");
    });

    it("should not recognize Anthropic key that is too short", () => {
      expect(recognizeApiProvider("sk-ant-123")).toBeNull();
    });

    it("should recognize Google API key", () => {
      expect(recognizeApiProvider("AIza12345678901234567890123456789012345")).toBe("google");
    });

    it("should recognize Google API key with minimum length", () => {
      expect(recognizeApiProvider("AIza123456789012345678901234567890123")).toBe("google");
    });

    it("should not recognize Google key that is too short", () => {
      expect(recognizeApiProvider("AIza123")).toBeNull();
    });

    it("should return null for unrecognized key pattern", () => {
      expect(recognizeApiProvider("unknown-key-pattern-12345")).toBeNull();
    });

    it("should trim whitespace from API key", () => {
      expect(recognizeApiProvider("  sk-12345678901234567890123456789012345678901234567890  ")).toBe("openai");
    });
  });

  describe("verifyApiKey", () => {
    it("should return invalid for empty API key", async () => {
      const result = await verifyApiKey("", "openai");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("API key is empty");
    });

    it("should return invalid for whitespace-only API key", async () => {
      const result = await verifyApiKey("   ", "openai");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("API key is empty");
    });

    it("should return invalid for unknown provider", async () => {
      const result = await verifyApiKey("test-key", "unknown" as ApiProvider);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Unknown API provider");
    });

    describe("OpenAI verification", () => {
      it("should return valid for successful OpenAI verification", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await verifyApiKey("sk-test-key", "openai");
        expect(result.valid).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: "Bearer sk-test-key",
            "Content-Type": "application/json",
          },
        });
      });

      it("should return invalid for 401 status (invalid key)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

        const result = await verifyApiKey("sk-invalid-key", "openai");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid API key");
      });

      it("should return invalid for 429 status (rate limit)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

        const result = await verifyApiKey("sk-test-key", "openai");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Rate limit exceeded. Please try again later.");
      });

      it("should return invalid for other error statuses", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: { message: "Internal server error" } }),
        });

        const result = await verifyApiKey("sk-test-key", "openai");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Internal server error");
      });

      it("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        const result = await verifyApiKey("sk-test-key", "openai");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Network error");
      });
    });

    describe("Anthropic verification", () => {
      it("should return valid for successful Anthropic verification", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await verifyApiKey("sk-ant-test-key", "anthropic");
        expect(result.valid).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": "sk-ant-test-key",
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
      });

      it("should return invalid for 401 status (invalid key)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

        const result = await verifyApiKey("sk-ant-invalid-key", "anthropic");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid API key");
      });

      it("should return invalid for 403 status (permissions)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        const result = await verifyApiKey("sk-ant-test-key", "anthropic");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("API key does not have required permissions");
      });

      it("should return invalid for 429 status (rate limit)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

        const result = await verifyApiKey("sk-ant-test-key", "anthropic");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Rate limit exceeded. Please try again later.");
      });

      it("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        const result = await verifyApiKey("sk-ant-test-key", "anthropic");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Network error");
      });
    });

    describe("Google verification", () => {
      it("should return valid for successful Google verification", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith("https://generativelanguage.googleapis.com/v1/models?key=AIza-test-key", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      });

      it("should return invalid for 400 status with API key error", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: { message: "API key is invalid" } }),
        });

        const result = await verifyApiKey("AIza-invalid-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid API key");
      });

      it("should return invalid for 400 status with other error", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: { message: "Bad request" } }),
        });

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Bad request");
      });

      it("should return invalid for 403 status (permissions)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("API key does not have required permissions");
      });

      it("should return invalid for 429 status (rate limit)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Rate limit exceeded. Please try again later.");
      });

      it("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Network error");
      });

      it("should handle JSON parse errors gracefully", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => {
            throw new Error("Invalid JSON");
          },
        });

        const result = await verifyApiKey("AIza-test-key", "google");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("API request failed with status 500");
      });
    });
  });
});
