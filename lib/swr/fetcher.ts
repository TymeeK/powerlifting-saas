import { getPastWorkouts } from '@/lib/firebase';
import { PastWorkout } from '@/lib/types/workout';

export const getPastWorkoutsFetcher = async (
  userId: string
): Promise<PastWorkout[]> => {
  const result = await getPastWorkouts(userId);
  if (!result.success) {
    throw new Error('Failed to fetch past workouts');
  }
  return result.workouts;
};
