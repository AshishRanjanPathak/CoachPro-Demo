"use client";

import gsap from "gsap";
import { isLowEndDevice } from "./performance";

/**
 * Checks whether the user has requested reduced motion.
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || isLowEndDevice();
}

export interface AnimateNumberOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  ease?: string;
}

/**
 * Smoothly tweens a DOM element's text content to a target numeric value.
 */
export function animateNumber(
  element: HTMLElement | null,
  endValue: number,
  options: AnimateNumberOptions = {}
): gsap.core.Tween | null {
  if (!element) return null;
  const {
    duration = 0.8,
    decimals = 0,
    prefix = "",
    suffix = "",
    ease = "power2.out"
  } = options;

  if (isReducedMotion()) {
    element.textContent = `${prefix}${endValue.toFixed(decimals)}${suffix}`;
    return null;
  }

  // Parse current value from text or default to 0
  const currentText = element.textContent?.replace(/[^0-9.-]/g, "") || "0";
  const startValue = parseFloat(currentText) || 0;
  const proxy = { value: startValue };

  return gsap.to(proxy, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      if (element) {
        element.textContent = `${prefix}${proxy.value.toFixed(decimals)}${suffix}`;
      }
    }
  });
}

export interface AnimatePathOptions {
  duration?: number;
  ease?: string;
}

/**
 * Animates an SVG path draw-in effect using strokeDasharray / strokeDashoffset.
 */
export function animateSvgPath(
  pathElement: SVGPathElement | null,
  options: AnimatePathOptions = {}
): gsap.core.Tween | null {
  if (!pathElement) return null;
  const { duration = 0.9, ease = "power2.out" } = options;

  if (isReducedMotion()) {
    gsap.set(pathElement, { strokeDashoffset: 0 });
    return null;
  }

  try {
    const length = pathElement.getTotalLength();
    gsap.set(pathElement, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    return gsap.to(pathElement, {
      strokeDashoffset: 0,
      duration,
      ease
    });
  } catch {
    return null;
  }
}

/**
 * Animates a staggered entrance for cards, dots, or list items.
 */
export function animateStagger(
  targets: gsap.DOMTarget,
  options: {
    y?: number;
    scale?: number;
    opacity?: number;
    stagger?: number;
    duration?: number;
    ease?: string;
  } = {}
): gsap.core.Tween | null {
  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  const {
    y = 12,
    scale = 1,
    opacity = 0,
    stagger = 0.04,
    duration = 0.45,
    ease = "power2.out"
  } = options;

  return gsap.fromTo(
    targets,
    { opacity, y, scale },
    { opacity: 1, y: 0, scale: 1, stagger, duration, ease }
  );
}
