"use client";

import React from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Activity, MessageSquare, LineChart } from "lucide-react";

interface CoachSleepTableProps {
  onSelectAthlete: (athleteId: string) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function CoachSleepTable({ onSelectAthlete, onOpenMessages }: CoachSleepTableProps) {
  const { state } = useAuth();
  const athletes = state.athletes;

  return (
    <section className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand" />
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Roster Autonomic &amp; Sleep Telemetry
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">Last synced: 14 mins ago</span>
      </div>

      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground font-mono uppercase text-[10px] tracking-wider border-b border-border">
                <th className="py-3 px-4">Athlete / Program</th>
                <th className="py-3 px-4">Sleep (Last Night)</th>
                <th className="py-3 px-4">Readiness CNS</th>
                <th className="py-3 px-4">Fatigue</th>
                <th className="py-3 px-4">Soreness</th>
                <th className="py-3 px-4">Clinical Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {athletes.slice(0, 6).map((ath) => {
                const isInjured = ath.status === "needs_attention" || ath.injuryStatus?.hasInjury;
                const initials = ath.name.split(" ").map(n => n[0]).join("");
                const sleepH = ath.sleepHours || (ath.readinessScore >= 8 ? 8.2 : ath.readinessScore <= 4 ? 5.5 : 7.0);
                const sleepPct = Math.min(100, Math.round((sleepH / 9) * 100));

                return (
                  <tr key={ath.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg font-mono font-bold flex items-center justify-center border ${
                          isInjured ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-success/20 text-success border-success/30"
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{ath.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{ath.squad || "General Cohort"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${sleepH < 6.5 ? "text-destructive" : sleepH < 7.5 ? "text-warning" : "text-success"}`}>
                          {sleepH}h
                        </span>
                        <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${sleepH < 6.5 ? "bg-destructive" : sleepH < 7.5 ? "bg-warning" : "bg-success"}`} style={{ width: `${sleepPct}%` }}></div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {sleepH < 6.5 ? `Deficit (-${(7.5 - sleepH).toFixed(1)}h)` : "Target met"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                        ath.readinessScore <= 5
                          ? "bg-destructive/15 text-destructive border-destructive/20"
                          : ath.readinessScore <= 7
                          ? "bg-warning/15 text-warning border-warning/20"
                          : "bg-success/15 text-success border-success/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ath.readinessScore <= 5 ? "bg-destructive" : ath.readinessScore <= 7 ? "bg-warning" : "bg-success"}`}></span>
                        {ath.readinessScore}.0 / 10
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={ath.fatigueLevel === "high" || ath.fatigueLevel === "severe" ? "text-destructive font-bold capitalize" : "text-foreground capitalize"}>
                        {ath.fatigueLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={ath.readinessScore <= 5 ? "text-destructive font-bold" : "text-muted-foreground"}>
                        {ath.readinessScore <= 5 ? "4 / 5" : "2 / 5"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isInjured ? (
                        <span className="px-2 py-0.5 rounded bg-destructive/15 text-destructive font-mono text-[11px] font-medium border border-destructive/20">
                          {ath.injuryStatus?.injuryLocation || "Attention Flag"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[11px] font-medium border border-success/20">
                          Optimal (Cleared)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Direct message ${ath.name}`}
                          onClick={() => onOpenMessages(ath.id)}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                          title="Direct Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Inspect full telemetry for ${ath.name}`}
                          onClick={() => onSelectAthlete(ath.id)}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-brand transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                          title="Inspect Full Telemetry"
                        >
                          <LineChart className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
