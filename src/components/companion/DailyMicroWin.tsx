"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Droplets, Moon, CheckCircle2, Zap, Sparkles } from "lucide-react";
import { soundController } from "@/lib/audio";
import { addCompanionXp, loadCompanionState, saveCompanionState } from "@/lib/companion";
import { useAuth } from "@/domains/auth/AuthContext";

export function DailyMicroWin() {
  const { state, addWorkoutSets, addCheckIn } = useAuth();
  const [companion, setCompanion] = useState(loadCompanionState);
  const [workoutLogged, setWorkoutLogged] = useState(false);
  const [restDayConfirmed, setRestDayConfirmed] = useState(false);

  // Today's prescribed workout
  const session = state.activeSession;
  const program = state.programs.find((p) => p.id === session.programId) || state.programs[0];
  const currentDay = program?.days[0];
  const prescriptionCount = currentDay?.prescriptions?.length || 0;

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
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });

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
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    // Prepare sets from coach prescriptions
    const setsToLog = currentDay.prescriptions.map((rx, idx) => ({
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
    <div className="rounded-3xl border border-white/5 bg-neutral-900/40 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Daily 3-Second Micro Wins</span>
        </h4>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Tap once for instant reward
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Hydrate */}
        <button
          type="button"
          onClick={handleHydrate}
          disabled={companion.hasHydratedToday}
          className={`group flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
            companion.hasHydratedToday
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 cursor-default"
              : "border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer hover:border-cyan-500/30 hover:scale-[1.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              companion.hasHydratedToday ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-cyan-400 group-hover:bg-cyan-500/20"
            }`}>
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {companion.hasHydratedToday ? "Hydrated!" : "Drink Water"}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {companion.hasHydratedToday ? `${companion.waterStreakDays}-Day Streak 🔥` : "Tap to hydrate Bonobo"}
              </p>
            </div>
          </div>
          {companion.hasHydratedToday ? (
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 font-bold">
              +15 XP
            </span>
          )}
        </button>

        {/* 2. Rest Day Confirmation */}
        <button
          type="button"
          onClick={handleRestDay}
          disabled={restDayConfirmed}
          className={`group flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
            restDayConfirmed
              ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 cursor-default"
              : "border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer hover:border-indigo-500/30 hover:scale-[1.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              restDayConfirmed ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-indigo-400 group-hover:bg-indigo-500/20"
            }`}>
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {restDayConfirmed ? "Resting Well" : "Rest Day Pass"}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {restDayConfirmed ? "Tucked Bonobo in 🛌" : "Tap if taking today off"}
              </p>
            </div>
          </div>
          {restDayConfirmed ? (
            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-indigo-300 font-bold">
              +20 XP
            </span>
          )}
        </button>

        {/* 3. 1-Tap Prescribed Workout */}
        <button
          type="button"
          onClick={handleOneTapWorkout}
          disabled={workoutLogged}
          className={`group flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
            workoutLogged
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default"
              : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-white cursor-pointer hover:border-emerald-500/50 hover:scale-[1.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              workoutLogged ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/30"
            }`}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {workoutLogged ? "Workout Logged!" : "1-Tap 'Crushed It!'"}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {workoutLogged ? "Fed 3 snacks 🍌" : `Auto-log today's ${prescriptionCount} lifts`}
              </p>
            </div>
          </div>
          {workoutLogged ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
              +40 XP
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
