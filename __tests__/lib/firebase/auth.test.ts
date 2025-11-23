import { describe, it, expect } from 'vitest';
import {
  validateSignUpData,
  validatePasswordLength,
  validatePasswordMatch,
} from '@/lib/firebase/auth';
import { SignUpData } from '@/lib/types';

describe('validatePasswordLength', () => {
  it('should return true when password is 6 or more characters', () => {
    expect(validatePasswordLength('123456')).toBe(true);
    expect(validatePasswordLength('password123')).toBe(true);
  });

  it('should return false when password is less than 6 characters', () => {
    expect(validatePasswordLength('12345')).toBe(false);
    expect(validatePasswordLength('')).toBe(false);
  });
});

describe('validatePasswordMatch', () => {
  it('should return true when passwords match', () => {
    expect(validatePasswordMatch('password123', 'password123')).toBe(true);
    expect(validatePasswordMatch('', '')).toBe(true);
  });

  it('should return false when passwords do not match', () => {
    expect(validatePasswordMatch('password123', 'different')).toBe(false);
    expect(validatePasswordMatch('pass', 'pass1')).toBe(false);
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
