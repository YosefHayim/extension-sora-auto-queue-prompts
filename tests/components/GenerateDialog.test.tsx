import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenerateDialog } from '../../src/components/GenerateDialog';
import type { PromptConfig, DetectedSettings } from '../../src/types';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe('GenerateDialog', () => {
  const mockConfig: PromptConfig = {
    contextPrompt: 'Test context',
    apiKey: 'sk-test',
    batchSize: 10,
    mediaType: 'video',
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
  const mockOnGenerate = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <GenerateDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onGenerate={mockOnGenerate} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    expect(screen.getByText('Generate Prompts')).toBeInTheDocument();
  });

  it('should initialize with config values', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const countInput = screen.getByLabelText('Number of Prompts') as HTMLInputElement;
    const contextInput = screen.getByLabelText('Context Prompt') as HTMLTextAreaElement;
    expect(countInput.value).toBe('10');
    expect(contextInput.value).toBe('Test context');
  });

  it('should update count when input changes', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const countInput = screen.getByLabelText('Number of Prompts');
    fireEvent.change(countInput, { target: { value: '20' } });
    expect((countInput as HTMLInputElement).value).toBe('20');
  });

  it('should update context when textarea changes', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const contextInput = screen.getByLabelText('Context Prompt');
    fireEvent.change(contextInput, { target: { value: 'New context' } });
    expect((contextInput as HTMLTextAreaElement).value).toBe('New context');
  });

  it('should show error when context is empty', async () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const contextInput = screen.getByLabelText('Context Prompt');
    fireEvent.change(contextInput, { target: { value: '' } });
    const submitButton = screen.getByText('Generate');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a context prompt')).toBeInTheDocument();
    });
  });

  it('should show error when API key is missing', async () => {
    const configWithoutKey = { ...mockConfig, apiKey: '' };
    render(
      <GenerateDialog config={configWithoutKey} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
    );
    const submitButton = screen.getByText('Generate');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please configure your OpenAI API key/)).toBeInTheDocument();
    });
  });

  it('should call onGenerate when form is submitted', async () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const submitButton = screen.getByText('Generate');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(10, 'Test context');
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display detected settings when provided', () => {
    const detectedSettings: DetectedSettings = {
      mediaType: 'image',
      aspectRatio: '1:1',
      variations: 2,
      success: true,
    };

    render(
      <GenerateDialog
        config={mockConfig}
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        detectedSettings={detectedSettings}
      />
    );

    expect(screen.getByText('Using settings from Sora page:')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('1:1')).toBeInTheDocument();
    expect(screen.getByText('2v')).toBeInTheDocument();
  });

  it('should show loading state during generation', async () => {
    const slowGenerate = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(
      <GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={slowGenerate} />
    );

    const submitButton = screen.getByText('Generate');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  it('should close dialog after successful generation', async () => {
    render(<GenerateDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />);
    const submitButton = screen.getByText('Generate');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});

