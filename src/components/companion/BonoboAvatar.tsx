"use client";

import React, { useId, useState } from "react";
import {
  CompanionMood,
  CompanionHeadwear,
  CompanionProp,
  EvolutionStageNumber,
  getEvolutionStage,
} from "@/lib/companion";
import { soundController } from "@/lib/audio";

interface BonoboAvatarProps {
  mood?: CompanionMood;
  headwear?: CompanionHeadwear;
  prop?: CompanionProp;
  stage?: EvolutionStageNumber;
  level?: number;
  isEating?: boolean;
  lockedSilhouette?: boolean;
  evolveBurst?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const INK = "#111114";

interface StagePalette {
  bgInner: string;
  bgOuter: string;
  furBase: string;
  furShade: string;
  furHighlight: string;
  skinBase: string;
  skinShade: string;
  spikeBase: string;
  spikeHighlight: string;
  irisColor: string;
  auraOuter: string;
  auraInner: string;
  shoulderHalfW: number;
  chestScale: number;
}

function getStagePalette(stage: EvolutionStageNumber): StagePalette {
  switch (stage) {
    case 2: // Iron Ape (Street Grinder — Ember Aura)
      return {
        bgInner: "#291D16",
        bgOuter: "#121215",
        furBase: "#44281E",
        furShade: "#2A1711",
        furHighlight: "#694133",
        skinBase: "#EBC39F",
        skinShade: "#D19E76",
        spikeBase: "#3A2018",
        spikeHighlight: "#6E4434",
        irisColor: "#18181B",
        auraOuter: "#F97316",
        auraInner: "#FDBA74",
        shoulderHalfW: 44,
        chestScale: 1.06,
      };
    case 3: // Super Bonobo (Dragon Ball Z Golden Ki)
      return {
        bgInner: "#2C230B",
        bgOuter: "#121215",
        furBase: "#4C2E20",
        furShade: "#2E1A11",
        furHighlight: "#8C583B",
        skinBase: "#F3CCA6",
        skinShade: "#D6A175",
        spikeBase: "#FACC15",
        spikeHighlight: "#FEF08A",
        irisColor: "#0EA5E9", // Classic glowing Super cyan-blue eyes!
        auraOuter: "#EAB308",
        auraInner: "#FEF08A",
        shoulderHalfW: 49,
        chestScale: 1.12,
      };
    case 4: // Apex Bonobo (Ultra Silver-Platinum Final Form)
      return {
        bgInner: "#1E222B",
        bgOuter: "#0F1014",
        furBase: "#33333D",
        furShade: "#1D1D24",
        furHighlight: "#5C5C6E",
        skinBase: "#EED2BA",
        skinShade: "#CBA487",
        spikeBase: "#E2E8F0",
        spikeHighlight: "#FFFFFF",
        irisColor: "#F8FAFC", // Calm radiant silver-white eyes
        auraOuter: "#94A3B8",
        auraInner: "#F8FAFC",
        shoulderHalfW: 52,
        chestScale: 1.14,
      };
    case 1:
    default: // Baby Bonobo (Cute Rookie)
      return {
        bgInner: "#1F1D1B",
        bgOuter: "#121215",
        furBase: "#4E2F24",
        furShade: "#331C15",
        furHighlight: "#704536",
        skinBase: "#F0CBB0",
        skinShade: "#D9A886",
        spikeBase: "#4E2F24",
        spikeHighlight: "#754839",
        irisColor: "#18181B",
        auraOuter: "#A1A1AA",
        auraInner: "#E4E4E7",
        shoulderHalfW: 36,
        chestScale: 0.96,
      };
  }
}

export function BonoboAvatar({
  mood = "happy",
  headwear = "red_headband",
  prop = "tiny_dumbbell",
  stage,
  level = 1,
  isEating = false,
  lockedSilhouette = false,
  evolveBurst = false,
  size = 140,
  className = "",
  onClick,
}: BonoboAvatarProps) {
  const [bouncing, setBouncing] = useState(false);
  const uid = useId().replace(/:/g, "");

  const resolvedStage: EvolutionStageNumber = stage ?? getEvolutionStage(level).stage;
  const p = getStagePalette(resolvedStage);
  const animateIdle = size >= 72 && !lockedSilhouette;

  // Hand grip point calibrated cleanly below right ear & inside studio margin
  const gripX = resolvedStage === 1 ? 162 : 164;
  const gripY = resolvedStage === 1 ? 148 : 146;
  const forearmJoinX = 110 + p.shoulderHalfW - 6;

  const bgGradId = `${uid}-bg`;
  const auraGradId = `${uid}-aura`;
  const headbandId = `${uid}-hb`;
  const crownId = `${uid}-cr`;
  const beanieId = `${uid}-bn`;
  const goldBananaId = `${uid}-gb`;
  const silhouetteFilterId = `${uid}-sil`;

  const handleClick = () => {
    if (!onClick) return;
    setBouncing(true);
    soundController.playPop();
    setTimeout(() => setBouncing(false), 200);
    onClick();
  };

  const renderInteractiveWrapper = Boolean(onClick);

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      role={renderInteractiveWrapper ? "button" : undefined}
      tabIndex={renderInteractiveWrapper ? 0 : undefined}
      aria-label={`Bonobo companion — ${getEvolutionStage(resolvedStage * 2 - 1).name}`}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#121215] border border-border/80 select-none transition-transform duration-150 ease-[var(--ease-out)] ${
        renderInteractiveWrapper ? "cursor-pointer active:scale-[0.97]" : ""
      } ${bouncing ? "scale-[1.04]" : ""} ${evolveBurst ? "bonobo-evolve-burst" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 220 220"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={bgGradId} cx="50%" cy="48%" r="60%">
            <stop offset="0%" stopColor={lockedSilhouette ? "#1F1F24" : p.bgInner} />
            <stop offset="100%" stopColor={p.bgOuter} />
          </radialGradient>

          <radialGradient id={auraGradId} cx="50%" cy="55%" r="52%">
            <stop offset="0%" stopColor={p.auraInner} stopOpacity="0.45" />
            <stop offset="55%" stopColor={p.auraOuter} stopOpacity="0.22" />
            <stop offset="100%" stopColor={p.auraOuter} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={headbandId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="30%" stopColor="#EF4444" />
            <stop offset="62%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          <linearGradient id={beanieId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52525B" />
            <stop offset="55%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>

          <linearGradient id={crownId} x1="0%" y1="0%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="55%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          <linearGradient id={goldBananaId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          {lockedSilhouette && (
            <filter id={silhouetteFilterId}>
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.1  0 0 0 1 0"
              />
            </filter>
          )}
        </defs>

        {/* Background Studio Canvas */}
        <rect width="220" height="220" fill={`url(#${bgGradId})`} />

        {/* Subtle Floor Shadow */}
        <ellipse cx="110" cy="204" rx="58" ry="8" fill="#000000" opacity="0.45" />

        {/* Main Animated Character Rig */}
        <g
          className={animateIdle ? "bonobo-breathe" : undefined}
          filter={lockedSilhouette ? `url(#${silhouetteFilterId})` : undefined}
        >
          {/* LAYER 1: EVOLUTION AURA (Stage 2 ember, Stage 3 Super Saiyan Ki, Stage 4 Ultra Halo) */}
          {!lockedSilhouette && resolvedStage >= 2 && (
            <g className={animateIdle ? "bonobo-aura-pulse" : undefined}>
              <circle cx="110" cy="118" r="94" fill={`url(#${auraGradId})`} />

              {resolvedStage === 2 && (
                <g stroke={p.auraOuter} strokeWidth="2.2" strokeLinecap="round" opacity="0.8">
                  <path d="M 38 150 L 30 124" />
                  <path d="M 182 150 L 190 124" />
                  <path d="M 52 54 L 44 40" />
                  <path d="M 168 54 L 176 40" />
                </g>
              )}

              {resolvedStage === 3 && (
                <g>
                  {/* Stylized Flame Crown Aura (Dragon Ball Z Ki silhouette) */}
                  <path
                    d="M 46 212 C 30 176, 32 132, 46 106 L 34 86 L 56 76 C 58 46, 78 24, 98 12 L 110 30 L 124 8 C 144 24, 162 48, 164 78 L 186 86 L 174 108 C 188 134, 190 178, 174 212 Z"
                    fill={p.auraOuter}
                    fillOpacity="0.18"
                    stroke={p.auraInner}
                    strokeOpacity="0.55"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Crackling Ki Lightning Bolts */}
                  <g stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 30 122 L 42 114 L 35 103 L 48 94" />
                    <path d="M 192 92 L 180 84 L 188 73 L 174 66" />
                    <path d="M 48 44 L 58 50 L 54 38" />
                  </g>
                </g>
              )}

              {resolvedStage === 4 && (
                <g>
                  {/* Cosmic Halo Ring behind head */}
                  <g className={animateIdle ? "bonobo-halo-spin" : undefined} style={{ transformOrigin: "110px 84px" }}>
                    <circle
                      cx="110"
                      cy="84"
                      r="74"
                      stroke="#E2E8F0"
                      strokeOpacity="0.4"
                      strokeWidth="1.8"
                      strokeDasharray="16 8 4 8"
                    />
                  </g>
                  {/* Sweeping Silver-White Ultra Ki */}
                  <path
                    d="M 44 212 C 28 168, 36 118, 56 88 C 62 44, 86 22, 110 10 C 134 22, 158 44, 164 88 C 184 118, 192 168, 176 212 Z"
                    fill="#F8FAFC"
                    fillOpacity="0.12"
                    stroke="#FFFFFF"
                    strokeOpacity="0.5"
                    strokeWidth="2"
                  />
                  {/* Floating Diamond Sparks */}
                  <path d="M 38 72 L 41 64 L 44 72 L 52 75 L 44 78 L 41 86 L 38 78 L 30 75 Z" fill="#FFFFFF" opacity="0.85" />
                  <path d="M 176 48 L 178 42 L 180 48 L 186 50 L 180 52 L 178 58 L 176 52 L 170 50 Z" fill="#E2E8F0" opacity="0.85" />
                </g>
              )}
            </g>
          )}

          {/* LAYER 2: FLOWING HEADBAND TAILS (drawn behind head & right ear so it wraps physically!) */}
          {headwear === "red_headband" && (
            <g>
              <path
                d="M 145 64 C 162 60, 178 56, 189 64 C 176 70, 163 69, 148 70 Z"
                fill="#DC2626"
                stroke={INK}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <path
                d="M 145 68 C 160 72, 174 79, 182 88 C 169 86, 157 79, 145 73 Z"
                fill="#991B1B"
                stroke={INK}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* LAYER 3: MUSCULAR TORSO, SHOULDERS & LEFT ARM */}
          <g>
            {/* Main Shoulders & Upper Chest scaled by Evolution Stage */}
            <path
              d={`M ${110 - p.shoulderHalfW - 8} 222 C ${110 - p.shoulderHalfW - 4} 162, ${110 - p.shoulderHalfW + 6} 138, 110 138 C ${110 + p.shoulderHalfW - 6} 138, ${110 + p.shoulderHalfW + 4} 162, ${110 + p.shoulderHalfW + 8} 222 Z`}
              fill={p.furBase}
              stroke={INK}
              strokeWidth="3.4"
              strokeLinejoin="round"
            />
            {/* Chest Tan Patch (classic anime primate/saiyan chest definition) */}
            <path
              d={`M ${110 - 24 * p.chestScale} 214 C ${110 - 28 * p.chestScale} 166, ${110 - 22 * p.chestScale} 148, 110 148 C ${110 + 22 * p.chestScale} 148, ${110 + 28 * p.chestScale} 166, ${110 + 24 * p.chestScale} 214 Z`}
              fill={p.skinBase}
              stroke={INK}
              strokeWidth="2.8"
            />
            {/* Defined pec line on Stage 2+ */}
            {resolvedStage >= 2 && (
              <path
                d="M 92 174 Q 105 180 110 172 Q 115 180 128 174 M 110 172 L 110 202"
                stroke={INK}
                strokeWidth="2.3"
                strokeLinecap="round"
                opacity="0.72"
              />
            )}
            {/* Cute left arm resting confidently */}
            <path
              d={`M ${110 - p.shoulderHalfW + 2} 152 C ${110 - p.shoulderHalfW - 14} 170, ${110 - p.shoulderHalfW - 14} 194, ${110 - p.shoulderHalfW + 6} 206`}
              fill={p.furShade}
              stroke={INK}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Left athletic wrist band on Stage 2+ */}
            {resolvedStage >= 2 && (
              <rect
                x={110 - p.shoulderHalfW - 13}
                y="191"
                width="18"
                height="9"
                rx="3"
                transform={`rotate(-14 ${110 - p.shoulderHalfW - 4} 195)`}
                fill={resolvedStage === 4 ? "#F8FAFC" : resolvedStage === 3 ? "#FACC15" : "#E4E4E7"}
                stroke={INK}
                strokeWidth="2.4"
              />
            )}
          </g>

          {/* LAYER 4: EARS (anchored cleanly on skull sides x=70, x=150, y=88) */}
          <g>
            {/* Left Ear */}
            <circle cx="69" cy="88" r="14.5" fill={p.furBase} stroke={INK} strokeWidth="3.2" />
            <circle cx="70" cy="89" r="8.5" fill={p.skinBase} stroke={INK} strokeWidth="2.2" />
            <path d="M 67 87 Q 71 84 73 89" stroke={p.skinShade} strokeWidth="2.2" strokeLinecap="round" />
            {/* Right Ear */}
            <circle cx="151" cy="88" r="14.5" fill={p.furBase} stroke={INK} strokeWidth="3.2" />
            <circle cx="150" cy="89" r="8.5" fill={p.skinBase} stroke={INK} strokeWidth="2.2" />
            <path d="M 153 87 Q 149 84 147 89" stroke={p.skinShade} strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* LAYER 5: CRANIUM & EVOLUTION HAIR SPIKES */}
          <g>
            {/* Base Cranial Dome */}
            <circle cx="110" cy="88" r="41" fill={p.furBase} stroke={INK} strokeWidth="3.4" />
            {/* Cheek fur tufts */}
            <path d="M 70 98 L 63 103 L 71 107" fill={p.furBase} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M 150 98 L 157 103 L 149 107" fill={p.furBase} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />

            {/* Evolution Hair / Spikes (adapts cleanly when beanie or crown is worn!) */}
            {resolvedStage === 1 && headwear !== "beanie" && (
              /* Cute rookie curl tuft */
              <path
                d="M 101 49 C 102 36, 111 33, 116 39 C 122 36, 126 43, 120 49 Z"
                fill={p.spikeBase}
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            )}

            {resolvedStage === 2 && headwear !== "beanie" && (
              /* Iron Ape: Bold spikier mane crest */
              <path
                d="M 86 55 L 79 39 L 97 46 L 106 27 L 118 44 L 135 34 L 133 53 Z"
                fill={p.spikeBase}
                stroke={INK}
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
            )}

            {(resolvedStage === 3 || resolvedStage === 4) &&
              (headwear === "beanie" ? (
                /* Side temple locks peek out cleanly below beanie cuff */
                <g>
                  <path d="M 73 70 L 58 63 L 71 78 Z" fill={p.spikeBase} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
                  <path d="M 147 70 L 162 63 L 149 78 Z" fill={p.spikeBase} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
                </g>
              ) : (
                /* Dragon Ball Z Super Saiyan / Ultra Spiky Hair Burst! */
                <g>
                  <path
                    d={
                      headwear === "gold_crown"
                        ? "M 74 62 L 60 40 L 82 47 L 76 22 L 97 38 L 110 34 L 123 38 L 144 22 L 138 47 L 160 40 L 146 62 Z"
                        : "M 74 62 L 60 40 L 82 47 L 76 20 L 99 38 L 111 10 L 123 38 L 145 20 L 138 47 L 160 40 L 146 62 Z"
                    }
                    fill={p.spikeBase}
                    stroke={INK}
                    strokeWidth="3.3"
                    strokeLinejoin="round"
                  />
                  {/* Crisp 2D Anime Cel-Shade Highlight Stripes inside Spikes */}
                  <path
                    d={
                      headwear === "gold_crown"
                        ? "M 84 44 L 81 30 L 93 40 M 136 44 L 139 30 L 127 40"
                        : "M 103 34 L 111 17 L 117 34 M 84 44 L 81 28 L 93 40 M 136 44 L 139 28 L 127 40"
                    }
                    stroke={p.spikeHighlight}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                </g>
              ))}

            {/* Fur forehead highlight curve (Stage 1 & 2) */}
            {resolvedStage <= 2 && (
              <path
                d="M 85 60 Q 110 51 135 60"
                stroke={p.furHighlight}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />
            )}
          </g>

          {/* LAYER 6: FACE MASK (Muzzle, Expressive Eyes, Brows, Mouth) */}
          <g>
            {/* Upper Eye-Mask Peach Skin */}
            <path
              d="M 81 84 C 81 69, 98 67, 110 75 C 122 67, 139 69, 139 84 C 141 97, 132 104, 110 104 C 88 104, 79 97, 81 84 Z"
              fill={p.skinBase}
              stroke={INK}
              strokeWidth="2.6"
            />
            {/* Lower Chubby Muzzle Oval */}
            <ellipse
              cx="110"
              cy="106"
              rx={isEating ? 29 : 26.5}
              ry={isEating ? 21 : 19}
              fill={p.skinBase}
              stroke={INK}
              strokeWidth="3"
            />
            {/* Subtle chin shadow */}
            <path d="M 94 119 Q 110 125 126 119" stroke={p.skinShade} strokeWidth="2.4" strokeLinecap="round" />

            {/* Soft blush cheeks */}
            <ellipse cx="86" cy="100" rx="5.5" ry="3.2" fill="#F87171" opacity={isEating || mood === "celebrating" ? 0.55 : 0.3} />
            <ellipse cx="134" cy="100" rx="5.5" ry="3.2" fill="#F87171" opacity={isEating || mood === "celebrating" ? 0.55 : 0.3} />

            {/* Cute Bonobo Nostrils */}
            <ellipse cx="104.5" cy="98.5" rx="2.4" ry="3.2" fill="#5D3A29" />
            <ellipse cx="115.5" cy="98.5" rx="2.4" ry="3.2" fill="#5D3A29" />

            {/* Expressive Eyes by Mood */}
            {mood === "sleepy" || isEating ? (
              <g stroke={INK} strokeWidth="3.2" strokeLinecap="round">
                <path d="M 88 85 Q 95 79 102 85" />
                <path d="M 118 85 Q 125 79 132 85" />
              </g>
            ) : mood === "celebrating" ? (
              <g>
                <path d="M 88 87 Q 95 77 102 87" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
                <path d="M 118 87 Q 125 77 132 87" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
              </g>
            ) : (
              <g>
                {/* Crisp Eye Sclera / Anime Shine */}
                <circle cx="95" cy="84" r="6.8" fill={resolvedStage >= 3 ? p.auraInner : "#FFFFFF"} stroke={INK} strokeWidth="2.2" />
                <circle cx="125" cy="84" r="6.8" fill={resolvedStage >= 3 ? p.auraInner : "#FFFFFF"} stroke={INK} strokeWidth="2.2" />
                <circle cx="95.5" cy="84.2" r="4.2" fill={p.irisColor} />
                <circle cx="124.5" cy="84.2" r="4.2" fill={p.irisColor} />
                {/* Catchlights */}
                <circle cx="93.2" cy="81.8" r="1.8" fill="#FFFFFF" />
                <circle cx="122.2" cy="81.8" r="1.8" fill="#FFFFFF" />
                <circle cx="97.5" cy="86.5" r="0.9" fill="#FFFFFF" />
                <circle cx="126.5" cy="86.5" r="0.9" fill="#FFFFFF" />
              </g>
            )}

            {/* Eyebrows (Sharp/Fierce on Pumped, Focused, or Evolved Stages 2-4!) */}
            {mood === "pumped" || mood === "focused" || resolvedStage >= 2 ? (
              <g stroke={resolvedStage === 3 ? p.spikeBase : resolvedStage === 4 ? "#F8FAFC" : INK} strokeWidth="3.2" strokeLinecap="round">
                <path d="M 86 73 L 103 77" />
                <path d="M 134 73 L 117 77" />
              </g>
            ) : mood === "caring" || mood === "hungry" ? (
              <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
                <path d="M 86 76 Q 94 72 102 74" />
                <path d="M 134 76 Q 126 72 118 74" />
              </g>
            ) : null}

            {/* Mouth by Mood & Eating */}
            {isEating ? (
              <path d="M 99 109 Q 110 116 121 109 Q 110 120 99 109 Z" fill="#991B1B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            ) : mood === "celebrating" ? (
              <g>
                <path d="M 96 107 Q 110 110 124 107 C 122 121, 98 121, 96 107 Z" fill="#7F1D1D" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M 103 115 Q 110 112 117 115" stroke="#FB7185" strokeWidth="3" strokeLinecap="round" />
              </g>
            ) : mood === "hungry" ? (
              <ellipse cx="110" cy="112" rx="4.8" ry="5.5" fill="#7F1D1D" stroke={INK} strokeWidth="2.5" />
            ) : mood === "sleepy" ? (
              <path d="M 105 111 Q 110 114 115 111" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
            ) : mood === "pumped" || resolvedStage >= 3 ? (
              /* Confident anime gym smirk */
              <path d="M 97 109 Q 111 117 124 107" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            ) : (
              /* Warm smiling Bonobo mouth */
              <path d="M 97 108 Q 110 118 123 108" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
            )}
          </g>

          {/* LAYER 7: HEADWEAR ATTACHMENTS (anatomically fitted around hairline, brow, crown & ears!) */}
          {headwear === "red_headband" && (
            <g>
              {/* Curved front headband snugly tracing brow ridge (x=70..150, y=58..69) UNDER Super spikes */}
              <path
                d="M 70 66 Q 110 55 150 66 L 149 75 Q 110 64 71 75 Z"
                fill={`url(#${headbandId})`}
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Crisp varsity white stripe */}
              <path
                d="M 72 69.5 Q 110 58.5 148 69.5 L 147.8 72 Q 110 61 72.2 72 Z"
                fill="#FFFFFF"
                opacity="0.92"
              />
              {/* Side knot bump at right temple */}
              <circle cx="147" cy="69" r="5" fill="#DC2626" stroke={INK} strokeWidth="2.6" />
            </g>
          )}

          {headwear === "beanie" && (
            <g>
              {/* Cozy Pom-Pom crowning the dome */}
              <circle cx="110" cy="24" r="9" fill="#E4E4E7" stroke={INK} strokeWidth="3" />
              <path d="M 105 21 Q 110 18 114 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              {/* Beanie Crown Dome cleanly hugging head radius without covering ears */}
              <path
                d="M 71 67 C 71 25, 149 25, 149 67 Z"
                fill={`url(#${beanieId})`}
                stroke={INK}
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Subtle knit seams */}
              <g stroke="#71717A" strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
                <path d="M 110 33 L 110 60" />
                <path d="M 96 36 Q 91 48 89 62" />
                <path d="M 124 36 Q 129 48 131 62" />
              </g>
              {/* Ribbed folded cuff hugging forehead */}
              <path
                d="M 68 62 Q 110 52 152 62 L 151 74 Q 110 64 69 74 Z"
                fill="#3F3F46"
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <g stroke="#18181B" strokeWidth="1.8" opacity="0.65">
                <line x1="78" y1="61" x2="78" y2="71" />
                <line x1="90" y1="59" x2="90" y2="69" />
                <line x1="103" y1="57" x2="103" y2="67" />
                <line x1="117" y1="57" x2="117" y2="67" />
                <line x1="130" y1="59" x2="130" y2="69" />
                <line x1="142" y1="61" x2="142" y2="71" />
              </g>
            </g>
          )}

          {headwear === "scouter" && (
            <g>
              {/* Earpiece clamped directly around Bonobo's left ear (69, 88) */}
              <rect x="57" y="75" width="17" height="26" rx="6" fill="#27272A" stroke={INK} strokeWidth="2.8" />
              <circle cx="65.5" cy="88" r="4.5" fill="#EF4444" stroke={INK} strokeWidth="2" />
              <circle cx="64.5" cy="86.8" r="1.4" fill="#FCA5A5" />
              {/* Sleek bridge arm & translucent green DBZ Power Lens over Left Eye (95, 84) */}
              <path
                d="M 73 82 L 79 73 L 109 73 C 113 73, 113 94, 108 95 L 79 95 L 73 89 Z"
                fill="#22C55E"
                fillOpacity="0.45"
                stroke="#4ADE80"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Dark outer frame edge */}
              <path d="M 73 82 L 79 73 L 106 73" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
              {/* HUD Target Reticle & Glass Reflection */}
              <circle cx="95" cy="84" r="7" stroke="#BBF7D0" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.9" />
              <line x1="82" y1="77" x2="88" y2="83" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
            </g>
          )}

          {headwear === "gold_crown" && (
            <g transform={resolvedStage >= 3 ? "translate(0, -4)" : undefined}>
              {/* Interior dark shadow cup so crown wraps smoothly in 2.5D */}
              <path d="M 88 50 L 92 31 L 101 39 L 110 25 L 119 39 L 128 31 L 132 50 Z" fill="#78350F" />
              <path
                d="M 86 52 L 87 28 L 98 40 L 110 20 L 122 40 L 133 28 L 134 52 Q 110 57 86 52 Z"
                fill={`url(#${crownId})`}
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Bezel Jewels */}
              <circle cx="97" cy="48" r="2.6" fill="#EF4444" stroke={INK} strokeWidth="1.5" />
              <circle cx="110" cy="49" r="3.2" fill="#38BDF8" stroke={INK} strokeWidth="1.5" />
              <circle cx="123" cy="48" r="2.6" fill="#22C55E" stroke={INK} strokeWidth="1.5" />
              {/* Tip spheres */}
              <circle cx="87" cy="27" r="2.8" fill="#FEF08A" stroke={INK} strokeWidth="2" />
              <circle cx="110" cy="19" r="3.4" fill="#FEF08A" stroke={INK} strokeWidth="2" />
              <circle cx="133" cy="27" r="2.8" fill="#FEF08A" stroke={INK} strokeWidth="2" />
            </g>
          )}

          {/* LAYER 8: FOREGROUND RIGHT ARM (resting cleanly when empty hands, or hero-gripping prop!) */}
          {prop === "none" ? (
            <g>
              <path
                d={`M ${110 + p.shoulderHalfW - 2} 152 C ${110 + p.shoulderHalfW + 14} 170, ${110 + p.shoulderHalfW + 14} 194, ${110 + p.shoulderHalfW - 6} 206`}
                fill={p.furShade}
                stroke={INK}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {resolvedStage >= 2 && (
                <rect
                  x={110 + p.shoulderHalfW - 5}
                  y="191"
                  width="18"
                  height="9"
                  rx="3"
                  transform={`rotate(14 ${110 + p.shoulderHalfW + 4} 195)`}
                  fill={resolvedStage === 4 ? "#F8FAFC" : resolvedStage === 3 ? "#FACC15" : "#E4E4E7"}
                  stroke={INK}
                  strokeWidth="2.4"
                />
              )}
            </g>
          ) : (
            <g>
              {/* Raised Muscled Right Arm extending from shoulder to hero grip point */}
              <path
                d={`M ${forearmJoinX} 152 C ${forearmJoinX + 18} 166, ${gripX + 10} 168, ${gripX + 2} ${gripY + 12}`}
                stroke={INK}
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d={`M ${forearmJoinX} 152 C ${forearmJoinX + 18} 166, ${gripX + 10} 168, ${gripX + 2} ${gripY + 12}`}
                stroke={p.furBase}
                strokeWidth="15.5"
                strokeLinecap="round"
              />
              {/* Athletic Wrist Wrap on Stage 2+ */}
              {resolvedStage >= 2 && (
                <rect
                  x={gripX - 7}
                  y={gripY + 11}
                  width="18"
                  height="8"
                  rx="3"
                  transform={`rotate(-14 ${gripX + 2} ${gripY + 15})`}
                  fill={resolvedStage === 4 ? "#F8FAFC" : resolvedStage === 3 ? "#FACC15" : "#E4E4E7"}
                  stroke={INK}
                  strokeWidth="2.4"
                />
              )}

              {/* Back Palm behind prop handle */}
              <ellipse cx={gripX} cy={gripY + 2} rx="12" ry="11.5" fill={p.skinShade} stroke={INK} strokeWidth="2.8" />

              {/* THE PROP CENTERED INSIDE GRIP */}
              {prop === "tiny_dumbbell" && (
                <g transform={`translate(${gripX}, ${gripY}) rotate(-22)`}>
                  {/* Chrome Bar */}
                  <rect x="-20" y="-4" width="40" height="8" rx="3.5" fill="#D4D4D8" stroke={INK} strokeWidth="2.6" />
                  {/* Left Plate Stack */}
                  <rect x="-31" y="-15" width="12" height="30" rx="3.5" fill="#27272A" stroke={INK} strokeWidth="2.8" />
                  <rect x="-36" y="-11" width="6" height="22" rx="2.5" fill="#3F3F46" stroke={INK} strokeWidth="2.4" />
                  {/* Right Plate Stack */}
                  <rect x="19" y="-15" width="12" height="30" rx="3.5" fill="#27272A" stroke={INK} strokeWidth="2.8" />
                  <rect x="30" y="-11" width="6" height="22" rx="2.5" fill="#3F3F46" stroke={INK} strokeWidth="2.4" />
                  {/* Specular Plate Line */}
                  <line x1="-26" y1="-9" x2="-26" y2="9" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="-9" x2="25" y2="9" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}

              {prop === "banana" && (
                <g transform={`translate(${gripX}, ${gripY}) rotate(12)`}>
                  {/* Ripe Peeled Banana gripped cleanly */}
                  <path
                    d="M -4 -34 C 12 -32, 22 -8, 13 24 C 11 28, 3 28, 1 23 C 5 2, 0 -16, -9 -24 C -12 -28, -9 -34, -4 -34 Z"
                    fill="#FACC15"
                    stroke={INK}
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  {/* Exposed Cream Top Tip */}
                  <path
                    d="M -6 -34 C -2 -41, 6 -41, 7 -32 Z"
                    fill="#FEF9C3"
                    stroke={INK}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Specular Highlight */}
                  <path d="M 4 -24 C 12 -10, 13 4, 8 18" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" />
                </g>
              )}

              {prop === "golden_banana" && (
                <g transform={`translate(${gripX}, ${gripY}) rotate(12)`}>
                  <path
                    d="M -5 -36 C 14 -33, 24 -7, 14 25 C 12 30, 3 30, 1 24 C 6 2, 0 -17, -10 -25 C -13 -29, -10 -36, -5 -36 Z"
                    fill={`url(#${goldBananaId})`}
                    stroke={INK}
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  <path d="M -6 -36 L -1 -43 L 4 -36 Z" fill="#FDE047" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
                  {/* Twin Sparkles */}
                  <path d="M -18 -20 L -15 -26 L -12 -20 L -6 -17 L -12 -14 L -15 -8 L -18 -14 L -24 -17 Z" fill="#FEF08A" />
                </g>
              )}

              {prop === "iced_coffee" && (
                <g transform={`translate(${gripX}, ${gripY - 2}) rotate(-6)`}>
                  {/* Straw */}
                  <path d="M 4 -36 L -1 -14" stroke="#F4F4F5" strokeWidth="4.2" strokeLinecap="round" />
                  <path d="M 4 -36 L -1 -14" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
                  {/* Tapered Cup */}
                  <polygon
                    points="-15,-14 15,-14 11,26 -11,26"
                    fill="#B07D52"
                    stroke={INK}
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  {/* Cream Swirl & Ice */}
                  <path d="M -13 -4 Q 0 2 13 -5 L 11 9 Q 0 14 -11 9 Z" fill="#F5EBDD" opacity="0.72" />
                  <rect x="-8" y="-12" width="7" height="7" rx="1.5" fill="#FFFFFF" opacity="0.6" transform="rotate(-12 -4 -8)" />
                  <rect x="2" y="-11" width="7" height="7" rx="1.5" fill="#FFFFFF" opacity="0.55" transform="rotate(14 5 -7)" />
                  {/* Dome Lid + Rim */}
                  <path d="M -14 -16 C -14 -26, 14 -26, 14 -16 Z" fill="#E4E4E7" fillOpacity="0.45" stroke={INK} strokeWidth="2.6" />
                  <rect x="-17" y="-17.5" width="34" height="5" rx="2.5" fill="#FAFAFA" stroke={INK} strokeWidth="2.6" />
                </g>
              )}

              {/* FOREGROUND WRAPPED FINGERS + THUMB (makes prop genuinely held inside fist!) */}
              <g>
                <rect x={gripX - 10} y={gripY - 8} width="13" height="6.5" rx="3.2" fill={p.skinBase} stroke={INK} strokeWidth="2.3" />
                <rect x={gripX - 11} y={gripY - 1.5} width="14" height="6.5" rx="3.2" fill={p.skinBase} stroke={INK} strokeWidth="2.3" />
                <rect x={gripX - 10} y={gripY + 5} width="13" height="6.5" rx="3.2" fill={p.skinBase} stroke={INK} strokeWidth="2.3" />
                {/* Opposing thumb locking grip */}
                <path
                  d={`M ${gripX + 2} ${gripY - 9} C ${gripX + 9} ${gripY - 9}, ${gripX + 10} ${gripY - 1}, ${gripX + 3} ${gripY + 2} Z`}
                  fill={p.skinBase}
                  stroke={INK}
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          )}
        </g>

        {/* Sleepy Floating Zzz */}
        {mood === "sleepy" && !lockedSilhouette && (
          <g fill="#E4E4E7" fontWeight="900" fontFamily="sans-serif">
            <text x="164" y="46" fontSize="18" stroke={INK} strokeWidth="1">Z</text>
            <text x="179" y="32" fontSize="13" stroke={INK} strokeWidth="0.8">z</text>
            <text x="190" y="21" fontSize="10" stroke={INK} strokeWidth="0.6">z</text>
          </g>
        )}

        {/* Eating Snack Indicator */}
        {isEating && !lockedSilhouette && (
          <g transform="translate(22, 22)">
            <circle cx="16" cy="16" r="14" fill="#18181B" stroke="#FACC15" strokeWidth="2.2" />
            <path d="M 9 20 C 13 21, 20 17, 22 10 C 22 9, 20 8, 19 9 C 17 15, 13 17, 9 17 Z" fill="#FACC15" />
          </g>
        )}

        {/* Locked Pokémon-style Mystery Silhouette Overlay */}
        {lockedSilhouette && (
          <g>
            <circle cx="110" cy="110" r="20" fill="#18181B" stroke="#3F3F46" strokeWidth="2.5" />
            <text
              x="110"
              y="118"
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize="22"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              ?
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
