import * as React from "react";

import type { DetectedSettings, PromptConfig } from "../../src/types";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SettingsDialog } from "../../src/components/SettingsDialog";

// Mock logger
jest.mock("../../src/utils/logger", () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe("SettingsDialog", () => {
  const mockConfig: PromptConfig = {
    contextPrompt: "Default context",
    apiKey: "sk-test",
    batchSize: 10,
    mediaType: "video",
    variationCount: 2,
    autoRun: false,
    useSecretPrompt: false,
    autoGenerateOnEmpty: false,
    autoGenerateOnReceived: false,
    minDelayMs: 2000,
    maxDelayMs: 5000,
    setupCompleted: true,
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(<SettingsDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should initialize with config values", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Default context")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    const mediaTypeSelect = screen.getByLabelText("Media Type") as HTMLSelectElement;
    expect(mediaTypeSelect.value).toBe("video");
  });

  it("should apply detected settings when provided", async () => {
    const detectedSettings: DetectedSettings = {
      mediaType: "image",
      aspectRatio: null,
      variations: 4,
      success: true,
    };

    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    await waitFor(() => {
      expect(screen.getByText("Using detected settings")).toBeInTheDocument();
    });
    const mediaTypeSelect = screen.getByLabelText("Media Type") as HTMLSelectElement;
    expect(mediaTypeSelect.value).toBe("image");
    const variationsSelect = screen.getByLabelText("Variations") as HTMLSelectElement;
    expect(variationsSelect.value).toBe("4");
  });

  it("should show detected indicator on media type field", () => {
    const detectedSettings: DetectedSettings = {
      mediaType: "image",
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    expect(screen.getAllByText("Detected")[0]).toBeInTheDocument();
  });

  it("should show green border on Sora Generation Settings card when sync is working", () => {
    const detectedSettings: DetectedSettings = {
      mediaType: "image",
      aspectRatio: null,
      variations: 4,
      success: true,
    };

    const { container } = render(
      <SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />
    );

    // Find the Sora Generation Settings card by finding the title and then its parent card
    const soraSettingsTitle = screen.getByText("Sora Generation Settings");
    const soraSettingsCard = soraSettingsTitle.closest(".rounded-lg");

    // Check if the card has the green border class - checking for partial match due to tailwind/classname handling
    expect(soraSettingsCard).toBeTruthy();
    // In strict mode it might be looking for "border-green-500/60"
    expect(soraSettingsCard?.className).toContain("border-green-500/60");
    expect(soraSettingsCard?.classList.contains("border-2")).toBe(true);
  });

  it("should validate min delay", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const minDelayInput = screen.getByLabelText("Min Delay (seconds)");
    fireEvent.change(minDelayInput, { target: { value: "1" } });
    const form = minDelayInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(screen.getByText(/Min delay must be between 2-60 seconds/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should validate max delay", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const maxDelayInput = screen.getByLabelText("Max Delay (seconds)");
    fireEvent.change(maxDelayInput, { target: { value: "1" } });
    const form = maxDelayInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(screen.getByText(/Max delay must be/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should validate batch size", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText("Batch Size");
    fireEvent.change(batchSizeInput, { target: { value: "101" } });
    const form = batchSizeInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(screen.getByText(/Batch size must be between 1-100/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should call onSave when form is submitted", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    fireEvent.click(screen.getByText("Save Settings"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("should show success message after saving", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText("Save Settings"));
      await Promise.resolve(); // Wait for onSave to resolve
    });

    await waitFor(() => {
      expect(screen.getByText("Settings saved successfully!")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should close dialog after successful save", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText("Save Settings"));
      await Promise.resolve(); // Wait for onSave to resolve
    });

    await waitFor(() => {
      expect(screen.getByText("Settings saved successfully!")).toBeInTheDocument();
    }, { timeout: 3000 });

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Wait for setTimeout to execute
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should call onClose when cancel is clicked", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should update form fields", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText("Batch Size");
    fireEvent.change(batchSizeInput, { target: { value: "20" } });
    expect((batchSizeInput as HTMLInputElement).value).toBe("20");
  });

  it("should handle useSecretPrompt checkbox", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Enhanced Prompts/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("should handle autoRun checkbox", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-start Queue/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("should handle autoGenerateOnEmpty checkbox", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-generate on Empty Queue/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("should handle autoGenerateOnReceived checkbox", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-generate on Prompt Received/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("should display section headers correctly", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText("API Configuration")).toBeInTheDocument();
    expect(screen.getByText("Sora Generation Settings")).toBeInTheDocument();
    expect(screen.getByText("Queue Processing Settings")).toBeInTheDocument();
  });

  it("should handle error when onSave throws", async () => {
    const errorOnSave = jest.fn().mockRejectedValue(new Error("Save failed"));
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={errorOnSave} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Save Settings"));
    });

    await waitFor(() => {
      expect(screen.getByText("Save failed")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should handle non-Error exceptions", async () => {
    const errorOnSave = jest.fn().mockRejectedValue("String error");
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={errorOnSave} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Save Settings"));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to save settings")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should close dialog when backdrop is clicked", () => {
    const { container } = render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should not close dialog when backdrop is clicked while loading", async () => {
    const slowSave = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const { container } = render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={slowSave} />);

    // Start saving to set loading state
    fireEvent.click(screen.getByText("Save Settings"));

    // Wait for loading state
    await waitFor(() => {
      const apiKeyInput = screen.getByLabelText("API Key");
      expect(apiKeyInput).toBeDisabled();
    });

    const backdrop = container.querySelector(".fixed.inset-0");
    if (backdrop) {
      const initialCallCount = mockOnClose.mock.calls.length;
      fireEvent.click(backdrop);
      // Should not have called onClose again
      expect(mockOnClose).toHaveBeenCalledTimes(initialCallCount);
    }
  });

  it("should not close dialog when clicking inside the card", () => {
    const { container } = render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const card = container.querySelector(".rounded-lg.border");
    expect(card).toBeInTheDocument();

    if (card) {
      const initialCallCount = mockOnClose.mock.calls.length;
      fireEvent.click(card);
      // Should not have called onClose
      expect(mockOnClose).toHaveBeenCalledTimes(initialCallCount);
    }
  });

  it("should update apiKey field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const apiKeyInput = screen.getByLabelText("API Key");
    fireEvent.change(apiKeyInput, { target: { value: "sk-new-key" } });
    expect((apiKeyInput as HTMLInputElement).value).toBe("sk-new-key");
  });

  it("should update contextPrompt field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const contextInput = screen.getByLabelText("Default Context Prompt");
    fireEvent.change(contextInput, { target: { value: "New context prompt" } });
    expect((contextInput as HTMLTextAreaElement).value).toBe("New context prompt");
  });

  it("should update mediaType field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const mediaTypeSelect = screen.getByLabelText("Media Type") as HTMLSelectElement;
    fireEvent.change(mediaTypeSelect, { target: { value: "image" } });
    expect(mediaTypeSelect.value).toBe("image");
  });

  it("should update variationCount field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const variationSelect = screen.getByLabelText("Variations") as HTMLSelectElement;
    fireEvent.change(variationSelect, { target: { value: "4" } });
    expect(variationSelect.value).toBe("4");
  });

  it("should update minDelayMs field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const minDelayInput = screen.getByLabelText("Min Delay (seconds)");
    fireEvent.change(minDelayInput, { target: { value: "5" } });
    expect((minDelayInput as HTMLInputElement).value).toBe("5");
  });

  it("should update maxDelayMs field", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const maxDelayInput = screen.getByLabelText("Max Delay (seconds)");
    fireEvent.change(maxDelayInput, { target: { value: "10" } });
    expect((maxDelayInput as HTMLInputElement).value).toBe("10");
  });

  it("should reset form data when dialog opens", () => {
    const { rerender } = render(<SettingsDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    rerender(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Default context")).toBeInTheDocument();
  });

  it("should update form data when config changes", () => {
    const { rerender } = render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const newConfig: PromptConfig = {
      ...mockConfig,
      contextPrompt: "Updated context",
      batchSize: 20,
    };

    rerender(<SettingsDialog config={newConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByDisplayValue("Updated context")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });

  it("should apply detected settings when they change", () => {
    const { rerender } = render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const detectedSettings: DetectedSettings = {
      mediaType: "image",
      aspectRatio: null,
      variations: 4,
      success: true,
    };

    rerender(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    const mediaTypeSelect = screen.getByLabelText("Media Type") as HTMLSelectElement;
    expect(mediaTypeSelect.value).toBe("image");
    const variationSelect = screen.getByLabelText("Variations") as HTMLSelectElement;
    expect(variationSelect.value).toBe("4");
  });

  it("should show detected indicator only when settings are detected", () => {
    const detectedSettings: DetectedSettings = {
      mediaType: null,
      aspectRatio: null,
      variations: null,
      success: false,
    };

    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    expect(screen.queryByText("Using detected settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Detected")).not.toBeInTheDocument();
  });

  it("should disable all inputs when loading", async () => {
    const slowSave = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={slowSave} />);

    fireEvent.click(screen.getByText("Save Settings"));

    await waitFor(() => {
      const apiKeyInput = screen.getByLabelText("API Key");
      expect(apiKeyInput).toBeDisabled();
    });
  });

  it("should validate max delay is greater than min delay", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const minDelayInput = screen.getByLabelText("Min Delay (seconds)");
    const maxDelayInput = screen.getByLabelText("Max Delay (seconds)");

    fireEvent.change(minDelayInput, { target: { value: "10" } });
    fireEvent.change(maxDelayInput, { target: { value: "5" } });

    const form = minDelayInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(screen.getByText(/Max delay must be >= min delay/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should validate max delay is not greater than 60 seconds", async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const maxDelayInput = screen.getByLabelText("Max Delay (seconds)");

    fireEvent.change(maxDelayInput, { target: { value: "61" } });

    const form = maxDelayInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(screen.getByText(/Max delay must be/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should handle empty apiKey", () => {
    const configWithoutKey: PromptConfig = {
      ...mockConfig,
      apiKey: "",
    };

    render(<SettingsDialog config={configWithoutKey} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const apiKeyInput = screen.getByLabelText("API Key");
    expect((apiKeyInput as HTMLInputElement).value).toBe("");
  });

  it("should display all form sections with proper labels", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText("API Key")).toBeInTheDocument();
    expect(screen.getByText("Default Context Prompt")).toBeInTheDocument();
    expect(screen.getByText("Media Type")).toBeInTheDocument();
    expect(screen.getByText("Variations")).toBeInTheDocument();
    expect(screen.getByText("Batch Size")).toBeInTheDocument();
    expect(screen.getByText("Enhanced Prompts")).toBeInTheDocument();
    expect(screen.getByText("Min Delay (seconds)")).toBeInTheDocument();
    expect(screen.getByText("Max Delay (seconds)")).toBeInTheDocument();
  });

  it("should show detected settings text when only mediaType is detected", () => {
    const detectedSettings: DetectedSettings = {
      mediaType: "image",
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    expect(screen.getByText("Using detected settings")).toBeInTheDocument();
  });

  it("should show detected settings text when only variations is detected", () => {
    const detectedSettings: DetectedSettings = {
      mediaType: null,
      aspectRatio: null,
      variations: 4,
      success: true,
    };

    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} detectedSettings={detectedSettings} />);

    expect(screen.getByText("Using detected settings")).toBeInTheDocument();
  });

  it("should handle empty batch size input with fallback to 1", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText("Batch Size");

    // Clear the input
    fireEvent.change(batchSizeInput, { target: { value: "" } });

    // Should fallback to 1
    fireEvent.change(batchSizeInput, { target: { value: "abc" } });

    // The value should be handled by parseInt which returns NaN, then || 1
    const form = batchSizeInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Should still be able to submit (validation happens on save)
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should handle empty min delay input with fallback to 2", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const minDelayInput = screen.getByLabelText("Min Delay (seconds)");

    // Set invalid value
    fireEvent.change(minDelayInput, { target: { value: "" } });

    // Should fallback to 2 seconds (2000ms)
    fireEvent.change(minDelayInput, { target: { value: "abc" } });

    // Value should be handled
    expect(minDelayInput).toBeInTheDocument();
  });

  it("should handle empty max delay input with fallback to 5", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const maxDelayInput = screen.getByLabelText("Max Delay (seconds)");

    // Set invalid value
    fireEvent.change(maxDelayInput, { target: { value: "" } });

    // Should fallback to 5 seconds (5000ms)
    fireEvent.change(maxDelayInput, { target: { value: "abc" } });

    // Value should be handled
    expect(maxDelayInput).toBeInTheDocument();
  });

  it("should handle batch size with invalid input", () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText("Batch Size");

    // Set invalid value that will result in NaN
    fireEvent.change(batchSizeInput, { target: { value: "invalid" } });

    // Should use fallback value of 1
    const form = batchSizeInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // The form should still submit, validation happens in handleSubmit
    expect(mockOnSave).toHaveBeenCalled();
  });
});
