"use client";

import React, { useState } from "react";
import { AthleteProfile, Program } from "@/types";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClientReportModal } from "@/components/coach/ClientReportModal";
import { IndividualProgressAnalytics } from "@/components/coach/IndividualProgressAnalytics";
import { ArrowLeft, FileText, Lock, Globe, Plus, CheckCircle, TrendingUp, Calendar, UserCheck } from "lucide-react";

interface AthleteProfileViewProps {
  athlete: AthleteProfile;
  onBack: () => void;
}

export function AthleteProfileView({ athlete, onBack }: AthleteProfileViewProps) {
  const { state, addCoachNote, updateAthleteStatus } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);

  const program = state.programs.find(p => p.id === athlete.assignedProgramId);
  const notes = state.notes.filter(n => n.athleteId === athlete.id);

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

          <Button variant="brand" onClick={() => setReportOpen(true)} className="gap-1.5 text-xs min-h-[44px]">
            <FileText className="w-4 h-4" /> Export Client PDF Report
          </Button>
        </div>
      </div>

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
                <Badge variant={athlete.status === "active" ? "success" : athlete.status === "needs_attention" ? "warning" : "secondary"}>
                  {athlete.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{athlete.email}</p>
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
                          {set.isPr && <Badge variant="success" className="text-[10px] py-0">PR</Badge>}
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
                <Button type="submit" variant="brand" size="sm" className="gap-1 text-xs min-h-[36px]">
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

        {/* Assigned Program Tab */}
        <TabsContent value="program">
          {program && (
            <Card className="border-border shadow-xs bg-card">
              <CardHeader>
                <CardTitle>{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.days.map((day) => (
                  <div key={day.id} className="p-3.5 rounded-lg border border-border bg-secondary/40 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{day.name}</h4>
                    <div className="space-y-1.5">
                      {day.prescriptions.map((rx) => (
                        <div key={rx.id} className="flex justify-between items-center text-xs p-2 rounded bg-card border border-border">
                          <span className="font-medium text-foreground">{rx.exerciseName}</span>
                          <span className="text-muted-foreground font-mono">{rx.sets} sets × {rx.repTarget} reps @ {rx.targetLoadKg}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
