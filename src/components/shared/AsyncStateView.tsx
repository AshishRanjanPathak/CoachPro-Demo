"use client";

import React, { ReactNode } from "react";
import { AlertCircle, RefreshCw, FolderOpen } from "lucide-react";

export type AsyncStatus = "idle" | "loading" | "error" | "empty" | "success";

export interface EmptyStateConfig {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AsyncStateViewProps {
  status: AsyncStatus;
  error?: Error | string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyConfig?: EmptyStateConfig;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error | string, retry?: () => void) => ReactNode);
  children: ReactNode;
  className?: string;
}

/**
 * Standard Skeleton Loader component with GPU-accelerated pulse animation.
 */
export function SkeletonPulse({ className = "h-4 w-full" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
    />
  );
}

/**
 * Pre-styled multi-row card skeleton for loading lists and grids.
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-1/3" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonPulse className="h-2 w-full rounded" />
        </div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

/**
 * Production 4-State UI Container:
 * Handles:
 * 1. Loading (Custom fallback or standard skeleton pulse)
 * 2. Error (Human-friendly message with accessible retry action)
 * 3. Empty (Zero data state with custom icon and call to action)
 * 4. Success (Children content)
 */
export function AsyncStateView({
  status,
  error,
  onRetry,
  isEmpty,
  emptyConfig,
  loadingFallback,
  errorFallback,
  children,
  className = "",
}: AsyncStateViewProps) {
  // 1. Loading State
  if (status === "loading") {
    if (loadingFallback) {
      return <div className={className}>{loadingFallback}</div>;
    }
    return (
      <div className={className}>
        <CardSkeleton count={3} />
      </div>
    );
  }

  // 2. Error State
  if (status === "error" || error) {
    const errorMsg = typeof error === "string" ? error : error?.message || "An error occurred while loading data.";

    if (errorFallback) {
      if (typeof errorFallback === "function") {
        return <div className={className}>{errorFallback(errorMsg, onRetry)}</div>;
      }
      return <div className={className}>{errorFallback}</div>;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className={`rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center text-foreground ${className}`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20 mb-3">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h4 className="text-base font-semibold text-foreground">Unable to load data</h4>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{errorMsg}</p>
        {onRetry && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/25 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (status === "empty" || isEmpty) {
    const config = emptyConfig || {
      title: "No items yet",
      description: "There are no records to display at this moment.",
    };

    return (
      <div
        role="status"
        className={`rounded-2xl border border-border bg-card p-8 text-center text-foreground ${className}`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground border border-border mb-4">
          {config.icon || <FolderOpen className="h-7 w-7 text-muted-foreground" aria-hidden="true" />}
        </div>
        <h4 className="text-base font-semibold text-foreground tracking-tight">{config.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {config.description}
        </p>
        {config.action && (
          <div className="mt-5">
            <button
              type="button"
              onClick={config.action.onClick}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {config.action.label}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. Success / Idle State
  return <div className={className}>{children}</div>;
}
