import * as React from "react";

import { FaExclamationTriangle, FaSync } from "react-icons/fa";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { log } from "../utils/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch unhandled errors in React component tree
 * Provides graceful degradation with user-friendly error UI
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to debug panel
    log.ui.error("ErrorBoundary", error);

    // Also log component stack separately for debugging
    console.error("Component stack:", errorInfo.componentStack);

    // Update state with error info for display
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }

    log.ui.action("ErrorBoundary:Reset");
  };

  handleReload = () => {
    log.ui.action("ErrorBoundary:Reload");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl p-6 space-y-4">
            {/* Error Icon and Title */}
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="h-8 w-8 text-destructive" />
              <div>
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            {/* Error Details */}
            {this.state.error && (
              <div className="space-y-2">
                <div className="p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.toString()}
                  </p>
                </div>

                {this.state.errorInfo?.componentStack && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Component Stack
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="flex-1"
              >
                <FaSync className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex-1"
              >
                Reload Extension
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center">
              If this error persists, try reloading the extension or check the
              Debug tab for more details.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
