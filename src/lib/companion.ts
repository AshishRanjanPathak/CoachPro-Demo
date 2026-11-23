/**
 * Bonobo Companion State & Progression Engine.
 * Manages XP, leveling, moods, unlocked cosmetics, and sound triggers.
 * Persists state in localStorage and dispatches reactive events.
 */

export type CompanionMood =
  | "happy"
  | "focused"
  | "caring"
  | "celebrating"
  | "pumped"
  | "content"
  | "sleepy"
  | "hungry";

export type CompanionMode = "gamified" | "pro_minimalist";
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
  mode: CompanionMode;
  theme: CompanionTheme;
  equippedHeadwear: CompanionHeadwear;
  equippedProp: CompanionProp;
  unlockedHeadwear: CompanionHeadwear[];
  unlockedProps: CompanionProp[];
  bananaInventory: number;
  totalBananasEarned: number;
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
  mood: "happy",
  mode: "gamified",
  theme: "jungle",
  equippedHeadwear: "red_headband",
  equippedProp: "tiny_dumbbell",
  unlockedHeadwear: ["none", "red_headband"],
  unlockedProps: ["none", "banana", "tiny_dumbbell"],
  bananaInventory: 2,
  totalBananasEarned: 2,
  snacksFedToday: 0,
  lastFedDate: new Date().toISOString().substring(0, 10),
  waterStreakDays: 3,
  hasHydratedToday: false,
};

const STORAGE_KEY = "coachpro_bonobo_state";

let inMemoryCompanionState: CompanionState | null = null;

export function loadCompanionState(): CompanionState {
  if (typeof window === "undefined") return inMemoryCompanionState || DEFAULT_COMPANION_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return inMemoryCompanionState || DEFAULT_COMPANION_STATE;
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
    return inMemoryCompanionState || DEFAULT_COMPANION_STATE;
  }
}

export function saveCompanionState(state: CompanionState): void {
  inMemoryCompanionState = state;
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

export function awardEarnedBananas(count: number, reason: string): CompanionState {
  const current = loadCompanionState();
  if (count <= 0) return current;

  const updated: CompanionState = {
    ...current,
    bananaInventory: (current.bananaInventory || 0) + count,
    totalBananasEarned: (current.totalBananasEarned || 0) + count,
  };

  saveCompanionState(updated);
  return updated;
}

export interface FeedBananaResult {
  success: boolean;
  error?: string;
  state: CompanionState;
  leveledUp: boolean;
  newLevel: number;
}

export function feedBananaToCompanion(): FeedBananaResult {
  const current = loadCompanionState();

  // Enforce finite inventory: cannot feed if inventory is zero
  if (!current.bananaInventory || current.bananaInventory <= 0) {
    return {
      success: false,
      error: "No bananas in stash! Complete today's workout or morning check-in to earn more 🍌",
      state: current,
      leveledUp: false,
      newLevel: current.level
    };
  }

  // Deduct 1 banana from inventory and add +5 bond XP
  const newInventory = current.bananaInventory - 1;
  const feedResult = addCompanionXp(5, "Ate Stored Banana 🍌");

  const finalState: CompanionState = {
    ...feedResult.state,
    bananaInventory: newInventory,
    snacksFedToday: (current.snacksFedToday || 0) + 1,
    lastFedDate: new Date().toISOString().substring(0, 10),
  };

  saveCompanionState(finalState);

  return {
    success: true,
    state: finalState,
    leveledUp: feedResult.leveledUp,
    newLevel: feedResult.newLevel
  };
}

export function addCompanionXp(amount: number, reason: string): FeedResult {
  const current = loadCompanionState();

  // Safety rule: Never award XP or game incentives for reporting pain, injury, or triage
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes("injury") || lowerReason.includes("pain") || lowerReason.includes("triage")) {
    return {
      state: current,
      leveledUp: false,
      newLevel: current.level,
      xpAdded: 0
    };
  }

  // If in Pro Minimalist mode, do not process gamified leveling
  if (current.mode === "pro_minimalist") {
    return {
      state: current,
      leveledUp: false,
      newLevel: current.level,
      xpAdded: 0
    };
  }

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
