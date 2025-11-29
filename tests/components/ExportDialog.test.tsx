import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDialog } from '../../src/components/ExportDialog';
import type { GeneratedPrompt } from '../../src/types';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    ui: {
      action: jest.fn(),
      error: jest.fn(),
    },
  },
}));

// Mock URL.createObjectURL and document.createElement
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ExportDialog', () => {
  const mockPrompts: GeneratedPrompt[] = [
    {
      id: '1',
      text: 'Test prompt 1',
      timestamp: Date.now(),
      status: 'pending',
      mediaType: 'video',
    },
    {
      id: '2',
      text: 'Test prompt 2',
      timestamp: Date.now(),
      status: 'completed',
      mediaType: 'image',
      aspectRatio: '16:9',
      variations: 2,
    },
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.createElement for anchor element
    const mockClick = jest.fn();
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: {},
    } as any;
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ExportDialog isOpen={false} onClose={mockOnClose} prompts={mockPrompts} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    expect(screen.getByText('Export Prompts')).toBeInTheDocument();
  });

  it('should display prompt count', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    expect(screen.getByText('Exporting')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('prompts')).toBeInTheDocument();
  });

  it('should display singular prompt count', () => {
    const singlePrompt = [mockPrompts[0]];
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={singlePrompt} />);
    expect(screen.getByText('Exporting')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('prompt')).toBeInTheDocument();
  });

  it('should have CSV as default format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    const csvButton = screen.getByText('CSV').closest('button');
    expect(csvButton).toHaveClass('border-primary');
  });

  it('should allow selecting JSON format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    const jsonButton = screen.getByText('JSON').closest('button');
    fireEvent.click(jsonButton!);
    expect(jsonButton).toHaveClass('border-primary');
  });

  it('should allow selecting TXT format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    const txtButton = screen.getByText('TXT').closest('button');
    fireEvent.click(txtButton!);
    expect(txtButton).toHaveClass('border-primary');
  });

  it('should call onClose when cancel is clicked', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    const closeButton = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should export CSV format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    fireEvent.click(screen.getByText('Export'));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should export JSON format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    fireEvent.click(screen.getByText('JSON').closest('button')!);
    fireEvent.click(screen.getByText('Export'));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should export TXT format', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={mockPrompts} />);
    fireEvent.click(screen.getByText('TXT').closest('button')!);
    fireEvent.click(screen.getByText('Export'));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle empty prompts array', () => {
    render(<ExportDialog isOpen={true} onClose={mockOnClose} prompts={[]} />);
    expect(screen.getByText('Exporting')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('prompts')).toBeInTheDocument();
  });
});

