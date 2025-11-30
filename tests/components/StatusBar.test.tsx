import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../../src/components/StatusBar';

describe('StatusBar', () => {
  it('should render pending count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render processing count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should render completed count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render total count when prompts exist', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('17 total')).toBeInTheDocument();
  });

  it('should not render when no prompts', () => {
    const { container } = render(<StatusBar pendingCount={0} processingCount={0} completedCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display correct icons', () => {
    const { container } = render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle zero counts when total is greater than zero', () => {
    render(<StatusBar pendingCount={0} processingCount={0} completedCount={1} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(2); // Two zeros for pending and processing
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('1 total')).toBeInTheDocument();
  });

  it('should handle large counts', () => {
    render(<StatusBar pendingCount={999} processingCount={500} completedCount={1000} />);
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2499 total')).toBeInTheDocument();
  });
});

