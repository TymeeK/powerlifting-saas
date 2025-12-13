import { getPastWorkouts, getWeeklySummaryData } from '@/lib/firebase';
import { PastWorkout } from '@/lib/types/workout';

export const getPastWorkoutsFetcher = async (
  userId: string
): Promise<PastWorkout[]> => {
  const workouts = await getPastWorkouts(userId);
  return workouts;
};

export const getWeeklySummaryFetcher = async (
  userId: string
): Promise<number> => {
  return await getWeeklySummaryData(userId);
};
