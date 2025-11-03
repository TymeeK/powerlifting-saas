// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
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

// Check if all required environment variables are present
const isFirebaseConfigValid = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only if config is valid and not already initialized
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigValid()) {
  // Use existing app if already initialized (prevents multiple initializations)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // During build time, if env vars are missing, we need to handle gracefully
  // Check if we're in a build environment
  const isBuildTime =
    process.env.NODE_ENV === 'production' && typeof window === 'undefined';

  if (isBuildTime) {
    // During build/prerender, skip initialization if config is missing
    // This allows the build to complete, but Firebase won't work until env vars are set
    throw new Error(
      'Firebase configuration is missing. Please set all NEXT_PUBLIC_FIREBASE_* environment variables in your build environment (e.g., GitHub Actions secrets).'
    );
  } else {
    // At runtime, we should have the config
    throw new Error(
      'Firebase configuration is incomplete. Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set.'
    );
  }
}

export { auth, db, storage };
export default app;
