import { getPastWorkouts, getWeeklySummaryData } from '@/lib/firebase';
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

export type WeeklySummaryData = {
  thisWeekCount: number;
};

export const getWeeklySummaryFetcher = async (
  userId: string
): Promise<WeeklySummaryData> => {
  const result = await getWeeklySummaryData(userId);
  if (!result.success) {
    throw new Error('Failed to fetch weekly summary');
  }
  return {
    thisWeekCount: result.thisWeekCount,
  };
};
