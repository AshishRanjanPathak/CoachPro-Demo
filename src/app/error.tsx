"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error("Root page level error caught by Next.js error boundary", {
      digest: error.digest,
    }, error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          CoachPRO encountered an unexpected issue while rendering this view. Don&apos;t worry, your logged workouts and athlete progress are preserved.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-xl bg-black/40 border border-white/5 py-2 px-3 text-xs font-mono text-neutral-400">
            Error ID: <span className="text-neutral-200">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
