// Shared test data constants for authentication pages

export const TEST_DATA = {
  email: 'test@example.com',
  password: 'password123',
  wrongPassword: 'wrongpassword',
  invalidEmail: 'invalid-email',
  nonExistentEmail: 'nonexistent@example.com',
  user: {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
} as const;
