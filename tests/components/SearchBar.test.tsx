import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../../src/components/SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search prompts...');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} placeholder="Custom search..." />);
    const input = screen.getByPlaceholderText('Custom search...');
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} />);
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should display value in input', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('test query') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('should call onChange when typing', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search prompts...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should show clear button when value exists', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should clear value when clear button is clicked', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should apply custom className', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

