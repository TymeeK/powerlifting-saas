import { getPastWorkouts, getWeeklySummaryData } from '@/lib/firebase';
import {
  PastWorkoutsResult,
  WORKOUT_DEFAULT_LIMIT,
} from '@/lib/firebase/workout';
import { DocumentData } from 'firebase/firestore';
import { PastWorkout } from '@/lib/types';

export const getPastWorkoutsFetcher = async (
  userId: string,
  limitCount: number = WORKOUT_DEFAULT_LIMIT,
  lastVisibleDoc: DocumentData | null = null
): Promise<PastWorkoutsResult> => {
  return await getPastWorkouts(userId, limitCount, lastVisibleDoc);
};

/**
 * Fetches all workouts for a user by accumulating across pages
 * Used for exercise stats calculation which needs complete workout history
 */
export const getAllPastWorkoutsFetcher = async (
  userId: string
): Promise<PastWorkout[]> => {
  const allWorkouts: PastWorkout[] = [];
  let lastVisibleDoc: DocumentData | null = null;
  let hasMore = true;
  const limit = 100; // Fetch in batches of 100

  while (hasMore) {
    const result = await getPastWorkouts(userId, limit, lastVisibleDoc);
    allWorkouts.push(...result.workouts);
    lastVisibleDoc = result.lastVisibleDoc;
    hasMore = result.hasMore;
  }

  return allWorkouts;
};

export const getWeeklySummaryFetcher = async (
  userId: string
): Promise<number> => {
  return await getWeeklySummaryData(userId);
};
