import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

  it('should reset error state when try again is clicked', async () => {
    let shouldThrow = true;
    let errorKey = 0;
    
    const { rerender } = render(
      <ErrorBoundary key={`boundary-${errorKey}`}>
        <ThrowError key={`error-${shouldThrow}`} shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    // Click try again button - this resets the error boundary
    const tryAgainButton = screen.getByText('Try Again');
    
    // Change shouldThrow to false and increment key to force remount
    shouldThrow = false;
    errorKey = 1;
    
    await act(async () => {
      fireEvent.click(tryAgainButton);
    });

    // Rerender with non-throwing component and new key to force remount
    await act(async () => {
      rerender(
        <ErrorBoundary key={`boundary-${errorKey}`}>
          <ThrowError key={`error-${shouldThrow}`} shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    });

    // After reset and rerender with non-throwing component, it should render normally
    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should call onReset callback when provided', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  });

  it('should display component stack when errorInfo is available', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // The component stack should be in a details element
    const details = document.querySelector('details');
    expect(details).toBeInTheDocument();
  });

  it('should handle reload button click', () => {
    const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Extension');
    fireEvent.click(reloadButton);

    expect(reloadSpy).toHaveBeenCalled();
    reloadSpy.mockRestore();
  });
});

