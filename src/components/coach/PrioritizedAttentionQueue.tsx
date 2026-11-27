"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ShieldAlert, HeartPulse, MessageSquare, Wrench, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface PrioritizedAttentionQueueProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function PrioritizedAttentionQueue({ onSelectAthlete, onOpenMessages }: PrioritizedAttentionQueueProps) {
  const { state, adjustPrescription } = useAuth();
  const { tx } = useLanguage();

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
  const defaultPrescriptions = activeProgram?.days?.[0]?.prescriptions ?? [];

  const handleOpenAdjust = (ath: AthleteProfile) => {
    setSelectedAthleteForAdjust(ath);
    const day = activeProgram?.days?.[0];
    const rx = day?.prescriptions?.[0];
    setSelectedDayId(day?.id || "day-1");
    setSelectedRxId(rx?.id || "rx-1");
    setNewLoad(rx?.targetLoadKg ? Math.round(rx.targetLoadKg * 0.7) : 80); // Default to 30% deload for injured athletes
    setNewReps(rx?.repTarget || "8");
    setAdjustmentNotes(`Deload / substituted due to ${ath.injuryStatus?.injuryLocation || "reported fatigue"}.`);
    setAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteForAdjust || !activeProgram) return;

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
              {tx("Live Triage", "Triaje en Vivo")}
            </Badge>
            <span className="text-xs text-muted-foreground">{tx("Updated in real-time", "Actualizado en tiempo real")}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
            {tx("Prioritized Coach Attention Queue", "Cola de Atención Priorizada")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {tx(
              "Athletes needing quick program adjustments, deloads, or pain check-ins ranked first.",
              "Atletas que requieren ajustes rápidos, descargas o revisión de dolor aparecen primero."
            )}
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
              className={`p-4 sm:p-5 border transition-colors duration-150 ${
                isInjured
                  ? "border-border border-l-2 border-l-destructive bg-card hover:border-destructive/40"
                  : isHighFatigue
                  ? "border-border border-l-2 border-l-warning bg-card hover:border-warning/40"
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
                      className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        isInjured
                          ? "bg-destructive text-white"
                          : isHighFatigue
                            ? "bg-amber-500 text-black"
                            : "bg-primary text-primary-foreground"
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
                          <AlertTriangle className="w-3 h-3" /> {tx("Flagged Injury:", "Lesión Reportada:")} {ath.injuryStatus?.injuryLocation}
                        </Badge>
                      ) : isHighFatigue ? (
                        <Badge variant="outline" className="text-[10px] py-0 font-bold flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <HeartPulse className="w-3 h-3" /> {tx("Elevated Fatigue", "Fatiga Elevada")} ({ath.fatigueLevel})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {tx("Optimal Readiness", "Preparación Óptima")}
                        </Badge>
                      )}
                    </div>

                    {/* Injury / Fatigue specifics */}
                    {isInjured && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {tx("Alert:", "Alerta:")} “{ath.injuryStatus?.details}”
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                      <span>{tx("Readiness:", "Preparación:")} <strong className="text-foreground">{ath.readinessScore}/10</strong></span>
                      <span>•</span>
                      <span>{tx("Adherence:", "Adherencia:")} <strong className="text-foreground">{ath.adherencePercentage}%</strong></span>
                      <span>•</span>
                      <span>{tx("Last Workout:", "Último Entreno:")} {ath.lastWorkoutDate}</span>
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
                    <span>{tx("Adjust Program", "Ajustar Plan")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenMessages(ath.id)}
                    className="gap-1.5 text-xs min-h-[38px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand" />
                    <span>{tx("Message", "Mensaje")}</span>
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
        <DialogContent className="sm:max-w-lg p-5 sm:p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tx("Coach Adjustment", "Ajuste del Entrenador")}</Badge>
              <span className="text-xs text-muted-foreground">{tx("Program Update", "Actualización de Plan")}</span>
            </div>
            <DialogTitle className="mt-1">
              {tx("Adjust Program for", "Ajustar Plan para")} {selectedAthleteForAdjust?.name}
            </DialogTitle>
            <DialogDescription>
              {tx(
                "Immediately modify exercise prescriptions or loads in response to reported pain or fatigue.",
                "Modifica cargas o ejercicios al instante ante reportes de dolor o fatiga."
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            {selectedAthleteForAdjust?.injuryStatus?.hasInjury && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                <strong>{tx("Reported Pain:", "Dolor Reportado:")}</strong> {selectedAthleteForAdjust.injuryStatus.injuryLocation} ({selectedAthleteForAdjust.injuryStatus.severity}) — “{selectedAthleteForAdjust.injuryStatus.details}”
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{tx("Select Movement Prescription", "Seleccionar Ejercicio Prescrito")}</label>
              <select
                value={selectedRxId}
                onChange={(e) => {
                  setSelectedRxId(e.target.value);
                  const rx = defaultPrescriptions.find(p => p.id === e.target.value);
                  if (rx && rx.targetLoadKg) setNewLoad(Math.round(rx.targetLoadKg * 0.7));
                }}
                className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-10"
              >
                {defaultPrescriptions.length === 0 ? (
                  <option value="" disabled>{tx("No prescribed movements available", "No hay ejercicios prescritos disponibles")}</option>
                ) : (
                  defaultPrescriptions.map((rx) => (
                    <option key={rx.id} value={rx.id}>
                      {rx.exerciseName} ({tx("Current:", "Actual:")} {rx.targetLoadKg}kg × {rx.repTarget})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{tx("Adjusted Load (kg)", "Carga Ajustada (kg)")}</label>
                <Input
                  type="number"
                  step="2.5"
                  value={newLoad}
                  onChange={(e) => setNewLoad(parseFloat(e.target.value) || 0)}
                  className="font-bold tabular-nums text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{tx("Rep Target", "Repeticiones")}</label>
                <Input
                  type="text"
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  className="font-bold text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{tx("Adjustment Note for Athlete", "Nota de Ajuste para el Atleta")}</label>
              <Input
                type="text"
                placeholder={tx("e.g. Deloading squats by 30% due to knee symptoms...", "ej. Bajando 30% en sentadilla por molestias...")}
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="text-xs h-10"
              />
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-none bg-transparent border-t border-border pt-3 px-0 pb-0 sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setAdjustModalOpen(false)}>
                {tx("Cancel", "Cancelar")}
              </Button>
              <Button type="submit" variant="default" disabled={adjustedNotice} className="font-semibold text-xs min-h-[44px]">
                {adjustedNotice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> {tx("Prescription Updated!", "¡Plan Actualizado!")}
                  </>
                ) : (
                  tx("Commit Prescription Adjustment", "Guardar Ajuste del Plan")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
