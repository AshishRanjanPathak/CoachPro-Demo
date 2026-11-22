"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  Timer,
  Zap,
  RotateCcw,
  Search,
  Check,
  Flame,
  Info,
  Clock,
  Activity,
  Layers,
  ChevronRight,
  X,
  Eye
} from "lucide-react";
import confetti from "canvas-confetti";
import { Exercise, ExercisePrescription, WorkoutSet } from "@/types";
import { getExerciseIndex, resolveExerciseThumbnail } from "@/lib/exercises";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import { addCompanionXp } from "@/lib/companion";

export interface WorkoutLoggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialExerciseId?: string;
  initialMode?: "quick_set" | "batch";
}

interface SetCustomization {
  setNumber: number;
  weight: number;
  reps: number;
  minutes?: number;
  distanceKm?: number;
}

export function WorkoutLoggerModal({
  open,
  onOpenChange,
  initialExerciseId,
  initialMode = "batch"
}: WorkoutLoggerModalProps) {
  const { state, addWorkoutSets, removeWorkoutSets, completeWorkoutSession } = useAuth();
  const session = state.activeSession;
  const program = state.programs.find(p => p.id === session.programId) || state.programs[0];
  const currentDay = program.days.find(d => d.dayNumber === session.dayNumber) || program.days[0];
  const prescriptions = currentDay?.prescriptions || [];
  const exercises = state.exercises || [];
  const repDbIndex = React.useMemo(() => getExerciseIndex(), []);

  // Active Mode: 'quick_set' (fast single-set logging for individual card) or 'batch' (guided wizard)
  const [mode, setMode] = useState<"quick_set" | "batch">(initialMode);

  // Wizard Steps in batch mode:
  // 1 = Select Exercise
  // 2 = Weight
  // 3 = Repetitions / Duration / Distance
  // 4 = Number of Sets
  // 5 = Review and Confirm
  // 6 = Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Selected exercise state
  const [selectedExId, setSelectedExId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showTechniqueGuide, setShowTechniqueGuide] = useState(false);

  // Logging values
  const [weight, setWeight] = useState<number>(0);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [isWeightSkipped, setIsWeightSkipped] = useState<boolean>(false);
  const [reps, setReps] = useState<number>(10);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(1.0);
  const [setsCount, setSetsCount] = useState<number>(3);
  const [rpe, setRpe] = useState<number>(8);

  // Advanced set customization
  const [isCustomizingSets, setIsCustomizingSets] = useState(false);
  const [customSets, setCustomSets] = useState<SetCustomization[]>([]);

  // Submission & feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLoggedSetIds, setLastLoggedSetIds] = useState<string[]>([]);
  const [lastLoggedSummary, setLastLoggedSummary] = useState<{
    exerciseName: string;
    weight: number;
    reps: number;
    sets: number;
    minutes?: number;
    isBodyweight?: boolean;
    isTimed?: boolean;
  } | null>(null);
  const [isPrAchieved, setIsPrAchieved] = useState(false);
  const [undoStatusMessage, setUndoStatusMessage] = useState<string | null>(null);

  // Accessible unique IDs
  const searchInputId = useId();
  const weightInputId = useId();
  const repsInputId = useId();
  const setsInputId = useId();
  const durationInputId = useId();

  // Find active prescription and exercise object
  const activeRx: ExercisePrescription | undefined = prescriptions.find(p => p.exerciseId === selectedExId);
  const activeExercise =
    exercises.find(e => e.id === selectedExId) ||
    repDbIndex.find(e => e.id === selectedExId);

  // Determine exercise characteristics
  const exerciseName = activeRx?.exerciseName || activeExercise?.name || customExerciseName || "Exercise";
  const category = activeExercise?.category || "barbell";
  const trackingMethod = activeExercise?.trackingMethod || "weight_reps";
  const currentExerciseThumb = resolveExerciseThumbnail(selectedExId, exerciseName);

  const isTimedExercise = Boolean(
    trackingMethod === "isometric" ||
    category === "cardio" ||
    trackingMethod === "distance_duration" ||
    exerciseName.toLowerCase().includes("plank") ||
    exerciseName.toLowerCase().includes("run") ||
    exerciseName.toLowerCase().includes("treadmill") ||
    exerciseName.toLowerCase().includes("cycle") ||
    (activeRx?.repTarget && activeRx.repTarget.toLowerCase().includes("min"))
  );

  const isPureBodyweight =
    category === "bodyweight" &&
    trackingMethod === "bodyweight_reps" &&
    !exerciseName.toLowerCase().includes("weighted") &&
    !exerciseName.toLowerCase().includes("dip") &&
    !exerciseName.toLowerCase().includes("pull-up");

  const isWeightedBodyweight =
    category === "bodyweight" &&
    (exerciseName.toLowerCase().includes("weighted") ||
      exerciseName.toLowerCase().includes("dip") ||
      exerciseName.toLowerCase().includes("pull-up"));

  const isCardio =
    category === "cardio" ||
    trackingMethod === "distance_duration" ||
    exerciseName.toLowerCase().includes("treadmill") ||
    exerciseName.toLowerCase().includes("cycling") ||
    exerciseName.toLowerCase().includes("walking");

  const isDumbbell = category === "dumbbell" || exerciseName.toLowerCase().includes("dumbbell");

  // Determine completed sets for this exercise
  const loggedSetsForExercise = session.sets.filter(s => s.exerciseId === selectedExId);
  const nextSetNumber = loggedSetsForExercise.length + 1;

  // Total session progress
  const totalPrescribedSets = prescriptions.reduce((acc, rx) => acc + rx.sets, 0);
  const totalCompletedSets = session.sets.length;
  const progressPercent = totalPrescribedSets > 0 ? Math.min(100, Math.round((totalCompletedSets / totalPrescribedSets) * 100)) : 0;

  // Initialize or reset wizard when modal opens or initialExerciseId changes
  useEffect(() => {
    if (!open) {
      setUndoStatusMessage(null);
      setIsSubmitting(false);
      return;
    }

    const targetExId = initialExerciseId || (prescriptions[0]?.exerciseId ?? exercises[0]?.id ?? "");
    setSelectedExId(targetExId);
    setSearchQuery("");
    setIsCustomMode(false);
    setCustomExerciseName("");
    setUndoStatusMessage(null);
    setIsCustomizingSets(false);

    if (initialExerciseId) {
      // Entry Point A: From an individual exercise card
      setMode(initialMode || "quick_set");
      loadSmartDefaults(targetExId);
      // If batch mode was explicitly asked, jump to Step 2 (or 3 for bodyweight)
      if (initialMode === "batch") {
        const ex = exercises.find(e => e.id === targetExId);
        const skipWeight =
          ex?.category === "bodyweight" &&
          !ex.name.toLowerCase().includes("weighted") &&
          !ex.name.toLowerCase().includes("pull") &&
          !ex.name.toLowerCase().includes("dip");
        setStep(skipWeight ? 3 : 2);
      } else {
        setStep(1);
      }
    } else {
      // Entry Point B: General Quick Log
      setMode("batch");
      setStep(1);
      loadSmartDefaults(targetExId);
    }
  }, [open, initialExerciseId, initialMode]);

  // Smart defaults and memory resolver
  const loadSmartDefaults = (exerciseId: string) => {
    const rx = prescriptions.find(p => p.exerciseId === exerciseId);
    const ex = exercises.find(e => e.id === exerciseId) || repDbIndex.find(e => e.id === exerciseId);
    const exerciseLogs = session.sets.filter(s => s.exerciseId === exerciseId);
    const lastLog = exerciseLogs[exerciseLogs.length - 1];

    // Priority 1: Current workout prescription
    // Priority 2: Most recent valid performance for that exercise
    // Priority 3: Sensible empty / standard defaults
    let defWeight = 0;
    let defReps = 10;
    let defSets = 3;
    let defMins = 1;
    let defDist = 1.0;
    let defRpe = rx?.targetRpe || 8;

    // Retrieve local storage fallback memory if exists
    let memoryData: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`coachpro_mem_${exerciseId}`);
        if (raw) memoryData = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (rx) {
      defWeight = rx.targetLoadKg ?? 0;
      const parsedReps = parseInt(String(rx.repTarget).split("-")[0]);
      defReps = isNaN(parsedReps) ? 10 : parsedReps;
      defSets = Math.max(1, rx.sets - exerciseLogs.length);
      defMins = rx.targetDurationMinutes || 10;
    } else if (lastLog) {
      defWeight = lastLog.completedWeightKg || 0;
      defReps = lastLog.completedReps || 10;
      defSets = 3;
      defMins = lastLog.completedMinutes || 10;
      defDist = lastLog.completedDistanceKm || 1.0;
      defRpe = lastLog.rpe || 8;
    } else if (memoryData) {
      defWeight = memoryData.weight || 0;
      defReps = memoryData.reps || 10;
      defSets = memoryData.sets || 3;
      defMins = memoryData.minutes || 10;
      defDist = memoryData.distanceKm || 1.0;
    } else {
      // Sensible default by category
      if (ex?.category === "barbell") defWeight = 40;
      else if (ex?.category === "dumbbell") defWeight = 12;
      else if (ex?.category === "machine") defWeight = 30;
      else defWeight = 0;
    }

    setWeight(defWeight);
    setReps(defReps);
    setSetsCount(defSets);
    setMinutes(defMins);
    setSeconds(0);
    setDistanceKm(defDist);
    setRpe(defRpe);
    setIsWeightSkipped(ex?.category === "bodyweight" && !isWeightedBodyweight);
  };

  // When setsCount changes, sync the customSets preview
  useEffect(() => {
    setCustomSets(
      Array.from({ length: setsCount }, (_, i) => ({
        setNumber: nextSetNumber + i,
        weight: weight,
        reps: reps,
        minutes: minutes,
        distanceKm: distanceKm
      }))
    );
  }, [setsCount, weight, reps, minutes, distanceKm, nextSetNumber]);

  // Handle selecting an exercise in Step 1
  const handleSelectExercise = (exId: string) => {
    setSelectedExId(exId);
    setIsCustomMode(false);
    loadSmartDefaults(exId);

    const ex = exercises.find(e => e.id === exId) || repDbIndex.find(e => e.id === exId);
    const skipWeight =
      ex?.category === "bodyweight" &&
      !ex.name.toLowerCase().includes("weighted") &&
      !ex.name.toLowerCase().includes("pull") &&
      !ex.name.toLowerCase().includes("dip");

    // Automatically navigate to weight or reps
    setStep(skipWeight ? 3 : 2);
  };

  const handleSelectCustomExercise = () => {
    if (!customExerciseName.trim()) return;
    setIsCustomMode(true);
    setSelectedExId("custom-" + Date.now());
    setStep(2);
  };

  // Convert kg to display unit if needed
  const displayWeight = weightUnit === "lbs" ? Math.round(weight * 2.20462 * 10) / 10 : weight;

  const handleWeightChange = (newValKg: number) => {
    const safeVal = Math.max(0, Math.round(newValKg * 10) / 10);
    setWeight(safeVal);
    setIsWeightSkipped(false);
  };

  const handleDisplayWeightInput = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setWeight(0);
      return;
    }
    if (weightUnit === "lbs") {
      setWeight(Math.max(0, Math.round((num / 2.20462) * 10) / 10));
    } else {
      setWeight(Math.max(0, Math.round(num * 10) / 10));
    }
  };

  // Save / Commit execution (works for both Single-Set Quick Mode and Batch Mode)
  const handleCommitLogs = (countToLog: number) => {
    if (isSubmitting) return; // Prevent duplicate submission
    setIsSubmitting(true);

    try {
      const setsToRecord: Omit<WorkoutSet, "id" | "completedAt">[] = [];
      const currentNextSet = loggedSetsForExercise.length + 1;

      // PR detection logic: if lifting heavier than prescribed or personal record
      const isPr: boolean = Boolean(
        (category === "barbell" && weight >= 142.5) ||
        (activeRx?.targetLoadKg !== undefined && weight > activeRx.targetLoadKg)
      );
      setIsPrAchieved(isPr);

      if (isCustomizingSets && customSets.length > 0) {
        // Individualized sets
        customSets.forEach((cSet, idx) => {
          setsToRecord.push({
            exerciseId: selectedExId,
            exerciseName: exerciseName,
            setNumber: currentNextSet + idx,
            prescribedWeightKg: activeRx?.targetLoadKg,
            prescribedReps: activeRx?.repTarget,
            prescribedMinutes: activeRx?.targetDurationMinutes,
            completedWeightKg: isWeightSkipped ? 0 : Math.max(0, cSet.weight),
            completedReps: Math.max(0, cSet.reps),
            completedMinutes: isTimedExercise ? cSet.minutes : undefined,
            completedDistanceKm: isCardio ? cSet.distanceKm : undefined,
            isBodyweightOnly: isWeightSkipped || isPureBodyweight,
            rpe,
            isPr: idx === customSets.length - 1 ? isPr : false
          });
        });
      } else {
        // Standard uniform batch or single set
        for (let i = 0; i < countToLog; i++) {
          setsToRecord.push({
            exerciseId: selectedExId,
            exerciseName: exerciseName,
            setNumber: currentNextSet + i,
            prescribedWeightKg: activeRx?.targetLoadKg,
            prescribedReps: activeRx?.repTarget,
            prescribedMinutes: activeRx?.targetDurationMinutes,
            completedWeightKg: isWeightSkipped ? 0 : Math.max(0, weight),
            completedReps: Math.max(0, reps),
            completedMinutes: isTimedExercise ? minutes + seconds / 60 : undefined,
            completedDistanceKm: isCardio ? distanceKm : undefined,
            isBodyweightOnly: isWeightSkipped || isPureBodyweight,
            rpe,
            isPr: i === countToLog - 1 ? isPr : false
          });
        }
      }

      // Persist memory for smart defaults in future sessions
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `coachpro_mem_${selectedExId}`,
            JSON.stringify({
              weight: isWeightSkipped ? 0 : weight,
              reps,
              sets: countToLog,
              minutes,
              distanceKm
            })
          );
        } catch {
          // ignore storage error
        }
      }

      // Save to store via AuthContext
      const createdIds = addWorkoutSets(setsToRecord);
      setLastLoggedSetIds(createdIds);
      addCompanionXp(25 * countToLog, `Logged ${countToLog} set(s)`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("coachpro_fly_snack", { detail: { emoji: "🍌" } }));
      }
      setLastLoggedSummary({
        exerciseName,
        weight: isWeightSkipped ? 0 : weight,
        reps,
        sets: countToLog,
        minutes: isTimedExercise ? minutes : undefined,
        isBodyweight: isWeightSkipped || isPureBodyweight,
        isTimed: isTimedExercise
      });

      if (isPr) {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
      }

      // Move to Step 6: Success Confirmation
      setStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Undo functionality
  const handleUndoLogging = () => {
    if (lastLoggedSetIds.length === 0) return;
    removeWorkoutSets(lastLoggedSetIds);
    setLastLoggedSetIds([]);
    setUndoStatusMessage(`Reversed logging for ${lastLoggedSummary?.sets || 1} set(s) of ${lastLoggedSummary?.exerciseName}.`);
  };

  // Filter exercises for Step 1 across 708 RepDB exercises and CoachPRO library
  const filteredExercises = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return repDbIndex.slice(0, 18);
    }
    return repDbIndex
      .filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          (e.nameDe && e.nameDe.toLowerCase().includes(q)) ||
          (e.nameEs && e.nameEs.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          e.equipment.toLowerCase().includes(q) ||
          e.primaryMuscle.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [searchQuery, repDbIndex]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="border-b border-border/80 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="brand" className="text-xs font-semibold px-2.5 py-0.5">
              {mode === "quick_set" ? "Quick Set Logger" : "Guided Logging Wizard"}
            </Badge>
            {mode === "batch" && step < 6 && (
              <span className="text-xs font-medium text-muted-foreground font-mono" aria-live="polite">
                Step {step} of 5
              </span>
            )}
          </div>

          {/* Mode Switcher */}
          {step < 6 && (
            <button
              type="button"
              onClick={() => {
                if (mode === "quick_set") {
                  setMode("batch");
                  setStep(2);
                } else {
                  setMode("quick_set");
                }
              }}
              className="text-xs text-brand hover:underline font-medium cursor-pointer min-h-[44px] flex items-center px-1"
            >
              {mode === "quick_set" ? "Switch to Multi-Set Wizard" : "Quick Single-Set Mode"}
            </button>
          )}
        </div>

        <DialogTitle className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground text-left">
          {mode === "quick_set" && (step === 6 ? "Set Recorded Successfully!" : `Log Set ${nextSetNumber} of ${activeRx?.sets || 4}`)}
          {mode === "batch" && (
            <>
              {step === 1 && "What exercise did you do?"}
              {step === 2 && "How much weight did you use?"}
              {step === 3 && (isTimedExercise ? "How long did you perform this?" : isCardio ? "What distance and time did you complete?" : "How many reps did you complete?")}
              {step === 4 && "How many sets did you complete?"}
              {step === 5 && "Review and Confirm"}
              {step === 6 && "Exercise Logged Successfully!"}
            </>
          )}
        </DialogTitle>

        <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left">
          {mode === "quick_set" && (step === 6 ? "Your set has been saved to your training ledger." : `Confirm or adjust load for ${exerciseName}. Prescribed: ${activeRx?.targetLoadKg || 0}kg × ${activeRx?.repTarget || "5"} reps.`)}
          {mode === "batch" && (
            <>
              {step === 1 && "Select the movement from your prescribed list or library below."}
              {step === 2 && (isDumbbell ? "Enter the weight per dumbbell in each hand." : isWeightedBodyweight ? "Enter any added external weight (vest/belt)." : "Enter the total load lifted.")}
              {step === 3 && (isTimedExercise ? "Enter duration in minutes and seconds." : isCardio ? "Enter completed duration and distance." : "Count only completed, full-range repetitions.")}
              {step === 4 && "Enter the number of completed sets. Default uses the same weight and reps."}
              {step === 5 && "Check the summary below before saving to your training ledger."}
              {step === 6 && "Your training ledger and session progress have been updated."}
            </>
          )}
        </DialogDescription>

        {/* 5-Step Visual Progress Bar */}
        {mode === "batch" && step < 6 && (
          <div
            className="flex items-center gap-1.5 mt-2.5 pt-1"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={5}
            aria-label={`Step ${step} of 5`}
          >
            {[
              { s: 1, label: "Exercise" },
              { s: 2, label: "Weight" },
              { s: 3, label: "Reps" },
              { s: 4, label: "Sets" },
              { s: 5, label: "Confirm" }
            ].map(({ s, label }) => {
              const isPassed = step > s;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex-1 space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-brand ring-2 ring-brand/40 shadow-xs"
                        : isPassed
                        ? "bg-emerald-500"
                        : "bg-secondary"
                    }`}
                  />
                  <span
                    className={`text-[10px] hidden sm:block truncate ${
                      isCurrent
                        ? "font-bold text-brand"
                        : isPassed
                        ? "text-emerald-400 font-medium"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </DialogHeader>

      <DialogContent className="max-h-[85vh] overflow-y-auto px-4 sm:px-6 py-4">
        {/* ========================================================================= */}
        {/* SUCCESS CONFIRMATION & UNDO (STEP 6) */}
        {/* ========================================================================= */}
        {step === 6 ? (
          <div className="py-6 space-y-6 text-center" aria-live="polite">
            <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto motion-safe:animate-bounce">
              <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                {lastLoggedSummary?.sets && lastLoggedSummary.sets > 1
                  ? `${lastLoggedSummary.sets} Sets Logged Successfully!`
                  : "Set Logged Successfully!"}
              </h3>
              <p className="text-sm font-semibold text-brand">
                {lastLoggedSummary?.exerciseName}
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border text-sm font-mono mt-1">
                {lastLoggedSummary?.isBodyweight ? (
                  <Badge variant="outline" className="text-xs">Bodyweight</Badge>
                ) : (
                  <span className="font-bold text-foreground">
                    {lastLoggedSummary?.weight} kg
                  </span>
                )}
                <span>×</span>
                {lastLoggedSummary?.isTimed ? (
                  <span className="font-bold text-foreground">
                    {lastLoggedSummary?.minutes} min
                  </span>
                ) : (
                  <span className="font-bold text-foreground">
                    {lastLoggedSummary?.reps} reps
                  </span>
                )}
                <span>•</span>
                <span className="text-brand font-bold">
                  {lastLoggedSummary?.sets} set{lastLoggedSummary && lastLoggedSummary.sets > 1 ? "s" : ""}
                </span>
              </div>

              {/* Bonobo Snack Reward Badge */}
              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <span>🍌</span>
                  <span>Bonobo enjoyed a snack & gained +{(lastLoggedSummary?.sets || 1) * 25} XP!</span>
                </div>
              </div>
            </div>

            {/* Session Progress Update Banner */}
            <div className="p-4 rounded-xl bg-card border border-border text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>Updated Session Progress</span>
                <span className="font-bold text-foreground tabular-nums">
                  {totalCompletedSets} / {totalPrescribedSets} sets ({progressPercent}%)
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={totalCompletedSets}
                aria-valuemin={0}
                aria-valuemax={totalPrescribedSets}
                aria-label="Updated workout progress"
                className="w-full h-3 bg-secondary rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Undo notice if triggered */}
            {undoStatusMessage && (
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs font-medium max-w-md mx-auto">
                {undoStatusMessage}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
              <Button
                type="button"
                variant="brand"
                onClick={() => {
                  setStep(mode === "quick_set" ? 1 : 1);
                  onOpenChange(false);
                }}
                className="font-bold text-sm min-h-[52px] rounded-xl cursor-pointer shadow-xs flex-1"
              >
                Continue Workout
              </Button>

              {lastLoggedSetIds.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUndoLogging}
                  className="font-semibold text-xs min-h-[52px] rounded-xl cursor-pointer border-border hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Undo Logging
                </Button>
              )}
            </div>
          </div>
        ) : mode === "quick_set" ? (
          /* ========================================================================= */
          /* QUICK SET LOGGING MODE (ENTRY POINT A — 1-CLICK RAPID SET LOGGING) */
          /* ========================================================================= */
          <div className="space-y-6 py-2">
            {/* Quick Context Pill with Exercise Photo & Poses trigger */}
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowTechniqueGuide(true)}
                  className="w-12 h-12 rounded-xl bg-card border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand"
                  title="View 2-pose movement demonstration & form guide"
                  aria-label={`Inspect technique and 2-pose demonstration for ${exerciseName}`}
                >
                  {currentExerciseThumb ? (
                    <img
                      src={currentExerciseThumb}
                      alt={exerciseName}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Dumbbell className="w-5 h-5" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  </div>
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-foreground truncate">
                      {exerciseName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTechniqueGuide(true)}
                      className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-1 cursor-pointer bg-brand/5 hover:bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md"
                      title="Inspect start and peak poses"
                    >
                      <Eye className="w-3 h-3 text-brand" aria-hidden="true" />
                      <span>Poses & Guide</span>
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground block mt-0.5 capitalize truncate">
                    {category} • {activeExercise?.primaryMuscle || "core"}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 shrink-0">
                Set {nextSetNumber} of {activeRx?.sets || 4}
              </Badge>
            </div>

            {/* Quick Weight Stepper (if applicable) */}
            {!isPureBodyweight && !isTimedExercise && (
              <div className="space-y-2 text-center">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Weight ({weightUnit.toUpperCase()})</span>
                  <button
                    type="button"
                    onClick={() => setWeightUnit(u => (u === "kg" ? "lbs" : "kg"))}
                    className="text-brand hover:underline font-semibold cursor-pointer"
                  >
                    Switch to {weightUnit === "kg" ? "LBS" : "KG"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Decrease weight by 5"
                    onClick={() => handleWeightChange(weight - 5)}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    -5
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Decrease weight by 2.5"
                    onClick={() => handleWeightChange(weight - 2.5)}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    -2.5
                  </Button>

                  <div className="relative">
                    <Input
                      id={weightInputId}
                      type="number"
                      step="0.5"
                      inputMode="decimal"
                      enterKeyHint="next"
                      value={displayWeight}
                      onChange={(e) => handleDisplayWeightInput(e.target.value)}
                      className="text-center font-extrabold text-3xl tabular-nums h-16 w-36 bg-card rounded-xl border-border"
                      aria-label={`Weight in ${weightUnit}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                      {weightUnit.toUpperCase()}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Increase weight by 2.5"
                    onClick={() => handleWeightChange(weight + 2.5)}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    +2.5
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Increase weight by 5"
                    onClick={() => handleWeightChange(weight + 5)}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    +5
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Reps Stepper */}
            {!isTimedExercise && (
              <div className="space-y-2 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Repetitions Completed:
                </span>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Decrease reps by 1"
                    onClick={() => setReps(r => Math.max(0, r - 1))}
                    className="h-13 w-13 font-bold text-lg rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    <Minus className="w-5 h-5" aria-hidden="true" />
                  </Button>

                  <div className="relative">
                    <Input
                      id={repsInputId}
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      enterKeyHint="done"
                      value={reps}
                      onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center font-extrabold text-3xl tabular-nums h-16 w-32 bg-card rounded-xl border-border"
                      aria-label="Repetitions completed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                      REPS
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Increase reps by 1"
                    onClick={() => setReps(r => r + 1)}
                    className="h-13 w-13 font-bold text-lg rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            {/* Duration Stepper if timed */}
            {isTimedExercise && (
              <div className="space-y-2 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Duration (Minutes):
                </span>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMinutes(m => Math.max(0.5, m - 0.5))}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    -0.5
                  </Button>
                  <Input
                    id={durationInputId}
                    type="number"
                    step="0.5"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="text-center font-extrabold text-3xl tabular-nums h-16 w-32 bg-card rounded-xl border-border"
                    aria-label="Minutes"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMinutes(m => m + 0.5)}
                    className="h-13 w-13 font-bold text-sm rounded-xl min-h-[52px] min-w-[52px]"
                  >
                    +0.5
                  </Button>
                </div>
              </div>
            )}

            {/* Giant Instant Confirm Button */}
            <div className="pt-3">
              <Button
                type="button"
                variant="brand"
                disabled={isSubmitting}
                onClick={() => handleCommitLogs(1)}
                className="w-full font-bold text-base min-h-[56px] rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" aria-hidden="true" />
                <span>Confirm & Log Set {nextSetNumber}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* GUIDED BATCH WIZARD (STEPS 1 TO 5) */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* --------------------------------------------------------------------- */}
            {/* STEP 1: WHAT EXERCISE DID YOU DO? */}
            {/* --------------------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Search Filter Input with Dedicated Search Button */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <Input
                      id={searchInputId}
                      type="search"
                      enterKeyHint="search"
                      placeholder="Search 700+ exercises by name, muscle, or equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-9 h-12 text-sm rounded-xl bg-card border-border"
                      aria-label="Search exercise options"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                        aria-label="Clear search input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="brand"
                    onClick={() => {
                      const el = document.getElementById(searchInputId);
                      if (el) el.focus();
                    }}
                    className="h-12 px-4 rounded-xl font-bold gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </Button>
                </div>

                {/* Section A: Today's Prescribed Lineup */}
                {prescriptions.length > 0 && !searchQuery && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Today's Workout Program:
                    </span>
                    <div className="space-y-2" role="group" aria-label="Prescribed movements">
                      {prescriptions.map((rx) => {
                        const count = session.sets.filter(s => s.exerciseId === rx.exerciseId).length;
                        const isDone = count >= rx.sets;
                        const isSelected = selectedExId === rx.exerciseId;

                        return (
                          <button
                            key={rx.id}
                            type="button"
                            onClick={() => handleSelectExercise(rx.exerciseId)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-[56px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                              isSelected
                                ? "border-brand bg-brand/15 shadow-xs"
                                : "border-border bg-card hover:bg-secondary/70"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm sm:text-base text-foreground">{rx.exerciseName}</h4>
                                <Badge variant="outline" className="text-[10px] uppercase">Prescribed</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                                Goal: {rx.sets} sets × {rx.repTarget} reps @ {rx.targetLoadKg || 0} kg
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={isDone ? "success" : "secondary"} className="tabular-nums text-xs">
                                {count} / {rx.sets} sets
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section B: General Exercise Library */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {searchQuery ? "Search Results:" : "Exercise Library:"}
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1" role="group" aria-label="Exercise library list">
                    {filteredExercises.map((ex) => {
                      const isSelected = selectedExId === ex.id;
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => handleSelectExercise(ex.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between min-h-[56px] focus-visible:ring-2 focus-visible:ring-brand ${
                            isSelected
                              ? "border-brand bg-brand/15"
                              : "border-border bg-card hover:bg-secondary/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {ex.thumbUrl ? (
                              <div className="w-11 h-11 rounded-lg bg-secondary/60 border border-border overflow-hidden shrink-0 p-0.5">
                                <img
                                  src={ex.thumbUrl}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-secondary/60 border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                                <Dumbbell className="w-5 h-5" aria-hidden="true" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">{ex.name}</h4>
                              <span className="text-[11px] text-muted-foreground capitalize">
                                {ex.category} • {ex.primaryMuscle} • {ex.equipment}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section C: Other / Custom Exercise Fallback */}
                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Other / Custom Exercise:
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Incline Landmine Press"
                      value={customExerciseName}
                      onChange={(e) => setCustomExerciseName(e.target.value)}
                      className="h-12 text-sm rounded-xl bg-card border-border"
                      aria-label="Custom exercise name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!customExerciseName.trim()}
                      onClick={handleSelectCustomExercise}
                      className="h-12 px-4 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Use Custom
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 2: HOW MUCH WEIGHT DID YOU USE? */}
            {/* --------------------------------------------------------------------- */}
            {step === 2 && (
              <div className="space-y-5 text-center">
                {/* Movement banner with photo & technique button */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowTechniqueGuide(true)}
                      className="w-10 h-10 rounded-lg bg-card border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60"
                      title="View 2-pose demonstration"
                      aria-label={`View poses for ${exerciseName}`}
                    >
                      {currentExerciseThumb ? (
                        <img
                          src={currentExerciseThumb}
                          alt={exerciseName}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-3 h-3 text-brand" />
                      </div>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground truncate">{exerciseName}</span>
                        <button
                          type="button"
                          onClick={() => setShowTechniqueGuide(true)}
                          className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20"
                        >
                          <Eye className="w-3 h-3 text-brand" />
                          <span>Poses</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-muted-foreground capitalize block truncate">
                        {category} movement
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[11px] shrink-0 font-mono">
                    {category}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider">
                      {isDumbbell
                        ? "Weight per dumbbell:"
                        : isWeightedBodyweight
                        ? "Additional weight added (vest/belt):"
                        : "Weight Lifted:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeightUnit(u => (u === "kg" ? "lbs" : "kg"))}
                      className="text-brand font-semibold hover:underline cursor-pointer"
                    >
                      Unit: {weightUnit.toUpperCase()} (Switch to {weightUnit === "kg" ? "lbs" : "kg"})
                    </button>
                  </div>

                  {/* Big numerical input with large steppers */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Decrease weight by 10"
                      onClick={() => handleWeightChange(weight - 10)}
                      className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      -10
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Decrease weight by 2.5"
                      onClick={() => handleWeightChange(weight - 2.5)}
                      className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      -2.5
                    </Button>

                    <div className="relative">
                      <Input
                        id={weightInputId}
                        type="number"
                        step="0.5"
                        inputMode="decimal"
                        enterKeyHint="next"
                        value={isWeightSkipped ? 0 : displayWeight}
                        onChange={(e) => handleDisplayWeightInput(e.target.value)}
                        className="text-center font-extrabold text-3xl sm:text-4xl tabular-nums h-18 w-38 sm:w-44 bg-card rounded-xl border-border"
                        aria-label={`Weight in ${weightUnit}`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                        {weightUnit.toUpperCase()}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Increase weight by 2.5"
                      onClick={() => handleWeightChange(weight + 2.5)}
                      className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      +2.5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Increase weight by 10"
                      onClick={() => handleWeightChange(weight + 10)}
                      className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      +10
                    </Button>
                  </div>

                  {/* Preset quick selection chips */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2" role="group" aria-label="Common weight presets">
                    {(category === "dumbbell"
                      ? [8, 12, 16, 20, 24, 30]
                      : [20, 40, 60, 80, 100, 120, 140]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleWeightChange(preset)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer min-h-[44px] ${
                          weight === preset && !isWeightSkipped
                            ? "border-brand bg-brand text-white font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {preset} kg
                      </button>
                    ))}
                  </div>

                  {/* Smart suggestion chips: prescription & previous set */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
                    {activeRx?.targetLoadKg !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleWeightChange(activeRx.targetLoadKg || 0)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/30 text-xs text-brand font-medium hover:bg-brand/20 transition-colors cursor-pointer min-h-[44px]"
                      >
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Coach Prescribed: <strong>{activeRx.targetLoadKg} kg</strong> ({Math.round(activeRx.targetLoadKg * 2.20462)} lbs)</span>
                      </button>
                    )}
                    {loggedSetsForExercise.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleWeightChange(loggedSetsForExercise[loggedSetsForExercise.length - 1].completedWeightKg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground font-medium hover:bg-secondary transition-colors cursor-pointer min-h-[44px]"
                      >
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                        <span>Previous Set: <strong>{loggedSetsForExercise[loggedSetsForExercise.length - 1].completedWeightKg} kg</strong></span>
                      </button>
                    )}
                  </div>

                  {/* Skip option for bodyweight / unweighted */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsWeightSkipped(true);
                        setWeight(0);
                        setStep(3);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer min-h-[44px]"
                    >
                      Skip — This exercise doesn't use additional weight
                    </Button>
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="gap-1.5 text-xs min-h-[48px] rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    onClick={() => setStep(3)}
                    className="gap-2 font-bold text-sm min-h-[48px] px-6 rounded-xl cursor-pointer"
                  >
                    Next: Repetitions <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 3: REPETITIONS / DURATION / DISTANCE */}
            {/* --------------------------------------------------------------------- */}
            {step === 3 && (
              <div className="space-y-5 text-center">
                {/* Movement banner with photo & technique button */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowTechniqueGuide(true)}
                      className="w-10 h-10 rounded-lg bg-card border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60"
                      title="View 2-pose demonstration"
                      aria-label={`View poses for ${exerciseName}`}
                    >
                      {currentExerciseThumb ? (
                        <img
                          src={currentExerciseThumb}
                          alt={exerciseName}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-3 h-3 text-brand" />
                      </div>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground truncate">{exerciseName}</span>
                        <button
                          type="button"
                          onClick={() => setShowTechniqueGuide(true)}
                          className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20"
                        >
                          <Eye className="w-3 h-3 text-brand" />
                          <span>Poses</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-muted-foreground capitalize block truncate">
                        {category} movement
                      </span>
                    </div>
                  </div>
                  <span className="text-brand font-mono font-bold text-sm shrink-0">
                    {isWeightSkipped ? "Bodyweight" : `${weight} kg`}
                  </span>
                </div>

                {/* Case 1: Standard Reps */}
                {!isTimedExercise && !isCardio && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Repetitions Completed:
                    </span>

                    <div className="flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Decrease reps by 5"
                        onClick={() => setReps(r => Math.max(0, r - 5))}
                        className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        -5
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Decrease reps by 1"
                        onClick={() => setReps(r => Math.max(0, r - 1))}
                        className="h-13 w-13 font-bold text-lg min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>

                      <div className="relative">
                        <Input
                          id={repsInputId}
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          enterKeyHint="next"
                          value={reps}
                          onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
                          className="text-center font-extrabold text-3xl sm:text-4xl tabular-nums h-18 w-36 sm:w-40 bg-card rounded-xl border-border"
                          aria-label="Repetitions completed"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                          REPS
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Increase reps by 1"
                        onClick={() => setReps(r => r + 1)}
                        className="h-13 w-13 font-bold text-lg min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Increase reps by 5"
                        onClick={() => setReps(r => r + 5)}
                        className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        +5
                      </Button>
                    </div>

                    {/* Quick Rep Preset Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2" role="group" aria-label="Common rep targets">
                      {[5, 8, 10, 12, 15, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setReps(preset)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer min-h-[44px] ${
                            reps === preset
                              ? "border-brand bg-brand text-white font-bold"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {preset} reps
                        </button>
                      ))}
                    </div>

                    {/* Smart suggestion chip for reps */}
                    {activeRx?.repTarget && (
                      <div className="flex justify-center pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const pReps = parseInt(String(activeRx.repTarget).split("-")[0]);
                            if (!isNaN(pReps)) setReps(pReps);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/30 text-xs text-brand font-medium hover:bg-brand/20 transition-colors cursor-pointer min-h-[44px]"
                        >
                          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Coach Prescribed Target: <strong>{activeRx.repTarget} reps</strong></span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Case 2: Duration-based (Plank, Isometric) */}
                {isTimedExercise && !isCardio && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Hold Duration (Seconds):
                    </span>

                    <div className="flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSeconds(s => Math.max(0, s - 15))}
                        className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        -15s
                      </Button>
                      <div className="relative">
                        <Input
                          type="number"
                          value={seconds || minutes * 60}
                          onChange={(e) => {
                            const totalSec = Math.max(0, parseInt(e.target.value) || 0);
                            setSeconds(totalSec % 60);
                            setMinutes(Math.floor(totalSec / 60));
                          }}
                          className="text-center font-extrabold text-3xl sm:text-4xl tabular-nums h-18 w-36 sm:w-40 bg-card rounded-xl border-border"
                          aria-label="Hold duration in seconds"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                          SEC
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSeconds(s => s + 15)}
                        className="h-13 w-13 font-bold text-xs min-h-[52px] min-w-[52px] rounded-xl"
                      >
                        +15s
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {[30, 45, 60, 90, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setSeconds(sec % 60);
                            setMinutes(Math.floor(sec / 60));
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono min-h-[44px]"
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case 3: Cardio / Distance-Duration */}
                {isCardio && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Duration (Minutes):</span>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMinutes(m => Math.max(1, m - 1))}
                            className="h-11 w-11 font-bold text-sm min-h-[44px] min-w-[44px]"
                          >
                            -1
                          </Button>
                          <Input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                            className="text-center font-bold text-xl h-11 w-24 bg-card"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMinutes(m => m + 1)}
                            className="h-11 w-11 font-bold text-sm min-h-[44px] min-w-[44px]"
                          >
                            +1
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Distance (KM):</span>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDistanceKm(d => Math.max(0.1, Math.round((d - 0.5) * 10) / 10))}
                            className="h-11 w-11 font-bold text-xs min-h-[44px] min-w-[44px]"
                          >
                            -0.5
                          </Button>
                          <Input
                            type="number"
                            step="0.1"
                            value={distanceKm}
                            onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="text-center font-bold text-xl h-11 w-24 bg-card"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDistanceKm(d => Math.round((d + 0.5) * 10) / 10)}
                            className="h-11 w-11 font-bold text-xs min-h-[44px] min-w-[44px]"
                          >
                            +0.5
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(isPureBodyweight ? 1 : 2)}
                    className="gap-1.5 text-xs min-h-[48px] rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    onClick={() => setStep(4)}
                    className="gap-2 font-bold text-sm min-h-[48px] px-6 rounded-xl cursor-pointer"
                  >
                    Next: Number of Sets <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 4: NUMBER OF SETS */}
            {/* --------------------------------------------------------------------- */}
            {step === 4 && (
              <div className="space-y-5 text-center">
                {/* Movement banner with photo & technique button */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowTechniqueGuide(true)}
                      className="w-10 h-10 rounded-lg bg-card border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60"
                      title="View 2-pose demonstration"
                      aria-label={`View poses for ${exerciseName}`}
                    >
                      {currentExerciseThumb ? (
                        <img
                          src={currentExerciseThumb}
                          alt={exerciseName}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-3 h-3 text-brand" />
                      </div>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground truncate">{exerciseName}</span>
                        <button
                          type="button"
                          onClick={() => setShowTechniqueGuide(true)}
                          className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20"
                        >
                          <Eye className="w-3 h-3 text-brand" />
                          <span>Poses</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-muted-foreground capitalize block truncate">
                        {category} movement
                      </span>
                    </div>
                  </div>
                  <span className="text-brand font-mono font-bold text-sm shrink-0">
                    {isWeightSkipped ? "Bodyweight" : `${weight} kg`} × {reps} reps
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    How many sets did you complete?
                  </span>

                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Decrease sets by 1"
                      onClick={() => setSetsCount(s => Math.max(1, s - 1))}
                      className="h-13 w-13 font-bold text-lg min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>

                    <div className="relative">
                      <Input
                        id={setsInputId}
                        type="number"
                        min="1"
                        max="20"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        enterKeyHint="done"
                        value={setsCount}
                        onChange={(e) => setSetsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center font-extrabold text-3xl sm:text-4xl tabular-nums h-18 w-36 sm:w-40 bg-card rounded-xl border-border"
                        aria-label="Total sets completed"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                        SETS
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Increase sets by 1"
                      onClick={() => setSetsCount(s => Math.min(20, s + 1))}
                      className="h-13 w-13 font-bold text-lg min-h-[52px] min-w-[52px] rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Preset quick selection chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2" role="group" aria-label="Common set counts">
                    {[1, 2, 3, 4, 5].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSetsCount(preset)}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer min-h-[44px] ${
                          setsCount === preset
                            ? "border-brand bg-brand text-white font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {preset} {preset === 1 ? "set" : "sets"}
                      </button>
                    ))}
                  </div>

                  {/* Default uniform sets assumption */}
                  <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-center gap-2 text-xs text-muted-foreground max-w-sm mx-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>All <strong>{setsCount} sets</strong> will be recorded with the same weight and reps by default.</span>
                  </div>

                  {activeRx && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Prescribed program calls for <strong className="text-foreground">{activeRx.sets} sets</strong> (You may log fewer or more).
                    </p>
                  )}

                  {/* Optional Customization Accordion */}
                  <div className="pt-3 border-t border-border/70 text-left">
                    <button
                      type="button"
                      onClick={() => setIsCustomizingSets(prev => !prev)}
                      className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer min-h-[44px]"
                    >
                      <span>{isCustomizingSets ? "Hide individual set customization" : "Customize weight & reps for individual sets"}</span>
                    </button>

                    {isCustomizingSets && (
                      <div className="space-y-2 mt-2 p-3 rounded-xl bg-card border border-border">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Fine-tune individual sets:
                        </span>
                        {customSets.map((cSet, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/40 last:border-b-0">
                            <span className="font-bold text-foreground w-14">Set {cSet.setNumber}:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={cSet.weight}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setCustomSets(cs => cs.map((item, i) => (i === idx ? { ...item, weight: val } : item)));
                                }}
                                className="h-8 w-20 text-center font-mono text-xs bg-secondary"
                                aria-label={`Weight for set ${cSet.setNumber}`}
                              />
                              <span className="text-muted-foreground">kg ×</span>
                              <Input
                                type="number"
                                value={cSet.reps}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setCustomSets(cs => cs.map((item, i) => (i === idx ? { ...item, reps: val } : item)));
                                }}
                                className="h-8 w-16 text-center font-mono text-xs bg-secondary"
                                aria-label={`Reps for set ${cSet.setNumber}`}
                              />
                              <span className="text-muted-foreground">reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(3)}
                    className="gap-1.5 text-xs min-h-[48px] rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    onClick={() => setStep(5)}
                    className="gap-2 font-bold text-sm min-h-[48px] px-6 rounded-xl cursor-pointer"
                  >
                    Review & Confirm <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 5: REVIEW AND CONFIRM */}
            {/* --------------------------------------------------------------------- */}
            {step === 5 && (
              <div className="space-y-5">
                {/* Summary Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Exercise Summary
                    </span>
                    <Badge variant="brand" className="font-mono text-xs px-2.5 py-0.5">
                      {setsCount} {setsCount === 1 ? "Set" : "Sets"} Planned
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Exercise:</span>
                      <div className="flex items-center gap-2">
                        {currentExerciseThumb && (
                          <img
                            src={currentExerciseThumb}
                            alt=""
                            className="w-7 h-7 object-contain rounded-md bg-secondary/80 p-0.5 border border-border shrink-0"
                          />
                        )}
                        <strong className="text-foreground text-base">{exerciseName}</strong>
                        <button
                          type="button"
                          onClick={() => setShowTechniqueGuide(true)}
                          className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-1 bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20"
                          title="Inspect 2-pose demonstration"
                        >
                          <Eye className="w-3 h-3 text-brand" />
                          <span>Poses</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Weight:</span>
                      <strong className="text-foreground">
                        {isWeightSkipped ? "Bodyweight (No added weight)" : `${weight} kg (${Math.round(weight * 2.20462)} lbs)`}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isTimedExercise ? "Duration:" : isCardio ? "Distance & Time:" : "Reps per Set:"}
                      </span>
                      <strong className="text-foreground">
                        {isTimedExercise
                          ? `${minutes} min ${seconds > 0 ? `${seconds} sec` : ""}`
                          : isCardio
                          ? `${distanceKm} km in ${minutes} min`
                          : `${reps} repetitions`}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Sets to Log:</span>
                      <strong className="text-brand font-mono font-bold text-base">{setsCount}</strong>
                    </div>

                    {!isWeightSkipped && reps > 0 && !isTimedExercise && (
                      <div className="flex justify-between items-center py-1 text-xs text-muted-foreground">
                        <span>Total Estimated Volume:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {(weight * reps * setsCount).toLocaleString()} kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    type="button"
                    variant="brand"
                    disabled={isSubmitting}
                    onClick={() => handleCommitLogs(setsCount)}
                    className="w-full font-bold text-base min-h-[56px] rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                    aria-label="Save Exercise"
                  >
                    <Check className="w-5 h-5" aria-hidden="true" />
                    <span>{isSubmitting ? "Saving..." : "Save Exercise"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="w-full font-semibold text-xs min-h-[48px] rounded-xl border-border cursor-pointer"
                  >
                    Go Back and Edit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <DialogFooter className="border-t border-border/80 pt-3 flex flex-row items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="text-xs text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          Cancel
        </Button>

        {session.sets.length > 0 && step !== 6 && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              completeWorkoutSession();
              confetti({ particleCount: 100, spread: 70 });
              onOpenChange(false);
            }}
            className="text-xs font-semibold min-h-[44px] px-4 rounded-xl"
          >
            Complete Workout Session
          </Button>
        )}
      </DialogFooter>
    </Dialog>

    {/* Form & Technique Guide Modal with 2-Pose Demonstration */}
    <ExerciseDetailModal
      exerciseId={selectedExId || null}
      exerciseName={exerciseName}
      open={showTechniqueGuide}
      onOpenChange={setShowTechniqueGuide}
    />
  </>
  );
}
