// Workout-related functions
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  FieldValue,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  CollectionReference,
  QuerySnapshot,
  Query,
} from 'firebase/firestore';
import { db } from './config';
import {
  WorkoutExercise,
  WorkoutSet,
  PastWorkout,
  WorkoutSummary,
} from '@/lib/types';
import { logger } from '@/lib/logger';

const workoutLogger = logger.child({ component: 'firebase-workout' });

/**
 * The workout data object with the exercises,
 * state, createdAt, and updatedAt
 */
type WorkoutData = {
  exercises: WorkoutExercise[];
  state: 'active' | 'end';
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

type SaveWorkoutResult = {
  success: boolean;
  workoutId: string;
  message: string;
};

type UserQuerySnapshot =
  | CollectionReference<DocumentData, DocumentData>
  | Query<DocumentData, DocumentData>;

/**
 * Get the collection reference for a given user and a collection name
 * @param userId - The ID of the user
 * @param collectionName - The name of the collection
 * @returns - The collection reference
 */
export const getUserCollectionRef = (
  userId: string,
  collectionName: string
): CollectionReference<DocumentData, DocumentData> => {
  return collection(db, 'users', userId, collectionName);
};

/**
 * Fetch a query snapshot from a collection reference
 * @param ref - The collection reference to fetch the query snapshot from
 * @returns - The query snapshot
 * @throws - An error if the query snapshot fetch fails
 */
const getUserQuerySnapshot = async (
  ref: UserQuerySnapshot
): Promise<QuerySnapshot<DocumentData, DocumentData>> => {
  try {
    return await getDocs(ref);
  } catch (error: any) {
    workoutLogger.error('Error fetching query snapshot', error);
    throw new Error('Failed to fetch query snapshot');
  }
};

/**
 * Create a workout data object with the exercises,
 * state, createdAt, and updatedAt
 * @param exercises - The exercises in the workout
 * @param state - The state of the workout (active or end)
 * @returns - The workout data with the exercises, state, createdAt, and updatedAt
 */
export const createWorkoutData = (
  exercises: WorkoutExercise[],
  state: 'active' | 'end' = 'end'
): WorkoutData => ({
  exercises,
  state,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

/**
 * Add a workout to the database.
 * @param userId - The ID of the user saving the workout
 * @param workoutData - The workout data to add
 * @returns - The document reference of the added workout
 */
export const addWorkoutToFirestore = async (
  userId: string,
  workoutData: WorkoutData
) => {
  const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
  const docRef = await addDoc(userWorkoutsRef, workoutData);
  return docRef;
};

/**
 * Save a workout to the database.
 * @param userId - The ID of the user saving the workout
 * @param exercises - The exercises in the workout
 * @param state - The state of the workout
 * @returns - The result of the workout save which includes the workout ID,
 * the total number of workouts, and a success message
 * @throws - An error if the workout save fails
 */
export const saveWorkout = async (
  userId: string,
  exercises: WorkoutExercise[],
  state: 'active' | 'end' = 'end'
): Promise<SaveWorkoutResult> => {
  try {
    const workoutData = createWorkoutData(exercises, state);
    const docRef = await addWorkoutToFirestore(userId, workoutData);

    workoutLogger.debug('Workout saved successfully', {
      workoutId: docRef.id,
      exerciseCount: exercises.length,
      state,
    });

    return {
      success: true,
      workoutId: docRef.id,
      message: 'Workout saved successfully!',
    };
  } catch (error: any) {
    workoutLogger.error('Error saving workout', error);
    return {
      success: false,
      workoutId: '',
      message: error.message || 'Failed to save workout',
    };
  }
};

/**
 * Convert a query snapshot to an array of past workouts
 * @param querySnapshot - The query snapshot to convert
 * @returns - The array of past workouts
 */
const convertToPastWorkouts = (
  querySnapshot: QuerySnapshot<DocumentData, DocumentData>
): PastWorkout[] => {
  const workouts: PastWorkout[] = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const workoutDate = data.createdAt?.toDate() || new Date();
    workouts.push({
      id: doc.id,
      date: workoutDate.toISOString().split('T')[0],
      exercises:
        data.exercises?.map((exercise: WorkoutExercise) => ({
          name: exercise.name,
          sets: exercise.sets?.length || 0,
          reps: exercise.sets?.map((set: WorkoutSet) => set.reps) || [],
          weight: exercise.sets?.map((set: WorkoutSet) => set.weight) || [],
        })) || [],
      createdAt: workoutDate,
    });
  });
  return workouts;
};

/**
 * Get the past workouts for a user
 * We should only fetch past workouts and that's the only thing this function should do.
 * @param userId - The ID of the user fetching the past workouts
 * @param limit - The limit of the past workouts to fetch
 * @returns - The past workouts
 */
export const getPastWorkouts = async (userId: string) => {
  const userWorkoutsRef = getUserCollectionRef(userId, 'workouts');
  const userWorkoutsSnapshot = await getUserQuerySnapshot(userWorkoutsRef);
  return convertToPastWorkouts(userWorkoutsSnapshot);
};

/**
 * Get optimized weekly summary data using date-filtered Firestore queries.
 * Only fetches workouts from the current week and recent period for streak calculation.
 *
 * Note: Requires Firestore composite index on users/{userId}/workouts collection
 * for createdAt field queries. Index will be created automatically when first query runs.
 *
 * @param userId - The ID of the user fetching the weekly summary
 * @returns - Object containing this week's workout count and streak data
 * @throws - An error if the weekly summary fetch fails
 */
export const getWeeklySummaryData = async (userId: string) => {
  const userWorkoutsRef = getUserCollectionRef(userId, 'workouts');

  // Calculate start of current week (Sunday 00:00:00)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekTimestamp = Timestamp.fromDate(startOfWeek);

  const thisWeekQuery = query(
    userWorkoutsRef,
    where('createdAt', '>=', startOfWeekTimestamp),
    orderBy('createdAt', 'desc')
  );
  const thisWeekSnapshot = await getUserQuerySnapshot(thisWeekQuery);
  const thisWeekCount = thisWeekSnapshot.size;

  workoutLogger.debug('Weekly summary data fetched successfully', {
    thisWeekCount,

    startOfWeek: startOfWeek.toISOString(),
  });

  return thisWeekCount;
};
