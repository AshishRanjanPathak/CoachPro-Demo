"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, CheckCircle2, Sparkles, Trophy, ArrowRight, ArrowLeft, Dumbbell, Timer, Zap, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface WorkoutLoggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkoutLoggerModal({ open, onOpenChange }: WorkoutLoggerModalProps) {
  const { state, addWorkoutSet, completeWorkoutSession } = useAuth();
  const session = state.activeSession;
  const program = state.programs.find(p => p.id === session.programId) || state.programs[0];
  const currentDay = program.days.find(d => d.dayNumber === session.dayNumber) || program.days[0];
  const prescriptions = currentDay.prescriptions;

  // Wizard Step State: 1 = Choose Exercise, 2 = Enter Weight/Duration, 3 = Enter Reps, 4 = Rate RPE, 5 = Set Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedExIndex, setSelectedExIndex] = useState(0);

  const currentRx = prescriptions[selectedExIndex] || prescriptions[0];
  const loggedSets = session.sets.filter(s => s.exerciseId === currentRx.exerciseId);
  const nextSetNumber = loggedSets.length + 1;

  // Inputs
  const [weight, setWeight] = useState<number>(currentRx.targetLoadKg || 100);
  const [reps, setReps] = useState<number>(parseInt(currentRx.repTarget.split("-")[0]) || 5);
  const [minutes, setMinutes] = useState<number>(currentRx.targetDurationMinutes || 10);
  const [rpe, setRpe] = useState<number>(currentRx.targetRpe || 8);
  const [isPrAchieved, setIsPrAchieved] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const isTimedExercise = currentRx.repTarget.toLowerCase().includes("min") || currentRx.exerciseName.toLowerCase().includes("run") || currentRx.exerciseName.toLowerCase().includes("row");

  const handleSelectExercise = (idx: number) => {
    setSelectedExIndex(idx);
    const rx = prescriptions[idx];
    setWeight(rx.targetLoadKg || 100);
    setReps(parseInt(rx.repTarget.split("-")[0]) || 5);
    setRpe(rx.targetRpe || 8);
    setStep(2); // Auto advance to Step 2: "How much weight did you do today?"
  };

  const handleCommitSet = () => {
    const isPr = weight >= 142.5;
    setIsPrAchieved(isPr);

    addWorkoutSet({
      exerciseId: currentRx.exerciseId,
      exerciseName: currentRx.exerciseName,
      setNumber: nextSetNumber,
      prescribedWeightKg: currentRx.targetLoadKg,
      prescribedReps: currentRx.repTarget,
      prescribedMinutes: currentRx.targetDurationMinutes,
      completedWeightKg: weight,
      completedReps: reps,
      completedMinutes: isTimedExercise ? minutes : undefined,
      rpe,
      isPr
    });

    if (isPr) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }

    setStep(5); // Move to Confirmation & Next Set prompt
  };

  const handleNextSet = () => {
    // Keep weight, stay on current exercise, go back to Step 2 for next set
    setStep(2);
  };

  const handleFinishWorkout = () => {
    completeWorkoutSession();
    setIsSessionFinished(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setTimeout(() => {
      setIsSessionFinished(false);
      setStep(1);
      onOpenChange(false);
    }, 2200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Badge variant="brand">Step-by-Step Logger</Badge>
          <span className="text-xs text-muted-foreground">Question {step} of 4</span>
        </div>
        <DialogTitle className="mt-1">
          {step === 1 && "1. Which exercise are you doing?"}
          {step === 2 && (isTimedExercise ? "2. How many minutes did you do today?" : "2. How much weight did you lift today?")}
          {step === 3 && "3. How many repetitions did you complete?"}
          {step === 4 && "4. How difficult was this set (RPE)?"}
          {step === 5 && "Set Recorded Successfully!"}
        </DialogTitle>
        <DialogDescription>
          {step === 1 && "Select the movement you are about to perform from your program."}
          {step === 2 && `Coach's target prescription is ${currentRx.targetLoadKg || 0} kg.`}
          {step === 3 && `Coach prescribed target is ${currentRx.repTarget} reps.`}
          {step === 4 && "Rate your perceived rate of exertion for training load auto-regulation."}
          {step === 5 && "Set logged to your training ledger and coach attention feed."}
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        {isSessionFinished ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Workout Completed!</h3>
            <p className="text-sm text-muted-foreground">
              All completed sets and volume metrics have been synced with your coach.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* STEP 1: EXERCISE SELECTION */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Today's Prescribed Lineup:
                </p>
                <div className="space-y-2">
                  {prescriptions.map((rx, idx) => {
                    const count = session.sets.filter(s => s.exerciseId === rx.exerciseId).length;
                    const isDone = count >= rx.sets;

                    return (
                      <div
                        key={rx.id}
                        onClick={() => handleSelectExercise(idx)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-[52px] ${
                          idx === selectedExIndex
                            ? "border-brand bg-brand/10 shadow-xs"
                            : "border-border bg-card hover:bg-secondary/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-foreground">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{rx.exerciseName}</h4>
                            <p className="text-xs text-muted-foreground">
                              Target: {rx.sets} sets × {rx.repTarget} reps @ {rx.targetLoadKg}kg
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={isDone ? "success" : "secondary"} className="tabular-nums text-xs">
                            {count} / {rx.sets} done
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: HOW MUCH WEIGHT OR MINUTES TODAY */}
            {step === 2 && (
              <div className="space-y-5 text-center">
                <div className="p-3 rounded-lg bg-secondary/60 border border-border flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{currentRx.exerciseName}</span>
                  <span className="text-muted-foreground font-mono">Set {nextSetNumber} of {currentRx.sets}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {isTimedExercise ? "Minutes Performed:" : "Weight Lifted (kg):"}
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight(w => Math.max(0, w - 5))}
                      className="h-12 w-12 font-bold text-xs"
                    >
                      -5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight(w => Math.max(0, w - 2.5))}
                      className="h-12 w-12 font-bold text-xs"
                    >
                      -2.5
                    </Button>

                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        className="text-center font-extrabold text-3xl tabular-nums h-16 w-36 bg-card"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        KG
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight(w => w + 2.5)}
                      className="h-12 w-12 font-bold text-xs"
                    >
                      +2.5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setWeight(w => w + 5)}
                      className="h-12 w-12 font-bold text-xs"
                    >
                      +5
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground pt-1">
                    Coach's Prescribed Load: <span className="font-semibold text-foreground">{currentRx.targetLoadKg} kg</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button variant="brand" onClick={() => setStep(3)} className="gap-1 font-semibold text-xs min-h-[44px]">
                    Next: Enter Reps <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: HOW MANY REPS COMPLETED */}
            {step === 3 && (
              <div className="space-y-5 text-center">
                <div className="p-3 rounded-lg bg-secondary/60 border border-border flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{currentRx.exerciseName}</span>
                  <span className="text-muted-foreground font-mono">Weight: {weight} kg</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Repetitions Completed:
                  </span>

                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setReps(r => Math.max(0, r - 1))}
                      className="h-12 w-12 font-bold text-base"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>

                    <div className="relative">
                      <Input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                        className="text-center font-extrabold text-3xl tabular-nums h-16 w-32 bg-card"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        REPS
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setReps(r => r + 1)}
                      className="h-12 w-12 font-bold text-base"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground pt-1">
                    Coach's Prescribed Rep Target: <span className="font-semibold text-foreground">{currentRx.repTarget} reps</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button variant="brand" onClick={() => setStep(4)} className="gap-1 font-semibold text-xs min-h-[44px]">
                    Next: Rate Effort <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: RATE RPE DIFFICULTY */}
            {step === 4 && (
              <div className="space-y-5 text-center">
                <div className="p-3 rounded-lg bg-secondary/60 border border-border flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{currentRx.exerciseName}</span>
                  <span className="text-brand font-bold">{weight} kg × {reps} reps</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-warning" /> Rate of Perceived Exertion (RPE)
                    </span>
                    <span className="font-extrabold text-xl text-brand tabular-nums">RPE {rpe}</span>
                  </div>

                  <input
                    type="range"
                    min="6"
                    max="10"
                    step="0.5"
                    value={rpe}
                    onChange={(e) => setRpe(parseFloat(e.target.value))}
                    className="w-full accent-brand h-3 bg-secondary rounded-lg cursor-pointer"
                  />

                  <div className="grid grid-cols-3 text-[11px] text-muted-foreground pt-1">
                    <span className="text-left">RPE 6-7 (Comfortable)</span>
                    <span className="text-center font-medium">RPE 8 (2 Reps in Reserve)</span>
                    <span className="text-right">RPE 10 (Max Effort)</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-between pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="gap-1 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button variant="brand" onClick={handleCommitSet} className="font-bold text-xs min-h-[44px] gap-2 px-6">
                    <CheckCircle2 className="w-4 h-4" /> Save Set {nextSetNumber}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMATION & PROMPT FOR NEXT */}
            {step === 5 && (
              <div className="space-y-5 text-center py-2">
                <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-foreground">Set {nextSetNumber - 1} Recorded!</h3>
                  <div className="text-sm font-semibold text-brand tabular-nums mt-1">
                    {weight} kg × {reps} reps @ RPE {rpe}
                  </div>
                  {isPrAchieved && (
                    <Badge variant="success" className="mt-2 text-xs py-0.5">
                      🏆 All-Time PR Detected!
                    </Badge>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground">
                  Rest timer: Take 2–3 minutes rest before your next set.
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <Button variant="brand" onClick={handleNextSet} className="font-semibold text-xs min-h-[44px]">
                    Log Set {nextSetNumber} of {currentRx.sets}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)} className="text-xs min-h-[44px]">
                    Choose Different Exercise
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close Logger
          </Button>
          {session.sets.length > 0 && (
            <Button variant="default" size="sm" onClick={handleFinishWorkout} className="font-semibold text-xs">
              Complete Workout Session
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
}
