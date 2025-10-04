import { vi } from 'vitest';

// Mock User object that matches Firebase User interface
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-15T10:30:00.000Z',
  },
  providerData: [
    {
      providerId: 'password',
      uid: 'test@example.com',
      displayName: 'Test User',
      email: 'test@example.com',
    },
  ],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: vi.fn().mockResolvedValue({
    token: 'mock-id-token',
    authTime: '2024-01-15T10:30:00.000Z',
    issuedAtTime: '2024-01-15T10:30:00.000Z',
    expirationTime: '2024-01-15T11:30:00.000Z',
    signInProvider: 'password',
    signInSecondFactor: null,
    claims: {},
  }),
  reload: vi.fn().mockResolvedValue(undefined),
  toJSON: vi.fn().mockReturnValue({}),
  ...overrides,
});

// Mock Auth object that replaces Firebase Auth
export const mockAuth: any = {
  // Current user state
  currentUser: createMockUser(),

  // Auth state listener
  onAuthStateChanged: vi.fn(callback => {
    // Simulate authenticated user by default
    callback(mockAuth.currentUser);
    return () => {}; // unsubscribe function
  }),

  // Authentication methods
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),

  signInWithRedirect: vi.fn().mockResolvedValue(undefined),

  signOut: vi.fn().mockResolvedValue(undefined),

  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),

  sendEmailVerification: vi.fn().mockResolvedValue(undefined),

  updatePassword: vi.fn().mockResolvedValue(undefined),

  updateProfile: vi.fn().mockResolvedValue(undefined),

  updateEmail: vi.fn().mockResolvedValue(undefined),

  deleteUser: vi.fn().mockResolvedValue(undefined),

  // Additional properties
  app: {
    name: 'test-app',
    options: {},
  },

  config: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
  },

  // Language code
  languageCode: 'en',
  setLanguageCode: vi.fn(),

  // Settings
  settings: {
    appVerificationDisabledForTesting: false,
  },

  useDeviceLanguage: vi.fn(),

  // Tenant management
  tenantId: null,
  useEmulator: vi.fn(),
};

// Set up mock implementations after declaration
mockAuth.signInWithEmailAndPassword.mockResolvedValue({
  user: mockAuth.currentUser,
  credential: null,
  operationType: 'signIn',
});

mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
  user: mockAuth.currentUser,
  credential: null,
  operationType: 'signIn',
});

mockAuth.signInWithPopup.mockResolvedValue({
  user: mockAuth.currentUser,
  credential: null,
  operationType: 'signIn',
});

// Helper functions to control mock behavior
export const authMockHelpers = {
  // Set authenticated user
  setUser: (user: any) => {
    mockAuth.currentUser = user;
  },

  // Set unauthenticated state
  setUnauthenticated: () => {
    mockAuth.currentUser = null;
  },

  // Simulate auth state change
  simulateAuthStateChange: (user: any) => {
    mockAuth.currentUser = user;
    // Get the callback that was registered
    const callbacks = mockAuth.onAuthStateChanged.mock.calls;
    callbacks.forEach(([callback]: any) => {
      callback(user);
    });
  },

  // Simulate successful sign in
  simulateSignIn: (userData = {}) => {
    const user = createMockUser(userData);
    mockAuth.currentUser = user;
    mockAuth.signInWithEmailAndPassword.mockResolvedValue({
      user,
      credential: null,
      operationType: 'signIn',
    });
    return user;
  },

  // Simulate sign in failure
  simulateSignInError: (error: any) => {
    mockAuth.signInWithEmailAndPassword.mockRejectedValue(error);
  },

  // Simulate successful sign up
  simulateSignUp: (userData = {}) => {
    const user = createMockUser(userData);
    mockAuth.currentUser = user;
    mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user,
      credential: null,
      operationType: 'signIn',
    });
    return user;
  },

  // Simulate sign out
  simulateSignOut: () => {
    mockAuth.currentUser = null;
    mockAuth.signOut.mockResolvedValue(undefined);
  },

  // Reset all mocks
  reset: () => {
    Object.values(mockAuth).forEach(mock => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        (mock as any).mockReset();
      }
    });
    mockAuth.currentUser = createMockUser();
  },
};
