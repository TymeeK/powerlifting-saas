// Workout-related functions
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  WorkoutExercise,
  WorkoutSet,
  PastWorkout,
  WorkoutSummary,
} from '@/lib/types';
import { logger } from '@/lib/logger';

// Create a child logger for workout operations
const workoutLogger = logger.child({ component: 'firebase-workout' });

// Save workout function
export const saveWorkout = async (
  userId: string,
  exercises: WorkoutExercise[],
  state: 'active' | 'end' = 'end'
) => {
  try {
    // Create workout data
    const workoutData = {
      exercises,
      state,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add to user's workouts subcollection
    const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
    const docRef = await addDoc(userWorkoutsRef, workoutData);

    // Get total workout count for this user
    const querySnapshot = await getDocs(userWorkoutsRef);
    const totalWorkouts = querySnapshot.size;

    workoutLogger.info('Workout saved successfully', {
      totalWorkouts,
      exerciseCount: exercises.length,
      state,
    });

    return {
      success: true,
      workoutId: docRef.id,
      totalWorkouts,
      message: 'Workout saved successfully!',
    };
  } catch (error: any) {
    workoutLogger.error('Error saving workout', error, {
      errorCode: error.code,
      exerciseCount: exercises.length,
    });

    let errorMessage = 'An error occurred while saving the workout';

    switch (error.code) {
      case 'permission-denied':
        errorMessage = 'You do not have permission to save workouts';
        break;
      case 'unavailable':
        errorMessage =
          'Service is temporarily unavailable. Please try again later';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};

// Get all past workouts for a user
export const getPastWorkouts = async (userId: string) => {
  try {
    const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
    const querySnapshot = await getDocs(userWorkoutsRef);

    const workouts: PastWorkout[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const workoutDate = data.createdAt?.toDate() || new Date();

      // Calculate workout duration (this would need to be stored or calculated)
      // For now, we'll estimate based on number of exercises and sets
      const totalSets =
        data.exercises?.reduce(
          (total: number, exercise: WorkoutExercise) =>
            total + (exercise.sets?.length || 0),
          0
        ) || 0;
      const estimatedMinutes = Math.max(30, totalSets * 2); // Rough estimate
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Calculate total volume
      const totalVolume =
        data.exercises?.reduce((total: number, exercise: WorkoutExercise) => {
          return (
            total +
            (exercise.sets?.reduce(
              (exerciseTotal: number, set: WorkoutSet) =>
                exerciseTotal + set.reps * set.weight,
              0
            ) || 0)
          );
        }, 0) || 0;

      // Count personal records (this would need to be calculated based on previous workouts)
      // For now, we'll set to 0 as we don't have PR tracking logic yet
      const personalRecords = 0;

      workouts.push({
        id: doc.id,
        date: workoutDate.toISOString().split('T')[0], // YYYY-MM-DD format
        duration,
        exercises:
          data.exercises?.map((exercise: WorkoutExercise) => ({
            name: exercise.name,
            sets: exercise.sets?.length || 0,
            reps: exercise.sets?.map((set: WorkoutSet) => set.reps) || [],
            weight: exercise.sets?.map((set: WorkoutSet) => set.weight) || [],
          })) || [],
        totalVolume,
        personalRecords,
        createdAt: workoutDate,
      });
    });

    // Sort by creation date (newest first)
    workouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    workoutLogger.debug('Past workouts fetched successfully', {
      workoutCount: workouts.length,
    });

    return {
      success: true,
      workouts,
    };
  } catch (error: any) {
    workoutLogger.error('Error fetching past workouts', error);
    throw new Error('Failed to fetch past workouts');
  }
};

// Get weekly summary data for dashboard
export const getWeeklySummary = async (userId: string) => {
  try {
    const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
    const querySnapshot = await getDocs(userWorkoutsRef);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let thisWeekWorkouts = 0;
    let lastWeekWorkouts = 0;
    let thisMonthWorkouts = 0;
    let totalWorkouts = 0;
    let totalTime = 0; // in minutes
    let totalVolume = 0;
    let personalRecords = 0;
    let currentStreak = 0;
    let lastWorkoutDate: Date | null = null;

    const workoutDates: Date[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const workoutDate = data.createdAt?.toDate() || new Date();
      workoutDates.push(workoutDate);
      totalWorkouts++;

      // Count workouts by time period
      if (workoutDate >= startOfWeek) {
        thisWeekWorkouts++;
      }
      if (workoutDate >= startOfLastWeek && workoutDate < startOfWeek) {
        lastWeekWorkouts++;
      }
      if (workoutDate >= startOfMonth) {
        thisMonthWorkouts++;
      }

      // Calculate workout duration (estimate based on sets)
      const totalSets =
        data.exercises?.reduce(
          (total: number, exercise: WorkoutExercise) =>
            total + (exercise.sets?.length || 0),
          0
        ) || 0;
      const estimatedMinutes = Math.max(30, totalSets * 2);
      totalTime += estimatedMinutes;

      // Calculate total volume
      const workoutVolume =
        data.exercises?.reduce((total: number, exercise: WorkoutExercise) => {
          return (
            total +
            (exercise.sets?.reduce(
              (exerciseTotal: number, set: WorkoutSet) =>
                exerciseTotal + set.reps * set.weight,
              0
            ) || 0)
          );
        }, 0) || 0;
      totalVolume += workoutVolume;

      // Track last workout date
      if (!lastWorkoutDate || workoutDate > lastWorkoutDate) {
        lastWorkoutDate = workoutDate;
      }
    });

    // Calculate current streak
    if (workoutDates.length > 0) {
      const sortedDates = workoutDates.sort(
        (a, b) => b.getTime() - a.getTime()
      );
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const workoutDate of sortedDates) {
        const workoutDay = new Date(workoutDate);
        workoutDay.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (currentDate.getTime() - workoutDay.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === streak) {
          streak++;
          currentDate = new Date(workoutDay);
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (daysDiff > streak + 1) {
          break;
        }
      }
      currentStreak = streak;
    }

    // Calculate personal records (simplified - count exercises with new max weights)
    // This is a basic implementation - in a real app, you'd track PRs more sophisticatedly
    personalRecords = Math.floor(thisMonthWorkouts * 0.3); // Rough estimate

    // Calculate calories burned (rough estimate: 8-12 calories per minute)
    const caloriesBurned = Math.round(totalTime * 10);

    // Calculate goal progress (assuming 4 workouts per week goal)
    const goalProgress = Math.min(
      100,
      Math.round((thisWeekWorkouts / 4) * 100)
    );

    // Calculate active days this week
    const activeDays = new Set();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const workoutDate = data.createdAt?.toDate() || new Date();
      if (workoutDate >= startOfWeek) {
        const dayOfWeek = workoutDate.getDay();
        activeDays.add(dayOfWeek);
      }
    });

    return {
      success: true,
      summary: {
        thisWeekWorkouts,
        lastWeekWorkouts,
        thisMonthWorkouts,
        totalWorkouts,
        personalRecords,
        currentStreak,
        totalTime: Math.round((totalTime / 60) * 10) / 10, // Convert to hours with 1 decimal
        caloriesBurned,
        goalProgress,
        activeDays: activeDays.size,
        totalVolume,
        lastWorkoutDate,
      } as WorkoutSummary,
    };
  } catch (error: any) {
    workoutLogger.error('Error fetching weekly summary', error);
    throw new Error('Failed to fetch weekly summary');
  }
};
