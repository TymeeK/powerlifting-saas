// Firebase types and interfaces

// Authentication types
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Workout data interfaces
export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  sets: WorkoutSet[];
}

export interface WorkoutData {
  exercises: WorkoutExercise[];
  state: 'active' | 'end';
  createdAt: Date;
  updatedAt: Date;
}

// Exercise library interfaces
export interface UserExercise {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseLibrary {
  exercises: UserExercise[];
  lastUpdated: Date;
}

// Past exercises interface
export interface PastExercise {
  name: string;
  category: string;
  lastUsed: Date;
  totalWorkouts: number;
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

// Past workout interface
export interface PastWorkout {
  id: string;
  date: string;
  duration: string;
  exercises: {
    name: string;
    sets: number;
    reps: number[];
    weight: number[];
  }[];
  totalVolume: number;
  personalRecords: number;
  createdAt: Date;
}
