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
  EvolutionStageNumber,
  EVOLUTION_STAGES,
  getEvolutionStage,
  getNextEvolutionStage,
  resolveDisplayStage,
} from "@/lib/companion";
import { BonoboAvatar } from "./BonoboAvatar";
import { UnlockTrackModal } from "./UnlockTrackModal";
import { soundController } from "@/lib/audio";
import { useLanguage } from "@/lib/i18n";
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
    "If you didn't log the set, did the barbell even move? Science says no.",
    "Remember water! Half your gym stamina is literally just not being a raisin.",
    "One solid workout = +2 bananas. Yes, I take bribes in potassium.",
    "Ready whenever you are — just hit Log after your last rep!"
  ],
  focused: [
    "Brace hard, move weights, don't forget to hit save after the set.",
    "Form so clean the gym mirror is taking notes.",
    "My headband gives +5 moral support per rep.",
    "Coach wrote it down, now we make gravity regret it."
  ],
  caring: [
    "Sore days matter too — recovery is when the muscles actually level up.",
    "Logged for Coach Sarah! Go drink water and spare the knees today.",
    "Rest like a champ today so tomorrow's weights feel weightless.",
    "Listen to your joints, not your ego!"
  ],
  celebrating: [
    "POWER LEVEL RISING!! New PR + Bonobo energy overload! ⚡🍌",
    "Look at those numbers go up! Even Frieza couldn't guard that squat.",
    "Gains successfully recorded! Treat yourself and me to a banana.",
    "High fives all around! ✋"
  ],
  pumped: [
    "Post-workout pump + logged sets = fastest road to Super Bonobo! ⚡",
    "My hair spikes every time you hit depth on squats.",
    "Light weight, baby! (Well, heavy weight, crisp reps!)",
    "Keep logging — next evolution form is watching!"
  ],
  content: [
    "Ready whenever you are! Log sets right after your session.",
    "Hydration check: Bonobo has consumed 3 imaginary espressos.",
    "Small sets today turn into new evolution stages tomorrow.",
    "Tap me anytime you need a pep talk or a banana break."
  ],
  sleepy: [
    "Zzz... muscles grow while you sleep, not while doomscrolling.",
    "Rest day protocol: carbs, water, zero barbell guilt.",
    "Recharging ki energy for tomorrow's lifts... 🛌",
    "Quiet recovery day. Even Goku takes a nap."
  ],
  hungry: [
    "Smells like workout time! Log your sets and earn a banana! 🍌",
    "Empty banana stash detected. This is a fitness emergency.",
    "One completed workout and I'll do an anime power-up!",
    "Waiting patiently for post-workout fuel..."
  ]
};

const COMPANION_QUOTES_ES: Record<string, string[]> = {
  happy: [
    "Si no registras la serie, ¿la barra siquiera se movió? La ciencia dice que no.",
    "¡Toma agua! La mitad de tu resistencia es simplemente no parecer una pasa.",
    "Un entreno = +2 plátanos. Sí, acepto sobornos en potasio.",
    "¡Listo cuando tú lo estés! Solo toca Registrar tras tu última serie."
  ],
  focused: [
    "Aprieta el core, mueve kilos y guarda tu serie al terminar.",
    "Técnica tan limpia que el espejo del gym está tomando notas.",
    "Mi cinta suma +5 de apoyo moral por repetición.",
    "El coach lo escribió; ahora hacemos que la gravedad se arrepienta."
  ],
  caring: [
    "Los días suaves también cuentan — el músculo crece descansando.",
    "¡Avisado para Sarah! Toma agua y cuida las rodillas hoy.",
    "Descansa como campeón hoy para volar mañana con los pesos.",
    "¡Escucha tus articulaciones, no a tu ego!"
  ],
  celebrating: [
    "¡¡NIVEL DE PODER SUBIENDO!! ¡Nuevo récord + ki de Bonobo! ⚡🍌",
    "¡Mira cómo suben esos números! Imparable hoy.",
    "¡Ganancias registradas! Invítame un plátano para celebrar.",
    "¡Choca esos cinco! ✋"
  ],
  pumped: [
    "Congestión post-entreno + series guardadas = ruta rápida a Súper Bonobo ⚡",
    "Mi pelo se eriza cada vez que bajas profundo en sentadilla.",
    "¡Peso ligero! (Bueno, peso serio y técnica impecable).",
    "¡Sigue registrando — tu próxima evolución está mirando!"
  ],
  content: [
    "¡Listo! Registra tus series justo al salir de entrenar.",
    "Chequeo de hidratación: Bonobo ya se tomó 3 cafés imaginarios.",
    "Series constantes hoy = nuevas evoluciones mañana.",
    "Tócame cuando necesites ánimo o un plátano."
  ],
  sleepy: [
    "Zzz... el músculo crece durmiendo, no viendo redes sociales.",
    "Protocolo de descanso: buena comida, agua y cero culpa.",
    "Recargando energía ki para las cargas de mañana... 🛌",
    "Día tranquilo. Hasta los campeones echan siesta."
  ],
  hungry: [
    "¡Huele a entreno! Registra tus series y gana un plátano 🍌",
    "Reserva de plátanos vacía. Emergencia deportiva detectada.",
    "¡Completa el entreno de hoy y hago una transformación anime!",
    "Esperando combustible post-entreno..."
  ]
};

const STAGE_NAMES_ES: Record<number, { name: string; badge: string }> = {
  1: { name: "Baby Bonobo", badge: "Fase 1 • Novato" },
  2: { name: "Mono de Hierro", badge: "Fase 2 • Hierro" },
  3: { name: "Súper Bonobo", badge: "Fase 3 • Súper" },
  4: { name: "Bonobo Ápex", badge: "Fase 4 • Final" },
};

interface BonoboCompanionCardProps {
  onOpenAssistant?: () => void;
}

export function BonoboCompanionCard({ onOpenAssistant }: BonoboCompanionCardProps = {}) {
  const { isEs, tx } = useLanguage();
  const [companion, setCompanion] = useState<CompanionState>(loadCompanionState);
  const [isEating, setIsEating] = useState(false);
  const [evolvedNotice, setEvolvedNotice] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [closetOpen, setClosetOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [muted, setMuted] = useState(() => soundController.getMuted());

  // Listen for companion updates and external feed/evolution events
  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<CompanionState>;
      if (custom.detail) setCompanion(custom.detail);
    };

    const handleFeedAnimation = (e: Event) => {
      const custom = e as CustomEvent<{
        reason: string;
        amount: number;
        leveledUp: boolean;
        level: number;
        evolved?: boolean;
        stageName?: string;
      }>;
      setIsEating(true);
      soundController.playChime();

      if (custom.detail?.leveledUp) {
        soundController.playLevelUp();
        triggerOptimizedConfetti({
          particleCount: custom.detail?.evolved ? 55 : 35,
          spread: custom.detail?.evolved ? 70 : 55,
          origin: { y: 0.7 }
        });
      }

      if (custom.detail?.evolved && custom.detail?.stageName) {
        setEvolvedNotice(`Evolved into ${custom.detail.stageName}!`);
        setTimeout(() => setEvolvedNotice(null), 4000);
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

  const selectForm = (form: EvolutionStageNumber | "auto") => {
    const updated = { ...companion, selectedForm: form };
    setCompanion(updated);
    saveCompanionState(updated);
    soundController.playPop();
  };

  const currentStage = getEvolutionStage(companion.level);
  const nextStage = getNextEvolutionStage(companion.level);
  const displayedStageNumber = resolveDisplayStage(companion);
  const displayedStage = EVOLUTION_STAGES.find((s) => s.stage === displayedStageNumber) || currentStage;
  const displayedStageName = isEs ? STAGE_NAMES_ES[displayedStageNumber]?.name || displayedStage.name : displayedStage.name;
  const displayedStageBadge = isEs ? STAGE_NAMES_ES[displayedStageNumber]?.badge || displayedStage.badgeTitle : displayedStage.badgeTitle;
  const nextStageName = nextStage && isEs ? STAGE_NAMES_ES[nextStage.stage]?.name || nextStage.name : nextStage?.name;

  const quoteBank = isEs ? COMPANION_QUOTES_ES : COMPANION_QUOTES;
  const quotes = quoteBank[companion.mood] || quoteBank.content;
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
        {/* Avatar with dynamic 2D stage evolution & attached gear */}
        <div className="relative shrink-0 flex flex-col items-center">
          <BonoboAvatar
            size={104}
            stage={displayedStageNumber}
            level={companion.level}
            mood={companion.mood}
            headwear={companion.equippedHeadwear}
            prop={companion.equippedProp}
            isEating={isEating}
            evolveBurst={Boolean(evolvedNotice)}
            onClick={handleTapAvatar}
          />
          <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border border-border bg-secondary text-muted-foreground tabular-nums">
            <Sparkles className="h-3 w-3 text-warning" aria-hidden="true" />
            <span>{tx("Lv.", "Nv.")} {companion.level} • {displayedStageName}</span>
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
                {displayedStage.stage >= 3
                  ? `⚡ ${displayedStageName}`
                  : companion.mood === "sleepy"
                  ? tx("🛌 Rested", "🛌 Descansado")
                  : displayedStageBadge}
              </span>
            </div>

            {/* Micro Controls (Audio, Closet, Theme) */}
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={muted ? tx("Unmute sounds", "Activar sonido") : tx("Mute sounds", "Silenciar sonido")}
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={tx("Toggle audio effects", "Alternar efectos de sonido")}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-success" />}
              </button>

              <button
                type="button"
                onClick={() => setClosetOpen(true)}
                title={tx("Customize Outfits", "Personalizar Equipo")}
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={tx("Open cosmetic closet", "Abrir armario")}
              >
                <Shirt className="h-4 w-4 text-warning" />
              </button>

              <button
                type="button"
                onClick={() => setThemeOpen(true)}
                title={tx("Switch Theme Vibe", "Cambiar Color")}
                className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-[0.97] min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={tx("Switch aesthetic theme", "Cambiar tema de tarjeta")}
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

          {/* Evolution Flash Notice */}
          {evolvedNotice && (
            <div className="mt-2 px-3 py-1.5 rounded-lg bg-warning/15 border border-warning/35 text-warning text-xs font-bold flex items-center justify-center sm:justify-start gap-1.5 animate-in fade-in duration-150">
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{evolvedNotice}</span>
            </div>
          )}

          {/* XP & Next Evolution Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-mono text-muted-foreground tabular-nums text-[11px] flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-warning" aria-hidden="true" />
                <span>{companion.xp} / {companion.xpToNextLevel} XP</span>
                {nextStage && (
                  <span className="text-[10px] text-muted-foreground/80 hidden sm:inline">
                    • {nextStageName} {tx(`at Lv.${nextStage.minLevel}`, `al Nv.${nextStage.minLevel}`)}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setTrackOpen(true)}
                className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
              >
                {tx("Evolutions & Gear →", "Evoluciones y Equipo →")}
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
                🍌 {companion.bananaInventory || 0} {tx("stash", "en mochila")}
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
                title={
                  (companion.bananaInventory || 0) > 0
                    ? tx("Feed 1 earned banana to Bonobo", "Dar 1 plátano a Bonobo")
                    : tx("Complete workouts or daily check-ins to earn bananas", "Completa entrenos o chequeos para ganar plátanos")
                }
              >
                <span>{(companion.bananaInventory || 0) > 0 ? tx("Feed 1 🍌", "Dar 1 🍌") : tx("0 Bananas", "0 Plátanos")}</span>
              </button>
            </div>

            {onOpenAssistant && (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/25 text-brand text-xs font-semibold hover:bg-brand/15 transition-[transform,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.97] min-h-[36px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tx("Talk to Bonobo AI", "Hablar con Bonobo IA")}</span>
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
              {tx("Bonobo's Closet & Gear", "Armario y Equipo de Bonobo")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {tx("Select headwear and handheld props unlocked by leveling up.", "Elige gorros y objetos desbloqueados al subir de nivel.")}
            </DialogDescription>
          </DialogHeader>

          {/* Live Closet Preview */}
          <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/30 py-3 px-4">
            <BonoboAvatar
              size={120}
              stage={displayedStageNumber}
              level={companion.level}
              mood={companion.mood}
              headwear={companion.equippedHeadwear}
              prop={companion.equippedProp}
            />
            <span className="mt-2 text-[11px] font-mono text-muted-foreground">
              {companion.name} • {displayedStageName}
            </span>
          </div>

          {/* Headwear Selector */}
          <div className="space-y-2 mt-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {tx("Headwear", "Cabeza")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: tx("No Hat", "Sin Gorro"), levelReq: 1 },
                { id: "red_headband", label: tx("🔴 Retro Headband", "🔴 Cinta Retro"), levelReq: 1 },
                { id: "beanie", label: tx("🧶 Cozy Beanie", "🧶 Gorro Tejido"), levelReq: 2 },
                { id: "scouter", label: tx("🟢 Power Scouter", "🟢 Escáuter"), levelReq: 4 },
                { id: "gold_crown", label: tx("👑 Champion Crown", "👑 Corona Campeón"), levelReq: 5 }
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
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{tx("Lv.", "Nv.")}{item.levelReq}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Props Selector */}
          <div className="space-y-2 mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {tx("Handheld Items", "En Mano")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: tx("Empty Hands", "Manos Libres"), levelReq: 1 },
                { id: "banana", label: tx("🍌 Fresh Banana", "🍌 Plátano"), levelReq: 1 },
                { id: "tiny_dumbbell", label: tx("🏋️ Mini Dumbbell", "🏋️ Mancuerna"), levelReq: 1 },
                { id: "iced_coffee", label: tx("🥤 Iced Latte", "🥤 Café Helado"), levelReq: 3 },
                { id: "golden_banana", label: tx("✨ Golden Banana", "✨ Plátano Dorado"), levelReq: 7 }
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
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{tx("Lv.", "Nv.")}{item.levelReq}</span>
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
              {tx("Accent Vibe", "Color de Tarjeta")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {tx(
                "Choose a subtle accent stripe and progress color for your companion card.",
                "Elige un acento sutil para la tarjeta de tu compañero."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {[
              { id: "jungle", label: tx("🌿 Jungle", "🌿 Jungla"), desc: tx("Clean emerald accent", "Acento esmeralda") },
              { id: "cyber", label: tx("⚡ Graphite", "⚡ Grafito"), desc: tx("Crisp contrast accent", "Contraste nítido") },
              { id: "cafe", label: tx("☕ Amber", "☕ Ámbar"), desc: tx("Warm espresso amber", "Ámbar cálido") },
              { id: "obsidian", label: tx("◽ Classic", "◽ Clásico"), desc: tx("Minimal monochrome", "Monocromo mínimo") }
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

      {/* --- EVOLUTION & REWARDS ROAD MODAL --- */}
      <UnlockTrackModal
        open={trackOpen}
        onOpenChange={setTrackOpen}
        currentLevel={companion.level}
        currentXp={companion.xp}
        xpToNext={companion.xpToNextLevel}
        equippedHeadwear={companion.equippedHeadwear}
        equippedProp={companion.equippedProp}
        activeForm={companion.selectedForm || "auto"}
        onSelectForm={selectForm}
      />
    </div>
  );
}
