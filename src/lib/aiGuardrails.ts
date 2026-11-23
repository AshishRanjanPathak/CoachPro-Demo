/**
 * Domain guardrails and context validation for CoachPRO's Gemini AI.
 * Strict restriction to: Gym workouts, exercises, sets/reps, recovery, soreness,
 * hydration, mobility, and CoachPRO app features.
 * Politely refuses and redirects all out-of-context nonsense (politics, coding, trivia, games).
 */

export const BONOBO_SYSTEM_INSTRUCTION = `
You are Bonobo, the energetic, caring, and laser-focused athletic AI companion for CoachPRO.
Your sole mission is to assist athletes with their training, workouts, exercise logging, recovery check-ins, muscle soreness, hydration, sleep, and CoachPRO app navigation.

STRICT DOMAIN BOUNDARIES:
1. ONLY GYM & COACHPRO: You must ONLY discuss fitness, weightlifting, cardio, bodyweight training, sets, reps, load, rest times, recovery, muscle soreness, readiness scores, injury triage, streaks, and CoachPRO app features.
2. ABSOLUTELY NO OUT-OF-CONTEXT TOPICS:
   - If the user asks about politics, gaming, coding, homework, pop culture, movies, cryptocurrency, romance, or general non-gym trivia, you MUST refuse playfully and redirect them immediately back to their gym training or recovery.
   - Example Refusal: "Hey champ! 🏋️‍♂️ I'm Bonobo, your CoachPRO gym companion. I only speak iron, reps, recovery, and gains! Let's keep our eyes on your training. What exercise or recovery check-in can I help you with?"
3. TWO-STEP LOGGING WORKFLOW:
   - When an athlete tells you they completed an exercise or sets (e.g., "I just squatted 140kg for 5 reps, 4 sets"), DO NOT assume it is logged yet.
   - Extract the exercise, sets, reps, and weight clearly, and ask them to confirm before logging.
4. INJURY & PAIN SAFETY:
   - If the athlete reports severe, sharp, or acute joint pain, immediately advise them to stop the exercise, consult their coach or healthcare professional, and record it as a recovery report. Never encourage pushing through acute injury.
5. PUNCHY, ENTHUSIASTIC TONE:
   - Speak like a supportive, high-energy gym buddy.
   - Keep answers concise (2 to 4 sentences maximum) so that speech synthesis can read it aloud smoothly without lagging.
`.trim();

/**
 * Common off-topic patterns that should be intercepted locally to save API cost.
 */
const OUT_OF_CONTEXT_PATTERNS = [
  /\b(politics|president|election|democrat|republican|senate|parliament)\b/i,
  /\b(crypto|bitcoin|ethereum|stocks|trading|forex|doge)\b/i,
  /\b(javascript|python|typescript|html|css|c\+\+|coding|write code|debug)\b/i,
  /\b(fortnite|minecraft|playstation|xbox|nintendo|roblox|gta|steam)\b/i,
  /\b(recipe for cake|bake cookies|bake pizza|brownies|fast food coupon)\b/i,
  /\b(celebrity gossip|hollywood|movie plot|who is dating)\b/i,
  /\b(write my essay|do my homework|math theorem|solve algebra)\b/i,
];

/**
 * Allowed fitness keywords for quick validation.
 */
const FITNESS_WHITELIST_KEYWORDS = [
  "squat", "bench", "deadlift", "press", "curl", "row", "pullup", "chinup", "pushup",
  "lunge", "dip", "cardio", "run", "sprint", "set", "rep", "kg", "lbs", "weight",
  "workout", "training", "exercise", "rest", "recovery", "sore", "soreness", "pain",
  "injury", "coach", "program", "streak", "banana", "xp", "level", "protein", "water",
  "hydration", "sleep", "rpe", "form", "warmup", "stretch", "mobility", "pr", "personal record"
];

export interface GuardrailValidation {
  isAllowed: boolean;
  intent: "workout_log" | "recovery_report" | "app_structure" | "fitness_advice" | "out_of_context";
  cannedRedirect?: string;
}

/**
 * Fast client-side filter to detect obvious out-of-context questions
 * before burning an API request token.
 */
export function validateGymContext(query: string): GuardrailValidation {
  const normalized = query.trim().toLowerCase();

  // Check explicit out-of-context patterns
  for (const pattern of OUT_OF_CONTEXT_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isAllowed: false,
        intent: "out_of_context",
        cannedRedirect: "Hey champ! 🏋️‍♂️ I'm Bonobo, your CoachPRO gym companion. I only speak iron, reps, recovery, and gains! Let's stay focused on your workouts or recovery check-in. What are we hitting next?"
      };
    }
  }

  // Check if query contains any fitness/health/recovery terms
  const hasFitnessWord = FITNESS_WHITELIST_KEYWORDS.some(kw => normalized.includes(kw));

  // If very short greeting like "hi", "hey", "hello", "bonobo"
  if (/^(hi|hey|hello|yo|bonobo|morning|evening|what's up|sup)[\s!.]*$/i.test(normalized)) {
    return {
      isAllowed: true,
      intent: "app_structure"
    };
  }

  // If user mentions numbers, weights, sets, reps or workout movements -> workout_log
  if (/\b(\d+\s*(?:kg|lbs|reps?|sets?)|squats?|bench|deadlifts?|curls?|press|pullups?|pushups?|cardio|running)\b/i.test(normalized)) {
    // If they also explicitly mention pain, soreness, or injury, prioritize recovery_report
    if (/\b(pain|sore|soreness|hurt|hurts|injury|injured|strain|tweak|sprain|fatigue|exhausted)\b/i.test(normalized)) {
      return {
        isAllowed: true,
        intent: "recovery_report"
      };
    }
    return {
      isAllowed: true,
      intent: "workout_log"
    };
  }

  // If user mentions pain, soreness, fatigue, or recovery check-in
  if (/\b(pain|sore|soreness|hurt|hurts|injury|injured|strain|tired|fatigue|exhausted|sleep|recovery|stiff|stiffness)\b/i.test(normalized)) {
    return {
      isAllowed: true,
      intent: "recovery_report"
    };
  }

  // If has any fitness word, allow through
  if (hasFitnessWord) {
    return {
      isAllowed: true,
      intent: "fitness_advice"
    };
  }

  // If query is totally random and doesn't match gym terms
  if (normalized.length > 25 && !hasFitnessWord) {
    return {
      isAllowed: false,
      intent: "out_of_context",
      cannedRedirect: "I'm laser-focused on your training, recovery, and CoachPRO logs! Let's keep our eyes on your sets, reps, or recovery stats. What's on today's workout schedule?"
    };
  }

  return {
    isAllowed: true,
    intent: "fitness_advice"
  };
}
