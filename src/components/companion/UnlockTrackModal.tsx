"use client";

import React from "react";
import {
  EVOLUTION_STAGES,
  CompanionHeadwear,
  CompanionProp,
  EvolutionStageNumber,
  getEvolutionStage,
} from "@/lib/companion";
import { BonoboAvatar } from "./BonoboAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Lock, Sparkles, Trophy } from "lucide-react";

interface Milestone {
  level: number;
  title: string;
  type: "Form" | "Hat" | "Prop";
  icon: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  { level: 1, title: "Retro Headband", type: "Hat", icon: "🔴", desc: "Tied varsity band with flowing tails" },
  { level: 2, title: "Cozy Beanie", type: "Hat", icon: "🧶", desc: "Snug gym-to-street knit cap" },
  { level: 3, title: "Iron Ape + Iced Latte", type: "Form", icon: "🥤", desc: "Stage 2 Evolution & oat latte prop" },
  { level: 4, title: "Power Scouter", type: "Hat", icon: "🟢", desc: "Classic green power-level visor" },
  { level: 5, title: "Super Bonobo + Crown", type: "Form", icon: "⚡", desc: "Stage 3 Golden Ki form & Crown" },
  { level: 7, title: "Apex Bonobo + Gold Banana", type: "Form", icon: "👑", desc: "Final Ultra Form & Golden Banana" },
];

interface UnlockTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: number;
  currentXp: number;
  xpToNext: number;
  equippedHeadwear: CompanionHeadwear;
  equippedProp: CompanionProp;
  activeForm?: EvolutionStageNumber | "auto";
  onSelectForm?: (form: EvolutionStageNumber | "auto") => void;
}

export function UnlockTrackModal({
  open,
  onOpenChange,
  currentLevel,
  equippedHeadwear,
  equippedProp,
  activeForm = "auto",
  onSelectForm,
}: UnlockTrackModalProps) {
  const highestStage = getEvolutionStage(currentLevel).stage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2 heading-tight">
              <Trophy className="h-4 w-4 text-warning" />
              <span>Evolutions &amp; Gear Track</span>
            </DialogTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-warning font-bold tabular-nums">
              Lv. {currentLevel}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Log workouts, feed bananas, and check in to evolve your Bonobo and unlock wearable gear.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 max-h-[68dvh] overflow-y-auto overscroll-contain pr-1">
          {/* 1. Pokémon / DBZ Evolution Stage Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Evolution Stages
              </h4>
              {onSelectForm && activeForm !== "auto" && (
                <button
                  type="button"
                  onClick={() => onSelectForm("auto")}
                  className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  Use Highest Form
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVOLUTION_STAGES.map((evo) => {
                const isUnlocked = highestStage >= evo.stage;
                const isDisplayed =
                  activeForm === "auto"
                    ? highestStage === evo.stage
                    : activeForm === evo.stage;

                return (
                  <button
                    key={evo.id}
                    type="button"
                    disabled={!isUnlocked || !onSelectForm}
                    onClick={() => isUnlocked && onSelectForm?.(evo.stage)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-[border-color,background-color,transform] duration-150 ${
                      isDisplayed
                        ? "border-brand bg-brand/10"
                        : isUnlocked
                        ? "border-border bg-secondary/40 hover:bg-secondary cursor-pointer active:scale-[0.98]"
                        : "border-border bg-secondary/20 opacity-75 cursor-default"
                    }`}
                  >
                    <BonoboAvatar
                      size={64}
                      stage={evo.stage}
                      mood={evo.stage >= 3 ? "pumped" : "happy"}
                      headwear={equippedHeadwear}
                      prop={equippedProp}
                      lockedSilhouette={!isUnlocked}
                    />
                    <span className="mt-1.5 text-[11px] font-bold text-foreground leading-tight">
                      {isUnlocked ? evo.name : "???"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5 tabular-nums">
                      {isDisplayed ? "Active Form" : isUnlocked ? `Stage ${evo.stage}` : `Lv. ${evo.minLevel}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Level-by-Level Gear Milestones */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Unlocks Roadmap
            </h4>
            {MILESTONES.map((m) => {
              const isUnlocked = currentLevel >= m.level;
              const isNext = currentLevel + 1 === m.level || (currentLevel < m.level && MILESTONES.find((x) => x.level > currentLevel)?.level === m.level);

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
                        <Sparkles className="h-3 w-3" /> Lv. {m.level}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                        <Lock className="h-3 w-3" /> Lv. {m.level}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
