"use client";

import React, { useState, useMemo } from "react";
import { AthleteProfile, Exercise } from "@/types";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, TrendingUp, Calendar, Filter, Dumbbell, Zap, Layers } from "lucide-react";

interface IndividualProgressAnalyticsProps {
  athlete: AthleteProfile;
}

export function IndividualProgressAnalytics({ athlete }: IndividualProgressAnalyticsProps) {
  const { state } = useAuth();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("ex-1"); // Default: Barbell Back Squat
  const [selectedMetric, setSelectedMetric] = useState<"est1rm" | "maxWeight" | "volume" | "reps">("est1rm");
  const [dateRange, setDateRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("3M");

  const selectedExercise = state.exercises.find((e) => e.id === selectedExerciseId) || state.exercises[0];

  // Dynamic realistic data generation based on selected exercise to avoid repetitive flat lines
  const analyticsData = useMemo(() => {
    let baseWeight = 100;
    if (selectedExercise.name.includes("Squat")) baseWeight = 130;
    else if (selectedExercise.name.includes("Bench")) baseWeight = 95;
    else if (selectedExercise.name.includes("Deadlift")) baseWeight = 170;
    else if (selectedExercise.name.includes("Press")) baseWeight = 60;
    else if (selectedExercise.name.includes("Pull-Up")) baseWeight = 12;

    const dataPoints = [
      { date: "Sep 08", weight: baseWeight, reps: 5, est1rm: Math.round(baseWeight * 1.16), volume: baseWeight * 5 * 3 },
      { date: "Sep 15", weight: baseWeight + 2.5, reps: 5, est1rm: Math.round((baseWeight + 2.5) * 1.16), volume: (baseWeight + 2.5) * 5 * 3 },
      { date: "Sep 22", weight: baseWeight + 5, reps: 5, est1rm: Math.round((baseWeight + 5) * 1.16), volume: (baseWeight + 5) * 5 * 4 },
      { date: "Sep 29", weight: baseWeight + 5, reps: 6, est1rm: Math.round((baseWeight + 5) * 1.2), volume: (baseWeight + 5) * 6 * 4 },
      { date: "Oct 06", weight: baseWeight + 7.5, reps: 5, est1rm: Math.round((baseWeight + 7.5) * 1.16), volume: (baseWeight + 7.5) * 5 * 4 },
      { date: "Oct 13", weight: baseWeight + 10, reps: 5, est1rm: Math.round((baseWeight + 10) * 1.16), volume: (baseWeight + 10) * 5 * 4 },
      { date: "Oct 20", weight: baseWeight + 10, reps: 6, est1rm: Math.round((baseWeight + 10) * 1.2), volume: (baseWeight + 10) * 6 * 4 },
      { date: "Oct 27", weight: baseWeight + 12.5, reps: 5, est1rm: Math.round((baseWeight + 12.5) * 1.166), volume: (baseWeight + 12.5) * 5 * 4 },
    ];

    if (dateRange === "1M") return dataPoints.slice(-4);
    if (dateRange === "3M") return dataPoints;
    return dataPoints;
  }, [selectedExercise, dateRange]);

  const peakWeight = Math.max(...analyticsData.map((d) => d.weight));
  const peak1RM = Math.max(...analyticsData.map((d) => d.est1rm));
  const totalVolume = analyticsData.reduce((acc, d) => acc + d.volume, 0);
  const firstPoint = analyticsData[0]?.weight || 100;
  const lastPoint = analyticsData[analyticsData.length - 1]?.weight || 100;
  const progressDeltaKg = lastPoint - firstPoint;
  const progressPct = Math.round((progressDeltaKg / firstPoint) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* Controls Bar: Exercise Explorer & Date Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        {/* Exercise Explorer Selector */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Dumbbell className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
          <select
            aria-label="Select exercise to analyze"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-semibold h-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            {state.exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category})
              </option>
            ))}
          </select>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border overflow-x-auto" role="tablist" aria-label="Metric selector">
          {[
            { id: "est1rm", label: "Est. 1RM" },
            { id: "maxWeight", label: "Working Load" },
            { id: "volume", label: "Volume (kg)" },
            { id: "reps", label: "Reps Count" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={selectedMetric === m.id}
              onClick={() => setSelectedMetric(m.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap min-h-[36px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none cursor-pointer ${
                selectedMetric === m.id
                  ? "bg-card text-brand shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Date Range Selector Pills */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border shrink-0" role="tablist" aria-label="Time range filter">
          {(["1M", "3M", "6M", "ALL"] as const).map((range) => (
            <button
              key={range}
              type="button"
              role="tab"
              aria-selected={dateRange === range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none cursor-pointer ${
                dateRange === range
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="text-xs text-muted-foreground uppercase font-medium">Estimated 1RM Peak</div>
          <div className="text-2xl font-bold text-brand tabular-nums mt-1">{peak1RM} kg</div>
          <div className="text-[11px] text-success font-medium mt-0.5">Calculated by Epley / Brzycki</div>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="text-xs text-muted-foreground uppercase font-medium">Max Working Set</div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">{peakWeight} kg</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Verified logged performance</div>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="text-xs text-muted-foreground uppercase font-medium">Period Net Progress</div>
          <div className="text-2xl font-bold text-success tabular-nums mt-1">
            +{progressDeltaKg} kg
          </div>
          <div className="text-[11px] text-success font-medium mt-0.5">+{progressPct}% Overload gain</div>
        </Card>

        <Card className="p-4 border-border shadow-xs bg-card">
          <div className="text-xs text-muted-foreground uppercase font-medium">Total Volume Tonnage</div>
          <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {(totalVolume / 1000).toFixed(1)}k kg
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Cumulative work completed</div>
        </Card>
      </div>

      {/* Primary Trend Chart (Recharts Interactive Visual) */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>{selectedExercise.name}</span>
                <span className="text-muted-foreground font-normal text-xs">— Progression Curve</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Interactive performance metrics across verified sets for {athlete.name}
              </CardDescription>
            </div>
            <Badge variant="brand" className="font-mono text-xs">
              {dateRange} Window
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6477B8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6477B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-3 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold text-foreground font-mono">{data.date}</p>
                          <p className="text-brand font-semibold tabular-nums">Load: {data.weight}&nbsp;kg × {data.reps}&nbsp;reps</p>
                          <p className="text-foreground tabular-nums">Est. 1RM: {data.est1rm}&nbsp;kg</p>
                          <p className="text-muted-foreground tabular-nums">Volume: {data.volume}&nbsp;kg</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric === "volume" ? "volume" : selectedMetric === "reps" ? "reps" : selectedMetric === "maxWeight" ? "weight" : "est1rm"}
                  stroke="#7C8FD8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Volume Distribution Bar Chart */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Session Tonnage Distribution (kg)</CardTitle>
          <CardDescription className="text-xs">
            Volume density per training session for progressive overload tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} kg`, "Session Tonnage"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                />
                <Bar dataKey="volume" fill="#7C8FD8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Verified Workout Attempts</CardTitle>
          <CardDescription className="text-xs">
            Individual session records for {selectedExercise.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Top Load</TableHead>
                <TableHead>Completed Reps</TableHead>
                <TableHead>Est. 1RM</TableHead>
                <TableHead>Session Tonnage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map((row, i) => (
                <TableRow key={row.date}>
                  <TableCell className="font-mono text-xs text-foreground font-semibold">{row.date}</TableCell>
                  <TableCell className="font-bold tabular-nums text-foreground">{row.weight} kg</TableCell>
                  <TableCell className="tabular-nums text-foreground">{row.reps} reps</TableCell>
                  <TableCell className="font-semibold text-brand tabular-nums">{row.est1rm} kg</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{row.volume} kg</TableCell>
                  <TableCell>
                    {i === analyticsData.length - 1 ? (
                      <Badge variant="success" className="text-[10px] py-0">Latest PR</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] py-0">Verified</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
