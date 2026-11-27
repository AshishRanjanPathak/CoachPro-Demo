"use client";

import React from "react";
import {
  EVOLUTION_STAGES,
  CompanionHeadwear,
  CompanionProp,
  EvolutionStageNumber,
  getEvolutionStage,
} from "@/lib/companion";
import { useLanguage } from "@/lib/i18n";
import { BonoboAvatar } from "./BonoboAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Lock, Sparkles, Trophy } from "lucide-react";

interface Milestone {
  level: number;
  titleEn: string;
  titleEs: string;
  typeEn: "Form" | "Hat" | "Prop";
  typeEs: "Forma" | "Gorro" | "Objeto";
  icon: string;
  descEn: string;
  descEs: string;
}

const MILESTONES: Milestone[] = [
  { level: 1, titleEn: "Retro Headband", titleEs: "Cinta Retro", typeEn: "Hat", typeEs: "Gorro", icon: "🔴", descEn: "Tied varsity band with flowing tails", descEs: "Cinta clásica con lazos al viento" },
  { level: 2, titleEn: "Cozy Beanie", titleEs: "Gorro Tejido", typeEn: "Hat", typeEs: "Gorro", icon: "🧶", descEn: "Snug gym-to-street knit cap", descEs: "Gorro cómodo del gym a la calle" },
  { level: 3, titleEn: "Iron Ape + Iced Latte", titleEs: "Mono de Hierro + Latte", typeEn: "Form", typeEs: "Forma", icon: "🥤", descEn: "Stage 2 Evolution & oat latte prop", descEs: "Evolución Fase 2 y café helado" },
  { level: 4, titleEn: "Power Scouter", titleEs: "Escáuter de Poder", typeEn: "Hat", typeEs: "Gorro", icon: "🟢", descEn: "Classic green power-level visor", descEs: "Visor clásico medidor de ki" },
  { level: 5, titleEn: "Super Bonobo + Crown", titleEs: "Súper Bonobo + Corona", typeEn: "Form", typeEs: "Forma", icon: "⚡", descEn: "Stage 3 Golden Ki form & Crown", descEs: "Fase 3 Ki Dorado y Corona" },
  { level: 7, titleEn: "Apex Bonobo + Gold Banana", titleEs: "Bonobo Ápex + Plátano Dorado", typeEn: "Form", typeEs: "Forma", icon: "👑", descEn: "Final Ultra Form & Golden Banana", descEs: "Forma Ultra Final y Plátano Dorado" },
];

const STAGE_NAMES_ES: Record<number, string> = {
  1: "Baby Bonobo",
  2: "Mono de Hierro",
  3: "Súper Bonobo",
  4: "Bonobo Ápex",
};

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
  const { isEs, tx } = useLanguage();
  const highestStage = getEvolutionStage(currentLevel).stage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2 heading-tight">
              <Trophy className="h-4 w-4 text-warning" />
              <span>{tx("Evolutions & Gear Track", "Evoluciones y Equipo")}</span>
            </DialogTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-warning font-bold tabular-nums">
              {tx(`Lv. ${currentLevel}`, `Nv. ${currentLevel}`)}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {tx(
              "Log workouts, feed bananas, and check in to evolve your Bonobo and unlock wearable gear.",
              "Registra entrenos, da plátanos y haz tu chequeo para evolucionar a Bonobo y desbloquear equipo."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 max-h-[68dvh] overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {tx("Evolution Stages", "Fases de Evolución")}
              </h4>
              {onSelectForm && activeForm !== "auto" && (
                <button
                  type="button"
                  onClick={() => onSelectForm("auto")}
                  className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  {tx("Use Highest Form", "Usar Forma Máxima")}
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
                const displayName = isEs ? STAGE_NAMES_ES[evo.stage] || evo.name : evo.name;

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
                      {isUnlocked ? displayName : "???"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5 tabular-nums">
                      {isDisplayed
                        ? tx("Active Form", "Forma Activa")
                        : isUnlocked
                        ? tx(`Stage ${evo.stage}`, `Fase ${evo.stage}`)
                        : tx(`Lv. ${evo.minLevel}`, `Nv. ${evo.minLevel}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {tx("Unlocks Roadmap", "Ruta de Recompensas")}
            </h4>
            {MILESTONES.map((m) => {
              const isUnlocked = currentLevel >= m.level;
              const isNext =
                currentLevel + 1 === m.level ||
                (currentLevel < m.level && MILESTONES.find((x) => x.level > currentLevel)?.level === m.level);

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
                        <p className="text-xs font-bold text-foreground leading-tight truncate">
                          {isEs ? m.titleEs : m.titleEn}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-medium font-mono uppercase shrink-0">
                          {isEs ? m.typeEs : m.typeEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {isEs ? m.descEs : m.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right ml-2">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                        <Check className="h-3 w-3" /> {tx("Unlocked", "Desbloqueado")}
                      </span>
                    ) : isNext ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning bg-warning/15 px-2 py-0.5 rounded-md border border-warning/30">
                        <Sparkles className="h-3 w-3" /> {tx(`Lv. ${m.level}`, `Nv. ${m.level}`)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                        <Lock className="h-3 w-3" /> {tx(`Lv. ${m.level}`, `Nv. ${m.level}`)}
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
