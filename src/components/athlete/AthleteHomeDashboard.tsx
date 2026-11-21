"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { CoachBuddyCard } from "@/components/athlete/CoachBuddyCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Weight,
  TrendingUp,
  Activity,
  HeartPulse,
  Edit3,
  Calendar,
  ArrowRight,
  MessageSquare,
  Plus
} from "lucide-react";
import { WorkoutLoggerModal } from "@/components/athlete/WorkoutLoggerModal";
import { animateNumber } from "@/lib/animations";

interface AthleteHomeDashboardProps {
  onGoToTraining: () => void;
  onOpenMessages?: () => void;
}

export function AthleteHomeDashboard({ onGoToTraining, onOpenMessages }: AthleteHomeDashboardProps) {
  const { state, currentUser, updateAthleteProfile } = useAuth();

  // Find active athlete
  const athlete = state.athletes.find(a => a.id === currentUser.id) || state.athletes.find(a => a.id === "usr-athlete-1") || state.athletes[0];
  const session = state.activeSession;
  const program = state.programs.find(p => p.id === session.programId) || state.programs[0];

  // Measurement edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [tempWeight, setTempWeight] = useState<number>(athlete.weightKg || 83.5);
  const [tempHeight, setTempHeight] = useState<number>(athlete.heightCm || 178);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const weightKg = athlete.weightKg || 83.5;
  const weightLbs = Math.round(weightKg * 2.20462);
  const adherence = athlete.adherencePercentage || 94;
  const streak = athlete.currentStreakDays || 5;
  const totalWorkouts = athlete.totalWorkoutsCompleted || 24;
  const readiness = athlete.readinessScore || 9;

  // Animation refs
  const weightRef = useRef<HTMLSpanElement | null>(null);
  const adherenceRef = useRef<HTMLSpanElement | null>(null);
  const streakRef = useRef<HTMLSpanElement | null>(null);
  const readinessRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    animateNumber(weightRef.current, weightKg, { duration: 0.75, decimals: 1 });
    animateNumber(adherenceRef.current, adherence, { duration: 0.8 });
    animateNumber(streakRef.current, streak, { duration: 0.7 });
    animateNumber(readinessRef.current, readiness, { duration: 0.65 });
  }, [weightKg, adherence, streak, readiness]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAthleteProfile(athlete.id, {
      weightKg: tempWeight,
      heightCm: tempHeight,
      age: athlete.age
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditOpen(false);
    }, 800);
  };

  return (
    <div className="space-y-5">
      {/* SECTION A: Compact Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={athlete.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                alt={athlete.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-brand/50 shadow-xs"
              />
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card"
                title="Active Status"
                aria-label="Active Status"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {athlete.name}
                </h2>
                <Badge variant="outline" className="text-[11px] font-medium border-brand/30 text-brand bg-brand/5 px-2 py-0">
                  {athlete.experienceLevel || "Intermediate Lifter"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coach: <span className="font-medium text-foreground">{athlete.assignedCoachName || "Sarah Jenkins, CSCS"}</span>
                {athlete.squad && (
                  <span className="hidden sm:inline"> • Squad: <span className="font-medium text-foreground">{athlete.squad}</span></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="text-xs h-9 px-3 gap-1.5 rounded-xl border-border hover:bg-secondary cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Update body measurements"
            >
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Measurements</span>
            </Button>

            {onOpenMessages && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOpenMessages}
                className="text-xs h-9 px-3 gap-1.5 rounded-xl hover:bg-secondary cursor-pointer min-h-[40px]"
                aria-label="Message coach"
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                <span>Coach</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: Athlete Overview (Real Statistics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Stat 1: Body Weight */}
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Body Weight</span>
            <Weight className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1">
            <span ref={weightRef} className="text-2xl font-extrabold text-foreground tabular-nums">
              {weightKg}
            </span>
            <span className="text-xs text-muted-foreground font-medium">kg</span>
          </div>
          <span className="text-[11px] text-muted-foreground/80 mt-0.5">
            approx. {weightLbs} lbs
          </span>
        </div>

        {/* Stat 2: Training Consistency */}
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Consistency</span>
            <TrendingUp className="w-4 h-4 text-brand" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1">
            <span ref={adherenceRef} className="text-2xl font-extrabold text-foreground tabular-nums">
              {adherence}
            </span>
            <span className="text-xs text-muted-foreground font-medium">%</span>
          </div>
          <span className="text-[11px] text-muted-foreground/80 mt-0.5">
            Target Adherence
          </span>
        </div>

        {/* Stat 3: Weekly Activity & Streak */}
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Streak</span>
            <Activity className="w-4 h-4 text-amber-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1">
            <span ref={streakRef} className="text-2xl font-extrabold text-foreground tabular-nums">
              {streak}
            </span>
            <span className="text-xs text-muted-foreground font-medium">days</span>
          </div>
          <span className="text-[11px] text-muted-foreground/80 mt-0.5">
            {totalWorkouts} sessions total
          </span>
        </div>

        {/* Stat 4: Readiness & Status */}
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Energy & Status</span>
            <HeartPulse className="w-4 h-4 text-rose-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1">
            <span ref={readinessRef} className="text-2xl font-extrabold text-foreground tabular-nums">
              {readiness}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            Ready to Train
          </span>
        </div>
      </div>

      {/* SECTION C: Coach Buddy (Compact Home Mode with "Go to Training") */}
      <CoachBuddyCard mode="home" onGoToTraining={onGoToTraining} />

      {/* SECTION D: Quick Overview (Weekly Program Focus) */}
      <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand" /> Training Focus & Goals
            </span>
            <span className="text-xs text-brand font-medium">
              {athlete.recentPrCount || 3} Recent PRs 🏆
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground font-mono">
                {program.title}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {session.dayName}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Goal: <span className="text-foreground font-medium">{athlete.trainingGoal}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLoggerOpen(true)}
                className="text-xs font-semibold h-10 px-3.5 rounded-xl cursor-pointer shadow-xs min-h-[44px] shrink-0 border-border hover:bg-secondary flex items-center gap-1.5"
                aria-label="Quick log workout set"
              >
                <Plus className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                <span>Quick Log</span>
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={onGoToTraining}
                className="text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer shadow-xs min-h-[44px] shrink-0 flex-1 sm:flex-initial"
              >
                <span>Open Workout</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Update Body Measurements</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Keep your current weight and measurements synchronized with your coach.
          </DialogDescription>
        </DialogHeader>

        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="weight-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Body Weight (kg)</span>
                <span className="font-mono text-foreground">{Math.round(tempWeight * 2.20462)} lbs</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempWeight(w => Math.max(30, Math.round((w - 0.5) * 10) / 10))}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                >
                  -0.5
                </Button>
                <Input
                  id="weight-input"
                  type="number"
                  step="0.1"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(parseFloat(e.target.value) || 0)}
                  className="text-center font-bold text-xl h-11 bg-card"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempWeight(w => Math.round((w + 0.5) * 10) / 10)}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                >
                  +0.5
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="height-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Height (cm)
              </label>
              <Input
                id="height-input"
                type="number"
                value={tempHeight}
                onChange={(e) => setTempHeight(parseInt(e.target.value) || 0)}
                className="text-center font-bold text-xl h-11 bg-card"
              />
            </div>

            <DialogFooter className="pt-3">
              <div className="flex items-center justify-end gap-2 w-full">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(false)} className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" className="h-10 text-xs font-semibold px-5">
                  {savedSuccess ? "Saved!" : "Save Measurements"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accessible Quick Workout Logger Modal */}
      <WorkoutLoggerModal open={loggerOpen} onOpenChange={setLoggerOpen} />
    </div>
  );
}
