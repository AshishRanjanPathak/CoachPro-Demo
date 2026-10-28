"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { TrendingUp, ChevronDown, Award, User } from "lucide-react";

export function CoachProgressionCurve() {
  const { state } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("usr-athlete-1"); // Alex Chen default
  const [selectedExercise, setSelectedExercise] = useState<"squat" | "bench" | "deadlift" | "ohp">("squat");
  const [selectedRange, setSelectedRange] = useState<"1M" | "3M" | "6M" | "ALL">("3M");

  const currentAthlete = state.athletes.find(a => a.id === selectedAthleteId) || state.athletes[0];

  // Group athletes by squad for organized multi-athlete scanning
  const squads = useMemo(() => {
    const map = new Map<string, typeof state.athletes>();
    state.athletes.forEach(ath => {
      const sq = ath.squad || "General Cohort";
      if (!map.has(sq)) map.set(sq, []);
      map.get(sq)!.push(ath);
    });
    return Array.from(map.entries());
  }, [state.athletes]);

  return (
    <section className="bg-card rounded-xl p-4 sm:p-5 flex flex-col space-y-4 border border-border shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight text-balance">
              Strength Telemetry &amp; Progression Curves
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
            High-precision velocity-adjusted 1RM estimation &amp; total tonnage curves across your roster
          </p>
        </div>

        {/* Scalable Athlete Selector with Squad Grouping & Quick Pinned Switchers */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Dropdown for All 20 Athletes across squads */}
          <div className="relative">
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              aria-label="Select athlete for telemetry progression"
              className="text-xs bg-secondary border border-border rounded-xl pl-3 pr-8 py-2 text-foreground font-semibold h-10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none cursor-pointer min-w-[240px] appearance-none"
            >
              {squads.map(([squadName, squadAthletes]) => (
                <optgroup key={squadName} label={`── ${squadName} (${squadAthletes.length}) ──`}>
                  {squadAthletes.map(ath => (
                    <option key={ath.id} value={ath.id}>
                      {ath.name} — {ath.squad || "General"} {ath.status === "needs_attention" ? "⚠️" : "✓"}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Quick Pinned Shortcuts (3 athletes) */}
          <div className="hidden lg:flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border" role="tablist" aria-label="Pinned athlete quick switcher">
            {[
              { id: "usr-athlete-1", label: "Alex" },
              { id: "ath-2", label: "Maya" },
              { id: "ath-3", label: "Jordan" },
              { id: "ath-5", label: "Sophia" }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selectedAthleteId === item.id}
                onClick={() => setSelectedAthleteId(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer min-h-[32px] ${
                  selectedAthleteId === item.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Filter Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Exercise selection">
          <button
            type="button"
            aria-pressed={selectedExercise === "squat"}
            onClick={() => setSelectedExercise("squat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 border min-h-[38px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
              selectedExercise === "squat"
                ? "bg-secondary text-brand border-border"
                : "bg-background text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40"
            }`}
          >
            <span>Barbell Back Squat</span>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-pressed={selectedExercise === "bench"}
            onClick={() => setSelectedExercise("bench")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono min-h-[38px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
              selectedExercise === "bench"
                ? "bg-secondary text-brand font-semibold"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            Bench Press
          </button>
          <button
            type="button"
            aria-pressed={selectedExercise === "deadlift"}
            onClick={() => setSelectedExercise("deadlift")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono min-h-[38px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
              selectedExercise === "deadlift"
                ? "bg-secondary text-brand font-semibold"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            Conventional Deadlift
          </button>
          <button
            type="button"
            aria-pressed={selectedExercise === "ohp"}
            onClick={() => setSelectedExercise("ohp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono min-h-[38px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
              selectedExercise === "ohp"
                ? "bg-secondary text-brand font-semibold"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            Overhead Press
          </button>
        </div>

        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border" role="group" aria-label="Time range selector">
          {(["1M", "3M", "6M", "ALL"] as const).map((rng) => (
            <button
              key={rng}
              type="button"
              aria-pressed={selectedRange === rng}
              onClick={() => setSelectedRange(rng)}
              className={`px-2.5 py-1 rounded text-xs font-mono min-h-[34px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
                selectedRange === rng
                  ? "bg-card text-brand font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* High-Fidelity SVG Strength Curve Chart */}
      <div className="bg-background rounded-xl p-4 sm:p-5 flex flex-col space-y-4 relative overflow-hidden border border-border">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Estimated 1RM Overload Curve
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-foreground tracking-tight mt-0.5">
              166.0&nbsp;kg{" "}
              <span className="text-success text-base sm:text-lg font-semibold ml-2 tabular-nums">
                +16.0&nbsp;kg (+10.6%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-muted-foreground">Selected Point</span>
            <div className="text-xs sm:text-sm font-mono tabular-nums text-brand font-bold">
              142.5&nbsp;kg × 5 @ RPE 8.5
            </div>
          </div>
        </div>

        {/* Area Chart SVG */}
        <div className="relative w-full h-52 sm:h-56 pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 220" role="img" aria-label="1RM Overload Curve visual graph">
            <defs>
              <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7C8FD8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7C8FD8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Horizontal Grid */}
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="20" y2="20" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="75" y2="75" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="130" y2="130" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="185" y2="185" />
            {/* Area Fill */}
            <polygon fill="url(#curveGradient)" points="40,185 40,165 180,150 320,135 460,110 600,80 740,35 740,185" />
            {/* Line Path */}
            <path
              d="M 40,165 C 120,155 240,142 320,135 C 400,128 520,95 600,80 C 660,70 700,45 740,35"
              fill="none"
              stroke="#7C8FD8"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
            {/* Coordinate Dots */}
            <circle cx="40" cy="165" fill="#0F172A" r="5" stroke="#7C8FD8" strokeWidth="2.5" />
            <circle cx="180" cy="150" fill="#0F172A" r="5" stroke="#7C8FD8" strokeWidth="2.5" />
            <circle cx="320" cy="135" fill="#0F172A" r="5" stroke="#7C8FD8" strokeWidth="2.5" />
            <circle cx="460" cy="110" fill="#0F172A" r="5" stroke="#7C8FD8" strokeWidth="2.5" />
            <circle cx="600" cy="80" fill="#0F172A" r="5" stroke="#7C8FD8" strokeWidth="2.5" />
            <circle cx="740" cy="35" fill="#10B981" r="7" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Floating Tooltip Pill */}
          <div className="absolute right-2 sm:right-6 top-1 bg-card/95 border border-border p-2 rounded-lg shadow-lg pointer-events-none flex flex-col backdrop-blur-xs">
            <span className="text-[10px] font-mono text-success font-bold uppercase">Latest Peak: Today 14:22</span>
            <span className="text-xs font-bold font-mono text-foreground">166.0 kg Est 1RM</span>
            <span className="text-[11px] font-mono text-muted-foreground">142.5kg × 5 reps (+4.2%)</span>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground px-2 sm:px-6 overflow-x-auto">
          <span>Jan 08 (150kg)</span>
          <span className="hidden sm:inline">Jan 22 (152.5kg)</span>
          <span>Feb 05 (155kg)</span>
          <span className="hidden sm:inline">Feb 19 (158kg)</span>
          <span>Mar 02 (162kg)</span>
          <span className="text-success font-bold">Mar 12: Peak PR (166kg)</span>
        </div>

        {/* Session Tonnage Mini Bar Telemetry */}
        <div className="pt-3 border-t border-border bg-card/40 p-3 rounded-lg flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-foreground">Session Volume Tonnage (Last 6 Squat Sessions)</span>
            <span className="text-foreground font-semibold tabular-nums">Mean: 13,850&nbsp;kg / session</span>
          </div>
          <div className="grid grid-cols-6 gap-2 items-end h-14 pt-1">
            {[
              { val: "11.4k", h: "65%" },
              { val: "12.2k", h: "72%" },
              { val: "13.1k", h: "80%" },
              { val: "13.8k", h: "85%" },
              { val: "14.0k", h: "92%" },
              { val: "14.2k", h: "98%", active: true },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className={`w-full rounded-t transition-[height,background-color] duration-300 ease-out ${
                    bar.active ? "bg-success" : "bg-brand/40"
                  }`}
                  style={{ height: bar.h }}
                ></div>
                <span className={`text-[9px] font-mono tabular-nums ${bar.active ? "text-success font-bold" : "text-muted-foreground"}`}>
                  {bar.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Personal Records (PR) Milestone Cards */}
      <div className="flex flex-col space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {currentAthlete.name} — Verified Benchmark Milestones ({currentAthlete.squad || "General Cohort"})
          </span>
          <span className="text-xs font-mono text-brand">All sets video-verified by coach</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-success/20 text-success flex items-center justify-center font-bold text-xs font-mono tabular-nums" aria-hidden="true">
                SQ
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">166.0&nbsp;kg (Est)</div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">142.5&nbsp;kg × 5&nbsp;reps</div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-success font-semibold">Today ★</span>
          </div>

          <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-brand/20 text-brand flex items-center justify-center font-bold text-xs font-mono tabular-nums" aria-hidden="true">
                BP
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">115.0&nbsp;kg</div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">Top Single @ RPE 9.0</div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Feb 28</span>
          </div>

          <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-secondary text-foreground flex items-center justify-center font-bold text-xs font-mono tabular-nums" aria-hidden="true">
                DL
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">205.0&nbsp;kg</div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">Conventional 1RM</div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Jan 19</span>
          </div>
        </div>
      </div>
    </section>
  );
}
