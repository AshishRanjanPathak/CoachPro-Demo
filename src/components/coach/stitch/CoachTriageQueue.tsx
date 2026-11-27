"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import {
  HeartPulse,
  AlertTriangle,
  Zap,
  CheckCircle2,
  MessageSquare,
  Eye,
  X
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CoachTriageQueueProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function CoachTriageQueue({ onSelectAthlete, onOpenMessages }: CoachTriageQueueProps) {
  const { state, adjustPrescription } = useAuth();
  const { tx } = useLanguage();
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
        notes: "Deload preset: Knee-friendly swap to relieve patellar tendon strain."
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
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-destructive" />
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Attention Queue
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Priority 1: Maya Patel (Urgent) */}
        <div className="bg-card rounded-xl p-4 sm:p-5 relative overflow-hidden border border-border border-l-2 border-l-destructive">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center font-bold text-base sm:text-lg border border-destructive/30">
                  MP
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="inline-flex rounded-full h-3 w-3 bg-destructive border-2 border-card"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-foreground">Maya Patel</span>
                  <span className="px-2 py-0.5 rounded bg-destructive/15 text-destructive text-[11px] font-mono font-bold uppercase border border-destructive/25">
                    {tx("P1: Urgent Override", "P1: Ajuste Urgente")}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                    {tx("Powerlifting Prep W04", "Prep. Powerlifting S04")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-destructive mt-1 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {tx("Acute Right Patellar Tendon Strain • Pain 6/10 Post-Squat", "Molestia Aguda Tendón Rotuliano Der. • Dolor 6/10 Post-Sentadilla")}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-2 tabular-nums">
                  <span>{tx("Sleep:", "Sueño:")} <strong className="text-destructive">5.5 hrs</strong> (-2.1h)</span>
                  <span>{tx("Readiness:", "Preparación:")} <strong className="text-destructive">4.0 / 10</strong></span>
                  <span>{tx("Fatigue:", "Fatiga:")} <strong className="text-destructive">4 / 5</strong></span>
                  <span>{tx("Soreness:", "Agujetas:")} <strong className="text-destructive">4 / 5</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <button
                type="button"
                onClick={() => setFastDeloadOpen(!fastDeloadOpen)}
                className="h-10 px-3 sm:px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] duration-150 ease-[var(--ease-out)] cursor-pointer min-h-[40px]"
              >
                <Zap className="w-4 h-4" />
                <span>{tx("1-Click Deload Program", "Descarga en 1 Clic")}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenMessages(maya.id)}
                className="h-10 px-3 sm:px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] cursor-pointer min-h-[40px]"
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>{tx("Message Maya", "Mensaje a Maya")}</span>
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
                    {tx("Fast Prescription Override: Maya Patel (Today's Microcycle)", "Ajuste Rápido de Plan: Maya Patel (Sesión de Hoy)")}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary text-brand text-[10px] font-mono">
                  {tx("Preset: Knee Offloading Protocol", "Protocolo: Descarga de Rodilla")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-foreground">
                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{tx("Squat Load Reduction", "Reducción Carga Sentadilla")}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="line-through text-muted-foreground text-xs font-mono">100.0 kg</span>
                    <span className="text-base text-brand font-bold">70.0 kg</span>
                    <span className="text-success text-xs font-semibold">(-30%)</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">{tx("Target RPE clamped at 6.0", "RPE objetivo limitado a 6.0")}</span>
                </div>

                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{tx("Exercise Substitution", "Sustitución de Ejercicio")}</span>
                  <div className="mt-1 text-xs font-semibold text-foreground">
                    {tx("Spanish Squats (Belt Isometric)", "Sentadilla Española (Isométrica)")}
                  </div>
                  <span className="text-[11px] text-success mt-1">{tx("45s hold × 4 sets for tendon relief", "45s × 4 series para aliviar el tendón")}</span>
                </div>

                <div className="bg-card p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{tx("Volume & Rest Adjust", "Ajuste de Volumen y Descanso")}</span>
                  <div className="mt-1 text-xs font-semibold text-foreground">
                    {tx("Down to 3 sets (-40% tonnage)", "Reducido a 3 series (-40% volumen)")}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">{tx("Inter-set rest increased to 180s", "Descanso aumentado a 180s")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <p className="text-xs text-muted-foreground">
                  {tx("Updated training targets will sync to Maya's athlete app immediately.", "Los nuevos objetivos se sincronizarán de inmediato en la app de Maya.")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFastDeloadOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                  >
                    {tx("Cancel", "Cancelar")}
                  </button>
                  <button
                    type="button"
                    disabled={deloadApplied}
                    onClick={handleApplyDeload}
                    className="px-4 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] duration-150 ease-[var(--ease-out)] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {deloadApplied
                        ? tx("Deload Applied & Pushed!", "¡Descarga Aplicada y Enviada!")
                        : tx("Apply Deload to Block", "Aplicar Descarga al Bloque")}
                    </span>
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
                  {tx("P2: Caution", "P2: Precaución")}
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                  {tx("Hypertrophy Block W06", "Bloque Hipertrofia S06")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-warning mt-1 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {tx("Lumbar Spine Stiffness post heavy conventional deadlifts (RPE 8.0)", "Rigidez lumbar tras peso muerto convencional pesado (RPE 8.0)")}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-1.5">
                <span>{tx("Sleep:", "Sueño:")} <strong className="text-warning">7.2 hrs</strong></span>
                <span>{tx("Readiness:", "Preparación:")} <strong className="text-warning">6.5 / 10</strong></span>
                <span>{tx("Fatigue:", "Fatiga:")} <strong className="text-foreground">3 / 5</strong></span>
                <span>{tx("Soreness:", "Agujetas:")} <strong className="text-warning">3 / 5</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={() => onSelectAthlete(jordan)}
              className="h-10 px-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>{tx("Adjust Prescription", "Ajustar Plan")}</span>
            </button>
            <button
              type="button"
              aria-label={tx("Message Jordan Taylor", "Mensaje a Jordan Taylor")}
              onClick={() => onOpenMessages(jordan.id)}
              className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
              title={tx("Message Jordan", "Mensaje a Jordan")}
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
                  {tx("P3: Optimal & Primed", "P3: Óptimo y Listo")}
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[11px] font-mono">
                  {tx("Strength & Conditioning W08", "Fuerza y Acondicionamiento S08")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-success mt-1 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {tx("Peak Readiness (9.0/10) • New PR Squat 142.5kg × 5 reps", "Preparación Máxima (9.0/10) • Nuevo Récord Sentadilla 142.5kg × 5 reps")}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-1.5">
                <span>{tx("Sleep:", "Sueño:")} <strong className="text-success">8.2 hrs</strong></span>
                <span>{tx("Readiness:", "Preparación:")} <strong className="text-success">9.0 / 10</strong></span>
                <span>{tx("Fatigue:", "Fatiga:")} <strong className="text-success">1 / 5</strong></span>
                <span>{tx("Status:", "Estado:")} <strong className="text-success font-semibold">{tx("Green Cleared", "Luz Verde")}</strong></span>
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
              <span>{tx("Review Log", "Revisar Registro")}</span>
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
