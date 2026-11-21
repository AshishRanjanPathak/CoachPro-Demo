import { IBackendServices, IWorkoutService, IProgramService, IAthleteService, ICheckInService, ServiceResponse } from "./types";
import { WorkoutSet, Program, AthleteProfile, CheckIn, User } from "@/types";
import { WorkoutSetInput, CreateProgramInput, CheckInInput, AthleteProfileUpdateInput } from "@/lib/schemas";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function request<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  options?: { signal?: AbortSignal; idempotencyKey?: string }
): Promise<ServiceResponse<T>> {
  const baseUrl = env.NEXT_PUBLIC_API_URL || "";
  const url = `${baseUrl}${endpoint}`;
  const requestId = generateRequestId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId,
  };

  if (options?.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      logger.warn(`API request returned ${res.status}`, { requestId, context: { endpoint, method } });
      return {
        success: false,
        error: json?.error || {
          code: `HTTP_${res.status}`,
          message: json?.message || `Request failed with status ${res.status}`,
        },
      };
    }

    return {
      success: true,
      data: (json?.data !== undefined ? json.data : json) as T,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: { code: "ABORTED", message: "Request cancelled by user" } };
    }
    logger.error("Network request failure", { requestId, err, context: { endpoint, method } });
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Failed to connect to backend service",
      },
    };
  }
}

class HttpWorkoutService implements IWorkoutService {
  logSet(input: WorkoutSetInput, options?: { signal?: AbortSignal; idempotencyKey?: string }) {
    return request<WorkoutSet>("/api/workouts/log", "POST", input, options);
  }
  logBatch(sets: WorkoutSetInput[], options?: { signal?: AbortSignal; idempotencyKey?: string }) {
    return request<WorkoutSet[]>("/api/workouts/batch", "POST", { sets }, options);
  }
  undoSets(setIds: string[], options?: { signal?: AbortSignal }) {
    return request<{ removedCount: number }>("/api/workouts/undo", "POST", { setIds }, options);
  }
  getRecentSets(exerciseId?: string, options?: { signal?: AbortSignal }) {
    const query = exerciseId ? `?exerciseId=${encodeURIComponent(exerciseId)}` : "";
    return request<WorkoutSet[]>(`/api/workouts/recent${query}`, "GET", undefined, options);
  }
}

class HttpProgramService implements IProgramService {
  getPrograms(options?: { signal?: AbortSignal }) {
    return request<Program[]>("/api/programs", "GET", undefined, options);
  }
  getProgramById(id: string, options?: { signal?: AbortSignal }) {
    return request<Program | null>(`/api/programs/${encodeURIComponent(id)}`, "GET", undefined, options);
  }
  createProgram(input: CreateProgramInput, coach: User, options?: { signal?: AbortSignal }) {
    return request<Program>("/api/programs", "POST", { ...input, coachId: coach.id, coachName: coach.name }, options);
  }
  deleteProgram(id: string, options?: { signal?: AbortSignal }) {
    return request<{ deletedId: string }>(`/api/programs/${encodeURIComponent(id)}`, "DELETE", undefined, options);
  }
}

class HttpAthleteService implements IAthleteService {
  getAthletes(options?: { signal?: AbortSignal }) {
    return request<AthleteProfile[]>("/api/athletes", "GET", undefined, options);
  }
  getAthleteById(id: string, options?: { signal?: AbortSignal }) {
    return request<AthleteProfile | null>(`/api/athletes/${encodeURIComponent(id)}`, "GET", undefined, options);
  }
  updateProfile(id: string, updates: AthleteProfileUpdateInput, options?: { signal?: AbortSignal }) {
    return request<AthleteProfile>(`/api/athletes/${encodeURIComponent(id)}`, "PUT", updates, options);
  }
  updateStatus(id: string, status: "active" | "needs_attention" | "inactive", options?: { signal?: AbortSignal }) {
    return request<{ id: string; status: string }>(`/api/athletes/${encodeURIComponent(id)}/status`, "PUT", { status }, options);
  }
}

class HttpCheckInService implements ICheckInService {
  submitCheckIn(input: CheckInInput, athleteId: string, athleteName: string, options?: { signal?: AbortSignal }) {
    return request<CheckIn>("/api/check-ins", "POST", { ...input, athleteId, athleteName }, options);
  }
  getRecentCheckIns(athleteId: string, options?: { signal?: AbortSignal }) {
    return request<CheckIn[]>(`/api/check-ins?athleteId=${encodeURIComponent(athleteId)}`, "GET", undefined, options);
  }
}

export const httpBackendAdapter: IBackendServices = {
  workout: new HttpWorkoutService(),
  program: new HttpProgramService(),
  athlete: new HttpAthleteService(),
  checkIn: new HttpCheckInService(),
};
