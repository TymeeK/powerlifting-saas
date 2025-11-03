// Exercise library and past exercises functions
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { db } from './config';
import { UserExercise, WorkoutExercise, PastExercise } from '@/lib/types';
import { logger } from '@/lib/logger';

// Save exercise to user's library
export const saveExerciseToLibrary = async (
  userId: string,
  exercise: Omit<UserExercise, 'createdAt' | 'updatedAt'>
) => {
  try {
    const exerciseData = {
      ...exercise,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add to user's exercises subcollection
    const userExercisesRef = collection(db, 'users', userId, 'exercises');
    const docRef = await addDoc(userExercisesRef, exerciseData);

    logger.info('Exercise saved to library', {
      userId,
      exerciseId: docRef.id,
      exerciseName: exercise.name,
    });

    return {
      success: true,
      exerciseId: docRef.id,
      message: 'Exercise saved to your library!',
    };
  } catch (error: any) {
    logger.error('Error saving exercise to library', error, {
      userId,
      exerciseName: exercise.name,
    });
    throw new Error('Failed to save exercise to library');
  }
};

// Load user's exercise library
export const loadUserExerciseLibrary = async (userId: string) => {
  try {
    const userExercisesRef = collection(db, 'users', userId, 'exercises');
    const querySnapshot = await getDocs(userExercisesRef);

    const exercises: UserExercise[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      exercises.push({
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // Sort by creation date (newest first)
    exercises.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    logger.debug('Exercise library loaded', {
      userId,
      exerciseCount: exercises.length,
    });

    return {
      success: true,
      exercises,
    };
  } catch (error: any) {
    logger.error('Error loading exercise library', error, { userId });
    throw new Error('Failed to load exercise library');
  }
};

// Update exercise in user's library
export const updateExerciseInLibrary = async (
  userId: string,
  exerciseId: string,
  updates: Partial<Pick<UserExercise, 'name'>>
) => {
  try {
    const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId);
    await updateDoc(exerciseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    logger.info('Exercise updated in library', {
      userId,
      exerciseId,
      updates,
    });

    return {
      success: true,
      message: 'Exercise updated successfully!',
    };
  } catch (error: any) {
    logger.error('Error updating exercise in library', error, {
      userId,
      exerciseId,
    });
    throw new Error('Failed to update exercise');
  }
};

// Delete exercise from user's library
export const deleteExerciseFromLibrary = async (
  userId: string,
  exerciseId: string
) => {
  try {
    const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId);
    await deleteDoc(exerciseRef);

    logger.info('Exercise deleted from library', {
      userId,
      exerciseId,
    });

    return {
      success: true,
      message: 'Exercise deleted successfully!',
    };
  } catch (error: any) {
    logger.error('Error deleting exercise from library', error, {
      userId,
      exerciseId,
    });
    throw new Error('Failed to delete exercise');
  }
};

// Get all unique exercises from user's past workouts
export const getPastExercises = async (userId: string) => {
  try {
    const userWorkoutsRef = collection(db, 'users', userId, 'workouts');
    const querySnapshot = await getDocs(userWorkoutsRef);

    const exerciseMap = new Map<string, PastExercise>();

    querySnapshot.forEach(doc => {
      const workoutData = doc.data();
      if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
        const workoutDate = workoutData.createdAt?.toDate() || new Date();

        workoutData.exercises.forEach((exercise: WorkoutExercise) => {
          const existing = exerciseMap.get(exercise.name);
          if (existing) {
            // Update with more recent date and increment count
            if (workoutDate > existing.lastUsed) {
              existing.lastUsed = workoutDate;
            }
            existing.totalWorkouts += 1;
          } else {
            // Add new exercise
            exerciseMap.set(exercise.name, {
              name: exercise.name,
              lastUsed: workoutDate,
              totalWorkouts: 1,
            });
          }
        });
      }
    });

    // Convert map to array and sort by last used date (most recent first)
    const pastExercises = Array.from(exerciseMap.values()).sort(
      (a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()
    );

    logger.debug('Past exercises fetched', {
      userId,
      exerciseCount: pastExercises.length,
    });

    return {
      success: true,
      exercises: pastExercises as PastExercise[],
    };
  } catch (error: any) {
    logger.error('Error fetching past exercises', error, { userId });
    throw new Error('Failed to fetch past exercises');
  }
};
