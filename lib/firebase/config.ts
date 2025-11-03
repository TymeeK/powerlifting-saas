// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (use existing app if already initialized)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
// Auth requires browser environment, so we initialize it lazily
let authInstance: Auth | null = null;

// Create a getter function that initializes auth only in browser
function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    // During SSR/prerendering, throw an error that will be caught
    // This prevents the module from initializing auth during static generation
    // Components using auth should be client components and will handle this properly
    throw new Error('Firebase Auth can only be initialized in the browser');
  }
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

// Export auth using a Proxy that lazily initializes only in browser
// This allows auth to be imported without errors during SSR/prerendering
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    try {
      const instance = getAuthInstance();
      const value = instance[prop as keyof Auth];
      // If it's a function, bind it to the instance
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    } catch (error) {
      // During SSR, return undefined for properties
      // This prevents crashes during prerendering
      if (typeof window === 'undefined') {
        return undefined;
      }
      throw error;
    }
  },
  // Handle property descriptor requests
  getOwnPropertyDescriptor(_target, prop) {
    try {
      const instance = getAuthInstance();
      return Object.getOwnPropertyDescriptor(instance, prop as string);
    } catch {
      return undefined;
    }
  },
  // Handle 'in' operator
  has(_target, prop) {
    try {
      const instance = getAuthInstance();
      return prop in instance;
    } catch {
      return false;
    }
  },
});

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
