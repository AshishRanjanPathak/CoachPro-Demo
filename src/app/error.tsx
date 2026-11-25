"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xs text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary border border-border text-foreground mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          CoachPRO encountered an unexpected issue while rendering this view. Don&apos;t worry, your logged workouts and athlete progress are preserved.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-xl bg-secondary border border-border py-2 px-3 text-xs font-mono text-muted-foreground">
            Error ID: <span className="text-foreground">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            onClick={() => reset()}
            className="flex-1 h-11 rounded-xl font-semibold gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button asChild variant="outline" className="flex-1 h-11 rounded-xl font-semibold gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
