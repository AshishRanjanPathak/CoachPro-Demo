export type UserRole = 'athlete' | 'coach' | 'org_admin' | 'platform_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId: string;
  organizationName: string;
}

export type ExerciseCategory = 
  | 'barbell' 
  | 'dumbbell' 
  | 'bodyweight' 
  | 'cable' 
  | 'machine' 
  | 'cardio' 
  | 'mobility';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'quadriceps' 
  | 'hamstrings' 
  | 'glutes' 
  | 'shoulders' 
  | 'arms' 
  | 'core' 
  | 'full_body';

export type TrackingMethod = 'weight_reps' | 'bodyweight_reps' | 'distance_duration' | 'isometric';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: string;
  movementPattern: string;
  instructions: string;
  mediaUrl?: string;
  trackingMethod: TrackingMethod;
}

export interface ExercisePrescription {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repTarget: string; // e.g. "6-8" or "10"
  targetLoadKg?: number;
  targetDurationMinutes?: number;
  targetRpe?: number;
  restSeconds: number;
  notes?: string;
}

export interface ProgramDay {
  id: string;
  name: string;
  dayNumber: number;
  prescriptions: ExercisePrescription[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  targetWeeks: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  days: ProgramDay[];
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  prescribedWeightKg?: number;
  prescribedReps?: number | string;
  prescribedMinutes?: number;
  completedWeightKg: number;
  completedReps: number;
  completedMinutes?: number;
  rpe?: number;
  isPr?: boolean;
  completedAt: string;
}

export type WorkoutStatus = 'in_progress' | 'completed' | 'abandoned';

export interface WorkoutSession {
  id: string;
  athleteId: string;
  programId: string;
  programTitle: string;
  dayName: string;
  dayNumber: number;
  status: WorkoutStatus;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  sets: WorkoutSet[];
}

export interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'active' | 'needs_attention' | 'inactive';
  assignedCoachId: string;
  assignedCoachName: string;
  assignedProgramId: string;
  assignedProgramTitle: string;
  totalWorkoutsCompleted: number;
  adherencePercentage: number;
  currentStreakDays: number;
  lastWorkoutDate: string;
  recentPrCount: number;
  trainingGoal: string;
  squad?: string;
  sleepHours?: number;
  // Fatigue, Injury & Recovery Status
  fatigueLevel: 'low' | 'moderate' | 'high' | 'severe';
  readinessScore: number; // 1-10
  injuryStatus?: {
    hasInjury: boolean;
    injuryLocation: string;
    severity: 'mild' | 'moderate' | 'severe';
    details: string;
    flaggedAt: string;
  };
  priorityRank: number; // 1 = highest priority (injured or acute fatigue)
}

export interface CoachNote {
  id: string;
  athleteId: string;
  coachId: string;
  authorName: string;
  content: string;
  isPrivate: boolean; // private to coach vs shared with athlete
  createdAt: string;
}

export interface CheckIn {
  id: string;
  athleteId: string;
  athleteName?: string;
  date: string;
  readinessScore: number; // 1-10
  sorenessScore: number;  // 1-5
  fatigueLevel: 'low' | 'moderate' | 'high' | 'severe';
  sleepHours: number;
  hasInjury: boolean;
  injuryLocation?: string;
  injurySeverity?: 'mild' | 'moderate' | 'severe';
  injuryNotes?: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ProgressDataPoint {
  date: string;
  weightKg: number;
  reps: number;
  estimated1Rm: number;
  volumeKg: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  planName: string;
  downloadUrl?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  target: string;
  status: 'success' | 'warning' | 'denied';
}
