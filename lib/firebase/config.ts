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
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Check if we're in a build/prerender environment
const isBuildTime = typeof window === 'undefined';

if (isFirebaseConfigValid()) {
  try {
    // Use existing app if already initialized (prevents multiple initializations)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    // If initialization fails, log but don't throw during build
    if (!isBuildTime) {
      console.error('Firebase initialization failed:', error);
    }
  }
} else {
  // During build time, allow build to complete even if env vars are missing
  // Firebase will be undefined and components should handle this gracefully
  if (isBuildTime) {
    // Silently skip initialization during build - this allows the build to complete
    // Components using Firebase should check if auth/db/storage exist before using them
    console.warn(
      'Firebase configuration is missing during build. The build will complete, but Firebase features will not work until environment variables are set.'
    );
  } else {
    // At runtime, log error but don't throw to prevent app crashes
    console.error(
      'Firebase configuration is incomplete. Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set.'
    );
  }
}

export { auth, db, storage };
export default app;
