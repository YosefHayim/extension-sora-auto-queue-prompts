import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../../src/components/EmptyState';

describe('EmptyState', () => {
  const mockOnGenerate = jest.fn();
  const mockOnImport = jest.fn();
  const mockOnManual = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state message', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText('No prompts yet')).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText(/Get started by generating AI prompts/)).toBeInTheDocument();
  });

  it('should render generate button', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText('Generate Prompts')).toBeInTheDocument();
  });

  it('should render manual add button', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText('Manual Add')).toBeInTheDocument();
  });

  it('should render import CSV button', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText('Import CSV')).toBeInTheDocument();
  });

  it('should call onGenerate when generate button is clicked', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    fireEvent.click(screen.getByText('Generate Prompts'));
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  it('should call onManual when manual add button is clicked', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    fireEvent.click(screen.getByText('Manual Add'));
    expect(mockOnManual).toHaveBeenCalledTimes(1);
  });

  it('should call onImport when import CSV button is clicked', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    fireEvent.click(screen.getByText('Import CSV'));
    expect(mockOnImport).toHaveBeenCalledTimes(1);
  });

  it('should display keyboard shortcut hints', () => {
    render(<EmptyState onGenerate={mockOnGenerate} onImport={mockOnImport} onManual={mockOnManual} />);
    expect(screen.getByText(/⌘K/)).toBeInTheDocument();
    expect(screen.getByText(/⌘N/)).toBeInTheDocument();
  });
});

