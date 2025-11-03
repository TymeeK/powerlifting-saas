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
