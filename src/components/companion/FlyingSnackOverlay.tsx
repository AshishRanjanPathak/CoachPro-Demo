"use client";

import React, { useState, useEffect } from "react";

interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  emoji: string;
}

export function FlyingSnackOverlay() {
  const [items, setItems] = useState<FlyingItem[]>([]);

  useEffect(() => {
    const handleFly = (e: Event) => {
      const custom = e as CustomEvent<{ startX?: number; startY?: number; emoji?: string }>;
      const startX = custom.detail?.startX ?? window.innerWidth / 2;
      const startY = custom.detail?.startY ?? window.innerHeight * 0.7;
      const emoji = custom.detail?.emoji ?? "🍌";

      const newItem: FlyingItem = {
        id: `snack-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        emoji,
      };

      setItems((prev) => [...prev, newItem]);

      // Remove after animation completes
      setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== newItem.id));
      }, 900);
    };

    window.addEventListener("coachpro_fly_snack", handleFly);
    return () => window.removeEventListener("coachpro_fly_snack", handleFly);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          className="absolute text-2xl select-none"
          style={{
            left: `${it.startX}px`,
            top: `${it.startY}px`,
            animation: "flyToBonobo 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
          }}
        >
          {it.emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes flyToBonobo {
          0% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -120px) scale(1.4) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -240px) scale(0.4) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
