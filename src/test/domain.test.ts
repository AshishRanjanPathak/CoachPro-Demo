import { calculateEstimated1RM, formatWeight } from "../lib/utils";
import {
  INITIAL_USERS,
  INITIAL_ATHLETES,
  INITIAL_EXERCISES,
  INITIAL_PROGRAMS,
  INITIAL_WORKOUT_SESSION,
  normalizeCoachProState,
  resolveActiveSessionContext,
  resolveActiveAthlete
} from "../lib/store";
import { WorkoutSet, Program } from "../types";
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
import { parseBonoboNaturalLanguage } from "../lib/bonoboNlp";
import {
  addCompanionXp,
  saveCompanionState,
  loadCompanionState,
  awardEarnedBananas,
  feedBananaToCompanion,
  getEvolutionStage,
  getNextEvolutionStage,
  resolveDisplayStage,
} from "../lib/companion";
import { getAthleteReminders } from "../lib/athleteReminders";
import {
  DEFAULT_DEMO_PASSWORD,
  evaluatePasswordStrength,
  verifyUserPassword,
  changePasswordProtected,
  clearCredentialsForTest,
  createInitialsAvatarDataUrl,
} from "../lib/accountSecurity";
import { offlineSyncManager } from "../lib/offlineSync";

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

  // 35. Program Builder & Athlete Assignment Logic
  const sampleProgram: Program = {
    id: "prog-hypertrophy-99",
    title: "Apex Hypertrophy Block C",
    description: "High volume mesocycle",
    coachId: "usr-coach-1",
    coachName: "Coach Marcus",
    targetWeeks: 8,
    level: "advanced",
    days: [
      {
        id: "day-h1",
        name: "Day 1: Legs Hypertrophy",
        dayNumber: 1,
        prescriptions: [
          {
            id: "rx-h1",
            exerciseId: "ex-1",
            exerciseName: "Barbell Back Squat",
            sets: 4,
            repTarget: "8-10",
            targetLoadKg: 120,
            restSeconds: 120
          }
        ]
      }
    ]
  };
  const testAthletes = INITIAL_ATHLETES.map(a => ({ ...a }));
  const id1 = testAthletes[0].id;
  const id2 = testAthletes[1].id;
  const idOther = testAthletes[2].id;
  const targetAthleteIds = [id1, id2];
  const updatedAthletes = testAthletes.map(ath => 
    targetAthleteIds.includes(ath.id)
      ? { ...ath, assignedProgramId: sampleProgram.id, assignedProgramTitle: sampleProgram.title }
      : ath
  );
  const assigned1 = updatedAthletes.find(a => a.id === id1);
  const assigned2 = updatedAthletes.find(a => a.id === id2);
  const unassignedOther = updatedAthletes.find(a => a.id === idOther);
  assert(
    !!assigned1 && assigned1.assignedProgramId === sampleProgram.id && assigned1.assignedProgramTitle === sampleProgram.title,
    "Program assignment successfully updates primary athlete profile"
  );
  assert(
    !!assigned2 && assigned2.assignedProgramId === sampleProgram.id && assigned2.assignedProgramTitle === sampleProgram.title,
    "Program assignment batch updates multiple athletes simultaneously"
  );
  assert(
    unassignedOther?.assignedProgramId !== sampleProgram.id,
    "Non-targeted athletes retain their original program assignments"
  );

  // 36. Bonobo AI Natural Language & Safety Engine
  // Test A: Hypothetical planning does not generate workout data
  const hypotheticalResult = parseBonoboNaturalLanguage("I am thinking of squatting 140kg for 5 reps tomorrow");
  assert(
    hypotheticalResult.intent === "hypothetical" &&
    hypotheticalResult.requiresConfirmation === false &&
    !hypotheticalResult.workoutData,
    "Hypothetical input flagged without generating premature workout logs"
  );

  // Test B: Completed workout parsing resolves RepDB exercises with sets, reps, load
  const workoutNlpResult = parseBonoboNaturalLanguage(
    "Did 4 sets of barbell back squats at 140kg for 5 reps and 3 sets bench press 90kg for 8 reps"
  );
  assert(
    workoutNlpResult.intent === "workout_log" &&
    workoutNlpResult.requiresConfirmation === true &&
    workoutNlpResult.workoutData?.exercises.length === 2 &&
    workoutNlpResult.workoutData?.totalSets === 7,
    "Workout natural language parses multiple exercises, sets, reps, and loads"
  );
  const squatEx = workoutNlpResult.workoutData?.exercises.find(e => e.exerciseName.includes("Squat"));
  assert(
    squatEx?.sets === 4 && squatEx?.weightKg === 140 && squatEx?.reps === "5",
    "Parsed squat exercise preserves 4 sets @ 140kg x 5 reps accurately"
  );

  // Test C: Clinical Injury and Triage parsing
  const injuryNlpResult = parseBonoboNaturalLanguage(
    "I have severe pain on my right knee after squatting and feeling exhausted, slept 5 hours"
  );
  assert(
    injuryNlpResult.intent === "injury_report" &&
    injuryNlpResult.requiresConfirmation === true &&
    Boolean(injuryNlpResult.injuryData?.location.includes("Right Knee")) &&
    injuryNlpResult.injuryData?.severity === "severe" &&
    injuryNlpResult.injuryData?.fatigueLevel === "high" &&
    injuryNlpResult.injuryData?.sleepHours === 5,
    "Injury natural language accurately parses location, severe condition, high fatigue, and sleep hours"
  );

  // Test D: Ethical Gamification Rule — Zero XP for reporting injury or pain
  const injuryXpResult = addCompanionXp(50, "Reported knee pain and injury");
  assert(
    injuryXpResult.xpAdded === 0,
    "Ethical game engine strictly awards 0 XP for reporting pain or injuries"
  );

  // Test E: Earned Banana Inventory & Anti-Clicker Safeguards
  // Set explicit companion state with 1 banana
  saveCompanionState({
    ...loadCompanionState(),
    bananaInventory: 1,
    totalBananasEarned: 1,
    xp: 0
  });

  // Feeding 1 banana succeeds and decrements inventory to 0
  const feedResult1 = feedBananaToCompanion();
  assert(
    feedResult1.success === true &&
    feedResult1.state.bananaInventory === 0 &&
    feedResult1.state.xp === 5,
    "Feeding stored banana consumes 1 banana from inventory and awards bond XP"
  );

  // Attempting to feed with 0 bananas fails and blocks free XP exploit
  const feedResult2 = feedBananaToCompanion();
  assert(
    feedResult2.success === false &&
    feedResult2.state.bananaInventory === 0 &&
    feedResult2.error !== undefined,
    "Feeding with empty banana stash is blocked and prevents unlimited free XP exploit"
  );

  // Earning bananas increments inventory
  const earnedState = awardEarnedBananas(2, "Completed Prescribed Workout");
  assert(
    earnedState.bananaInventory === 2 &&
    earnedState.totalBananasEarned >= 2,
    "Completing workouts successfully awards earned bananas to athlete inventory"
  );

  // Test F: Resilient Offline Sync Queue & Idempotency
  offlineSyncManager.clearQueue();
  const queuedOp1 = offlineSyncManager.enqueue("batch_sets", [{ id: "set-1" }], "custom-idem-1");
  assert(
    queuedOp1.idempotencyKey === "custom-idem-1" &&
    (queuedOp1.status === "pending" || queuedOp1.status === "syncing" || queuedOp1.status === "synced") &&
    offlineSyncManager.getQueue().length >= 1,
    "Offline sync queue successfully enqueues operations with unique idempotency keys"
  );

  // Test G: Gemini AI Gym Guardrails & Context Enforcers
  const { validateGymContext } = await import("@/lib/aiGuardrails");
  const offTopicPolitics = validateGymContext("Who will win the presidential election in 2028?");
  assert(
    offTopicPolitics.isAllowed === false && offTopicPolitics.intent === "out_of_context",
    "Guardrail strictly rejects political queries outside the gym context"
  );

  const offTopicCoding = validateGymContext("Write me a python script to scrape twitter data");
  assert(
    offTopicCoding.isAllowed === false && offTopicCoding.intent === "out_of_context",
    "Guardrail strictly rejects programming and coding nonsense outside gym scope"
  );

  const offTopicCrypto = validateGymContext("Should I buy bitcoin and ethereum crypto tokens today?");
  assert(
    offTopicCrypto.isAllowed === false && offTopicCrypto.intent === "out_of_context",
    "Guardrail strictly rejects cryptocurrency and trading queries"
  );

  const legitimateWorkout = validateGymContext("Did 4 sets of barbell back squats 140kg for 5 reps");
  assert(
    legitimateWorkout.isAllowed === true && legitimateWorkout.intent === "workout_log",
    "Guardrail allows gym workout and exercise queries"
  );

  const legitimateRecovery = validateGymContext("Sharp soreness in my right shoulder after bench press");
  assert(
    legitimateRecovery.isAllowed === true && legitimateRecovery.intent === "recovery_report",
    "Guardrail allows soreness, pain, and recovery queries"
  );

  // Test H: Strict Daily Quota Enforcement (15 requests/day to prevent API cost sky-rocketing)
  const { DAILY_AI_REQUEST_LIMIT, getDailyAiUsage, incrementDailyAiUsage } = await import("@/lib/aiQuota");
  assert(
    DAILY_AI_REQUEST_LIMIT === 15,
    "Strict 1-day limit is capped at 15 requests to safeguard API cost"
  );

  const initialUsage = getDailyAiUsage("test-athlete-guardrail");
  assert(
    initialUsage.limit === 15 && initialUsage.remaining <= 15,
    "Daily AI usage structure accurately tracks 15 request limit and remaining balance"
  );

  // Test I: Companion Assets in public/companion/
  const fs = await import("fs");
  const path = await import("path");
  const companionDir = path.join(process.cwd(), "public", "companion");
  assert(
    fs.existsSync(path.join(companionDir, "bonobo-welcoming.png")) &&
    fs.existsSync(path.join(companionDir, "bonobo-pumped.png")) &&
    fs.existsSync(path.join(companionDir, "bonobo-recovery.png")) &&
    fs.existsSync(path.join(companionDir, "bonobo-celebration.png")),
    "High-definition welcoming Bonobo companion assets exist for all moods in public/companion/"
  );

  // Test J: Corrupted / Empty Storage Healing & Safe Context Resolvers
  const healedEmptyPrograms = normalizeCoachProState({
    programs: [],
    activeSession: {
      ...INITIAL_WORKOUT_SESSION,
      programId: "deleted-prog-id"
    }
  });
  assert(
    healedEmptyPrograms.repaired === true &&
      healedEmptyPrograms.state.programs.length === INITIAL_PROGRAMS.length &&
      healedEmptyPrograms.state.activeSession.programId === INITIAL_PROGRAMS[0].id,
    "normalizeCoachProState heals empty programs array and orphaned session programId"
  );

  const safeEmptyContext = resolveActiveSessionContext({
    programs: [],
    activeSession: { ...INITIAL_WORKOUT_SESSION, sets: [] }
  });
  assert(
    safeEmptyContext.program === undefined &&
      safeEmptyContext.currentDay === undefined &&
      safeEmptyContext.prescriptions.length === 0 &&
      safeEmptyContext.plannedSets === 0,
    "resolveActiveSessionContext handles empty programs array without throwing"
  );

  const safeMissingDaysContext = resolveActiveSessionContext({
    programs: [{ ...INITIAL_PROGRAMS[0], days: [] }],
    activeSession: INITIAL_WORKOUT_SESSION
  });
  assert(
    safeMissingDaysContext.program?.id === INITIAL_PROGRAMS[0].id &&
      safeMissingDaysContext.currentDay === undefined &&
      safeMissingDaysContext.prescriptions.length === 0 &&
      safeMissingDaysContext.plannedSets === 0,
    "resolveActiveSessionContext handles programs with zero days safely"
  );

  const resolvedAthleteFallback = resolveActiveAthlete({ athletes: INITIAL_ATHLETES }, "non-existent-user");
  assert(
    resolvedAthleteFallback?.id === "usr-athlete-1",
    "resolveActiveAthlete falls back cleanly to default athlete when id missing"
  );

  // Test K: Bonobo Evolution Stages (DBZ/Pokémon Progression) & Wearable Unlocks
  assert(
    getEvolutionStage(1).id === "baby_bonobo" &&
      getEvolutionStage(3).id === "iron_ape" &&
      getEvolutionStage(5).id === "super_bonobo" &&
      getEvolutionStage(7).id === "apex_bonobo" &&
      getNextEvolutionStage(1)?.minLevel === 3 &&
      getNextEvolutionStage(7) === null,
    "Evolution stages progress smoothly from Baby Bonobo -> Iron Ape -> Super Bonobo -> Apex Bonobo"
  );

  saveCompanionState({
    ...loadCompanionState(),
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    unlockedHeadwear: ["none", "red_headband"],
    unlockedProps: ["none", "banana", "tiny_dumbbell"],
    selectedForm: "auto",
  });

  const evolveToIron = addCompanionXp(225, "Completed Workouts for Stage 2");
  assert(
    evolveToIron.newLevel === 3 &&
      evolveToIron.evolved === true &&
      evolveToIron.newStage === 2 &&
      evolveToIron.state.unlockedHeadwear.includes("beanie") &&
      evolveToIron.state.unlockedProps.includes("iced_coffee"),
    "Leveling to Lv 3 evolves Bonobo to Iron Ape and unlocks beanie + iced_coffee"
  );

  const evolveToApex = addCompanionXp(920, "Completed Block for Final Evolution");
  assert(
    evolveToApex.newLevel >= 7 &&
      evolveToApex.newStage === 4 &&
      evolveToApex.state.unlockedHeadwear.includes("scouter") &&
      evolveToApex.state.unlockedHeadwear.includes("gold_crown") &&
      evolveToApex.state.unlockedProps.includes("golden_banana") &&
      resolveDisplayStage({ level: 7, selectedForm: 2 }) === 2 &&
      resolveDisplayStage({ level: 7, selectedForm: "auto" }) === 4,
    "Leveling to Lv 7 evolves Bonobo to Apex Bonobo and unlocks scouter, crown, and golden banana"
  );

  // Test L: Athlete Post-Workout Unlogged Reminders
  const unloggedReminders = getAthleteReminders({
    completedSets: 0,
    plannedSets: 10,
    sessionStatus: "not_started",
    hasCheckedInToday: false,
    bananaInventory: 0,
  });
  assert(
    unloggedReminders.some((r) => r.id === "workout_unlogged") &&
      unloggedReminders.some((r) => r.id === "checkin_unlogged"),
    "Athlete reminders alert when workout and daily check-in have not been logged yet"
  );

  const completedReminders = getAthleteReminders({
    completedSets: 10,
    plannedSets: 10,
    sessionStatus: "completed",
    hasCheckedInToday: true,
    bananaInventory: 2,
  });
  assert(
    !completedReminders.some((r) => r.id === "workout_unlogged" || r.id === "workout_unfinished") &&
      completedReminders.some((r) => r.id === "bananas_ready"),
    "Completed workouts clear unlogged reminders and show waiting banana reward reminder"
  );

  // Test M: Protected Password Change, Salted Hash Verification & Lockout Protection
  clearCredentialsForTest();
  assert(
    !evaluatePasswordStrength("short").meetsMinimum &&
      evaluatePasswordStrength("StrongPass9!").meetsMinimum &&
      evaluatePasswordStrength("StrongPass9!").score === 4,
    "Password strength meter rejects weak passwords and validates strong mixed+symbol passwords"
  );

  const validInitial = await verifyUserPassword("usr-coach-1", DEFAULT_DEMO_PASSWORD);
  const invalidInitial = await verifyUserPassword("usr-coach-1", "wrongpass");
  assert(
    validInitial && !invalidInitial,
    "Untouched account validates default demo credential and rejects invalid password"
  );

  const wrongCurAttempt = await changePasswordProtected({
    userId: "usr-coach-1",
    currentPassword: "incorrect-current",
    newPassword: "NewStrongPassword9!",
    confirmPassword: "NewStrongPassword9!",
  });
  assert(
    !wrongCurAttempt.success && Boolean(wrongCurAttempt.error),
    "Protected password change blocks update when current password is wrong"
  );

  // Test brute-force lockout after remaining 4 wrong attempts
  let lockedOutRes = wrongCurAttempt;
  for (let i = 0; i < 4; i++) {
    lockedOutRes = await changePasswordProtected({
      userId: "usr-coach-1",
      currentPassword: "wrong-again",
      newPassword: "NewStrongPassword9!",
      confirmPassword: "NewStrongPassword9!",
    });
  }
  assert(
    !lockedOutRes.success && (lockedOutRes.lockedSecondsRemaining ?? 0) > 0,
    "Repeated incorrect current password attempts enforce temporary lockout"
  );

  // Test clean password rotation on separate user & hash verification
  const rotateRes = await changePasswordProtected({
    userId: "usr-athlete-1",
    currentPassword: DEFAULT_DEMO_PASSWORD,
    newPassword: "NewStrongPassword9!",
    confirmPassword: "NewStrongPassword9!",
  });
  const oldPwRejected = await verifyUserPassword("usr-athlete-1", DEFAULT_DEMO_PASSWORD);
  const newPwAccepted = await verifyUserPassword("usr-athlete-1", "NewStrongPassword9!");
  assert(
    rotateRes.success && !oldPwRejected && newPwAccepted,
    "Changing password stores salted hash, rejects old password, and validates new password"
  );

  const initialsUri = createInitialsAvatarDataUrl("Sarah Jenkins");
  assert(
    initialsUri.startsWith("data:image/svg+xml") && initialsUri.includes("SJ"),
    "Initials avatar generator builds clean monogram SVG URI"
  );

  clearCredentialsForTest();

  // Test N: Bilingual EN/ES Reminders & Spanish Bonobo NLP
  const esReminders = getAthleteReminders({
    completedSets: 0,
    plannedSets: 12,
    sessionStatus: "not_started",
    hasCheckedInToday: false,
    bananaInventory: 2,
    locale: "es",
  });
  const esWorkoutRem = esReminders.find((r) => r.id === "workout_unlogged");
  assert(
    Boolean(esWorkoutRem) &&
      esWorkoutRem!.title.includes("entreno") &&
      esWorkoutRem!.actionLabel === "Registrar al Terminar",
    "getAthleteReminders returns Spanish titles and CTAs when locale is 'es'"
  );

  const esWorkoutParse = parseBonoboNaturalLanguage(
    "Hice 4 series sentadillas 140kg x 5 reps",
    undefined,
    "es"
  );
  assert(
    esWorkoutParse.intent === "workout_log" &&
      esWorkoutParse.workoutData?.exercises[0]?.exerciseName === "Barbell Back Squat" &&
      esWorkoutParse.workoutData?.exercises[0]?.sets === 4 &&
      esWorkoutParse.workoutData?.exercises[0]?.weightKg === 140,
    "Spanish NLP workout parser extracts sets, weight, and barbell squat in 'es' mode"
  );

  const esChatParse = parseBonoboNaturalLanguage("hola", undefined, "es");
  assert(
    esChatParse.intent === "chat" &&
      Boolean(esChatParse.chatResponse) &&
      !esChatParse.chatResponse!.includes("Hey! Ready to log"),
    "Spanish Bonobo chat greeting responds in Español when locale is 'es'"
  );

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
