"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { calculateEstimated1RM } from "@/lib/utils";
import { Trophy, TrendingUp, Flame, CheckCircle, Calendar } from "lucide-react";

export function AthleteProgressView() {
  const { state } = useAuth();
  const athlete = state.athletes[0]; // Alex Chen

  const personalRecords = [
    { exercise: "Barbell Back Squat", weight: 142.5, reps: 5, date: "2026-10-26", est1Rm: 166.2 },
    { exercise: "Barbell Bench Press", weight: 105.0, reps: 6, date: "2026-10-24", est1Rm: 125.9 },
    { exercise: "Conventional Deadlift", weight: 185.0, reps: 3, date: "2026-10-20", est1Rm: 203.4 },
    { exercise: "Overhead Press", weight: 67.5, reps: 5, date: "2026-10-18", est1Rm: 78.7 },
    { exercise: "Weighted Pull-Up", weight: 20.0, reps: 5, date: "2026-10-15", est1Rm: 23.3 }
  ];

  // Squat Progress Data points for the SVG trend chart
  const squatHistory = [
    { date: "Oct 05", weight: 130 },
    { date: "Oct 12", weight: 135 },
    { date: "Oct 19", weight: 137.5 },
    { date: "Oct 26", weight: 142.5 }
  ];

  const minWeight = 125;
  const maxWeight = 150;

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
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">
                {athlete.recentPrCount} Records
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
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">
                {athlete.adherencePercentage}%
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
              <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">
                {athlete.currentStreakDays} Days
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strength Progression Chart (Barbell Back Squat) */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Barbell Back Squat Progression</CardTitle>
              <CardDescription>
                Top set working load across current 4-week training block
              </CardDescription>
            </div>
            <Badge variant="brand" className="font-mono text-xs">
              +12.5 kg Overload
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border)" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border)" strokeDasharray="3 3" />

              {/* Y-axis labels */}
              <text x="32" y="24" textAnchor="end" fontSize="10" fill="var(--muted-foreground)">150kg</text>
              <text x="32" y="74" textAnchor="end" fontSize="10" fill="var(--muted-foreground)">137.5kg</text>
              <text x="32" y="124" textAnchor="end" fontSize="10" fill="var(--muted-foreground)">125kg</text>

              {/* Line & Fill area */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6477B8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6477B8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Path coordinates:
                  Oct 05 (130kg): x=70, y=105
                  Oct 12 (135kg): x=190, y=85
                  Oct 19 (137.5kg): x=310, y=70
                  Oct 26 (142.5kg): x=430, y=45
              */}
              <polygon
                points="70,105 190,85 310,70 430,45 430,135 70,135"
                fill="url(#chartGrad)"
              />
              <polyline
                fill="none"
                stroke="#6477B8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="70,105 190,85 310,70 430,45"
              />

              {/* Dots */}
              {squatHistory.map((item, i) => {
                const xs = [70, 190, 310, 430];
                const ys = [105, 85, 70, 45];
                return (
                  <g key={item.date}>
                    <circle cx={xs[i]} cy={ys[i]} r="5" fill="#FFFFFF" stroke="#6477B8" strokeWidth="3" />
                    <text x={xs[i]} y={ys[i] - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--foreground)">
                      {item.weight}kg
                    </text>
                    <text x={xs[i]} y="150" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                      {item.date}
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
        <CardHeader>
          <CardTitle>Verified Personal Records</CardTitle>
          <CardDescription>
            Official personal bests calculated from authenticated workout sets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Best Performed</TableHead>
                <TableHead>Estimated 1RM</TableHead>
                <TableHead>Date Achieved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personalRecords.map((pr) => (
                <TableRow key={pr.exercise}>
                  <TableCell className="font-semibold text-foreground">
                    {pr.exercise}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
