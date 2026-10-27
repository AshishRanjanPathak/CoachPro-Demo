import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(kg: number): string {
  return `${kg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg`;
}

export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  // Brzycki formula: Weight * (36 / (37 - reps)) for reps <= 10; Epley formula: Weight * (1 + 0.0333 * reps)
  const estimated = weightKg * (1 + 0.0333 * reps);
  return Math.round(estimated * 10) / 10;
}
