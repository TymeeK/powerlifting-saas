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

// // Initialize Firebase services
// // Auth requires browser environment - use lazy initialization
// let _authInstance: Auth | null = null;

// // Get auth instance - lazy initialization only in browser
// function getAuthInstance(): Auth {
//   if (typeof window === 'undefined') {
//     // This should never be called during SSR since client components
//     // don't execute during SSR. But we handle it just in case.
//     throw new Error(
//       'Firebase Auth can only be accessed in the browser. Make sure your component is a client component.'
//     );
//   }
//   if (!_authInstance) {
//     _authInstance = getAuth(app);
//   }
//   return _authInstance;
// }

// // Export auth as a getter property that initializes on first access
// // This ensures getAuth() is never called during SSR/build
// export const auth = new Proxy({} as Auth, {
//   get(_target, prop) {
//     const instance = getAuthInstance();
//     const value = instance[prop as keyof Auth];
//     if (typeof value === 'function') {
//       return value.bind(instance);
//     }
//     return value;
//   },
//   set(_target, prop, value) {
//     // Allow Firebase to set internal properties on the actual instance
//     try {
//       const instance = getAuthInstance();
//       (instance as any)[prop] = value;
//       return true;
//     } catch {
//       return false;
//     }
//   },
//   getOwnPropertyDescriptor(_target, prop) {
//     const instance = getAuthInstance();
//     return Object.getOwnPropertyDescriptor(instance, prop as string);
//   },
//   defineProperty(_target, prop, descriptor) {
//     // Allow Firebase to define properties on the actual instance
//     try {
//       const instance = getAuthInstance();
//       Object.defineProperty(instance, prop as string, descriptor);
//       return true;
//     } catch {
//       return false;
//     }
//   },
//   has(_target, prop) {
//     try {
//       const instance = getAuthInstance();
//       return prop in instance;
//     } catch {
//       return false;
//     }
//   },
//   ownKeys(_target) {
//     try {
//       const instance = getAuthInstance();
//       return Object.keys(instance);
//     } catch {
//       return [];
//     }
//   },
// });

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
