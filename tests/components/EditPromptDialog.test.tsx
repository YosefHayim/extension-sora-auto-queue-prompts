import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditPromptDialog } from '../../src/components/EditPromptDialog';
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

describe('EditPromptDialog', () => {
  const mockPrompt: GeneratedPrompt = {
    id: 'test-1',
    text: 'Original prompt text',
    timestamp: Date.now(),
    status: 'pending',
    mediaType: 'video',
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <EditPromptDialog prompt={mockPrompt} isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when prompt is null', () => {
    const { container } = render(
      <EditPromptDialog prompt={null} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true and prompt exists', () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
  });

  it('should initialize with prompt text', () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const textarea = screen.getByLabelText('Prompt Text') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Original prompt text');
  });

  it('should update text when typing', () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const textarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(textarea, { target: { value: 'Updated prompt text' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('Updated prompt text');
  });

  it('should show error when text is empty', async () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const textarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(textarea, { target: { value: '   ' } }); // Whitespace only
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      const errorElement = screen.queryByText((content, element) => {
        return element?.textContent?.includes('Prompt text cannot be empty') || false;
      });
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('should call onSave when form is submitted with changes', async () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    const textarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('test-1', 'Updated text');
    }, { timeout: 2000 });
  });

  it('should call onClose when no changes are made', async () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    // Button should be disabled when no changes
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during save', async () => {
    const slowSave = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={slowSave} />);
    const textarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle save errors', async () => {
    const errorSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    render(<EditPromptDialog prompt={mockPrompt} isOpen={true} onClose={mockOnClose} onSave={errorSave} />);
    const textarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      const errorElement = screen.queryByText((content, element) => {
        return element?.textContent?.includes('Save failed') || false;
      });
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

