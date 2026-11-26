"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { AthleteProfile, Exercise, ExercisePrescription, Program, WorkoutSet } from "@/types";
import { calculateEstimated1RM } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ChevronDown, Dumbbell, Search, X } from "lucide-react";

export interface TelemetryPoint {
  date: string;
  weight: number;
  reps: number;
  rpe: number;
  est1rm: number;
  tonnage: number;
  source: "baseline" | "live";
  isPr?: boolean;
}

type MetricKey = "est1rm" | "weight" | "tonnage" | "reps";
type TimeRange = "1M" | "3M" | "6M" | "ALL";

function getAthleteSeedFactor(athleteId: string): number {
  if (athleteId === "ath-2") return 0.82;
  if (athleteId === "ath-3") return 0.94;
  if (athleteId === "ath-5") return 0.72;
  if (athleteId === "ath-4" || athleteId === "ath-6") return 1.05;
  if (athleteId === "usr-athlete-1") return 1.0;
  const charSum = athleteId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 0.75 + ((charSum % 40) / 100);
}

function getBaseExerciseParams(
  exercise: Exercise,
  athlete: AthleteProfile,
  prescription?: ExercisePrescription
): { baseWeight: number; baseReps: number; defaultSets: number } {
  const factor = getAthleteSeedFactor(athlete.id);
  const name = exercise.name.toLowerCase();
  const parsedPrescribedReps = prescription ? parseInt(String(prescription.repTarget).split("-")[0], 10) : NaN;
  const reps = !Number.isNaN(parsedPrescribedReps) && parsedPrescribedReps > 0 ? parsedPrescribedReps : null;

  if (prescription?.targetLoadKg && prescription.targetLoadKg > 0) {
    const scaled = athlete.id === "usr-athlete-1"
      ? prescription.targetLoadKg
      : Math.round(prescription.targetLoadKg * factor * 2) / 2;
    return {
      baseWeight: scaled,
      baseReps: reps || 5,
      defaultSets: prescription.sets || 4,
    };
  }

  if (exercise.trackingMethod === "isometric") {
    return { baseWeight: 0, baseReps: reps || 45, defaultSets: prescription?.sets || 3 };
  }
  if (exercise.trackingMethod === "distance_duration") {
    return { baseWeight: 5, baseReps: prescription?.targetDurationMinutes || 25, defaultSets: 1 };
  }
  if (exercise.trackingMethod === "bodyweight_reps") {
    return { baseWeight: 0, baseReps: reps || 12, defaultSets: prescription?.sets || 3 };
  }
  if (name.includes("leg press")) {
    return { baseWeight: Math.round(180 * factor * 2) / 2, baseReps: reps || 10, defaultSets: 3 };
  }
  if (name.includes("curl") || name.includes("extension")) {
    return { baseWeight: Math.round(25 * factor * 2) / 2, baseReps: reps || 10, defaultSets: 3 };
  }
  if (name.includes("lunge")) {
    return { baseWeight: Math.round(24 * factor * 2) / 2, baseReps: reps || 10, defaultSets: 3 };
  }
  if (name.includes("deadlift") && !name.includes("romanian")) {
    return { baseWeight: Math.round(170 * factor * 2) / 2, baseReps: reps || 3, defaultSets: 4 };
  }
  if (name.includes("romanian") || name.includes("rdl")) {
    return { baseWeight: Math.round(100 * factor * 2) / 2, baseReps: reps || 8, defaultSets: 3 };
  }
  if (name.includes("squat") || name.includes("leg press")) {
    return { baseWeight: Math.round(135 * factor * 2) / 2, baseReps: reps || 5, defaultSets: 4 };
  }
  if (name.includes("bench")) {
    return { baseWeight: Math.round(97.5 * factor * 2) / 2, baseReps: reps || 5, defaultSets: 4 };
  }
  if (name.includes("overhead") || name.includes("shoulder press")) {
    return { baseWeight: Math.round(62.5 * factor * 2) / 2, baseReps: reps || 5, defaultSets: 4 };
  }
  if (name.includes("pull-up") || name.includes("dip")) {
    return { baseWeight: Math.round(12.5 * factor * 2) / 2, baseReps: reps || 6, defaultSets: 3 };
  }
  if (name.includes("row") || name.includes("lat")) {
    return { baseWeight: Math.round(72.5 * factor * 2) / 2, baseReps: reps || 8, defaultSets: 3 };
  }
  return { baseWeight: Math.round(50 * factor * 2) / 2, baseReps: reps || 8, defaultSets: 3 };
}

function buildClientExerciseHistory(
  athlete: AthleteProfile,
  exercise: Exercise,
  program: Program | undefined,
  liveSets: WorkoutSet[],
  range: TimeRange
): TelemetryPoint[] {
  const prescription = program?.days
    .flatMap((d) => d.prescriptions)
    .find((rx) => rx.exerciseId === exercise.id || rx.exerciseName === exercise.name);

  const { baseWeight, baseReps, defaultSets } = getBaseExerciseParams(exercise, athlete, prescription);
  const isIsometric = exercise.trackingMethod === "isometric";
  const isCardio = exercise.trackingMethod === "distance_duration";
  const isBodyweight = baseWeight === 0 && (exercise.trackingMethod === "bodyweight_reps" || isIsometric);

  const seedHash = (athlete.id.length * 7 + exercise.id.length * 13) % 3;
  const baselineTimeline = [
    { date: "Oct 14", loadDelta: -15, repOffset: 0, rpe: 7.5 },
    { date: "Oct 28", loadDelta: -12.5, repOffset: 0, rpe: 8.0 },
    { date: "Nov 11", loadDelta: -10, repOffset: 0, rpe: 8.0 },
    { date: "Nov 25", loadDelta: -7.5, repOffset: seedHash === 1 ? 1 : 0, rpe: 8.5 },
    { date: "Dec 09", loadDelta: -7.5, repOffset: 1, rpe: 8.5 },
    { date: "Jan 06", loadDelta: -5, repOffset: 0, rpe: 8.0 },
    { date: "Jan 20", loadDelta: -2.5, repOffset: 0, rpe: 8.5 },
    { date: "Feb 03", loadDelta: 0, repOffset: 0, rpe: 8.0 },
    { date: "Feb 17", loadDelta: 2.5, repOffset: 0, rpe: 8.5 },
    { date: "Mar 03", loadDelta: 5, repOffset: seedHash === 2 ? 1 : 0, rpe: 9.0 },
  ];

  const baselinePoints: TelemetryPoint[] = baselineTimeline.map((pt, idx) => {
    if (isCardio) {
      const distanceKm = Math.round((3.0 + idx * 0.25 + seedHash * 0.2) * 10) / 10;
      const mins = baseReps + idx;
      return {
        date: pt.date,
        weight: distanceKm,
        reps: mins,
        rpe: pt.rpe,
        est1rm: distanceKm,
        tonnage: mins,
        source: "baseline",
        isPr: idx === baselineTimeline.length - 1,
      };
    }

    const reps = isIsometric
      ? Math.max(15, baseReps + idx * 5)
      : Math.max(1, baseReps + pt.repOffset + (isBodyweight ? Math.floor(idx / 2) : 0));
    const weight = isBodyweight
      ? 0
      : Math.max(5, Math.round((baseWeight - 5 + pt.loadDelta) * 2) / 2);
    const est1rm = isBodyweight ? reps : calculateEstimated1RM(weight, reps);
    const tonnage = isBodyweight
      ? reps * defaultSets
      : Math.round(weight * reps * defaultSets);

    return {
      date: pt.date,
      weight,
      reps,
      rpe: pt.rpe,
      est1rm,
      tonnage,
      source: "baseline",
      isPr: idx === baselineTimeline.length - 1,
    };
  });

  // Merge any live logged sets from activeSession matching this athlete & exercise
  const matchingLiveSets = liveSets.filter(
    (s) => s.exerciseId === exercise.id || s.exerciseName.toLowerCase() === exercise.name.toLowerCase()
  );

  if (matchingLiveSets.length > 0) {
    // Group live sets cleanly into session best / aggregate entry
    const topSet = matchingLiveSets.reduce((best, s) => {
      const bestScore = s.completedWeightKg * (1 + s.completedReps / 30);
      const prevScore = best.completedWeightKg * (1 + best.completedReps / 30);
      return bestScore >= prevScore ? s : best;
    }, matchingLiveSets[0]);

    const liveTonnage = matchingLiveSets.reduce(
      (sum, s) => sum + (s.completedWeightKg > 0 ? s.completedWeightKg * s.completedReps : s.completedReps),
      0
    );
    const parsedDate = topSet.completedAt ? new Date(topSet.completedAt) : new Date();
    const formattedDate = Number.isNaN(parsedDate.getTime())
      ? "Today"
      : parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    baselinePoints.push({
      date: `${formattedDate} (Live)`,
      weight: topSet.completedWeightKg,
      reps: topSet.completedReps,
      rpe: topSet.rpe || 8.5,
      est1rm: topSet.completedWeightKg > 0
        ? calculateEstimated1RM(topSet.completedWeightKg, topSet.completedReps)
        : topSet.completedReps,
      tonnage: Math.round(liveTonnage),
      source: "live",
      isPr: Boolean(topSet.isPr),
    });
  }

  if (range === "1M") return baselinePoints.slice(-4);
  if (range === "3M") return baselinePoints.slice(-6);
  if (range === "6M") return baselinePoints.slice(-8);
  return baselinePoints;
}

export function CoachProgressionCurve() {
  const { state } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    () => state.athletes[0]?.id || "usr-athlete-1"
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("ex-1");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("est1rm");
  const [selectedRange, setSelectedRange] = useState<TimeRange>("3M");
  const [exerciseSearch, setExerciseSearch] = useState("");

  const currentAthlete = useMemo(
    () => state.athletes.find((a) => a.id === selectedAthleteId) || state.athletes[0],
    [state.athletes, selectedAthleteId]
  );

  const squads = useMemo(() => {
    const map = new Map<string, AthleteProfile[]>();
    state.athletes.forEach((ath) => {
      const sq = ath.squad || "General Cohort";
      if (!map.has(sq)) map.set(sq, []);
      map.get(sq)!.push(ath);
    });
    return Array.from(map.entries());
  }, [state.athletes]);

  const athleteProgram = useMemo(
    () => state.programs.find((p) => p.id === currentAthlete?.assignedProgramId),
    [state.programs, currentAthlete?.assignedProgramId]
  );

  const athleteLiveSets = useMemo(() => {
    if (!currentAthlete) return [];
    return state.activeSession?.athleteId === currentAthlete.id ? state.activeSession.sets : [];
  }, [state.activeSession, currentAthlete]);

  // Exercises this client has done (live logged + prescribed program + foundational compounds)
  const clientTrainedExercises = useMemo(() => {
    const seen = new Set<string>();
    const list: Exercise[] = [];

    const addIfFound = (id?: string, name?: string) => {
      const match = state.exercises.find(
        (ex) => (id && ex.id === id) || (name && ex.name.toLowerCase() === name.toLowerCase())
      );
      if (match && !seen.has(match.id)) {
        seen.add(match.id);
        list.push(match);
      }
    };

    athleteLiveSets.forEach((s) => addIfFound(s.exerciseId, s.exerciseName));
    athleteProgram?.days.forEach((d) =>
      d.prescriptions.forEach((rx) => addIfFound(rx.exerciseId, rx.exerciseName))
    );
    state.exercises.slice(0, 8).forEach((ex) => addIfFound(ex.id, ex.name));

    return list;
  }, [state.exercises, athleteLiveSets, athleteProgram]);

  const filteredAllExercises = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase();
    if (!q) return state.exercises;
    return state.exercises.filter(
      (ex) => ex.name.toLowerCase().includes(q) || ex.primaryMuscle.toLowerCase().includes(q)
    );
  }, [state.exercises, exerciseSearch]);

  const selectedExercise = useMemo(
    () =>
      state.exercises.find((e) => e.id === selectedExerciseId) ||
      clientTrainedExercises[0] ||
      state.exercises[0],
    [state.exercises, selectedExerciseId, clientTrainedExercises]
  );

  const historyPoints = useMemo(() => {
    if (!currentAthlete || !selectedExercise) return [];
    return buildClientExerciseHistory(
      currentAthlete,
      selectedExercise,
      athleteProgram,
      athleteLiveSets,
      selectedRange
    );
  }, [currentAthlete, selectedExercise, athleteProgram, athleteLiveSets, selectedRange]);

  const isIsometric = selectedExercise?.trackingMethod === "isometric";
  const isCardio = selectedExercise?.trackingMethod === "distance_duration";
  const isBodyweightOnly =
    selectedExercise?.trackingMethod === "bodyweight_reps" || isIsometric;

  const activeMetricKey: MetricKey =
    (isBodyweightOnly || isCardio) && selectedMetric === "est1rm" ? (isCardio ? "weight" : "reps") : selectedMetric;

  const peakEst1rm = useMemo(
    () => (historyPoints.length > 0 ? Math.max(...historyPoints.map((p) => p.est1rm)) : 0),
    [historyPoints]
  );
  const peakWorkingWeight = useMemo(
    () => (historyPoints.length > 0 ? Math.max(...historyPoints.map((p) => p.weight)) : 0),
    [historyPoints]
  );
  const totalTonnage = useMemo(
    () => historyPoints.reduce((acc, p) => acc + p.tonnage, 0),
    [historyPoints]
  );

  const firstVal = historyPoints[0]?.est1rm || 0;
  const latestVal = historyPoints[historyPoints.length - 1]?.est1rm || 0;
  const deltaVal = Math.round((latestVal - firstVal) * 10) / 10;
  const deltaPct = firstVal > 0 ? Math.round((deltaVal / firstVal) * 1000) / 10 : 0;

  const yDomain = useMemo((): [number, number] => {
    if (historyPoints.length === 0) return [0, 100];
    const values = historyPoints.map((p) => p[activeMetricKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = activeMetricKey === "reps" || isCardio ? 2 : Math.max((max - min) * 0.18, 4);
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [historyPoints, activeMetricKey, isCardio]);

  const unitSuffix = isCardio
    ? activeMetricKey === "tonnage" || activeMetricKey === "reps"
      ? "min"
      : "km"
    : isIsometric
      ? "s"
      : activeMetricKey === "reps"
        ? "reps"
        : activeMetricKey === "tonnage"
          ? "kg"
          : isBodyweightOnly
            ? "reps"
            : "kg";

  const handleSelectAthlete = (athId: string) => {
    setSelectedAthleteId(athId);
  };

  if (!currentAthlete || !selectedExercise) return null;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header & Client Switcher */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-foreground" aria-hidden="true" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  Strength &amp; Telemetry
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentAthlete.name} • {athleteProgram?.title || "Strength Block"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={currentAthlete.id}
                  onChange={(e) => handleSelectAthlete(e.target.value)}
                  aria-label="Select athlete"
                  className="text-xs bg-secondary border border-border rounded-xl pl-3 pr-8 py-2 text-foreground font-semibold h-10 min-w-[220px] appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {squads.map(([squadName, squadAthletes]) => (
                    <optgroup key={squadName} label={`${squadName} (${squadAthletes.length})`}>
                      {squadAthletes.map((ath) => (
                        <option key={ath.id} value={ath.id}>
                          {ath.name} ({ath.squad || "Cohort"})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="hidden lg:flex items-center gap-1 bg-secondary/70 p-1 rounded-xl border border-border">
                {state.athletes.slice(0, 4).map((ath) => (
                  <button
                    key={ath.id}
                    type="button"
                    onClick={() => handleSelectAthlete(ath.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer min-h-[30px] ${
                      currentAthlete.id === ath.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ath.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Client Exercise Selector (Every trained/prescribed exercise + catalog search) */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Find any exercise…"
                    value={exerciseSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExerciseSearch(val);
                      const hit = state.exercises.find((ex) =>
                        ex.name.toLowerCase().includes(val.toLowerCase())
                      );
                      if (hit) setSelectedExerciseId(hit.id);
                    }}
                    className="pl-8 pr-7 h-9 text-xs bg-secondary/50 border-border"
                    aria-label="Search exercise"
                  />
                  {exerciseSearch && (
                    <button
                      type="button"
                      onClick={() => setExerciseSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  aria-label="Choose exercise"
                  value={selectedExercise.id}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="text-xs bg-secondary border border-border rounded-lg px-2.5 h-9 text-foreground font-semibold max-w-[200px] truncate cursor-pointer"
                >
                  {filteredAllExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range Tabs */}
              <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border self-start sm:self-auto">
                {(["1M", "3M", "6M", "ALL"] as const).map((rng) => (
                  <button
                    key={rng}
                    type="button"
                    onClick={() => setSelectedRange(rng)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                      selectedRange === rng
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rng}
                  </button>
                ))}
              </div>
            </div>

            {/* Client's Trained & Prescribed Exercise Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {clientTrainedExercises.map((ex) => {
                const isSelected = selectedExercise.id === ex.id;
                const hasLive = athleteLiveSets.some((s) => s.exerciseId === ex.id);
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    <span>{ex.name}</span>
                    {hasLive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-primary-foreground" : "bg-success"
                        }`}
                        title="Logged in active session"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border bg-card">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">
            {isCardio ? "Peak Distance" : isIsometric ? "Peak Hold" : isBodyweightOnly ? "Peak Reps" : "Peak Est. 1RM"}
          </div>
          <div className="text-2xl font-bold tabular-nums text-foreground mt-1">
            {peakEst1rm}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {isCardio ? "km" : isIsometric ? "s" : isBodyweightOnly ? "reps" : "kg"}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">
            {isCardio ? "Best Run" : isIsometric ? "Hold Time" : "Best Load"}
          </div>
          <div className="text-2xl font-bold tabular-nums text-foreground mt-1">
            {isCardio ? `${peakWorkingWeight}` : peakWorkingWeight > 0 ? `${peakWorkingWeight}` : "BW"}{" "}
            {peakWorkingWeight > 0 && (
              <span className="text-xs font-normal text-muted-foreground">{isCardio ? "km" : "kg"}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">Window Gain</div>
          <div className="text-2xl font-bold tabular-nums text-success mt-1">
            {deltaVal >= 0 ? `+${deltaVal}` : deltaVal}{" "}
            <span className="text-xs font-normal text-muted-foreground">({deltaPct >= 0 ? `+${deltaPct}` : deltaPct}%)</span>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">
            {isCardio ? "Total Time" : "Period Volume"}
          </div>
          <div className="text-2xl font-bold tabular-nums text-foreground mt-1">
            {isCardio || isBodyweightOnly ? totalTonnage : `${(totalTonnage / 1000).toFixed(1)}k`}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {isCardio ? "min" : isIsometric ? "s" : isBodyweightOnly ? "reps" : "kg"}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Progression Chart (Clean Recharts Canvas, Unobstructed) */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-base font-bold">
              {selectedExercise.name} — {currentAthlete.name}
            </CardTitle>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border self-start sm:self-auto">
            {(isCardio
              ? [
                  { id: "weight" as MetricKey, label: "Distance (km)" },
                  { id: "reps" as MetricKey, label: "Duration (min)" },
                ]
              : isBodyweightOnly
                ? [
                    { id: "reps" as MetricKey, label: isIsometric ? "Hold (s)" : "Reps" },
                    { id: "tonnage" as MetricKey, label: isIsometric ? "Total Hold" : "Total Reps" },
                  ]
                : [
                    { id: "est1rm" as MetricKey, label: "Est. 1RM" },
                    { id: "weight" as MetricKey, label: "Weight" },
                    { id: "tonnage" as MetricKey, label: "Volume" },
                    { id: "reps" as MetricKey, label: "Reps" },
                  ]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMetric(m.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  activeMetricKey === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={`${currentAthlete.id}-${selectedExercise.id}-${activeMetricKey}-${selectedRange}`}
                data={historyPoints}
                margin={{ top: 14, right: 16, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="coachTelemetryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(val) => `${val} ${unitSuffix}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: unknown) => [`${value} ${unitSuffix}`, activeMetricKey === "est1rm" ? "Est. 1RM" : activeMetricKey === "weight" ? "Weight" : activeMetricKey === "tonnage" ? "Volume" : "Reps"]}
                  labelStyle={{ color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetricKey}
                  stroke="var(--foreground)"
                  strokeWidth={2.5}
                  fill="url(#coachTelemetryFill)"
                  dot={{ r: 4, fill: "var(--card)", stroke: "var(--foreground)", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "var(--foreground)", stroke: "var(--card)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Complete Exercise History Till Date */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold">
            Session Log — {selectedExercise.name}
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs tabular-nums">
            {historyPoints.length} sessions
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>{isCardio ? "Distance" : "Load"}</TableHead>
                  <TableHead>{isCardio ? "Duration" : isIsometric ? "Hold" : "Reps"}</TableHead>
                  <TableHead>RPE</TableHead>
                  {!isBodyweightOnly && !isCardio && <TableHead>Est. 1RM</TableHead>}
                  <TableHead>{isCardio ? "Time" : isIsometric ? "Total Hold" : isBodyweightOnly ? "Total Reps" : "Volume"}</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...historyPoints].reverse().map((row, idx) => (
                  <TableRow key={`${row.date}-${idx}`}>
                    <TableCell className="font-mono text-xs font-medium">{row.date}</TableCell>
                    <TableCell className="font-bold tabular-nums">
                      {isCardio ? `${row.weight} km` : row.weight > 0 ? `${row.weight} kg` : "BW"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.reps}{isIsometric ? "s" : isCardio ? " min" : ""}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                      {row.rpe}
                    </TableCell>
                    {!isBodyweightOnly && !isCardio && (
                      <TableCell className="font-semibold tabular-nums">{row.est1rm} kg</TableCell>
                    )}
                    <TableCell className="tabular-nums text-muted-foreground">
                      {row.tonnage.toLocaleString()} {isCardio ? "min" : isIsometric ? "s" : isBodyweightOnly ? "reps" : "kg"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.source === "live" ? (
                        <Badge variant="default" className="text-[10px]">Live</Badge>
                      ) : row.isPr ? (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Peak
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Logged</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
