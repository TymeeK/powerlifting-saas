// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Required Firebase environment variables
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

/**
 * Validates that all required Firebase environment variables are present.
 * Throws an error with a descriptive message if any are missing.
 *
 * @throws {Error} If any required environment variables are missing or empty
 */
export function validateFirebaseEnvVars(): void {
  // Next.js replaces static process.env.NEXT_PUBLIC_* references at build time
  // Dynamic access (process.env[varName]) doesn't work in browser bundles
  // So we check static references directly
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  
  const missingVars: string[] = [];
  
  // Check each variable using static references (Next.js can replace these)
  if (!apiKey || apiKey.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!authDomain || authDomain.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId || projectId.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!storageBucket || storageBucket.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId || messagingSenderId.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId || appId.trim() === '') missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Firebase environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\nPlease ensure all required environment variables are set in your .env.local file or deployment environment.`;
    throw new Error(errorMessage);
  }
}

/**
 * Gets the Firebase configuration object with validation.
 * Validates environment variables lazily when this function is called.
 * This ensures Next.js has time to embed NEXT_PUBLIC_ vars in the bundle.
 */
function getFirebaseConfig() {
  // Validate environment variables before creating config
  validateFirebaseEnvVars();

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

// Initialize Firebase lazily - only when needed
// This ensures Next.js has embedded NEXT_PUBLIC_ vars in the bundle before validation runs
let _app: ReturnType<typeof initializeApp> | null = null;

function getFirebaseApp() {
  if (!_app) {
    const firebaseConfig = getFirebaseConfig();
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

// Don't initialize Firebase at module load - wait until it's actually used
// This allows Next.js to properly embed NEXT_PUBLIC_ vars in the browser bundle

// Initialize Firebase services
// Auth requires browser environment - use lazy initialization to avoid SSR issues
let _authInstance: Auth | null = null;

function getAuthInstance(): Auth {
  // Only initialize in browser - never during SSR/build
  if (typeof window === 'undefined') {
    throw new Error(
      'Firebase Auth can only be accessed in the browser. Make sure your component is a client component.',
    );
  }

  if (!_authInstance) {
    _authInstance = getAuth(getFirebaseApp());
  }

  return _authInstance;
}

// Export auth with lazy initialization using Proxy
// This ensures getAuth() is never called during SSR/build, preventing _canInitEmulator errors
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuthInstance();
    const value = instance[prop as keyof Auth];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    // Allow Firebase to set properties on the actual instance
    const instance = getAuthInstance();
    (instance as any)[prop] = value;
    return true;
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = getAuthInstance();
    return Object.getOwnPropertyDescriptor(instance, prop as string);
  },
  defineProperty(_target, prop, descriptor) {
    // Allow Firebase to define properties on the actual instance
    const instance = getAuthInstance();
    Object.defineProperty(instance, prop as string, descriptor);
    return true;
  },
  has(_target, prop) {
    try {
      const instance = getAuthInstance();
      return prop in instance;
    } catch {
      return false;
    }
  },
  ownKeys(_target) {
    try {
      const instance = getAuthInstance();
      return Object.keys(instance);
    } catch {
      return [];
    }
  },
});

// Lazy initialization for Firestore and Storage
// These will only initialize when actually accessed, ensuring Next.js has loaded .env.local
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

function getStorageInstance(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}

// Export db and storage with lazy getters using Object.defineProperty
// This ensures they're only initialized when accessed, not at module load time
export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof Firestore];
    if (typeof value === 'function') {
      return (value as Function).bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    (getDb() as any)[prop] = value;
    return true;
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(getDb(), prop as string);
  },
  has(_target, prop) {
    return prop in getDb();
  },
  ownKeys(_target) {
    return Object.keys(getDb());
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    const instance = getStorageInstance();
    const value = instance[prop as keyof FirebaseStorage];
    if (typeof value === 'function') {
      return (value as Function).bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    (getStorageInstance() as any)[prop] = value;
    return true;
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(
      getStorageInstance(),
      prop as string,
    );
  },
  has(_target, prop) {
    return prop in getStorageInstance();
  },
  ownKeys(_target) {
    return Object.keys(getStorageInstance());
  },
});

// Export app as a getter - lazy initialization ensures env vars are loaded
// This will be the Firebase app instance when accessed
export default new Proxy({} as ReturnType<typeof initializeApp>, {
  get(_target, prop) {
    const app = getFirebaseApp();
    const value = app[prop as keyof typeof app];
    if (typeof value === 'function') {
      return (value as Function).bind(app);
    }
    return value;
  },
  set(_target, prop, value) {
    (getFirebaseApp() as any)[prop] = value;
    return true;
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(getFirebaseApp(), prop as string);
  },
  has(_target, prop) {
    return prop in getFirebaseApp();
  },
  ownKeys(_target) {
    return Object.keys(getFirebaseApp());
  },
});
