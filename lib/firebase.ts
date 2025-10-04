// Main Firebase module - re-exports all Firebase functionality
// This file serves as the main entry point for Firebase services

// Export Firebase configuration and core services
export { auth, db, storage, default as app } from './firebase/config';

// Export all types
export * from './firebase/types';

// Export authentication functions
export { signUp, signIn, resetPassword } from './firebase/auth';

// Export workout functions
export {
  saveWorkout,
  getPastWorkouts,
  getWeeklySummary,
} from './firebase/workout';

// Export exercise library functions
export {
  saveExerciseToLibrary,
  loadUserExerciseLibrary,
  updateExerciseInLibrary,
  deleteExerciseFromLibrary,
  getPastExercises,
} from './firebase/exercise';
