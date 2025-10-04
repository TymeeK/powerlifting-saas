import { vi } from 'vitest';

export const mockAuth = {
  currentUser: {
    uid: '123',
    email: 'test@test.com',
    displayName: 'Test User',
  },
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
};
