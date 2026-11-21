"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Program, ProgramDay, ExercisePrescription } from "@/types";
import { getExerciseIndex, resolveExerciseThumbnail, ALL_MUSCLE_GROUPS } from "@/lib/exercises";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import { Plus, Trash2, CheckCircle2, Layers, Eye, Dumbbell, Search, BookOpen, ChevronRight, X, AlertTriangle } from "lucide-react";

export function ProgramBuilder() {
  const { state, addProgram, deleteProgram, currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Technique pose inspection modal state
  const [previewExercise, setPreviewExercise] = useState<{ id: string; name: string } | null>(null);

  // Visual Exercise Picker modal state
  const [visualPickerDayId, setVisualPickerDayId] = useState<string | null>(null);
  const [pickerTargetRxId, setPickerTargetRxId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerMuscle, setPickerMuscle] = useState<string>("all");

  // Program deletion confirmation modal state
  const [confirmDeleteProg, setConfirmDeleteProg] = useState<Program | null>(null);

  const fullExerciseCatalog = React.useMemo(() => {
    const repDb = getExerciseIndex();
    return [
      ...state.exercises,
      ...repDb.filter(r => !state.exercises.some(e => e.id === r.id || e.name === r.name))
    ];
  }, [state.exercises]);

  // Filtered exercises for the visual picker dialog
  const pickerFilteredExercises = React.useMemo(() => {
    const repDb = getExerciseIndex();
    const q = pickerSearch.trim().toLowerCase();
    return repDb.filter(ex => {
      if (q) {
        const match =
          ex.name.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (pickerMuscle !== "all") {
        if (ex.primaryMuscle !== pickerMuscle && !ex.secondaryMuscles?.includes(pickerMuscle as any)) {
          return false;
        }
      }
      return true;
    }).slice(0, 40);
  }, [pickerSearch, pickerMuscle]);

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

  const handleRemoveDay = (dayId: string) => {
    setDays(prevDays => {
      const remaining = prevDays.filter(d => d.id !== dayId);
      return remaining.map((d, idx) => ({
        ...d,
        dayNumber: idx + 1,
        name: d.name.startsWith("Day ") ? `Day ${idx + 1}: ${d.name.split(": ")[1] || "Strength Session"}` : d.name
      }));
    });
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

  const handleSelectSpecificExercise = (dayId: string, ex: { id: string; name: string }) => {
    if (pickerTargetRxId) {
      // Replace existing prescription exercise
      setDays(prevDays =>
        prevDays.map(d => {
          if (d.id === dayId) {
            return {
              ...d,
              prescriptions: d.prescriptions.map(rx =>
                rx.id === pickerTargetRxId
                  ? { ...rx, exerciseId: ex.id, exerciseName: ex.name }
                  : rx
              )
            };
          }
          return d;
        })
      );
      setPickerTargetRxId(null);
    } else {
      // Append new prescription to day
      const newRx: ExercisePrescription = {
        id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: 3,
        repTarget: "8-10",
        targetLoadKg: 60,
        targetRpe: 8,
        restSeconds: 120
      };
      setDays(prevDays =>
        prevDays.map(d => {
          if (d.id === dayId) {
            return { ...d, prescriptions: [...d.prescriptions, newRx] };
          }
          return d;
        })
      );
    }
    setVisualPickerDayId(null);
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

  const handleDeleteProgram = (prog: Program) => {
    deleteProgram(prog.id);
    setConfirmDeleteProg(null);
    setDeleteNotice(`Program "${prog.title}" was successfully deleted.`);
    setTimeout(() => setDeleteNotice(null), 3500);
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
      {/* Deletion / Action Toast Notification */}
      {deleteNotice && (
        <div role="status" aria-live="polite" className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button type="button" onClick={() => setDeleteNotice(null)} className="text-destructive/80 hover:text-destructive p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Existing Programs Summary with Delete / Remove Action */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="brand">Program Library</Badge>
              <span className="text-xs text-muted-foreground font-mono">({state.programs.length} Active Templates)</span>
            </div>
          </div>
          <CardTitle className="mt-1">Active Coaching Templates</CardTitle>
          <CardDescription>
            Reusable training systems and periodized blocks. Coaches can assign, edit, or remove programs anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.programs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs space-y-2">
              <Layers className="w-8 h-8 mx-auto opacity-40 text-brand" />
              <p>No programs available in library. Create a new program below.</p>
            </div>
          ) : (
            state.programs.map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border/80 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm">{prog.title}</h4>
                    <Badge variant="outline" className="capitalize text-xs">{prog.level}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{prog.description}</p>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                    <span>{prog.targetWeeks} Weeks Duration</span>
                    <span>•</span>
                    <span>{prog.days.length} Training Days/Week</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <Badge variant="secondary" className="text-xs hidden md:inline-flex">Assigned to Athletes</Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteProg(prog)}
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5 h-8 font-semibold cursor-pointer"
                    title={`Delete program ${prog.title}`}
                    aria-label={`Delete program ${prog.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remove Program</span>
                  </Button>
                </div>
              </div>
            ))
          )}
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
                <Button type="button" variant="outline" size="sm" onClick={handleAddDay} className="gap-1.5 text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Add Training Day
                </Button>
              </div>

              <div className="space-y-4">
                {days.map((day, dIdx) => (
                  <div key={day.id} className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <Input
                        type="text"
                        value={day.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDays(d => d.map(item => item.id === day.id ? { ...item, name: val } : item));
                        }}
                        className="font-bold text-sm max-w-xs h-9 bg-card"
                      />

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Dedicated Search Exercises Button */}
                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() => {
                            setVisualPickerDayId(day.id);
                            setPickerTargetRxId(null);
                            setPickerSearch("");
                            setPickerMuscle("all");
                          }}
                          className="text-xs gap-1.5 font-bold cursor-pointer shadow-xs"
                          title="Search 700+ exercises to add to this day"
                        >
                          <Search className="w-3.5 h-3.5" /> Search Exercises
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddExerciseToDay(day.id)}
                          className="text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Quick Add
                        </Button>

                        {days.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDay(day.id)}
                            className="text-xs gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title={`Remove day ${day.name}`}
                            aria-label={`Remove day ${day.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Day
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Prescriptions */}
                    <div className="space-y-2.5">
                      {day.prescriptions.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-border bg-card/50 text-center space-y-2">
                          <p className="text-xs text-muted-foreground">No exercises prescribed for this day yet.</p>
                          <Button
                            type="button"
                            variant="brand"
                            size="sm"
                            onClick={() => {
                              setVisualPickerDayId(day.id);
                              setPickerTargetRxId(null);
                              setPickerSearch("");
                              setPickerMuscle("all");
                            }}
                            className="text-xs gap-1.5 font-bold"
                          >
                            <Search className="w-3.5 h-3.5" /> Search Exercises
                          </Button>
                        </div>
                      ) : (
                        day.prescriptions.map((rx) => {
                          const rxThumb = resolveExerciseThumbnail(rx.exerciseId, rx.exerciseName);

                          return (
                            <div key={rx.id} className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                {/* Thumbnail preview button with 2-pose inspection */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                                  className="w-10 h-10 rounded-lg bg-secondary/80 border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand"
                                  title="Inspect 2-pose demonstration and movement form"
                                  aria-label={`Inspect technique and poses for ${rx.exerciseName}`}
                                >
                                  {rxThumb ? (
                                    <img
                                      src={rxThumb}
                                      alt={rx.exerciseName}
                                      loading="lazy"
                                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                      <Dumbbell className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-brand/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3.5 h-3.5 text-brand" />
                                  </div>
                                </button>

                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-foreground text-xs truncate">{rx.exerciseName}</span>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                                      className="text-[10px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20 shrink-0"
                                      title="Inspect start and peak poses"
                                    >
                                      <Eye className="w-2.5 h-2.5 text-brand" />
                                      <span>Poses</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <select
                                      aria-label="Change exercise"
                                      value={rx.exerciseId}
                                      onChange={(e) => {
                                        const ex = fullExerciseCatalog.find(x => x.id === e.target.value);
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
                                      className="flex-1 font-medium bg-transparent text-foreground border border-border rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none min-h-[32px] truncate"
                                    >
                                      {fullExerciseCatalog.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                                      ))}
                                    </select>

                                    {/* Dedicated Search Button to pick from 708 RepDB library */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setVisualPickerDayId(day.id);
                                        setPickerTargetRxId(rx.id);
                                        setPickerSearch("");
                                        setPickerMuscle("all");
                                      }}
                                      className="h-8 px-2.5 text-[11px] gap-1 font-semibold text-brand border-brand/30 hover:bg-brand/10 shrink-0 cursor-pointer"
                                      title="Search 700+ exercises to replace this movement"
                                    >
                                      <Search className="w-3 h-3 text-brand" />
                                      <span>Search</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">Sets:</span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  enterKeyHint="next"
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
                                  enterKeyHint="next"
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
                                  inputMode="decimal"
                                  enterKeyHint="done"
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

                                <button
                                  type="button"
                                  aria-label="Remove exercise from training day"
                                  onClick={() => handleRemoveRx(day.id, rx.id)}
                                  className="text-destructive hover:bg-destructive/10 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none cursor-pointer transition-colors"
                                  title="Remove exercise"
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
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
                <span className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" aria-hidden="true" /> Publish Program Template
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Delete Program Confirmation Dialog */}
      <Dialog open={!!confirmDeleteProg} onOpenChange={(open) => !open && setConfirmDeleteProg(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Delete Training Program?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              Are you sure you want to permanently delete <strong className="text-foreground font-semibold">"{confirmDeleteProg?.title}"</strong>? This will remove this periodization template from the coaching library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteProg(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => confirmDeleteProg && handleDeleteProgram(confirmDeleteProg)}
              className="text-xs gap-1.5 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete Program</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visual Exercise Picker Modal with Search Button & Filters */}
      <Dialog open={!!visualPickerDayId} onOpenChange={(open) => !open && setVisualPickerDayId(null)}>
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                {pickerTargetRxId ? "Search & Replace Exercise" : "Search & Add Exercise"}
              </DialogTitle>
            </div>
            <Badge variant="brand" className="text-xs font-mono">
              708 RepDB Catalog
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {pickerTargetRxId
              ? "Search and choose a movement to replace the selected prescription."
              : "Search and choose a movement to add to this training day."}
          </DialogDescription>

          {/* Search Box with Dedicated Search and Clear Buttons */}
          <div className="flex gap-2 items-center mt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="program-builder-picker-search"
                type="text"
                enterKeyHint="search"
                placeholder="Search by name, muscle, equipment (e.g. Squat, Barbell, Dumbbell)…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-10 pr-8 h-11 text-xs sm:text-sm rounded-xl bg-card border-border"
                aria-label="Search exercise catalog"
              />
              {pickerSearch && (
                <button
                  type="button"
                  onClick={() => setPickerSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="brand"
              onClick={() => {
                const el = document.getElementById("program-builder-picker-search");
                if (el) el.focus();
              }}
              className="h-11 px-4 text-xs font-bold gap-1.5 rounded-xl shrink-0 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </Button>
          </div>

          {/* Muscle Filter Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
            {ALL_MUSCLE_GROUPS.slice(0, 8).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPickerMuscle(m.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                  pickerMuscle === m.id
                    ? "bg-brand text-white border-brand shadow-xs"
                    : "bg-secondary/60 text-muted-foreground border-border hover:bg-secondary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        <DialogContent className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-2.5">
          {pickerFilteredExercises.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No movements matching “{pickerSearch}”. Try another keyword or muscle filter.
            </div>
          ) : (
            pickerFilteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl border border-border bg-card hover:border-brand/40 transition-colors flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-secondary/80 border border-border overflow-hidden shrink-0 p-0.5">
                    {ex.thumbUrl ? (
                      <img src={ex.thumbUrl} alt="" loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{ex.name}</h4>
                    <span className="text-[11px] text-muted-foreground capitalize block truncate mt-0.5">
                      {ex.category} • {ex.primaryMuscle} • {ex.equipment}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewExercise({ id: ex.id, name: ex.name })}
                    className="h-8 px-2.5 text-xs gap-1 font-semibold cursor-pointer"
                    title="Inspect 2-pose movement demonstration"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand" />
                    <span className="hidden sm:inline">Preview Poses</span>
                  </Button>

                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    onClick={() => {
                      if (visualPickerDayId) {
                        handleSelectSpecificExercise(visualPickerDayId, { id: ex.id, name: ex.name });
                      }
                    }}
                    className="h-8 px-3 text-xs gap-1 font-bold cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{pickerTargetRxId ? "Select Movement" : "Add to Day"}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </DialogContent>

        <DialogFooter className="border-t border-border/80 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setVisualPickerDayId(null);
              setPickerTargetRxId(null);
            }}
            className="text-xs"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Movement Technique & 2-Pose Demonstration Guide Modal */}
      <ExerciseDetailModal
        exerciseId={previewExercise?.id || null}
        open={!!previewExercise}
        onOpenChange={(open) => !open && setPreviewExercise(null)}
      />
    </div>
  );
}
