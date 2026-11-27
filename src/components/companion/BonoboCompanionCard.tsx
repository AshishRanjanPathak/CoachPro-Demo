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
  Trophy,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [customizeTab, setCustomizeTab] = useState<"outfits" | "color">("outfits");
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
  const bananaCount = companion.bananaInventory || 0;

  return (
    <Card className={`rounded-2xl border-border bg-card shadow-xs ${themeStyle.cardBg}`}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* 1. Identity & Clear Stage Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative shrink-0 flex flex-col items-center">
            <BonoboAvatar
              size={100}
              stage={displayedStageNumber}
              level={companion.level}
              mood={companion.mood}
              headwear={companion.equippedHeadwear}
              prop={companion.equippedProp}
              isEating={isEating}
              evolveBurst={Boolean(evolvedNotice)}
              onClick={handleTapAvatar}
            />
            <Badge
              variant="secondary"
              className="mt-2 px-3 py-0.5 text-xs font-medium tabular-nums"
            >
              {tx("Level", "Nivel")} {companion.level} • {displayedStageName}
            </Badge>
          </div>

          <div className="flex-1 w-full text-center sm:text-left space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {companion.name}
                </h3>
                <Badge variant="outline" className="text-xs font-medium">
                  {isEs
                    ? `Etapa ${displayedStage.stage} de 4`
                    : `Stage ${displayedStage.stage} of 4`}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {tx("Tap Bonobo for a tip", "Toca a Bonobo para un consejo")}
              </span>
            </div>

            {/* Readable Speech Bubble */}
            <button
              type="button"
              onClick={handleTapAvatar}
              className="w-full text-left rounded-xl bg-secondary/50 border border-border px-4 py-3 text-sm text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <p className="leading-relaxed">&ldquo;{currentQuote}&rdquo;</p>
            </button>

            {/* Evolution Flash Notice */}
            {evolvedNotice && (
              <div className="px-3.5 py-2 rounded-xl bg-warning/15 border border-warning/35 text-warning text-sm font-semibold flex items-center justify-center sm:justify-start gap-2 animate-in fade-in duration-150">
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{evolvedNotice}</span>
              </div>
            )}

            {/* Clear Progress Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="font-medium text-foreground truncate">
                  {nextStage
                    ? tx(`Next Form: ${nextStageName}`, `Siguiente Forma: ${nextStageName}`)
                    : tx("Max Evolution Reached", "Evolución Máxima Alcanzada")}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums shrink-0">
                  {companion.xp} / {companion.xpToNextLevel} {tx("pts", "pts")}
                </span>
              </div>
              <Progress value={xpPercent} className="h-2.5" />
            </div>
          </div>
        </div>

        <Separator />

        {/* 2. Large, Plain-Text Actions (Easy to read & tap for everyone) */}
        <div className="space-y-2.5">
          {onOpenAssistant && (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={onOpenAssistant}
              className="w-full h-12 rounded-xl text-sm sm:text-base font-semibold justify-between px-4 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>{tx("Ask Bonobo Assistant", "Hablar con Bonobo IA")}</span>
              </span>
              <ChevronRight className="w-4 h-4 opacity-75" aria-hidden="true" />
            </Button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Give Banana Treat */}
            <Button
              type="button"
              variant={bananaCount > 0 ? "secondary" : "outline"}
              size="lg"
              onClick={handleFeedManualSnack}
              disabled={isEating || bananaCount <= 0}
              className={`h-12 rounded-xl text-sm font-semibold justify-start px-3.5 gap-2.5 ${
                bananaCount > 0
                  ? "border border-warning/40 bg-warning/10 text-foreground hover:bg-warning/20 cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed"
              }`}
              title={
                bananaCount > 0
                  ? tx("Give 1 earned banana treat to Bonobo", "Dar 1 plátano ganado a Bonobo")
                  : tx("Complete workouts to earn banana treats", "Completa entrenos para ganar plátanos")
              }
            >
              <span className="text-base leading-none" aria-hidden="true">🍌</span>
              <span className="truncate">
                {bananaCount > 0
                  ? isEs
                    ? `Dar Premio (${bananaCount})`
                    : `Give Treat (${bananaCount})`
                  : tx("0 Treats (Log Workout)", "0 Premios (Registra Entreno)")}
              </span>
            </Button>

            {/* View 4-Stage Evolutions */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setTrackOpen(true)}
              className="h-12 rounded-xl text-sm font-semibold justify-start px-3.5 gap-2.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
              <span className="truncate">{tx("View Evolutions", "Ver Evoluciones")}</span>
            </Button>

            {/* Outfits & Card Colors (Combined for fewer buttons) */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setCustomizeTab("outfits");
                setClosetOpen(true);
              }}
              className="h-12 rounded-xl text-sm font-semibold justify-start px-3.5 gap-2.5 cursor-pointer"
            >
              <Shirt className="w-4 h-4 text-foreground shrink-0" aria-hidden="true" />
              <span className="truncate">{tx("Outfits & Colors", "Ropa y Colores")}</span>
            </Button>

            {/* Explicit Sound State Toggle */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={toggleSound}
              aria-pressed={!muted}
              className="h-12 rounded-xl text-sm font-semibold justify-start px-3.5 gap-2.5 cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">
                {muted ? tx("Sound: Off", "Sonido: Apagado") : tx("Sound: On", "Sonido: Encendido")}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* --- COMBINED OUTFITS & COLORS MODAL (Clean shadcn Tabs) --- */}
      <Dialog open={closetOpen} onOpenChange={setClosetOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 heading-tight">
              <Shirt className="h-4 w-4 text-warning" aria-hidden="true" />
              {tx("Outfits & Card Color", "Ropa y Color de Tarjeta")}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {tx(
                "Choose what Bonobo wears or pick your card highlight color.",
                "Elige la ropa de Bonobo o el color de acento de tu tarjeta."
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={customizeTab}
            onValueChange={(v) => setCustomizeTab(v as "outfits" | "color")}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-2 w-full h-11">
              <TabsTrigger value="outfits" className="text-sm font-semibold gap-1.5">
                <Shirt className="w-4 h-4" aria-hidden="true" />
                {tx("Outfits", "Ropa")}
              </TabsTrigger>
              <TabsTrigger value="color" className="text-sm font-semibold gap-1.5">
                <Palette className="w-4 h-4" aria-hidden="true" />
                {tx("Card Color", "Color")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outfits" className="space-y-4 pt-2">
              {/* Live Closet Preview */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/30 py-3 px-4">
                <BonoboAvatar
                  size={112}
                  stage={displayedStageNumber}
                  level={companion.level}
                  mood={companion.mood}
                  headwear={companion.equippedHeadwear}
                  prop={companion.equippedProp}
                />
                <span className="mt-2 text-xs font-medium text-muted-foreground">
                  {companion.name} • {displayedStageName}
                </span>
              </div>

              {/* Headwear Selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {tx("Headwear", "Cabeza")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <Button
                        key={item.id}
                        type="button"
                        variant={isEquipped ? "secondary" : "outline"}
                        disabled={!isUnlocked}
                        onClick={() => equipHeadwear(item.id as CompanionHeadwear)}
                        className={`h-11 justify-between px-3 text-sm font-medium rounded-xl ${
                          isEquipped ? "border-brand bg-brand/10" : ""
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isEquipped ? (
                          <Check className="h-4 w-4 text-brand shrink-0" />
                        ) : !isUnlocked ? (
                          <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {tx("Lv.", "Nv.")}{item.levelReq}
                          </span>
                        ) : null}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Props Selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {tx("Held Item", "En Mano")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <Button
                        key={item.id}
                        type="button"
                        variant={isEquipped ? "secondary" : "outline"}
                        disabled={!isUnlocked}
                        onClick={() => equipProp(item.id as CompanionProp)}
                        className={`h-11 justify-between px-3 text-sm font-medium rounded-xl ${
                          isEquipped ? "border-brand bg-brand/10" : ""
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isEquipped ? (
                          <Check className="h-4 w-4 text-brand shrink-0" />
                        ) : !isUnlocked ? (
                          <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {tx("Lv.", "Nv.")}{item.levelReq}
                          </span>
                        ) : null}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="color" className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "obsidian", label: tx("◽ Classic", "◽ Clásico"), desc: tx("Minimal monochrome", "Monocromo mínimo") },
                  { id: "jungle", label: tx("🌿 Jungle Green", "🌿 Verde Jungla"), desc: tx("Clean emerald accent", "Acento esmeralda") },
                  { id: "cyber", label: tx("⚡ High Contrast", "⚡ Alto Contraste"), desc: tx("Crisp monochrome stripe", "Borde nítido") },
                  { id: "cafe", label: tx("☕ Warm Amber", "☕ Ámbar Cálido"), desc: tx("Warm amber accent", "Acento cálido") },
                ].map((th) => {
                  const isSelected = companion.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => selectTheme(th.id as CompanionTheme)}
                      className={`p-3.5 rounded-xl border text-left transition-colors min-h-[64px] cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand/10 text-foreground"
                          : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{th.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-brand" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{th.desc}</p>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
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
    </Card>
  );
}
