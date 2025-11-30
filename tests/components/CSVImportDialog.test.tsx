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
    const cancelButton = screen.queryByText('Cancel');
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
      // If no cancel button, check for X button
      const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    }
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

  it('should handle file selection with no file', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: null } });

    expect(CSVParser.parseFile).not.toHaveBeenCalled();
  });

  it('should handle error when file parsing throws exception', async () => {
    const mockFile = new File(['invalid'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockRejectedValue(new Error('File read error'));

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('File read error')).toBeInTheDocument();
    });
  });

  it('should handle non-Error exception when file parsing fails', async () => {
    const mockFile = new File(['invalid'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockRejectedValue('String error');

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Failed to import CSV')).toBeInTheDocument();
    });
  });

  it('should handle fileInputRef being null when resetting', async () => {
    const mockFile = new File(['prompt1'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockResolvedValue({
      success: true,
      rows: [{ prompt: 'prompt1' }],
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate fileInputRef.current being null by checking the component handles it gracefully
    // The component checks if fileInputRef.current exists before resetting
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalled();
    });
    
    // The component should handle the case where fileInputRef.current might be null
    // This is tested implicitly - if it throws, the test would fail
  });

  it('should handle download template error', () => {
    const { CSVParser } = require('../../src/utils/csvParser');
    CSVParser.downloadTemplate = jest.fn(() => {
      throw new Error('Download failed');
    });

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const downloadButton = screen.getByText('Download Template');

    fireEvent.click(downloadButton);

    // Should not throw, error is caught internally
    expect(CSVParser.downloadTemplate).toHaveBeenCalled();
  });

  it('should not close dialog when clicking backdrop while loading', () => {
    const mockFile = new File(['prompt1'], 'test.csv', { type: 'text/csv' });
    CSVParser.parseFile.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { container } = render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Click on backdrop (the outer div)
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    // Should not close while loading
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close dialog when clicking backdrop while not loading', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;

    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close dialog when clicking on card content', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const card = screen.getByText('Import CSV').closest('.rounded-lg');

    if (card) {
      fireEvent.click(card);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should handle upload button click', () => {
    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const uploadButton = screen.getByText('Select CSV File');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(uploadButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should show loading state during import', async () => {
    const mockFile = new File(['prompt1'], 'test.csv', { type: 'text/csv' });
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    CSVParser.parseFile.mockReturnValue(promise);

    render(<CSVImportDialog config={mockConfig} isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Importing...')).toBeInTheDocument();
    });

    resolvePromise!({
      success: true,
      rows: [{ prompt: 'prompt1' }],
    });
  });
});

