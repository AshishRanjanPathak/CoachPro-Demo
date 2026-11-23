"use client";

import React, { useState, useEffect } from "react";
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

export function BonoboAvatar({
  mood = "content",
  headwear = "red_headband",
  prop = "tiny_dumbbell",
  isEating = false,
  size = 140,
  className = "",
  onClick,
}: BonoboAvatarProps) {
  const [blinking, setBlinking] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Periodic eye blink (only runs when page is visible)
  useEffect(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setBouncing(true);
    soundController.playPop();
    setTimeout(() => setBouncing(false), 500);
    if (onClick) onClick();
  };

  const getMoodIllustration = () => {
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
  };

  const illustrationSrc = getMoodIllustration();

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Bonobo companion avatar"
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-300 ${
        bouncing ? "scale-110" : "hover:scale-105"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError && illustrationSrc ? (
        <img
          src={illustrationSrc}
          alt={`Bonobo ${mood}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain drop-shadow-md rounded-2xl select-none"
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* Soft Ambient Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="12" fill="currentColor" className="text-black/20" />

        {/* --- BODY --- */}
        {/* Torso */}
        <path
          d="M60 145 C60 115 75 105 100 105 C125 105 140 115 140 145 C140 170 125 180 100 180 C75 180 60 170 60 145 Z"
          fill="#3E2723"
        />
        {/* Chest / Belly Patch */}
        <path
          d="M75 142 C75 120 85 115 100 115 C115 115 125 120 125 142 C125 165 115 172 100 172 C85 172 75 165 75 142 Z"
          fill="#D7CCC8"
        />

        {/* --- EARS --- */}
        {/* Left Ear */}
        <circle cx="42" cy="78" r="22" fill="#3E2723" />
        <circle cx="44" cy="78" r="14" fill="#D7CCC8" />
        {/* Right Ear */}
        <circle cx="158" cy="78" r="22" fill="#3E2723" />
        <circle cx="156" cy="78" r="14" fill="#D7CCC8" />

        {/* --- HEAD --- */}
        <circle cx="100" cy="78" r="48" fill="#3E2723" />

        {/* Muzzle / Face Plate */}
        <ellipse cx="100" cy="88" rx="34" ry="24" fill="#D7CCC8" />

        {/* Nostrils */}
        <ellipse cx="94" cy="85" rx="2.5" ry="3.5" fill="#5D4037" />
        <ellipse cx="106" cy="85" rx="2.5" ry="3.5" fill="#5D4037" />

        {/* --- EYES --- */}
        {mood === "sleepy" ? (
          // Sleepy closed eye curves
          <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round">
            <path d="M78 68 Q86 73 94 68" />
            <path d="M106 68 Q114 73 122 68" />
          </g>
        ) : mood === "caring" ? (
          // Caring, gentle empathetic eyes
          <g>
            <circle cx="86" cy="68" r="7.5" fill="#212121" />
            <circle cx="84" cy="66" r="3" fill="#FFFFFF" />
            <circle cx="114" cy="68" r="7.5" fill="#212121" />
            <circle cx="112" cy="66" r="3" fill="#FFFFFF" />
            {/* Gentle reassuring eyebrow curves */}
            <path d="M78 59 Q86 63 94 60" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M106 60 Q114 63 122 59" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : mood === "focused" ? (
          // Focused workout gaze with athletic focus
          <g>
            <circle cx="86" cy="68" r="8" fill="#212121" />
            <circle cx="85" cy="66" r="2.5" fill="#FFFFFF" />
            <circle cx="114" cy="68" r="8" fill="#212121" />
            <circle cx="113" cy="66" r="2.5" fill="#FFFFFF" />
            {/* Determined brows */}
            <path d="M78 62 L94 65" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
            <path d="M122 62 L106 65" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : blinking ? (
          // Blinking closed lines
          <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round">
            <line x1="78" y1="68" x2="94" y2="68" />
            <line x1="106" y1="68" x2="122" y2="68" />
          </g>
        ) : (
          // Expressive eyes (Happy / Celebrating / Content)
          <g>
            {/* Left Eye */}
            <circle cx="86" cy="68" r="8" fill="#212121" />
            <circle cx="84" cy="65" r="3" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="114" cy="68" r="8" fill="#212121" />
            <circle cx="112" cy="65" r="3" fill="#FFFFFF" />
          </g>
        )}

        {/* --- MOUTH --- */}
        {isEating ? (
          // Munching open mouth with cheeks
          <g>
            <ellipse cx="100" cy="98" rx="10" ry="7" fill="#C62828" />
            <circle cx="78" cy="94" r="5" fill="#FF8A80" opacity="0.6" />
            <circle cx="122" cy="94" r="5" fill="#FF8A80" opacity="0.6" />
          </g>
        ) : mood === "pumped" || mood === "celebrating" ? (
          // Big excited grin
          <g>
            <path d="M88 95 Q100 108 112 95 Z" fill="#D32F2F" stroke="#3E2723" strokeWidth="2" />
            <circle cx="78" cy="92" r="5" fill="#FF8A80" opacity="0.7" />
            <circle cx="122" cy="92" r="5" fill="#FF8A80" opacity="0.7" />
          </g>
        ) : (
          // Gentle confident smile
          <path d="M92 95 Q100 102 108 95" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* --- ACCESSORIES: HEADWEAR --- */}
        {headwear === "red_headband" && (
          <g>
            {/* Retro 80s striped headband */}
            <path
              d="M56 54 C70 42 130 42 144 54 L142 62 C128 50 72 50 58 62 Z"
              fill="#EF4444"
            />
            {/* White center stripe */}
            <path
              d="M60 56 C74 46 126 46 140 56 L139 59 C126 50 74 50 61 59 Z"
              fill="#FFFFFF"
            />
          </g>
        )}

        {headwear === "gold_crown" && (
          <g filter="drop-shadow(0px 2px 4px rgba(234, 179, 8, 0.5))">
            {/* Shiny gold champion crown */}
            <polygon
              points="75,46 82,24 92,38 100,20 108,38 118,24 125,46"
              fill="#EAB308"
              stroke="#CA8A04"
              strokeWidth="2"
            />
            {/* Crown Jewels */}
            <circle cx="82" cy="27" r="2.5" fill="#EF4444" />
            <circle cx="100" cy="23" r="3" fill="#3B82F6" />
            <circle cx="118" cy="27" r="2.5" fill="#10B981" />
          </g>
        )}

        {headwear === "beanie" && (
          <g>
            {/* Cozy teal knit beanie */}
            <path
              d="M60 52 C65 24 135 24 140 52 Z"
              fill="#0D9488"
            />
            <rect x="58" y="50" width="84" height="10" rx="3" fill="#14B8A6" />
            {/* Pompom on top */}
            <circle cx="100" cy="24" r="8" fill="#F0FDFA" />
          </g>
        )}

        {/* --- ACCESSORIES: PROPS --- */}
        {prop === "tiny_dumbbell" && (
          <g transform="translate(130, 130) rotate(-15)">
            {/* Mini chrome dumbbell */}
            <rect x="15" y="10" width="22" height="4" rx="2" fill="#94A3B8" />
            <rect x="10" y="4" width="7" height="16" rx="2" fill="#475569" />
            <rect x="35" y="4" width="7" height="16" rx="2" fill="#475569" />
          </g>
        )}

        {prop === "banana" && (
          <g transform="translate(132, 132) rotate(20)">
            {/* Sweet ripe banana snack */}
            <path
              d="M10 25 C15 15 28 8 36 10 C32 18 24 28 12 30 Z"
              fill="#FACC15"
              stroke="#CA8A04"
              strokeWidth="1.5"
            />
            <circle cx="36" cy="10" r="2" fill="#713F12" />
          </g>
        )}

        {prop === "iced_coffee" && (
          <g transform="translate(132, 128)">
            {/* Tall iced coffee cup with straw */}
            <polygon points="12,12 28,12 25,32 15,32" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
            <rect x="10" y="10" width="20" height="3" rx="1" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
            {/* Straw */}
            <line x1="20" y1="5" x2="24" y2="15" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Sleep Zzz Floating Animation if sleepy */}
        {mood === "sleepy" && (
          <g className="animate-bounce text-indigo-400 font-black text-sm" opacity="0.8">
            <text x="145" y="45" fill="currentColor">Z</text>
            <text x="156" y="32" fill="currentColor" fontSize="10">z</text>
            <text x="165" y="22" fill="currentColor" fontSize="8">z</text>
          </g>
        )}
      </svg>
      )}
    </div>
  );
}
