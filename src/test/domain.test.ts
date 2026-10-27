import { calculateEstimated1RM, formatWeight } from "../lib/utils";
import { INITIAL_USERS, INITIAL_ATHLETES, INITIAL_EXERCISES, INITIAL_PROGRAMS } from "../lib/store";

export function runTests(): { passed: number; failed: number; results: string[] } {
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
  assert(INITIAL_ATHLETES.length >= 3, "Athlete roster contains at least 3 active profiles");
  const allHavePrograms = INITIAL_ATHLETES.every(a => !!a.assignedProgramId && !!a.assignedCoachId);
  assert(allHavePrograms, "All athletes have valid coach and program relationships");

  // 6. Program structure validation
  assert(INITIAL_PROGRAMS.length >= 1, "At least 1 periodized program template is published");
  const prog = INITIAL_PROGRAMS[0];
  assert(prog.days.length >= 2, "Program has multiple scheduled training days");
  const allDaysHaveRx = prog.days.every(d => d.prescriptions.length > 0);
  assert(allDaysHaveRx, "All training days have exercise prescriptions configured");

  return { passed, failed, results };
}

// Direct execution when run via ts-node or node
if (typeof require !== "undefined" && require.main === module) {
  const { passed, failed, results } = runTests();
  console.log("=== COACHPRO DOMAIN TEST SUITE ===");
  results.forEach(r => console.log(r));
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
