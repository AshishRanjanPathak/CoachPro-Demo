import { IBackendServices, IWorkoutService, IProgramService, IAthleteService, ICheckInService, ServiceResponse } from "./types";
import { WorkoutSet, Program, AthleteProfile, CheckIn, User } from "@/types";
import {
  workoutSetInputSchema,
  batchWorkoutSetsInputSchema,
  createProgramInputSchema,
  checkInInputSchema,
  athleteProfileUpdateSchema,
  WorkoutSetInput,
  CreateProgramInput,
  CheckInInput,
  AthleteProfileUpdateInput
} from "@/lib/schemas";
import { loadSavedState, saveState } from "@/lib/store";
import { logger } from "@/lib/logger";

// In-memory idempotency cache to prevent duplicate mutations on network retries
const processedIdempotencyKeys = new Map<string, unknown>();

class LocalWorkoutService implements IWorkoutService {
  async logSet(input: WorkoutSetInput, options?: { signal?: AbortSignal; idempotencyKey?: string }): Promise<ServiceResponse<WorkoutSet>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    if (options?.idempotencyKey && processedIdempotencyKeys.has(options.idempotencyKey)) {
      logger.info("Idempotent hit for workout set log", { context: { key: options.idempotencyKey } });
      return { success: true, data: processedIdempotencyKeys.get(options.idempotencyKey) as WorkoutSet };
    }

    const validation = workoutSetInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid workout set payload", details: validation.error.flatten() }
      };
    }

    const set: WorkoutSet = {
      ...validation.data,
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      completedAt: new Date().toISOString()
    };

    const state = loadSavedState();
    const updatedSets = [set, ...state.activeSession.sets];
    saveState({
      ...state,
      activeSession: { ...state.activeSession, sets: updatedSets }
    });

    if (options?.idempotencyKey) {
      processedIdempotencyKeys.set(options.idempotencyKey, set);
    }

    logger.debug("Logged single workout set locally", { context: { setId: set.id, exercise: set.exerciseName } });
    return { success: true, data: set };
  }

  async logBatch(setsInput: WorkoutSetInput[], options?: { signal?: AbortSignal; idempotencyKey?: string }): Promise<ServiceResponse<WorkoutSet[]>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    if (options?.idempotencyKey && processedIdempotencyKeys.has(options.idempotencyKey)) {
      logger.info("Idempotent hit for batch workout set log", { context: { key: options.idempotencyKey } });
      return { success: true, data: processedIdempotencyKeys.get(options.idempotencyKey) as WorkoutSet[] };
    }

    const validation = batchWorkoutSetsInputSchema.safeParse({ sets: setsInput });
    if (!validation.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid batch sets payload", details: validation.error.flatten() }
      };
    }

    const now = new Date().toISOString();
    const createdSets: WorkoutSet[] = validation.data.sets.map((item, i) => ({
      ...item,
      id: `set-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      completedAt: now
    }));

    const state = loadSavedState();
    const updatedSets = [...createdSets, ...state.activeSession.sets];
    saveState({
      ...state,
      activeSession: { ...state.activeSession, sets: updatedSets }
    });

    if (options?.idempotencyKey) {
      processedIdempotencyKeys.set(options.idempotencyKey, createdSets);
    }

    logger.info("Logged batch workout sets locally", { context: { count: createdSets.length } });
    return { success: true, data: createdSets };
  }

  async undoSets(setIds: string[], options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ removedCount: number }>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    const state = loadSavedState();
    const remainingSets = state.activeSession.sets.filter(s => !setIds.includes(s.id));
    const removedCount = state.activeSession.sets.length - remainingSets.length;

    saveState({
      ...state,
      activeSession: { ...state.activeSession, sets: remainingSets }
    });

    return { success: true, data: { removedCount } };
  }

  async getRecentSets(exerciseId?: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<WorkoutSet[]>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const sets = exerciseId
      ? state.activeSession.sets.filter(s => s.exerciseId === exerciseId)
      : state.activeSession.sets;
    return { success: true, data: sets };
  }
}

class LocalProgramService implements IProgramService {
  async getPrograms(options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program[]>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    return { success: true, data: state.programs };
  }

  async getProgramById(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program | null>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const prog = state.programs.find(p => p.id === id) || null;
    return { success: true, data: prog };
  }

  async createProgram(input: CreateProgramInput, coach: User, options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    const validation = createProgramInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid program structure", details: validation.error.flatten() }
      };
    }

    const newProg: Program = {
      ...validation.data,
      id: `prog-${Date.now()}`,
      coachId: coach.id,
      coachName: coach.name,
      days: validation.data.days.map((d, dIdx) => ({
        ...d,
        id: d.id || `day-${Date.now()}-${dIdx}`,
        prescriptions: d.prescriptions.map((rx, rIdx) => ({
          ...rx,
          id: rx.id || `rx-${Date.now()}-${dIdx}-${rIdx}`,
          repTarget: String(rx.repTarget),
          restSeconds: rx.restSeconds ?? 90,
        }))
      }))
    };

    const state = loadSavedState();
    saveState({
      ...state,
      programs: [newProg, ...state.programs]
    });

    return { success: true, data: newProg };
  }

  async deleteProgram(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ deletedId: string }>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const remaining = state.programs.filter(p => p.id !== id);
    saveState({
      ...state,
      programs: remaining
    });
    return { success: true, data: { deletedId: id } };
  }
}

class LocalAthleteService implements IAthleteService {
  async getAthletes(options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile[]>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    return { success: true, data: state.athletes };
  }

  async getAthleteById(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile | null>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const athlete = state.athletes.find(a => a.id === id) || null;
    return { success: true, data: athlete };
  }

  async updateProfile(id: string, updates: AthleteProfileUpdateInput, options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    const validation = athleteProfileUpdateSchema.safeParse(updates);
    if (!validation.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid profile data", details: validation.error.flatten() }
      };
    }

    const state = loadSavedState();
    const idx = state.athletes.findIndex(a => a.id === id);
    if (idx === -1) {
      return { success: false, error: { code: "NOT_FOUND", message: `Athlete ${id} not found` } };
    }

    const updated = { ...state.athletes[idx], ...validation.data };
    const updatedList = [...state.athletes];
    updatedList[idx] = updated;

    saveState({
      ...state,
      athletes: updatedList
    });

    return { success: true, data: updated };
  }

  async updateStatus(id: string, status: "active" | "needs_attention" | "inactive", options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ id: string; status: string }>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const updatedList = state.athletes.map(ath => (ath.id === id ? { ...ath, status } : ath));
    saveState({
      ...state,
      athletes: updatedList
    });
    return { success: true, data: { id, status } };
  }
}

class LocalCheckInService implements ICheckInService {
  async submitCheckIn(input: CheckInInput, athleteId: string, athleteName: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<CheckIn>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }

    const validation = checkInInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid check-in payload", details: validation.error.flatten() }
      };
    }

    const checkIn: CheckIn = {
      ...validation.data,
      id: `chk-${Date.now()}`,
      athleteId,
      athleteName,
      date: new Date().toISOString().substring(0, 10)
    };

    const state = loadSavedState();
    saveState({
      ...state,
      checkIns: [checkIn, ...state.checkIns]
    });

    return { success: true, data: checkIn };
  }

  async getRecentCheckIns(athleteId: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<CheckIn[]>> {
    if (options?.signal?.aborted) {
      return { success: false, error: { code: "ABORTED", message: "Request was cancelled" } };
    }
    const state = loadSavedState();
    const list = state.checkIns.filter(c => c.athleteId === athleteId);
    return { success: true, data: list };
  }
}

export const localBackendAdapter: IBackendServices = {
  workout: new LocalWorkoutService(),
  program: new LocalProgramService(),
  athlete: new LocalAthleteService(),
  checkIn: new LocalCheckInService()
};
