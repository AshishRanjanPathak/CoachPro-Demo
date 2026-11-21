import exercisesIndexData from "@/data/exercises-index.json";
import { ExerciseIndexItem, ExerciseDetailItem, ExerciseCategory, MuscleGroup } from "@/types";

export const REPDB_ATTRIBUTION = {
  name: "RepDB",
  url: "https://repdb.co",
  repoUrl: "https://github.com/RepDB/exercise-dataset",
  license: "CC BY 4.0 / RepDB Free Tier",
  text: "Exercise library data and 512px WebP illustrations provided by RepDB (repdb.co)."
};

export const ALL_MUSCLE_GROUPS: { id: MuscleGroup | "all"; label: string }[] = [
  { id: "all", label: "All Muscle Groups" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back & Lats" },
  { id: "quadriceps", label: "Quadriceps" },
  { id: "hamstrings", label: "Hamstrings" },
  { id: "glutes", label: "Glutes & Hips" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms & Biceps/Triceps" },
  { id: "core", label: "Core & Abs" },
  { id: "full_body", label: "Full Body" }
];

export const ALL_CATEGORIES: { id: ExerciseCategory | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "machine", label: "Machine / Sled" },
  { id: "cable", label: "Cable" },
  { id: "bodyweight", label: "Bodyweight" },
  { id: "cardio", label: "Cardio" },
  { id: "mobility", label: "Mobility & Stretching" }
];

const indexItems: ExerciseIndexItem[] = exercisesIndexData as ExerciseIndexItem[];

export function getExerciseIndex(): ExerciseIndexItem[] {
  return indexItems;
}

export interface ExerciseFilterOptions {
  query?: string;
  muscle?: string;
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedExercisesResult {
  items: ExerciseIndexItem[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export function filterExercises(options: ExerciseFilterOptions = {}): PaginatedExercisesResult {
  const {
    query = "",
    muscle = "all",
    category = "all",
    difficulty = "all",
    page = 1,
    limit = 24
  } = options;

  const q = query.trim().toLowerCase();

  const filtered = indexItems.filter(item => {
    // Search query match across English, German, and Spanish names, plus equipment
    if (q) {
      const matchName =
        item.name.toLowerCase().includes(q) ||
        (item.nameDe && item.nameDe.toLowerCase().includes(q)) ||
        (item.nameEs && item.nameEs.toLowerCase().includes(q)) ||
        item.equipment.toLowerCase().includes(q) ||
        item.primaryMuscle.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    // Muscle filter
    if (muscle !== "all") {
      const matchPrimary = item.primaryMuscle === muscle;
      const matchSecondary = item.secondaryMuscles?.includes(muscle as MuscleGroup);
      if (!matchPrimary && !matchSecondary) return false;
    }

    // Category filter
    if (category !== "all") {
      if (item.category !== category) return false;
    }

    // Difficulty filter
    if (difficulty !== "all") {
      if (item.difficulty !== difficulty) return false;
    }

    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page: safePage,
    totalPages,
    hasMore: safePage < totalPages
  };
}

export const SEED_EXERCISE_MAP: Record<string, string> = {
  "ex-1": "ex-repdb-squat", // Barbell Back Squat
  "ex-2": "ex-repdb-bench-press", // Barbell Bench Press
  "ex-3": "ex-repdb-deadlift", // Conventional Deadlift
  "ex-4": "ex-repdb-ohp", // Overhead Press
  "ex-5": "ex-repdb-weighted-pull-up", // Weighted Pull-Up
  "ex-6": "ex-repdb-romanian-deadlift", // Romanian Deadlift
  "ex-7": "ex-repdb-incline-db-press", // Incline Dumbbell Press
  "ex-8": "ex-repdb-chest-supported-db-row", // Chest Supported T-Bar Row
  "ex-9": "ex-repdb-push-up", // Push-ups
  "ex-10": "ex-repdb-plank", // Standard Plank
  "ex-11": "ex-repdb-treadmill-running", // Treadmill Running / Walking
  "ex-12": "ex-repdb-stationary-bike", // Stationary Cycling
  "ex-13": "ex-repdb-bicep-curl", // Dumbbell Bicep Curl
  "ex-14": "ex-repdb-leg-press", // Leg Press
  "ex-15": "ex-repdb-leg-extension", // Leg Extension
  "ex-16": "ex-repdb-walking-lunge", // Walking Lunges
  "ex-17": "ex-repdb-dips" // Parallel Bar Dips
};

/**
 * Resolves any exercise ID (seed or RepDB) or exercise name to its RepDB ID.
 */
export function resolveRepdbId(id?: string, name?: string): string | undefined {
  if (id && SEED_EXERCISE_MAP[id]) {
    return SEED_EXERCISE_MAP[id];
  }

  if (id) {
    const directMatch = indexItems.find(e => e.id === id || e.sourceId === id);
    if (directMatch) return directMatch.id;
  }

  if (name) {
    const lowerName = name.toLowerCase().trim();
    // 1. Exact match
    const exactMatch = indexItems.find(e => e.name.toLowerCase() === lowerName);
    if (exactMatch) return exactMatch.id;

    // 2. Contains match
    const containsMatch = indexItems.find(e => e.name.toLowerCase().includes(lowerName) || lowerName.includes(e.name.toLowerCase()));
    if (containsMatch) return containsMatch.id;

    // 3. Normalized keyword match
    const cleanWords = lowerName.replace(/[^a-z0-9]/g, " ").split(" ").filter(w => w.length > 2);
    if (cleanWords.length > 0) {
      const keywordMatch = indexItems.find(e => {
        const en = e.name.toLowerCase();
        return cleanWords.every(w => en.includes(w));
      });
      if (keywordMatch) return keywordMatch.id;
    }
  }

  return undefined;
}

/**
 * Resolves a thumbnail URL for any exercise by ID or name.
 */
export function resolveExerciseThumbnail(id?: string, name?: string): string | undefined {
  const repdbId = resolveRepdbId(id, name);
  if (!repdbId) return undefined;
  const item = indexItems.find(e => e.id === repdbId);
  return item?.thumbUrl;
}

let cachedDetails: Record<string, ExerciseDetailItem> | null = null;

export async function getExerciseDetail(id: string, name?: string): Promise<ExerciseDetailItem | null> {
  if (!cachedDetails) {
    try {
      const detailsModule = await import("@/data/exercises-details.json");
      cachedDetails = detailsModule.default as Record<string, ExerciseDetailItem>;
    } catch (e) {
      console.error("Failed to load exercise details JSON", e);
      return null;
    }
  }

  const targetId = resolveRepdbId(id, name) || id;
  return cachedDetails[targetId] || null;
}
