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
    render(<PromptCard prompt={completedPrompt} {...mockHandlers} />);
    const statusBadge = screen.getByTitle('Completed');
    expect(statusBadge).toBeInTheDocument();
  });

  it('should display correct status icon for processing status', () => {
    const processingPrompt = { ...mockPrompt, status: 'processing' as const };
    render(<PromptCard prompt={processingPrompt} {...mockHandlers} />);
    const statusBadge = screen.getByTitle('Processing');
    expect(statusBadge).toBeInTheDocument();
  });

  it('should display correct status icon for pending status', () => {
    render(<PromptCard prompt={mockPrompt} {...mockHandlers} />);
    const statusBadge = screen.getByTitle('Pending');
    expect(statusBadge).toBeInTheDocument();
  });

  it('should display correct status icon for failed status', () => {
    const failedPrompt = { ...mockPrompt, status: 'failed' as const };
    render(<PromptCard prompt={failedPrompt} {...mockHandlers} />);
    const statusBadge = screen.getByTitle('Failed');
    expect(statusBadge).toBeInTheDocument();
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
});

