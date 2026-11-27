/**
 * Athlete Workout & Recovery Reminder Engine (EN / ES).
 * Computes non-intrusive, humorous post-workout logging reminders from live state
 * and stores daily dismiss preferences cleanly in localStorage.
 */

export type AthleteReminderId =
  | "workout_unlogged"
  | "workout_unfinished"
  | "checkin_unlogged"
  | "bananas_ready";

export interface AthleteReminder {
  id: AthleteReminderId;
  title: string;
  message: string;
  actionLabel: string;
  targetTab: "training" | "recovery" | "home";
  tone: "warning" | "info" | "success";
}

export interface ComputeReminderParams {
  completedSets: number;
  plannedSets: number;
  sessionStatus: "not_started" | "in_progress" | "completed" | "abandoned";
  hasCheckedInToday: boolean;
  bananaInventory: number;
  locale?: "en" | "es";
}

export function getAthleteReminders({
  completedSets,
  plannedSets,
  sessionStatus,
  hasCheckedInToday,
  bananaInventory,
  locale = "en",
}: ComputeReminderParams): AthleteReminder[] {
  const isEs = locale === "es";
  const reminders: AthleteReminder[] = [];
  const remainingSets = Math.max(0, plannedSets - completedSets);

  if (completedSets === 0 && sessionStatus !== "completed") {
    reminders.push({
      id: "workout_unlogged",
      title: isEs ? "Aún no registraste el entreno de hoy" : "Haven't logged today's workout yet",
      message: isEs
        ? "No olvides registrar tus series justo después de entrenar — Bonobo se pone gruñón si las ganancias no cuentan."
        : "Don't forget to log your sets right after your workout — Bonobo gets hangry when gains go unrecorded.",
      actionLabel: isEs ? "Registrar al Terminar" : "Log After Workout",
      targetTab: "training",
      tone: "warning",
    });
  } else if (completedSets > 0 && remainingSets > 0 && sessionStatus !== "completed") {
    reminders.push({
      id: "workout_unfinished",
      title: isEs
        ? `Faltan ${remainingSets} ${remainingSets === 1 ? "serie" : "series"} por registrar`
        : `${remainingSets} set${remainingSets === 1 ? "" : "s"} left to log`,
      message: isEs
        ? "¡Ya estás en marcha! Registra el resto después de tu última serie para mantener tu racha."
        : "You're already on the board! Log your remaining sets after your last rep so today's streak counts.",
      actionLabel: isEs ? "Seguir Entreno" : "Continue Workout",
      targetTab: "training",
      tone: "warning",
    });
  }

  if (!hasCheckedInToday) {
    reminders.push({
      id: "checkin_unlogged",
      title: isEs ? "Chequeo diario pendiente" : "Daily check-in still waiting",
      message: isEs
        ? "Bonobo está adivinando tus agujetas a cara o cruz. Dedica 10 segundos a registrar sueño y energía."
        : "Bonobo is guessing your soreness with a coin flip. Drop a 10-second sleep & readiness note.",
      actionLabel: isEs ? "Chequear Ahora" : "Check In",
      targetTab: "recovery",
      tone: "info",
    });
  }

  if (sessionStatus === "completed" && bananaInventory > 0) {
    reminders.push({
      id: "bananas_ready",
      title: isEs
        ? `${bananaInventory} ${bananaInventory === 1 ? "plátano ganado" : "plátanos ganados"} en tu mochila`
        : `${bananaInventory} earned banana${bananaInventory === 1 ? "" : "s"} in your bag`,
      message: isEs
        ? "¡Entreno registrado! Alimenta a Bonobo con tu reserva para ganar XP de Evolución."
        : "All sets logged! Feed Bonobo from your stash for bonus Evolution XP.",
      actionLabel: isEs ? "Dar Plátano" : "Feed Bonobo",
      targetTab: "home",
      tone: "success",
    });
  }

  return reminders;
}

const DISMISS_STORAGE_PREFIX = "coachpro_reminders_dismissed_";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadDismissedReminderIds(): AthleteReminderId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${DISMISS_STORAGE_PREFIX}${getTodayKey()}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function dismissReminderForToday(id: AthleteReminderId): AthleteReminderId[] {
  if (typeof window === "undefined") return [id];
  const current = loadDismissedReminderIds();
  const next = Array.from(new Set([...current, id]));
  try {
    localStorage.setItem(`${DISMISS_STORAGE_PREFIX}${getTodayKey()}`, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("coachpro_reminders_updated", { detail: next }));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function resetDismissedRemindersForToday(): AthleteReminderId[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(`${DISMISS_STORAGE_PREFIX}${getTodayKey()}`);
    window.dispatchEvent(new CustomEvent("coachpro_reminders_updated", { detail: [] }));
  } catch {
    // Ignore storage errors
  }
  return [];
}

export function canUseBrowserNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestPostWorkoutNotificationPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function sendBrowserWorkoutReminder(title: string, body: string): boolean {
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return false;
  try {
    new Notification(title, {
      body,
      icon: "/icon.png",
    });
    return true;
  } catch {
    return false;
  }
}
