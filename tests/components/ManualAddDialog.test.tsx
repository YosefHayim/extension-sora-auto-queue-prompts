import * as React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ManualAddDialog } from "../../src/components/ManualAddDialog";
import type { PromptConfig } from "../../src/types";

// Mock logger
jest.mock("../../src/utils/logger", () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe("ManualAddDialog", () => {
  const mockConfig: PromptConfig = {
    contextPrompt: "",
    apiKey: "",
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
  const mockOnAdd = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(<ManualAddDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    expect(screen.getByText("Add Prompts Manually")).toBeInTheDocument();
  });

  it("should parse prompts by line delimiter", () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "Prompt 1\nPrompt 2\nPrompt 3" } });
    expect(screen.getByText(/3 prompt/)).toBeInTheDocument();
  });

  it("should parse prompts by comma delimiter", () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const commaRadio = screen.getByLabelText(/Comma separated/i);
    fireEvent.click(commaRadio);
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "Prompt 1, Prompt 2, Prompt 3" } });
    expect(screen.getByText(/3 prompt/)).toBeInTheDocument();
  });

  it("should show error when no prompts entered", async () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const submitButton = screen.getByRole("button", { name: /Add.*Prompt/i });

    // Button might be disabled, so we need to enable it or trigger submit differently
    // First, ensure the textarea is empty
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "" } });

    // Try to submit - the button might be disabled, so we'll submit the form directly
    const form = textarea.closest("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      const errorElement = screen.getByText("Please enter at least one prompt");
      expect(errorElement).toBeInTheDocument();
    });
  });

  it("should call onAdd when form is submitted", async () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "Prompt 1\nPrompt 2" } });
    const submitButton = screen.getByRole("button", { name: /Add.*Prompt/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled();
      const calls = mockOnAdd.mock.calls[0][0];
      expect(calls).toHaveLength(2);
      expect(calls[0].text).toBe("Prompt 1");
      expect(calls[1].text).toBe("Prompt 2");
    });
  });

  it("should call onClose when cancel is clicked", () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should close dialog after successful add", async () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "Prompt 1" } });
    const submitButton = screen.getByRole("button", { name: /Add.*Prompt/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should filter empty lines", () => {
    render(<ManualAddDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    const textarea = screen.getByLabelText("Prompts");
    fireEvent.change(textarea, { target: { value: "Prompt 1\n\nPrompt 2\n  \nPrompt 3" } });
    expect(screen.getByText(/3 prompt/)).toBeInTheDocument();
  });
});
