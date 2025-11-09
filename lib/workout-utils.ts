// Utility functions for workout page
import {
  UserExercise,
  WorkoutState,
  ModalState,
  FormState,
  LoadingState,
  ErrorState,
} from '@/lib/types';
import { logger } from '@/lib/logger';

// Create a child logger for workout utilities
const workoutUtilsLogger = logger.child({ component: 'workout-utils' });

// Local storage utilities
export const saveSetsToStorage = (setsData: WorkoutState['sets']) => {
  try {
    localStorage.setItem('workoutSets', JSON.stringify(setsData));
    workoutUtilsLogger.debug('Sets saved to localStorage', {
      setsCount: Object.keys(setsData).length,
    });
  } catch (error) {
    workoutUtilsLogger.error('Error saving sets to localStorage', error);
  }
};

export const loadSetsFromStorage = (): WorkoutState['sets'] => {
  try {
    const savedSets = localStorage.getItem('workoutSets');
    if (savedSets) {
      const parsed = JSON.parse(savedSets);
      workoutUtilsLogger.debug('Sets loaded from localStorage', {
        setsCount: Object.keys(parsed).length,
      });
      return parsed;
    }
  } catch (error) {
    workoutUtilsLogger.error('Error loading sets from localStorage', error);
  }
  return {};
};

// Complete workout state persistence
export const saveWorkoutStateToStorage = (workoutState: WorkoutState) => {
  // Only run on client side
  if (typeof window === 'undefined') {
    workoutUtilsLogger.debug('Not running on server side');
    return;
  }

  try {
    workoutUtilsLogger.debug('Saving workout state to localStorage', {
      exerciseCount: workoutState.exercises.length,
      setsCount: Object.keys(workoutState.sets).length,
    });

    localStorage.setItem('currentWorkout', JSON.stringify(workoutState));
    workoutUtilsLogger.debug(
      'Workout state saved to localStorage successfully'
    );

    // Verify the save worked
    const verification = localStorage.getItem('currentWorkout');
    workoutUtilsLogger.debug('Storage verification', {
      saved: !!verification,
    });
  } catch (error) {
    workoutUtilsLogger.error(
      'Error saving workout state to localStorage',
      error
    );
  }
};

export const loadWorkoutStateFromStorage = (): WorkoutState | null => {
  // Only run on client side
  if (typeof window === 'undefined') {
    workoutUtilsLogger.debug('Not running on server side');
    return null;
  }

  try {
    const savedWorkout = localStorage.getItem('currentWorkout');
    workoutUtilsLogger.debug('Loading workout state from localStorage', {
      hasData: !!savedWorkout,
    });

    if (savedWorkout) {
      const parsed = JSON.parse(savedWorkout);
      workoutUtilsLogger.debug('Workout state loaded from localStorage', {
        exerciseCount: parsed.exercises?.length || 0,
        setsCount: Object.keys(parsed.sets || {}).length,
      });

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
    workoutUtilsLogger.error(
      'Error loading workout state from localStorage',
      error
    );
  }
  return null;
};

export const clearWorkoutStateFromStorage = () => {
  try {
    localStorage.removeItem('currentWorkout');
    localStorage.removeItem('workoutSets');
    workoutUtilsLogger.debug('Workout state cleared from localStorage');
  } catch (error) {
    workoutUtilsLogger.error(
      'Error clearing workout state from localStorage',
      error
    );
  }
};

// Exercise management utilities
export const createNewExercise = (name: string): UserExercise => {
  const now = new Date();
  return {
    id: Date.now().toString(),
    name: name.trim(),
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
export const validateExerciseForm = (name: string): string | null => {
  if (!name.trim()) return 'Exercise name is required';
  return null;
};
