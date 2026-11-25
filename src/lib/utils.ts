export { cn } from "cn";

export function formatWeight(kg: number): string {
  return `${Number(kg.toFixed(1))} kg`;
}

export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  // Epley formula: Weight * (1 + 0.0333 * reps)
  const estimated = weightKg * (1 + 0.0333 * reps);
  return Math.round(estimated * 10) / 10;
}
