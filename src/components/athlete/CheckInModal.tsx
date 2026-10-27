"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Moon, Zap, CheckCircle2 } from "lucide-react";

export function CheckInCard() {
  const { state, addCheckIn } = useAuth();
  const [readiness, setReadiness] = useState(8);
  const [soreness, setSoreness] = useState(2);
  const [sleep, setSleep] = useState(8);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState("2026-10-27");

  React.useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckIn({
      readinessScore: readiness,
      fatigueLevel: soreness >= 4 ? "high" : soreness >= 3 ? "moderate" : "low",
      sorenessScore: soreness,
      sleepHours: sleep,
      hasInjury: false,
      notes: notes.trim() ? notes : undefined
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNotes("");
    }, 2500);
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="brand">Daily Recovery</Badge>
          <span className="text-xs text-muted-foreground">{currentDateStr}</span>
        </div>
        <CardTitle className="mt-1">Athlete Daily Check-In</CardTitle>
        <CardDescription>
          Transmit autonomic readiness and recovery data directly to Coach Sarah before training.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Readiness Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-warning" /> Overall Energy & Readiness
              </span>
              <span className="font-bold text-foreground tabular-nums">{readiness} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={readiness}
              onChange={(e) => setReadiness(parseInt(e.target.value))}
              className="w-full accent-brand h-2 bg-secondary rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Exhausted (1)</span>
              <span>Moderate (5)</span>
              <span>Peak Ready (10)</span>
            </div>
          </div>

          {/* Soreness Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-destructive" /> Muscle Soreness / Fatigue
              </span>
              <span className="font-bold text-foreground tabular-nums">{soreness} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={soreness}
              onChange={(e) => setSoreness(parseInt(e.target.value))}
              className="w-full accent-brand h-2 bg-secondary rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>None (1)</span>
              <span>Mild (3)</span>
              <span>Severely Sore (5)</span>
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
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

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Optional Recovery Notes
            </label>
            <Input
              type="text"
              placeholder="e.g. Mild right knee tightness during warmups..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Check-in History */}
          {state.checkIns.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Recent Check-Ins
              </div>
              <div className="space-y-1.5">
                {state.checkIns.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-xs">
                    <span className="font-medium text-foreground">{c.date}</span>
                    <span className="text-muted-foreground">Readiness: {c.readinessScore}/10 • Soreness: {c.sorenessScore}/5</span>
                    <span className="font-semibold text-brand tabular-nums">{c.sleepHours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-card border-t border-border flex justify-end p-4">
          <Button type="submit" variant="brand" disabled={submitted} className="min-h-[44px]">
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Transmitted to Coach!
              </>
            ) : (
              "Submit Daily Check-In"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
