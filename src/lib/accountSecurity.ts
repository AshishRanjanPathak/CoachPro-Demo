/**
 * Protected Account Security, Password Hashing, Profile Image Processing & Role Preferences.
 * Never persists plaintext passwords in localStorage; uses salted SHA-256 via Web Crypto API.
 */

export const DEFAULT_DEMO_PASSWORD = "password123";

const CREDENTIALS_STORAGE_KEY = "coachpro_credentials_v1";
const PREFS_STORAGE_KEY = "coachpro_account_prefs_v1";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export interface StoredCredentialRecord {
  salt: string;
  hash: string;
  updatedAt: string;
  lastSessionResetAt?: string;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Fair" | "Good" | "Strong";
  hasMinLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  meetsMinimum: boolean;
}

export interface AccountPreferences {
  weightUnit: "kg" | "lbs";
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  bioNote: string;
  shareRecoveryWithCoach: boolean;
  triageThreshold: 5 | 6;
  coachSoundAlerts: boolean;
  adminStrictPasswordPolicy: boolean;
  adminSessionTimeoutMins: 30 | 60 | 240;
}

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  weightUnit: "kg",
  twoFactorEnabled: false,
  emailNotifications: true,
  pushNotifications: true,
  bioNote: "",
  shareRecoveryWithCoach: true,
  triageThreshold: 6,
  coachSoundAlerts: true,
  adminStrictPasswordPolicy: true,
  adminSessionTimeoutMins: 60,
};

// In-memory brute-force attempt guard per userId
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

// Fallback in-memory stores for SSR / non-browser unit tests
let inMemoryCredentials: Record<string, StoredCredentialRecord> = {};
let inMemoryPrefs: Record<string, AccountPreferences> = {};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return bytesToHex(new Uint8Array(digest));
  }
  throw new Error("Web Crypto API unavailable for secure password hashing.");
}

function loadCredentialsMap(): Record<string, StoredCredentialRecord> {
  if (typeof window === "undefined") return inMemoryCredentials;
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return inMemoryCredentials;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return inMemoryCredentials;
  }
}

function saveCredentialsMap(map: Record<string, StoredCredentialRecord>): void {
  inMemoryCredentials = map;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearCredentialsForTest(): void {
  inMemoryCredentials = {};
  failedAttemptsMap.clear();
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasMixedCase = hasLower && hasUpper;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let checks = 0;
  if (hasMinLength) checks++;
  if (hasMixedCase) checks++;
  if (hasNumber) checks++;
  if (hasSymbol) checks++;

  const score = Math.min(4, checks) as 0 | 1 | 2 | 3 | 4;
  const label: PasswordStrengthResult["label"] =
    !hasMinLength || score <= 1
      ? "Too weak"
      : score === 2
      ? "Fair"
      : score === 3
      ? "Good"
      : "Strong";

  // Protected baseline: at least 8 characters and either number or symbol + letter
  const meetsMinimum = hasMinLength && (hasLower || hasUpper) && (hasNumber || hasSymbol);

  return {
    score,
    label,
    hasMinLength,
    hasMixedCase,
    hasNumber,
    hasSymbol,
    meetsMinimum,
  };
}

export function getPasswordLockoutSeconds(userId: string): number {
  const entry = failedAttemptsMap.get(userId);
  if (!entry) return 0;
  const remainingMs = entry.lockedUntil - Date.now();
  if (remainingMs <= 0) {
    if (entry.lockedUntil > 0) {
      failedAttemptsMap.delete(userId);
    }
    return 0;
  }
  return Math.ceil(remainingMs / 1000);
}

export function getCredentialMeta(userId: string): { updatedAt: string | null; lastSessionResetAt: string | null } {
  const map = loadCredentialsMap();
  const record = map[userId];
  return {
    updatedAt: record?.updatedAt ?? null,
    lastSessionResetAt: record?.lastSessionResetAt ?? null,
  };
}

export async function verifyUserPassword(userId: string, candidatePassword: string): Promise<boolean> {
  const map = loadCredentialsMap();
  const existing = map[userId];
  if (!existing) {
    // User still has untouched default demo password
    return candidatePassword === DEFAULT_DEMO_PASSWORD;
  }
  const computed = await hashPasswordWithSalt(candidatePassword, existing.salt);
  return computed === existing.hash;
}

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
  lockedSecondsRemaining?: number;
  updatedAt?: string;
}

export async function changePasswordProtected(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOtherSessions?: boolean;
}): Promise<ChangePasswordResult> {
  const { userId, currentPassword, newPassword, confirmPassword, signOutOtherSessions = true } = params;

  const lockSecs = getPasswordLockoutSeconds(userId);
  if (lockSecs > 0) {
    return {
      success: false,
      error: `Too many incorrect attempts. Try again in ${lockSecs}s.`,
      lockedSecondsRemaining: lockSecs,
    };
  }

  if (!currentPassword) {
    return { success: false, error: "Please enter your current password." };
  }

  const isCurrentValid = await verifyUserPassword(userId, currentPassword);
  if (!isCurrentValid) {
    const prev = failedAttemptsMap.get(userId) || { count: 0, lockedUntil: 0 };
    const nextCount = prev.count + 1;
    if (nextCount >= MAX_FAILED_ATTEMPTS) {
      failedAttemptsMap.set(userId, { count: nextCount, lockedUntil: Date.now() + LOCKOUT_MS });
      return {
        success: false,
        error: "Too many incorrect attempts. Password updates locked for 60s.",
        lockedSecondsRemaining: 60,
      };
    }
    failedAttemptsMap.set(userId, { count: nextCount, lockedUntil: 0 });
    return {
      success: false,
      error: `Current password is incorrect (${MAX_FAILED_ATTEMPTS - nextCount} attempts left).`,
    };
  }

  // Clear attempts on valid verification
  failedAttemptsMap.delete(userId);

  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.meetsMinimum) {
    return {
      success: false,
      error: "New password must be at least 8 characters and include letters plus a number or symbol.",
    };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      error: "New password must be different from your current password.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "New password and confirmation do not match.",
    };
  }

  const salt = generateSaltHex();
  const hash = await hashPasswordWithSalt(newPassword, salt);
  const nowIso = new Date().toISOString();

  const map = loadCredentialsMap();
  map[userId] = {
    salt,
    hash,
    updatedAt: nowIso,
    lastSessionResetAt: signOutOtherSessions ? nowIso : map[userId]?.lastSessionResetAt,
  };
  saveCredentialsMap(map);

  return {
    success: true,
    updatedAt: nowIso,
  };
}

/**
 * Generates crisp monogram SVG data URI so users can always switch to a clean initials avatar.
 */
export function createInitialsAvatarDataUrl(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || "BP").toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="128" fill="#18181B"/><text x="128" y="144" text-anchor="middle" fill="#FAFAFA" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="92" font-weight="700" letter-spacing="2">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Safely center-crops and downsamples an uploaded avatar file to 256x256 JPEG (<25KB)
 * to respect browser localStorage limits across reloads.
 */
export async function resizeProfileImageToDataUrl(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Please select a PNG, JPG, or WebP image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format."));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not available."));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const CURATED_AVATAR_PRESETS = [
  {
    id: "preset-1",
    label: "Studio One",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-2",
    label: "Coach Studio",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-3",
    label: "Founder Look",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-4",
    label: "Exec Studio",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-5",
    label: "Gym Minimal",
    url: "/icon.png",
  },
];

export function loadAccountPreferences(userId: string): AccountPreferences {
  if (typeof window === "undefined") {
    return inMemoryPrefs[userId] || DEFAULT_ACCOUNT_PREFERENCES;
  }
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ACCOUNT_PREFERENCES,
      ...(parsed?.[userId] || {}),
    };
  } catch {
    return DEFAULT_ACCOUNT_PREFERENCES;
  }
}

export function saveAccountPreferences(userId: string, prefs: AccountPreferences): AccountPreferences {
  inMemoryPrefs[userId] = prefs;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[userId] = prefs;
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent("coachpro_prefs_updated", { detail: { userId, prefs } }));
    } catch {
      // Ignore storage quota errors
    }
  }
  return prefs;
}
