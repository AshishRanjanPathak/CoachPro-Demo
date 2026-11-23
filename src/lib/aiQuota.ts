/**
 * Daily rate limiter and usage tracker for Gemini AI Voice & Chat.
 * Prevents API cost overruns by enforcing a strict daily quota (15 requests/day per athlete).
 */

export const DAILY_AI_REQUEST_LIMIT = 15;

export interface DailyAiUsage {
  athleteId: string;
  date: string; // YYYY-MM-DD
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  canMakeRequest: boolean;
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getStorageKey(athleteId: string): string {
  return `coachpro_ai_quota_${athleteId}_${getTodayKey()}`;
}

const CUSTOM_API_KEY_STORAGE = "coachpro_gemini_custom_api_key";

/**
 * Retrieves the current daily usage for an athlete.
 */
export function getDailyAiUsage(athleteId: string = "default-athlete"): DailyAiUsage {
  const date = getTodayKey();
  let used = 0;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(getStorageKey(athleteId));
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          used = parsed;
        }
      }
    } catch {
      // Storage access may fail in restricted sandboxes
    }
  }

  const remaining = Math.max(0, DAILY_AI_REQUEST_LIMIT - used);
  const resetDate = new Date();
  resetDate.setHours(23, 59, 59, 999);

  return {
    athleteId,
    date,
    used,
    limit: DAILY_AI_REQUEST_LIMIT,
    remaining,
    resetAt: resetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    canMakeRequest: remaining > 0
  };
}

/**
 * Increments the daily usage counter for an athlete.
 */
export function incrementDailyAiUsage(athleteId: string = "default-athlete"): DailyAiUsage {
  const current = getDailyAiUsage(athleteId);
  if (!current.canMakeRequest) {
    return current;
  }

  const nextUsed = current.used + 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getStorageKey(athleteId), String(nextUsed));
    } catch {
      // fallback
    }
  }

  return {
    ...current,
    used: nextUsed,
    remaining: Math.max(0, DAILY_AI_REQUEST_LIMIT - nextUsed),
    canMakeRequest: nextUsed < DAILY_AI_REQUEST_LIMIT
  };
}

/**
 * Manages user-configured Gemini API Key (stored client-side in localStorage).
 */
export function saveCustomGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem(CUSTOM_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
    }
  }
}

export function getCustomGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(CUSTOM_API_KEY_STORAGE) || "";
  }
  return "";
}

export function hasCustomGeminiApiKey(): boolean {
  return Boolean(getCustomGeminiApiKey());
}

export function clearCustomGeminiApiKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
  }
}
