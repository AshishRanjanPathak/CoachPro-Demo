"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, AlertTriangle, Moon, Zap, CheckCircle2, ShieldAlert } from "lucide-react";

export function RecoveryInjuryCard() {
  const { state, addCheckIn, currentUser } = useAuth();
  const currentAthlete = state.athletes.find(a => a.id === currentUser.id) || state.athletes[0];

  const [readiness, setReadiness] = useState(currentAthlete.readinessScore || 8);
  const [soreness, setSoreness] = useState(2);
  const [fatigue, setFatigue] = useState<"low" | "moderate" | "high" | "severe">(currentAthlete.fatigueLevel || "low");
  const [sleep, setSleep] = useState(8);
  const [hasInjury, setHasInjury] = useState(currentAthlete.injuryStatus?.hasInjury || false);
  const [injuryLocation, setInjuryLocation] = useState(currentAthlete.injuryStatus?.injuryLocation || "Right Knee / Patellar");
  const [injurySeverity, setInjurySeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [injuryNotes, setInjuryNotes] = useState(currentAthlete.injuryStatus?.details || "");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckIn({
      readinessScore: readiness,
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
      {currentAthlete.injuryStatus?.hasInjury && (
        <div className="p-4 rounded-xl border border-warning/40 bg-warning/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">Active Injury Flagged with Coach Sarah:</span>
            <span className="text-muted-foreground mt-0.5 block">
              {currentAthlete.injuryStatus.injuryLocation} ({currentAthlete.injuryStatus.severity} severity) — “{currentAthlete.injuryStatus.details}”
            </span>
            <span className="text-warning font-semibold text-[11px] mt-1 block">
              Coach has prioritized your profile in the Attention Queue.
            </span>
          </div>
        </div>
      )}

      <Card className="border-border shadow-xs bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Daily Recovery & Health</Badge>
            <span className="text-xs text-muted-foreground">{new Date().toISOString().substring(0, 10)}</span>
          </div>
          <CardTitle className="mt-1">Fatigue, Soreness & Injury Reporting</CardTitle>
          <CardDescription>
            Report recovery telemetry and acute physical discomfort to alert your coach before training.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Readiness & Energy Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-warning" /> Central Readiness Score
                </span>
                <span className="font-bold text-brand tabular-nums">{readiness} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={readiness}
                onChange={(e) => setReadiness(parseInt(e.target.value))}
                className="w-full accent-brand h-2.5 bg-secondary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Severe Exhaustion (1)</span>
                <span>Moderate (5)</span>
                <span>Peak Recovery (10)</span>
              </div>
            </div>

            {/* Fatigue Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Accumulated Fatigue Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "moderate", "high", "severe"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFatigue(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border capitalize transition-all ${
                      fatigue === lvl
                        ? "border-brand bg-brand/10 text-brand font-bold shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep & Soreness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-brand" /> Sleep Duration (Hours)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleep}
                  onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
                  className="tabular-nums font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-destructive" /> Muscle Soreness (1–5)
                </label>
                <select
                  value={soreness}
                  onChange={(e) => setSoreness(parseInt(e.target.value))}
                  className="w-full text-xs bg-card border border-border rounded-md px-3 py-2.5 text-foreground font-semibold h-11"
                >
                  <option value={1}>1 — Fresh / Zero Soreness</option>
                  <option value={2}>2 — Mild Stiffness</option>
                  <option value={3}>3 — Moderate Soreness</option>
                  <option value={4}>4 — Heavy Fatigue</option>
                  <option value={5}>5 — Severely Sore / Impaired</option>
                </select>
              </div>
            </div>

            {/* INJURY & PAIN FLAG SECTION */}
            <div className="p-4 rounded-xl border border-border bg-secondary/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Report Injury or Pain Flare-Up</h4>
                    <p className="text-xs text-muted-foreground">Flags profile for immediate coach intervention</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInjury}
                    onChange={(e) => setHasInjury(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive"></div>
                </label>
              </div>

              {hasInjury && (
                <div className="space-y-3 pt-3 border-t border-border animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Pain / Injury Location</label>
                      <select
                        value={injuryLocation}
                        onChange={(e) => setInjuryLocation(e.target.value)}
                        className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-10"
                      >
                        <option value="Right Knee / Patellar Tendon">Right Knee / Patellar Tendon</option>
                        <option value="Left Knee / Meniscus">Left Knee / Meniscus</option>
                        <option value="Lower Back / Lumbar Spine">Lower Back / Lumbar Spine</option>
                        <option value="Shoulder / Rotator Cuff">Shoulder / Rotator Cuff</option>
                        <option value="Hip Flexor / Adductor">Hip Flexor / Adductor</option>
                        <option value="Hamstring Strain">Hamstring Strain</option>
                        <option value="Wrist / Forearm">Wrist / Forearm</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Severity Level</label>
                      <select
                        value={injurySeverity}
                        onChange={(e) => setInjurySeverity(e.target.value as any)}
                        className="w-full text-xs bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold h-10"
                      >
                        <option value="mild">Mild (Slight ache, movable)</option>
                        <option value="moderate">Moderate (Pain under load, modify exercises)</option>
                        <option value="severe">Severe (Sharp pain, stop all affected lifts)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Specific Pain Symptoms & Trigger Cues</label>
                    <Input
                      type="text"
                      placeholder="e.g. Sharp pain when hitting bottom of squat at >100kg..."
                      value={injuryNotes}
                      onChange={(e) => setInjuryNotes(e.target.value)}
                      className="text-xs h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* General Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">General Notes for Coach</label>
              <Input
                type="text"
                placeholder="Nutrition, travel fatigue, or training feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>

          <CardFooter className="bg-card border-t border-border flex justify-end p-4">
            <Button type="submit" variant="brand" disabled={submitted} className="min-h-[44px] gap-2 font-semibold">
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Transmitted to Coach Attention Feed!
                </>
              ) : (
                "Transmit Recovery & Health Status"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
