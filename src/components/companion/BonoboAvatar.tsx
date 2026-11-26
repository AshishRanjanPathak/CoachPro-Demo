"use client";

import React, { useId, useState } from "react";
import { CompanionMood, CompanionHeadwear, CompanionProp } from "@/lib/companion";
import { soundController } from "@/lib/audio";

interface BonoboAvatarProps {
  mood?: CompanionMood;
  headwear?: CompanionHeadwear;
  prop?: CompanionProp;
  isEating?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

function getMoodIllustration(mood: CompanionMood): string {
  switch (mood) {
    case "pumped":
    case "focused":
      return "/companion/bonobo-pumped.png";
    case "caring":
    case "sleepy":
      return "/companion/bonobo-recovery.png";
    case "celebrating":
      return "/companion/bonobo-celebration.png";
    default:
      return "/companion/bonobo-welcoming.png";
  }
}

interface CompanionAccessoriesLayerProps {
  uid: string;
  mood: CompanionMood;
  headwear: CompanionHeadwear;
  prop: CompanionProp;
  isEating: boolean;
}

/**
 * Aligned 3D-shaded SVG accessory and micro-feedback layer calibrated to the
 * 1:1 symmetrical Nano Banana chest-up portrait coordinates (0..200 viewBox).
 */
function CompanionAccessoriesLayer({
  uid,
  mood,
  headwear,
  prop,
  isEating,
}: CompanionAccessoriesLayerProps) {
  const dropShadowId = `${uid}-shadow`;
  const headbandGradId = `${uid}-hb-grad`;
  const headbandHighlightId = `${uid}-hb-hi`;
  const beanieDomeId = `${uid}-beanie-dome`;
  const beanieCuffId = `${uid}-beanie-cuff`;
  const pompomId = `${uid}-pompom`;
  const crownGoldId = `${uid}-crown-gold`;
  const crownRimId = `${uid}-crown-rim`;
  const dbBarId = `${uid}-db-bar`;
  const dbPlateId = `${uid}-db-plate`;
  const bananaGradId = `${uid}-banana`;
  const latteGradId = `${uid}-latte`;

  return (
    <>
      <defs>
        <filter id={dropShadowId} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* Retro red athletic headband */}
        <linearGradient id={headbandGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="22%" stopColor="#DC2626" />
          <stop offset="46%" stopColor="#F87171" />
          <stop offset="72%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id={headbandHighlightId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Knit monochrome athletic beanie */}
        <radialGradient id={beanieDomeId} cx="46%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="55%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#121215" />
        </radialGradient>
        <linearGradient id={beanieCuffId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#18181B" />
          <stop offset="30%" stopColor="#3F3F46" />
          <stop offset="52%" stopColor="#52525B" />
          <stop offset="76%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#18181B" />
        </linearGradient>
        <radialGradient id={pompomId} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </radialGradient>

        {/* Beveled champagne-gold champion crown */}
        <linearGradient id={crownGoldId} x1="0%" y1="0%" x2="100%" y2="12%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="48%" stopColor="#FEF08A" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id={crownRimId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Studio-lit dumbbell */}
        <linearGradient id={dbBarId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="45%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#52525B" />
        </linearGradient>
        <linearGradient id={dbPlateId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="45%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>

        {/* Ripe studio banana */}
        <linearGradient id={bananaGradId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="48%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Iced latte */}
        <linearGradient id={latteGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7D3BC" />
          <stop offset="45%" stopColor="#B07D52" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>

      {/* --- HEADWEAR (calibrated to 1:1 head contour y=19..62, x=66..134) --- */}
      {headwear === "red_headband" && (
        <g filter={`url(#${dropShadowId})`}>
          {/* Curved athletic headband wrapping snugly above the brow ridge */}
          <path
            d="M 69 55.5 Q 100 51.5 131 55.5 L 133 63 Q 100 59 67 63 Z"
            fill={`url(#${headbandGradId})`}
          />
          {/* Top sheen edge */}
          <path
            d="M 69 55.5 Q 100 51.5 131 55.5 L 131.6 57.5 Q 100 53.5 68.4 57.5 Z"
            fill={`url(#${headbandHighlightId})`}
          />
          {/* Crisp white varsity center stripe */}
          <path
            d="M 68.2 58.3 Q 100 54.3 131.8 58.3 L 132.3 60.4 Q 100 56.4 67.7 60.4 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />
        </g>
      )}

      {headwear === "beanie" && (
        <g filter={`url(#${dropShadowId})`}>
          {/* Knit pom-pom nestled directly into crown crest */}
          <circle cx="100" cy="26.5" r="6.5" fill={`url(#${pompomId})`} />
          {/* Sculpted crown dome covering upper hair cleanly without gaps */}
          <path
            d="M 67.5 55.5 C 67.5 21, 132.5 21, 132.5 55.5 Z"
            fill={`url(#${beanieDomeId})`}
          />
          {/* Subtle vertical knit dome ribs */}
          <g stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" fill="none">
            <path d="M 100 28 L 100 51" />
            <path d="M 91 30 C 87 37, 85 44, 84 52" />
            <path d="M 109 30 C 113 37, 115 44, 116 52" />
            <path d="M 81 34 C 76 40, 74 45, 73 53" />
            <path d="M 119 34 C 124 40, 126 45, 127 53" />
          </g>
          {/* Folded ribbed cuff hugging forehead hairline (x=66..134 @ y=63) */}
          <path
            d="M 66.5 54.5 Q 100 49.5 133.5 54.5 L 133.2 63 Q 100 58 66.8 63 Z"
            fill={`url(#${beanieCuffId})`}
            stroke="#52525B"
            strokeOpacity="0.45"
            strokeWidth="0.6"
          />
          {/* Cuff rib stitches */}
          <g stroke="#101012" strokeOpacity="0.55" strokeWidth="1.2">
            <line x1="73" y1="53.5" x2="73.3" y2="62" />
            <line x1="81" y1="52.5" x2="81" y2="61" />
            <line x1="89" y1="51.5" x2="89" y2="60" />
            <line x1="97" y1="51" x2="97" y2="59.5" />
            <line x1="103" y1="51" x2="103" y2="59.5" />
            <line x1="111" y1="51.5" x2="111" y2="60" />
            <line x1="119" y1="52.5" x2="119" y2="61" />
            <line x1="127" y1="53.5" x2="126.7" y2="62" />
          </g>
        </g>
      )}

      {headwear === "gold_crown" && (
        <g filter={`url(#${dropShadowId})`}>
          {/* Dark recessed inner crown cup for 3D depth */}
          <path
            d="M 83 45 L 86 31 L 94 37 L 100 26 L 106 37 L 114 31 L 117 45 Z"
            fill="#451A03"
          />
          {/* Narrower beveled gold crown seated flush on top fur arch (x=81..119 @ y=46..48) */}
          <path
            d="M 81 46.5 L 82.5 27 L 91 37 L 100 21 L 109 37 L 117.5 27 L 119 46.5 Q 100 49.5 81 46.5 Z"
            fill={`url(#${crownGoldId})`}
            stroke="#FDE047"
            strokeOpacity="0.55"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Base band rim */}
          <path
            d="M 81 43 Q 100 46 119 43 L 119 46.5 Q 100 49.5 81 46.5 Z"
            fill={`url(#${crownRimId})`}
          />
          {/* Point finial spheres */}
          <circle cx="82.5" cy="26.5" r="2.0" fill="#FDE047" />
          <circle cx="100" cy="20.5" r="2.5" fill="#FEF08A" />
          <circle cx="117.5" cy="26.5" r="2.0" fill="#FDE047" />
          {/* Inset bezel jewels */}
          <circle cx="90" cy="43" r="1.8" fill="#EF4444" stroke="#78350F" strokeWidth="0.7" />
          <circle cx="100" cy="43.5" r="2.3" fill="#FAFAFA" stroke="#78350F" strokeWidth="0.8" />
          <circle cx="110" cy="43" r="1.8" fill="#10B981" stroke="#78350F" strokeWidth="0.7" />
        </g>
      )}

      {/* --- HANDHELD PROPS (lower-right foreground x=132..188, y=132..190) --- */}
      {prop === "tiny_dumbbell" && (
        <g transform="translate(157, 163) rotate(-28)" filter={`url(#${dropShadowId})`}>
          {/* Knurled chrome bar */}
          <rect x="-15" y="-3" width="30" height="6" rx="3" fill={`url(#${dbBarId})`} />
          {/* Matte urethane weight plates (left & right stacks) */}
          <rect x="-24" y="-12" width="10" height="24" rx="3" fill={`url(#${dbPlateId})`} stroke="#71717A" strokeWidth="0.7" />
          <rect x="-28" y="-9" width="5" height="18" rx="2" fill={`url(#${dbPlateId})`} stroke="#71717A" strokeWidth="0.6" />
          <rect x="14" y="-12" width="10" height="24" rx="3" fill={`url(#${dbPlateId})`} stroke="#71717A" strokeWidth="0.7" />
          <rect x="23" y="-9" width="5" height="18" rx="2" fill={`url(#${dbPlateId})`} stroke="#71717A" strokeWidth="0.6" />
          {/* Chrome end caps */}
          <circle cx="-27" cy="0" r="1.5" fill="#E4E4E7" />
          <circle cx="27" cy="0" r="1.5" fill="#E4E4E7" />
        </g>
      )}

      {prop === "banana" && (
        <g transform="translate(132, 134)" filter={`url(#${dropShadowId})`}>
          <path
            d="M 10 42 C 18 45, 39 36, 46 13 C 47 10, 44 8, 41 10 C 35 24, 23 32, 11 33 C 7 34, 6 40, 10 42 Z"
            fill={`url(#${bananaGradId})`}
            stroke="#A16207"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Peel ridge specular highlight */}
          <path
            d="M 14 38 C 24 38, 36 30, 42 15"
            stroke="#FEF9C3"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          {/* Stem & tip */}
          <path d="M 41 10 L 45 5 L 47 7 L 45 12 Z" fill="#713F12" />
          <circle cx="8.5" cy="38.5" r="1.8" fill="#713F12" />
        </g>
      )}

      {prop === "iced_coffee" && (
        <g transform="translate(141, 132)" filter={`url(#${dropShadowId})`}>
          {/* Stainless straw */}
          <path d="M 22 4 L 18 22" stroke="#E4E4E7" strokeWidth="2.8" strokeLinecap="round" />
          {/* Cup body */}
          <polygon
            points="6,20 32,20 27,54 11,54"
            fill={`url(#${latteGradId})`}
            stroke="#FFFFFF"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          {/* Cream swirl */}
          <path d="M 8 27 Q 19 32 30 26 L 29 35 Q 19 39 9 35 Z" fill="#F5EBDD" fillOpacity="0.55" />
          {/* Translucent ice cubes */}
          <rect x="11" y="21" width="7" height="7" rx="1.5" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-10 14 24)" />
          <rect x="20" y="22" width="7" height="7" rx="1.5" fill="#FFFFFF" fillOpacity="0.4" transform="rotate(12 23 25)" />
          {/* Dome lid & collar */}
          <path d="M 7 18 C 7 10, 31 10, 31 18 Z" fill="#FFFFFF" fillOpacity="0.28" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.9" />
          <rect x="4.5" y="17.5" width="29" height="3.8" rx="1.8" fill="#FAFAFA" />
        </g>
      )}

      {/* --- LIVE FEEDBACK BADGES --- */}
      {mood === "sleepy" && (
        <g className="text-zinc-300 font-black" opacity="0.85">
          <text x="150" y="42" fill="currentColor" fontSize="14">Z</text>
          <text x="162" y="30" fill="currentColor" fontSize="10">z</text>
          <text x="171" y="21" fill="currentColor" fontSize="8">z</text>
        </g>
      )}

      {isEating && (
        <g transform="translate(22, 22)" filter={`url(#${dropShadowId})`}>
          <circle cx="14" cy="14" r="13" fill="#18181B" fillOpacity="0.88" stroke="#FACC15" strokeWidth="1.2" />
          <path
            d="M 8 18 C 11 19, 18 16, 20 9 C 20 8, 19 7, 18 8 C 16 13, 12 15, 8 15 Z"
            fill="#FACC15"
          />
        </g>
      )}
    </>
  );
}

export function BonoboAvatar({
  mood = "content",
  headwear = "red_headband",
  prop = "tiny_dumbbell",
  isEating = false,
  size = 140,
  className = "",
  onClick,
}: BonoboAvatarProps) {
  const [bouncing, setBouncing] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const uid = useId();

  const illustrationSrc = getMoodIllustration(mood);
  const imgError = failedSrc === illustrationSrc;

  const handleClick = () => {
    setBouncing(true);
    soundController.playPop();
    setTimeout(() => setBouncing(false), 220);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Bonobo companion avatar"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#121212] border border-border/70 cursor-pointer select-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] ${
        bouncing ? "scale-[1.03]" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError && illustrationSrc ? (
        <>
          <img
            src={illustrationSrc}
            alt={`Bonobo ${mood}`}
            loading="eager"
            decoding="async"
            onError={() => setFailedSrc(illustrationSrc)}
            className="w-full h-full object-cover select-none"
          />
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <CompanionAccessoriesLayer
              uid={uid}
              mood={mood}
              headwear={headwear}
              prop={prop}
              isEating={isEating}
            />
          </svg>
        </>
      ) : (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fallback vector portrait aligned to identical 0..200 head coordinates */}
          <ellipse cx="100" cy="182" rx="56" ry="10" fill="currentColor" className="text-black/30" />
          <path
            d="M46 196 C48 136 68 122 100 122 C132 122 152 136 154 196 Z"
            fill="#3E2723"
          />
          <circle cx="66" cy="76" r="12" fill="#3E2723" />
          <circle cx="67" cy="76" r="7" fill="#D7CCC8" />
          <circle cx="134" cy="76" r="12" fill="#3E2723" />
          <circle cx="133" cy="76" r="7" fill="#D7CCC8" />
          <circle cx="100" cy="78" r="35" fill="#3E2723" />
          <ellipse cx="100" cy="92" rx="24" ry="18" fill="#D7CCC8" />
          <ellipse cx="95" cy="86" rx="2.2" ry="3" fill="#5D4037" />
          <ellipse cx="105" cy="86" rx="2.2" ry="3" fill="#5D4037" />

          {mood === "sleepy" ? (
            <g stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round">
              <path d="M84 72 Q90 76 96 72" />
              <path d="M104 72 Q110 76 116 72" />
            </g>
          ) : (
            <g>
              <circle cx="90" cy="72" r="5" fill="#212121" />
              <circle cx="88.8" cy="70.5" r="1.8" fill="#FFFFFF" />
              <circle cx="110" cy="72" r="5" fill="#212121" />
              <circle cx="108.8" cy="70.5" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          <path d="M90 98 Q100 105 110 98" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />

          <CompanionAccessoriesLayer
            uid={uid}
            mood={mood}
            headwear={headwear}
            prop={prop}
            isEating={isEating}
          />
        </svg>
      )}
    </div>
  );
}
