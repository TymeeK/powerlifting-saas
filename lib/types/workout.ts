// Workout-related types

import { UserExercise } from './exercise';

// Workout set interface
export interface WorkoutSet {
  reps: number;
  weight: number;
  completed?: boolean;
}

// Workout exercise interface
export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

// Workout data interface
export interface WorkoutData {
  exercises: WorkoutExercise[];
  state: 'active' | 'end';
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number[];
  weight: number[];
}
// Past workout interface
export interface PastWorkout {
  id: string;
  date: string;
  exercises: Exercise[];
  createdAt: Date;
}

// Workout summary interface
export interface WorkoutSummary {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisMonthWorkouts: number;
  totalWorkouts: number;
  personalRecords: number;
  currentStreak: number;
  totalTime: number;
  caloriesBurned: number;
  goalProgress: number;
  activeDays: number;
  totalVolume: number;
  lastWorkoutDate: Date | null;
}

// Workout state interface (for UI state management)
export interface WorkoutState {
  exercises: UserExercise[];
  sets: {
    [exerciseId: string]: WorkoutSet[];
  };
}
