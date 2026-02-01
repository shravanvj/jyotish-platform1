'use client';

import { Component, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or return to the home page.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Go Home
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
