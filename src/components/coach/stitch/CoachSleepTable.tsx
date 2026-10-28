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
              {/* Maya Patel */}
              <tr className="hover:bg-secondary/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive font-mono font-bold flex items-center justify-center border border-destructive/30">
                      MP
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Maya Patel</div>
                      <div className="text-[11px] font-mono text-muted-foreground">Powerlifting Prep</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-destructive">5.5h</span>
                    <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-destructive h-full" style={{ width: "55%" }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-destructive">Deficit (-2.0h)</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-destructive/15 text-destructive font-mono text-[11px] font-semibold border border-destructive/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    4.0 / 10
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-destructive font-bold">4 / 5 (High)</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-destructive font-bold">4 / 5</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-destructive/15 text-destructive font-mono text-[11px] font-medium border border-destructive/20">
                    Patellar Tendon (Active)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Direct message Maya Patel"
                      onClick={() => onOpenMessages("ath-2")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Inspect full telemetry for Maya Patel"
                      onClick={() => onSelectAthlete("ath-2")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-brand transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Inspect Full Telemetry"
                    >
                      <LineChart className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Jordan Taylor */}
              <tr className="hover:bg-secondary/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-warning/20 text-warning font-mono font-bold flex items-center justify-center border border-warning/30">
                      JT
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Jordan Taylor</div>
                      <div className="text-[11px] font-mono text-muted-foreground">Hypertrophy Block</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-warning">7.2h</span>
                    <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-warning h-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Target met</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-warning/15 text-warning font-mono text-[11px] font-semibold border border-warning/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                    6.5 / 10
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-foreground font-medium">3 / 5 (Moderate)</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-warning font-medium">3 / 5</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-warning/15 text-warning font-mono text-[11px] font-medium border border-warning/20">
                    Lumbar Stiffness
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Direct message Jordan Taylor"
                      onClick={() => onOpenMessages("ath-3")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Inspect full telemetry for Jordan Taylor"
                      onClick={() => onSelectAthlete("ath-3")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-brand transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Inspect Full Telemetry"
                    >
                      <LineChart className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Alex Chen */}
              <tr className="hover:bg-secondary/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-success/20 text-success font-mono font-bold flex items-center justify-center border border-success/30">
                      AC
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Alex Chen</div>
                      <div className="text-[11px] font-mono text-muted-foreground">Strength &amp; Conditioning</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-success">8.2h</span>
                    <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-success h-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-success">Surplus (+0.7h)</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[11px] font-semibold border border-success/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    9.0 / 10
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-success font-bold">1 / 5 (Fresh)</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-muted-foreground">2 / 5</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[11px] font-medium border border-success/20">
                    Cleared (Peak)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Direct message Alex Chen"
                      onClick={() => onOpenMessages("usr-athlete-1")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Inspect full telemetry for Alex Chen"
                      onClick={() => onSelectAthlete("usr-athlete-1")}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-brand transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Inspect Full Telemetry"
                    >
                      <LineChart className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
