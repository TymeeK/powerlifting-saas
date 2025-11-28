import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateSignUpData,
  validatePasswordLength,
  validatePasswordMatch,
  createUser,
  updateAuthDisplayName,
  isUserSignedIn,
  reauthenticateUser,
} from '@/lib/firebase/auth';
import { SignUpData } from '@/lib/types';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { updateDoc, setDoc } from 'firebase/firestore';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  reauthenticateWithCredential: vi.fn(),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, collection, id) => ({ db, collection, id })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

describe('updateAuthDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update the display name', async () => {
    const mockUser = {
      uid: 'test-user-123',
      displayName: 'Test User',
      email: 'test@example.com',
    };
    const displayName = 'New Display Name';

    vi.mocked(updateProfile).mockResolvedValue(undefined);

    await updateAuthDisplayName(mockUser as any, displayName);

    expect(updateProfile).toHaveBeenCalledOnce();
    expect(updateProfile).toHaveBeenCalledWith(mockUser, {
      displayName,
    });
  });
});

describe('validatePasswordLength', () => {
  it('should return true when password is exactly 6 characters', () => {
    expect(validatePasswordLength('123456')).toBe(true);
  });

  it('should return true when password is more than 6 characters', () => {
    expect(validatePasswordLength('password123')).toBe(true);
  });

  it('should return false when password is 5 characters', () => {
    expect(validatePasswordLength('12345')).toBe(false);
  });

  it('should return false when password is empty', () => {
    expect(validatePasswordLength('')).toBe(false);
  });
});

describe('validatePasswordMatch', () => {
  it('should return true when passwords match', () => {
    expect(validatePasswordMatch('password123', 'password123')).toBe(true);
  });

  it('should return false when passwords do not match', () => {
    expect(validatePasswordMatch('password123', 'different')).toBe(false);
  });
});

describe('createUser', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: null,
    emailVerified: false,
  };

  const setupMockUserCredential = () => {
    const mockUserCredential = {
      user: mockUser,
    };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(
      mockUserCredential as any
    );
    return mockUserCredential;
  };

  const setupMockError = (error: { code: string; message?: string }) => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(error);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully call createUserWithEmailAndPassword', async () => {
    setupMockUserCredential();

    await createUser('test@example.com', 'password123');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'test@example.com',
      'password123'
    );
  });

  it('should successfully return User object', async () => {
    setupMockUserCredential();

    const result = await createUser('test@example.com', 'password123');
    expect(result).toEqual(mockUser);
  });

  it('should throw error when email is already in use', async () => {
    setupMockError({
      code: 'auth/email-already-in-use',
      message: 'This email is already registered',
    });

    await expect(
      createUser('existing@example.com', 'password123')
    ).rejects.toThrow('This email is already registered');
  });

  it('should throw error when email is invalid', async () => {
    setupMockError({
      code: 'auth/invalid-email',
      message: 'Invalid email address',
    });

    await expect(createUser('invalid-email', 'password123')).rejects.toThrow(
      'Invalid email address'
    );
  });

  it('should throw error when password is too weak', async () => {
    setupMockError({
      code: 'auth/weak-password',
      message: 'Password is too weak',
    });

    await expect(createUser('test@example.com', '123')).rejects.toThrow(
      'Password is too weak'
    );
  });

  it('should throw generic error message for unknown errors', async () => {
    setupMockError({
      code: 'auth/unknown-error',
      message: 'Something went wrong',
    });

    await expect(createUser('test@example.com', 'password123')).rejects.toThrow(
      'Something went wrong'
    );
  });

  it('should throw default error message when error has no message', async () => {
    setupMockError({
      code: 'auth/unknown-error',
    });

    await expect(createUser('test@example.com', 'password123')).rejects.toThrow(
      'An error occurred during user creation'
    );
  });
});

describe('validateSignUpData', () => {
  const createSignUpData = (overrides?: Partial<SignUpData>): SignUpData => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    ...overrides,
  });

  it('should return success: true when data is valid', () => {
    const result = validateSignUpData(createSignUpData());
    expect(result).toEqual({ success: true });
  });

  it('should return error when passwords do not match', () => {
    const result = validateSignUpData(
      createSignUpData({
        password: 'password123',
        confirmPassword: 'different',
      })
    );
    expect(result).toEqual({
      success: false,
      message: 'Passwords do not match',
    });
  });

  it('should return error when password is less than 6 characters', () => {
    const result = validateSignUpData(
      createSignUpData({ password: '12345', confirmPassword: '12345' })
    );
    expect(result).toEqual({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  });

  it('should check password mismatch before password length', () => {
    const result = validateSignUpData(
      createSignUpData({ password: '12345', confirmPassword: '123456' })
    );
    expect(result).toEqual({
      success: false,
      message: 'Passwords do not match',
    });
  });
});

describe('signUp', () => {
  let authModule: typeof import('@/lib/firebase/auth');

  const createSignUpData = (overrides?: Partial<SignUpData>): SignUpData => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    ...overrides,
  });

  const mockUser = {
    uid: 'test-user-123',
    email: 'john@example.com',
    displayName: null,
    emailVerified: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: mockUser,
    } as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    authModule = await import('@/lib/firebase/auth');

    vi.spyOn(authModule, 'validateSignUpData').mockReturnValue({
      success: true,
    });
    vi.spyOn(authModule, 'createUser').mockResolvedValue(mockUser as any);
    vi.spyOn(authModule, 'updateAuthDisplayName').mockResolvedValue(undefined);
  });

  it('should successfully orchestrate the sign up process', async () => {
    const signUpData = createSignUpData();

    const result = await authModule.signUp(signUpData);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      signUpData.email,
      signUpData.password
    );
    expect(updateProfile).toHaveBeenCalledWith(mockUser, {
      displayName: 'John Doe',
    });
    expect(updateDoc).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should return validation error when sign up data is invalid', async () => {
    const signUpData = createSignUpData({
      password: '12345',
      confirmPassword: '12345',
    });

    const result = await authModule.signUp(signUpData);

    expect(result).toEqual({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('should propagate error when user creation fails', async () => {
    const signUpData = createSignUpData();

    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: 'auth/email-already-in-use',
      message: 'This email is already registered',
    });

    await expect(authModule.signUp(signUpData)).rejects.toThrow(
      'This email is already registered'
    );

    expect(updateProfile).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('should call functions in the correct order', async () => {
    const signUpData = createSignUpData();
    const callOrder: string[] = [];

    vi.mocked(createUserWithEmailAndPassword).mockImplementation(async () => {
      callOrder.push('createUserWithEmailAndPassword');
      return { user: mockUser } as any;
    });

    vi.mocked(updateProfile).mockImplementation(async () => {
      callOrder.push('updateProfile');
    });

    vi.mocked(updateDoc).mockImplementation(async () => {
      callOrder.push('updateDoc');
    });

    await authModule.signUp(signUpData);

    expect(callOrder).toEqual([
      'createUserWithEmailAndPassword',
      'updateProfile',
      'updateDoc',
    ]);
  });
});

describe('isUserSignedIn', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'john@example.com',
    displayName: null,
    emailVerified: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (auth as any).currentUser = null;
  });

  it('should return true when a user is signed in', () => {
    (auth as any).currentUser = mockUser;
    expect(isUserSignedIn()).toBe(true);
  });

  it('should return false when no user is signed in', () => {
    (auth as any).currentUser = null;
    expect(isUserSignedIn()).toBe(false);
  });
});

describe('reauthenticateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    uid: 'test-user-123',
    email: 'john@example.com',
    displayName: null,
    emailVerified: false,
  };

  it('should return success: true when reauthentication is successful', async () => {
    (auth as any).currentUser = mockUser;
    const result = await reauthenticateUser('password123');
    expect(result).toEqual({
      success: true,
      message: 'Re-authentication successful',
    });
  });

  it('should return validation error when no user is signed in', async () => {
    (auth as any).currentUser = null;
    const result = await reauthenticateUser('password123');
    expect(result).toEqual({
      success: false,
      message: 'No user is currently signed in',
    });
  });

  it('should return validation error when password is less than 6 characters', async () => {
    (auth as any).currentUser = mockUser;
    const result = await reauthenticateUser('inval');
    expect(result).toEqual({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  });
});
