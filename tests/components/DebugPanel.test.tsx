import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DebugPanel } from '../../src/components/DebugPanel';
import type { LogEntry } from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    ui: {
      error: jest.fn(),
    },
  },
}));

describe('DebugPanel', () => {
  const mockLogs: LogEntry[] = [
    {
      timestamp: Date.now() - 1000,
      level: 'info',
      category: 'test',
      message: 'Test log message',
    },
    {
      timestamp: Date.now() - 2000,
      level: 'error',
      category: 'test',
      message: 'Error log message',
      data: { error: 'test error' },
      stack: 'Error stack trace',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: [],
    });
  });

  it('should render debug panel', () => {
    render(<DebugPanel />);
    expect(screen.getByText('Debug Logs')).toBeInTheDocument();
  });

  it('should display empty state when no logs', async () => {
    render(<DebugPanel />);
    await waitFor(() => {
      expect(screen.getByText('No logs yet')).toBeInTheDocument();
    });
  });

  it('should load and display logs', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
      expect(screen.getByText('Error log message')).toBeInTheDocument();
    });
  });

  it('should display log count', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/2 log entries/)).toBeInTheDocument();
    });
  });

  it('should display log levels with badges', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('INFO')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
  });

  it('should display log categories', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      const badges = screen.getAllByText('test');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display log data when present', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: [mockLogs[1]], // Error log with data
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/"error":\s*"test error"/)).toBeInTheDocument();
    });
  });

  it('should display stack trace when present', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: [mockLogs[1]], // Error log with stack
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Error stack trace')).toBeInTheDocument();
    });
  });

  it('should refresh logs when refresh button is clicked', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getLogs' });
    });
  });

  it('should export logs when export button is clicked', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'exportLogs' });
    });
  });

  it('should clear logs when clear button is clicked', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      logs: mockLogs,
    });

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'clearLogs' });
      expect(screen.getByText('No logs yet')).toBeInTheDocument();
    });
  });

  it('should disable export button when no logs', async () => {
    render(<DebugPanel />);
    
    await waitFor(() => {
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeDisabled();
    });
  });

  it('should disable clear button when no logs', async () => {
    render(<DebugPanel />);
    
    await waitFor(() => {
      const clearButton = screen.getByText('Clear');
      expect(clearButton).toBeDisabled();
    });
  });

  it('should handle load logs error', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(<DebugPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('No logs yet')).toBeInTheDocument();
    });
  });

  it('should show loading state when refreshing', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (chrome.runtime.sendMessage as jest.Mock).mockReturnValue(promise);

    render(<DebugPanel />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
    });

    resolvePromise!({ success: true, logs: [] });
  });
});

