"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";

interface CoachBuddyCardProps {
  mode?: "home" | "training";
  onOpenLogger?: () => void;
  onGoToTraining?: () => void;
}

const STORAGE_KEY = "coachpro_buddy_collapsed";

export function CoachBuddyCard({ mode = "training", onOpenLogger, onGoToTraining }: CoachBuddyCardProps) {
  const { state } = useAuth();
  const session = state.activeSession;
  const program = state.programs.find(p => p.id === session.programId) || state.programs[0];
  const currentDay = program.days.find(d => d.dayNumber === session.dayNumber) || program.days[0];

  const plannedSets = currentDay ? currentDay.prescriptions.reduce((acc, rx) => acc + rx.sets, 0) : 0;
  const completedSets = session.sets ? session.sets.length : 0;
  const remainingSets = Math.max(0, plannedSets - completedSets);
  const isCompleted = plannedSets > 0 && completedSets >= plannedSets;
  const isInProgress = completedSets > 0 && !isCompleted;
  const isNotStarted = completedSets === 0 && plannedSets > 0;
  const progressPercent = plannedSets > 0 ? Math.min(100, Math.round((completedSets / plannedSets) * 100)) : 0;

  // Persisted compact/expanded preference
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // localStorage may be restricted in some browser contexts
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  };

  // State-specific dialogue and action label according to Coach Buddy spec
  let dialogueMessage = "";
  let ctaLabel = "";
  let ctaIcon = <Play className="w-4 h-4 mr-2 fill-current" aria-hidden="true" />;

  if (plannedSets === 0) {
    dialogueMessage = "No training session scheduled for today. Rest up or review your upcoming program blocks.";
    ctaLabel = "Review Program";
    ctaIcon = <Dumbbell className="w-4 h-4 mr-2" aria-hidden="true" />;
  } else if (isCompleted) {
    dialogueMessage = `Outstanding job! You've completed all ${plannedSets} sets today. Cool down, hydrate and recover.`;
    ctaLabel = "Session Completed";
    ctaIcon = <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" aria-hidden="true" />;
  } else if (isInProgress) {
    dialogueMessage = `Nice progress! You've completed ${completedSets} of ${plannedSets} sets. Just ${remainingSets} more to go. Keep it up!`;
    ctaLabel = "Continue Workout";
  } else {
    // Not started
    dialogueMessage = `Your program has ${plannedSets} sets planned for today. Whenever you're ready, let's get started.`;
    ctaLabel = "Start Workout";
  }

  // Dedicated Home tab compact version
  if (mode === "home") {
    return (
      <section
        aria-label="Coach Buddy Training Companion"
        className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0 p-1.5 shadow-xs">
              <img
                src="/coach-buddy.png"
                alt="Coach Buddy muscular chimpanzee mascot"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Coach Buddy</h3>
                <span className="text-[11px] font-semibold text-brand px-2 py-0.5 rounded-md bg-brand/10 border border-brand/20">
                  {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Ready"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {dialogueMessage}
              </p>
            </div>
          </div>

          {onGoToTraining && (
            <Button
              type="button"
              variant="brand"
              onClick={onGoToTraining}
              className="w-full sm:w-auto font-bold text-xs h-11 px-5 rounded-xl cursor-pointer shadow-xs min-h-[44px] shrink-0"
            >
              <Dumbbell className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Go to Training</span>
            </Button>
          )}
        </div>

        {plannedSets > 0 && (
          <div className="mt-3.5 pt-3 border-t border-border/70 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground tabular-nums">
                {completedSets} / {plannedSets} sets completed
              </span>
              <span className="text-muted-foreground tabular-nums">
                {isCompleted ? "Goal achieved" : `${remainingSets} sets remaining`}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={completedSets}
              aria-valuemin={0}
              aria-valuemax={plannedSets}
              className="w-full h-2 bg-secondary rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-brand rounded-full transition-[width] duration-200 ease-[var(--ease-out)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-label="Training Progress Companion"
      className="bg-card border border-border rounded-2xl p-4 sm:p-5"
    >
      {/* COMPACT MODE */}
      {isCollapsed ? (
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 p-1">
              <img
                src="/icon.png"
                alt="Bonobo"
                className="w-full h-full object-contain rounded-sm"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Session Companion</span>
                <span className="text-xs font-mono font-semibold text-brand tabular-nums">
                  {completedSets} / {plannedSets} sets
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {isCompleted
                  ? "All sets completed for today"
                  : `${remainingSets} sets remaining`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted && onOpenLogger && (
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={onOpenLogger}
                className="font-semibold text-xs h-10 px-3.5 rounded-xl min-h-[40px]"
              >
                Log Set
              </Button>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expand session summary"
              className="w-10 h-10 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors duration-150 cursor-pointer min-h-[40px] min-w-[40px] active:scale-[0.97]"
            >
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        /* EXPANDED MODE */
        <div className="space-y-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 p-1">
                <img
                  src="/icon.png"
                  alt="Bonobo"
                  className="w-full h-full object-contain rounded-sm"
                  loading="eager"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground heading-tight">
                  Session Companion
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {isCompleted ? "Session Done" : isInProgress ? "In Progress" : "Ready to Lift"} • {dialogueMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse session summary"
              className="w-9 h-9 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0 active:scale-[0.97]"
            >
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Progress Section */}
          {plannedSets > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold text-foreground tabular-nums">
                  {completedSets} / {plannedSets} sets completed
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {isCompleted ? "Goal achieved" : `${remainingSets} sets remaining`}
                </span>
              </div>

              {/* High contrast accessible progress bar */}
              <div
                role="progressbar"
                aria-valuenow={completedSets}
                aria-valuemin={0}
                aria-valuemax={plannedSets}
                aria-label={`Workout progress: ${completedSets} of ${plannedSets} sets completed`}
                className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-brand rounded-full transition-[width] duration-200 ease-[var(--ease-out)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {onOpenLogger && (
            <Button
              type="button"
              variant={isCompleted ? "outline" : "brand"}
              onClick={onOpenLogger}
              className="w-full font-semibold text-xs min-h-[44px] rounded-xl"
            >
              {ctaIcon}
              <span>{ctaLabel}</span>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
