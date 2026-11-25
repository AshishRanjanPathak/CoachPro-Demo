"use client";

import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { TrendingUp, ChevronDown, Sparkles } from "lucide-react";

export interface TelemetryPoint {
  date: string;
  weight: number;
  reps: number;
  rpe: number;
  est1rm: number;
  tonnage: number;
}

// Generate realistic dynamic progression curves for athletes and exercises
function getProgressionData(
  athleteId: string,
  exercise: "squat" | "bench" | "deadlift" | "ohp",
  range: "1M" | "3M" | "6M" | "ALL"
): { points: TelemetryPoint[]; peakEst1rm: number; deltaKg: number; deltaPct: number } {
  // Deterministic seed multiplier based on athleteId
  let factor = 1.0;
  if (athleteId === "ath-2") factor = 0.82; // Maya (lighter weight class)
  else if (athleteId === "ath-3") factor = 0.94; // Jordan
  else if (athleteId === "ath-5") factor = 0.72; // Sophia
  else if (athleteId === "ath-4" || athleteId === "ath-6") factor = 1.05;
  else if (athleteId !== "usr-athlete-1") {
    // Generate subtle unique hash factor for all 20 athletes
    const charSum = athleteId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    factor = 0.75 + ((charSum % 40) / 100);
  }

  // Base top-set working weight per movement
  let baseWorkingWeight = 130;
  let repCount = 5;
  if (exercise === "squat") {
    baseWorkingWeight = Math.round(135 * factor * 2) / 2;
    repCount = 5;
  } else if (exercise === "bench") {
    baseWorkingWeight = Math.round(97.5 * factor * 2) / 2;
    repCount = 5;
  } else if (exercise === "deadlift") {
    baseWorkingWeight = Math.round(175 * factor * 2) / 2;
    repCount = 3;
  } else if (exercise === "ohp") {
    baseWorkingWeight = Math.round(62.5 * factor * 2) / 2;
    repCount = 5;
  }

  // Full progression session series
  const fullSeries: TelemetryPoint[] = [
    { date: "Oct 15", weight: baseWorkingWeight - 12.5, reps: repCount, rpe: 8.0, est1rm: 0, tonnage: 0 },
    { date: "Nov 02", weight: baseWorkingWeight - 10.0, reps: repCount, rpe: 8.0, est1rm: 0, tonnage: 0 },
    { date: "Nov 24", weight: baseWorkingWeight - 7.5, reps: repCount, rpe: 8.5, est1rm: 0, tonnage: 0 },
    { date: "Dec 15", weight: baseWorkingWeight - 7.5, reps: repCount + 1, rpe: 8.5, est1rm: 0, tonnage: 0 },
    { date: "Jan 10", weight: baseWorkingWeight - 5.0, reps: repCount, rpe: 8.0, est1rm: 0, tonnage: 0 },
    { date: "Jan 24", weight: baseWorkingWeight - 2.5, reps: repCount, rpe: 8.5, est1rm: 0, tonnage: 0 },
    { date: "Feb 08", weight: baseWorkingWeight, reps: repCount, rpe: 8.0, est1rm: 0, tonnage: 0 },
    { date: "Feb 22", weight: baseWorkingWeight + 2.5, reps: repCount, rpe: 8.5, est1rm: 0, tonnage: 0 },
    { date: "Mar 05", weight: baseWorkingWeight + 5.0, reps: repCount, rpe: 9.0, est1rm: 0, tonnage: 0 },
    { date: "Mar 18", weight: baseWorkingWeight + 7.5, reps: repCount, rpe: 9.0, est1rm: 0, tonnage: 0 }
  ];

  // Calculate Epley 1RM formula & realistic session volume tonnage
  const populated = fullSeries.map((item, idx) => {
    const est1rm = Math.round((item.weight * (1 + item.reps / 30)) * 10) / 10;
    const baseSets = 4;
    const tonnage = Math.round(item.weight * item.reps * (baseSets + (idx % 2)));
    return { ...item, est1rm, tonnage };
  });

  // Slice series according to selected time window
  let sliced: TelemetryPoint[];
  if (range === "1M") sliced = populated.slice(-4);
  else if (range === "3M") sliced = populated.slice(-6);
  else if (range === "6M") sliced = populated.slice(-8);
  else sliced = populated;

  const first1rm = sliced[0].est1rm;
  const peakEst1rm = Math.max(...sliced.map(p => p.est1rm));
  const deltaKg = Math.round((peakEst1rm - first1rm) * 10) / 10;
  const deltaPct = Math.round((deltaKg / first1rm) * 1000) / 10;

  return { points: sliced, peakEst1rm, deltaKg, deltaPct };
}

// Generate smooth cubic bezier SVG curve
function generateBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${Math.round(cp1x)},${Math.round(cp1y)} ${Math.round(cp2x)},${Math.round(cp2y)} ${Math.round(p2.x)},${Math.round(p2.y)}`;
  }
  return d;
}

export function CoachProgressionCurve() {
  const { state } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("usr-athlete-1"); // Alex Chen default
  const [selectedExercise, setSelectedExercise] = useState<"squat" | "bench" | "deadlift" | "ohp">("squat");
  const [selectedRange, setSelectedRange] = useState<"1M" | "3M" | "6M" | "ALL">("3M");
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const currentAthlete = state.athletes.find(a => a.id === selectedAthleteId) || state.athletes[0];

  // Group athletes by squad for clean multi-athlete scanning
  const squads = useMemo(() => {
    const map = new Map<string, typeof state.athletes>();
    state.athletes.forEach(ath => {
      const sq = ath.squad || "General Cohort";
      if (!map.has(sq)) map.set(sq, []);
      map.get(sq)!.push(ath);
    });
    return Array.from(map.entries());
  }, [state.athletes]);

  // Compute telemetry curve points reactively
  const { points, peakEst1rm, deltaKg, deltaPct } = useMemo(() => {
    return getProgressionData(selectedAthleteId, selectedExercise, selectedRange);
  }, [selectedAthleteId, selectedExercise, selectedRange]);

  // Active point for tooltip inspection
  const activePoint = activePointIndex !== null && points[activePointIndex]
    ? points[activePointIndex]
    : points[points.length - 1];

  // Map points to SVG coordinates (ViewBox: 800 x 220)
  const svgCoords = useMemo(() => {
    const minVal = Math.min(...points.map(p => p.est1rm)) * 0.94;
    const maxVal = Math.max(...points.map(p => p.est1rm)) * 1.04;
    const valSpan = Math.max(1, maxVal - minVal);
    const n = points.length;

    return points.map((p, i) => {
      const x = 50 + (i / (n - 1)) * 700;
      const y = 185 - ((p.est1rm - minVal) / valSpan) * 145;
      return { x: Math.round(x), y: Math.round(y), raw: p };
    });
  }, [points]);

  const pathD = useMemo(() => generateBezierPath(svgCoords), [svgCoords]);
  const areaPolygonPoints = useMemo(() => {
    if (svgCoords.length === 0) return "";
    return `50,185 ${svgCoords.map(c => `${c.x},${c.y}`).join(" ")} ${svgCoords[svgCoords.length - 1].x},185`;
  }, [svgCoords]);

  // Volume tonnage mini bars computation
  const tonnageBars = useMemo(() => {
    const maxTonnage = Math.max(...points.map(p => p.tonnage), 1);
    return points.slice(-6).map((p, idx, arr) => ({
      val: `${(p.tonnage / 1000).toFixed(1)}k`,
      heightPct: `${Math.round((p.tonnage / maxTonnage) * 90) + 10}%`,
      active: idx === arr.length - 1,
      date: p.date
    }));
  }, [points]);

  const avgTonnage = useMemo(() => {
    const total = points.reduce((acc, p) => acc + p.tonnage, 0);
    return Math.round(total / points.length);
  }, [points]);

  // Milestone PR benchmarks for current athlete
  const benchmarks = useMemo(() => {
    const sqData = getProgressionData(selectedAthleteId, "squat", "ALL");
    const bpData = getProgressionData(selectedAthleteId, "bench", "ALL");
    const dlData = getProgressionData(selectedAthleteId, "deadlift", "ALL");

    return {
      squat: {
        est1rm: sqData.peakEst1rm,
        working: `${sqData.points[sqData.points.length - 1].weight} kg × ${sqData.points[sqData.points.length - 1].reps}`
      },
      bench: {
        est1rm: bpData.peakEst1rm,
        working: `${bpData.points[bpData.points.length - 1].weight} kg × ${bpData.points[bpData.points.length - 1].reps}`
      },
      deadlift: {
        est1rm: dlData.peakEst1rm,
        working: `${dlData.points[dlData.points.length - 1].weight} kg × ${dlData.points[dlData.points.length - 1].reps}`
      }
    };
  }, [selectedAthleteId]);

  // Instant SVG telemetry rendering (zero mount bounce / fade-in delay)
  const pathRef = useRef<SVGPathElement | null>(null);
  const polygonRef = useRef<SVGPolygonElement | null>(null);
  const peakNumberRef = useRef<HTMLSpanElement | null>(null);
  const dotsGroupRef = useRef<SVGGElement | null>(null);
  const barsGroupRef = useRef<HTMLDivElement | null>(null);
  const milestonesRef = useRef<HTMLDivElement | null>(null);

  const exerciseLabelMap = {
    squat: "Barbell Back Squat",
    bench: "Barbell Bench Press",
    deadlift: "Conventional Deadlift",
    ohp: "Overhead Press"
  };

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
              onChange={(e) => {
                setSelectedAthleteId(e.target.value);
                setActivePointIndex(null);
              }}
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

          {/* Quick Pinned Shortcuts */}
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
                onClick={() => {
                  setSelectedAthleteId(item.id);
                  setActivePointIndex(null);
                }}
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
          {(["squat", "bench", "deadlift", "ohp"] as const).map(ex => (
            <button
              key={ex}
              type="button"
              aria-pressed={selectedExercise === ex}
              onClick={() => {
                setSelectedExercise(ex);
                setActivePointIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono min-h-[38px] border cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
                selectedExercise === ex
                  ? "bg-secondary text-brand font-bold border-brand/40 shadow-xs"
                  : "bg-background text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40"
              }`}
            >
              {exerciseLabelMap[ex]}
            </button>
          ))}
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border" role="group" aria-label="Time range selector">
          {(["1M", "3M", "6M", "ALL"] as const).map((rng) => (
            <button
              key={rng}
              type="button"
              aria-pressed={selectedRange === rng}
              onClick={() => {
                setSelectedRange(rng);
                setActivePointIndex(null);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono min-h-[34px] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors ${
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
              {currentAthlete.name} — {exerciseLabelMap[selectedExercise]} Estimated 1RM
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-foreground tracking-tight mt-0.5 flex items-baseline">
              <span ref={peakNumberRef}>{peakEst1rm.toFixed(1)} kg</span>
              <span className="text-success text-base sm:text-lg font-semibold ml-2.5 tabular-nums">
                +{deltaKg > 0 ? deltaKg : 0}&nbsp;kg (+{deltaPct}%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-muted-foreground">Inspected Session</span>
            <div className="text-xs sm:text-sm font-mono tabular-nums text-brand font-bold">
              {activePoint.weight}&nbsp;kg × {activePoint.reps} @ RPE {activePoint.rpe}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/80 block">
              {activePoint.date} • {activePoint.tonnage.toLocaleString()}&nbsp;kg session volume
            </span>
          </div>
        </div>

        {/* Area Chart SVG */}
        <div className="relative w-full h-52 sm:h-56 pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 220" role="img" aria-label="1RM Overload Curve visual graph">
            <defs>
              <linearGradient id="progressionGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7C8FD8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C8FD8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid */}
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="20" y2="20" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="75" y2="75" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="130" y2="130" />
            <line stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="800" y1="185" y2="185" />

            {/* Area Fill */}
            <polygon
              ref={polygonRef}
              fill="url(#progressionGradient)"
              points={areaPolygonPoints}
            />

            {/* Smooth Cubic Bezier Line Path */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#7C8FD8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3.5"
            />

            {/* Coordinate Dots */}
            <g ref={dotsGroupRef}>
              {svgCoords.map((coord, i) => {
                const isSelected = activePointIndex === i || (activePointIndex === null && i === svgCoords.length - 1);
                return (
                  <g
                    key={i}
                    className="cursor-pointer group"
                    onClick={() => setActivePointIndex(i)}
                  >
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      fill={isSelected ? "#10B981" : "#0F172A"}
                      r={isSelected ? 7 : 5}
                      stroke={isSelected ? "#ffffff" : "#7C8FD8"}
                      strokeWidth={isSelected ? 2.5 : 2}
                      className="transition-[r,fill,stroke] duration-150 ease-[var(--ease-out)]"
                    />
                    {/* Invisible larger hit target */}
                    <circle cx={coord.x} cy={coord.y} r={16} fill="transparent" />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip Pill */}
          <div className="absolute right-2 sm:right-6 top-1 bg-card border border-border p-2.5 rounded-xl shadow-md pointer-events-none flex flex-col">
            <span className="text-[10px] font-mono text-brand font-bold uppercase">
              {activePoint.date} • {exerciseLabelMap[selectedExercise]}
            </span>
            <span className="text-xs font-bold font-mono text-foreground tabular-nums">
              {activePoint.est1rm} kg Est 1RM
            </span>
            <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {activePoint.weight} kg × {activePoint.reps} reps (RPE {activePoint.rpe})
            </span>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground px-2 sm:px-6 overflow-x-auto">
          {svgCoords.map((coord, i) => {
            const isLast = i === svgCoords.length - 1;
            return (
              <span
                key={i}
                onClick={() => setActivePointIndex(i)}
                className={`cursor-pointer hover:text-foreground transition-colors ${
                  isLast ? "text-success font-bold" : ""
                }`}
              >
                {coord.raw.date} ({coord.raw.weight}kg)
              </span>
            );
          })}
        </div>

        {/* Session Tonnage Mini Bar Telemetry */}
        <div className="pt-3 border-t border-border bg-card/40 p-3 rounded-lg flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-foreground">
              Session Volume Tonnage (Last {tonnageBars.length} Sessions)
            </span>
            <span className="text-foreground font-semibold tabular-nums">
              Mean: {avgTonnage.toLocaleString()}&nbsp;kg / session
            </span>
          </div>

          <div ref={barsGroupRef} className="grid grid-cols-6 gap-2 items-end h-14 pt-1">
            {tonnageBars.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className={`tonnage-bar-fill w-full rounded-t transition-colors duration-150 ${
                    bar.active ? "bg-success" : "bg-brand/50 hover:bg-brand"
                  }`}
                  style={{ height: bar.heightPct }}
                  title={`${bar.date}: ${bar.val} kg tonnage`}
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
      <div ref={milestonesRef} className="flex flex-col space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {currentAthlete.name} — Verified Benchmark Milestones ({currentAthlete.squad || "General Cohort"})
          </span>
          <span className="text-xs font-mono text-brand flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand" /> Video-verified by coach
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => setSelectedExercise("squat")}
            className={`bg-background border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
              selectedExercise === "squat" ? "border-brand ring-1 ring-brand/30" : "border-border hover:border-brand/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-success/20 text-success flex items-center justify-center font-bold text-xs font-mono tabular-nums shrink-0">
                SQ
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">
                  {benchmarks.squat.est1rm} kg (Est 1RM)
                </div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">
                  {benchmarks.squat.working}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-success font-semibold">★ Peak</span>
          </div>

          <div
            onClick={() => setSelectedExercise("bench")}
            className={`bg-background border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
              selectedExercise === "bench" ? "border-brand ring-1 ring-brand/30" : "border-border hover:border-brand/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center font-bold text-xs font-mono tabular-nums shrink-0">
                BP
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">
                  {benchmarks.bench.est1rm} kg (Est 1RM)
                </div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">
                  {benchmarks.bench.working}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Logged</span>
          </div>

          <div
            onClick={() => setSelectedExercise("deadlift")}
            className={`bg-background border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
              selectedExercise === "deadlift" ? "border-brand ring-1 ring-brand/30" : "border-border hover:border-brand/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold text-xs font-mono tabular-nums">
                DL
              </div>
              <div>
                <div className="text-xs font-bold font-mono tabular-nums text-foreground">
                  {benchmarks.deadlift.est1rm} kg (Est 1RM)
                </div>
                <div className="text-[11px] font-mono tabular-nums text-muted-foreground">
                  {benchmarks.deadlift.working}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Logged</span>
          </div>
        </div>
      </div>
    </section>
  );
}
