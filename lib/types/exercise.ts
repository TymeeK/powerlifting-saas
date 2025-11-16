// Exercise library types

export interface UserExercise {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseLibrary {
  exercises: UserExercise[];
  lastUpdated: Date;
}

export interface PastExercise {
  name: string;
  lastUsed: Date;
  totalWorkouts: number;
}

export interface ExerciseStats {
  name: string;
  currentPR: number;
  previousPR: number;
  target: number;
  weeklyProgress: Array<{ week: string; weight: number; reps: number }>;
  monthlyVolume: number;
  lastWorkout: string;
  improvement: number;
  color: string;
}
