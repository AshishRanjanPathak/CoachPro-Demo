"use client";

import React, { useState } from "react";
import { triggerOptimizedConfetti } from "@/lib/performance";
import { soundController } from "@/lib/audio";
import { addCompanionXp } from "@/lib/companion";
import { X, Check } from "lucide-react";

const NUDGE_MESSAGES = [
  "Bonobo is stretching his arms. Ready for today?",
  "Remember to hydrate today. Small steps count!",
  "Rest day or workout day, you've got this.",
  "Bonobo says: keep your head high and your chin up!",
];

export function DailyNudgeCard() {
  const todayKey = `coachpro_nudge_${new Date().toISOString().slice(0, 10)}`;
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(todayKey) === "dismissed";
  });
  const [highFived, setHighFived] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(todayKey) === "high_fived";
  });

  if (dismissed) return null;

  const handleHighFive = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundController.playChime();
    const rect = e.currentTarget.getBoundingClientRect();

    // Trigger flying high-five particle
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("coachpro_fly_snack", {
          detail: { startX: rect.x + rect.width / 2, startY: rect.y, emoji: "✋" }
        })
      );
    }

    triggerOptimizedConfetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
    addCompanionXp(10, "Daily High Five");
    setHighFived(true);
    localStorage.setItem(todayKey, "high_fived");
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(todayKey, "dismissed");
  };

  // Pick a stable message based on today's day number
  const dayNumber = new Date().getDate();
  const message = NUDGE_MESSAGES[dayNumber % NUDGE_MESSAGES.length];

  return (
    <div className="relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base shrink-0 select-none">
          {highFived ? "🎉" : "🌅"}
        </span>
        <p className="text-muted-foreground truncate font-medium">
          {highFived ? "High five received! Have a focused session." : message}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!highFived ? (
          <button
            type="button"
            onClick={handleHighFive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-brand-foreground font-semibold text-xs hover:bg-brand-hover active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[var(--ease-out)] cursor-pointer min-h-[36px]"
          >
            <span>High Five ✋</span>
            <span className="font-mono text-[10px] opacity-85 tabular-nums">+10 XP</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px] px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
            <Check className="w-3.5 h-3.5" /> Checked in
          </span>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97]"
          aria-label="Dismiss note"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
