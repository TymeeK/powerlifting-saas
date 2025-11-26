import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateSignUpData,
  validatePasswordLength,
  validatePasswordMatch,
  createUser,
} from '@/lib/firebase/auth';
import { SignUpData } from '@/lib/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

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
