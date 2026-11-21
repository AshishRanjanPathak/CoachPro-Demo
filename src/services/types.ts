import { WorkoutSet, Program, AthleteProfile, CheckIn, User } from "@/types";
import { WorkoutSetInput, CreateProgramInput, CheckInInput, AthleteProfileUpdateInput } from "@/lib/schemas";

/**
 * Standard Result / Error contracts for Backend services.
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface IWorkoutService {
  logSet(input: WorkoutSetInput, options?: { signal?: AbortSignal; idempotencyKey?: string }): Promise<ServiceResponse<WorkoutSet>>;
  logBatch(sets: WorkoutSetInput[], options?: { signal?: AbortSignal; idempotencyKey?: string }): Promise<ServiceResponse<WorkoutSet[]>>;
  undoSets(setIds: string[], options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ removedCount: number }>>;
  getRecentSets(exerciseId?: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<WorkoutSet[]>>;
}

export interface IProgramService {
  getPrograms(options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program[]>>;
  getProgramById(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program | null>>;
  createProgram(input: CreateProgramInput, coach: User, options?: { signal?: AbortSignal }): Promise<ServiceResponse<Program>>;
  deleteProgram(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ deletedId: string }>>;
}

export interface IAthleteService {
  getAthletes(options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile[]>>;
  getAthleteById(id: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile | null>>;
  updateProfile(id: string, updates: AthleteProfileUpdateInput, options?: { signal?: AbortSignal }): Promise<ServiceResponse<AthleteProfile>>;
  updateStatus(id: string, status: "active" | "needs_attention" | "inactive", options?: { signal?: AbortSignal }): Promise<ServiceResponse<{ id: string; status: string }>>;
}

export interface ICheckInService {
  submitCheckIn(input: CheckInInput, athleteId: string, athleteName: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<CheckIn>>;
  getRecentCheckIns(athleteId: string, options?: { signal?: AbortSignal }): Promise<ServiceResponse<CheckIn[]>>;
}

export interface IBackendServices {
  workout: IWorkoutService;
  program: IProgramService;
  athlete: IAthleteService;
  checkIn: ICheckInService;
}
