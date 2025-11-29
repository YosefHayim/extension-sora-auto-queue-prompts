import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CSVImportDialog } from '../../src/components/CSVImportDialog';
import type { PromptConfig } from '../../src/types';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

// Mock CSVParser
jest.mock('../../src/utils/csvParser', () => ({
  CSVParser: {
    parseFile: jest.fn(),
  },
}));

describe('CSVImportDialog', () => {
  const mockConfig: PromptConfig = {
    contextPrompt: '',
    apiKey: '',
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
  const mockOnImport = jest.fn().mockResolvedValue(undefined);

  const { CSVParser } = require('../../src/utils/csvParser');

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
      <CSVImportDialog config={mockConfig} isOpen={false} onClose={mockOnClose} onImport={mockOnImport} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    expect(screen.getByText('Import CSV')).toBeInTheDocument();
  });

  it('should call onImport when file is selected and parsed successfully', async () => {
    const mockFile = new File(['prompt1,prompt2'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockResolvedValue({
      success: true,
      rows: [{ prompt: 'prompt1' }, { prompt: 'prompt2' }],
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalled();
    });
  });

  it('should show error when file parsing fails', async () => {
    const mockFile = new File(['invalid'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockResolvedValue({
      success: false,
      error: 'Parse error',
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Parse error')).toBeInTheDocument();
    });
  });

  it('should show success message after successful import', async () => {
    const mockFile = new File(['prompt1'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockResolvedValue({
      success: true,
      rows: [{ prompt: 'prompt1' }],
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Successfully imported/)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close dialog after successful import', async () => {
    const mockFile = new File(['prompt1'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockResolvedValue({
      success: true,
      rows: [{ prompt: 'prompt1' }],
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Successfully imported/)).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

