// Authentication types

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Result type for operations that can succeed or fail with a message.
 * Uses discriminated union for type safety.
 */
export type AuthResult =
  | { success: true }
  | { success: false; message: string };
