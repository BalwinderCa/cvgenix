"use client";

import React from "react";
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-utils";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    logError(error, {
      message: error.message,
      code: error.name,
      statusCode: 500,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.handleReset} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold text-destructive/20">!</div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  {getUserFriendlyErrorMessage(this.state.error)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.stack}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
