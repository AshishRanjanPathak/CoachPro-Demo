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
  MessageSquare,
  Plus,
  Sparkles,
  Sliders,
} from "lucide-react";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { BonoboCompanionCard } from "@/components/companion/BonoboCompanionCard";
import { DailyMicroWin } from "@/components/companion/DailyMicroWin";
import { DailyNudgeCard } from "@/components/companion/DailyNudgeCard";
import { FlyingSnackOverlay } from "@/components/companion/FlyingSnackOverlay";
import { BonoboAssistantSheet } from "@/components/companion/BonoboAssistantSheet";
import {
  loadCompanionState,
  saveCompanionState,
  CompanionState,
  CompanionMode,
} from "@/lib/companion";

interface AthleteHomeDashboardProps {
  onGoToTraining: () => void;
  onOpenMessages?: () => void;
}

export function AthleteHomeDashboard({
  onGoToTraining,
  onOpenMessages,
}: AthleteHomeDashboardProps) {
  const { state, currentUser, updateAthleteProfile } = useAuth();

  // Find active athlete
  const athlete =
    state.athletes.find((a) => a.id === currentUser.id) ||
    state.athletes.find((a) => a.id === "usr-athlete-1") ||
    state.athletes[0];
  const session = state.activeSession;
  const program =
    state.programs.find((p) => p.id === session.programId) || state.programs[0];
  const currentDay =
    program.days.find((d) => d.dayNumber === session.dayNumber) || program.days[0];

  // Workout set calculations (folds CoachBuddy workout progress into Today's Session)
  const plannedSets = currentDay
    ? currentDay.prescriptions.reduce((acc, rx) => acc + rx.sets, 0)
    : 0;
  const completedSets = session.sets ? session.sets.length : 0;
  const remainingSets = Math.max(0, plannedSets - completedSets);
  const isCompleted = plannedSets > 0 && completedSets >= plannedSets;
  const isInProgress = completedSets > 0 && !isCompleted;

  // Modals & companion state
  const [editOpen, setEditOpen] = useState(false);
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [bonoboSheetOpen, setBonoboSheetOpen] = useState(false);
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [tempWeight, setTempWeight] = useState<number>(athlete.weightKg || 83.5);
  const [tempHeight, setTempHeight] = useState<number>(athlete.heightCm || 178);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<CompanionState>;
      if (custom.detail) setCompanion(custom.detail);
    };
    window.addEventListener("coachpro_bonobo_updated", handleUpdated);
    return () =>
      window.removeEventListener("coachpro_bonobo_updated", handleUpdated);
  }, []);

  const weightKg = athlete.weightKg || 83.5;
  const weightLbs = Math.round(weightKg * 2.20462);
  const adherence = athlete.adherencePercentage || 94;
  const streak = athlete.currentStreakDays || 5;
  const totalWorkouts = athlete.totalWorkoutsCompleted || 24;
  const readiness = athlete.readinessScore || 9;

  const toggleCompanionMode = () => {
    const nextMode: CompanionMode =
      companion.mode === "gamified" ? "pro_minimalist" : "gamified";
    const updated = { ...companion, mode: nextMode };
    setCompanion(updated);
    saveCompanionState(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
            Hey, {athlete.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Coach: <span className="text-foreground font-medium">{athlete.assignedCoachName || "Sarah Jenkins, CSCS"}</span>
            {athlete.squad ? ` • ${athlete.squad}` : ""}
          </p>
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
            variant="brand"
            size="sm"
            onClick={() => setBonoboSheetOpen(true)}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ask Bonobo</span>
          </Button>
        </div>
      </header>

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
                {program.title}
              </span>
            </div>

            <Badge
              variant={isCompleted ? "success" : "outline"}
              className="text-[11px] font-medium shrink-0"
            >
              {isCompleted
                ? "Completed"
                : isInProgress
                ? `${remainingSets} sets left`
                : "Ready to Train"}
            </Badge>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-foreground heading-tight">
              {session.dayName || "Strength & Power Session"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentDay?.prescriptions.length || 6} exercises prescribed • Goal:{" "}
              <span className="text-foreground font-medium">{athlete.trainingGoal}</span>
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
              <Progress value={completedSets} max={plannedSets} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-0.5">
            <Button
              type="button"
              variant="brand"
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
            {athlete.sleepHours || 7.5}h sleep
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
            {totalWorkouts} sessions logged
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
            ~{weightLbs} lbs • Tap to edit
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
          <span className="text-[11px] text-brand font-medium mt-0.5 truncate tabular-nums">
            {athlete.recentPrCount || 3} Recent PRs 🏆
          </span>
        </div>
      </div>

      {/* 4. Companion Zone (Full Bonobo engine in Companion mode, lightweight bar in Pro mode) */}
      {companion.mode === "gamified" ? (
        <div className="space-y-3">
          <DailyNudgeCard />
          <BonoboCompanionCard onOpenAssistant={() => setBonoboSheetOpen(true)} />
          <DailyMicroWin />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">
              Minimalist Pro Mode Active
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              Pure training metrics with Bonobo AI voice logging ready on demand.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBonoboSheetOpen(true)}
            className="h-9 px-3 text-xs shrink-0 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Voice AI</span>
          </Button>
        </div>
      )}

      {/* 5. Compact Athlete & Coach Footer Bar */}
      <div className="bg-card border border-border rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 content-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={
                athlete.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              }
              alt={athlete.name}
              loading="lazy"
              decoding="async"
              className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
            />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card"
              title="Active Status"
              aria-label="Active Status"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">
                {athlete.name}
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                {athlete.experienceLevel || "Intermediate"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate tabular-nums">
              {athlete.heightCm || 178} cm • {weightKg} kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="text-xs h-9 px-3 gap-1.5"
            aria-label="Update body measurements"
          >
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <span>Measurements</span>
          </Button>

          {onOpenMessages && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMessages}
              className="text-xs h-9 px-3 gap-1.5"
              aria-label="Message coach"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
              <span>Coach Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Measurements Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold heading-tight">
            Update Body Measurements
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Keep your current weight and height synchronized with your coach.
          </DialogDescription>
        </DialogHeader>

        <DialogContent>
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

            <DialogFooter className="pt-3">
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
                  variant="brand"
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
        <DialogContent className="p-0 border-0 bg-transparent max-w-xl">
          <BonoboAssistantSheet onClose={() => setBonoboSheetOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
