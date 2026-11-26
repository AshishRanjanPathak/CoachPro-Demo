"use client";

import {
  User,
  Exercise,
  Program,
  ProgramDay,
  ExercisePrescription,
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
  },
  {
    id: "ex-9",
    name: "Push-ups",
    category: "bodyweight",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders", "arms", "core"],
    equipment: "Bodyweight",
    movementPattern: "Horizontal Push",
    instructions: "Keep body in straight rigid line. Lower chest to floor, press up locking elbows.",
    trackingMethod: "bodyweight_reps"
  },
  {
    id: "ex-10",
    name: "Standard Plank",
    category: "bodyweight",
    primaryMuscle: "core",
    secondaryMuscles: ["shoulders", "glutes"],
    equipment: "Mat",
    movementPattern: "Isometric Core",
    instructions: "Hold rigid plank on forearms and toes. Breathe rhythmically without sagging hips.",
    trackingMethod: "isometric"
  },
  {
    id: "ex-11",
    name: "Treadmill Running / Walking",
    category: "cardio",
    primaryMuscle: "full_body",
    secondaryMuscles: ["quadriceps", "hamstrings", "glutes"],
    equipment: "Treadmill",
    movementPattern: "Gait / Aerobic",
    instructions: "Steady aerobic pace with upright posture and neutral foot strike.",
    trackingMethod: "distance_duration"
  },
  {
    id: "ex-12",
    name: "Stationary Cycling",
    category: "cardio",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["hamstrings", "glutes"],
    equipment: "Stationary Bike",
    movementPattern: "Cyclical Ergometer",
    instructions: "Maintain smooth cadence between 80-95 RPM with constant tension.",
    trackingMethod: "distance_duration"
  },
  {
    id: "ex-13",
    name: "Dumbbell Bicep Curl",
    category: "dumbbell",
    primaryMuscle: "arms",
    secondaryMuscles: [],
    equipment: "Dumbbells",
    movementPattern: "Elbow Flexion",
    instructions: "Pin elbows to ribs, curl dumbbells while supinating wrists at top.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-14",
    name: "Leg Press",
    category: "machine",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes"],
    equipment: "45-Degree Leg Press",
    movementPattern: "Squat Machine",
    instructions: "Feet hip-width on sled. Lower smoothly to 90 degrees, press through heels without locking knees.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-15",
    name: "Leg Extension",
    category: "machine",
    primaryMuscle: "quadriceps",
    secondaryMuscles: [],
    equipment: "Leg Extension Machine",
    movementPattern: "Knee Extension",
    instructions: "Extend legs fully, pause 1 second at top contraction, lower slowly.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-16",
    name: "Walking Lunges",
    category: "dumbbell",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings"],
    equipment: "Dumbbells",
    movementPattern: "Lunge",
    instructions: "Step forward into deep lunge, back knee kissing floor, drive up through front heel.",
    trackingMethod: "weight_reps"
  },
  {
    id: "ex-17",
    name: "Parallel Bar Dips",
    category: "bodyweight",
    primaryMuscle: "chest",
    secondaryMuscles: ["arms", "shoulders"],
    equipment: "Dip Bars",
    movementPattern: "Vertical Push",
    instructions: "Lower until shoulders drop slightly below elbows, press upward locking arms.",
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
    squad: "Powerlifting Prep",
    sleepHours: 5.5,
    age: 24,
    heightCm: 165,
    weightKg: 62.0,
    experienceLevel: "Intermediate Lifter (2 yrs)",
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
    squad: "Collegiate Rugby",
    sleepHours: 6.5,
    age: 21,
    heightCm: 182,
    weightKg: 91.0,
    experienceLevel: "Collegiate Athlete",
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
    squad: "Powerlifting Prep",
    sleepHours: 8.2,
    age: 26,
    heightCm: 178,
    weightKg: 83.5,
    experienceLevel: "Intermediate Lifter (3 yrs)",
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
  },
  {
    id: "ath-4",
    name: "Devon Brooks",
    email: "devon.b@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    squad: "Rehab & Return-to-Play",
    sleepHours: 5.0,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 14,
    adherencePercentage: 64,
    currentStreakDays: 0,
    lastWorkoutDate: "2026-10-23",
    recentPrCount: 0,
    trainingGoal: "Rotator cuff reconditioning post sub-acromial bursitis",
    fatigueLevel: "severe",
    readinessScore: 3,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Right Shoulder / Impingement",
      severity: "severe",
      details: "Pinching pain when pressing overhead. Needs bench & OHP substituted with landmine press.",
      flaggedAt: "2026-10-27"
    },
    priorityRank: 1
  },
  {
    id: "ath-5",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Olympic Weightlifting",
    sleepHours: 7.8,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 26,
    adherencePercentage: 96,
    currentStreakDays: 6,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 4,
    trainingGoal: "Snatch technique & overhead squat stability",
    fatigueLevel: "low",
    readinessScore: 8,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 4
  },
  {
    id: "ath-6",
    name: "Liam O'Connor",
    email: "liam.oc@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Collegiate Rugby",
    sleepHours: 7.2,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 22,
    adherencePercentage: 88,
    currentStreakDays: 3,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 2,
    trainingGoal: "Sprint power and lower body reactive strength",
    fatigueLevel: "moderate",
    readinessScore: 7,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 5
  },
  {
    id: "ath-7",
    name: "Kavita Rao",
    email: "kavita.r@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Powerlifting Prep",
    sleepHours: 8.0,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 25,
    adherencePercentage: 92,
    currentStreakDays: 4,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 3,
    trainingGoal: "Sumo deadlift lockout mechanics and upper back tightness",
    fatigueLevel: "low",
    readinessScore: 9,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 6
  },
  {
    id: "ath-8",
    name: "Marcus Vance Jr.",
    email: "marcus.jr@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    squad: "Collegiate Rugby",
    sleepHours: 5.8,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 16,
    adherencePercentage: 70,
    currentStreakDays: 1,
    lastWorkoutDate: "2026-10-25",
    recentPrCount: 1,
    trainingGoal: "Hypertrophy for front row prop positioning",
    fatigueLevel: "high",
    readinessScore: 5,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Hamstring Tendinopathy",
      severity: "mild",
      details: "Proximal hamstring tightness on sprint drills. Deload volume by 20%.",
      flaggedAt: "2026-10-25"
    },
    priorityRank: 2
  },
  {
    id: "ath-9",
    name: "Chloe Dupont",
    email: "chloe.d@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Olympic Weightlifting",
    sleepHours: 8.5,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 27,
    adherencePercentage: 98,
    currentStreakDays: 7,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 5,
    trainingGoal: "Clean & Jerk 110kg qualification",
    fatigueLevel: "low",
    readinessScore: 9,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 7
  },
  {
    id: "ath-10",
    name: "Darius King",
    email: "darius.k@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Rehab & Return-to-Play",
    sleepHours: 7.0,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 19,
    adherencePercentage: 84,
    currentStreakDays: 2,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 1,
    trainingGoal: "ACL reconstruction phase 4 return-to-load",
    fatigueLevel: "moderate",
    readinessScore: 6,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Left Knee ACL Rehab",
      severity: "mild",
      details: "Cleared for 80% load bilateral squats. No unilateral plyometrics yet.",
      flaggedAt: "2026-10-24"
    },
    priorityRank: 3
  },
  {
    id: "ath-11",
    name: "Elena Rostova-Cole",
    email: "elena.rc@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Powerlifting Prep",
    sleepHours: 7.9,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 23,
    adherencePercentage: 90,
    currentStreakDays: 4,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 2,
    trainingGoal: "Bench press arch technique and paused reps",
    fatigueLevel: "low",
    readinessScore: 8,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 8
  },
  {
    id: "ath-12",
    name: "Tariq Washington",
    email: "tariq.w@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Collegiate Rugby",
    sleepHours: 7.4,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 20,
    adherencePercentage: 86,
    currentStreakDays: 3,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 2,
    trainingGoal: "Trap bar deadlift and rotational core capacity",
    fatigueLevel: "low",
    readinessScore: 8,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 9
  },
  {
    id: "ath-13",
    name: "Brandon Lee",
    email: "brandon.l@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Powerlifting Prep",
    sleepHours: 8.1,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 22,
    adherencePercentage: 91,
    currentStreakDays: 4,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 2,
    trainingGoal: "Squat depth consistency & hip drive",
    fatigueLevel: "low",
    readinessScore: 8,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 10
  },
  {
    id: "ath-14",
    name: "Aaliyah Davis",
    email: "aaliyah.d@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    squad: "Collegiate Rugby",
    sleepHours: 5.2,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 17,
    adherencePercentage: 74,
    currentStreakDays: 1,
    lastWorkoutDate: "2026-10-25",
    recentPrCount: 1,
    trainingGoal: "Ankle dorsiflexion mobility & change-of-direction power",
    fatigueLevel: "high",
    readinessScore: 4,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Lateral Ankle Sprain (Grade 1)",
      severity: "mild",
      details: "Mild swelling post-match. Bilateral leg press substituted for lunges.",
      flaggedAt: "2026-10-26"
    },
    priorityRank: 2
  },
  {
    id: "ath-15",
    name: "Mateo Rossi",
    email: "mateo.r@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Olympic Weightlifting",
    sleepHours: 7.7,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 25,
    adherencePercentage: 95,
    currentStreakDays: 5,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 3,
    trainingGoal: "Jerk drive height & split footwork",
    fatigueLevel: "low",
    readinessScore: 9,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 11
  },
  {
    id: "ath-16",
    name: "Jessica Wu",
    email: "jessica.w@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Powerlifting Prep",
    sleepHours: 8.3,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 26,
    adherencePercentage: 97,
    currentStreakDays: 6,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 4,
    trainingGoal: "Deadlift breaking the floor & lat engagement",
    fatigueLevel: "low",
    readinessScore: 9,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 12
  },
  {
    id: "ath-17",
    name: "Lucas Silva",
    email: "lucas.s@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Collegiate Rugby",
    sleepHours: 7.0,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 21,
    adherencePercentage: 87,
    currentStreakDays: 3,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 2,
    trainingGoal: "Upper back endurance and scrum stability",
    fatigueLevel: "moderate",
    readinessScore: 7,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 13
  },
  {
    id: "ath-18",
    name: "Hannah Schmidt",
    email: "hannah.s@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Olympic Weightlifting",
    sleepHours: 7.9,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 23,
    adherencePercentage: 89,
    currentStreakDays: 4,
    lastWorkoutDate: "2026-10-26",
    recentPrCount: 3,
    trainingGoal: "Snatch balance and wrist mobility",
    fatigueLevel: "low",
    readinessScore: 8,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 14
  },
  {
    id: "ath-19",
    name: "Oliver Tremblay",
    email: "oliver.t@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    status: "needs_attention",
    squad: "Rehab & Return-to-Play",
    sleepHours: 6.0,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 15,
    adherencePercentage: 68,
    currentStreakDays: 1,
    lastWorkoutDate: "2026-10-24",
    recentPrCount: 1,
    trainingGoal: "Adductor strain recovery & isometric grooving",
    fatigueLevel: "high",
    readinessScore: 5,
    injuryStatus: {
      hasInjury: true,
      injuryLocation: "Right Adductor Longus",
      severity: "moderate",
      details: "Twinge when performing wide stance squats. Switched to narrow stance leg press.",
      flaggedAt: "2026-10-25"
    },
    priorityRank: 2
  },
  {
    id: "ath-20",
    name: "Zara Al-Mansoor",
    email: "zara.m@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    status: "active",
    squad: "Powerlifting Prep",
    sleepHours: 8.4,
    assignedCoachId: "usr-coach-1",
    assignedCoachName: "Sarah Jenkins, CSCS",
    assignedProgramId: "prog-1",
    assignedProgramTitle: "Apex Strength & Hypertrophy Block A",
    totalWorkoutsCompleted: 28,
    adherencePercentage: 100,
    currentStreakDays: 8,
    lastWorkoutDate: "2026-10-27",
    recentPrCount: 4,
    trainingGoal: "National qualifier bench press specialization",
    fatigueLevel: "low",
    readinessScore: 10,
    injuryStatus: { hasInjury: false, injuryLocation: "None", severity: "mild", details: "", flaggedAt: "" },
    priorityRank: 15
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
    content: "Coach Sarah, hit 142.5kg on squats today! Reps felt smooth and strong, zero knee discomfort.",
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
    content: "Saw the session log Alex, incredible work. We will add 2.5kg to your working sets next block.",
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
    content: "Alex hit a solid 142.5kg x 5 on squat with zero knee cave at RPE 8. Ready to increase load next cycle.",
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

const STORAGE_KEY = "coachpro_state_v3";

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

export function createDefaultState(): CoachProState {
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

const VALID_ROLES: UserRole[] = ["athlete", "coach", "org_admin", "platform_admin"];

/**
 * Validates and repairs persisted CoachPRO state so missing or empty
 * collections (e.g. from older storage payloads or deleted templates)
 * never leave screens referencing undefined programs, days, or sessions.
 */
export function normalizeCoachProState(
  rawState: Partial<CoachProState> | null | undefined
): { state: CoachProState; repaired: boolean } {
  const defaults = createDefaultState();
  if (!rawState || typeof rawState !== "object") {
    return { state: defaults, repaired: true };
  }

  let repaired = false;

  const currentRole = VALID_ROLES.includes(rawState.currentRole as UserRole)
    ? (rawState.currentRole as UserRole)
    : ((repaired = true), defaults.currentRole);

  const users =
    Array.isArray(rawState.users) && rawState.users.length > 0
      ? rawState.users
      : ((repaired = true), defaults.users);

  const exercises =
    Array.isArray(rawState.exercises) && rawState.exercises.length >= INITIAL_EXERCISES.length
      ? rawState.exercises
      : ((repaired = true), defaults.exercises);

  let athletes: AthleteProfile[];
  if (!Array.isArray(rawState.athletes) || rawState.athletes.length < INITIAL_ATHLETES.length) {
    athletes = defaults.athletes;
    repaired = true;
  } else {
    athletes = rawState.athletes.map((a) => {
      const init = INITIAL_ATHLETES.find((ia) => ia.id === a.id);
      return {
        ...a,
        age: a.age ?? init?.age ?? 26,
        heightCm: a.heightCm ?? init?.heightCm ?? 178,
        weightKg: a.weightKg ?? init?.weightKg ?? 83.5,
        experienceLevel: a.experienceLevel ?? init?.experienceLevel ?? "Intermediate Lifter (3 yrs)"
      };
    });
  }

  let programs: Program[];
  if (!Array.isArray(rawState.programs) || rawState.programs.length === 0) {
    programs = defaults.programs;
    repaired = true;
  } else {
    programs = rawState.programs.map((prog) => {
      if (!Array.isArray(prog.days)) repaired = true;
      const safeDays = Array.isArray(prog.days)
        ? prog.days.map((day, idx) => ({
            ...day,
            dayNumber: day.dayNumber ?? idx + 1,
            prescriptions: Array.isArray(day.prescriptions) ? day.prescriptions : []
          }))
        : [];
      return { ...prog, days: safeDays };
    });
  }

  let activeSession: WorkoutSession;
  if (
    !rawState.activeSession ||
    typeof rawState.activeSession !== "object" ||
    !Array.isArray(rawState.activeSession.sets)
  ) {
    activeSession = defaults.activeSession;
    repaired = true;
  } else {
    const matchedProgram =
      programs.find((p) => p.id === rawState.activeSession?.programId) || programs[0];
    if (matchedProgram && rawState.activeSession.programId !== matchedProgram.id) {
      activeSession = {
        ...rawState.activeSession,
        programId: matchedProgram.id,
        programTitle: matchedProgram.title
      };
      repaired = true;
    } else {
      activeSession = rawState.activeSession;
    }
  }

  const notes = Array.isArray(rawState.notes) ? rawState.notes : ((repaired = true), defaults.notes);
  const checkIns = Array.isArray(rawState.checkIns) ? rawState.checkIns : ((repaired = true), defaults.checkIns);
  const messages = Array.isArray(rawState.messages) ? rawState.messages : ((repaired = true), defaults.messages);
  const invoices = Array.isArray(rawState.invoices) ? rawState.invoices : ((repaired = true), defaults.invoices);
  const auditLogs = Array.isArray(rawState.auditLogs) ? rawState.auditLogs : ((repaired = true), defaults.auditLogs);

  return {
    state: {
      currentRole,
      users,
      athletes,
      exercises,
      programs,
      activeSession,
      notes,
      checkIns,
      messages,
      invoices,
      auditLogs
    },
    repaired
  };
}

/**
 * Resolves the active athlete profile matching userId, defaulting safely.
 */
export function resolveActiveAthlete(
  state: Pick<CoachProState, "athletes">,
  userId?: string
): AthleteProfile | undefined {
  const athletes = Array.isArray(state.athletes) ? state.athletes : INITIAL_ATHLETES;
  if (userId) {
    const direct = athletes.find((a) => a.id === userId);
    if (direct) return direct;
  }
  return athletes.find((a) => a.id === "usr-athlete-1") || athletes[0];
}

/**
 * Resolves active workout session, matching program, current day, and
 * exercise prescriptions without throwing when programs or days are empty.
 */
export function resolveActiveSessionContext(
  state: Pick<CoachProState, "programs" | "activeSession">
): {
  session: WorkoutSession;
  program: Program | undefined;
  currentDay: ProgramDay | undefined;
  prescriptions: ExercisePrescription[];
  plannedSets: number;
} {
  const rawSession = state.activeSession;
  const session: WorkoutSession =
    rawSession && Array.isArray(rawSession.sets)
      ? rawSession
      : { ...INITIAL_WORKOUT_SESSION, ...(rawSession || {}), sets: [] };

  const programs = Array.isArray(state.programs) ? state.programs : [];
  const program = programs.find((p) => p.id === session.programId) || programs[0];
  const days = Array.isArray(program?.days) ? program.days : [];
  const currentDay = days.find((d) => d.dayNumber === session.dayNumber) || days[0];
  const prescriptions = Array.isArray(currentDay?.prescriptions) ? currentDay.prescriptions : [];
  const plannedSets = prescriptions.reduce((acc, rx) => acc + (rx.sets || 0), 0);

  return { session, program, currentDay, prescriptions, plannedSets };
}

export function loadSavedState(): CoachProState {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultState();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch {
        // Ignore storage quota or private mode errors
      }
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<CoachProState>;
    const { state: normalized, repaired } = normalizeCoachProState(parsed);
    if (repaired) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // Ignore storage quota or private mode errors
      }
    }
    return normalized;
  } catch {
    return createDefaultState();
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
