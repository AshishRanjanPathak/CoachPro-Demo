"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RosterSleepRecoveryCard } from "@/components/coach/RosterSleepRecoveryCard";
import { CoachLiveActivityCard } from "@/components/coach/CoachLiveActivityCard";
import { IndividualProgressAnalytics } from "@/components/coach/IndividualProgressAnalytics";
import { PrioritizedAttentionQueue } from "@/components/coach/PrioritizedAttentionQueue";
import {
  Users,
  AlertTriangle,
  Zap,
  Moon,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Filter
} from "lucide-react";

interface CoachDashboardProps {
  onSelectAthlete: (athlete: AthleteProfile) => void;
  onOpenMessages: (athleteId: string) => void;
  onNavigateToBuilder: () => void;
}

export function CoachDashboard({
  onSelectAthlete,
  onOpenMessages,
  onNavigateToBuilder,
}: CoachDashboardProps) {
  const { state, currentUser } = useAuth();
  const [selectedAthleteIdForAnalytics, setSelectedAthleteIdForAnalytics] = useState<string>("usr-athlete-1");
  const [activeViewSection, setActiveViewSection] = useState<"all" | "analytics" | "recovery" | "activity">("all");

  const athletes = state.athletes;
  const injuredCount = athletes.filter((a) => a.injuryStatus?.hasInjury).length;
  const highFatigueCount = athletes.filter((a) => a.fatigueLevel === "high" || a.fatigueLevel === "severe").length;

  const selectedAthlete =
    athletes.find((a) => a.id === selectedAthleteIdForAnalytics) || athletes[0];

  return (
    <div className="space-y-6">
      {/* Coach Command Center Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl text-foreground">
              Coach Command Center
            </span>
            <Badge variant="brand" className="text-[10px] uppercase font-mono tracking-wider">
              Lead Coach
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {currentUser.name} • {currentUser.organizationName} • All systems operational
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToBuilder}
            className="text-xs gap-1.5 flex-1 sm:flex-initial min-h-[38px]"
          >
            <Layers className="w-4 h-4 text-brand" /> Program Builder
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              const injured = athletes.find((a) => a.injuryStatus?.hasInjury);
              if (injured) onSelectAthlete(injured);
            }}
            className="text-xs gap-1.5 flex-1 sm:flex-initial min-h-[38px]"
          >
            <AlertTriangle className="w-4 h-4" /> Triage Queue ({injuredCount})
          </Button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Roster Size</span>
            <Users className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-2">
            {athletes.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Active assigned athletes</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Clinical Triage</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive tabular-nums mt-2">
            {injuredCount} Injured
          </div>
          <div className="text-[11px] text-destructive/80 mt-0.5">
            {highFatigueCount} high fatigue alerts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Avg Sleep</span>
            <Moon className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-2">
            7.0 hrs
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Maya (5.5h) • Alex (8.2h)</div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Readiness Score</span>
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-2">
            6.3 / 10
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Autonomic baseline</div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveViewSection("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeViewSection === "all"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Full Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveViewSection("recovery")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeViewSection === "recovery"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Sleep & Recovery
        </button>
        <button
          type="button"
          onClick={() => setActiveViewSection("activity")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeViewSection === "activity"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Live Activity & Progress Bars
        </button>
        <button
          type="button"
          onClick={() => setActiveViewSection("analytics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeViewSection === "analytics"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Progress Analytics Curves
        </button>
      </div>

      {/* SECTION: Sleep & Autonomic Recovery Monitor */}
      {(activeViewSection === "all" || activeViewSection === "recovery") && (
        <RosterSleepRecoveryCard
          onSelectAthlete={(athId) => {
            const ath = athletes.find((a) => a.id === athId);
            if (ath) onSelectAthlete(ath);
          }}
          onOpenMessage={(athId) => onOpenMessages(athId)}
        />
      )}

      {/* SECTION: Live Training Logs & Progress Bars */}
      {(activeViewSection === "all" || activeViewSection === "activity") && (
        <CoachLiveActivityCard />
      )}

      {/* SECTION: Interactive Recharts Progress Analytics Suite */}
      {(activeViewSection === "all" || activeViewSection === "analytics") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand" /> Athlete Progress Visuals & Analytics
              </h3>
              <p className="text-xs text-muted-foreground">
                Section 12 Recharts curve tracking 1RM strength progression, volume, and rep PRs.
              </p>
            </div>

            {/* Athlete selector tabs */}
            <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-lg border border-border w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-semibold text-muted-foreground px-2 hidden md:inline">
                Athlete:
              </span>
              {athletes.map((ath) => (
                <button
                  key={ath.id}
                  type="button"
                  onClick={() => setSelectedAthleteIdForAnalytics(ath.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedAthleteIdForAnalytics === ath.id
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ath.name}
                </button>
              ))}
            </div>
          </div>

          {selectedAthlete && (
            <IndividualProgressAnalytics athlete={selectedAthlete} />
          )}
        </div>
      )}
    </div>
  );
}
