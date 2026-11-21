"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Dumbbell, CheckCircle2, TrendingUp, Clock, Flame } from "lucide-react";

export function CoachLiveActivityCard() {
  const { state } = useAuth();
  const session = state.activeSession;
  const auditLogs = state.auditLogs;

  // Calculate live volume and adherence metrics
  const totalCompletedSets = session.sets.length;
  const recentSets = [...session.sets].reverse().slice(0, 4);

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono tracking-wider uppercase">
                Live Feed
              </Badge>
              <span className="text-xs text-muted-foreground">Session Telemetry</span>
            </div>
            <CardTitle className="text-base sm:text-lg">Recent Activity & Live Training Logs</CardTitle>
            <CardDescription className="text-xs">
              Live athlete session updates, set execution data, and training adherence progress.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress Bars for Coach Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-secondary/40 border border-border rounded-xl">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand" /> Weekly Roster Adherence
              </span>
              <span className="font-bold text-foreground tabular-nums">82%</span>
            </div>
            <Progress value={82} className="h-2 bg-secondary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Current: 82%</span>
              <span className="text-brand font-medium">Target: 85%+</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-warning" /> Weekly Prescribed Volume
              </span>
              <span className="font-bold text-foreground tabular-nums">48,250 / 55,000 kg (87%)</span>
            </div>
            <Progress value={87} className="h-2 bg-secondary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Tonnage Lifted</span>
              <span className="text-success font-medium">On Track</span>
            </div>
          </div>
        </div>

        {/* Live Set & Workout Feed */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Recent Completed Sets & Logs
          </div>

          <div className="space-y-2">
            {recentSets.length > 0 ? (
              recentSets.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-brand/10 text-brand flex items-center justify-center font-bold text-[11px]">
                      S{s.setNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{s.exerciseName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Prescribed: {s.prescribedWeightKg ? `${s.prescribedWeightKg}kg` : "BW"} × {s.prescribedReps || "reps"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-foreground tabular-nums">
                      {s.completedWeightKg} kg × {s.completedReps} reps
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      @ RPE {s.rpe} • Est 1RM: {Math.round(s.completedWeightKg * (1 + s.completedReps / 30))}kg
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No sets logged in current active buffer. Athlete logs will stream here live.
              </div>
            )}
          </div>
        </div>

        {/* Audit Log / Event Feed */}
        {auditLogs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Audit Stream
            </div>
            <div className="space-y-1.5">
              {auditLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-secondary/40 text-muted-foreground"
                >
                  <span className="font-medium text-foreground">{log.action}</span>
                  <span className="text-[10px] tabular-nums">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
