"use client";

import { useState, useEffect } from "react";

export interface KeyboardViewportState {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  viewportHeight: number;
}

/**
 * SSR-safe React hook that tracks mobile virtual keyboard appearance via window.visualViewport.
 * Updates dynamic CSS variables (--keyboard-height, --keyboard-inset-bottom) and returns the state
 * to keep sticky bottom bars, composers, and bottom sheets perfectly pinned above the keys on iOS and Android.
 */
export function useKeyboardViewport(): KeyboardViewportState {
  const [state, setState] = useState<KeyboardViewportState>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const vv = window.visualViewport;

    const handleResizeOrScroll = () => {
      // Available visual height excluding virtual keyboard
      const currentVisualHeight = vv.height;
      const windowInnerHeight = window.innerHeight;

      // Difference between layout viewport and visual viewport
      const heightDifference = Math.max(0, windowInnerHeight - currentVisualHeight);

      // On mobile devices, soft keyboards take at least 100px-350px.
      // A threshold of 60px avoids small URL bar collapses.
      const isVisible = heightDifference > 60;
      const effectiveKeyboardHeight = isVisible ? heightDifference : 0;

      // Update root CSS custom properties for GPU-accelerated styling
      document.documentElement.style.setProperty(
        "--keyboard-height",
        `${effectiveKeyboardHeight}px`
      );
      document.documentElement.style.setProperty(
        "--keyboard-inset-bottom",
        `${effectiveKeyboardHeight}px`
      );

      setState({
        isKeyboardVisible: isVisible,
        keyboardHeight: effectiveKeyboardHeight,
        viewportHeight: currentVisualHeight,
      });
    };

    // Initial check
    handleResizeOrScroll();

    vv.addEventListener("resize", handleResizeOrScroll);
    vv.addEventListener("scroll", handleResizeOrScroll);

    return () => {
      vv.removeEventListener("resize", handleResizeOrScroll);
      vv.removeEventListener("scroll", handleResizeOrScroll);
      document.documentElement.style.setProperty("--keyboard-height", "0px");
      document.documentElement.style.setProperty("--keyboard-inset-bottom", "0px");
    };
  }, []);

  return state;
}
