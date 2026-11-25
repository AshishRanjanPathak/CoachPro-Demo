"use client";

import React, { useState } from "react";
import { AthleteProfile, Program, ProgramDay, ExercisePrescription } from "@/types";
import { useAuth } from "@/domains/auth/AuthContext";
import { soundController } from "@/lib/audio";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ClientReportModal } from "@/components/coach/ClientReportModal";
import { IndividualProgressAnalytics } from "@/components/coach/IndividualProgressAnalytics";
import {
  ArrowLeft,
  FileText,
  Lock,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Copy,
  Dumbbell,
  Clock,
  X
} from "lucide-react";

interface AthleteProfileViewProps {
  athlete: AthleteProfile;
  onBack: () => void;
}

export function AthleteProfileView({ athlete, onBack }: AthleteProfileViewProps) {
  const { state, addProgram, addCoachNote, updateAthleteStatus, updateAthleteProfile, currentUser } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);

  // Custom program builder modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customWeeks, setCustomWeeks] = useState(4);
  const [customLevel, setCustomLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [customDays, setCustomDays] = useState<ProgramDay[]>([]);
  const [activeCustomDayId, setActiveCustomDayId] = useState<string>("");
  const [customSuccessNotice, setCustomSuccessNotice] = useState<string | null>(null);

  const program = state.programs.find(p => p.id === athlete.assignedProgramId);
  const notes = state.notes.filter(n => n.athleteId === athlete.id);

  const handleOpenCustomBuilder = (baseProgram?: Program) => {
    soundController.playPop();
    if (baseProgram) {
      setCustomTitle(`${athlete.name} - ${baseProgram.title}`);
      setCustomDescription(`Tailored for ${athlete.trainingGoal}. Adapted from ${baseProgram.title}.`);
      setCustomWeeks(baseProgram.targetWeeks);
      setCustomLevel(baseProgram.level);
      const clonedDays: ProgramDay[] = baseProgram.days.map((d, dIdx) => ({
        ...d,
        id: `cday-${Date.now()}-${dIdx}`,
        prescriptions: d.prescriptions.map((rx, rIdx) => ({
          ...rx,
          id: `crx-${Date.now()}-${dIdx}-${rIdx}`
        }))
      }));
      setCustomDays(clonedDays);
      if (clonedDays.length > 0) setActiveCustomDayId(clonedDays[0].id);
    } else {
      setCustomTitle(`${athlete.name} - Custom Block`);
      setCustomDescription(`Tailored for ${athlete.trainingGoal}.`);
      setCustomWeeks(4);
      setCustomLevel("intermediate");
      const defaultDayId = `cday-${Date.now()}-1`;
      setCustomDays([
        {
          id: defaultDayId,
          name: "Day 1: Strength Focus",
          dayNumber: 1,
          prescriptions: [
            {
              id: `crx-${Date.now()}-1`,
              exerciseId: state.exercises[0].id,
              exerciseName: state.exercises[0].name,
              sets: 3,
              repTarget: "8-10",
              targetLoadKg: 80,
              targetRpe: 8,
              restSeconds: 120
            }
          ]
        }
      ]);
      setActiveCustomDayId(defaultDayId);
    }
    setIsCustomModalOpen(true);
  };

  const handleAddCustomDay = () => {
    soundController.playPop();
    const nextNum = customDays.length + 1;
    const newDayId = `cday-${Date.now()}-${nextNum}`;
    const newDay: ProgramDay = {
      id: newDayId,
      name: `Day ${nextNum}: Power & Technique`,
      dayNumber: nextNum,
      prescriptions: [
        {
          id: `crx-${Date.now()}`,
          exerciseId: state.exercises[1]?.id || state.exercises[0].id,
          exerciseName: state.exercises[1]?.name || state.exercises[0].name,
          sets: 3,
          repTarget: "6-8",
          targetLoadKg: 70,
          targetRpe: 8,
          restSeconds: 120
        }
      ]
    };
    setCustomDays([...customDays, newDay]);
    setActiveCustomDayId(newDayId);
  };

  const handleRemoveCustomDay = (dayId: string) => {
    soundController.playPop();
    setCustomDays(prev => {
      const remaining = prev.filter(d => d.id !== dayId);
      if (activeCustomDayId === dayId && remaining.length > 0) {
        setActiveCustomDayId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleAddRxToCustomDay = (dayId: string) => {
    soundController.playPop();
    const defEx = state.exercises[0];
    setCustomDays(prev =>
      prev.map(d => {
        if (d.id === dayId) {
          const newRx: ExercisePrescription = {
            id: `crx-${Date.now()}`,
            exerciseId: defEx.id,
            exerciseName: defEx.name,
            sets: 3,
            repTarget: "8-10",
            targetLoadKg: 60,
            targetRpe: 8,
            restSeconds: 120
          };
          return { ...d, prescriptions: [...d.prescriptions, newRx] };
        }
        return d;
      })
    );
  };

  const handleRemoveRxFromCustomDay = (dayId: string, rxId: string) => {
    soundController.playPop();
    setCustomDays(prev =>
      prev.map(d => {
        if (d.id === dayId) {
          return { ...d, prescriptions: d.prescriptions.filter(r => r.id !== rxId) };
        }
        return d;
      })
    );
  };

  const handleSaveAndAssignCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newProg: Program = {
      id: `prog-custom-${Date.now()}`,
      title: customTitle.trim(),
      description: customDescription.trim() || `Tailored custom program for ${athlete.name}.`,
      coachId: currentUser.id,
      coachName: currentUser.name,
      targetWeeks: customWeeks,
      level: customLevel,
      days: customDays
    };

    addProgram(newProg);
    updateAthleteProfile(athlete.id, {
      assignedProgramId: newProg.id,
      assignedProgramTitle: newProg.title
    });

    soundController.playLevelUp();
    setIsCustomModalOpen(false);
    setCustomSuccessNotice(`Custom program "${newProg.title}" successfully created and assigned to ${athlete.name}!`);
    setTimeout(() => setCustomSuccessNotice(null), 4000);
  };

  const currentCustomDay = customDays.find(d => d.id === activeCustomDayId) || customDays[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addCoachNote(athlete.id, noteContent.trim(), isPrivateNote);
    setNoteContent("");
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Back & Report CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Athlete Roster
        </Button>

        <div className="flex items-center gap-2">
          {/* Status selector */}
          <select
            value={athlete.status}
            onChange={(e) => updateAthleteStatus(athlete.id, e.target.value as any)}
            className="text-xs bg-card border border-border rounded-md px-2.5 py-1.5 text-foreground font-medium h-9"
          >
            <option value="active">Active Status</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="inactive">Inactive</option>
          </select>

          <Button variant="default" onClick={() => setReportOpen(true)} className="gap-1.5 text-xs min-h-[44px]">
            <FileText className="w-4 h-4" /> Export Client PDF Report
          </Button>
        </div>
      </div>

      {/* Success Notification for Custom Program Assignment */}
      {customSuccessNotice && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            <span>{customSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomSuccessNotice(null)}
            className="text-success/80 hover:text-success p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Athlete Header Card */}
      <Card className="p-5 border-border shadow-xs bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={athlete.avatarUrl}
              alt={athlete.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{athlete.name}</h2>
                <Badge
                  variant={athlete.status === "inactive" ? "secondary" : "outline"}
                  className={
                    athlete.status === "active"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : athlete.status === "needs_attention"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : undefined
                  }
                >
                  {athlete.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{athlete.email}</p>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mt-1.5">
                {athlete.age && <span>Age: <strong className="text-foreground">{athlete.age}y</strong></span>}
                {athlete.heightCm && <span>• Height: <strong className="text-foreground">{athlete.heightCm}cm</strong></span>}
                {athlete.weightKg && <span>• Weight: <strong className="text-foreground">{athlete.weightKg}kg</strong></span>}
                {athlete.experienceLevel && <Badge variant="outline" className="text-[10px] py-0 ml-1">{athlete.experienceLevel}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Goal: <span className="font-medium text-foreground">{athlete.trainingGoal}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6 text-center">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Compliance</div>
              <div className="text-lg font-bold text-success tabular-nums mt-0.5">{athlete.adherencePercentage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Workouts</div>
              <div className="text-lg font-bold text-foreground tabular-nums mt-0.5">{athlete.totalWorkoutsCompleted}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Streak</div>
              <div className="text-lg font-bold text-warning tabular-nums mt-0.5">{athlete.currentStreakDays}d</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed Section */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Progress Analytics & Visuals</TabsTrigger>
          <TabsTrigger value="training">Training Log</TabsTrigger>
          <TabsTrigger value="notes">Coach Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="program">Assigned Program</TabsTrigger>
        </TabsList>

        {/* Progress Analytics Tab (Section 12 of PDF Spec) */}
        <TabsContent value="analytics" className="space-y-4">
          <IndividualProgressAnalytics athlete={athlete} />
        </TabsContent>

        {/* Training History Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader>
              <CardTitle>Completed Workout Sessions</CardTitle>
              <CardDescription>
                Live log of completed lifts, performed sets, and athlete RPE feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.activeSession.sets.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="p-3 bg-secondary/60 border-b border-border flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{state.activeSession.dayName}</span>
                    <span className="text-muted-foreground">Recent Session</span>
                  </div>
                  <div className="divide-y divide-border">
                    {state.activeSession.sets.map((set) => (
                      <div key={set.id} className="p-3 flex items-center justify-between text-xs bg-card">
                        <div>
                          <span className="font-semibold text-foreground">{set.exerciseName}</span>
                          <span className="text-muted-foreground ml-2">Set {set.setNumber}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold tabular-nums text-foreground">{set.completedWeightKg} kg × {set.completedReps} reps</span>
                          <span className="text-muted-foreground">RPE {set.rpe}</span>
                          {set.isPr && <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">PR</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No active session recorded today yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coach Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* Add Note Form */}
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Coaching Note</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddNote}>
              <CardContent className="space-y-3">
                <Input
                  type="text"
                  placeholder="Record coaching observations, technical feedback, or injury notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="text-xs"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivateNote}
                      onChange={(e) => setIsPrivateNote(e.target.checked)}
                      className="rounded accent-brand"
                    />
                    <Lock className="w-3.5 h-3.5" /> Keep Private (Coach Only)
                  </label>
                </div>
              </CardContent>
              <div className="px-5 pb-4 flex justify-end">
                <Button type="submit" variant="default" size="sm" className="gap-1 text-xs min-h-[36px]">
                  <Plus className="w-3.5 h-3.5" /> Post Note
                </Button>
              </div>
            </form>
          </Card>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.map((n) => (
              <Card key={n.id} className="p-4 border-border shadow-xs bg-card">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">{n.authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">{n.createdAt.substring(0, 10)}</span>
                    {n.isPrivate ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Shared
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{n.content}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assigned Program Tab with Custom Build & Clone Actions */}
        <TabsContent value="program" className="space-y-4">
          {program ? (
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{program.title}</CardTitle>
                      <Badge variant="secondary" className="capitalize text-[10px]">{program.level}</Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">{program.description}</CardDescription>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCustomBuilder(program)}
                      className="text-xs gap-1.5 h-8 font-semibold cursor-pointer border-brand/30 text-brand hover:bg-brand/10"
                      title="Clone this program into a tailored version for this athlete"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone &amp; Tailor</span>
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenCustomBuilder()}
                      className="text-xs gap-1.5 h-8 font-bold shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ New Custom</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateAthleteProfile(athlete.id, {
                          assignedProgramId: "",
                          assignedProgramTitle: "Unassigned"
                        })
                      }
                      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2 font-semibold cursor-pointer"
                      title="Remove athlete's assigned program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {program.days.map((day) => (
                  <div key={day.id} className="p-3.5 rounded-xl border border-border bg-secondary/40 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{day.name}</h4>
                    <div className="space-y-1.5">
                      {day.prescriptions.map((rx) => (
                        <div key={rx.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-card border border-border">
                          <span className="font-medium text-foreground">{rx.exerciseName}</span>
                          <span className="text-muted-foreground font-mono">{rx.sets} sets × {rx.repTarget} reps @ {rx.targetLoadKg}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs bg-card p-8 text-center space-y-4 rounded-2xl">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">No Program Assigned to {athlete.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Build a personalized training block tailored specifically for {athlete.name}'s goal ({athlete.trainingGoal}) or choose a template from your library.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleOpenCustomBuilder()}
                  className="gap-1.5 text-xs font-bold min-h-[40px] px-4 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build Custom Program for {athlete.name}</span>
                </Button>

                {state.programs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Or template:</span>
                    <select
                      aria-label="Assign program template"
                      onChange={(e) => {
                        const selProg = state.programs.find(p => p.id === e.target.value);
                        if (selProg) {
                          updateAthleteProfile(athlete.id, {
                            assignedProgramId: selProg.id,
                            assignedProgramTitle: selProg.title
                          });
                          soundController.playLevelUp();
                        }
                      }}
                      defaultValue=""
                      className="text-xs bg-secondary border border-border rounded-xl px-3 py-2 text-foreground font-medium h-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <option value="" disabled>Choose template...</option>
                      {state.programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} ({p.targetWeeks}w)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: BUILD CUSTOM PROGRAM FOR THIS ATHLETE                             */}
      {/* ========================================================================= */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-border bg-card shadow-xl">
          <form onSubmit={handleSaveAndAssignCustom}>
            <DialogHeader className="p-5 border-b border-border/80 bg-secondary/30">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <DialogTitle className="text-base font-bold">
                      Build Custom Program for {athlete.name}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Create a dedicated 1-on-1 periodization block automatically assigned to this athlete.
                  </DialogDescription>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">1-on-1 Custom</Badge>
              </div>

              {/* Start from template selector */}
              {state.programs.length > 0 && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Start from template:</span>
                  <select
                    onChange={(e) => {
                      const progToClone = state.programs.find(p => p.id === e.target.value);
                      if (progToClone) handleOpenCustomBuilder(progToClone);
                    }}
                    defaultValue=""
                    className="text-[11px] bg-card text-foreground border border-border rounded-lg px-2.5 py-1 font-medium"
                  >
                    <option value="" disabled>Pre-fill days from an existing program...</option>
                    {state.programs.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.targetWeeks}w)</option>
                    ))}
                  </select>
                </div>
              )}
            </DialogHeader>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Program Name & Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Program Title
                </label>
                <Input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  className="text-sm font-semibold h-11 rounded-xl"
                  placeholder="e.g. Maya Patel - Patellar Rehab Block"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duration */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Duration (Weeks)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[4, 6, 8, 12].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          soundController.playPop();
                          setCustomWeeks(w);
                        }}
                        className={`h-10 rounded-xl text-xs font-bold border cursor-pointer ${
                          customWeeks === w
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card text-muted-foreground border-border hover:bg-secondary/60"
                        }`}
                      >
                        {w}w
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Level Tier
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["beginner", "intermediate", "advanced"] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          soundController.playPop();
                          setCustomLevel(lvl);
                        }}
                        className={`h-10 rounded-xl text-xs font-bold capitalize border cursor-pointer ${
                          customLevel === lvl
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card text-muted-foreground border-border hover:bg-secondary/60"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Athlete Goals &amp; Recovery Notes
                </label>
                <Input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="text-xs h-10 rounded-xl"
                  placeholder="Target milestones, volume thresholds, or return-to-play protocols…"
                />
              </div>

              {/* Training Days Tabs */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Training Days ({customDays.length})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomDay}
                    className="text-xs gap-1 h-8 font-semibold cursor-pointer border-brand/30 text-brand hover:bg-brand/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Training Day</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {customDays.map((d, idx) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundController.playPop();
                        setActiveCustomDayId(d.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
                        activeCustomDayId === d.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                      }`}
                    >
                      Day {idx + 1} ({d.prescriptions.length} ex)
                    </button>
                  ))}
                </div>

                {/* Active Day Prescriptions */}
                {currentCustomDay && (
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        type="text"
                        value={currentCustomDay.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomDays(days =>
                            days.map(d => (d.id === currentCustomDay.id ? { ...d, name: val } : d))
                          );
                        }}
                        className="font-bold text-xs h-9 bg-card rounded-lg flex-1"
                        placeholder="Day Name"
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddRxToCustomDay(currentCustomDay.id)}
                          className="text-xs gap-1 h-9 px-2.5 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3 h-3" /> Exercise
                        </Button>

                        {customDays.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomDay(currentCustomDay.id)}
                            className="text-xs text-destructive hover:bg-destructive/10 h-9 px-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Prescriptions List */}
                    <div className="space-y-2">
                      {currentCustomDay.prescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-2.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <select
                              value={rx.exerciseId}
                              onChange={(e) => {
                                const ex = state.exercises.find(x => x.id === e.target.value);
                                if (!ex) return;
                                setCustomDays(days =>
                                  days.map(d =>
                                    d.id === currentCustomDay.id
                                      ? {
                                          ...d,
                                          prescriptions: d.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, exerciseId: ex.id, exerciseName: ex.name } : p
                                          )
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="text-xs font-semibold bg-secondary text-foreground border border-border rounded-md px-2 py-1 w-full truncate"
                            >
                              {state.exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Sets</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={rx.sets}
                              onChange={(e) => {
                                const s = parseInt(e.target.value) || 1;
                                setCustomDays(days =>
                                  days.map(d =>
                                    d.id === currentCustomDay.id
                                      ? {
                                          ...d,
                                          prescriptions: d.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, sets: s } : p
                                          )
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="w-10 h-7 text-center bg-secondary rounded font-bold text-xs tabular-nums border border-border"
                            />

                            <span className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Reps</span>
                            <input
                              type="text"
                              value={rx.repTarget}
                              onChange={(e) => {
                                const r = e.target.value;
                                setCustomDays(days =>
                                  days.map(d =>
                                    d.id === currentCustomDay.id
                                      ? {
                                          ...d,
                                          prescriptions: d.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, repTarget: r } : p
                                          )
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="w-12 h-7 text-center bg-secondary rounded font-bold text-xs tabular-nums border border-border"
                            />

                            <span className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Load</span>
                            <input
                              type="number"
                              min="0"
                              value={rx.targetLoadKg || 0}
                              onChange={(e) => {
                                const l = parseFloat(e.target.value) || 0;
                                setCustomDays(days =>
                                  days.map(d =>
                                    d.id === currentCustomDay.id
                                      ? {
                                          ...d,
                                          prescriptions: d.prescriptions.map(p =>
                                            p.id === rx.id ? { ...p, targetLoadKg: l } : p
                                          )
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="w-14 h-7 text-center bg-secondary rounded font-bold text-xs tabular-nums border border-border"
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveRxFromCustomDay(currentCustomDay.id, rx.id)}
                              className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                              title="Remove exercise"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 p-4 border-t border-border/80 bg-secondary/30 flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="default"
                size="sm"
                className="text-xs font-bold gap-1.5 min-h-[38px] px-4 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save &amp; Assign to {athlete.name}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Export Report Modal */}
      <ClientReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        athlete={athlete}
        program={program}
      />
    </div>
  );
}
