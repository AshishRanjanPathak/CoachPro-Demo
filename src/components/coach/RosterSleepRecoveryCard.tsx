"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Moon, Zap, HeartPulse, AlertCircle, ArrowUpRight } from "lucide-react";

interface RosterSleepRecoveryCardProps {
  onSelectAthlete?: (athleteId: string) => void;
  onOpenMessage?: (athleteId: string) => void;
}

export function RosterSleepRecoveryCard({ onSelectAthlete, onOpenMessage }: RosterSleepRecoveryCardProps) {
  const { state } = useAuth();
  const athletes = state.athletes;
  const checkIns = state.checkIns;

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="text-[10px] font-mono tracking-wider uppercase">
                Autonomic Readiness
              </Badge>
              <span className="text-xs text-muted-foreground">Daily Telemetry</span>
            </div>
            <CardTitle className="text-base sm:text-lg">Roster Sleep & Recovery Telemetry</CardTitle>
            <CardDescription className="text-xs">
              Real-time autonomic readiness, sleep duration, and active recovery metrics across all athletes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric summary grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Avg Sleep</span>
              <Moon className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">6.9 hrs</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Target: 8.0+ hrs</div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Avg Readiness</span>
              <Zap className="w-3.5 h-3.5 text-warning" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">6.3 / 10</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Autonomic baseline</div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>High Fatigue</span>
              <HeartPulse className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div className="text-xl font-bold text-destructive tabular-nums mt-1">
              {athletes.filter(a => a.fatigueLevel === "high" || a.fatigueLevel === "severe").length} Athletes
            </div>
            <div className="text-[10px] text-destructive/80 mt-0.5">Requires deload</div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Active Injuries</span>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div className="text-xl font-bold text-destructive tabular-nums mt-1">
              {athletes.filter(a => a.injuryStatus?.hasInjury).length} Flagged
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Priority 1 triage</div>
          </div>
        </div>

        {/* Detailed Athlete Recovery Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/70 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Athlete</th>
                  <th className="px-3 py-2.5 font-semibold">Sleep Duration</th>
                  <th className="px-3 py-2.5 font-semibold">Readiness Score</th>
                  <th className="px-3 py-2.5 font-semibold">Fatigue / Soreness</th>
                  <th className="px-3 py-2.5 font-semibold">Injury Flag</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {athletes.map((ath) => {
                  const checkIn = checkIns.find(c => c.athleteId === ath.id);
                  const sleepHours = checkIn ? checkIn.sleepHours : ath.id === "ath-2" ? 5.5 : ath.id === "ath-3" ? 6.5 : 8.2;
                  const readiness = ath.readinessScore || 7;
                  const hasInjury = ath.injuryStatus?.hasInjury;
                  const sleepPct = Math.min(100, (sleepHours / 9) * 100);

                  return (
                    <tr key={ath.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ath.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                            alt={ath.name}
                            className="w-7 h-7 rounded-full object-cover border border-border"
                          />
                          <div>
                            <div className="font-semibold text-foreground">{ath.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">{ath.trainingGoal}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-medium tabular-nums">{sleepHours} hrs</span>
                            <span className={`text-[10px] font-semibold ${sleepHours < 6.5 ? "text-destructive" : sleepHours < 7.5 ? "text-warning" : "text-success"}`}>
                              {sleepHours < 6.5 ? "Deficit" : sleepHours < 7.5 ? "Suboptimal" : "Optimal"}
                            </span>
                          </div>
                          <Progress value={sleepPct} className="h-1.5" />
                        </div>
                      </td>

                      <td className="px-3 py-3 min-w-[110px]">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold tabular-nums">{readiness} / 10</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${readiness <= 4 ? "bg-destructive" : readiness <= 6 ? "bg-warning" : "bg-success"}`}
                              style={{ width: `${readiness * 10}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              ath.fatigueLevel === "high" || ath.fatigueLevel === "severe"
                                ? "destructive"
                                : ath.fatigueLevel === "moderate"
                                ? "warning"
                                : "outline"
                            }
                            className="capitalize text-[10px] px-1.5 py-0"
                          >
                            {ath.fatigueLevel}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Soreness: {checkIn ? checkIn.sorenessScore : ath.fatigueLevel === "high" ? 4 : 2}/5
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {hasInjury ? (
                          <div className="flex items-center gap-1 text-destructive font-medium text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]">{ath.injuryStatus?.injuryLocation}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Cleared</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenMessage && (
                            <button
                              type="button"
                              onClick={() => onOpenMessage(ath.id)}
                              className="text-[11px] font-medium text-brand hover:underline px-1.5 py-1"
                            >
                              Chat
                            </button>
                          )}
                          {onSelectAthlete && (
                            <button
                              type="button"
                              onClick={() => onSelectAthlete(ath.id)}
                              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-foreground hover:text-brand bg-secondary px-2 py-1 rounded"
                            >
                              <span>View</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
