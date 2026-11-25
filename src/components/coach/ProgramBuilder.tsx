"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Program, ProgramDay, ExercisePrescription, AthleteProfile } from "@/types";
import { getExerciseIndex, resolveExerciseThumbnail, ALL_MUSCLE_GROUPS } from "@/lib/exercises";
import { soundController } from "@/lib/audio";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Eye,
  Dumbbell,
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  X,
  Users,
  UserPlus,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
  Filter,
  ArrowRight,
  Clock,
  Copy
} from "lucide-react";

export function ProgramBuilder() {
  const { state, addProgram, deleteProgram, updateAthleteProfile, currentUser } = useAuth();

  // Top-level Navigation: "library" (browse & assign) vs "create" (focused builder)
  const [activeView, setActiveView] = useState<"library" | "create">("library");

  // Notifications
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [assignSuccessNotice, setAssignSuccessNotice] = useState<string | null>(null);

  // Expanded program breakdown accordion in library
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  // Program Assignment Modal State
  const [assigningProgram, setAssigningProgram] = useState<Program | null>(null);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<string>>(new Set());
  const [squadFilter, setSquadFilter] = useState<string>("all");
  const [athleteSearchQuery, setAthleteSearchQuery] = useState("");

  // Program Deletion Confirmation Modal State
  const [confirmDeleteProg, setConfirmDeleteProg] = useState<Program | null>(null);

  // Exercise Poses Inspection Modal State
  const [previewExercise, setPreviewExercise] = useState<{ id: string; name: string } | null>(null);

  // Visual Exercise Picker Modal State (RepDB 708 catalog)
  const [visualPickerDayId, setVisualPickerDayId] = useState<string | null>(null);
  const [pickerTargetRxId, setPickerTargetRxId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerMuscle, setPickerMuscle] = useState<string>("all");

  // New Program Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [targetAthleteId, setTargetAthleteId] = useState<string>("");

  // Days State for builder
  const [days, setDays] = useState<ProgramDay[]>([
    {
      id: "day-1",
      name: "Day 1: Lower Body Strength (Squat Focus)",
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
        },
        {
          id: "rx-2",
          exerciseId: "ex-2",
          exerciseName: "Romanian Deadlift",
          sets: 3,
          repTarget: "8-10",
          targetLoadKg: 100,
          targetRpe: 8,
          restSeconds: 120
        }
      ]
    },
    {
      id: "day-2",
      name: "Day 2: Upper Body Power (Bench Focus)",
      dayNumber: 2,
      prescriptions: [
        {
          id: "rx-3",
          exerciseId: "ex-3",
          exerciseName: "Barbell Bench Press",
          sets: 4,
          repTarget: "6",
          targetLoadKg: 100,
          targetRpe: 8,
          restSeconds: 150
        }
      ]
    }
  ]);

  // Active day in builder to avoid vertical clutter
  const [activeDayId, setActiveDayId] = useState<string>("day-1");

  const fullExerciseCatalog = useMemo(() => {
    const repDb = getExerciseIndex();
    return [
      ...state.exercises,
      ...repDb.filter(r => !state.exercises.some(e => e.id === r.id || e.name === r.name))
    ];
  }, [state.exercises]);

  // Unique squads for filtering
  const allSquads = useMemo(() => {
    const squadSet = new Set<string>();
    state.athletes.forEach(a => {
      if (a.squad) squadSet.add(a.squad);
    });
    return Array.from(squadSet);
  }, [state.athletes]);

  // Filtered exercises for RepDB visual picker dialog
  const pickerFilteredExercises = useMemo(() => {
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

  // Filtered athletes in assignment modal
  const modalFilteredAthletes = useMemo(() => {
    return state.athletes.filter(ath => {
      if (squadFilter !== "all" && ath.squad !== squadFilter) {
        return false;
      }
      if (athleteSearchQuery.trim()) {
        const q = athleteSearchQuery.toLowerCase();
        const matchesName = ath.name.toLowerCase().includes(q);
        const matchesSquad = ath.squad?.toLowerCase().includes(q);
        if (!matchesName && !matchesSquad) return false;
      }
      return true;
    });
  }, [state.athletes, squadFilter, athleteSearchQuery]);

  // Helper: Open assignment modal for a program
  const handleOpenAssignModal = (prog: Program) => {
    soundController.playPop();
    setAssigningProgram(prog);
    // Pre-populate with athletes currently assigned to this program
    const currentlyAssigned = new Set(
      state.athletes.filter(a => a.assignedProgramId === prog.id).map(a => a.id)
    );
    setSelectedAthleteIds(currentlyAssigned);
    setSquadFilter("all");
    setAthleteSearchQuery("");
  };

  // Helper: Toggle single athlete selection in modal
  const handleToggleAthlete = (athleteId: string) => {
    soundController.playPop();
    setSelectedAthleteIds(prev => {
      const next = new Set(prev);
      if (next.has(athleteId)) {
        next.delete(athleteId);
      } else {
        next.add(athleteId);
      }
      return next;
    });
  };

  // Helper: Select all currently filtered athletes
  const handleSelectAllFiltered = () => {
    soundController.playPop();
    setSelectedAthleteIds(prev => {
      const next = new Set(prev);
      modalFilteredAthletes.forEach(a => next.add(a.id));
      return next;
    });
  };

  // Helper: Deselect all currently filtered athletes
  const handleDeselectAllFiltered = () => {
    soundController.playPop();
    setSelectedAthleteIds(prev => {
      const next = new Set(prev);
      modalFilteredAthletes.forEach(a => next.delete(a.id));
      return next;
    });
  };

  // Helper: Confirm program assignment
  const handleConfirmAssignment = () => {
    if (!assigningProgram) return;

    // 1. Assign selected athletes to this program
    selectedAthleteIds.forEach(athId => {
      updateAthleteProfile(athId, {
        assignedProgramId: assigningProgram.id,
        assignedProgramTitle: assigningProgram.title
      });
    });

    // 2. Unassign any athletes who previously had this program but were unselected
    state.athletes.forEach(ath => {
      if (ath.assignedProgramId === assigningProgram.id && !selectedAthleteIds.has(ath.id)) {
        updateAthleteProfile(ath.id, {
          assignedProgramId: "",
          assignedProgramTitle: "Unassigned"
        });
      }
    });

    soundController.playLevelUp();
    setAssignSuccessNotice(
      `Successfully assigned "${assigningProgram.title}" to ${selectedAthleteIds.size} athletes!`
    );
    setAssigningProgram(null);
    setTimeout(() => setAssignSuccessNotice(null), 4000);
  };

  // Builder: Add a new training day
  const handleAddDay = () => {
    soundController.playPop();
    const nextDayNum = days.length + 1;
    const newDayId = `day-${Date.now()}`;
    const newDay: ProgramDay = {
      id: newDayId,
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
    setActiveDayId(newDayId);
  };

  // Builder: Remove a day
  const handleRemoveDay = (dayId: string) => {
    soundController.playPop();
    setDays(prevDays => {
      const remaining = prevDays.filter(d => d.id !== dayId);
      const renumbered = remaining.map((d, idx) => ({
        ...d,
        dayNumber: idx + 1,
        name: d.name.startsWith("Day ")
          ? `Day ${idx + 1}: ${d.name.split(": ")[1] || "Strength Session"}`
          : d.name
      }));
      if (activeDayId === dayId && renumbered.length > 0) {
        setActiveDayId(renumbered[0].id);
      }
      return renumbered;
    });
  };

  // Builder: Quick add exercise to active day
  const handleAddExerciseToDay = (dayId: string) => {
    soundController.playPop();
    const defaultEx = state.exercises[1] || state.exercises[0];
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.id === dayId) {
          const newRx: ExercisePrescription = {
            id: `rx-${Date.now()}`,
            exerciseId: defaultEx.id,
            exerciseName: defaultEx.name,
            sets: 3,
            repTarget: "8-10",
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

  // Builder: Replace or append selected exercise from visual picker
  const handleSelectSpecificExercise = (dayId: string, ex: { id: string; name: string }) => {
    soundController.playPop();
    if (pickerTargetRxId) {
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

  // Builder: Remove single exercise prescription
  const handleRemoveRx = (dayId: string, rxId: string) => {
    soundController.playPop();
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.id === dayId) {
          return { ...d, prescriptions: d.prescriptions.filter(rx => rx.id !== rxId) };
        }
        return d;
      })
    );
  };

  // Program Delete confirmation action
  const handleDeleteProgram = (prog: Program) => {
    soundController.playPop();
    deleteProgram(prog.id);
    setConfirmDeleteProg(null);
    setDeleteNotice(`Program "${prog.title}" was successfully deleted.`);
    setTimeout(() => setDeleteNotice(null), 3500);
  };

  // Helper: Clone an existing program into the builder to customize for an athlete
  const handleCloneAndCustomize = (prog: Program, athleteId?: string) => {
    soundController.playPop();
    const targetAth = athleteId ? state.athletes.find(a => a.id === athleteId) : null;
    setTitle(targetAth ? `${targetAth.name} - ${prog.title}` : `${prog.title} (Customized)`);
    setDescription(
      `Customized adaptation for ${targetAth ? targetAth.name : "athlete targets"}. ${prog.description}`
    );
    setWeeks(prog.targetWeeks);
    setLevel(prog.level);

    // Deep clone training days
    const clonedDays: ProgramDay[] = prog.days.map((d, dIdx) => ({
      ...d,
      id: `day-${Date.now()}-${dIdx}`,
      prescriptions: d.prescriptions.map((rx, rIdx) => ({
        ...rx,
        id: `rx-${Date.now()}-${dIdx}-${rIdx}`
      }))
    }));
    setDays(clonedDays);
    if (clonedDays.length > 0) {
      setActiveDayId(clonedDays[0].id);
    }
    if (athleteId) {
      setTargetAthleteId(athleteId);
    }
    setActiveView("create");
  };

  // Publish / Save New Program
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
    soundController.playLevelUp();
    setSavedNotice(true);

    if (targetAthleteId) {
      const targetAth = state.athletes.find(a => a.id === targetAthleteId);
      updateAthleteProfile(targetAthleteId, {
        assignedProgramId: newProg.id,
        assignedProgramTitle: newProg.title
      });
      setTimeout(() => {
        setSavedNotice(false);
        setActiveView("library");
        setTargetAthleteId("");
        setAssignSuccessNotice(
          `Custom program "${newProg.title}" created and directly assigned to ${targetAth?.name || "the athlete"}!`
        );
        setTimeout(() => setAssignSuccessNotice(null), 4000);
      }, 1200);
    } else {
      setTimeout(() => {
        setSavedNotice(false);
        setActiveView("library");
        handleOpenAssignModal(newProg);
      }, 1200);
    }
  };

  // Current active day object
  const currentDay = days.find(d => d.id === activeDayId) || days[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Toast / Notification Banners */}
      {assignSuccessNotice && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            <span>{assignSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setAssignSuccessNotice(null)}
            className="text-success/80 hover:text-success p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {deleteNotice && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteNotice(null)}
            className="text-destructive/80 hover:text-destructive p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Segmented Sub-Navigation: Clean, modern & simple for coaches */}
      <div className="flex items-center justify-between gap-3 p-1.5 bg-card border border-border rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => {
              soundController.playPop();
              setActiveView("library");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-[background-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "library"
                ? "bg-brand text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Program Library</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeView === "library" ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {state.programs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundController.playPop();
              setActiveView("create");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-[background-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "create"
                ? "bg-brand text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Program</span>
          </button>
        </div>

        {activeView === "library" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              soundController.playPop();
              setActiveView("create");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-brand/30 text-brand hover:bg-brand/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Program</span>
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PROGRAM LIBRARY & ATHLETE ASSIGNMENT                             */}
      {/* ========================================================================= */}
      {activeView === "library" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {state.programs.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-10 text-center rounded-2xl bg-card/50">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">No Programs in Library Yet</h3>
                <p className="text-xs text-muted-foreground">
                  Build custom periodized templates with sets, reps, and target weights, then assign them directly to your athletes or squads.
                </p>
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveView("create")}
                  className="gap-2 font-bold cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4" /> Create Your First Program
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {state.programs.map(prog => {
                const assignedAthletes = state.athletes.filter(
                  a => a.assignedProgramId === prog.id
                );
                const isAssigned = assignedAthletes.length > 0;
                const isExpanded = expandedProgramId === prog.id;

                return (
                  <Card
                    key={prog.id}
                    className="border-border bg-card hover:border-brand/40 transition-colors duration-150 rounded-2xl overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Top Row: Title, Level, Duration Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-foreground">{prog.title}</h3>
                            <Badge variant="outline" className="capitalize text-[11px] font-semibold">
                              {prog.level}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{prog.description}</p>
                        </div>

                        {/* Quick Program Stats */}
                        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-secondary/60 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <strong className="text-foreground">{prog.targetWeeks}</strong> wks
                          </span>
                          <span className="inline-flex items-center gap-1 bg-secondary/60 px-2.5 py-1 rounded-lg">
                            <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                            <strong className="text-foreground">{prog.days.length}</strong> days/wk
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Assigned Athletes Preview */}
                      <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isAssigned ? (
                            <Badge variant="success" className="gap-1.5 font-semibold text-xs py-1 px-2.5">
                              <Users className="w-3.5 h-3.5" />
                              <span>{assignedAthletes.length} Athletes Assigned</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-xs py-1 px-2.5">
                              Not assigned to any athlete
                            </Badge>
                          )}

                          {isAssigned && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-xs hidden md:inline">
                              {assignedAthletes.slice(0, 3).map(a => a.name).join(", ")}
                              {assignedAthletes.length > 3 && ` +${assignedAthletes.length - 3} more`}
                            </span>
                          )}
                        </div>

                        {/* Direct Action Buttons: Assign Athletes & Remove */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedProgramId(isExpanded ? null : prog.id)}
                            className="text-xs gap-1 text-muted-foreground hover:text-foreground h-9 px-2.5 cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Days" : "View Days"}</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloneAndCustomize(prog)}
                            className="text-xs gap-1 h-9 px-2.5 cursor-pointer border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                            title="Clone this template into the builder to customize for an athlete"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Clone &amp; Tweak</span>
                          </Button>

                          <Button
                            type="button"
                            variant="brand"
                            size="sm"
                            onClick={() => handleOpenAssignModal(prog)}
                            className="h-9 px-3.5 text-xs font-bold gap-1.5 shadow-xs cursor-pointer min-h-[36px]"
                            title={`Assign ${prog.title} to athletes or squads`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign Athletes</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteProg(prog)}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                            title={`Delete program ${prog.title}`}
                            aria-label={`Delete program ${prog.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Collapsible Days & Exercise Prescriptions Breakdown */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-border/80 space-y-2.5 animate-in fade-in duration-200">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Training Schedule &amp; Prescriptions ({prog.days.length} Days)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {prog.days.map(d => (
                              <div
                                key={d.id}
                                className="p-3 rounded-xl bg-secondary/40 border border-border/70 space-y-1.5 text-xs"
                              >
                                <span className="font-bold text-foreground block">{d.name}</span>
                                <div className="space-y-1">
                                  {d.prescriptions.map(rx => (
                                    <div
                                      key={rx.id}
                                      className="flex items-center justify-between text-[11px] text-muted-foreground"
                                    >
                                      <span className="truncate max-w-[180px] font-medium text-foreground">
                                        {rx.exerciseName}
                                      </span>
                                      <span className="font-mono text-muted-foreground shrink-0">
                                        {rx.sets}s × {rx.repTarget}r {rx.targetLoadKg ? `@ ${rx.targetLoadKg}kg` : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STREAMLINED PROGRAM BUILDER (Clean, No Clutter, One Day at a Time)*/}
      {/* ========================================================================= */}
      {activeView === "create" && (
        <form onSubmit={handlePublishProgram} className="space-y-4 animate-in fade-in duration-200">
          {/* Card 1: Program Essentials */}
          <Card className="border-border shadow-xs rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Program Essentials</CardTitle>
                  <CardDescription className="text-xs">
                    Define block duration, target experience tier, and coaching rationale.
                  </CardDescription>
                </div>
                <Badge variant="brand" className="text-xs">Step 1</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="program-title-input"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                >
                  Program Name
                </label>
                <Input
                  id="program-title-input"
                  name="programTitle"
                  type="text"
                  placeholder="e.g. Apex Hypertrophy Mesocycle B"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  autoComplete="off"
                  className="min-h-[44px] text-sm font-semibold rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duration Pills */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Duration (Weeks)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[4, 6, 8, 12].map(numWeeks => (
                      <button
                        key={numWeeks}
                        type="button"
                        onClick={() => {
                          soundController.playPop();
                          setWeeks(numWeeks);
                        }}
                        className={`h-11 rounded-xl text-xs font-bold transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] border cursor-pointer ${
                          weeks === numWeeks
                            ? "bg-brand text-white border-brand"
                            : "bg-card text-muted-foreground border-border hover:bg-secondary/60"
                        }`}
                      >
                        {numWeeks} Wks
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Pills */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Experience Level
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["beginner", "intermediate", "advanced"] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          soundController.playPop();
                          setLevel(lvl);
                        }}
                        className={`h-11 rounded-xl text-xs font-bold capitalize transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] border cursor-pointer ${
                          level === lvl
                            ? "bg-brand text-white border-brand"
                            : "bg-card text-muted-foreground border-border hover:bg-secondary/60"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personalize for Specific Athlete (Optional) */}
              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <label htmlFor="target-athlete-select" className="text-xs font-bold text-foreground">
                      Personalize for Specific Athlete (Optional)
                    </label>
                  </div>
                  {targetAthleteId && (
                    <Badge variant="brand" className="text-[10px]">
                      1-on-1 Custom Block
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Building a tailored program for one athlete? Select them below to automatically assign this custom block upon saving.
                </p>
                <select
                  id="target-athlete-select"
                  value={targetAthleteId}
                  onChange={e => {
                    const athId = e.target.value;
                    setTargetAthleteId(athId);
                    const ath = state.athletes.find(a => a.id === athId);
                    if (ath && (!title || title.startsWith("Apex") || title === "")) {
                      setTitle(`${ath.name} - Personalized Block`);
                    }
                  }}
                  className="w-full text-xs bg-card text-foreground border border-border rounded-xl px-3 py-2 font-medium focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <option value="">None (Save to General Library)</option>
                  {state.athletes.map(ath => (
                    <option key={ath.id} value={ath.id}>
                      {ath.name} {ath.squad ? `(${ath.squad})` : ""} — Current: {ath.assignedProgramTitle || "Unassigned"}
                    </option>
                  ))}
                </select>
                {targetAthleteId && (
                  <div className="text-[11px] text-brand font-semibold flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Will automatically assign directly to{" "}
                      {state.athletes.find(a => a.id === targetAthleteId)?.name} when saved.
                    </span>
                  </div>
                )}
              </div>

              {/* Rationale / Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="program-desc-input"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                >
                  Block Focus &amp; Periodization Rationale
                </label>
                <Input
                  id="program-desc-input"
                  name="programDescription"
                  type="text"
                  placeholder="Target goals, volume ramps, and deload scheduling…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  autoComplete="off"
                  className="min-h-[44px] text-xs rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Training Days & Prescriptions (Tabbed to avoid vertical clutter) */}
          <Card className="border-border rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Training Days &amp; Exercises</CardTitle>
                  <CardDescription className="text-xs">
                    Configure exercise targets, rep schemes, and rest intervals per day.
                  </CardDescription>
                </div>
                <Badge variant="brand" className="text-xs">Step 2</Badge>
              </div>

              {/* Horizontal Day Tabs: Clean & uncluttered */}
              <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
                {days.map((day, idx) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      soundController.playPop();
                      setActiveDayId(day.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                      activeDayId === day.id
                        ? "bg-brand text-white border-brand"
                        : "bg-secondary/60 text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <span>Day {idx + 1}</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      ({day.prescriptions.length} ex)
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border border-dashed border-border hover:border-brand/60 text-brand bg-brand/5 hover:bg-brand/10 transition-[background-color,border-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Day</span>
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {currentDay && (
                <div className="space-y-4">
                  {/* Active Day Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={currentDay.name}
                        onChange={e => {
                          const val = e.target.value;
                          setDays(d =>
                            d.map(item => (item.id === currentDay.id ? { ...item, name: val } : item))
                          );
                        }}
                        className="font-bold text-sm h-10 bg-card rounded-lg"
                        placeholder="e.g. Day 1: Heavy Lower Body"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="brand"
                        size="sm"
                        onClick={() => {
                          setVisualPickerDayId(currentDay.id);
                          setPickerTargetRxId(null);
                          setPickerSearch("");
                          setPickerMuscle("all");
                        }}
                        className="text-xs gap-1.5 font-bold cursor-pointer shadow-xs h-9 px-3"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search 708 Exercises</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddExerciseToDay(currentDay.id)}
                        className="text-xs gap-1 h-9 px-3 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Quick Add
                      </Button>

                      {days.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDay(currentDay.id)}
                          className="text-xs text-destructive hover:bg-destructive/10 h-9 px-2 cursor-pointer"
                          title="Remove this training day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Prescriptions List for Active Day */}
                  <div className="space-y-2.5">
                    {currentDay.prescriptions.length === 0 ? (
                      <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-2 bg-card/40">
                        <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
                        <p className="text-xs text-muted-foreground">No exercises added to this day yet.</p>
                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() => {
                            setVisualPickerDayId(currentDay.id);
                            setPickerTargetRxId(null);
                            setPickerSearch("");
                            setPickerMuscle("all");
                          }}
                          className="text-xs gap-1.5 font-bold cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" /> Search Exercise Catalog
                        </Button>
                      </div>
                    ) : (
                      currentDay.prescriptions.map(rx => {
                        const rxThumb = resolveExerciseThumbnail(rx.exerciseId, rx.exerciseName);

                        return (
                          <div
                            key={rx.id}
                            className="p-3.5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs"
                          >
                            {/* Exercise Info & Thumbnail */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setPreviewExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                                className="w-11 h-11 rounded-xl bg-secondary/80 border border-border overflow-hidden shrink-0 group relative p-0.5 cursor-pointer hover:border-brand/60"
                                title="Inspect 2-pose movement demonstration"
                              >
                                {rxThumb ? (
                                  <img
                                    src={rxThumb}
                                    alt={rx.exerciseName}
                                    loading="lazy"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Dumbbell className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-foreground text-xs truncate">
                                    {rx.exerciseName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewExercise({ id: rx.exerciseId, name: rx.exerciseName })}
                                    className="text-[10px] font-medium text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20 shrink-0"
                                  >
                                    <Eye className="w-2.5 h-2.5 text-brand" />
                                    <span>Poses</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <select
                                    aria-label="Change exercise"
                                    value={rx.exerciseId}
                                    onChange={e => {
                                      const ex = fullExerciseCatalog.find(x => x.id === e.target.value);
                                      if (!ex) return;
                                      setDays(d =>
                                        d.map(item =>
                                          item.id === currentDay.id
                                            ? {
                                                ...item,
                                                prescriptions: item.prescriptions.map(p =>
                                                  p.id === rx.id
                                                    ? { ...p, exerciseId: ex.id, exerciseName: ex.name }
                                                    : p
                                                )
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                    className="text-[11px] font-medium bg-secondary text-foreground border border-border rounded-lg px-2 py-1 truncate max-w-[200px]"
                                  >
                                    {fullExerciseCatalog.slice(0, 50).map(ex => (
                                      <option key={ex.id} value={ex.id}>
                                        {ex.name}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVisualPickerDayId(currentDay.id);
                                      setPickerTargetRxId(rx.id);
                                      setPickerSearch("");
                                      setPickerMuscle("all");
                                    }}
                                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                                  >
                                    Search RepDB
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Stepper Inputs: Sets, Reps, Weight */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <div className="flex items-center gap-1 bg-secondary/50 px-2.5 py-1 rounded-xl border border-border/60">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Sets</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={rx.sets}
                                  onChange={e => {
                                    const s = parseInt(e.target.value) || 1;
                                    setDays(d =>
                                      d.map(item =>
                                        item.id === currentDay.id
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
                                  className="w-10 h-8 text-center bg-card rounded font-bold text-xs tabular-nums border border-border focus:outline-brand"
                                />
                              </div>

                              <div className="flex items-center gap-1 bg-secondary/50 px-2.5 py-1 rounded-xl border border-border/60">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Reps</span>
                                <input
                                  type="text"
                                  value={rx.repTarget}
                                  onChange={e => {
                                    const r = e.target.value;
                                    setDays(d =>
                                      d.map(item =>
                                        item.id === currentDay.id
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
                                  className="w-12 h-8 text-center bg-card rounded font-bold text-xs tabular-nums border border-border focus:outline-brand"
                                />
                              </div>

                              <div className="flex items-center gap-1 bg-secondary/50 px-2.5 py-1 rounded-xl border border-border/60">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Load (kg)</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="2.5"
                                  value={rx.targetLoadKg || 0}
                                  onChange={e => {
                                    const l = parseFloat(e.target.value) || 0;
                                    setDays(d =>
                                      d.map(item =>
                                        item.id === currentDay.id
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
                                  className="w-14 h-8 text-center bg-card rounded font-bold text-xs tabular-nums border border-border focus:outline-brand"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveRx(currentDay.id, rx.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                                title="Remove exercise"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-card border-t border-border flex items-center justify-between p-4 rounded-b-2xl">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("library")}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="brand"
                disabled={savedNotice}
                className="min-h-[44px] px-6 text-xs font-bold gap-2 cursor-pointer shadow-xs"
              >
                {savedNotice ? (
                  <span className="flex items-center gap-1.5" role="status" aria-live="polite">
                    <CheckCircle2 className="w-4 h-4" /> Program Saved!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Save &amp; Assign Program
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN PROGRAM TO ATHLETES (Fast, multi-select, squad filters)    */}
      {/* ========================================================================= */}
      <Dialog
        open={!!assigningProgram}
        onOpenChange={open => {
          if (!open) setAssigningProgram(null);
        }}
      >
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-border bg-card shadow-xl">
          {/* Modal Header */}
          <DialogHeader className="p-5 border-b border-border/80 bg-secondary/30">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-brand" />
                  <DialogTitle className="text-base font-bold">Assign Program</DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select athletes or squads to assign to{" "}
                  <strong className="text-foreground">"{assigningProgram?.title}"</strong>
                </DialogDescription>
              </div>

              {assigningProgram && (
                <div className="text-right shrink-0">
                  <Badge variant="brand" className="text-[11px] font-semibold capitalize">
                    {assigningProgram.level}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {assigningProgram.targetWeeks} wks • {assigningProgram.days.length} days/wk
                  </span>
                </div>
              )}
            </div>

            {/* Search and Filter Row */}
            <div className="space-y-2 pt-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search athletes by name or squad…"
                  value={athleteSearchQuery}
                  onChange={e => setAthleteSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-10 text-xs rounded-xl bg-card border-border"
                />
                {athleteSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAthleteSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Squad Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    soundController.playPop();
                    setSquadFilter("all");
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                    squadFilter === "all"
                      ? "bg-brand text-white border-brand shadow-xs"
                      : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                  }`}
                >
                  All ({state.athletes.length})
                </button>
                {allSquads.map(sq => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => {
                      soundController.playPop();
                      setSquadFilter(sq);
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                      squadFilter === sq
                        ? "bg-brand text-white border-brand shadow-xs"
                        : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                    }`}
                  >
                    {sq}
                  </button>
                ))}
              </div>

              {/* Batch Action Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Showing {modalFilteredAthletes.length} athletes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllFiltered}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Athlete Checklist */}
          <div className="p-3 max-h-[50vh] overflow-y-auto space-y-2 divide-y divide-border/40">
            {modalFilteredAthletes.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No athletes matching “{athleteSearchQuery}”.
              </div>
            ) : (
              modalFilteredAthletes.map(ath => {
                const isSelected = selectedAthleteIds.has(ath.id);
                const isAlreadyAssigned = ath.assignedProgramId === assigningProgram?.id;

                return (
                  <div
                    key={ath.id}
                    onClick={() => handleToggleAthlete(ath.id)}
                    className={`p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors pt-2.5 ${
                      isSelected ? "bg-brand/10 border border-brand/30" : "hover:bg-secondary/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 text-brand">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-brand" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground/60" />
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0 overflow-hidden">
                        {ath.avatarUrl ? (
                          <img src={ath.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          ath.name.substring(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">{ath.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {ath.squad && <span className="bg-secondary px-1.5 py-0.2 rounded">{ath.squad}</span>}
                          {isAlreadyAssigned ? (
                            <span className="text-success font-semibold">Currently assigned to this program</span>
                          ) : (
                            <span className="truncate">
                              Current: {ath.assignedProgramTitle || "Unassigned"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyAssigned && (
                        <Badge variant="success" className="text-[10px] px-2 py-0.5">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-4 border-t border-border/80 bg-secondary/30 flex items-center justify-between sm:justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              <strong className="text-foreground">{selectedAthleteIds.size}</strong> athletes selected
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssigningProgram(null)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={handleConfirmAssignment}
                className="text-xs font-bold gap-1.5 shadow-xs cursor-pointer min-h-[38px] px-4"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DELETE PROGRAM CONFIRMATION                                       */}
      {/* ========================================================================= */}
      <Dialog open={!!confirmDeleteProg} onOpenChange={open => !open && setConfirmDeleteProg(null)}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Delete Training Program?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground font-semibold">"{confirmDeleteProg?.title}"</strong>?
              This removes the periodization template from your coaching library.
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
              className="text-xs gap-1.5 font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete Program</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: VISUAL EXERCISE PICKER (RepDB 708 catalog)                        */}
      {/* ========================================================================= */}
      <Dialog open={!!visualPickerDayId} onOpenChange={open => !open && setVisualPickerDayId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-border bg-card">
          <DialogHeader className="p-4 border-b border-border/80 bg-secondary/30">
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
              Choose a movement to add to your training schedule.
            </DialogDescription>

            {/* Search Box */}
            <div className="flex gap-2 items-center mt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="program-builder-picker-search"
                  type="text"
                  placeholder="Search by name, muscle, equipment (e.g. Squat, Dumbbell)…"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="pl-10 pr-8 h-10 text-xs rounded-xl bg-card border-border"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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
                      : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </DialogHeader>

          <div className="p-3 max-h-[50vh] overflow-y-auto space-y-2">
            {pickerFilteredExercises.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No movements matching “{pickerSearch}”. Try another keyword or muscle filter.
              </div>
            ) : (
              pickerFilteredExercises.map(ex => (
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
          </div>

          <DialogFooter className="p-3 border-t border-border/80 bg-secondary/30">
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
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: MOVEMENT TECHNIQUE & 2-POSE DEMONSTRATION GUIDE                    */}
      {/* ========================================================================= */}
      <ExerciseDetailModal
        exerciseId={previewExercise?.id || null}
        open={!!previewExercise}
        onOpenChange={open => !open && setPreviewExercise(null)}
      />
    </div>
  );
}
