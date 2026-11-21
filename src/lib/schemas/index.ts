import { z } from "zod";

/**
 * Zod Schemas for Runtime Validation.
 * Follows Fail-Fast principle: catches corrupt input data at system boundaries before persisting.
 */

export const workoutSetInputSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  exerciseName: z.string().min(1, "Exercise name is required"),
  setNumber: z.number().int().min(1, "Set number must be >= 1"),
  prescribedWeightKg: z.number().nonnegative().optional(),
  prescribedReps: z.union([z.string(), z.number()]).optional(),
  prescribedMinutes: z.number().nonnegative().optional(),
  completedWeightKg: z.number().nonnegative("Weight cannot be negative").optional(),
  weight: z.number().nonnegative("Weight cannot be negative").optional(),
  completedReps: z.number().int().nonnegative("Reps cannot be negative").optional(),
  reps: z.number().int().nonnegative("Reps cannot be negative").optional(),
  completedMinutes: z.number().nonnegative().optional(),
  completedDistanceKm: z.number().nonnegative().optional(),
  isBodyweightOnly: z.boolean().default(false),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().max(500).optional(),
  isPr: z.boolean().default(false),
}).transform((data) => {
  const completedWeight = data.completedWeightKg ?? data.weight ?? 0;
  const completedReps = data.completedReps ?? data.reps ?? 0;
  return {
    ...data,
    completedWeightKg: completedWeight,
    completedReps: completedReps,
  };
});

export const batchWorkoutSetsInputSchema = z.object({
  sets: z.array(workoutSetInputSchema).min(1, "At least one set is required"),
  idempotencyKey: z.string().optional(),
});

export const exercisePrescriptionInputSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, "Exercise ID is required"),
  exerciseName: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().min(1, "Sets must be at least 1").max(20),
  repTarget: z.union([z.string(), z.number()]),
  targetLoadKg: z.number().nonnegative().optional(),
  targetRpe: z.number().min(1).max(10).optional(),
  targetDurationMinutes: z.number().positive().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export const programDayInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Day name is required"),
  dayNumber: z.number().int().min(1),
  prescriptions: z.array(exercisePrescriptionInputSchema),
});

export const createProgramInputSchema = z.object({
  title: z.string().min(2, "Program title must be at least 2 characters").max(100),
  description: z.string().max(1000).default("Structured training block.").optional(),
  targetWeeks: z.number().int().min(1).max(52).optional(),
  weeksCount: z.number().int().min(1).max(52).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  isTemplate: z.boolean().default(false),
  days: z.array(programDayInputSchema).default([]),
}).transform((data) => ({
  ...data,
  description: data.description ?? "Structured training block.",
  targetWeeks: data.targetWeeks ?? data.weeksCount ?? 4,
  days: data.days ?? [],
}));

export const checkInInputSchema = z.object({
  readinessScore: z.number().min(1).max(10).default(8).optional(),
  fatigueLevel: z.enum(["low", "moderate", "high", "severe"]).optional(),
  fatigue: z.union([z.enum(["low", "moderate", "high", "severe"]), z.number()]).optional(),
  sorenessScore: z.number().int().min(1).max(5).optional(),
  soreness: z.number().int().min(1).max(5).optional(),
  sleepHours: z.number().min(0).max(24),
  hasInjury: z.boolean().default(false),
  injuryDetails: z.string().max(500).optional(),
  injuryLocation: z.string().max(200).optional(),
  injurySeverity: z.enum(["mild", "moderate", "severe"]).optional(),
  notes: z.string().max(500).optional(),
}).transform((data) => {
  const soreness = data.sorenessScore ?? data.soreness ?? 1;
  const fatigue = typeof data.fatigue === "string" ? data.fatigue : (data.fatigueLevel ?? "low");
  return {
    ...data,
    readinessScore: data.readinessScore ?? 8,
    sorenessScore: soreness,
    fatigueLevel: (["low", "moderate", "high", "severe"].includes(fatigue) ? fatigue : "low") as "low" | "moderate" | "high" | "severe",
  };
});

export const athleteProfileUpdateSchema = z.object({
  weightKg: z.number().min(20).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  age: z.number().int().min(10).max(120).optional(),
  experienceLevel: z.string().max(50).optional(),
  trainingGoal: z.string().max(100).optional(),
  squad: z.string().max(50).optional(),
});

export type WorkoutSetInput = z.input<typeof workoutSetInputSchema>;
export type WorkoutSetOutput = z.output<typeof workoutSetInputSchema>;
export type BatchWorkoutSetsInput = z.input<typeof batchWorkoutSetsInputSchema>;
export type CreateProgramInput = z.input<typeof createProgramInputSchema>;
export type CheckInInput = z.input<typeof checkInInputSchema>;
export type AthleteProfileUpdateInput = z.infer<typeof athleteProfileUpdateSchema>;
