"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import {
  HeartPulse,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Check,
  Sliders,
  MessageSquare,
  Eye,
  X
} from "lucide-react";

interface CoachTriageQueueProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function CoachTriageQueue({ onSelectAthlete, onOpenMessages }: CoachTriageQueueProps) {
  const { state, adjustPrescription } = useAuth();
  const [fastDeloadOpen, setFastDeloadOpen] = useState(false);
  const [deloadApplied, setDeloadApplied] = useState(false);

  const activeProgram = state.programs[0];
  const maya = state.athletes.find((a) => a.id === "ath-2") || state.athletes[0];
  const jordan = state.athletes.find((a) => a.id === "ath-3") || state.athletes[1];
  const alex = state.athletes.find((a) => a.id === "usr-athlete-1") || state.athletes[2];

  const handleApplyDeload = () => {
    if (activeProgram && activeProgram.days[0]?.prescriptions[0]) {
      const day = activeProgram.days[0];
      const rx = day.prescriptions[0];
      adjustPrescription(activeProgram.id, day.id, rx.id, {
        targetLoadKg: 70,
        repTarget: "4 sets × 45s hold",
        exerciseName: "Spanish Squats (Belt Isometric)",
        notes: "Deload preset: Knee offloading protocol for patellar tendon analgesia."
      });
    }
    setDeloadApplied(true);
    setTimeout(() => {
      setFastDeloadOpen(false);
      setDeloadApplied(false);
    }, 1800);
  };

  return (
    <section className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-destructive" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Prioritized Clinical Attention Queue
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stratified by autonomic strain, subjective pain telemetry, and neuromuscular risk
          </p>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
          Real-time Neuromuscular Triage
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Priority 1: Maya Patel (Urgent) */}
        <div className="bg-card rounded-xl p-4 sm:p-5 relative overflow-hidden border border-destructive/30 bg-gradient-to-r from-destructive/10 via-card to-card shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center font-bold text-base sm:text-lg border border-destructive/30">
                  MP
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-destructive"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-foreground">Maya Patel</span>
                  <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive text-[11px] font-mono font-bold uppercase border border-destructive/30">
                    P1: Urgent Override
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                    Powerlifting Prep W04
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-destructive mt-1 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Acute Right Patellar Tendon Strain • Pain 6/10 Post-Squat
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-2">
                  <span>Sleep: <strong className="text-destructive">5.5 hrs</strong> (-2.1h)</span>
                  <span>CNS Readiness: <strong className="text-destructive">4.0 / 10</strong></span>
                  <span>Fatigue: <strong className="text-destructive">4 / 5</strong></span>
                  <span>Soreness: <strong className="text-destructive">4 / 5</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <button
                type="button"
                onClick={() => setFastDeloadOpen(!fastDeloadOpen)}
                className="h-10 px-3 sm:px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer min-h-[40px]"
              >
                <Zap className="w-4 h-4" />
                <span>1-Click Deload Program</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenMessages(maya.id)}
                className="h-10 px-3 sm:px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px]"
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>Message Maya</span>
              </button>
            </div>
          </div>

          {/* Embedded Interactive Deload Prescription Panel */}
          {fastDeloadOpen && (
            <div className="mt-4 pt-4 bg-background/80 rounded-xl p-4 border border-border flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide font-mono">
                    Fast Prescription Override: Maya Patel (Today's Microcycle)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary text-brand text-[10px] font-mono">
                  Preset: Knee Offloading Protocol
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-foreground">
                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Squat Load Reduction</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="line-through text-muted-foreground text-xs font-mono">100.0 kg</span>
                    <span className="text-base text-brand font-bold">70.0 kg</span>
                    <span className="text-success text-xs font-semibold">(-30%)</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Target RPE clamped at 6.0</span>
                </div>

                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Exercise Substitution</span>
                  <div className="mt-1 text-xs font-semibold text-foreground">
                    Spanish Squats (Belt Isometric)
                  </div>
                  <span className="text-[11px] text-success mt-1">45s hold × 4 sets for tendon analgesia</span>
                </div>

                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Volume &amp; Rest Adjust</span>
                  <div className="mt-1 text-xs font-semibold text-foreground">
                    Down to 3 sets (-40% tonnage)
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Inter-set rest increased to 180s</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <p className="text-xs text-muted-foreground">
                  Autonomic guardrails will automatically sync to Maya's athlete app immediately.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFastDeloadOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deloadApplied}
                    onClick={handleApplyDeload}
                    className="px-4 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{deloadApplied ? "Deload Applied & Pushed!" : "Apply Deload to Block"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Priority 2: Jordan Taylor (Caution) */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-warning/30 shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center font-bold text-base shrink-0 border border-warning/30">
              JT
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-foreground">Jordan Taylor</span>
                <span className="px-2 py-0.5 rounded bg-warning/15 text-warning text-[11px] font-mono font-bold uppercase border border-warning/30">
                  P2: Caution
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                  Hypertrophy Block W06
                </span>
              </div>
              <p className="text-xs sm:text-sm text-warning mt-1 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Lumbar Spine Stiffness post heavy conventional deadlifts (RPE 8.0)
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-1.5">
                <span>Sleep: <strong className="text-warning">7.2 hrs</strong></span>
                <span>Readiness: <strong className="text-warning">6.5 / 10</strong></span>
                <span>Fatigue: <strong className="text-foreground">3 / 5</strong></span>
                <span>Soreness: <strong className="text-warning">3 / 5</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={() => onSelectAthlete(jordan)}
              className="h-10 px-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>Adjust Prescription</span>
            </button>
            <button
              type="button"
              aria-label="Message Jordan Taylor"
              onClick={() => onOpenMessages(jordan.id)}
              className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
              title="Message Jordan"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Priority 3: Alex Chen (Optimal) */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-border shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/15 text-success flex items-center justify-center font-bold text-base shrink-0 border border-success/30">
              AC
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-foreground">Alex Chen</span>
                <span className="px-2 py-0.5 rounded bg-success/15 text-success text-[11px] font-mono font-bold uppercase border border-success/30">
                  P3: Optimal &amp; Primed
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                  Strength &amp; Conditioning W08
                </span>
              </div>
              <p className="text-xs sm:text-sm text-success mt-1 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Peak Autonomic Readiness (9.0/10) • New PR Squat 142.5kg × 5 reps
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-1.5">
                <span>Sleep: <strong className="text-success">8.2 hrs</strong></span>
                <span>Readiness: <strong className="text-success">9.0 / 10</strong></span>
                <span>Fatigue: <strong className="text-success">1 / 5</strong></span>
                <span>Status: <strong className="text-success font-semibold">Green Cleared</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={() => onSelectAthlete(alex)}
              className="h-10 px-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <Eye className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Review Log</span>
            </button>
            <button
              type="button"
              aria-label="Message Alex Chen"
              onClick={() => onOpenMessages(alex.id)}
              className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
              title="Message Alex"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
