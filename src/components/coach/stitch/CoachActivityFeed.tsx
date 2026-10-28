"use client";

import React from "react";
import { Dumbbell, Check, AlertCircle, History, Flame, TrendingUp } from "lucide-react";

export function CoachActivityFeed() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column: Adherence & Volume Progress (1 Col) */}
      <div className="flex flex-col space-y-4">
        {/* Weekly Adherence Progress Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 space-y-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Weekly Adherence
            </span>
            <span className="text-xs font-mono text-brand font-medium">Goal: 85%</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-foreground">82%</span>
              <span className="text-xs text-muted-foreground font-medium tabular-nums">23&nbsp;/&nbsp;28 Completed</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-brand h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: "82%" }}
              ></div>
            </div>
          </div>
          <div className="pt-1 flex justify-between text-xs font-mono text-muted-foreground">
            <span>Target pace: On-track</span>
            <span className="text-brand font-semibold">-3% delta</span>
          </div>
        </div>

        {/* Volume Tonnage Progress Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 space-y-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Volume Tonnage
            </span>
            <span className="text-xs font-mono text-success font-medium">87.7% Cap</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-success">
                48,250 <span className="text-xs font-normal text-muted-foreground">kg</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium tabular-nums">Cap: 55,000&nbsp;kg</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-success h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: "87.7%" }}
              ></div>
            </div>
          </div>
          <div className="pt-1 flex justify-between text-xs font-mono text-muted-foreground">
            <span>Accumulation Phase</span>
            <span className="text-success font-semibold">+6,750 kg rem</span>
          </div>
        </div>

        {/* Quick Roster Status Pill Summary */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col space-y-2.5 border border-border shadow-xs">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Microcycle Adherence Index
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Alex Chen</span>
            <span className="text-success font-mono font-semibold">100% (4/4 sessions)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Jordan Taylor</span>
            <span className="text-warning font-mono font-semibold">75% (3/4 sessions)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Maya Patel</span>
            <span className="text-destructive font-mono font-semibold">66% (Deload Pending)</span>
          </div>
        </div>
      </div>

      {/* Right Column: Live Training Activity Stream (2 Cols) */}
      <div className="lg:col-span-2 bg-card rounded-xl p-4 sm:p-5 flex flex-col space-y-4 border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight text-balance">
              Live Training Activity Feed
            </h2>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
            3 updates logged today
          </span>
        </div>

        {/* Activity Items Timeline */}
        <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
          {/* Feed Item 1: Alex PR */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success text-success-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Alex Chen</span>
                  <span className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[10px] font-mono font-bold tracking-wide">
                    ★ NEW PERSONAL RECORD
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">14:22 Today</span>
              </div>
              <p className="text-xs text-foreground">
                Logged <strong className="text-brand">Barbell Back Squat: 142.5&nbsp;kg × 5&nbsp;reps</strong> @ RPE 8.5
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-muted-foreground pt-1">
                <span>Estimated 1RM: <strong className="text-success">166.0&nbsp;kg</strong> (+4.2%)</span>
                <span>•</span>
                <span>Bar Velocity: <strong>0.54&nbsp;m/s</strong></span>
                <span>•</span>
                <span>Session: Day 1 Lower</span>
              </div>
            </div>
          </div>

          {/* Feed Item 2: Alex Completed Workout */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Alex Chen</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono">
                    Workout Completed
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">13:40 Today</span>
              </div>
              <p className="text-xs text-foreground">
                Completed <strong>Day 1: Lower Body Strength</strong> (58 mins, 14,200&nbsp;kg session volume)
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-muted-foreground pt-1">
                <span>Heart Rate Avg: 144&nbsp;bpm</span>
                <span>•</span>
                <span>Session RPE: 8.0</span>
              </div>
            </div>
          </div>

          {/* Feed Item 3: Maya Patel Flagged Check-In */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shrink-0 z-10 shadow-xs" aria-hidden="true">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Maya Patel</span>
                  <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive text-[10px] font-mono font-bold">
                    FLAGGED CHECK-IN
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">08:15 Today</span>
              </div>
              <p className="text-xs text-foreground">
                Submitted Morning Telemetry: <strong className="text-destructive">5.5 hrs sleep</strong>, Readiness 4/10, Soreness 4/5. Reported patellar pain during warm-up squats.
              </p>
              <div className="text-[11px] font-mono text-destructive pt-1 font-medium">
                Automatic alert escalated to Sarah Jenkins
              </div>
            </div>
          </div>

          {/* Feed Item 4: Jordan Taylor Log */}
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-foreground flex items-center justify-center shrink-0 z-10 shadow-xs border border-border" aria-hidden="true">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="flex-1 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl p-3 sm:p-4 flex flex-col space-y-1 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">Jordan Taylor</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono">
                    Heavy Pull Log
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">Yesterday 18:30</span>
              </div>
              <p className="text-xs text-foreground">
                Logged <strong>Conventional Deadlift: 180.0&nbsp;kg × 3&nbsp;reps</strong> @ RPE 8.0
              </p>
              <div className="text-[11px] font-mono text-muted-foreground pt-1">
                Post-session lumbar tightness reported
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
