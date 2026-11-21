"use client";

import React, { useState } from "react";
import { useAuth } from "@/domains/auth/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Ruler,
  Weight,
  Calendar,
  Sparkles,
  MessageSquare,
  Edit3,
  HeartPulse,
  ShieldCheck,
  Check
} from "lucide-react";

interface AthleteProfileCardProps {
  onOpenMessages?: () => void;
}

export function AthleteProfileCard({ onOpenMessages }: AthleteProfileCardProps) {
  const { state, currentUser, updateAthleteProfile } = useAuth();

  // Find active athlete profile corresponding to current logged in user
  const athlete = state.athletes.find(a => a.id === currentUser.id) || state.athletes.find(a => a.id === "usr-athlete-1") || state.athletes[0];

  const [editOpen, setEditOpen] = useState(false);
  const [tempWeight, setTempWeight] = useState<number>(athlete.weightKg || 83.5);
  const [tempHeight, setTempHeight] = useState<number>(athlete.heightCm || 178);
  const [tempAge, setTempAge] = useState<number>(athlete.age || 26);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper conversions for imperial/metric convenience (helpful for older lifters)
  const heightInchesTotal = Math.round((athlete.heightCm || 178) / 2.54);
  const feet = Math.floor(heightInchesTotal / 12);
  const inches = heightInchesTotal % 12;
  const weightLbs = Math.round((athlete.weightKg || 83.5) * 2.20462);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAthleteProfile(athlete.id, {
      weightKg: tempWeight,
      heightCm: tempHeight,
      age: tempAge
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditOpen(false);
    }, 900);
  };

  return (
    <>
      <Card className="border-border bg-card shadow-xs overflow-hidden rounded-2xl">
        {/* Subtle top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand via-indigo-500 to-sky-400" />

        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Top Row: Athlete identity, friendly greeting, status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={athlete.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                  alt={athlete.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-brand/50 shadow-xs"
                />
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card"
                  title="Profile Active"
                  aria-label="Profile Active"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
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

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="text-xs h-9 px-3 gap-1.5 rounded-lg border-border hover:bg-secondary cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Edit Profile Measurements"
              >
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span>Measurements</span>
              </Button>

              {onOpenMessages && (
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={onOpenMessages}
                  className="text-xs h-9 px-3 gap-1.5 rounded-lg font-semibold cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label="Message Coach"
                >
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ask Coach</span>
                </Button>
              )}
            </div>
          </div>

          {/* Core Physical Metrics Grid (Age, Height, Weight, Energy) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1: Age */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-secondary/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Age</span>
                <Calendar className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                  {athlete.age || 26}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">years</span>
              </div>
              <span className="text-[10px] text-muted-foreground/80 mt-0.5">Active</span>
            </div>

            {/* Metric 2: Height */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-secondary/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Height</span>
                <Ruler className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                  {athlete.heightCm || 178}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">cm</span>
              </div>
              <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                {feet}′ {inches}″
              </span>
            </div>

            {/* Metric 3: Weight */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-secondary/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Weight</span>
                <Weight className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                  {athlete.weightKg || 83.5}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">kg</span>
              </div>
              <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                {weightLbs} lbs
              </span>
            </div>

            {/* Metric 4: Daily Energy / Readiness */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-secondary/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Energy</span>
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                  {athlete.readinessScore || 9}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">/ 10</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" /> Ready
              </span>
            </div>
          </div>

          {/* Friendly Guidance Strip for Beginners & Seniors */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
              <p className="text-xs text-foreground/90 leading-relaxed">
                <span className="font-semibold text-brand">Goal:</span> {athlete.trainingGoal || "Build strength while preserving joint health."}
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
              Streak: {athlete.currentStreakDays}d active 🔥
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Measurements Modal (Senior-friendly large buttons) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-brand/40 text-brand">Personal Metrics</Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Update Your Measurements</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Keep your weight and measurements current so your coach can accurately auto-regulate your weights.
          </DialogDescription>
        </DialogHeader>

        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Body Weight */}
            <div className="space-y-2">
              <label htmlFor="weight-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Body Weight (kg)</span>
                <span className="font-mono text-foreground font-normal">{Math.round(tempWeight * 2.20462)} lbs</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempWeight(w => Math.max(30, Math.round((w - 0.5) * 10) / 10))}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                  aria-label="Decrease weight by 0.5 kg"
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
                  aria-label="Weight in kilograms"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempWeight(w => Math.round((w + 0.5) * 10) / 10)}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                  aria-label="Increase weight by 0.5 kg"
                >
                  +0.5
                </Button>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label htmlFor="height-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Height (cm)</span>
                <span className="font-mono text-foreground font-normal">
                  {Math.floor(Math.round(tempHeight / 2.54) / 12)} ft {Math.round(tempHeight / 2.54) % 12} in
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempHeight(h => Math.max(100, h - 1))}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                  aria-label="Decrease height by 1 cm"
                >
                  -1
                </Button>
                <Input
                  id="height-input"
                  type="number"
                  step="1"
                  value={tempHeight}
                  onChange={(e) => setTempHeight(parseInt(e.target.value) || 0)}
                  className="text-center font-bold text-xl h-11 bg-card"
                  aria-label="Height in centimeters"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempHeight(h => h + 1)}
                  className="h-11 w-12 text-sm font-bold min-h-[44px]"
                  aria-label="Increase height by 1 cm"
                >
                  +1
                </Button>
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label htmlFor="age-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Age (years)
              </label>
              <Input
                id="age-input"
                type="number"
                min="10"
                max="110"
                value={tempAge}
                onChange={(e) => setTempAge(parseInt(e.target.value) || 0)}
                className="text-center font-bold text-xl h-11 bg-card"
                aria-label="Age in years"
              />
            </div>

            <DialogFooter className="pt-3">
              <div className="flex items-center justify-end gap-2 w-full">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(false)} className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" className="h-10 text-xs font-semibold px-5 gap-1.5">
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Saved!
                    </>
                  ) : (
                    "Save Measurements"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
