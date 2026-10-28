"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { Dumbbell, Play, CheckCircle2, RotateCcw, Calendar, UserCheck } from "lucide-react";

export function TodayWorkoutCard() {
  const { state, resetWorkoutSession } = useAuth();
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState("Tuesday, Oct 27");

  React.useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));
  }, []);

  const session = state.activeSession;
  const program = state.programs.find(p => p.id === session.programId) || state.programs[0];
  const currentDay = program.days.find(d => d.dayNumber === session.dayNumber) || program.days[0];

  const totalPrescribedSets = currentDay.prescriptions.reduce((acc, rx) => acc + rx.sets, 0);
  const completedSetsCount = session.sets.length;
  const isCompleted = session.status === "completed";

  return (
    <>
      <Card className="border-border shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-primary text-primary-foreground p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-white border-white/30 text-xs uppercase tracking-wider">
                Today’s Training
              </Badge>
              <span className="text-xs text-white/70 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 inline" aria-hidden="true" /> {currentDateStr}
              </span>
            </div>
            {isCompleted ? (
              <Badge variant="success" className="bg-success text-white border-none font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Session Completed
              </Badge>
            ) : (
              <Badge variant="brand" className="bg-brand text-white border-none font-medium">
                In Progress
              </Badge>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {session.dayName}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Program: <span className="font-semibold">{session.programTitle}</span> • Coach {program.coachName}
          </p>
        </div>

        {/* Workout Progress Bar */}
        <div className="px-5 pt-4 pb-2 bg-secondary/50 border-b border-border">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1.5">
            <span>Overall Session Progress</span>
            <span className="font-semibold text-foreground tabular-nums">
              {completedSetsCount} / {totalPrescribedSets} sets ({Math.round((completedSetsCount / totalPrescribedSets) * 100)}%)
            </span>
          </div>
          <Progress value={completedSetsCount} max={totalPrescribedSets} className="h-2.5" />
        </div>

        {/* Prescribed Exercises List */}
        <CardContent className="p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prescribed Movement Lineup
          </div>

          <div className="space-y-3">
            {currentDay.prescriptions.map((rx, idx) => {
              const loggedSets = session.sets.filter(s => s.exerciseId === rx.exerciseId);
              const isRxComplete = loggedSets.length >= rx.sets;

              return (
                <div
                  key={rx.id}
                  className={`p-3.5 rounded-lg border transition-colors flex items-center justify-between ${
                    isRxComplete 
                      ? "border-success/30 bg-success/5" 
                      : "border-border bg-card hover:border-brand/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isRxComplete ? "bg-success text-white" : "bg-secondary text-foreground"
                    }`} aria-hidden="true">
                      {isRxComplete ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground leading-tight text-pretty">
                        {rx.exerciseName}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2 tabular-nums">
                        <span>{rx.sets}&nbsp;sets × {rx.repTarget}&nbsp;reps</span>
                        <span>•</span>
                        <span>Target: {rx.targetLoadKg}&nbsp;kg</span>
                        {rx.targetRpe && <span>• RPE {rx.targetRpe}</span>}
                      </div>
                      {rx.notes && (
                        <p className="text-[11px] text-muted-foreground/90 italic mt-1 text-pretty">
                          Coach note: “{rx.notes}”
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant={isRxComplete ? "success" : "secondary"} className="tabular-nums text-xs">
                      {loggedSets.length}&nbsp;/&nbsp;{rx.sets}&nbsp;sets
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-5 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground w-full sm:w-auto text-center sm:text-left">
            Rest periods between sets: 2–3&nbsp;minutes recommended
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {session.sets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetWorkoutSession}
                className="text-xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Reset
              </Button>
            )}

            <Button
              variant="brand"
              onClick={() => setLoggerOpen(true)}
              className="w-full sm:w-auto font-semibold shadow-xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Play className="w-4 h-4 mr-1.5 fill-current" aria-hidden="true" />
              {completedSetsCount === 0 ? "Start Workout" : "Continue Logging Sets"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <WorkoutLoggerModal open={loggerOpen} onOpenChange={setLoggerOpen} />
    </>
  );
}
