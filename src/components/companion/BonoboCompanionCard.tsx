"use client";

import React, { useState, useEffect } from "react";
import { triggerOptimizedConfetti } from "@/lib/performance";
import {
  CompanionState,
  loadCompanionState,
  saveCompanionState,
  feedBananaToCompanion,
  CompanionHeadwear,
  CompanionProp,
  CompanionTheme,
} from "@/lib/companion";
import { BonoboAvatar } from "./BonoboAvatar";
import { UnlockTrackModal } from "./UnlockTrackModal";
import { soundController } from "@/lib/audio";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Shirt,
  Palette,
  Check,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const COMPANION_QUOTES: Record<string, string[]> = {
  happy: [
    "Ready whenever you are! 🍌",
    "Did you remember to drink some water today?",
    "Every single set counts. Even small wins!",
    "Looking forward to today's session."
  ],
  focused: [
    "Form first, load second. Lock in! 🎯",
    "Eyes on the target, breathe into the brace.",
    "Let's make these reps look effortless.",
    "Coach prescribed it, we execute."
  ],
  caring: [
    "Listen to your body. Recovery is where you grow! 💚",
    "I flagged that for your coach to review.",
    "Rest hard today so you can lift heavy tomorrow.",
    "Ice, hydrate, and get some good sleep!"
  ],
  celebrating: [
    "NEW PERSONAL RECORD! Let's go! 🎉🍌",
    "Hard work pays off! That was incredible!",
    "You're getting stronger every single week!",
    "High fives all around! ✋"
  ],
  pumped: [
    "Let's get this pump! 🍌💪",
    "Coach wrote the prescription, we crush it!",
    "Light weight, baby! Feeling strong!",
    "I'm wearing my lucky headband today!"
  ],
  content: [
    "Ready whenever you are!",
    "Did you remember to drink some water today?",
    "Every single set counts. Even small wins!",
    "Looking forward to today's session."
  ],
  sleepy: [
    "Rest hard, recover harder. 🛌",
    "Muscles grow when you're sleeping!",
    "Quiet recovery day. Bonobo is recharging.",
    "Zzz... dreaming about protein shakes."
  ],
  hungry: [
    "Smells like workout time! Feed me a set! 🍌",
    "I'm eyeing that dumbbell in the corner...",
    "One quick set and I'll do a backflip!",
    "Ready for fuel!"
  ]
};

interface BonoboCompanionCardProps {
  onOpenAssistant?: () => void;
}

export function BonoboCompanionCard({ onOpenAssistant }: BonoboCompanionCardProps = {}) {
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [isEating, setIsEating] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [closetOpen, setClosetOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [muted, setMuted] = useState(() => soundController.getMuted());

  // Listen for companion updates and external feed events
  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<CompanionState>;
      if (custom.detail) setCompanion(custom.detail);
    };

    const handleFeedAnimation = (e: Event) => {
      const custom = e as CustomEvent<{ reason: string; amount: number; leveledUp: boolean; level: number }>;
      setIsEating(true);
      soundController.playChime();

      if (custom.detail?.leveledUp) {
        soundController.playLevelUp();
        triggerOptimizedConfetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.7 }
        });
      }

      setTimeout(() => setIsEating(false), 1600);
    };

    window.addEventListener("coachpro_bonobo_updated", handleUpdated);
    window.addEventListener("coachpro_bonobo_feed_animation", handleFeedAnimation);

    return () => {
      window.removeEventListener("coachpro_bonobo_updated", handleUpdated);
      window.removeEventListener("coachpro_bonobo_feed_animation", handleFeedAnimation);
    };
  }, []);

  const handleTapAvatar = () => {
    const quotes = COMPANION_QUOTES[companion.mood] || COMPANION_QUOTES.content;
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const handleFeedManualSnack = (e: React.MouseEvent<HTMLButtonElement>) => {
    if ((companion.bananaInventory || 0) <= 0) return;

    setIsEating(true);
    soundController.playChime();
    const rect = e.currentTarget.getBoundingClientRect();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("coachpro_fly_snack", {
          detail: { startX: rect.x + rect.width / 2, startY: rect.y, emoji: "🍌" }
        })
      );
    }
    const res = feedBananaToCompanion();
    if (res.success) {
      setCompanion(res.state);
    }
    setTimeout(() => setIsEating(false), 1400);
  };

  const toggleSound = () => {
    const next = soundController.toggleMute();
    setMuted(next);
  };

  const equipHeadwear = (item: CompanionHeadwear) => {
    const updated = { ...companion, equippedHeadwear: item };
    setCompanion(updated);
    saveCompanionState(updated);
    soundController.playPop();
  };

  const equipProp = (item: CompanionProp) => {
    const updated = { ...companion, equippedProp: item };
    setCompanion(updated);
    saveCompanionState(updated);
    soundController.playPop();
  };

  const selectTheme = (theme: CompanionTheme) => {
    const updated = { ...companion, theme };
    setCompanion(updated);
    saveCompanionState(updated);
    soundController.playPop();
  };

  const quotes = COMPANION_QUOTES[companion.mood] || COMPANION_QUOTES.content;
  const currentQuote = quotes[currentQuoteIndex % quotes.length];
  const xpPercent = Math.min(100, Math.round((companion.xp / companion.xpToNextLevel) * 100));

  // Minimalist theme styling using semantic card surfaces + subtle accent border
  const getThemeStyles = () => {
    switch (companion.theme) {
      case "jungle":
        return {
          cardBg: "border-l-2 border-l-success",
          accentColor: "text-success bg-success/10 border-success/25",
          barColor: "bg-success",
        };
      case "cyber":
        return {
          cardBg: "border-l-2 border-l-brand",
          accentColor: "text-brand bg-brand/10 border-brand/25",
          barColor: "bg-brand",
        };
      case "cafe":
        return {
          cardBg: "border-l-2 border-l-warning",
          accentColor: "text-warning bg-warning/10 border-warning/25",
          barColor: "bg-warning",
        };
      default:
        return {
          cardBg: "",
          accentColor: "text-brand bg-brand/10 border-brand/25",
          barColor: "bg-brand",
        };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${themeStyle.cardBg}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar with dynamic mood & accessory layers */}
        <div className="relative shrink-0 flex flex-col items-center">
          <BonoboAvatar
            size={96}
            mood={companion.mood}
            headwear={companion.equippedHeadwear}
            prop={companion.equippedProp}
            isEating={isEating}
            onClick={handleTapAvatar}
          />
          <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border border-border bg-secondary text-muted-foreground tabular-nums">
            <Sparkles className="h-3 w-3 text-warning" aria-hidden="true" />
            <span>Lv. {companion.level}</span>
          </span>
        </div>

        {/* Info & Interactivity Column */}
        <div className="flex-1 w-full text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0">
              <h3 className="text-base font-bold text-foreground heading-tight truncate">
                {companion.name}
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${themeStyle.accentColor}`}>
                {companion.mood === "pumped" ? "⚡ Pumped" : companion.mood === "sleepy" ? "🛌 Rested" : "🍌 Ready"}
              </span>
            </div>

            {/* Micro Controls (Audio, Closet, Theme) */}
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={muted ? "Unmute sounds" : "Mute sounds"}
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Toggle audio effects"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-success" />}
              </button>

              <button
                type="button"
                onClick={() => setClosetOpen(true)}
                title="Customize Outfits"
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Open cosmetic closet"
              >
                <Shirt className="h-4 w-4 text-warning" />
              </button>

              <button
                type="button"
                onClick={() => setThemeOpen(true)}
                title="Switch Theme Vibe"
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Switch aesthetic theme"
              >
                <Palette className="h-4 w-4 text-brand" />
              </button>
            </div>
          </div>

          {/* Speech Line (tap to cycle) */}
          <button
            type="button"
            onClick={handleTapAvatar}
            className="mt-2.5 w-full text-left rounded-xl bg-secondary/40 border border-border px-3.5 py-2 text-xs text-foreground hover:bg-secondary/70 transition-colors duration-150 cursor-pointer"
          >
            <p className="leading-snug font-medium">&ldquo;{currentQuote}&rdquo;</p>
          </button>

          {/* XP Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-mono text-muted-foreground tabular-nums text-[11px] flex items-center gap-1">
                <Zap className="h-3 w-3 text-warning" aria-hidden="true" />
                <span>{companion.xp} / {companion.xpToNextLevel} XP</span>
              </span>
              <button
                type="button"
                onClick={() => setTrackOpen(true)}
                className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                Rewards →
              </button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${themeStyle.barColor} transition-[width] duration-200 ease-[var(--ease-out)]`}
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Footer Action Row: Earned Banana Stash + Voice Copilot */}
          <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                🍌 {companion.bananaInventory || 0} stash
              </span>
              <button
                type="button"
                onClick={handleFeedManualSnack}
                disabled={isEating || (companion.bananaInventory || 0) <= 0}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-[transform,background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.97] min-h-[36px] ${
                  (companion.bananaInventory || 0) > 0
                    ? "bg-warning/15 border-warning/30 text-warning hover:bg-warning/20 cursor-pointer"
                    : "bg-secondary/40 border-border text-muted-foreground cursor-not-allowed opacity-60"
                }`}
                title={(companion.bananaInventory || 0) > 0 ? "Feed 1 earned banana to Bonobo" : "Complete workouts or daily check-ins to earn bananas"}
              >
                <span>{(companion.bananaInventory || 0) > 0 ? "Feed 1 🍌" : "0 Bananas"}</span>
              </button>
            </div>

            {onOpenAssistant && (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/25 text-brand text-xs font-semibold hover:bg-brand/15 transition-[transform,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.97] min-h-[36px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Talk to Bonobo AI</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CLOSET MODAL --- */}
      <Dialog open={closetOpen} onOpenChange={setClosetOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 heading-tight">
              <Shirt className="h-4 w-4 text-warning" />
              Bonobo&apos;s Closet &amp; Gear
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select headwear and handheld props unlocked by leveling up.
            </DialogDescription>
          </DialogHeader>

          {/* Live Closet Preview */}
          <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/30 py-3 px-4">
            <BonoboAvatar
              size={112}
              mood={companion.mood}
              headwear={companion.equippedHeadwear}
              prop={companion.equippedProp}
            />
            <span className="mt-2 text-[11px] font-mono text-muted-foreground">
              {companion.name} • Live Gear Preview
            </span>
          </div>

          {/* Headwear Selector */}
          <div className="space-y-2 mt-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Headwear
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "No Hat", levelReq: 1 },
                { id: "red_headband", label: "🔴 Retro Headband", levelReq: 1 },
                { id: "beanie", label: "🧶 Cozy Beanie", levelReq: 2 },
                { id: "gold_crown", label: "👑 Champion Crown", levelReq: 5 }
              ].map((item) => {
                const isUnlocked = companion.unlockedHeadwear.includes(item.id as CompanionHeadwear);
                const isEquipped = companion.equippedHeadwear === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => equipHeadwear(item.id as CompanionHeadwear)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
                      isEquipped
                        ? "border-brand bg-brand/10 text-foreground"
                        : isUnlocked
                        ? "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                        : "border-border bg-secondary/20 text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isEquipped ? (
                      <Check className="h-3.5 w-3.5 text-brand shrink-0" />
                    ) : !isUnlocked ? (
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">Lvl {item.levelReq}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Props Selector */}
          <div className="space-y-2 mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Handheld Items
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "Empty Hands", levelReq: 1 },
                { id: "banana", label: "🍌 Fresh Banana", levelReq: 1 },
                { id: "tiny_dumbbell", label: "🏋️ Mini Dumbbell", levelReq: 1 },
                { id: "iced_coffee", label: "🥤 Iced Latte", levelReq: 3 }
              ].map((item) => {
                const isUnlocked = companion.unlockedProps.includes(item.id as CompanionProp);
                const isEquipped = companion.equippedProp === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => equipProp(item.id as CompanionProp)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
                      isEquipped
                        ? "border-brand bg-brand/10 text-foreground"
                        : isUnlocked
                        ? "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                        : "border-border bg-secondary/20 text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isEquipped ? (
                      <Check className="h-3.5 w-3.5 text-brand shrink-0" />
                    ) : !isUnlocked ? (
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">Lvl {item.levelReq}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- THEME MODAL --- */}
      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 heading-tight">
              <Palette className="h-4 w-4 text-brand" />
              Accent Vibe
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose a subtle accent stripe and progress color for your companion card.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {[
              { id: "jungle", label: "🌿 Jungle", desc: "Clean emerald accent" },
              { id: "cyber", label: "⚡ Graphite", desc: "Crisp contrast accent" },
              { id: "cafe", label: "☕ Amber", desc: "Warm espresso amber" },
              { id: "obsidian", label: "◽ Classic", desc: "Minimal monochrome" }
            ].map((th) => {
              const isSelected = companion.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => selectTheme(th.id as CompanionTheme)}
                  className={`p-3 rounded-xl border text-left transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
                    isSelected
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{th.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{th.desc}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- REWARDS ROAD MODAL --- */}
      <UnlockTrackModal
        open={trackOpen}
        onOpenChange={setTrackOpen}
        currentLevel={companion.level}
        currentXp={companion.xp}
        xpToNext={companion.xpToNextLevel}
      />
    </div>
  );
}
