"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile, ProgramDay, ExercisePrescription } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ShieldAlert, HeartPulse, MessageSquare, Wrench, ChevronRight, CheckCircle2, User } from "lucide-react";

interface PrioritizedAttentionQueueProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function PrioritizedAttentionQueue({ onSelectAthlete, onOpenMessages }: PrioritizedAttentionQueueProps) {
  const { state, adjustPrescription } = useAuth();

  // Sorting athletes: Injured first (priorityRank 1), then high fatigue (priorityRank 2), then normal
  const sortedQueue = [...state.athletes].sort((a, b) => a.priorityRank - b.priorityRank);

  // Quick Prescription Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedAthleteForAdjust, setSelectedAthleteForAdjust] = useState<AthleteProfile | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>("day-1");
  const [selectedRxId, setSelectedRxId] = useState<string>("rx-1");
  const [newLoad, setNewLoad] = useState<number>(100);
  const [newReps, setNewReps] = useState<string>("8");
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>("");
  const [adjustedNotice, setAdjustedNotice] = useState(false);

  const activeProgram = state.programs[0];

  const handleOpenAdjust = (ath: AthleteProfile) => {
    setSelectedAthleteForAdjust(ath);
    const day = activeProgram.days[0];
    const rx = day.prescriptions[0];
    setSelectedDayId(day.id);
    setSelectedRxId(rx.id);
    setNewLoad(rx.targetLoadKg ? Math.round(rx.targetLoadKg * 0.7) : 80); // Default to 30% deload for injured athletes
    setNewReps(rx.repTarget || "8");
    setAdjustmentNotes(`Deload / substituted due to ${ath.injuryStatus?.injuryLocation || "reported fatigue"}.`);
    setAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteForAdjust) return;

    adjustPrescription(activeProgram.id, selectedDayId, selectedRxId, {
      targetLoadKg: newLoad,
      repTarget: newReps,
      notes: adjustmentNotes
    });

    setAdjustedNotice(true);
    setTimeout(() => {
      setAdjustedNotice(false);
      setAdjustModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="font-semibold text-xs py-0.5">
              Live Triage
            </Badge>
            <span className="text-xs text-muted-foreground">Updated in real-time</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
            Prioritized Coach Attention Queue
          </h2>
          <p className="text-xs text-muted-foreground">
            Athletes requiring clinical intervention, deload adjustments, or injury management ranked first.
          </p>
        </div>
      </div>

      {/* Priority Queue Cards */}
      <div className="space-y-3">
        {sortedQueue.map((ath, idx) => {
          const isInjured = ath.injuryStatus?.hasInjury;
          const isHighFatigue = ath.fatigueLevel === "high" || ath.fatigueLevel === "severe";

          return (
            <Card
              key={ath.id}
              className={`p-4 sm:p-5 border-2 transition-all shadow-xs ${
                isInjured
                  ? "border-destructive/60 bg-destructive/5 hover:border-destructive"
                  : isHighFatigue
                  ? "border-warning/60 bg-warning/5 hover:border-warning"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Athlete Avatar & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={ath.avatarUrl}
                      alt={ath.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border"
                    />
                    <div
                      className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs ${
                        isInjured ? "bg-destructive" : isHighFatigue ? "bg-warning" : "bg-primary"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onSelectAthlete(ath)}
                        className="font-bold text-foreground text-sm hover:text-brand cursor-pointer"
                      >
                        {ath.name}
                      </h3>
                      {isInjured ? (
                        <Badge variant="destructive" className="text-[10px] py-0 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged Injury: {ath.injuryStatus?.injuryLocation}
                        </Badge>
                      ) : isHighFatigue ? (
                        <Badge variant="warning" className="text-[10px] py-0 font-bold flex items-center gap-1">
                          <HeartPulse className="w-3 h-3" /> Elevated Fatigue ({ath.fatigueLevel})
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] py-0">
                          Optimal Readiness
                        </Badge>
                      )}
                    </div>

                    {/* Injury / Fatigue specifics */}
                    {isInjured && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        Alert: “{ath.injuryStatus?.details}”
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                      <span>Readiness: <strong className="text-foreground">{ath.readinessScore}/10</strong></span>
                      <span>•</span>
                      <span>Adherence: <strong className="text-foreground">{ath.adherencePercentage}%</strong></span>
                      <span>•</span>
                      <span>Last Workout: {ath.lastWorkoutDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Instant Triage Actions */}
                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/80">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAdjust(ath)}
                    className="gap-1.5 text-xs min-h-[38px] font-semibold hover:border-brand"
                  >
                    <Wrench className="w-3.5 h-3.5 text-brand" />
                    <span>Adjust Program</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenMessages(ath.id)}
                    className="gap-1.5 text-xs min-h-[38px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand" />
                    <span>Message</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectAthlete(ath)}
                    aria-label={`View ${ath.name} profile`}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* QUICK PRESCRIPTION ADJUSTMENT MODAL */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Clinical Intervention</Badge>
            <span className="text-xs text-muted-foreground">Live Rx Adjustment</span>
          </div>
          <DialogTitle className="mt-1">
            Adjust Program for {selectedAthleteForAdjust?.name}
          </DialogTitle>
          <DialogDescription>
            Immediately modify exercise prescriptions or loads in response to reported pain or fatigue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveAdjustment}>
          <DialogContent className="space-y-4">
            {selectedAthleteForAdjust?.injuryStatus?.hasInjury && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                <strong>Reported Pain:</strong> {selectedAthleteForAdjust.injuryStatus.injuryLocation} ({selectedAthleteForAdjust.injuryStatus.severity}) — “{selectedAthleteForAdjust.injuryStatus.details}”
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Movement Prescription</label>
              <select
                value={selectedRxId}
                onChange={(e) => {
                  setSelectedRxId(e.target.value);
                  const rx = activeProgram.days[0].prescriptions.find(p => p.id === e.target.value);
                  if (rx && rx.targetLoadKg) setNewLoad(Math.round(rx.targetLoadKg * 0.7));
                }}
                className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-10"
              >
                {activeProgram.days[0].prescriptions.map((rx) => (
                  <option key={rx.id} value={rx.id}>
                    {rx.exerciseName} (Current: {rx.targetLoadKg}kg × {rx.repTarget})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Adjusted Load (kg)</label>
                <Input
                  type="number"
                  step="2.5"
                  value={newLoad}
                  onChange={(e) => setNewLoad(parseFloat(e.target.value) || 0)}
                  className="font-bold tabular-nums text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Rep Target</label>
                <Input
                  type="text"
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  className="font-bold text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Adjustment Note for Athlete</label>
              <Input
                type="text"
                placeholder="e.g. Deloading squats by 30% due to knee symptoms..."
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="text-xs h-10"
              />
            </div>
          </DialogContent>

          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <Button type="button" variant="ghost" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={adjustedNotice} className="font-semibold text-xs min-h-[44px]">
                {adjustedNotice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Prescription Updated!
                  </>
                ) : (
                  "Commit Prescription Adjustment"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
