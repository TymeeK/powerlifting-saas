import { ExerciseStats } from '@/lib/types';

/**
 * Creates a mock ExerciseStats object with sensible defaults
 * @param name - The exercise name
 * @param overrides - Partial ExerciseStats to override defaults
 */
export const createMockExerciseStats = (
  name: string,
  overrides?: Partial<ExerciseStats>
): ExerciseStats => ({
  name,
  currentPR: 225,
  previousPR: 205,
  target: 250,
  weeklyProgress: [
    { week: 'Week 1', weight: 205, reps: 5 },
    { week: 'Week 2', weight: 215, reps: 5 },
    { week: 'Week 3', weight: 225, reps: 3 },
  ],
  monthlyVolume: 5000,
  lastWorkout: '2024-01-15',
  improvement: 9.8,
  color: 'bg-blue-500',
  ...overrides,
});

/**
 * Creates multiple exercise stats objects for testing pagination
 * @param count - Number of exercises to create
 * @param baseName - Base name for exercises (default: 'Exercise')
 */
export const createMultipleExerciseStats = (
  count: number,
  baseName = 'Exercise'
): Record<string, ExerciseStats> => {
  const exercises: Record<string, ExerciseStats> = {};
  for (let i = 1; i <= count; i++) {
    exercises[`${baseName.toLowerCase()}-${i}`] = createMockExerciseStats(
      `${baseName} ${i}`
    );
  }
  return exercises;
};
