"use client";

import {
  User,
  Exercise,
  Program,
  WorkoutSession,
  AthleteProfile,
  CoachNote,
  CheckIn,
  Invoice,
  AuditEvent,
  UserRole,
  Message
} from "@/types";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-athlete-1",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    role: "athlete",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    organizationId: "org-1",
    organizationName: "Apex High Performance"
  },
  {
    id: "usr-coach-1",
    name: "Sarah Jenkins, CSCS",
    email: "sarah@apexperformance.com",
    role: "coach",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    organizationId: "org-1",
    organizationName: "Apex High Performance"
  },
  {
    id: "usr-admin-1",
    name: "Marcus Vance",
    email: "marcus@apexperformance.com",
    role: "org_admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    organizationId: "org-1",
    organizationName: "Apex High Performance"
  },
  {
    id: "usr-plat-1",
    name: "Elena Rostova",
    email: "elena@coachpro.io",
    role: "platform_admin",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    organizationId: "org-platform",
    organizationName: "CoachPRO HQ"
  }
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: "ex-1",
    name: "Barbell Back Squat",
    category: "barbell",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "core"],
    equipment: "Barbell, Squat Rack",
    movementPattern: "Squat",
    instructions: "Brace core, descend hips back and down until thighs pass parallel. Drive through midfoot.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-2",
    name: "Barbell Bench Press",
    category: "barbell",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders", "arms"],
    equipment: "Barbell, Flat Bench",
    movementPattern: "Horizontal Push",
    instructions: "Retract scapulae, lower bar under control to sternum, press explosively locking out elbows.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-3",
    name: "Conventional Deadlift",
    category: "barbell",
    primaryMuscle: "hamstrings",
    secondaryMuscles: ["glutes", "back", "core"],
    equipment: "Barbell, Plates",
    movementPattern: "Hinge",
    instructions: "Hinge at hips, grip bar firmly, engage lats, push floor away through the heels.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-4",
    name: "Overhead Press",
    category: "barbell",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["arms", "core"],
    equipment: "Barbell",
    movementPattern: "Vertical Push",
    instructions: "Press bar straight overhead moving head back to clear path, lock out overhead with ribs down.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-5",
    name: "Weighted Pull-Up",
    category: "bodyweight",
    primaryMuscle: "back",
    secondaryMuscles: ["arms", "core"],
    equipment: "Pull-Up Bar, Dip Belt",
    movementPattern: "Vertical Pull",
    instructions: "From full hang, pull chest to bar leading with elbows. Control descent.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-6",
    name: "Romanian Deadlift",
    category: "barbell",
    primaryMuscle: "hamstrings",
    secondaryMuscles: ["glutes", "back"],
    equipment: "Barbell",
    movementPattern: "Hinge",
    instructions: "Soft knees, push hips back maintaining flat back until deep hamstring stretch. Return by driving hips forward.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-7",
    name: "Incline Dumbbell Press",
    category: "dumbbell",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders", "arms"],
    equipment: "Incline Bench, Dumbbells",
    movementPattern: "Horizontal Push",
    instructions: "Set bench at 30 degrees. Press dumbbells up and slightly inward over clavicles.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-8",
    name: "Chest Supported T-Bar Row",
    category: "machine",
    primaryMuscle: "back",
    secondaryMuscles: ["arms"],
    equipment: "Row Machine",
    movementPattern: "Horizontal Pull",
    instructions: "Drive elbows behind ribcage, squeeze upper back for 1 second, control the eccentric.",
    trackingMethod: "weight_reps"
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    title: "Apex Strength & Hypertrophy Block A",
    description: "4-week undulating periodization focused on squat and bench press volume progression.",
    coachId: "usr-coach-1",
    coachName: "Sarah Jenkins, CSCS",
    targetWeeks: 4,
    level: "intermediate",
    days: [
      {
        id: "day-1",
        name: "Day 1: Lower Body Strength (Squat Focus)",
        dayNumber: 1,
        prescriptions: [
          {
            id: "rx-1",
            exerciseId: "ex-1",
            exerciseName: "Barbell Back Squat",
            sets: 4,
            repTarget: "5",
            targetLoadKg: 140,
            targetRpe: 8,
            restSeconds: 180,
            notes: "Focus on controlled 3-second eccentric."
          },
          {
            id: "rx-2",
            exerciseId: "ex-6",
            exerciseName: "Romanian Deadlift",
            sets: 3,
            repTarget: "8-10",
            targetLoadKg: 100,
            targetRpe: 7.5,
            restSeconds: 120,
            notes: "Deep hamstring stretch, no lumbar flexion."
          }
        ]
      },
      {
        id: "day-2",
        name: "Day 2: Upper Body Power (Bench Focus)",
        dayNumber: 2,
        prescriptions: [
          {
            id: "rx-3",
            exerciseId: "ex-2",
            exerciseName: "Barbell Bench Press",
            sets: 4,
            repTarget: "6",
            targetLoadKg: 102.5,
            targetRpe: 8,
            restSeconds: 150,
            notes: "Pause 1 sec at sternum on every rep."
          },
          {
            id: "rx-4",
            exerciseId: "ex-5",
            exerciseName: "Weighted Pull-Up",
            sets: 3,
            repTarget: "6",
            targetLoadKg: 15,
            targetRpe: 8,
            restSeconds: 120
          }
        ]
      }
    ]
  }
];

export const INITIAL_ATHLETES: AthleteProfile[] = [
  {
    id: "ath-2",
    name: "Maya Patel",
    email: "maya.patel@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 18,
    adherencePercentage: 72,
    currentStreakDays: 1,
    lastWorkoutDate: "2026-10-24",
    recentPrCount: 1,
    trainingGoal: "Posterior chain rehab and deadlift rebuilding",
    fatigueLevel: "high",
    readinessScore: 4,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Right Patellar Tendon",
      severity: "moderate",
      details: "Sharp anterior knee pain during squats below parallel (>100kg).",
      flaggedAt: "2026-10-26"
    },
    priorityRank: 1 // Highest priority in Attention Queue!
  },
  {
    id: "ath-3",
    name: "Jordan Taylor",
    email: "jordan.t@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 21,
    adherencePercentage: 80,
    currentStreakDays: 2,
    lastWorkoutDate: "2026-10-25",
    recentPrCount: 2,
    trainingGoal: "Off-season rugby strength and durability",
    fatigueLevel: "moderate",
    readinessScore: 6,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Lumbar Spine / Lower Back",
      severity: "mild",
      details: "Mild stiffness following heavy deadlifts, requests deload on RDL.",
      flaggedAt: "2026-10-25"
    },
    priorityRank: 2
  },
  {
    id: "usr-athlete-1",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    status: "active",
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 24,
    adherencePercentage: 94,
    currentStreakDays: 5,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 3,
    trainingGoal: "Squat 180kg / Bench 130kg target for regional meet",
    fatigueLevel: "low",
    readinessScore: 9,
    injuryStatus: {
      hasInjury: false,
      injuryLocation: "None",
      severity: "mild",
      details: "No acute pain, full mobility.",
      flaggedAt: "2026-10-26"
    },
    priorityRank: 3
  }
];

export const INITIAL_WORKOUT_SESSION: WorkoutSession = {
  id: "session-today",
  athleteId: "usr-athlete-1",
  programId: "prog-1",
  programTitle: "Apex Strength & Hypertrophy Block A",
  dayName: "Day 1: Lower Body Strength (Squat Focus)",
  dayNumber: 1,
  status: "in_progress",
  startedAt: "2026-10-27T08:30:00.000Z",
  sets: [
    {
      id: "set-1",
      exerciseId: "ex-1",
      exerciseName: "Barbell Back Squat",
      setNumber: 1,
      prescribedWeightKg: 140,
      prescribedReps: 5,
      completedWeightKg: 140,
      completedReps: 5,
      rpe: 7.5,
      isPr: false,
      completedAt: "2026-10-27T08:45:00.000Z"
    },
    {
      id: "set-2",
      exerciseId: "ex-1",
      exerciseName: "Barbell Back Squat",
      setNumber: 2,
      prescribedWeightKg: 140,
      prescribedReps: 5,
      completedWeightKg: 142.5,
      completedReps: 5,
      rpe: 8,
      isPr: true,
      completedAt: "2026-10-27T08:50:00.000Z"
    }
  ]
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-alex-sarah",
    senderId: "usr-athlete-1",
    senderName: "Alex Chen",
    senderRole: "athlete",
    recipientId: "usr-coach-1",
    content: "Coach Sarah, hit 142.5kg on squats today! Bar speed felt fast, zero knee discomfort.",
    timestamp: "2026-10-26 18:55",
    isRead: true
  },
  {
    id: "msg-2",
    conversationId: "conv-alex-sarah",
    senderId: "usr-coach-1",
    senderName: "Sarah Jenkins, CSCS",
    senderRole: "coach",
    recipientId: "usr-athlete-1",
    content: "Saw the velocity logs Alex, incredible work. We will add 2.5kg to your working sets next block.",
    timestamp: "2026-10-26 19:10",
    isRead: true
  },
  {
    id: "msg-3",
    conversationId: "conv-maya-sarah",
    senderId: "ath-2",
    senderName: "Maya Patel",
    senderRole: "athlete",
    recipientId: "usr-coach-1",
    content: "Hi Coach, my right patellar tendon flared up during warmups. I stopped before heavy squats.",
    timestamp: "2026-10-26 16:30",
    isRead: false
  }
];

export const INITIAL_COACH_NOTES: CoachNote[] = [
  {
    id: "note-1",
    athleteId: "usr-athlete-1",
    coachId: "usr-coach-1",
    authorName: "Sarah Jenkins, CSCS",
    content: "Alex hit a solid 142.5kg x 5 on squat with zero knee cave. Bar speed remained above 0.45 m/s. Ready to increase load next cycle.",
    isPrivate: false,
    createdAt: "2026-10-26T14:30:00Z"
  },
  {
    id: "note-2",
    athleteId: "ath-2",
    coachId: "usr-coach-1",
    authorName: "Sarah Jenkins, CSCS",
    content: "URGENT: Maya reported patellar tendon pain. Swapping back squats for Spanish squats & leg press deload until evaluated.",
    isPrivate: true,
    createdAt: "2026-10-26T17:00:00Z"
  }
];

export const INITIAL_CHECKINS: CheckIn[] = [
  {
    id: "chk-1",
    athleteId: "usr-athlete-1",
    athleteName: "Alex Chen",
    date: "2026-10-27",
    readinessScore: 9,
    sorenessScore: 2,
    fatigueLevel: "low",
    sleepHours: 8.2,
    hasInjury: false,
    notes: "Feeling well recovered, slept 8+ hours."
  },
  {
    id: "chk-2",
    athleteId: "ath-2",
    athleteName: "Maya Patel",
    date: "2026-10-26",
    readinessScore: 4,
    sorenessScore: 4,
    fatigueLevel: "high",
    sleepHours: 5.5,
    hasInjury: true,
    injuryLocation: "Right Patellar Tendon",
    injurySeverity: "moderate",
    injuryNotes: "Sharp pain on knee flexion under load.",
    notes: "High fatigue from travel, knee painful."
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-2026-001",
    date: "2026-10-01",
    amount: 199.00,
    currency: "USD",
    status: "paid",
    planName: "Pro Coach (Tier 2 - Up to 25 Athletes)"
  },
  {
    id: "INV-2026-002",
    date: "2026-09-01",
    amount: 199.00,
    currency: "USD",
    status: "paid",
    planName: "Pro Coach (Tier 2 - Up to 25 Athletes)"
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "audit-1",
    timestamp: "2026-10-27 10:14:02",
    actorName: "Sarah Jenkins (Coach)",
    action: "Assigned Program Block A",
    target: "Alex Chen (Athlete)",
    status: "success"
  },
  {
    id: "audit-2",
    timestamp: "2026-10-26 18:45:12",
    actorName: "Alex Chen (Athlete)",
    action: "Recorded Workout Set (142.5kg x 5 PR)",
    target: "Barbell Back Squat",
    status: "success"
  },
  {
    id: "audit-3",
    timestamp: "2026-10-26 16:35:00",
    actorName: "Maya Patel (Athlete)",
    action: "Flagged Injury: Right Patellar Tendon",
    target: "Medical Attention Queue",
    status: "warning"
  }
];

const STORAGE_KEY = "coachpro_state_v2";

export interface CoachProState {
  currentRole: UserRole;
  users: User[];
  athletes: AthleteProfile[];
  exercises: Exercise[];
  programs: Program[];
  activeSession: WorkoutSession;
  notes: CoachNote[];
  checkIns: CheckIn[];
  messages: Message[];
  invoices: Invoice[];
  auditLogs: AuditEvent[];
}

export function loadSavedState(): CoachProState {
  if (typeof window === "undefined") {
    return {
      currentRole: "athlete",
      users: INITIAL_USERS,
      athletes: INITIAL_ATHLETES,
      exercises: INITIAL_EXERCISES,
      programs: INITIAL_PROGRAMS,
      activeSession: INITIAL_WORKOUT_SESSION,
      notes: INITIAL_COACH_NOTES,
      checkIns: INITIAL_CHECKINS,
      messages: INITIAL_MESSAGES,
      invoices: INITIAL_INVOICES,
      auditLogs: INITIAL_AUDIT_LOGS
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: CoachProState = {
        currentRole: "athlete",
        users: INITIAL_USERS,
        athletes: INITIAL_ATHLETES,
        exercises: INITIAL_EXERCISES,
        programs: INITIAL_PROGRAMS,
        activeSession: INITIAL_WORKOUT_SESSION,
        notes: INITIAL_COACH_NOTES,
        checkIns: INITIAL_CHECKINS,
        messages: INITIAL_MESSAGES,
        invoices: INITIAL_INVOICES,
        auditLogs: INITIAL_AUDIT_LOGS
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      currentRole: "athlete",
      users: INITIAL_USERS,
      athletes: INITIAL_ATHLETES,
      exercises: INITIAL_EXERCISES,
      programs: INITIAL_PROGRAMS,
      activeSession: INITIAL_WORKOUT_SESSION,
      notes: INITIAL_COACH_NOTES,
      checkIns: INITIAL_CHECKINS,
      messages: INITIAL_MESSAGES,
      invoices: INITIAL_INVOICES,
      auditLogs: INITIAL_AUDIT_LOGS
    };
  }
}

export function saveState(state: CoachProState) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save CoachPRO state", e);
    }
  }
}
