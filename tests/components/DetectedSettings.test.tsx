import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetectedSettings } from '../../src/components/DetectedSettings';
import type { DetectedSettings as DetectedSettingsType } from '../../src/types';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe('DetectedSettings', () => {
  const mockOnSync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when settings is null', () => {
    const { container } = render(<DetectedSettings settings={null} onSync={mockOnSync} />);
    expect(container.firstChild).toBeNull();
  });

  it('should show error message when detection failed', () => {
    const failedSettings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: null,
      variations: null,
      success: false,
      error: 'Failed to detect',
    };

    render(<DetectedSettings settings={failedSettings} onSync={mockOnSync} />);
    expect(screen.getByText(/Could not detect settings/)).toBeInTheDocument();
  });

  it('should show sync button when detection failed', () => {
    const failedSettings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: null,
      variations: null,
      success: false,
      error: 'Failed to detect',
    };

    render(<DetectedSettings settings={failedSettings} onSync={mockOnSync} />);
    const buttons = screen.getAllByRole('button');
    const syncButton = buttons.find(btn => btn.querySelector('svg'));
    expect(syncButton).toBeInTheDocument();
  });

  it('should call onSync when sync button is clicked', () => {
    const failedSettings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: null,
      variations: null,
      success: false,
      error: 'Failed to detect',
    };

    render(<DetectedSettings settings={failedSettings} onSync={mockOnSync} />);
    const buttons = screen.getAllByRole('button');
    const syncButton = buttons.find(btn => btn.querySelector('svg'));
    if (syncButton) {
      fireEvent.click(syncButton);
      expect(mockOnSync).toHaveBeenCalledTimes(1);
    }
  });

  it('should display detected media type', () => {
    const settings: DetectedSettingsType = {
      mediaType: 'image',
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should display detected video media type', () => {
    const settings: DetectedSettingsType = {
      mediaType: 'video',
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('should display detected aspect ratio', () => {
    const settings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: '16:9',
      variations: null,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(screen.getByText('16:9')).toBeInTheDocument();
  });

  it('should display detected variations', () => {
    const settings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: null,
      variations: 2,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(screen.getByText('2v')).toBeInTheDocument();
  });

  it('should display all detected settings', () => {
    const settings: DetectedSettingsType = {
      mediaType: 'image',
      aspectRatio: '1:1',
      variations: 4,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('1:1')).toBeInTheDocument();
    expect(screen.getByText('4v')).toBeInTheDocument();
  });

  it('should show loading state on sync button', () => {
    const settings: DetectedSettingsType = {
      mediaType: 'image',
      aspectRatio: null,
      variations: null,
      success: true,
    };

    render(<DetectedSettings settings={settings} onSync={mockOnSync} loading={true} />);
    const syncButton = screen.getByTitle('Sync settings from Sora page');
    expect(syncButton).toBeDisabled();
  });

  it('should return null when no settings detected and success is true', () => {
    const settings: DetectedSettingsType = {
      mediaType: null,
      aspectRatio: null,
      variations: null,
      success: true,
    };

    const { container } = render(<DetectedSettings settings={settings} onSync={mockOnSync} />);
    expect(container.firstChild).toBeNull();
  });
});

