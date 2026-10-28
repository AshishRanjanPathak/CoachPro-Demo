"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, User, WorkoutSet, CoachNote, CheckIn, Program, AthleteProfile, Message } from "@/types";
import { loadSavedState, saveState, CoachProState, INITIAL_ATHLETES } from "@/lib/store";

interface AuthContextType {
  state: CoachProState;
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: User;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  addWorkoutSet: (set: Omit<WorkoutSet, "id" | "completedAt">) => void;
  completeWorkoutSession: () => void;
  resetWorkoutSession: () => void;
  addCoachNote: (athleteId: string, content: string, isPrivate: boolean) => void;
  addCheckIn: (checkInData: Omit<CheckIn, "id" | "date" | "athleteId" | "athleteName">) => void;
  sendMessage: (recipientId: string, content: string) => void;
  adjustPrescription: (programId: string, dayId: string, rxId: string, updates: Partial<{ exerciseId: string; exerciseName: string; targetLoadKg: number; repTarget: string; sets: number; notes: string }>) => void;
  addProgram: (program: Program) => void;
  updateAthleteStatus: (athleteId: string, status: 'active' | 'needs_attention' | 'inactive') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CoachProState>(loadSavedState);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Ensure that state.athletes always contains all 20 INITIAL_ATHLETES even if an older state was in localStorage
  useEffect(() => {
    setState(prev => {
      if (!prev.athletes || prev.athletes.length < INITIAL_ATHLETES.length) {
        return { ...prev, athletes: INITIAL_ATHLETES };
      }
      return prev;
    });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentRole = state.currentRole;
  const currentUser = state.users.find(u => u.role === currentRole) || state.users[0];

  const login = (role: UserRole, email?: string) => {
    setState(prev => ({ ...prev, currentRole: role }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const setRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentRole: role }));
  };

  const addWorkoutSet = (setData: Omit<WorkoutSet, "id" | "completedAt">) => {
    const newSet: WorkoutSet = {
      ...setData,
      id: `set-${Date.now()}`,
      completedAt: new Date().toISOString()
    };

    setState(prev => {
      const updatedSets = [...prev.activeSession.sets, newSet];
      const updatedSession = {
        ...prev.activeSession,
        status: "in_progress" as const,
        sets: updatedSets
      };

      const auditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: `${currentUser.name} (${currentUser.role})`,
        action: `Logged Set: ${newSet.exerciseName} (${newSet.completedWeightKg}kg x ${newSet.completedReps} reps)`,
        target: newSet.exerciseName,
        status: "success" as const
      };

      return {
        ...prev,
        activeSession: updatedSession,
        auditLogs: [auditEvent, ...prev.auditLogs]
      };
    });
  };

  const completeWorkoutSession = () => {
    setState(prev => {
      const completedSession = {
        ...prev.activeSession,
        status: "completed" as const,
        completedAt: new Date().toISOString()
      };

      const updatedAthletes = prev.athletes.map(ath => {
        if (ath.id === prev.activeSession.athleteId) {
          return {
            ...ath,
            totalWorkoutsCompleted: ath.totalWorkoutsCompleted + 1,
            currentStreakDays: ath.currentStreakDays + 1,
            lastWorkoutDate: new Date().toISOString().substring(0, 10),
            adherencePercentage: Math.min(100, ath.adherencePercentage + 2)
          };
        }
        return ath;
      });

      const auditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: `${currentUser.name} (Athlete)`,
        action: `Completed Workout: ${prev.activeSession.dayName}`,
        target: prev.activeSession.programTitle,
        status: "success" as const
      };

      return {
        ...prev,
        activeSession: completedSession,
        athletes: updatedAthletes,
        auditLogs: [auditEvent, ...prev.auditLogs]
      };
    });
  };

  const resetWorkoutSession = () => {
    setState(prev => ({
      ...prev,
      activeSession: {
        id: `session-${Date.now()}`,
        athleteId: "usr-athlete-1",
        programId: "prog-1",
        programTitle: "Apex Strength & Hypertrophy Block A",
        dayName: "Day 1: Lower Body Strength (Squat Focus)",
        dayNumber: 1,
        status: "in_progress",
        startedAt: "2026-10-27T08:30:00.000Z",
        sets: []
      }
    }));
  };

  const addCoachNote = (athleteId: string, content: string, isPrivate: boolean) => {
    const newNote: CoachNote = {
      id: `note-${Date.now()}`,
      athleteId,
      coachId: currentUser.id,
      authorName: currentUser.name,
      content,
      isPrivate,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
  };

  const addCheckIn = (data: Omit<CheckIn, "id" | "date" | "athleteId" | "athleteName">) => {
    const newCheckIn: CheckIn = {
      ...data,
      id: `chk-${Date.now()}`,
      athleteId: currentUser.id,
      athleteName: currentUser.name,
      date: new Date().toISOString().substring(0, 10)
    };

    setState(prev => {
      // Update athlete's current recovery and injury status
      const updatedAthletes = prev.athletes.map(ath => {
        if (ath.id === currentUser.id) {
          const isInjured = data.hasInjury;
          return {
            ...ath,
            readinessScore: data.readinessScore,
            fatigueLevel: data.fatigueLevel,
            status: isInjured ? ("needs_attention" as const) : ath.status,
            priorityRank: isInjured ? 1 : data.fatigueLevel === "high" || data.fatigueLevel === "severe" ? 2 : 3,
            injuryStatus: isInjured
              ? {
                  hasInjury: true,
                  injuryLocation: data.injuryLocation || "General pain",
                  severity: data.injurySeverity || "moderate",
                  details: data.injuryNotes || "Reported during daily check-in",
                  flaggedAt: new Date().toISOString().substring(0, 10)
                }
              : ath.injuryStatus
          };
        }
        return ath;
      });

      const auditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: `${currentUser.name} (Athlete)`,
        action: data.hasInjury ? `FLAGGED INJURY: ${data.injuryLocation}` : `Logged Recovery Check-In (Readiness ${data.readinessScore}/10)`,
        target: "Coach Attention Queue",
        status: data.hasInjury ? ("warning" as const) : ("success" as const)
      };

      return {
        ...prev,
        checkIns: [newCheckIn, ...prev.checkIns],
        athletes: updatedAthletes,
        auditLogs: [auditEvent, ...prev.auditLogs]
      };
    });
  };

  const sendMessage = (recipientId: string, content: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${currentUser.id}-${recipientId}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId,
      content,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      isRead: false
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));
  };

  const adjustPrescription = (
    programId: string,
    dayId: string,
    rxId: string,
    updates: Partial<{ exerciseId: string; exerciseName: string; targetLoadKg: number; repTarget: string; sets: number; notes: string }>
  ) => {
    setState(prev => {
      const updatedPrograms = prev.programs.map(prog => {
        if (prog.id === programId) {
          return {
            ...prog,
            days: prog.days.map(day => {
              if (day.id === dayId) {
                return {
                  ...day,
                  prescriptions: day.prescriptions.map(rx => {
                    if (rx.id === rxId) {
                      return { ...rx, ...updates };
                    }
                    return rx;
                  })
                };
              }
              return day;
            })
          };
        }
        return prog;
      });

      const auditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        actorName: `${currentUser.name} (Coach)`,
        action: `Adjusted Prescription: ${updates.exerciseName || "Exercise"} to ${updates.targetLoadKg}kg`,
        target: "Program Prescription",
        status: "success" as const
      };

      return {
        ...prev,
        programs: updatedPrograms,
        auditLogs: [auditEvent, ...prev.auditLogs]
      };
    });
  };

  const addProgram = (program: Program) => {
    setState(prev => ({
      ...prev,
      programs: [program, ...prev.programs]
    }));
  };

  const updateAthleteStatus = (athleteId: string, status: 'active' | 'needs_attention' | 'inactive') => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(ath => ath.id === athleteId ? { ...ath, status } : ath)
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        logout,
        setRole,
        addWorkoutSet,
        completeWorkoutSession,
        resetWorkoutSession,
        addCoachNote,
        addCheckIn,
        sendMessage,
        adjustPrescription,
        addProgram,
        updateAthleteStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
