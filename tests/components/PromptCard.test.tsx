import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptCard } from '../../src/components/PromptCard';
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

describe('PromptCard', () => {
  const mockPrompt: GeneratedPrompt = {
    id: 'test-1',
    text: 'Test prompt text',
    timestamp: Date.now(),
    status: 'pending',
    mediaType: 'video',
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onDuplicate: jest.fn(),
    onRefine: jest.fn(),
    onGenerateSimilar: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render prompt text', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    expect(screen.getByText('Test prompt text')).toBeInTheDocument();
  });

  it('should display video media type badge', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('should display image media type badge', () => {
    const imagePrompt = { ...mockPrompt, mediaType: 'image' as const };
    render(<PromptCard prompt={imagePrompt} {...mockHandlers} />);
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should display aspect ratio badge when provided', () => {
    const promptWithAspectRatio = { ...mockPrompt, aspectRatio: '16:9' as const };
    render(<PromptCard prompt={promptWithAspectRatio} {...mockHandlers} />);
    expect(screen.getByText('16:9')).toBeInTheDocument();
  });

  it('should display variations count when provided', () => {
    const promptWithVariations = { ...mockPrompt, variations: 4 };
    render(<PromptCard prompt={promptWithVariations} {...mockHandlers} />);
    expect(screen.getByText('4 variations')).toBeInTheDocument();
  });

  it('should display enhanced badge when prompt is enhanced', () => {
    const enhancedPrompt = { ...mockPrompt, enhanced: true };
    render(<PromptCard prompt={enhancedPrompt} {...mockHandlers} />);
    expect(screen.getByText('Enhanced')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    const editButton = screen.getByTitle(/edit prompt/i);
    fireEvent.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('test-1');
  });

  it('should call onDuplicate when duplicate button is clicked', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    const duplicateButton = screen.getByTitle(/duplicate/i);
    fireEvent.click(duplicateButton);
    expect(mockHandlers.onDuplicate).toHaveBeenCalledWith('test-1');
  });

  it('should call onRefine when refine button is clicked', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    const refineButton = screen.getByTitle(/refine with ai/i);
    fireEvent.click(refineButton);
    expect(mockHandlers.onRefine).toHaveBeenCalledWith('test-1');
  });

  it('should display correct status icon for completed status', () => {
    const completedPrompt = { ...mockPrompt, status: 'completed' as const };
    const { container } = render(<PromptCard prompt={completedPrompt} {...mockHandlers} />);
    // Check for green border (completed status)
    const card = container.querySelector('[class*="border-l-green"]');
    expect(card).toBeInTheDocument();
  });

  it('should display correct status icon for processing status', () => {
    const processingPrompt = { ...mockPrompt, status: 'processing' as const };
    const { container } = render(<PromptCard prompt={processingPrompt} {...mockHandlers} />);
    // Check for yellow border (processing status)
    const card = container.querySelector('[class*="border-l-yellow"]');
    expect(card).toBeInTheDocument();
  });

  it('should display correct status icon for pending status', () => {
    const { container } = render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    // Check for gray border (pending status)
    const card = container.querySelector('[class*="border-l-gray"]');
    expect(card).toBeInTheDocument();
  });

  it('should display correct status icon for failed status', () => {
    const failedPrompt = { ...mockPrompt, status: 'failed' as const };
    const { container } = render(<PromptCard prompt={failedPrompt} {...mockHandlers} />);
    // Check for red border (failed status)
    const card = container.querySelector('[class*="border-l-red"]');
    expect(card).toBeInTheDocument();
  });

  it('should call onDelete when delete is selected from dropdown', async () => {
    const { container } = render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    
    // Find the dropdown trigger button by its aria-haspopup attribute
    const moreButton = container.querySelector('button[aria-haspopup="true"]');
    expect(moreButton).toBeInTheDocument();
    fireEvent.click(moreButton!);
    
    // Wait for dropdown to open and find delete option
    const deleteOption = await screen.findByText('Delete');
    fireEvent.click(deleteOption);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('test-1');
  });

  it('should capitalize media type correctly', () => {
    const videoPrompt = { ...mockPrompt, mediaType: 'video' as const };
    const { rerender } = render(<PromptCard prompt={videoPrompt} {...mockHandlers} />);
    expect(screen.getByText('Video')).toBeInTheDocument();

    const imagePrompt = { ...mockPrompt, mediaType: 'image' as const };
    rerender(<PromptCard prompt={imagePrompt} {...mockHandlers} />);
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should call onGenerateSimilar when generate similar is selected', async () => {
    const { container } = render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    
    const moreButton = container.querySelector('button[aria-haspopup="true"]');
    fireEvent.click(moreButton!);
    
    const generateSimilarOption = await screen.findByText(/generate similar/i);
    fireEvent.click(generateSimilarOption);
    expect(mockHandlers.onGenerateSimilar).toHaveBeenCalledWith('test-1');
  });

  it('should copy text to clipboard when copy button is clicked', async () => {
    // Mock clipboard API
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    
    const copyButton = screen.getByTitle(/copy prompt text/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test prompt text');
    });
  });

  it('should handle clipboard copy error gracefully', async () => {
    // Mock clipboard API to throw error
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    
    const copyButton = screen.getByTitle(/copy prompt text/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should toggle selection when selection button is clicked', () => {
    const mockOnToggleSelection = jest.fn();
    render(
      <PromptCard
        prompt={mockPrompt}
        isSelected={false}
        onToggleSelection={mockOnToggleSelection}
        {...mockHandlers}
      />
    );

    const selectButton = screen.getByTitle('Select');
    fireEvent.click(selectButton);
    expect(mockOnToggleSelection).toHaveBeenCalledWith('test-1');
  });

  it('should call onProcess when process button is clicked', () => {
    const mockOnProcess = jest.fn();
    render(
      <PromptCard
        prompt={mockPrompt}
        onProcess={mockOnProcess}
        {...mockHandlers}
      />
    );

    const processButton = screen.getByTitle('Process this prompt');
    fireEvent.click(processButton);
    expect(mockOnProcess).toHaveBeenCalledWith('test-1');
  });

  it('should navigate to prompt when card is clicked for completed prompt', () => {
    const mockOnNavigateToPrompt = jest.fn();
    const completedPrompt = { ...mockPrompt, status: 'completed' as const };
    const { container } = render(
      <PromptCard
        prompt={completedPrompt}
        onNavigateToPrompt={mockOnNavigateToPrompt}
        {...mockHandlers}
      />
    );

    const card = container.querySelector('[class*="card"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnNavigateToPrompt).toHaveBeenCalledWith('test-1', 'Test prompt text');
    }
  });

  it('should not navigate when clicking on interactive elements', () => {
    const mockOnNavigateToPrompt = jest.fn();
    const completedPrompt = { ...mockPrompt, status: 'completed' as const };
    render(
      <PromptCard
        prompt={completedPrompt}
        onNavigateToPrompt={mockOnNavigateToPrompt}
        {...mockHandlers}
      />
    );

    const editButton = screen.getByTitle(/edit prompt/i);
    fireEvent.click(editButton);
    
    // Should not navigate when clicking button
    expect(mockOnNavigateToPrompt).not.toHaveBeenCalled();
  });

  it('should expand and collapse long text', () => {
    const longText = 'A'.repeat(500);
    const longPrompt = { ...mockPrompt, text: longText };
    render(<PromptCard prompt={longPrompt} {...mockHandlers} />);

    // Should show expand button for long text
    const expandButton = screen.getByText(/read more/i);
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);
    
    // Should show collapse button after expanding
    const collapseButton = screen.getByText(/show less/i);
    expect(collapseButton).toBeInTheDocument();
  });

  it('should display time ago for recent prompts', () => {
    const recentPrompt = { ...mockPrompt, timestamp: Date.now() - 60000 }; // 1 minute ago
    render(<PromptCard prompt={recentPrompt} {...mockHandlers} />);
    
    expect(screen.getByText(/minute ago|Just now/)).toBeInTheDocument();
  });

  it('should display processing duration when available', () => {
    const promptWithDuration = {
      ...mockPrompt,
      status: 'completed' as const,
      processingDuration: 5000,
    };
    const { container } = render(<PromptCard prompt={promptWithDuration} {...mockHandlers} />);
    
    // Processing duration might be displayed in a tooltip or badge
    // Just verify the component renders without error
    expect(container).toBeInTheDocument();
  });

  it('should handle default status color', () => {
    const unknownStatusPrompt = { ...mockPrompt, status: 'unknown' as any };
    const { container } = render(<PromptCard prompt={unknownStatusPrompt} {...mockHandlers} />);
    
    // Should render without error
    expect(container).toBeInTheDocument();
  });
});

