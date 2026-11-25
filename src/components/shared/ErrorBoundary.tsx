"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const boundaryName = this.props.name || "AppErrorBoundary";
    logger.error(`Error boundary [${boundaryName}] caught rendering failure`, {
      boundaryName,
      componentStack: errorInfo.componentStack,
    }, error);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error || new Error("Unknown error"), this.reset);
        }
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-destructive/25 bg-card p-6 md:p-8 text-foreground shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Something went wrong in this section
              </h3>
              <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                An unexpected display error occurred. Your workout data and progress remain safe.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={this.reset}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </button>

                {process.env.NODE_ENV !== "production" && this.state.error && (
                  <button
                    type="button"
                    onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    <span>{this.state.showDetails ? "Hide" : "View"} Error Details</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {this.state.showDetails && this.state.error && (
                <div className="mt-4 overflow-x-auto rounded-xl bg-black/60 p-4 border border-white/10 text-xs font-mono text-red-300">
                  <p className="font-semibold">{this.state.error.name}: {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-[11px] text-neutral-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
