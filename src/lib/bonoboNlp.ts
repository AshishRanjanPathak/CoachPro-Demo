/**
 * Bonobo AI Natural Language Processing & Safety Engine.
 * Parses athlete natural language voice/text into structured workout sets
 * or clinical recovery triage reports with MANDATORY athlete confirmation.
 */

import { getExerciseIndex } from "@/lib/exercises";

export type BonoboIntent = "workout_log" | "hypothetical" | "injury_report" | "chat";

export interface ParsedWorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string;
  weightKg: number;
  matchedFrom: string;
}

export interface ParsedInjuryTriage {
  hasInjury: boolean;
  location: string;
  severity: "mild" | "moderate" | "severe";
  fatigueLevel: "low" | "moderate" | "high" | "severe";
  sleepHours?: number;
  sorenessScore: number; // 1-5
  readinessScore: number; // 1-10
  details: string;
  clinicalAlert: string;
}

export interface BonoboNlpResult {
  intent: BonoboIntent;
  summary: string;
  rawInput: string;
  workoutData?: {
    exercises: ParsedWorkoutExercise[];
    totalSets: number;
  };
  injuryData?: ParsedInjuryTriage;
  chatResponse?: string;
  requiresConfirmation: boolean;
}

// Common aliases for fast RepDB exercise resolution
const EXERCISE_SYNONYMS: Record<string, string> = {
  squat: "Barbell Back Squat",
  squats: "Barbell Back Squat",
  sentadilla: "Barbell Back Squat",
  sentadillas: "Barbell Back Squat",
  "back squat": "Barbell Back Squat",
  "front squat": "Front Squat",
  bench: "Barbell Bench Press",
  banca: "Barbell Bench Press",
  "press banca": "Barbell Bench Press",
  "bench press": "Barbell Bench Press",
  "incline bench": "Incline Barbell Bench Press",
  "dumbbell bench": "Dumbbell Bench Press",
  deadlift: "Conventional Deadlift",
  deadlifts: "Conventional Deadlift",
  "peso muerto": "Conventional Deadlift",
  rdl: "Romanian Deadlift",
  "romanian deadlift": "Romanian Deadlift",
  overhead: "Barbell Overhead Press",
  ohp: "Barbell Overhead Press",
  "shoulder press": "Dumbbell Shoulder Press",
  pullup: "Pull-Up",
  pullups: "Pull-Up",
  "pull-ups": "Pull-Up",
  "weighted pullup": "Weighted Pull-Up",
  "lat pulldown": "Lat Pulldown",
  row: "Bent Over Barbell Row",
  "barbell row": "Bent Over Barbell Row",
  "dumbbell row": "One-Arm Dumbbell Row",
  dip: "Chest Dip",
  dips: "Chest Dip",
  curl: "Dumbbell Bicep Curl",
  curls: "Dumbbell Bicep Curl",
  "bicep curl": "Dumbbell Bicep Curl",
  "leg press": "Leg Press",
  "leg extension": "Leg Extension",
  "hamstring curl": "Lying Leg Curl",
  plank: "Plank",
  pushup: "Push-Up",
  pushups: "Push-Up",
  "push-ups": "Push-Up",
  treadmill: "Treadmill Running"
};

// Hypothetical and future-tense trigger words (MUST NOT auto-log)
const HYPOTHETICAL_TRIGGERS = [
  "thinking of",
  "thinking about",
  "might",
  "planning to",
  "plan to",
  "want to",
  "can i",
  "should i",
  "tomorrow",
  "next week",
  "what if",
  "could i",
  "hoping to",
  "aiming to"
];

// Injury, pain and fatigue symptom trigger words (strictly symptoms, NOT body parts)
const INJURY_TRIGGERS = [
  "pain",
  "hurt",
  "hurts",
  "sore",
  "soreness",
  "injured",
  "injury",
  "tweak",
  "strain",
  "sprain",
  "sharp",
  "discomfort",
  "ache",
  "aching",
  "stiff",
  "clicking",
  "throbbing",
  "exhausted",
  "destroyed",
  "dolor",
  "duele",
  "molestia",
  "agujetas",
  "cansado"
];

// Body parts mapping
const BODY_PARTS = [
  "right knee",
  "left knee",
  "knee",
  "rodilla",
  "patellar",
  "left shoulder",
  "right shoulder",
  "shoulder",
  "hombro",
  "lower back",
  "lumbar",
  "upper back",
  "back",
  "espalda",
  "hamstring",
  "glute",
  "quad",
  "elbow",
  "wrist",
  "ankle",
  "hip",
  "neck"
];

/**
 * Main NLP Parsing Function
 */
export function parseBonoboNaturalLanguage(
  input: string,
  catalog: Array<{ id: string; name: string; category?: string }> = getExerciseIndex(),
  locale: "en" | "es" = "en"
): BonoboNlpResult {
  const cleanInput = input.trim();
  const lower = cleanInput.toLowerCase();

  // 1. Check for Hypothetical / Planning input
  const isHypothetical = HYPOTHETICAL_TRIGGERS.some(trigger => lower.includes(trigger));
  if (isHypothetical) {
    return {
      intent: "hypothetical",
      rawInput: cleanInput,
      summary: "Understood! That sounds like a solid plan.",
      chatResponse: `Got it! That's a great target. When you finish your actual sets, just let me know and we'll review and log them together! 🦍`,
      requiresConfirmation: false
    };
  }

  // 2. Check for Injury / Recovery Triage input
  const hasInjuryKeywords = INJURY_TRIGGERS.some(trigger => lower.includes(trigger));
  const hasBodyPart = BODY_PARTS.some(part => lower.includes(part));

  if (hasInjuryKeywords && hasBodyPart) {
    const matchedPart = BODY_PARTS.find(part => lower.includes(part)) || "General muscle";
    const formattedLocation = matchedPart
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const isSevere =
      lower.includes("severe") ||
      lower.includes("sharp") ||
      lower.includes("really bad") ||
      lower.includes("can't walk") ||
      lower.includes("cannot walk") ||
      lower.includes("acute");

    const isModerate =
      lower.includes("moderate") ||
      lower.includes("stiff") ||
      lower.includes("clicking") ||
      lower.includes("throbbing");

    const severity: "mild" | "moderate" | "severe" = isSevere
      ? "severe"
      : isModerate
      ? "moderate"
      : "mild";

    const isExhausted =
      lower.includes("exhausted") ||
      lower.includes("destroyed") ||
      lower.includes("super tired") ||
      lower.includes("drained");

    const fatigueLevel: "low" | "moderate" | "high" | "severe" = isExhausted
      ? "high"
      : severity === "severe"
      ? "high"
      : "moderate";

    // Extract sleep hours if mentioned (e.g., "5 hours", "7.5 hrs", "slept 6h")
    const sleepMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h)\b/);
    const sleepHours = sleepMatch ? parseFloat(sleepMatch[1]) : undefined;

    const sorenessScore = severity === "severe" ? 5 : severity === "moderate" ? 3 : 2;
    const readinessScore = severity === "severe" ? 3 : severity === "moderate" ? 5 : 7;

    return {
      intent: "injury_report",
      rawInput: cleanInput,
      summary:
        locale === "es"
          ? `Se detectó dolor (${severity}) en ${formattedLocation}.`
          : `Flagged ${severity} pain in ${formattedLocation}.`,
      requiresConfirmation: true,
      injuryData: {
        hasInjury: true,
        location: formattedLocation,
        severity,
        fatigueLevel,
        sleepHours,
        sorenessScore,
        readinessScore,
        details: cleanInput,
        clinicalAlert:
          locale === "es"
            ? severity === "severe"
              ? "⚠️ Dolor severo detectado. Al confirmar, se avisará de inmediato a tu entrenadora Sarah."
              : "ℹ️ Molestia reportada. Al confirmar, se registrará en tu recuperación y se notificará a tu coach."
            : severity === "severe"
              ? "⚠️ Severe pain detected. Confirming will immediately flag your profile on Coach Sarah's Priority Attention Queue."
              : "ℹ️ Pain reported. Confirming will log your recovery check-in and alert your coach."
      }
    };
  }

  // 3. Check for Workout Logging (e.g., "4 sets squats 140kg x 5 reps and 3 sets bench press 90kg")
  const parsedExercises = extractWorkoutExercises(lower, catalog);

  if (parsedExercises.length > 0) {
    const totalSets = parsedExercises.reduce((sum, ex) => sum + ex.sets, 0);
    return {
      intent: "workout_log",
      rawInput: cleanInput,
      summary:
        locale === "es"
          ? `¡Encontré ${parsedExercises.length} ${parsedExercises.length === 1 ? "ejercicio" : "ejercicios"} en tu registro!`
          : `Found ${parsedExercises.length} ${
              parsedExercises.length === 1 ? "exercise" : "exercises"
            } in your update!`,
      requiresConfirmation: true,
      workoutData: {
        exercises: parsedExercises,
        totalSets
      }
    };
  }

  // 4. Fallback: Friendly AI Coaching Chat
  return {
    intent: "chat",
    rawInput: cleanInput,
    summary: locale === "es" ? "Respuesta de chat" : "Chat response",
    requiresConfirmation: false,
    chatResponse: generateChatResponse(lower, locale)
  };
}

/**
 * Helper: Extract structured workout exercises, sets, reps, weight
 */
function extractWorkoutExercises(
  text: string,
  catalog: Array<{ id: string; name: string; category?: string }>
): ParsedWorkoutExercise[] {
  const results: ParsedWorkoutExercise[] = [];

  // Split by common separators ("and", "y", ",", ";", "\n", "then", "+")
  const segments = text.split(/(?:,|\band\b|\by\b|;|\n|\bthen\b|\+)/i);

  segments.forEach((seg, idx) => {
    const s = seg.trim();
    if (!s) return;

    // 1. Resolve exercise
    let matchedExName: string | null = null;
    let matchedFromKey = "";

    // Check synonym dictionary first
    for (const [key, fullName] of Object.entries(EXERCISE_SYNONYMS)) {
      const reg = new RegExp(`\\b${key}\\b`, "i");
      if (reg.test(s)) {
        matchedExName = fullName;
        matchedFromKey = key;
        break;
      }
    }

    // Fallback: check 708 RepDB catalog names
    if (!matchedExName) {
      for (const ex of catalog) {
        if (s.includes(ex.name.toLowerCase())) {
          matchedExName = ex.name;
          matchedFromKey = ex.name;
          break;
        }
      }
    }

    if (!matchedExName) return;

    // Find actual ID from catalog
    const resolvedEx = catalog.find(
      e => e.name.toLowerCase() === matchedExName!.toLowerCase()
    ) || catalog.find(
      e => e.name.toLowerCase().includes(matchedFromKey.toLowerCase())
    ) || { id: `ex-${matchedFromKey || "custom"}`, name: matchedExName };

    // 2. Extract Sets (e.g. "4 sets", "4 series", "4x", "4 sets of")
    let sets = 3;
    const setsMatch = s.match(/(\d+)\s*(?:series|serie|sets|set|x\s*\d)/i);
    if (setsMatch) {
      sets = parseInt(setsMatch[1]);
    } else {
      const standaloneX = s.match(/(\d+)\s*x/i);
      if (standaloneX) sets = parseInt(standaloneX[1]);
    }

    // 3. Extract Weight in kg or lbs (e.g. "140kg", "140 kg", "225lbs", "@ 140")
    let weightKg = 0;
    const weightMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kgs|@|\bload\b)/i);
    if (weightMatch) {
      weightKg = parseFloat(weightMatch[1]);
    } else {
      const lbsMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:lbs|lb|pounds)/i);
      if (lbsMatch) {
        weightKg = Math.round(parseFloat(lbsMatch[1]) * 0.453592 * 2) / 2;
      }
    }

    // 4. Extract Reps (e.g. "5 reps", "for 5 reps", "5r", "8-10 reps")
    let reps: number | string = 8;
    const repsMatch = s.match(/(\d+(?:-\d+)?)\s*(?:reps|rep|r\b)/i);
    if (repsMatch) {
      reps = repsMatch[1];
    } else {
      // Check pattern like "140kg for 5" or "4x5"
      const forRepsMatch = s.match(/(?:for|x)\s*(\d+)\b/i);
      if (forRepsMatch) {
        reps = parseInt(forRepsMatch[1]);
      }
    }

    results.push({
      id: `parsed-ex-${Date.now()}-${idx}`,
      exerciseId: resolvedEx.id,
      exerciseName: matchedExName || resolvedEx.name,
      sets: Math.min(sets, 12),
      reps: String(reps),
      weightKg,
      matchedFrom: matchedFromKey
    });
  });

  return results;
}

/**
 * Helper: Contextual funny & simple chat replies (EN / ES)
 */
function generateChatResponse(lower: string, locale: "en" | "es" = "en"): string {
  const isEs = locale === "es" || /\b(hola|buenas|agua|cansado|plátano|entreno|sentadilla)\b/i.test(lower);
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("hola") || lower.includes("buenas")) {
    return isEs
      ? "¡Buenas! 👋 ¿Listo para mover kilos o fingir que estirar fue la parte difícil hoy? 🦍"
      : "Yo! Ready to move heavy metal or pretend stretching was the hard part today? 🦍";
  }
  if (lower.includes("how are you") || lower.includes("feeling") || lower.includes("cómo estás")) {
    return isEs
      ? "¡Al 100% de potasio y motivación de gimnasio! Acuérdate de registrar tus series al acabar."
      : "Operating on 100% potassium and pure gym hype! Remember to log your sets after your workout!";
  }
  if (lower.includes("water") || lower.includes("hydrate") || lower.includes("agua") || lower.includes("hidrata")) {
    return isEs
      ? "¡Tómate un buen vaso de agua! Un músculo deshidratado es invitación directa a los calambres."
      : "Go chug a glass of water! If your muscles are dehydrated, cramps get invited to the party.";
  }
  if (lower.includes("eat") || lower.includes("food") || lower.includes("protein") || lower.includes("banana") || lower.includes("comer") || lower.includes("plátano")) {
    return isEs
      ? "Proteína y carbohidratos tras entrenar para los atletas; ¡Bonobo acepta plátanos por XP de Evolución! 🍌"
      : "Real athletes eat protein + carbs after training. Bonobos accept earned bananas for Evolution XP 🍌";
  }
  if (lower.includes("evolve") || lower.includes("evolution") || lower.includes("evoluc") || lower.includes("saiyan") || lower.includes("level") || lower.includes("nivel")) {
    return isEs
      ? "¡Registra entrenos y chequeos para subir de XP! Espera a ver mi forma Súper Bonobo al Nivel 5 ⚡"
      : "Log workouts and daily check-ins to stack XP! Wait till you see my Super Bonobo form at Level 5 ⚡";
  }
  if (lower.includes("motivation") || lower.includes("motivate") || lower.includes("tired") || lower.includes("cansado") || lower.includes("motivac")) {
    return isEs
      ? "Presentarte medio dormido ya le gana al sofá por goleada. ¡Dos buenas series hoy y a presumir!"
      : "Even showing up half-awake beats the couch by 100%. Two honest sets and you can brag about it all day!";
  }
  return isEs
    ? "¡Dime qué levantaste (ej. '4 series sentadillas 140kg x 5 reps') al terminar o cuéntame cómo te sientes!"
    : "Tell me what you lifted (like '4 sets squats 140kg x 5 reps') after your session, or tell me how your body feels!";
}
