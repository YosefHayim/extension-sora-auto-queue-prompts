import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsDialog } from '../../src/components/SettingsDialog';
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

describe('SettingsDialog', () => {
  const mockConfig: PromptConfig = {
    contextPrompt: 'Default context',
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
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SettingsDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should initialize with config values', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Default context')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    const mediaTypeSelect = screen.getByLabelText('Media Type') as HTMLSelectElement;
    expect(mediaTypeSelect.value).toBe('video');
  });

  it('should apply detected settings when provided', async () => {
    const detectedSettings: DetectedSettings = {
      mediaType: 'image',
      aspectRatio: null,
      variations: 4,
      success: true,
    };

    render(
      <SettingsDialog
        config={mockConfig}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        detectedSettings={detectedSettings}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Using detected settings from Sora page')).toBeInTheDocument();
    });
    const mediaTypeSelect = screen.getByLabelText('Media Type') as HTMLSelectElement;
    expect(mediaTypeSelect.value).toBe('image');
    const variationsSelect = screen.getByLabelText('Variations') as HTMLSelectElement;
    expect(variationsSelect.value).toBe('4');
  });

  it('should show detected indicator on media type field', () => {
    const detectedSettings: DetectedSettings = {
      mediaType: 'image',
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(
      <SettingsDialog
        config={mockConfig}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        detectedSettings={detectedSettings}
      />
    );

    expect(screen.getByText('(Detected)')).toBeInTheDocument();
  });

  it('should validate min delay', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const minDelayInput = screen.getByLabelText('Min Delay (seconds)');
    fireEvent.change(minDelayInput, { target: { value: '1' } });
    const form = minDelayInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/Min delay must be between 2-60 seconds/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should validate max delay', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const maxDelayInput = screen.getByLabelText('Max Delay (seconds)');
    fireEvent.change(maxDelayInput, { target: { value: '1' } });
    const form = maxDelayInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/Max delay must be/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should validate batch size', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText('Batch Size');
    fireEvent.change(batchSizeInput, { target: { value: '101' } });
    const form = batchSizeInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/Batch size must be between 1-100/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should call onSave when form is submitted', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText('Save Settings'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should show success message after saving', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText('Save Settings'));

    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('should close dialog after successful save', async () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText('Save Settings'));

    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should update form fields', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const batchSizeInput = screen.getByLabelText('Batch Size');
    fireEvent.change(batchSizeInput, { target: { value: '20' } });
    expect((batchSizeInput as HTMLInputElement).value).toBe('20');
  });

  it('should handle useSecretPrompt checkbox', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Enhanced Prompts/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('should handle autoRun checkbox', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-start Queue/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('should handle autoGenerateOnEmpty checkbox', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-generate on Empty Queue/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('should handle autoGenerateOnReceived checkbox', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const checkbox = screen.getByLabelText(/Auto-generate on Prompt Received/);
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('should display section headers correctly', () => {
    render(<SettingsDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('OpenAI Configuration')).toBeInTheDocument();
    expect(screen.getByText('Sora Generation Settings')).toBeInTheDocument();
    expect(screen.getByText('Queue Processing Settings')).toBeInTheDocument();
  });
});

