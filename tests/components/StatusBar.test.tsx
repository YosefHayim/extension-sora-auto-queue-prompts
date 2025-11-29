import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../../src/components/StatusBar';

describe('StatusBar', () => {
  it('should render pending count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('5 Pending')).toBeInTheDocument();
  });

  it('should render processing count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('2 Processing')).toBeInTheDocument();
  });

  it('should render completed count', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('10 Completed')).toBeInTheDocument();
  });

  it('should render total count when prompts exist', () => {
    render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    expect(screen.getByText('17 Total')).toBeInTheDocument();
  });

  it('should not render total count when no prompts', () => {
    render(<StatusBar pendingCount={0} processingCount={0} completedCount={0} />);
    expect(screen.queryByText(/Total/)).not.toBeInTheDocument();
  });

  it('should display correct icons', () => {
    const { container } = render(<StatusBar pendingCount={5} processingCount={2} completedCount={10} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle zero counts', () => {
    render(<StatusBar pendingCount={0} processingCount={0} completedCount={0} />);
    expect(screen.getByText('0 Pending')).toBeInTheDocument();
    expect(screen.getByText('0 Processing')).toBeInTheDocument();
    expect(screen.getByText('0 Completed')).toBeInTheDocument();
  });

  it('should handle large counts', () => {
    render(<StatusBar pendingCount={999} processingCount={500} completedCount={1000} />);
    expect(screen.getByText('999 Pending')).toBeInTheDocument();
    expect(screen.getByText('500 Processing')).toBeInTheDocument();
    expect(screen.getByText('1000 Completed')).toBeInTheDocument();
  });
});

