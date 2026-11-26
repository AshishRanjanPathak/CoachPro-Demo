"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Edit3,
  ArrowRight,
  Plus,
  Sparkles,
  Sliders,
  BellRing,
  X,
} from "lucide-react";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { BonoboCompanionCard } from "@/components/companion/BonoboCompanionCard";
import { DailyMicroWin } from "@/components/companion/DailyMicroWin";
import { FlyingSnackOverlay } from "@/components/companion/FlyingSnackOverlay";
import { BonoboAssistantSheet } from "@/components/companion/BonoboAssistantSheet";
import {
  loadCompanionState,
  saveCompanionState,
  CompanionState,
  CompanionMode,
} from "@/lib/companion";
import {
  loadDismissedReminderIds,
  dismissReminderForToday,
  AthleteReminderId,
} from "@/lib/athleteReminders";
import { resolveActiveAthlete, resolveActiveSessionContext } from "@/lib/store";

interface AthleteHomeDashboardProps {
  onGoToTraining: () => void;
  onOpenMessages?: () => void;
}

export function AthleteHomeDashboard({
  onGoToTraining,
}: AthleteHomeDashboardProps) {
  const { state, currentUser, updateAthleteProfile } = useAuth();

  // Resolve active athlete and session/program safely
  const athlete = resolveActiveAthlete(state, currentUser?.id);
  const { session, program, prescriptions, plannedSets } = resolveActiveSessionContext(state);

  // Workout set calculations (folds CoachBuddy workout progress into Today's Session)
  const completedSets = session.sets.length;
  const remainingSets = Math.max(0, plannedSets - completedSets);
  const isCompleted = plannedSets > 0 && completedSets >= plannedSets;
  const isInProgress = completedSets > 0 && !isCompleted;

  // Modals & companion state
  const [editOpen, setEditOpen] = useState(false);
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [bonoboSheetOpen, setBonoboSheetOpen] = useState(false);
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [dismissedReminders, setDismissedReminders] = useState<AthleteReminderId[]>([]);
  const [tempWeight, setTempWeight] = useState<number>(athlete?.weightKg || 83.5);
  const [tempHeight, setTempHeight] = useState<number>(athlete?.heightCm || 178);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setDismissedReminders(loadDismissedReminderIds());
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<CompanionState>;
      if (custom.detail) setCompanion(custom.detail);
    };
    const handleDismissSync = (e: Event) => {
      const custom = e as CustomEvent<AthleteReminderId[]>;
      if (Array.isArray(custom.detail)) setDismissedReminders(custom.detail);
    };
    window.addEventListener("coachpro_bonobo_updated", handleUpdated);
    window.addEventListener("coachpro_reminders_updated", handleDismissSync);
    return () => {
      window.removeEventListener("coachpro_bonobo_updated", handleUpdated);
      window.removeEventListener("coachpro_reminders_updated", handleDismissSync);
    };
  }, []);

  const weightKg = athlete?.weightKg || 83.5;
  const weightLbs = Math.round(weightKg * 2.20462);
  const adherence = athlete?.adherencePercentage ?? 94;
  const streak = athlete?.currentStreakDays ?? 5;
  const totalWorkouts = athlete?.totalWorkoutsCompleted ?? 24;
  const readiness = athlete?.readinessScore ?? 9;

  const toggleCompanionMode = () => {
    const nextMode: CompanionMode =
      companion.mode === "gamified" ? "pro_minimalist" : "gamified";
    const updated = { ...companion, mode: nextMode };
    setCompanion(updated);
    saveCompanionState(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;
    updateAthleteProfile(athlete.id, {
      weightKg: tempWeight,
      heightCm: tempHeight,
      age: athlete.age,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditOpen(false);
    }, 650);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Global Interactive Flying Snack Physics Layer */}
      <FlyingSnackOverlay />

      {/* 1. Calm Editorial Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground heading-tight mt-0.5 truncate">
            Hey, {(athlete?.name || currentUser?.name || "Athlete").split(" ")[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleCompanionMode}
            className="h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground gap-1.5"
            title="Switch between Companion and Pro Minimalist layout"
          >
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{companion.mode === "gamified" ? "Pro View" : "Companion"}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setBonoboSheetOpen(true)}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ask Bonobo</span>
          </Button>
        </div>
      </header>

      {/* Post-Workout Unlogged Reminder Strip (dismissible, zero clutter) */}
      {!isCompleted &&
        ((completedSets === 0 && !dismissedReminders.includes("workout_unlogged")) ||
          (isInProgress && !dismissedReminders.includes("workout_unfinished"))) && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-warning/35 bg-warning/10 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <BellRing className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
              <p className="text-foreground font-medium leading-snug">
                {completedSets === 0
                  ? "You haven't logged today's workout yet — log your sets right after your session!"
                  : `${remainingSets} set${remainingSets === 1 ? "" : "s"} still unlogged — finish logging after your last rep so your streak counts.`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => setLoggerOpen(true)}
                className="h-8 px-3 text-[11px] font-semibold rounded-lg"
              >
                Log After Workout
              </Button>
              <button
                type="button"
                aria-label="Remind me later"
                onClick={() =>
                  setDismissedReminders(
                    dismissReminderForToday(
                      completedSets === 0 ? "workout_unlogged" : "workout_unfinished"
                    )
                  )
                }
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      {/* 2. Today's Session (Consolidated Mission + Progress + Launch) */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-semibold">
                Today&apos;s Session
              </span>
              <span className="text-border">•</span>
              <span className="text-xs text-muted-foreground truncate">
                {program?.title || session.programTitle || "Strength Program"}
              </span>
            </div>

            <Badge
              variant="outline"
              className={
                isCompleted
                  ? "text-[11px] font-medium shrink-0 border-success/30 bg-success/10 text-success"
                  : "text-[11px] font-medium shrink-0"
              }
            >
              {isCompleted
                ? "Completed"
                : isInProgress
                ? `${remainingSets} sets left`
                : "Ready to Train"}
            </Badge>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-foreground heading-tight">
              {session.dayName || "Strength & Power Session"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {prescriptions.length > 0
                ? `${prescriptions.length} exercises`
                : "Open session"}
            </p>
          </div>

          {plannedSets > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">
                  Session Progress
                </span>
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {completedSets} / {plannedSets} sets
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.round((completedSets / plannedSets) * 100))}
                className="h-1.5"
              />
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-0.5">
            <Button
              type="button"
              variant="default"
              onClick={onGoToTraining}
              className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2"
            >
              <span>
                {isCompleted
                  ? "Review Session"
                  : isInProgress
                  ? "Continue Workout"
                  : "Start Workout"}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setLoggerOpen(true)}
              className="h-11 px-4 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
              aria-label="Quick log workout set"
            >
              <Plus className="w-4 h-4 text-brand" aria-hidden="true" />
              <span>Quick Log</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Consolidated 4-Metric Strip (Zero Duplicated Stats, Instant Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl border border-border bg-card flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Readiness
          </span>
          <div className="text-xl font-bold text-foreground tabular-nums mt-1">
            {readiness}
            <span className="text-xs font-normal text-muted-foreground">/10</span>
          </div>
          <span className="text-[11px] text-success font-medium mt-0.5 truncate tabular-nums">
            {athlete?.sleepHours || 7.5}h sleep
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Streak
          </span>
          <div className="text-xl font-bold text-foreground tabular-nums mt-1">
            {streak}
            <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 truncate tabular-nums">
            {totalWorkouts} sessions
          </span>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/40 text-left flex flex-col justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer"
          aria-label="Update body measurements"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between w-full">
            <span>Weight</span>
            <Edit3 className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="text-xl font-bold text-foreground tabular-nums mt-1">
            {weightKg}
            <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 truncate tabular-nums">
            ~{weightLbs} lbs
          </span>
        </button>

        <div className="p-3.5 rounded-2xl border border-border bg-card flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Adherence
          </span>
          <div className="text-xl font-bold text-foreground tabular-nums mt-1">
            {adherence}
            <span className="text-xs font-normal text-muted-foreground">%</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate tabular-nums">
            {athlete?.recentPrCount ?? 3} PRs
          </span>
        </div>
      </div>

      {/* 4. Companion Zone (Compact Pro View bar vs Full Bonobo card) */}
      {companion.mode === "gamified" ? (
        <div className="space-y-3">
          <BonoboCompanionCard onOpenAssistant={() => setBonoboSheetOpen(true)} />
          <DailyMicroWin />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Pro View
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBonoboSheetOpen(true)}
            className="h-9 px-3 text-xs shrink-0 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Ask Bonobo</span>
          </Button>
        </div>
      )}

      {/* Measurements Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold heading-tight">
              Update Body Measurements
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Keep your current weight and height synchronized with your coach.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="weight-input"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between"
              >
                <span>Body Weight (kg)</span>
                <span className="font-mono text-foreground tabular-nums">
                  {Math.round(tempWeight * 2.20462)} lbs
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTempWeight((w) =>
                      Math.max(30, Math.round((w - 0.5) * 10) / 10)
                    )
                  }
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                >
                  -0.5
                </Button>
                <Input
                  id="weight-input"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={tempWeight}
                  onChange={(e) =>
                    setTempWeight(parseFloat(e.target.value) || 0)
                  }
                  className="text-center font-bold text-lg h-11 bg-card tabular-nums"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTempWeight((w) => Math.round((w + 0.5) * 10) / 10)
                  }
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                >
                  +0.5
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="height-input"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Height (cm)
              </label>
              <Input
                id="height-input"
                type="number"
                inputMode="numeric"
                value={tempHeight}
                onChange={(e) => setTempHeight(parseInt(e.target.value) || 0)}
                className="text-center font-bold text-lg h-11 bg-card tabular-nums"
              />
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-none bg-transparent border-t border-border pt-3 px-0 pb-0">
              <div className="flex items-center justify-end gap-2 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditOpen(false)}
                  className="h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className="h-10 text-xs font-semibold px-5"
                >
                  {savedSuccess ? "Saved!" : "Save Measurements"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accessible Quick Workout Logger Modal */}
      <WorkoutLoggerModal open={loggerOpen} onOpenChange={setLoggerOpen} />

      {/* Interactive Bonobo AI Assistant Bottom Sheet */}
      <Dialog open={bonoboSheetOpen} onOpenChange={setBonoboSheetOpen}>
        <DialogContent showCloseButton={false} className="p-0 border-0 bg-transparent sm:max-w-xl ring-0">
          <BonoboAssistantSheet onClose={() => setBonoboSheetOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
