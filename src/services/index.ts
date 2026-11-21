import { IBackendServices } from "./types";
import { localBackendAdapter } from "./localBackendAdapter";
import { httpBackendAdapter } from "./httpBackendAdapter";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

let activeBackend: IBackendServices =
  env.ENABLE_MOCK_BACKEND || !env.NEXT_PUBLIC_API_URL
    ? localBackendAdapter
    : httpBackendAdapter;

logger.info("Initialized backend service layer", {
  context: {
    mode: activeBackend === localBackendAdapter ? "local_mock" : "http_remote",
    apiUrl: env.NEXT_PUBLIC_API_URL || "local-storage",
  },
});

/**
 * Global Service Accessor.
 * Follows Dependency Inversion: UI components depend on abstract IBackendServices,
 * allowing instant runtime switching between LocalStorage and Remote API without breaking components.
 */
export function getBackendServices(): IBackendServices {
  return activeBackend;
}

export function setBackendAdapter(adapter: IBackendServices) {
  activeBackend = adapter;
  logger.info("Switched active backend adapter", {
    context: { isLocal: adapter === localBackendAdapter },
  });
}

export const workoutService = {
  logSet: (...args: Parameters<IBackendServices["workout"]["logSet"]>) => getBackendServices().workout.logSet(...args),
  logBatch: (...args: Parameters<IBackendServices["workout"]["logBatch"]>) => getBackendServices().workout.logBatch(...args),
  undoSets: (...args: Parameters<IBackendServices["workout"]["undoSets"]>) => getBackendServices().workout.undoSets(...args),
  getRecentSets: (...args: Parameters<IBackendServices["workout"]["getRecentSets"]>) => getBackendServices().workout.getRecentSets(...args),
};

export const programService = {
  getPrograms: (...args: Parameters<IBackendServices["program"]["getPrograms"]>) => getBackendServices().program.getPrograms(...args),
  getProgramById: (...args: Parameters<IBackendServices["program"]["getProgramById"]>) => getBackendServices().program.getProgramById(...args),
  createProgram: (...args: Parameters<IBackendServices["program"]["createProgram"]>) => getBackendServices().program.createProgram(...args),
  deleteProgram: (...args: Parameters<IBackendServices["program"]["deleteProgram"]>) => getBackendServices().program.deleteProgram(...args),
};

export const athleteService = {
  getAthletes: (...args: Parameters<IBackendServices["athlete"]["getAthletes"]>) => getBackendServices().athlete.getAthletes(...args),
  getAthleteById: (...args: Parameters<IBackendServices["athlete"]["getAthleteById"]>) => getBackendServices().athlete.getAthleteById(...args),
  updateProfile: (...args: Parameters<IBackendServices["athlete"]["updateProfile"]>) => getBackendServices().athlete.updateProfile(...args),
  updateStatus: (...args: Parameters<IBackendServices["athlete"]["updateStatus"]>) => getBackendServices().athlete.updateStatus(...args),
};

export const checkInService = {
  submitCheckIn: (...args: Parameters<IBackendServices["checkIn"]["submitCheckIn"]>) => getBackendServices().checkIn.submitCheckIn(...args),
  getRecentCheckIns: (...args: Parameters<IBackendServices["checkIn"]["getRecentCheckIns"]>) => getBackendServices().checkIn.getRecentCheckIns(...args),
};

export * from "./types";
