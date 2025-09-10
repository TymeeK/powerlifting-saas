// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Sign up function
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const signUp = async (signUpData: SignUpData) => {
  const { firstName, lastName, email, password, confirmPassword } = signUpData;

  // Validate passwords match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  try {
    // Create user with email and password
    console.log('Creating user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log('User created successfully:', user.uid);

    // Update user profile with first and last name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Store additional user data in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('User data stored in Firestore successfully');
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      // Don't throw here - user is already created in Auth
      // Just log the error for debugging
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    // Handle specific Firebase errors
    let errorMessage = 'An error occurred during sign up';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};

// Login function
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Workout data interfaces
export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  sets: WorkoutSet[];
}

export interface WorkoutData {
  exercises: WorkoutExercise[];
  state: 'active' | 'end';
  createdAt: Date;
  updatedAt: Date;
}

// Exercise library interfaces
export interface UserExercise {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseLibrary {
  exercises: UserExercise[];
  lastUpdated: Date;
}

export const signIn = async (loginData: LoginData) => {
  const { email, password } = loginData;

  try {
    // Sign in user with email and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    // Handle specific Firebase errors
    let errorMessage = 'An error occurred during sign in';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    throw new Error(errorMessage);
  }
};

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

    console.log('Workout saved successfully with ID:', docRef.id);

    return {
      success: true,
      workoutId: docRef.id,
      message: 'Workout saved successfully!',
    };
  } catch (error: any) {
    console.error('Error saving workout:', error);

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

// Exercise Library Functions

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

    console.log('Exercise saved to library with ID:', docRef.id);

    return {
      success: true,
      exerciseId: docRef.id,
      message: 'Exercise saved to your library!',
    };
  } catch (error: any) {
    console.error('Error saving exercise to library:', error);
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
        category: data.category,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // Sort by creation date (newest first)
    exercises.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      exercises,
    };
  } catch (error: any) {
    console.error('Error loading exercise library:', error);
    throw new Error('Failed to load exercise library');
  }
};

// Update exercise in user's library
export const updateExerciseInLibrary = async (
  userId: string,
  exerciseId: string,
  updates: Partial<Pick<UserExercise, 'name' | 'category'>>
) => {
  try {
    const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId);
    await updateDoc(exerciseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log('Exercise updated in library:', exerciseId);

    return {
      success: true,
      message: 'Exercise updated successfully!',
    };
  } catch (error: any) {
    console.error('Error updating exercise in library:', error);
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

    console.log('Exercise deleted from library:', exerciseId);

    return {
      success: true,
      message: 'Exercise deleted successfully!',
    };
  } catch (error: any) {
    console.error('Error deleting exercise from library:', error);
    throw new Error('Failed to delete exercise');
  }
};

export default app;
