"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trophy, TrendingUp, Flame, CheckCircle, Dumbbell } from "lucide-react";
import gsap from "gsap";
import { animateNumber, animateSvgPath, animateStagger, isReducedMotion } from "@/lib/animations";

interface HistoryPoint {
  date: string;
  weight: number;
  reps: number;
  est1rm: number;
}

const EXERCISE_HISTORIES: Record<string, { "1M": HistoryPoint[]; "3M": HistoryPoint[] }> = {
  "Barbell Back Squat": {
    "1M": [
      { date: "Oct 05", weight: 130.0, reps: 5, est1rm: 151.6 },
      { date: "Oct 12", weight: 135.0, reps: 5, est1rm: 157.5 },
      { date: "Oct 19", weight: 137.5, reps: 5, est1rm: 160.4 },
      { date: "Oct 26", weight: 142.5, reps: 5, est1rm: 166.2 }
    ],
    "3M": [
      { date: "Sep 07", weight: 122.5, reps: 5, est1rm: 142.9 },
      { date: "Sep 14", weight: 125.0, reps: 5, est1rm: 145.8 },
      { date: "Sep 21", weight: 127.5, reps: 5, est1rm: 148.7 },
      { date: "Sep 28", weight: 130.0, reps: 5, est1rm: 151.6 },
      { date: "Oct 05", weight: 130.0, reps: 5, est1rm: 151.6 },
      { date: "Oct 12", weight: 135.0, reps: 5, est1rm: 157.5 },
      { date: "Oct 19", weight: 137.5, reps: 5, est1rm: 160.4 },
      { date: "Oct 26", weight: 142.5, reps: 5, est1rm: 166.2 }
    ]
  },
  "Barbell Bench Press": {
    "1M": [
      { date: "Oct 03", weight: 97.5, reps: 6, est1rm: 116.9 },
      { date: "Oct 10", weight: 100.0, reps: 6, est1rm: 119.9 },
      { date: "Oct 17", weight: 102.5, reps: 6, est1rm: 122.9 },
      { date: "Oct 24", weight: 105.0, reps: 6, est1rm: 125.9 }
    ],
    "3M": [
      { date: "Sep 05", weight: 90.0, reps: 6, est1rm: 107.9 },
      { date: "Sep 12", weight: 92.5, reps: 6, est1rm: 110.9 },
      { date: "Sep 19", weight: 95.0, reps: 6, est1rm: 113.9 },
      { date: "Sep 26", weight: 97.5, reps: 6, est1rm: 116.9 },
      { date: "Oct 03", weight: 97.5, reps: 6, est1rm: 116.9 },
      { date: "Oct 10", weight: 100.0, reps: 6, est1rm: 119.9 },
      { date: "Oct 17", weight: 102.5, reps: 6, est1rm: 122.9 },
      { date: "Oct 24", weight: 105.0, reps: 6, est1rm: 125.9 }
    ]
  },
  "Conventional Deadlift": {
    "1M": [
      { date: "Oct 01", weight: 170.0, reps: 3, est1rm: 186.9 },
      { date: "Oct 08", weight: 175.0, reps: 3, est1rm: 192.4 },
      { date: "Oct 15", weight: 180.0, reps: 3, est1rm: 197.9 },
      { date: "Oct 20", weight: 185.0, reps: 3, est1rm: 203.4 }
    ],
    "3M": [
      { date: "Sep 03", weight: 160.0, reps: 3, est1rm: 175.9 },
      { date: "Sep 10", weight: 162.5, reps: 3, est1rm: 178.6 },
      { date: "Sep 17", weight: 167.5, reps: 3, est1rm: 184.1 },
      { date: "Sep 24", weight: 170.0, reps: 3, est1rm: 186.9 },
      { date: "Oct 01", weight: 170.0, reps: 3, est1rm: 186.9 },
      { date: "Oct 08", weight: 175.0, reps: 3, est1rm: 192.4 },
      { date: "Oct 15", weight: 180.0, reps: 3, est1rm: 197.9 },
      { date: "Oct 20", weight: 185.0, reps: 3, est1rm: 203.4 }
    ]
  },
  "Overhead Press": {
    "1M": [
      { date: "Oct 02", weight: 60.0, reps: 5, est1rm: 70.0 },
      { date: "Oct 09", weight: 62.5, reps: 5, est1rm: 72.9 },
      { date: "Oct 14", weight: 65.0, reps: 5, est1rm: 75.8 },
      { date: "Oct 18", weight: 67.5, reps: 5, est1rm: 78.7 }
    ],
    "3M": [
      { date: "Sep 04", weight: 55.0, reps: 5, est1rm: 64.1 },
      { date: "Sep 11", weight: 57.5, reps: 5, est1rm: 67.0 },
      { date: "Sep 18", weight: 57.5, reps: 5, est1rm: 67.0 },
      { date: "Sep 25", weight: 60.0, reps: 5, est1rm: 70.0 },
      { date: "Oct 02", weight: 60.0, reps: 5, est1rm: 70.0 },
      { date: "Oct 09", weight: 62.5, reps: 5, est1rm: 72.9 },
      { date: "Oct 14", weight: 65.0, reps: 5, est1rm: 75.8 },
      { date: "Oct 18", weight: 67.5, reps: 5, est1rm: 78.7 }
    ]
  },
  "Weighted Pull-Up": {
    "1M": [
      { date: "Sep 28", weight: 10.0, reps: 5, est1rm: 11.6 },
      { date: "Oct 05", weight: 12.5, reps: 5, est1rm: 14.6 },
      { date: "Oct 11", weight: 15.0, reps: 5, est1rm: 17.5 },
      { date: "Oct 15", weight: 20.0, reps: 5, est1rm: 23.3 }
    ],
    "3M": [
      { date: "Sep 02", weight: 5.0, reps: 5, est1rm: 5.8 },
      { date: "Sep 09", weight: 7.5, reps: 5, est1rm: 8.7 },
      { date: "Sep 16", weight: 7.5, reps: 5, est1rm: 8.7 },
      { date: "Sep 23", weight: 10.0, reps: 5, est1rm: 11.6 },
      { date: "Sep 28", weight: 10.0, reps: 5, est1rm: 11.6 },
      { date: "Oct 05", weight: 12.5, reps: 5, est1rm: 14.6 },
      { date: "Oct 11", weight: 15.0, reps: 5, est1rm: 17.5 },
      { date: "Oct 15", weight: 20.0, reps: 5, est1rm: 23.3 }
    ]
  }
};

function generateBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function AthleteProgressView() {
  const { state } = useAuth();
  const athlete = state.athletes[0]; // Alex Chen

  const personalRecords = useMemo(
    () => [
      { exercise: "Barbell Back Squat", weight: 142.5, reps: 5, date: "2026-10-26", est1Rm: 166.2 },
      { exercise: "Barbell Bench Press", weight: 105.0, reps: 6, date: "2026-10-24", est1Rm: 125.9 },
      { exercise: "Conventional Deadlift", weight: 185.0, reps: 3, date: "2026-10-20", est1Rm: 203.4 },
      { exercise: "Overhead Press", weight: 67.5, reps: 5, date: "2026-10-18", est1Rm: 78.7 },
      { exercise: "Weighted Pull-Up", weight: 20.0, reps: 5, date: "2026-10-15", est1Rm: 23.3 }
    ],
    []
  );

  const [selectedExercise, setSelectedExercise] = useState<string>("Barbell Back Squat");
  const [timeRange, setTimeRange] = useState<"1M" | "3M">("1M");
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Animation Refs
  const pathRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPolygonElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const overloadNumRef = useRef<HTMLSpanElement | null>(null);
  const prCountRef = useRef<HTMLDivElement | null>(null);
  const adherenceRef = useRef<HTMLDivElement | null>(null);
  const streakRef = useRef<HTMLDivElement | null>(null);

  // Top metric counters GSAP entrance
  useEffect(() => {
    animateNumber(prCountRef.current, athlete.recentPrCount, { duration: 0.8 });
    animateNumber(adherenceRef.current, athlete.adherencePercentage, { duration: 0.9 });
    animateNumber(streakRef.current, athlete.currentStreakDays, { duration: 0.7 });
  }, [athlete]);

  // Compute active dataset
  const historyData = useMemo(() => {
    const exerciseHistory = EXERCISE_HISTORIES[selectedExercise] || EXERCISE_HISTORIES["Barbell Back Squat"];
    return exerciseHistory[timeRange] || exerciseHistory["1M"];
  }, [selectedExercise, timeRange]);

  const { minWeight, maxWeight, overloadDelta, overloadPct, coordinates, pathD, areaPoints } = useMemo(() => {
    const weights = historyData.map((d) => d.weight);
    const rawMin = Math.min(...weights);
    const rawMax = Math.max(...weights);
    const range = rawMax - rawMin || 10;
    const pad = Math.max(range * 0.25, 2.5);

    const min = Math.max(0, Math.floor((rawMin - pad) / 2.5) * 2.5);
    const max = Math.ceil((rawMax + pad) / 2.5) * 2.5;

    const width = 500;
    const height = 160;
    const leftPad = 48;
    const rightPad = 24;
    const topPad = 24;
    const bottomPad = 32;

    const plotWidth = width - leftPad - rightPad;
    const plotHeight = height - topPad - bottomPad;

    const coords = historyData.map((d, i) => {
      const x = historyData.length === 1 ? width / 2 : leftPad + (i / (historyData.length - 1)) * plotWidth;
      const normalizedY = (d.weight - min) / (max - min || 1);
      const y = topPad + plotHeight - normalizedY * plotHeight;
      return { x, y, data: d };
    });

    const bezier = generateBezierPath(coords);

    // Area polygon points: from bottom-left to each point, down to bottom-right
    const area = [
      `${coords[0]?.x || leftPad},${topPad + plotHeight}`,
      ...coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`),
      `${coords[coords.length - 1]?.x || width - rightPad},${topPad + plotHeight}`
    ].join(" ");

    const first = historyData[0]?.weight || 0;
    const last = historyData[historyData.length - 1]?.weight || 0;
    const delta = Math.round((last - first) * 10) / 10;
    const pct = first > 0 ? Math.round((delta / first) * 1000) / 10 : 0;

    return {
      minWeight: min,
      maxWeight: max,
      overloadDelta: delta,
      overloadPct: pct,
      coordinates: coords,
      pathD: bezier,
      areaPoints: area
    };
  }, [historyData]);

  // GSAP animation triggered on exercise or timeRange change
  useEffect(() => {
    if (isReducedMotion()) return;

    // 1. Draw SVG Path
    if (pathRef.current) {
      animateSvgPath(pathRef.current, { duration: 0.85, ease: "power2.out" });
    }

    // 2. Fade in area polygon
    if (areaRef.current) {
      gsap.fromTo(areaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.out" });
    }

    // 3. Staggered scale on data dots
    if (chartContainerRef.current) {
      const dots = chartContainerRef.current.querySelectorAll(".athlete-chart-dot");
      animateStagger(dots, { scale: 0, opacity: 0, stagger: 0.05, duration: 0.45, ease: "back.out(1.8)" });
    }

    // 4. Tween the overload badge number
    if (overloadNumRef.current) {
      animateNumber(overloadNumRef.current, overloadDelta, {
        duration: 0.65,
        decimals: 1,
        prefix: overloadDelta >= 0 ? "+" : ""
      });
    }
  }, [selectedExercise, timeRange, pathD, overloadDelta]);

  const activePoint = activePointIndex !== null ? coordinates[activePointIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent All-Time PRs
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5 flex items-baseline gap-1">
                <span ref={prCountRef}>{athlete.recentPrCount}</span>
                <span className="text-sm font-normal text-muted-foreground">Records</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10 text-success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Workout Adherence
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5 flex items-baseline gap-0.5">
                <span ref={adherenceRef}>{athlete.adherencePercentage}</span>
                <span>%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current Training Streak
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5 flex items-baseline gap-1">
                <span ref={streakRef}>{athlete.currentStreakDays}</span>
                <span className="text-sm font-normal text-muted-foreground">Days</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strength Progression Chart */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-brand" />
                <CardTitle className="text-base font-bold">{selectedExercise} Progression</CardTitle>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Top set working load across verified {timeRange === "1M" ? "4-week" : "12-week"} training history
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Exercise Selector Pills for Quick Switching */}
              <select
                aria-label="Select exercise progression"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="text-xs font-semibold bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground h-8 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                {personalRecords.map((pr) => (
                  <option key={pr.exercise} value={pr.exercise}>
                    {pr.exercise}
                  </option>
                ))}
              </select>

              {/* Time Range Filter */}
              <div className="flex items-center bg-secondary p-0.5 rounded-lg border border-border text-xs" role="tablist">
                {(["1M", "3M"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    aria-selected={timeRange === r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all min-h-[28px] cursor-pointer ${
                      timeRange === r
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Overload Delta Badge */}
              <Badge variant="brand" className="font-mono text-xs tabular-nums whitespace-nowrap">
                <span ref={overloadNumRef}>+{overloadDelta.toFixed(1)}</span>
                &nbsp;kg Overload
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Active Hover Telemetry Bar */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40 mb-2 font-mono">
            <span className="text-muted-foreground">
              {activePoint ? (
                <>
                  <span className="text-foreground font-bold">{activePoint.data.date}</span>:{" "}
                  <span className="text-brand font-bold">{activePoint.data.weight} kg</span> × {activePoint.data.reps} reps (Est. 1RM:{" "}
                  <span className="text-foreground font-semibold">{activePoint.data.est1rm} kg</span>)
                </>
              ) : (
                "Hover or tap any data dot to inspect session load & calculated 1RM"
              )}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Peak: <strong className="text-foreground">{Math.max(...historyData.map((d) => d.weight))} kg</strong> (+{overloadPct}%)
            </span>
          </div>

          <div ref={chartContainerRef} className="h-56 w-full pt-2 relative">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="athleteChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6477B8" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#6477B8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="48" y1="24" x2="476" y2="24" stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
              <line x1="48" y1="76" x2="476" y2="76" stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
              <line x1="48" y1="128" x2="476" y2="128" stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />

              {/* Y-axis labels */}
              <text x="40" y="27" textAnchor="end" fontSize="10" fill="var(--muted-foreground)" fontFamily="monospace">
                {maxWeight}kg
              </text>
              <text x="40" y="79" textAnchor="end" fontSize="10" fill="var(--muted-foreground)" fontFamily="monospace">
                {((maxWeight + minWeight) / 2).toFixed(0)}kg
              </text>
              <text x="40" y="131" textAnchor="end" fontSize="10" fill="var(--muted-foreground)" fontFamily="monospace">
                {minWeight}kg
              </text>

              {/* Polygon Area Fill */}
              <polygon ref={areaRef} points={areaPoints} fill="url(#athleteChartGrad)" />

              {/* Smooth Bezier Path */}
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="#6477B8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {coordinates.map((item, i) => {
                const isSelected = activePointIndex === i;
                const isLatest = i === coordinates.length - 1;
                return (
                  <g
                    key={`${item.data.date}-${item.data.weight}`}
                    className="athlete-chart-dot cursor-pointer"
                    onMouseEnter={() => setActivePointIndex(i)}
                    onMouseLeave={() => setActivePointIndex(null)}
                    onClick={() => setActivePointIndex(i)}
                  >
                    {/* Invisible hit target for easy tapping on mobile */}
                    <circle cx={item.x} cy={item.y} r="18" fill="transparent" />

                    {/* Outer glow ring for latest point or hovered point */}
                    {(isSelected || isLatest) && (
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r="9"
                        fill="none"
                        stroke="#6477B8"
                        strokeWidth="2"
                        opacity={isSelected ? 0.9 : 0.4}
                      />
                    )}

                    {/* Core Point Dot */}
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r={isSelected ? "6" : "5"}
                      fill="#FFFFFF"
                      stroke="#6477B8"
                      strokeWidth="3"
                    />

                    {/* Weight Label on Top */}
                    <text
                      x={item.x}
                      y={item.y - 10}
                      textAnchor="middle"
                      fontSize={isSelected ? "12" : "11"}
                      fontWeight="bold"
                      fill="var(--foreground)"
                      fontFamily="monospace"
                    >
                      {item.data.weight}kg
                    </text>

                    {/* Date Label on Bottom */}
                    <text
                      x={item.x}
                      y="150"
                      textAnchor="middle"
                      fontSize="10"
                      fill={isSelected ? "var(--foreground)" : "var(--muted-foreground)"}
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {item.data.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Personal Records Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verified Personal Records</CardTitle>
              <CardDescription>
                Tap any exercise row below to load its progressive overload curve
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              5 Tracked Movements
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Best Performed</TableHead>
                <TableHead>Estimated 1RM</TableHead>
                <TableHead>Date Achieved</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personalRecords.map((pr) => {
                const isActive = selectedExercise === pr.exercise;
                return (
                  <TableRow
                    key={pr.exercise}
                    onClick={() => setSelectedExercise(pr.exercise)}
                    className={`cursor-pointer transition-colors ${
                      isActive ? "bg-brand/10 hover:bg-brand/15 border-l-4 border-l-brand" : "hover:bg-muted/50"
                    }`}
                  >
                    <TableCell className="font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${isActive ? "text-brand" : "text-muted-foreground"}`} />
                      <span>{pr.exercise}</span>
                      {isActive && (
                        <Badge variant="brand" className="text-[10px] py-0 ml-1">
                          Viewing Chart
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-bold tabular-nums text-brand">
                      {pr.weight} kg × {pr.reps} reps
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-foreground">
                      ~{pr.est1Rm} kg
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {pr.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExercise(pr.exercise);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? "bg-brand text-brand-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isActive ? "Selected" : "View Trend"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
