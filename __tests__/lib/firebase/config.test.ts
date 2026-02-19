import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase modules before importing config
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

describe('Firebase Config - Environment Variable Validation', () => {
  // Store original env vars
  const originalEnv = { ...process.env };
  let validateFirebaseEnvVars: () => void;
  let REQUIRED_ENV_VARS: readonly string[];

  beforeEach(async () => {
    // Clear all Firebase env vars before each test
    const firebaseEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    
    firebaseEnvVars.forEach(varName => {
      delete process.env[varName];
    });

    // Set valid env vars to allow module import
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123:web:abc';

    // Dynamically import after setting env vars
    const configModule = await import('@/lib/firebase/config');
    validateFirebaseEnvVars = configModule.validateFirebaseEnvVars;
    REQUIRED_ENV_VARS = configModule.REQUIRED_ENV_VARS;
  });

  afterEach(() => {
    // Restore original env vars
    process.env = { ...originalEnv };
  });

  describe('validateFirebaseEnvVars', () => {
    it('should pass validation when all required environment variables are set', () => {
      // Set all required environment variables with valid values
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';

      // Should not throw an error
      expect(() => validateFirebaseEnvVars()).not.toThrow();
    });

    it('should throw error when one environment variable is missing', () => {
      // Set all except one
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
      delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID; // Missing NEXT_PUBLIC_FIREBASE_APP_ID

      expect(() => validateFirebaseEnvVars()).toThrow();
      expect(() => validateFirebaseEnvVars()).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('NEXT_PUBLIC_FIREBASE_APP_ID'),
        })
      );
    });

    it('should throw error when multiple environment variables are missing', () => {
      // Set only some variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      // Missing: PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

      expect(() => validateFirebaseEnvVars()).toThrow();
      
      try {
        validateFirebaseEnvVars();
      } catch (err: any) {
        expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
        expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
        expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
      }
    });

    it('should throw error when all environment variables are missing', () => {
      // Delete all variables
      REQUIRED_ENV_VARS.forEach(varName => {
        delete process.env[varName];
      });

      expect(() => validateFirebaseEnvVars()).toThrow();
      
      try {
        validateFirebaseEnvVars();
      } catch (err: any) {
        expect(err.message).toContain('Missing required Firebase environment variables');
        // Check that all required vars are mentioned
        REQUIRED_ENV_VARS.forEach(varName => {
          expect(err.message).toContain(varName);
        });
      }
    });

    it('should throw error when environment variable is empty string', () => {
      // Set all variables but one is empty
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = ''; // Empty string

      expect(() => validateFirebaseEnvVars()).toThrow();
      expect(() => validateFirebaseEnvVars()).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('NEXT_PUBLIC_FIREBASE_APP_ID'),
        })
      );
    });

    it('should throw error when environment variable is whitespace only', () => {
      // Set all variables but one is only whitespace
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '   '; // Whitespace only

      expect(() => validateFirebaseEnvVars()).toThrow();
      expect(() => validateFirebaseEnvVars()).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('NEXT_PUBLIC_FIREBASE_APP_ID'),
        })
      );
    });

    it('should include helpful error message with instructions', () => {
      // Delete all variables
      REQUIRED_ENV_VARS.forEach(varName => {
        delete process.env[varName];
      });

      expect(() => validateFirebaseEnvVars()).toThrow();
      
      try {
        validateFirebaseEnvVars();
      } catch (err: any) {
        expect(err.message).toContain('Please ensure all required environment variables are set');
        expect(err.message).toContain('.env.local');
        expect(err.message).toContain('deployment environment');
      }
    });

    it('should list all missing variables in error message', () => {
      // Set some variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key-12345';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
      // Delete: STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
      delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

      try {
        validateFirebaseEnvVars();
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        const errorMessage = err.message;
        expect(errorMessage).toContain('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
        expect(errorMessage).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
        expect(errorMessage).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
        // Should not contain variables that are set
        expect(errorMessage).not.toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
        expect(errorMessage).not.toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
        expect(errorMessage).not.toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      }
    });

    it('should accept valid non-empty values', () => {
      // Set all variables with various valid formats
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyTest123456789';
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'my-project.firebaseapp.com';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'my-project-12345';
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'my-project.appspot.com';
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321';
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:xyz123';

      expect(() => validateFirebaseEnvVars()).not.toThrow();
    });
  });

  describe('REQUIRED_ENV_VARS constant', () => {
    it('should contain all 6 required environment variables', () => {
      expect(REQUIRED_ENV_VARS).toHaveLength(6);
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
    });
  });
});
