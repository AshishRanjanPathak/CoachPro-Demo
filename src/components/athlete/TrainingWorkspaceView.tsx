"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { resolveActiveSessionContext } from "@/lib/store";
import { CoachBuddyCard } from "@/components/athlete/CoachBuddyCard";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import { resolveExerciseThumbnail } from "@/lib/exercises";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Play,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Sparkles,
  Info,
  Plus,
  Eye
} from "lucide-react";

export function TrainingWorkspaceView() {
  const { state, resetWorkoutSession } = useAuth();
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(undefined);
  const [detailModalExercise, setDetailModalExercise] = useState<{ id: string; name: string } | null>(null);
  const [loggerMode, setLoggerMode] = useState<"quick_set" | "batch">("quick_set");
  const [currentDateStr, setCurrentDateStr] = useState("Tuesday, Oct 27");

  useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric"
      })
    );
  }, []);

  const { session, program, prescriptions, plannedSets: totalPrescribedSets } = resolveActiveSessionContext(state);

  const completedSetsCount = session.sets.length;
  const isCompleted = session.status === "completed" || (completedSetsCount >= totalPrescribedSets && totalPrescribedSets > 0);
  const progressPercent = totalPrescribedSets > 0 ? Math.min(100, Math.round((completedSetsCount / totalPrescribedSets) * 100)) : 0;

  // Entry Point A: Log set from individual exercise card
  const handleLogExerciseCard = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setLoggerMode("quick_set");
    setLoggerOpen(true);
  };

  // Entry Point B: General Quick Log action
  const handleOpenGeneralQuickLog = () => {
    setSelectedExerciseId(undefined);
    setLoggerMode("batch");
    setLoggerOpen(true);
  };

  const nextUnfinishedRx = prescriptions.find(rx => {
    const count = session.sets.filter(s => s.exerciseId === rx.exerciseId).length;
    return count < rx.sets;
  }) || prescriptions[0];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 1. & 2. Training Header: Clean Matte Surface */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-semibold">
              Today&apos;s Training
            </span>
            <span className="text-border">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" /> {currentDateStr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenGeneralQuickLog}
              className="text-xs font-semibold h-9 px-3 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
              <span>Quick Log</span>
            </Button>

            {isCompleted ? (
              <Badge variant="success" className="text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" /> Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-medium text-brand border-brand/30">
                In Progress
              </Badge>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold heading-tight text-foreground">
          {session.dayName || "Strength & Conditioning Session"}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          {session.programTitle || program?.title || "Strength Program"} • Coach {program?.coachName || "Sarah Jenkins, CSCS"}
        </p>

        {/* 3. Session Progress Indicator */}
        <div className="mt-4 pt-3.5 border-t border-border">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1.5">
            <span>Overall Session Progress</span>
            <span className="font-semibold text-foreground tabular-nums">
              {completedSetsCount} / {totalPrescribedSets} sets ({progressPercent}%)
            </span>
          </div>
          <Progress value={completedSetsCount} max={Math.max(1, totalPrescribedSets)} className="h-1.5" />
        </div>
      </div>

      {/* 4. Session Companion Strip */}
      <CoachBuddyCard mode="training" onOpenLogger={handleOpenGeneralQuickLog} />

      {/* 5. & 6. Prescribed Movement Lineup & Individual Exercise Cards */}
      <Card className="border-border overflow-hidden rounded-2xl bg-card">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Prescribed Lineup
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {prescriptions.length} movements
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-l-brand pl-3 py-0.5">
            Control every rep smoothly (2–3s eccentric), brace well, and tap <strong className="text-foreground">Log Set</strong> after each working set.
          </p>

          {/* Individual Exercise Cards */}
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
            {prescriptions.length === 0 ? (
              <div className="p-5 text-center text-xs text-muted-foreground">
                No exercises prescribed in this block yet. Tap <strong className="text-foreground">Quick Log</strong> above to log any exercise.
              </div>
            ) : prescriptions.map((rx, idx) => {
              const loggedSets = session.sets.filter(s => s.exerciseId === rx.exerciseId);
              const isRxComplete = loggedSets.length >= rx.sets;
              const thumbUrl = resolveExerciseThumbnail(rx.exerciseId, rx.exerciseName);

              return (
                <div
                  key={rx.id}
                  className={`p-3.5 sm:p-4 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRxComplete ? "bg-success/5" : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Visual Thumbnail & Movement Pose Preview Button */}
                    <button
                      type="button"
                      onClick={() => setDetailModalExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                      className="relative w-12 h-12 rounded-xl bg-secondary border border-border overflow-hidden shrink-0 focus-visible:ring-2 focus-visible:ring-brand cursor-pointer hover:border-brand/60 transition-colors duration-150 active:scale-[0.97] p-0.5"
                      title={`Inspect movement demonstration for ${rx.exerciseName}`}
                      aria-label={`Inspect technique and poses for ${rx.exerciseName}`}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={rx.exerciseName}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Dumbbell className="w-5 h-5" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 bg-background/90 text-[10px] font-bold px-1 rounded-tl border-t border-l border-border tabular-nums">
                        {idx + 1}
                      </div>
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-foreground leading-snug text-pretty">
                          {rx.exerciseName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setDetailModalExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                          className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-1 cursor-pointer bg-brand/5 hover:bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md"
                          title="View 2-pose demonstration and coaching tips"
                          aria-label={`View 2-pose demonstration for ${rx.exerciseName}`}
                        >
                          <Eye className="w-3 h-3 text-brand" aria-hidden="true" />
                          <span>Poses & Guide</span>
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2 tabular-nums">
                        <span className="font-medium text-foreground">{rx.sets}&nbsp;sets × {rx.repTarget}&nbsp;reps</span>
                        <span>•</span>
                        <span>Weight: <strong className="text-foreground">{rx.targetLoadKg}&nbsp;kg</strong> ({Math.round((rx.targetLoadKg || 0) * 2.20462)} lbs)</span>
                        {rx.targetRpe && (
                          <>
                            <span>•</span>
                            <span className="text-brand font-medium">Effort: RPE {rx.targetRpe}</span>
                          </>
                        )}
                      </div>
                      {rx.notes && (
                        <p className="text-xs text-brand/90 font-medium mt-1 text-pretty bg-brand/5 px-2.5 py-1 rounded-md border border-brand/10 inline-block">
                          Coach note: “{rx.notes}”
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exercise Actions: Progress Badge & Direct "Log Set" Entry Point A Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <Badge variant={isRxComplete ? "success" : "secondary"} className="tabular-nums text-xs px-2.5 py-1 font-semibold">
                      {loggedSets.length}&nbsp;/&nbsp;{rx.sets}&nbsp;sets
                    </Badge>

                    <Button
                      type="button"
                      variant={isRxComplete ? "outline" : "brand"}
                      size="sm"
                      onClick={() => handleLogExerciseCard(rx.exerciseId)}
                      className="font-bold text-xs h-10 px-4 rounded-xl min-h-[44px] cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-brand flex items-center gap-1.5"
                      aria-label={`Log set for ${rx.exerciseName}`}
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isRxComplete ? "Log Extra Set" : "Log Set"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* 7. Workout Completion Summary & Primary Controls */}
        <CardFooter className="p-5 sm:p-6 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground w-full sm:w-auto text-center sm:text-left">
            Rest periods between sets: <span className="font-semibold text-foreground">2–3 minutes recommended</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {session.sets.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetWorkoutSession}
                className="text-xs min-h-[48px] px-4 rounded-xl focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" /> Reset
              </Button>
            )}

            <Button
              type="button"
              variant="brand"
              onClick={() => {
                if (nextUnfinishedRx) {
                  handleLogExerciseCard(nextUnfinishedRx.exerciseId);
                } else {
                  handleOpenGeneralQuickLog();
                }
              }}
              className="w-full sm:w-auto font-bold text-sm shadow-xs min-h-[48px] px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
            >
              <Play className="w-4 h-4 mr-2 fill-current" aria-hidden="true" />
              {completedSetsCount === 0 ? "Start Today's Workout" : "Continue Logging Sets"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Accessible Workout Logger Modal */}
      <WorkoutLoggerModal
        open={loggerOpen}
        onOpenChange={setLoggerOpen}
        initialExerciseId={selectedExerciseId}
        initialMode={loggerMode}
      />

      {/* Movement Technique & 2-Pose Demonstration Guide */}
      <ExerciseDetailModal
        exerciseId={detailModalExercise?.id || null}
        exerciseName={detailModalExercise?.name}
        open={Boolean(detailModalExercise)}
        onOpenChange={(isOpen) => !isOpen && setDetailModalExercise(null)}
        onLogExercise={(id) => {
          setDetailModalExercise(null);
          handleLogExerciseCard(id);
        }}
      />
    </div>
  );
}
