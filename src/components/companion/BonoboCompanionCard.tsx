"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CompanionState,
  loadCompanionState,
  saveCompanionState,
  addCompanionXp,
  CompanionHeadwear,
  CompanionProp,
  CompanionTheme,
} from "@/lib/companion";
import { BonoboAvatar } from "./BonoboAvatar";
import { soundController } from "@/lib/audio";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Shirt,
  Palette,
  Check,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const COMPANION_QUOTES = {
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

export function BonoboCompanionCard() {
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [isEating, setIsEating] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [closetOpen, setClosetOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
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
        confetti({
          particleCount: 50,
          spread: 60,
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

  const handleFeedManualSnack = () => {
    setIsEating(true);
    soundController.playChime();
    addCompanionXp(15, "Snack Reward");
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

  // Visual styling based on selected theme
  const getThemeStyles = () => {
    switch (companion.theme) {
      case "jungle":
        return {
          cardBg: "from-emerald-950/40 via-neutral-900/60 to-emerald-900/20 border-emerald-500/20",
          accentColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          barColor: "bg-emerald-500",
        };
      case "cyber":
        return {
          cardBg: "from-purple-950/40 via-neutral-900/60 to-cyan-900/20 border-purple-500/20",
          accentColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
          barColor: "bg-gradient-to-r from-purple-500 to-cyan-400",
        };
      case "cafe":
        return {
          cardBg: "from-amber-950/30 via-neutral-900/60 to-amber-900/20 border-amber-500/20",
          accentColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          barColor: "bg-amber-500",
        };
      default:
        return {
          cardBg: "from-neutral-900/60 via-neutral-900/40 to-neutral-800/20 border-white/10",
          accentColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          barColor: "bg-blue-500",
        };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${themeStyle.cardBg} p-5 md:p-6 backdrop-blur-2xl shadow-xl transition-colors duration-500`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar with dynamic mood & accessory layers */}
        <div className="relative shrink-0 flex flex-col items-center">
          <BonoboAvatar
            size={130}
            mood={companion.mood}
            headwear={companion.equippedHeadwear}
            prop={companion.equippedProp}
            isEating={isEating}
            onClick={handleTapAvatar}
          />
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-black/40 text-neutral-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Lvl {companion.level} Companion</span>
          </div>
        </div>

        {/* Info & Interactivity Column */}
        <div className="flex-1 w-full text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{companion.name} the Bonobo</span>
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${themeStyle.accentColor}`}>
                  {companion.mood === "pumped" ? "⚡ Pumped" : companion.mood === "sleepy" ? "🛌 Rested" : "🍌 Ready"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Feeds automatically on every completed workout set
              </p>
            </div>

            {/* Micro Controls (Audio, Closet, Theme) */}
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                title={muted ? "Unmute sounds" : "Mute sounds"}
                className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="Toggle audio effects"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setClosetOpen(true)}
                title="Customize Outfits"
                className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="Open cosmetic closet"
              >
                <Shirt className="h-4 w-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setThemeOpen(true)}
                title="Switch Theme Vibe"
                className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="Switch aesthetic theme"
              >
                <Palette className="h-4 w-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Speech Bubble */}
          <div
            onClick={handleTapAvatar}
            role="button"
            tabIndex={0}
            className="mt-3 relative inline-block w-full rounded-2xl bg-black/40 border border-white/5 px-4 py-2.5 text-sm text-neutral-200 cursor-pointer hover:bg-black/60 transition-colors"
          >
            <p className="leading-snug italic font-medium">
              &ldquo;{currentQuote}&rdquo;
            </p>
            <span className="text-[10px] text-neutral-500 font-sans block mt-1">
              Tap to talk to Bonobo • Fed {companion.snacksFedToday} snacks today
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                Growth Progress
              </span>
              <span className="font-mono text-neutral-300">
                {companion.xp} / {companion.xpToNextLevel} XP ({xpPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full ${themeStyle.barColor} transition-all duration-500`}
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Snack Feed Action */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-white/5">
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Need a micro-boost?
            </span>
            <button
              type="button"
              onClick={handleFeedManualSnack}
              disabled={isEating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span>🍌</span>
              <span>Feed Quick Snack (+15 XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- CLOSET MODAL --- */}
      <Dialog open={closetOpen} onOpenChange={setClosetOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-white/10 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Shirt className="h-5 w-5 text-amber-400" />
              Bonobo&apos;s Closet & Gear
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">
              Unlock new gear automatically as you log workouts and level up your companion!
            </DialogDescription>
          </DialogHeader>

          {/* Headwear Selector */}
          <div className="space-y-2 mt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
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
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isEquipped
                        ? "border-amber-400 bg-amber-500/20 text-white"
                        : isUnlocked
                        ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300"
                        : "border-white/5 bg-black/40 text-neutral-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isEquipped ? (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    ) : !isUnlocked ? (
                      <span className="text-[10px] text-neutral-500 font-mono">Lvl {item.levelReq}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Props Selector */}
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
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
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isEquipped
                        ? "border-amber-400 bg-amber-500/20 text-white"
                        : isUnlocked
                        ? "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300"
                        : "border-white/5 bg-black/40 text-neutral-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isEquipped ? (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    ) : !isUnlocked ? (
                      <span className="text-[10px] text-neutral-500 font-mono">Lvl {item.levelReq}</span>
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
        <DialogContent className="max-w-md bg-neutral-900 border-white/10 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Palette className="h-5 w-5 text-cyan-400" />
              Choose Your Theme Vibe
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">
              Personalize colors, voice, and atmosphere to make CoachPRO feel like home.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { id: "jungle", label: "🌿 Jungle Canopy", desc: "Emerald tones & playful tropical vibes" },
              { id: "cyber", label: "🚀 Cyber Neon", desc: "Synthwave purple & futuristic glows" },
              { id: "cafe", label: "☕ Cozy Café", desc: "Warm mocha, relaxing acoustic feel" },
              { id: "obsidian", label: "⚡ Classic Obsidian", desc: "Minimalist, sleek athletic carbon" }
            ].map((th) => {
              const isSelected = companion.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => selectTheme(th.id as CompanionTheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{th.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">{th.desc}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
