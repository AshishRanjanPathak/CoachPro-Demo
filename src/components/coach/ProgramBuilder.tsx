"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Program, ProgramDay, ExercisePrescription } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Layers, Calendar } from "lucide-react";

export function ProgramBuilder() {
  const { state, addProgram, currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [savedNotice, setSavedNotice] = useState(false);

  // New program days state
  const [days, setDays] = useState<ProgramDay[]>([
    {
      id: "day-1",
      name: "Day 1: Heavy Squat & Lower Body",
      dayNumber: 1,
      prescriptions: [
        {
          id: "rx-1",
          exerciseId: "ex-1",
          exerciseName: "Barbell Back Squat",
          sets: 4,
          repTarget: "5",
          targetLoadKg: 140,
          targetRpe: 8,
          restSeconds: 180,
          notes: "Focus on speed out of the hole."
        }
      ]
    }
  ]);

  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    const newDay: ProgramDay = {
      id: `day-${Date.now()}`,
      name: `Day ${nextDayNum}: Strength Focus`,
      dayNumber: nextDayNum,
      prescriptions: [
        {
          id: `rx-${Date.now()}`,
          exerciseId: state.exercises[0].id,
          exerciseName: state.exercises[0].name,
          sets: 3,
          repTarget: "8-10",
          targetLoadKg: 100,
          targetRpe: 8,
          restSeconds: 120
        }
      ]
    };
    setDays([...days, newDay]);
  };

  const handleAddExerciseToDay = (dayId: string) => {
    const defaultEx = state.exercises[1] || state.exercises[0];
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.id === dayId) {
          const newRx: ExercisePrescription = {
            id: `rx-${Date.now()}`,
            exerciseId: defaultEx.id,
            exerciseName: defaultEx.name,
            sets: 3,
            repTarget: "6-8",
            targetLoadKg: 80,
            targetRpe: 8,
            restSeconds: 120
          };
          return { ...d, prescriptions: [...d.prescriptions, newRx] };
        }
        return d;
      })
    );
  };

  const handleRemoveRx = (dayId: string, rxId: string) => {
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.id === dayId) {
          return { ...d, prescriptions: d.prescriptions.filter(rx => rx.id !== rxId) };
        }
        return d;
      })
    );
  };

  const handlePublishProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProg: Program = {
      id: `prog-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Structured periodization block.",
      coachId: currentUser.id,
      coachName: currentUser.name,
      targetWeeks: weeks,
      level,
      days
    };

    addProgram(newProg);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Existing Programs Summary */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Program Library</Badge>
          </div>
          <CardTitle className="mt-1">Active Coaching Templates</CardTitle>
          <CardDescription>
            Reusable training systems and periodized blocks ready for athlete assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.programs.map((prog) => (
            <div key={prog.id} className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground text-sm">{prog.title}</h4>
                  <Badge variant="outline" className="capitalize text-xs">{prog.level}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{prog.description}</p>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                  <span>{prog.targetWeeks} Weeks Duration</span>
                  <span>•</span>
                  <span>{prog.days.length} Training Days/Week</span>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">Assigned to Active Athletes</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Program Builder Form */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle>Create New Periodized Program</CardTitle>
          <CardDescription>
            Configure training days, exercise targets, rep schemes, and rest intervals.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePublishProgram}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="program-title-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block cursor-pointer">
                  Program Title
                </label>
                <Input
                  id="program-title-input"
                  name="programTitle"
                  type="text"
                  placeholder="e.g. Apex Hypertrophy Mesocycle B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoComplete="off"
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="program-duration-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block cursor-pointer">
                  Duration (Weeks)
                </label>
                <Input
                  id="program-duration-input"
                  name="durationWeeks"
                  type="number"
                  min="1"
                  max="16"
                  value={weeks}
                  onChange={(e) => setWeeks(parseInt(e.target.value) || 4)}
                  className="min-h-[44px] tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="program-description-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block cursor-pointer">
                Block Rationale / Description
              </label>
              <Input
                id="program-description-input"
                name="programDescription"
                type="text"
                placeholder="Target goals, volume ramps, and deload scheduling…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
                className="min-h-[44px]"
              />
            </div>

            {/* Days Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Training Days ({days.length})
                </span>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDay} className="gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Training Day
                </Button>
              </div>

              <div className="space-y-4">
                {days.map((day, dIdx) => (
                  <div key={day.id} className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        type="text"
                        value={day.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDays(d => d.map(item => item.id === day.id ? { ...item, name: val } : item));
                        }}
                        className="font-semibold text-sm max-w-xs h-9 bg-card"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddExerciseToDay(day.id)}
                        className="text-xs gap-1 text-brand"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Exercise
                      </Button>
                    </div>

                    {/* Prescriptions */}
                    <div className="space-y-2">
                      {day.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-3 rounded-md border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex-1">
                            <select
                              aria-label="Select exercise"
                              value={rx.exerciseId}
                              onChange={(e) => {
                                const ex = state.exercises.find(x => x.id === e.target.value);
                                if (!ex) return;
                                setDays(d =>
                                  d.map(item =>
                                    item.id === day.id
                                      ? {
                                          ...item,
                                          prescriptions: item.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, exerciseId: ex.id, exerciseName: ex.name } : p
                                          )
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="font-semibold bg-transparent text-foreground border border-border rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[36px]"
                            >
                              {state.exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Sets:</span>
                            <input
                              type="number"
                              aria-label="Prescribed sets count"
                              min="1"
                              max="10"
                              value={rx.sets}
                              onChange={(e) => {
                                const s = parseInt(e.target.value) || 1;
                                setDays(d =>
                                  d.map(item =>
                                    item.id === day.id
                                      ? {
                                          ...item,
                                          prescriptions: item.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, sets: s } : p
                                          )
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-12 h-9 text-center border border-border rounded bg-secondary font-bold tabular-nums focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                            />

                            <span className="text-muted-foreground ml-1">Reps:</span>
                            <input
                              type="text"
                              aria-label="Prescribed rep target"
                              value={rx.repTarget}
                              onChange={(e) => {
                                const r = e.target.value;
                                setDays(d =>
                                  d.map(item =>
                                    item.id === day.id
                                      ? {
                                          ...item,
                                          prescriptions: item.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, repTarget: r } : p
                                          )
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-14 h-9 text-center border border-border rounded bg-secondary font-bold tabular-nums focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                            />

                            <span className="text-muted-foreground ml-1">Load (kg):</span>
                            <input
                              type="number"
                              aria-label="Prescribed target load in kilograms"
                              value={rx.targetLoadKg || 0}
                              onChange={(e) => {
                                const l = parseFloat(e.target.value) || 0;
                                setDays(d =>
                                  d.map(item =>
                                    item.id === day.id
                                      ? {
                                          ...item,
                                          prescriptions: item.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, targetLoadKg: l } : p
                                          )
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-16 h-9 text-center border border-border rounded bg-secondary font-bold tabular-nums focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                            />

                            {day.prescriptions.length > 1 && (
                              <button
                                type="button"
                                aria-label="Remove exercise from training day"
                                onClick={() => handleRemoveRx(day.id, rx.id)}
                                className="text-destructive hover:opacity-80 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-card border-t border-border flex justify-end p-4">
            <Button type="submit" variant="brand" disabled={savedNotice} className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand">
              {savedNotice ? (
                <span className="flex items-center gap-1.5" role="status" aria-live="polite">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Program Saved &amp; Published!
                </span>
              ) : (
                "Publish Training Program"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
