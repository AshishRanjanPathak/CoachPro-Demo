"use client";

import React, { useState } from "react";
import { triggerOptimizedConfetti } from "@/lib/performance";
import { Droplets, Moon, CheckCircle2, Zap, Sparkles } from "lucide-react";
import { soundController } from "@/lib/audio";
import { addCompanionXp, loadCompanionState, saveCompanionState } from "@/lib/companion";
import { useAuth } from "@/domains/auth/AuthContext";
import { resolveActiveSessionContext } from "@/lib/store";

export function DailyMicroWin() {
  const { state, addWorkoutSets, addCheckIn } = useAuth();
  const [companion, setCompanion] = useState(loadCompanionState);
  const [workoutLogged, setWorkoutLogged] = useState(false);
  const [restDayConfirmed, setRestDayConfirmed] = useState(false);

  // Today's prescribed workout
  const { currentDay, prescriptions } = resolveActiveSessionContext(state);
  const prescriptionCount = prescriptions.length;

  // 1. Hydration micro win
  const handleHydrate = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (companion.hasHydratedToday) return;

    soundController.playChime();
    const rect = e.currentTarget.getBoundingClientRect();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("coachpro_fly_snack", {
          detail: { startX: rect.x + rect.width / 2, startY: rect.y, emoji: "💧" }
        })
      );
    }
    triggerOptimizedConfetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });

    const updated = {
      ...companion,
      hasHydratedToday: true,
      waterStreakDays: companion.waterStreakDays + 1
    };
    setCompanion(updated);
    saveCompanionState(updated);
    addCompanionXp(15, "Hydration Complete");
  };

  // 2. Rest Day 1-tap confirmation
  const handleRestDay = () => {
    soundController.playChime();
    setRestDayConfirmed(true);

    addCheckIn({
      readinessScore: 9,
      sorenessScore: 2,
      sleepHours: 8,
      fatigueLevel: "low",
      hasInjury: false,
      notes: "Dedicated active recovery day"
    });

    const updated = { ...companion, mood: "sleepy" as const };
    setCompanion(updated);
    saveCompanionState(updated);
    addCompanionXp(20, "Rest Day Recovery");
  };

  // 3. 1-Tap "Crushed Prescribed Workout"
  const handleOneTapWorkout = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentDay || prescriptionCount === 0) return;

    soundController.playLevelUp();
    const rect = e.currentTarget.getBoundingClientRect();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("coachpro_fly_snack", {
          detail: { startX: rect.x + rect.width / 2, startY: rect.y, emoji: "🍌" }
        })
      );
    }
    triggerOptimizedConfetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });

    // Prepare sets from coach prescriptions
    const setsToLog = prescriptions.map((rx, idx) => ({
      exerciseId: rx.exerciseId,
      exerciseName: rx.exerciseName,
      setNumber: idx + 1,
      prescribedWeightKg: rx.targetLoadKg || 40,
      prescribedReps: rx.repTarget || "8",
      completedWeightKg: rx.targetLoadKg || 40,
      completedReps: parseInt(String(rx.repTarget), 10) || 8,
      rpe: rx.targetRpe || 8,
      notes: "1-Tap Quick Log"
    }));

    addWorkoutSets(setsToLog);
    setWorkoutLogged(true);
    addCompanionXp(40, "1-Tap Workout Completed");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          <span>Daily Check-Ins</span>
        </h4>
        <span className="text-[11px] font-medium text-muted-foreground">
          1-Tap Rewards
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* 1. Hydrate */}
        <button
          type="button"
          onClick={handleHydrate}
          disabled={companion.hasHydratedToday}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] min-h-[44px] ${
            companion.hasHydratedToday
              ? "border-success/30 bg-success/10 text-success cursor-default"
              : "border-border bg-secondary/40 hover:bg-secondary text-foreground cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              companion.hasHydratedToday ? "bg-success/15 text-success" : "bg-card border border-border text-brand"
            }`}>
              <Droplets className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight truncate">
                {companion.hasHydratedToday ? "Hydrated" : "Drink Water"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate tabular-nums">
                {companion.hasHydratedToday ? `${companion.waterStreakDays}d streak` : "Daily target"}
              </p>
            </div>
          </div>
          {companion.hasHydratedToday ? (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 ml-2" />
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-semibold tabular-nums shrink-0 ml-2">
              +15 XP
            </span>
          )}
        </button>

        {/* 2. Rest Day Confirmation */}
        <button
          type="button"
          onClick={handleRestDay}
          disabled={restDayConfirmed}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] min-h-[44px] ${
            restDayConfirmed
              ? "border-brand/30 bg-brand/10 text-brand cursor-default"
              : "border-border bg-secondary/40 hover:bg-secondary text-foreground cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              restDayConfirmed ? "bg-brand/15 text-brand" : "bg-card border border-border text-muted-foreground"
            }`}>
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight truncate">
                {restDayConfirmed ? "Resting Well" : "Rest Day Pass"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {restDayConfirmed ? "Active recovery" : "Log rest day"}
              </p>
            </div>
          </div>
          {restDayConfirmed ? (
            <CheckCircle2 className="h-4 w-4 text-brand shrink-0 ml-2" />
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-semibold tabular-nums shrink-0 ml-2">
              +20 XP
            </span>
          )}
        </button>

        {/* 3. 1-Tap Prescribed Workout */}
        <button
          type="button"
          onClick={handleOneTapWorkout}
          disabled={workoutLogged}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] min-h-[44px] ${
            workoutLogged
              ? "border-success/30 bg-success/10 text-success cursor-default"
              : "border-border bg-secondary/40 hover:bg-secondary text-foreground cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              workoutLogged ? "bg-success/15 text-success" : "bg-card border border-border text-success"
            }`}>
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight truncate">
                {workoutLogged ? "Workout Logged" : "1-Tap Complete"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate tabular-nums">
                {workoutLogged ? "Earned bananas 🍌" : `Log ${prescriptionCount} prescribed lifts`}
              </p>
            </div>
          </div>
          {workoutLogged ? (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 ml-2" />
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-card border border-border text-success font-semibold tabular-nums shrink-0 ml-2">
              +40 XP
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
