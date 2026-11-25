"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Lock, Sparkles, Trophy } from "lucide-react";

interface Milestone {
  level: number;
  title: string;
  type: "Hat" | "Prop" | "Theme";
  icon: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  { level: 1, title: "Retro Headband", type: "Hat", icon: "🔴", desc: "Classic 80s gym look" },
  { level: 2, title: "Cozy Beanie", type: "Hat", icon: "🧶", desc: "Warm knit style" },
  { level: 3, title: "Iced Latte", type: "Prop", icon: "🥤", desc: "Refreshing coffee fuel" },
  { level: 4, title: "Cyber Glow", type: "Theme", icon: "🚀", desc: "Neon synthwave vibe" },
  { level: 5, title: "Champion Crown", type: "Hat", icon: "👑", desc: "For milestone consistency" },
  { level: 7, title: "Golden Fruit Bowl", type: "Prop", icon: "🍉", desc: "Nutrition companion prop" },
];

interface UnlockTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: number;
  currentXp: number;
  xpToNext: number;
}

export function UnlockTrackModal({
  open,
  onOpenChange,
  currentLevel,
  currentXp,
  xpToNext,
}: UnlockTrackModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2 heading-tight">
              <Trophy className="h-4 w-4 text-warning" />
              <span>Reward Milestones</span>
            </DialogTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-warning font-bold tabular-nums">
              Level {currentLevel}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Log workouts and micro-wins to unlock gear automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Milestone Steps */}
        <div className="space-y-2 mt-3 max-h-[60dvh] overflow-y-auto overscroll-contain pr-1">
          {MILESTONES.map((m) => {
            const isUnlocked = currentLevel >= m.level;
            const isNext = currentLevel + 1 === m.level;

            return (
              <div
                key={m.level}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isNext
                    ? "border-warning/40 bg-warning/10"
                    : isUnlocked
                    ? "border-success/25 bg-success/5"
                    : "border-border bg-secondary/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl select-none shrink-0">{m.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground leading-tight truncate">{m.title}</p>
                      <span className="text-[10px] text-muted-foreground font-medium font-mono uppercase shrink-0">
                        {m.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{m.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right ml-2">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                      <Check className="h-3 w-3" /> Unlocked
                    </span>
                  ) : isNext ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning bg-warning/15 px-2 py-0.5 rounded-md border border-warning/30">
                      <Sparkles className="h-3 w-3" /> Next Up
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                      <Lock className="h-3 w-3" /> Lvl {m.level}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
