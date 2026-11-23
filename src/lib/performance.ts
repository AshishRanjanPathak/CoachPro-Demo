/**
 * Mobile Performance Engine for Low-End / Budget Android Devices.
 * Detects device hardware capabilities, suppresses battery-draining continuous animations,
 * limits canvas particle allocations, and adapts rendering fidelity for 60fps responsiveness.
 */

import confetti from "canvas-confetti";

/**
 * Detects if the current client is a low-power, memory-constrained, or budget device.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  // Check hardware CPU cores (low-end devices typically have 4 or fewer cores)
  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 4) return true;

  // Check device memory in GB (supported in Chrome on Android)
  const memory = (navigator as any).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return true;

  // Check for reduced motion preference
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  return false;
}

/**
 * Checks whether user has requested reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Dispatches a lightweight, hardware-optimized confetti burst that avoids GPU stalls.
 * On budget mobile devices: scales particles down from 80-100 to 20-25 with short decay.
 * If prefers-reduced-motion is enabled: safely no-ops.
 */
export function triggerOptimizedConfetti(options?: confetti.Options): void {
  if (typeof window === "undefined" || prefersReducedMotion()) return;

  const lowEnd = isLowEndDevice();
  const baseCount = options?.particleCount || (lowEnd ? 20 : 45);
  const particleCount = lowEnd ? Math.min(25, baseCount) : Math.min(50, baseCount);

  try {
    confetti({
      ...options,
      particleCount,
      spread: options?.spread ? Math.min(options.spread, lowEnd ? 50 : 70) : 50,
      ticks: lowEnd ? 120 : 200, // Shorten particle lifetime on mobile to save memory
      origin: options?.origin || { y: 0.7 },
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if WebGL/Canvas is blocked
  }
}
