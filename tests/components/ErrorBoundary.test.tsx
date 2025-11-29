import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('should show try again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should show reload extension button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Reload Extension')).toBeInTheDocument();
  });

  it('should reset error state when try again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    // Click try again button
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Error boundary should reset, but component will still throw
    // So we need to rerender with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // After reset, if component doesn't throw, it should render normally
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});

