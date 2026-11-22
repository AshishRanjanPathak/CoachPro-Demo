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
      <DialogContent className="max-w-md bg-neutral-900 border-white/10 text-white rounded-3xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Reward Milestones</span>
            </DialogTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
              Level {currentLevel}
            </span>
          </div>
          <DialogDescription className="text-xs text-neutral-400">
            Log workouts and micro-wins to unlock gear automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Milestone Steps */}
        <div className="space-y-2.5 mt-3 max-h-[60vh] overflow-y-auto pr-1">
          {MILESTONES.map((m) => {
            const isUnlocked = currentLevel >= m.level;
            const isNext = currentLevel + 1 === m.level;

            return (
              <div
                key={m.level}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isNext
                    ? "border-amber-400/40 bg-amber-500/10 shadow-sm"
                    : isUnlocked
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-white/5 bg-black/30 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none shrink-0">{m.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white leading-tight">{m.title}</p>
                      <span className="text-[10px] text-neutral-400 font-medium font-mono uppercase">
                        {m.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{m.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Check className="h-3 w-3" /> Unlocked
                    </span>
                  ) : isNext ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                      <Sparkles className="h-3 w-3" /> Next Up
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500">
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
