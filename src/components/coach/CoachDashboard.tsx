"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { CoachTriageQueue } from "@/components/coach/stitch/CoachTriageQueue";
import { CoachSleepTable } from "@/components/coach/stitch/CoachSleepTable";
import { CoachActivityFeed } from "@/components/coach/stitch/CoachActivityFeed";
import {
  ArrowDown,
  PlusCircle,
  Megaphone,
  Bell
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CoachDashboardProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
  onNavigateToBuilder: () => void;
  onOpenQueue?: () => void;
}

export function CoachDashboard({
  onSelectAthlete,
  onOpenMessages,
  onNavigateToBuilder,
  onOpenQueue,
}: CoachDashboardProps) {
  const { state } = useAuth();
  const { tx } = useLanguage();
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const athletes = state.athletes;
  const injuredCount = athletes.filter((a) => a.injuryStatus?.hasInjury).length;
  const highFatigueCount = athletes.filter((a) => a.fatigueLevel === "high" || a.fatigueLevel === "severe").length;

  const handleBroadcast = () => {
    setBroadcastNotice(`Team Broadcast dispatched to all ${athletes.length} athletes: 'Hydration & mobility check before tomorrow\'s squat session.'`);
    setTimeout(() => {
      setBroadcastNotice(null);
    }, 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Coach Status Sub-Bar & Tactical Quick-Nav (Stitch Design) */}
      <section className="flex flex-col space-y-4">
        <div className="bg-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-brand text-base font-bold font-mono border border-border">
                SJ
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-success ring-2 ring-card"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Sarah Jenkins, CSCS
              </span>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-0.5">
                <span className="font-mono">{athletes.length} {tx("Athletes", "Atletas")}</span>
                <span>•</span>
                <span className="font-mono">3 {tx("Programs", "Programas")}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Utility Rail */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={onNavigateToBuilder}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-[0.98] transition-colors shrink-0 cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>{tx("New Program", "Nuevo Programa")}</span>
            </button>
            <button
              type="button"
              onClick={handleBroadcast}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center gap-1.5 border border-border transition-colors shrink-0 cursor-pointer min-h-[44px]"
            >
              <Megaphone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>{tx("Broadcast", "Aviso Global")}</span>
            </button>
            <button
              type="button"
              aria-label={`View ${injuredCount + highFatigueCount} alerts in attention queue`}
              onClick={onOpenQueue}
              className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center relative border border-border transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
            >
              <Bell className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground font-mono text-[9px] flex items-center justify-center font-bold tabular-nums">
                {injuredCount + highFatigueCount}
              </span>
            </button>
          </div>
        </div>

        {/* Broadcast Toast Banner */}
        {broadcastNotice && (
          <div role="status" aria-live="polite" className="p-3 rounded-xl bg-brand/15 border border-brand/20 text-brand text-xs font-medium flex items-center gap-2">
            <Megaphone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{broadcastNotice}</span>
          </div>
        )}
      </section>

      {/* Section: Top Telemetry KPI Cards (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Roster Load */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 border border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Active Roster", "Plantilla Activa")}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums flex items-baseline gap-1.5">
            <span>{athletes.length}</span>
            <span className="text-sm font-normal text-muted-foreground">{tx("Athletes", "Atletas")}</span>
          </div>
          <div className="flex -space-x-2 pt-1">
            {athletes.slice(0, 3).map(ath => (
              <div key={ath.id} className="w-7 h-7 rounded-full bg-secondary text-foreground text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-card shrink-0" title={ath.name}>
                {(ath.name || "A").split(" ").map(n => n[0]).join("")}
              </div>
            ))}
            {athletes.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-card shrink-0">
                +{athletes.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* KPI 2: Attention */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 border border-border border-l-2 border-l-destructive">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {tx("Attention", "Atención")}
            </span>
            <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-destructive tracking-tight flex items-baseline gap-2 tabular-nums">
              <span>{injuredCount} {tx("Urgent", "Urgentes")}</span>
              <span className="text-sm font-normal text-muted-foreground">/ {highFatigueCount} {tx("Fatigue", "Fatiga")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Maya Patel • {tx("Patellar Tendon", "Tendón Rotuliano")}</p>
          </div>
        </div>

        {/* KPI 3: Sleep */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 border border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Avg Sleep", "Sueño Medio")}
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums flex items-baseline gap-1">
              <span>7.0</span>
              <span className="text-sm font-normal text-muted-foreground">hrs</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 tabular-nums">
              <ArrowDown className="w-3 h-3 text-destructive" aria-hidden="true" />
              {tx("-0.5h vs 7.5h target", "-0.5h vs objetivo 7.5h")}
            </p>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-destructive h-full" style={{ width: "25%" }} title="Maya (5.5h)"></div>
            <div className="bg-warning h-full" style={{ width: "35%" }} title="Jordan (7.2h)"></div>
            <div className="bg-success h-full" style={{ width: "40%" }} title="Alex (8.2h)"></div>
          </div>
        </div>

        {/* KPI 4: Readiness */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 border border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {tx("Readiness", "Energía")}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight flex items-baseline gap-1 tabular-nums">
            <span>6.3</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="grid grid-cols-5 gap-1 h-1.5">
            <div className="bg-destructive rounded-full"></div>
            <div className="bg-warning rounded-full"></div>
            <div className="bg-warning/70 rounded-full"></div>
            <div className="bg-success rounded-full"></div>
            <div className="bg-secondary rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Coach Overview Sections */}
      <div className="space-y-6">
        <CoachTriageQueue
          onSelectAthlete={onSelectAthlete}
          onOpenMessages={onOpenMessages}
        />
        <CoachSleepTable
          onSelectAthlete={(athId) => {
            const ath = athletes.find((a) => a.id === athId);
            if (ath) onSelectAthlete(ath);
          }}
          onOpenMessages={onOpenMessages}
        />
        <CoachActivityFeed />
      </div>
    </div>
  );
}
