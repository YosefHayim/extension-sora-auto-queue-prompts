import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../../src/components/FilterBar';

describe('FilterBar', () => {
  const mockOnStatusFilterChange = jest.fn();
  const mockOnMediaTypeFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all status filter buttons', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render all media type filter buttons', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    expect(screen.getByText('All Types')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should highlight active status filter', () => {
    render(
      <FilterBar
        statusFilter="pending"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const pendingButton = screen.getByText('Pending').closest('button');
    expect(pendingButton).toHaveClass('bg-yellow-100');
  });

  it('should highlight active media type filter', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const videoButton = screen.getByText('Video').closest('button');
    expect(videoButton).toHaveClass('bg-blue-100');
  });

  it('should call onStatusFilterChange when status button is clicked', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    fireEvent.click(screen.getByText('Pending'));
    expect(mockOnStatusFilterChange).toHaveBeenCalledWith('pending');
  });

  it('should call onMediaTypeFilterChange when media type button is clicked', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    fireEvent.click(screen.getByText('Video'));
    expect(mockOnMediaTypeFilterChange).toHaveBeenCalledWith('video');
  });

  it('should show clear button when filters are active', () => {
    render(
      <FilterBar
        statusFilter="pending"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should not show clear button when no filters are active', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('should clear filters when clear button is clicked', () => {
    render(
      <FilterBar
        statusFilter="pending"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    fireEvent.click(screen.getByText('Clear'));
    expect(mockOnStatusFilterChange).toHaveBeenCalledWith('all');
    expect(mockOnMediaTypeFilterChange).toHaveBeenCalledWith('all');
  });

  it('should always display prompt count badge', () => {
    render(
      <FilterBar
        statusFilter="pending"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    expect(screen.getByText('5 prompts')).toBeInTheDocument();
  });

  it('should display singular prompt count when count is 1', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={1}
      />
    );

    expect(screen.getByText('1 prompt')).toBeInTheDocument();
  });

  it('should display plural prompt count when count is greater than 1', () => {
    render(
      <FilterBar
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    expect(screen.getByText('10 prompts')).toBeInTheDocument();
  });
});

