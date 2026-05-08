"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to a styled error card. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches rendering errors anywhere in the component subtree and displays
 * a user-friendly fallback instead of crashing the whole page.
 * Logs error details to the console for debugging.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught rendering error:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <h2 className="font-semibold text-red-800 mb-1">Something went wrong</h2>
          <p className="text-red-700 text-sm">
            {this.state.error?.message ?? "An unexpected error occurred. Please refresh the page."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-3 text-xs text-red-600 underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
