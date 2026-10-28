"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile } from "@/types";
import { CoachTriageQueue } from "@/components/coach/stitch/CoachTriageQueue";
import { CoachSleepTable } from "@/components/coach/stitch/CoachSleepTable";
import { CoachActivityFeed } from "@/components/coach/stitch/CoachActivityFeed";
import { CoachProgressionCurve } from "@/components/coach/stitch/CoachProgressionCurve";
import { AthleteRoster } from "@/components/coach/AthleteRoster";
import {
  TrendingUp,
  AlertTriangle,
  ArrowDown,
  PlusCircle,
  Megaphone,
  Bell,
  Gauge,
  HeartPulse,
  Users,
  Dumbbell,
  LineChart,
  MessageSquare
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
  const [activeSegment, setActiveSegment] = useState<"hub" | "triage" | "roster" | "builder" | "analytics" | "messages">("hub");
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
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Sarah Jenkins, CSCS
                </span>
                <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand text-[10px] font-mono font-bold uppercase border border-brand/20">
                  Lead Coach
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-0.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Online • Active Lab Session
                </span>
                <span>•</span>
                <span className="font-mono text-brand font-medium">3 Active Programs</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-muted-foreground">{currentUser.organizationName}</span>
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
              <span>New Program</span>
            </button>
            <button
              type="button"
              onClick={handleBroadcast}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center gap-1.5 border border-border transition-colors shrink-0 cursor-pointer min-h-[44px]"
            >
              <Megaphone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>Broadcast</span>
            </button>
            <button
              type="button"
              aria-label="View 2 critical alerts in attention queue"
              onClick={() => setActiveSegment("triage")}
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

        {/* Filter / Segment Rail Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveSegment("hub")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "hub"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Coach Hub</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("triage")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "triage"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-destructive" />
            <span>Clinical Triage</span>
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping"></span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("roster")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "roster"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Athlete Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("builder")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "builder"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Program Builder</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("analytics")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "analytics"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Telemetry Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("messages")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSegment === "messages"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Athlete Messages</span>
          </button>
        </div>
      </section>

      {/* Section: Top Telemetry KPI Cards (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Roster Load */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Active Cohort
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-brand text-[10px] font-mono font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.4% Load
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums">
              {athletes.length} Athletes
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">100% on scheduled microcycles</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-2">
              {athletes.slice(0, 3).map(ath => (
                <div key={ath.id} className="w-7 h-7 rounded-full bg-brand/20 text-brand text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-card" title={ath.name}>
                  {ath.name.split(" ").map(n => n[0]).join("")}
                </div>
              ))}
              {athletes.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-card">
                  +{athletes.length - 3}
                </div>
              )}
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Across 4 Squads</span>
          </div>
        </div>

        {/* KPI 2: Clinical Triage Alerts */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border border-destructive/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Clinical Attention
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-mono font-bold border border-destructive/20">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></span>
              Action Reqd
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-destructive tracking-tight flex items-baseline gap-2 tabular-nums">
              <span>1 Urgent</span>
              <span className="text-sm font-normal text-muted-foreground">/ 1 Caution</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Maya Patel: Patellar Tendon</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-destructive/15 text-destructive text-[10px] font-mono truncate">
              Maya P. 6/10 Pain
            </span>
            <span className="px-2 py-0.5 rounded bg-warning/15 text-warning text-[10px] font-mono truncate">
              Jordan T. Back
            </span>
          </div>
        </div>

        {/* KPI 3: Sleep Telemetry */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Roster Avg Sleep
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Baseline: 7.5h</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums">
              7.0 hrs
            </div>
            <p className="text-xs text-destructive mt-0.5 flex items-center gap-1">
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              -0.5h 7-day rolling deficit
            </p>
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden flex">
              <div className="bg-destructive h-full" style={{ width: "25%" }} title="Maya (5.5h)"></div>
              <div className="bg-warning h-full" style={{ width: "35%" }} title="Jordan (7.2h)"></div>
              <div className="bg-success h-full" style={{ width: "40%" }} title="Alex (8.2h)"></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Maya: 5.5h</span>
              <span>Jordan: 7.2h</span>
              <span>Alex: 8.2h</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Autonomic Readiness Gauge */}
        <div className="bg-card rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Autonomic Index
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-brand text-[10px] font-mono font-semibold">
              HRV &amp; CNS
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight flex items-baseline gap-1 tabular-nums">
              <span>6.3</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Aggregate readiness score</p>
          </div>
          <div className="space-y-1 pt-1">
            <div className="grid grid-cols-5 gap-1 h-2">
              <div className="bg-destructive rounded-full"></div>
              <div className="bg-warning rounded-full"></div>
              <div className="bg-warning/70 rounded-full"></div>
              <div className="bg-success rounded-full"></div>
              <div className="bg-secondary rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>4.0 (Maya)</span>
              <span>Mean 6.3</span>
              <span>9.0 (Alex)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Views based on Selected Segment Pill */}
      {activeSegment === "hub" && (
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
          <CoachProgressionCurve />
        </div>
      )}

      {activeSegment === "triage" && (
        <CoachTriageQueue
          onSelectAthlete={onSelectAthlete}
          onOpenMessages={onOpenMessages}
        />
      )}

      {activeSegment === "roster" && (
        <AthleteRoster />
      )}

      {activeSegment === "builder" && (
        <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-3">
          <Dumbbell className="w-10 h-10 text-brand mx-auto" />
          <h3 className="text-base font-bold text-foreground">Program Builder Workspace</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Design multi-week periodized training blocks, configure compound lift percentages, and sequence rest days.
          </p>
          <button
            type="button"
            onClick={onNavigateToBuilder}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Open Full Program Generator
          </button>
        </div>
      )}

      {activeSegment === "analytics" && <CoachProgressionCurve />}

      {activeSegment === "messages" && (
        <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-3">
          <MessageSquare className="w-10 h-10 text-brand mx-auto" />
          <h3 className="text-base font-bold text-foreground">Athlete Direct Messaging</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Direct two-way encrypted chat channels with your roster athletes.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            {athletes.map((ath) => (
              <button
                key={ath.id}
                type="button"
                onClick={() => onOpenMessages(ath.id)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border"
              >
                Chat with {ath.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
