"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCw, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MotionVisualizerProps {
  exerciseName: string;
  images?: {
    start?: string;
    peak?: string;
    main?: string;
  };
  className?: string;
  autoPlayIntervalMs?: number;
}

export function MotionVisualizer({
  exerciseName,
  images,
  className = "",
  autoPlayIntervalMs = 1200
}: MotionVisualizerProps) {
  const startUrl = images?.start || images?.main;
  const peakUrl = images?.peak;
  const hasTwoPoses = Boolean(startUrl && peakUrl);

  // Default to static start pose
  const [activePose, setActivePose] = useState<"start" | "peak">("start");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  // Interval timer for 2-pose demonstration when user explicitly presses Play
  useEffect(() => {
    if (!isPlaying || !hasTwoPoses || reducedMotion) return;

    const timer = setInterval(() => {
      setActivePose(prev => (prev === "start" ? "peak" : "start"));
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, hasTwoPoses, reducedMotion, autoPlayIntervalMs]);

  // Current active image URL
  const currentImageUrl = activePose === "peak" && peakUrl ? peakUrl : startUrl;

  if (!startUrl) {
    return (
      <div className={`aspect-square rounded-2xl bg-secondary/40 border border-border flex flex-col items-center justify-center p-4 text-center text-muted-foreground ${className}`}>
        <ImageIcon className="w-10 h-10 mb-2 opacity-40" aria-hidden="true" />
        <span className="text-xs">Illustration not available</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Visualizer Display Canvas */}
      <div className="relative aspect-square w-full rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center p-2 shadow-xs group">
        {/* Current Image */}
        <img
          src={currentImageUrl}
          alt={`${exerciseName} - ${activePose === "peak" ? "Peak position" : "Starting position"}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Preload peak image quietly in background if two poses exist */}
        {hasTwoPoses && peakUrl && (
          <img
            src={peakUrl}
            alt=""
            aria-hidden="true"
            className="hidden"
            loading="lazy"
          />
        )}

        {/* Pose Indicator Badge */}
        {hasTwoPoses && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge
              variant="default"
              className="text-[11px] font-mono tracking-tight px-2 py-0.5 shadow-xs uppercase"
            >
              {activePose === "start" ? "1. Starting Pose" : "2. Peak Contraction"}
            </Badge>
          </div>
        )}

        {/* Play / Pause Floating Toggle on Image */}
        {hasTwoPoses && !reducedMotion && (
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? "Pause two-pose demonstration" : "Play two-pose demonstration"}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] cursor-pointer min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-current" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Manual Pose Selection Controls (Tap to Compare Poses) */}
      {hasTwoPoses && (
        <div className="flex items-center justify-between gap-2" role="group" aria-label="Pose Demonstration Controls">
          <div className="flex items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setActivePose("start");
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
                activePose === "start"
                  ? "border-brand bg-brand/15 text-brand font-bold"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              Start Pose
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setActivePose("peak");
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
                activePose === "peak"
                  ? "border-brand bg-brand/15 text-brand font-bold"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              Peak Pose
            </button>
          </div>

          {!reducedMotion && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(p => !p)}
              className="text-xs h-10 px-3 rounded-lg border-border hover:bg-secondary font-medium cursor-pointer shrink-0 min-h-[40px]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1 fill-current" aria-hidden="true" />
                  <span>Cycle Poses</span>
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
