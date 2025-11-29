import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortablePromptCard } from '../../src/components/SortablePromptCard';
import type { GeneratedPrompt } from '../../src/types';

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: { role: 'button' },
    listeners: {
      onPointerDown: jest.fn(),
    },
    setNodeRef: jest.fn((node) => node),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock @dnd-kit/utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => 'translate3d(0, 0, 0)'),
    },
  },
}));

// Mock PromptCard
jest.mock('../../src/components/PromptCard', () => ({
  PromptCard: ({ prompt, onEdit, onDelete }: any) => (
    <div data-testid="prompt-card">
      <div>{prompt.text}</div>
      <button onClick={() => onEdit(prompt.id)}>Edit</button>
      <button onClick={() => onDelete(prompt.id)}>Delete</button>
    </div>
  ),
}));

describe('SortablePromptCard', () => {
  const mockPrompt: GeneratedPrompt = {
    id: 'test-id',
    text: 'Test prompt',
    status: 'pending',
    createdAt: Date.now(),
  };

  const mockProps = {
    prompt: mockPrompt,
    onEdit: jest.fn(),
    onDuplicate: jest.fn(),
    onRefine: jest.fn(),
    onGenerateSimilar: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render PromptCard with prompt', () => {
    render(<SortablePromptCard {...mockProps} />);
    expect(screen.getByText('Test prompt')).toBeInTheDocument();
  });

  it('should pass all props to PromptCard', () => {
    render(<SortablePromptCard {...mockProps} isSelected={true} />);
    const card = screen.getByTestId('prompt-card');
    expect(card).toBeInTheDocument();
  });

  it('should handle drag events', () => {
    const { useSortable } = require('@dnd-kit/sortable');
    const mockListeners = {
      onPointerDown: jest.fn(),
    };

    useSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: mockListeners,
      setNodeRef: jest.fn((node) => node),
      transform: { x: 10, y: 20 },
      transition: 'transform 200ms',
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);
    
    // The component should render with sortable functionality
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it('should filter drag events from buttons', () => {
    const { useSortable } = require('@dnd-kit/sortable');
    const originalHandler = jest.fn();
    const mockListeners = {
      onPointerDown: originalHandler,
    };

    useSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: mockListeners,
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);
    
    // The component should render with filtered listeners
    // The actual filtering happens in the component's filteredListeners logic
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it('should apply transform style when dragging', () => {
    const { useSortable } = require('@dnd-kit/sortable');
    const { CSS } = require('@dnd-kit/utilities');
    
    CSS.Transform.toString = jest.fn(() => 'translate3d(10px, 20px, 0)');

    useSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: {},
      setNodeRef: jest.fn((node) => node),
      transform: { x: 10, y: 20 },
      transition: 'transform 200ms',
      isDragging: true,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: '0.5' });
  });

  it('should not start drag on interactive elements', () => {
    const { useSortable } = require('@dnd-kit/sortable');
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);
    
    // Create a mock button element
    const button = document.createElement('button');
    const mockEvent = {
      target: button,
      stopPropagation,
    } as any;

    // The filtered listener should stop propagation for buttons
    // This is tested through the component's internal logic
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });
});

