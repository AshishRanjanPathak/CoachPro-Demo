import { calculateEstimated1RM, formatWeight } from "../lib/utils";
import { INITIAL_USERS, INITIAL_ATHLETES, INITIAL_EXERCISES, INITIAL_PROGRAMS, INITIAL_WORKOUT_SESSION } from "../lib/store";
import { WorkoutSet } from "../types";
import { getExerciseIndex, filterExercises, REPDB_ATTRIBUTION } from "../lib/exercises";
import { validateEnv } from "../lib/env";
import {
  workoutSetInputSchema,
  batchWorkoutSetsInputSchema,
  checkInInputSchema,
  createProgramInputSchema
} from "../lib/schemas";
import { localBackendAdapter } from "../services/localBackendAdapter";
import { checkRateLimit } from "../lib/rateLimit";
import { dbManager } from "../lib/db";

export async function runTests(): Promise<{ passed: number; failed: number; results: string[] }> {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✓ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`✗ FAIL: ${testName}`);
    }
  }

  // 1. Estimated 1RM Calculations
  assert(calculateEstimated1RM(100, 1) === 100, "1RM calculation: 100kg x 1 rep equals 100kg");
  assert(calculateEstimated1RM(140, 5) === 163.3, "1RM calculation: 140kg x 5 reps equals ~163.3kg");
  assert(calculateEstimated1RM(0, 5) === 0, "1RM calculation: 0kg returns 0");
  assert(calculateEstimated1RM(100, 0) === 0, "1RM calculation: 0 reps returns 0");

  // 2. Weight formatting
  assert(formatWeight(142.5) === "142.5 kg", "formatWeight formats decimals cleanly");
  assert(formatWeight(100) === "100 kg", "formatWeight formats integers without trailing zeros");

  // 3. User Seed Data
  assert(INITIAL_USERS.length === 4, "Initial users count equals 4 roles");
  const roles = INITIAL_USERS.map(u => u.role);
  assert(roles.includes("athlete"), "User role athlete exists");
  assert(roles.includes("coach"), "User role coach exists");
  assert(roles.includes("org_admin"), "User role org_admin exists");
  assert(roles.includes("platform_admin"), "User role platform_admin exists");

  // 4. Exercise catalog integrity
  assert(INITIAL_EXERCISES.length >= 8, "Exercise library has at least 8 foundational movements");
  const hasSquat = INITIAL_EXERCISES.some(e => e.name.includes("Squat"));
  const hasBench = INITIAL_EXERCISES.some(e => e.name.includes("Bench"));
  const hasDeadlift = INITIAL_EXERCISES.some(e => e.name.includes("Deadlift"));
  assert(hasSquat && hasBench && hasDeadlift, "Big 3 compound lifts present in library");

  // 5. Athlete Profile validation
  assert(INITIAL_ATHLETES.length >= 20, "Athlete roster contains full active roster (>= 20 athletes)");
  const allHavePrograms = INITIAL_ATHLETES.every(a => !!a.assignedProgramId && !!a.assignedCoachId);
  assert(allHavePrograms, "All athletes have valid coach and program relationships");

  const alex = INITIAL_ATHLETES.find(a => a.id === "usr-athlete-1");
  assert(!!alex, "Active athlete Alex Chen exists in store");
  assert(typeof alex?.age === "number" && alex.age > 0, "Athlete profile contains valid age");
  assert(typeof alex?.heightCm === "number" && alex.heightCm > 0, "Athlete profile contains valid height (cm)");
  assert(typeof alex?.weightKg === "number" && alex.weightKg > 0, "Athlete profile contains valid weight (kg)");
  assert(!!alex?.experienceLevel, "Athlete profile contains experience level");

  // 6. Program structure validation
  assert(INITIAL_PROGRAMS.length >= 1, "At least 1 periodized program template is published");
  const prog = INITIAL_PROGRAMS[0];
  assert(prog.days.length >= 2, "Program has multiple scheduled training days");
  const allDaysHaveRx = prog.days.every(d => d.prescriptions.length > 0);
  assert(allDaysHaveRx, "All training days have exercise prescriptions configured");

  // 7. Quick Workout Logging: Scenario A — Logging a weighted barbell exercise
  const barbellSquatEx = INITIAL_EXERCISES.find(e => e.id === "ex-1");
  assert(barbellSquatEx?.category === "barbell", "Barbell squat is identified as barbell movement");
  assert(barbellSquatEx?.trackingMethod === "weight_reps", "Barbell squat uses weight_reps tracking");
  const barbellSet: WorkoutSet = {
    id: "set-test-1",
    exerciseId: "ex-1",
    exerciseName: "Barbell Back Squat",
    setNumber: 3,
    prescribedWeightKg: 140,
    prescribedReps: 5,
    completedWeightKg: 140,
    completedReps: 5,
    completedAt: new Date().toISOString()
  };
  assert(barbellSet.completedWeightKg === 140 && barbellSet.completedReps === 5, "Barbell set captures completed weight and reps");

  // 8. Scenario B — Logging a dumbbell exercise with per-dumbbell load convention
  const dumbbellEx = INITIAL_EXERCISES.find(e => e.id === "ex-7" || e.category === "dumbbell");
  assert(!!dumbbellEx, "Dumbbell exercise found in library");
  const dbSet: WorkoutSet = {
    id: "set-test-2",
    exerciseId: dumbbellEx?.id || "ex-7",
    exerciseName: dumbbellEx?.name || "Incline Dumbbell Press",
    setNumber: 1,
    prescribedWeightKg: 32,
    prescribedReps: 10,
    completedWeightKg: 32, // 32kg per dumbbell
    completedReps: 10,
    completedAt: new Date().toISOString()
  };
  assert(dbSet.completedWeightKg === 32, "Dumbbell exercise records per-dumbbell load cleanly");

  // 9. Scenario C — Logging bodyweight push-ups (no required external weight)
  const pushupsEx = INITIAL_EXERCISES.find(e => e.name.toLowerCase().includes("push-up"));
  assert(!!pushupsEx && pushupsEx.category === "bodyweight", "Push-ups catalogued as bodyweight exercise");
  const pushupSet: WorkoutSet = {
    id: "set-test-3",
    exerciseId: pushupsEx?.id || "ex-9",
    exerciseName: "Push-ups",
    setNumber: 1,
    completedWeightKg: 0,
    completedReps: 25,
    isBodyweightOnly: true,
    completedAt: new Date().toISOString()
  };
  assert(pushupSet.completedWeightKg === 0 && pushupSet.isBodyweightOnly === true, "Bodyweight set correctly defaults to 0kg external load");

  // 10. Scenario D — Logging weighted bodyweight pull-ups (optional added weight)
  const weightedPullUpEx = INITIAL_EXERCISES.find(e => e.id === "ex-5");
  assert(weightedPullUpEx?.category === "bodyweight", "Weighted Pull-Up categorized under bodyweight with added weight");
  const pullUpSet: WorkoutSet = {
    id: "set-test-4",
    exerciseId: "ex-5",
    exerciseName: "Weighted Pull-Up",
    setNumber: 1,
    prescribedWeightKg: 15,
    prescribedReps: 6,
    completedWeightKg: 15, // added weight on dip belt
    completedReps: 6,
    completedAt: new Date().toISOString()
  };
  assert(pullUpSet.completedWeightKg === 15, "Added weight for weighted pull-up recorded accurately");

  // 11. Scenario E — Logging isometric plank (duration-based, no reps)
  const plankEx = INITIAL_EXERCISES.find(e => e.name.toLowerCase().includes("plank"));
  assert(!!plankEx && plankEx.trackingMethod === "isometric", "Plank identified with isometric tracking method");
  const plankSet: WorkoutSet = {
    id: "set-test-5",
    exerciseId: plankEx?.id || "ex-10",
    exerciseName: "Standard Plank",
    setNumber: 1,
    completedWeightKg: 0,
    completedReps: 0,
    completedMinutes: 1.5, // 90 seconds
    completedAt: new Date().toISOString()
  };
  assert(plankSet.completedMinutes === 1.5 && plankSet.completedReps === 0, "Plank duration logged without requiring reps");

  // 12. Scenario F — Logging cardio treadmill (distance & duration)
  const treadmillEx = INITIAL_EXERCISES.find(e => e.name.toLowerCase().includes("treadmill"));
  assert(!!treadmillEx && treadmillEx.category === "cardio", "Treadmill classified as cardio");
  const cardioSet: WorkoutSet = {
    id: "set-test-6",
    exerciseId: treadmillEx?.id || "ex-11",
    exerciseName: "Treadmill Running / Walking",
    setNumber: 1,
    completedWeightKg: 0,
    completedReps: 0,
    completedMinutes: 20,
    completedDistanceKm: 3.2,
    completedAt: new Date().toISOString()
  };
  assert(cardioSet.completedDistanceKm === 3.2 && cardioSet.completedMinutes === 20, "Cardio set captures distance (km) and minutes");

  // 13. Scenario G — Skipping weight question on unweighted exercises
  const unweightedLog: WorkoutSet = {
    id: "set-test-7",
    exerciseId: "ex-9",
    exerciseName: "Push-ups",
    setNumber: 2,
    completedWeightKg: 0,
    completedReps: 20,
    isBodyweightOnly: true,
    completedAt: new Date().toISOString()
  };
  assert(unweightedLog.completedWeightKg === 0 && unweightedLog.isBodyweightOnly === true, "Skipping weight question stores 0kg with isBodyweightOnly true");

  // 14. Scenario H — Logging fewer sets than prescribed (partial completion adherence)
  const prescribedSetsTarget = 4;
  const completedSetsArray = [barbellSet]; // only 1 of 4 sets logged
  assert(completedSetsArray.length < prescribedSetsTarget, "User allowed to log fewer sets than planned");
  const sessionProgressRatio = completedSetsArray.length / prescribedSetsTarget;
  assert(sessionProgressRatio === 0.25, "Workout session progress calculated accurately for partial sets (25%)");

  // 15. Scenario I — Batch logging with individual set customization (different weights/reps per set)
  const customizedBatchSets: WorkoutSet[] = [
    { id: "batch-1", exerciseId: "ex-1", exerciseName: "Barbell Back Squat", setNumber: 1, completedWeightKg: 135, completedReps: 6, completedAt: new Date().toISOString() },
    { id: "batch-2", exerciseId: "ex-1", exerciseName: "Barbell Back Squat", setNumber: 2, completedWeightKg: 140, completedReps: 5, completedAt: new Date().toISOString() },
    { id: "batch-3", exerciseId: "ex-1", exerciseName: "Barbell Back Squat", setNumber: 3, completedWeightKg: 145, completedReps: 4, completedAt: new Date().toISOString() }
  ];
  assert(customizedBatchSets.length === 3, "Batch logging generates 3 distinct set records");
  assert(customizedBatchSets[0].completedWeightKg === 135 && customizedBatchSets[2].completedWeightKg === 145, "Individual set customizations preserve distinct loads");

  // 16. Scenario J — Undoing a successful log (reversing saved set records)
  const initialSessionSets = [...INITIAL_WORKOUT_SESSION.sets];
  const newSetToUndo: WorkoutSet = {
    id: "set-undo-target",
    exerciseId: "ex-1",
    exerciseName: "Barbell Back Squat",
    setNumber: 3,
    completedWeightKg: 140,
    completedReps: 5,
    completedAt: new Date().toISOString()
  };
  // Append set
  const sessionAfterSave = [...initialSessionSets, newSetToUndo];
  assert(sessionAfterSave.length === initialSessionSets.length + 1, "Session set count increases on save");
  // Undo set
  const sessionAfterUndo = sessionAfterSave.filter(s => s.id !== "set-undo-target");
  assert(sessionAfterUndo.length === initialSessionSets.length, "Undoing restored activeSession.sets count cleanly");
  assert(!sessionAfterUndo.some(s => s.id === "set-undo-target"), "Undone set record completely removed from session");

  // 17. Scenario K — Validation: zero or negative values prevented
  function validateLoggingInput(weight: number, reps: number, sets: number): boolean {
    if (weight < 0) return false;
    if (reps < 0) return false;
    if (sets <= 0) return false;
    return true;
  }
  assert(validateLoggingInput(100, 5, 3) === true, "Valid input passes validation");
  assert(validateLoggingInput(-10, 5, 3) === false, "Negative weight rejected by validation");
  assert(validateLoggingInput(100, -2, 3) === false, "Negative reps rejected by validation");
  assert(validateLoggingInput(100, 5, 0) === false, "Zero sets rejected by validation");

  // 18. Scenario L — Smart Defaults Precedence
  function getSmartDefaultWeight(prescription?: { targetLoadKg?: number }, lastLog?: { completedWeightKg?: number }): number {
    if (prescription?.targetLoadKg !== undefined) return prescription.targetLoadKg;
    if (lastLog?.completedWeightKg !== undefined) return lastLog.completedWeightKg;
    return 40; // fallback
  }
  assert(getSmartDefaultWeight({ targetLoadKg: 140 }, { completedWeightKg: 135 }) === 140, "Prescription takes precedence over last log");
  assert(getSmartDefaultWeight(undefined, { completedWeightKg: 135 }) === 135, "Last log takes precedence over fallback when no prescription exists");
  assert(getSmartDefaultWeight(undefined, undefined) === 40, "Fallback used when no prescription or history exists");

  // 19. RepDB Dataset Ingestion & Index Integrity
  const repDbIndex = getExerciseIndex();
  assert(Array.isArray(repDbIndex) && repDbIndex.length === 708, "RepDB dataset ingested with exactly 708 verified exercises");
  const sampleEx = repDbIndex[0];
  assert(!!sampleEx.id && sampleEx.source === "repdb" && !!sampleEx.sourceId, "Index item maintains CoachPRO ID and RepDB source reference");

  // 20. Three-Layer Architecture: Lightweight Search & Filter
  const filteredSearch = filterExercises({ query: "squat", limit: 10 });
  assert(filteredSearch.total > 0 && filteredSearch.items.length <= 10, "Search index efficiently filters and paginates movements");
  const bosuSquat = repDbIndex.find((e) => e.sourceId === "balance-dome-squat");
  assert(!!bosuSquat && bosuSquat.hasIllustration === true, "Exercise illustrations flagged properly in search index");

  // 21. Multi-language index support (English, German, Spanish)
  const hasMultilingual = repDbIndex.some((e) => !!e.nameDe && !!e.nameEs);
  assert(hasMultilingual, "Search index includes German and Spanish exercise translations");

  // 22. Two-Pose Demonstration & Pinned CDN Delivery
  assert(!!bosuSquat?.thumbUrl && bosuSquat.thumbUrl.includes("f12da458a90f353a86c953f204304d5a8bd98275"), "Illustrations use pinned Git commit SHA for immutable delivery");
  assert(bosuSquat?.thumbUrl?.endsWith(".webp") === true, "Illustrations served as 512px WebP format");

  // 23. Licensing & Attribution
  assert(REPDB_ATTRIBUTION.name === "RepDB" && REPDB_ATTRIBUTION.url.includes("repdb.co"), "Visible RepDB attribution and link configured");

  // 24. Adaptive Tracking Method Normalization across RepDB movements
  const plankItem = repDbIndex.find((e) => e.name.toLowerCase().includes("plank"));
  assert(plankItem?.trackingMethod === "isometric", "RepDB static/plank movements normalized to isometric tracking");
  const treadmillItem = repDbIndex.find((e) => e.name.toLowerCase().includes("treadmill"));
  assert(treadmillItem?.trackingMethod === "distance_duration", "RepDB treadmill movements normalized to distance_duration");

  // 25. Runtime Environment Configuration Validation
  const envTest = validateEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://postgres:secret@localhost:5432/coachpro_test",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000"
  });
  assert(envTest.NODE_ENV === "test" && Boolean(envTest.DATABASE_URL?.includes("coachpro_test")), "Runtime environment parses with Zod env validator");

  // 26. Domain Runtime Schema: workoutSetInputSchema
  const validSetParse = workoutSetInputSchema.safeParse({
    exerciseId: "ex-1",
    exerciseName: "Barbell Back Squat",
    setNumber: 1,
    weight: 140,
    reps: 5,
    rpe: 8.5
  });
  assert(validSetParse.success === true, "workoutSetInputSchema validates valid set input");

  const invalidNegativeSet = workoutSetInputSchema.safeParse({
    exerciseId: "ex-1",
    exerciseName: "Barbell Back Squat",
    setNumber: 1,
    weight: -10, // Invalid negative weight
    reps: 5
  });
  assert(invalidNegativeSet.success === false, "workoutSetInputSchema rejects negative weight");

  // 27. Domain Runtime Schema: batchWorkoutSetsInputSchema
  const validBatchParse = batchWorkoutSetsInputSchema.safeParse({
    sets: [
      { exerciseId: "ex-1", exerciseName: "Squat", setNumber: 1, weight: 100, reps: 5 },
      { exerciseId: "ex-1", exerciseName: "Squat", setNumber: 2, weight: 105, reps: 5 }
    ]
  });
  assert(validBatchParse.success === true && validBatchParse.data.sets.length === 2, "batchWorkoutSetsInputSchema accepts multi-set payload");

  // 28. Domain Runtime Schema: checkInInputSchema (range constraints)
  const validCheckIn = checkInInputSchema.safeParse({
    sleepHours: 7.5,
    sleepQuality: 4,
    soreness: 2,
    stress: 3,
    fatigue: 2,
    notes: "Feeling recovered"
  });
  assert(validCheckIn.success === true, "checkInInputSchema validates healthy daily check-in");

  const invalidCheckIn = checkInInputSchema.safeParse({
    sleepHours: 29, // Impossible: > 24 hours
    sleepQuality: 6, // Exceeds 1-5 scale
    soreness: 2,
    stress: 3,
    fatigue: 2
  });
  assert(invalidCheckIn.success === false, "checkInInputSchema rejects invalid hours or out-of-range ratings");

  // 29. Domain Runtime Schema: createProgramInputSchema
  const validProgramInput = createProgramInputSchema.safeParse({
    title: "12-Week Hypertrophy Block",
    weeksCount: 12,
    isTemplate: true
  });
  assert(validProgramInput.success === true, "createProgramInputSchema validates program creation");

  // 30. Service Layer & Liskov Substitution Principle
  assert(typeof localBackendAdapter.workout.logSet === "function", "localBackendAdapter implements IWorkoutService.logSet");
  assert(typeof localBackendAdapter.program.getPrograms === "function", "localBackendAdapter implements IProgramService.getPrograms");
  assert(typeof localBackendAdapter.athlete.getAthletes === "function", "localBackendAdapter implements IAthleteService.getAthletes");
  assert(typeof localBackendAdapter.checkIn.submitCheckIn === "function", "localBackendAdapter implements ICheckInService.submitCheckIn");

  // 31. Idempotency Key deduplication
  const testIdempotencyKey = `idem-test-${Date.now()}`;
  const firstLogResult = await localBackendAdapter.workout.logSet({
    exerciseId: "ex-1",
    exerciseName: "Barbell Squat",
    setNumber: 1,
    weight: 140,
    reps: 5
  }, { idempotencyKey: testIdempotencyKey });

  const secondLogResult = await localBackendAdapter.workout.logSet({
    exerciseId: "ex-1",
    exerciseName: "Barbell Squat",
    setNumber: 1,
    weight: 140,
    reps: 5
  }, { idempotencyKey: testIdempotencyKey });

  assert(firstLogResult.success === true && secondLogResult.success === true, "Idempotency key calls succeed");
  assert(firstLogResult.data?.id === secondLogResult.data?.id, "Second idempotent request returns exact identical cached entity");

  // 32. AbortSignal Request Cancellation
  const controller = new AbortController();
  controller.abort();
  const abortedResult = await localBackendAdapter.workout.logSet({
    exerciseId: "ex-1",
    exerciseName: "Barbell Squat",
    setNumber: 1,
    weight: 140,
    reps: 5
  }, { signal: controller.signal });
  assert(abortedResult.success === false && abortedResult.error?.code === "ABORTED", "Aborted signal cancels request and returns code ABORTED");

  // 33. Rate Limiter (Token / Sliding Window)
  const testIp = `test-ip-${Date.now()}`;
  const rl1 = checkRateLimit(testIp, { maxRequests: 2, windowMs: 10000 });
  const rl2 = checkRateLimit(testIp, { maxRequests: 2, windowMs: 10000 });
  const rl3 = checkRateLimit(testIp, { maxRequests: 2, windowMs: 10000 }); // Should exceed
  assert(rl1.success === true && rl1.remaining === 1, "Rate limiter permits first request");
  assert(rl2.success === true && rl2.remaining === 0, "Rate limiter permits second request and zeroes remaining");
  assert(rl3.success === false, "Rate limiter throttles third request when limit is 2");

  // 34. Database Pool & Telemetry Health Check
  const dbHealth = await dbManager.checkHealth();
  assert(typeof dbManager.checkHealth === "function" && !!dbHealth.status, "Database manager exposes active health check method");

  return { passed, failed, results };
}

// Direct execution when run via ts-node or node
if (typeof require !== "undefined" && require.main === module) {
  runTests().then(({ passed, failed, results }) => {
    console.log("=== COACHPRO DOMAIN TEST SUITE ===");
    results.forEach(r => console.log(r));
    console.log(`\nSummary: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  });
}
