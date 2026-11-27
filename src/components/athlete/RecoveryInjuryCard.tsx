"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { resolveActiveAthlete } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { HeartPulse, AlertTriangle, Moon, CheckCircle2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function RecoveryInjuryCard() {
  const { state, addCheckIn, currentUser } = useAuth();
  const { tx } = useLanguage();
  const currentAthlete = resolveActiveAthlete(state, currentUser?.id);

  const [soreness, setSoreness] = useState(2);
  const [fatigue, setFatigue] = useState<"low" | "moderate" | "high" | "severe">(currentAthlete?.fatigueLevel || "low");
  const [sleep, setSleep] = useState(8);
  const [hasInjury, setHasInjury] = useState(currentAthlete?.injuryStatus?.hasInjury || false);
  const [injuryLocation, setInjuryLocation] = useState(currentAthlete?.injuryStatus?.injuryLocation || "Right Knee / Patellar");
  const [injurySeverity, setInjurySeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [injuryNotes, setInjuryNotes] = useState(currentAthlete?.injuryStatus?.details || "");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckIn({
      readinessScore: currentAthlete?.readinessScore || 8,
      sorenessScore: soreness,
      fatigueLevel: fatigue,
      sleepHours: sleep,
      hasInjury,
      injuryLocation: hasInjury ? injuryLocation : undefined,
      injurySeverity: hasInjury ? injurySeverity : undefined,
      injuryNotes: hasInjury ? injuryNotes : undefined,
      notes
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Current Active Status Alert Banner */}
      {currentAthlete?.injuryStatus?.hasInjury && (
        <div className="p-4 rounded-xl border border-warning/40 bg-warning/10 flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">
              {tx("Active Injury Flagged with Coach Sarah:", "Molestia Activa Reportada a Coach Sarah:")}
            </span>
            <span className="text-muted-foreground mt-0.5 block">
              {currentAthlete.injuryStatus.injuryLocation} ({currentAthlete.injuryStatus.severity}) — “{currentAthlete.injuryStatus.details}”
            </span>
            <span className="text-warning font-semibold text-[11px] mt-1 block">
              {tx("Coach has prioritized your profile in the Attention Queue.", "Tu entrenador ha priorizado tu perfil.")}
            </span>
          </div>
        </div>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="heading-tight">{tx("Recovery & Check-In", "Recuperación y Chequeo")}</CardTitle>
          <CardDescription>
            {tx("Log fatigue, sleep, soreness, or injury status.", "Registra fatiga, sueño, agujetas o molestias.")}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2" role="group" aria-label={tx("Accumulated fatigue level", "Nivel de fatiga acumulada")}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                {tx("Accumulated Fatigue Level", "Nivel de Fatiga")}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: "low", en: "Low", es: "Baja" },
                    { id: "moderate", en: "Moderate", es: "Media" },
                    { id: "high", en: "High", es: "Alta" },
                    { id: "severe", en: "Severe", es: "Severa" },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    aria-pressed={fatigue === lvl.id}
                    onClick={() => setFatigue(lvl.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
                      fatigue === lvl.id
                        ? "border-brand bg-brand/10 text-brand font-bold shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {tx(lvl.en, lvl.es)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sleep-hours-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                  <Moon className="w-4 h-4 text-brand" aria-hidden="true" /> {tx("Sleep Duration (Hours)", "Horas de Sueño")}
                </label>
                <Input
                  id="sleep-hours-input"
                  name="sleepHours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleep}
                  onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
                  className="tabular-nums font-semibold min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="soreness-select" className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                  <HeartPulse className="w-4 h-4 text-destructive" aria-hidden="true" /> {tx("Muscle Soreness (1–5)", "Agujetas / Dolor (1–5)")}
                </label>
                <select
                  id="soreness-select"
                  name="sorenessRating"
                  value={soreness}
                  onChange={(e) => setSoreness(parseInt(e.target.value))}
                  className="w-full text-xs bg-card border border-border rounded-md px-3 py-2.5 text-foreground font-semibold h-11 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                >
                  <option value={1}>{tx("1 — Fresh / Zero Soreness", "1 — Fresco / Cero dolor")}</option>
                  <option value={2}>{tx("2 — Mild Stiffness", "2 — Leve rigidez")}</option>
                  <option value={3}>{tx("3 — Moderate Soreness", "3 — Dolor moderado")}</option>
                  <option value={4}>{tx("4 — Heavy Fatigue", "4 — Fatiga alta")}</option>
                  <option value={5}>{tx("5 — Severely Sore / Impaired", "5 — Muy dolorido")}</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-secondary/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" aria-hidden="true" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{tx("Report Injury or Pain Flare-Up", "Reportar Lesión o Molestia")}</h4>
                    <p className="text-xs text-muted-foreground">{tx("Flags profile for immediate coach intervention", "Avisa a tu entrenador para ajustar el plan")}</p>
                  </div>
                </div>

                <Switch
                  aria-label={tx("Report injury or pain flare-up", "Reportar lesión o dolor")}
                  checked={hasInjury}
                  onCheckedChange={setHasInjury}
                />
              </div>

              {hasInjury && (
                <div className="space-y-3 pt-3 border-t border-border animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="injury-location-select" className="text-xs font-semibold text-muted-foreground">{tx("Pain / Injury Location", "Zona del Dolor")}</label>
                      <select
                        id="injury-location-select"
                        name="injuryLocation"
                        value={injuryLocation}
                        onChange={(e) => setInjuryLocation(e.target.value)}
                        className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-11 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                      >
                        <option value="Right Knee / Patellar Tendon">{tx("Right Knee / Patellar Tendon", "Rodilla Derecha / Rotuliano")}</option>
                        <option value="Left Knee / Meniscus">{tx("Left Knee / Meniscus", "Rodilla Izquierda / Menisco")}</option>
                        <option value="Lower Back / Lumbar Spine">{tx("Lower Back / Lumbar Spine", "Zona Lumbar")}</option>
                        <option value="Shoulder / Rotator Cuff">{tx("Shoulder / Rotator Cuff", "Hombro / Manguito")}</option>
                        <option value="Hip Flexor / Adductor">{tx("Hip Flexor / Adductor", "Cadera / Aductor")}</option>
                        <option value="Hamstring Strain">{tx("Hamstring Strain", "Isquiotibiales")}</option>
                        <option value="Wrist / Forearm">{tx("Wrist / Forearm", "Muñeca / Antebrazo")}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="injury-severity-select" className="text-xs font-semibold text-muted-foreground">{tx("Severity Level", "Nivel de Severidad")}</label>
                      <select
                        id="injury-severity-select"
                        name="injurySeverity"
                        value={injurySeverity}
                        onChange={(e) => setInjurySeverity(e.target.value as any)}
                        className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-11 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                      >
                        <option value="mild">{tx("Mild (Slight ache, movable)", "Leve (Molestia menor)")}</option>
                        <option value="moderate">{tx("Moderate (Pain under load, modify exercises)", "Moderada (Ajustar cargas)")}</option>
                        <option value="severe">{tx("Severe (Sharp pain, stop all affected lifts)", "Severa (Parar ejercicio)")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="injury-notes-input" className="text-xs font-semibold text-muted-foreground">{tx("Specific Pain Symptoms & Trigger Cues", "Síntomas y Cuándo Duele")}</label>
                    <Input
                      id="injury-notes-input"
                      name="injuryNotes"
                      type="text"
                      placeholder={tx("e.g. Sharp pain when hitting bottom of squat at >100kg…", "Ej. Pinchazo abajo en la sentadilla con >100kg…")}
                      value={injuryNotes}
                      onChange={(e) => setInjuryNotes(e.target.value)}
                      className="text-xs min-h-[44px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="general-notes-input" className="text-xs font-semibold text-foreground">{tx("General Notes for Coach", "Notas Generales para Coach")}</label>
              <Input
                id="general-notes-input"
                name="generalNotes"
                type="text"
                placeholder={tx("Nutrition, travel fatigue, or training feedback…", "Comida, descanso o sensaciones del entreno…")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[44px]"
              />
            </div>
          </CardContent>

          <CardFooter className="bg-card border-t border-border flex justify-end p-4">
            <Button type="submit" variant="default" disabled={submitted} className="min-h-[44px] gap-2 font-semibold">
              {submitted ? (
                <span className="flex items-center gap-1.5" role="status" aria-live="polite">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> {tx("Sent to Coach", "Enviado al Coach")}
                </span>
              ) : (
                tx("Submit Check-In", "Enviar Chequeo")
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
