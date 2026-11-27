"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Activity, MessageSquare, LineChart } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CoachSleepTableProps {
  onSelectAthlete: (athleteId: string) => void;
  onOpenMessages: (athleteId: string) => void;
}

export function CoachSleepTable({ onSelectAthlete, onOpenMessages }: CoachSleepTableProps) {
  const { state } = useAuth();
  const { tx } = useLanguage();
  const athletes = state.athletes;
  const [showAll, setShowAll] = useState(false);
  const displayedAthletes = showAll ? athletes : athletes.slice(0, 6);

  return (
    <section className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand" />
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {tx("Sleep & Readiness", "Sueño y Preparación")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-brand border border-border cursor-pointer transition-colors"
        >
          {showAll ? tx("Top 6", "Primeros 6") : `${tx("View All", "Ver Todos")} ${athletes.length}`}
        </button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground font-mono uppercase text-[10px] tracking-wider border-b border-border">
                <th className="py-3 px-4">{tx("Athlete / Program", "Atleta / Programa")}</th>
                <th className="py-3 px-4">{tx("Sleep (Last Night)", "Sueño (Última Noche)")}</th>
                <th className="py-3 px-4">{tx("Readiness", "Preparación")}</th>
                <th className="py-3 px-4">{tx("Fatigue", "Fatiga")}</th>
                <th className="py-3 px-4">{tx("Soreness", "Agujetas")}</th>
                <th className="py-3 px-4">{tx("Status", "Estado")}</th>
                <th className="py-3 px-4 text-right">{tx("Actions", "Acciones")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {displayedAthletes.map((ath) => {
                const isInjured = ath.status === "needs_attention" || ath.injuryStatus?.hasInjury;
                const initials = (ath.name || "A").split(" ").map(n => n[0]).join("");
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
                        {sleepH < 6.5 ? `${tx("Deficit", "Déficit")} (-${(7.5 - sleepH).toFixed(1)}h)` : tx("Target met", "Meta cumplida")}
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
                          {ath.injuryStatus?.injuryLocation || tx("Attention Flag", "Alerta Activa")}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[11px] font-medium border border-success/20">
                          {tx("Optimal (Cleared)", "Óptimo (Apto)")}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`${tx("Direct message", "Mensaje directo a")} ${ath.name}`}
                          onClick={() => onOpenMessages(ath.id)}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                          title={tx("Direct Message", "Mensaje Directo")}
                        >
                          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${tx("Inspect full profile for", "Ver perfil completo de")} ${ath.name}`}
                          onClick={() => onSelectAthlete(ath.id)}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-brand transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                          title={tx("Inspect Full Profile", "Ver Perfil Completo")}
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
