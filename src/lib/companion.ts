/**
 * Bonobo Companion State & Progression Engine.
 * Manages XP, leveling, moods, unlocked cosmetics, and sound triggers.
 * Persists state in localStorage and dispatches reactive events.
 */

export type CompanionMood = "pumped" | "content" | "sleepy" | "hungry";
export type CompanionTheme = "jungle" | "cyber" | "cafe" | "obsidian";
export type CompanionHeadwear = "none" | "red_headband" | "gold_crown" | "beanie";
export type CompanionProp = "none" | "tiny_dumbbell" | "banana" | "iced_coffee";

export interface CompanionState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  mood: CompanionMood;
  theme: CompanionTheme;
  equippedHeadwear: CompanionHeadwear;
  equippedProp: CompanionProp;
  unlockedHeadwear: CompanionHeadwear[];
  unlockedProps: CompanionProp[];
  snacksFedToday: number;
  lastFedDate: string;
  waterStreakDays: number;
  hasHydratedToday: boolean;
}

const DEFAULT_COMPANION_STATE: CompanionState = {
  name: "Barnaby",
  level: 1,
  xp: 35,
  xpToNextLevel: 100,
  totalXp: 35,
  mood: "content",
  theme: "jungle",
  equippedHeadwear: "red_headband",
  equippedProp: "tiny_dumbbell",
  unlockedHeadwear: ["none", "red_headband"],
  unlockedProps: ["none", "banana", "tiny_dumbbell"],
  snacksFedToday: 2,
  lastFedDate: new Date().toISOString().substring(0, 10),
  waterStreakDays: 3,
  hasHydratedToday: false,
};

const STORAGE_KEY = "coachpro_bonobo_state";

export function loadCompanionState(): CompanionState {
  if (typeof window === "undefined") return DEFAULT_COMPANION_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMPANION_STATE;
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().substring(0, 10);

    // Reset daily counters if date changed
    if (parsed.lastFedDate !== today) {
      parsed.snacksFedToday = 0;
      parsed.hasHydratedToday = false;
      parsed.lastFedDate = today;
    }
    return { ...DEFAULT_COMPANION_STATE, ...parsed };
  } catch {
    return DEFAULT_COMPANION_STATE;
  }
}

export function saveCompanionState(state: CompanionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("coachpro_bonobo_updated", { detail: state }));
  } catch {
    // Ignore storage quota
  }
}

export interface FeedResult {
  state: CompanionState;
  leveledUp: boolean;
  newLevel: number;
  xpAdded: number;
}

export function addCompanionXp(amount: number, reason: string): FeedResult {
  const current = loadCompanionState();
  let xp = current.xp + amount;
  let level = current.level;
  let xpToNext = current.xpToNextLevel;
  let leveledUp = false;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = Math.round(xpToNext * 1.25);
    leveledUp = true;
  }

  // Auto-unlock cosmetics based on level milestones
  const unlockedHeadwear = [...current.unlockedHeadwear];
  const unlockedProps = [...current.unlockedProps];

  if (level >= 2 && !unlockedHeadwear.includes("beanie")) {
    unlockedHeadwear.push("beanie");
  }
  if (level >= 3 && !unlockedProps.includes("iced_coffee")) {
    unlockedProps.push("iced_coffee");
  }
  if (level >= 5 && !unlockedHeadwear.includes("gold_crown")) {
    unlockedHeadwear.push("gold_crown");
  }

  const updated: CompanionState = {
    ...current,
    level,
    xp,
    xpToNextLevel: xpToNext,
    totalXp: current.totalXp + amount,
    mood: "pumped",
    unlockedHeadwear,
    unlockedProps,
    snacksFedToday: current.snacksFedToday + 1,
    lastFedDate: new Date().toISOString().substring(0, 10),
  };

  saveCompanionState(updated);

  // Dispatch feed animation event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("coachpro_bonobo_feed_animation", {
        detail: { reason, amount, leveledUp, level }
      })
    );
  }

  return { state: updated, leveledUp, newLevel: level, xpAdded: amount };
}
