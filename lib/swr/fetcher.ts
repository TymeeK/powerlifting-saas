import { getPastWorkouts, getWeeklySummaryData } from '@/lib/firebase';
import {
  PastWorkoutsResult,
  WORKOUT_DEFAULT_LIMIT,
} from '@/lib/firebase/workout';
import { DocumentData } from 'firebase/firestore';

export const getPastWorkoutsFetcher = async (
  userId: string,
  limitCount: number = WORKOUT_DEFAULT_LIMIT,
  lastVisibleDoc: DocumentData | null = null
): Promise<PastWorkoutsResult> => {
  return await getPastWorkouts(userId, limitCount, lastVisibleDoc);
};

export const getWeeklySummaryFetcher = async (
  userId: string
): Promise<number> => {
  return await getWeeklySummaryData(userId);
};
