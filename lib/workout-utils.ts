// Utility functions for workout page
import { UserExercise } from './firebase';

// State management utilities
export interface WorkoutState {
  exercises: UserExercise[];
  sets: {
    [exerciseId: string]: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  };
}

export interface ModalState {
  showAddExercise: boolean;
  showPastExercises: boolean;
  showConfirmation: boolean;
  editingExercise: string | null;
}

export interface FormState {
  newExerciseName: string;
  newExerciseCategory: string;
}

export interface LoadingState {
  isSaving: boolean;
  loadingPastExercises: boolean;
}

export interface ErrorState {
  saveError: string | null;
  saveSuccess: boolean;
}

// Local storage utilities
export const saveSetsToStorage = (setsData: WorkoutState['sets']) => {
  try {
    localStorage.setItem('workoutSets', JSON.stringify(setsData));
  } catch (error) {
    console.error('Error saving sets to localStorage:', error);
  }
};

export const loadSetsFromStorage = (): WorkoutState['sets'] => {
  try {
    const savedSets = localStorage.getItem('workoutSets');
    if (savedSets) {
      return JSON.parse(savedSets);
    }
  } catch (error) {
    console.error('Error loading sets from localStorage:', error);
  }
  return {};
};

// Complete workout state persistence
export const saveWorkoutStateToStorage = (workoutState: WorkoutState) => {
  try {
    localStorage.setItem('currentWorkout', JSON.stringify(workoutState));
  } catch (error) {
    console.error('Error saving workout state to localStorage:', error);
  }
};

export const loadWorkoutStateFromStorage = (): WorkoutState | null => {
  try {
    const savedWorkout = localStorage.getItem('currentWorkout');
    if (savedWorkout) {
      const parsed = JSON.parse(savedWorkout);
      // Convert date strings back to Date objects
      if (parsed.exercises) {
        parsed.exercises = parsed.exercises.map((exercise: any) => ({
          ...exercise,
          createdAt: new Date(exercise.createdAt),
          updatedAt: new Date(exercise.updatedAt),
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading workout state from localStorage:', error);
  }
  return null;
};

export const clearWorkoutStateFromStorage = () => {
  try {
    localStorage.removeItem('currentWorkout');
    localStorage.removeItem('workoutSets');
  } catch (error) {
    console.error('Error clearing workout state from localStorage:', error);
  }
};

// Exercise management utilities
export const createNewExercise = (
  name: string,
  category: string
): UserExercise => {
  const now = new Date();
  return {
    id: Date.now().toString(),
    name: name.trim(),
    category: category.trim(),
    createdAt: now,
    updatedAt: now,
  };
};

export const addSetToExercise = (
  sets: WorkoutState['sets'],
  exerciseId: string
): WorkoutState['sets'] => ({
  ...sets,
  [exerciseId]: [
    ...(sets[exerciseId] || []),
    { reps: 0, weight: 0, completed: false },
  ],
});

export const updateSetInExercise = (
  sets: WorkoutState['sets'],
  exerciseId: string,
  index: number,
  field: 'reps' | 'weight',
  value: number
): WorkoutState['sets'] => ({
  ...sets,
  [exerciseId]: (sets[exerciseId] || []).map((set, i) =>
    i === index ? { ...set, [field]: value } : set
  ),
});

export const toggleSetComplete = (
  sets: WorkoutState['sets'],
  exerciseId: string,
  index: number
): WorkoutState['sets'] => ({
  ...sets,
  [exerciseId]: (sets[exerciseId] || []).map((set, i) =>
    i === index ? { ...set, completed: !set.completed } : set
  ),
});

// Progress calculation utilities
export const getExerciseProgress = (
  sets: WorkoutState['sets'],
  exerciseId: string
) => {
  const exerciseSets = sets[exerciseId] || [];
  const completedSets = exerciseSets.filter(set => set.completed).length;
  return {
    total: exerciseSets.length,
    completed: completedSets,
    percentage:
      exerciseSets.length > 0 ? (completedSets / exerciseSets.length) * 100 : 0,
  };
};

// Date formatting utilities
export const formatLastUsed = (date: Date): string => {
  return date.toLocaleDateString();
};

export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// Validation utilities
export const validateExerciseForm = (
  name: string,
  category: string
): string | null => {
  if (!name.trim()) return 'Exercise name is required';
  if (!category.trim()) return 'Exercise category is required';
  return null;
};
