// Authentication functions
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { SignUpData, LoginData, AuthResult } from '@/lib/types';
import { logger } from '@/lib/logger';

// Create a child logger for auth operations
const authLogger = logger.child({ component: 'firebase-auth' });

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Invalid email address',
  'auth/weak-password': 'Password is too weak',
  'auth/user-not-found': 'No account found with this email address',
  'auth/wrong-password': 'Incorrect password',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later',
  'auth/requires-recent-login': 'Please log in again and try',
};

const handleAuthError = (error: any, defaultMessage: string): string => {
  return AUTH_ERROR_MESSAGES[error.code] || error.message || defaultMessage;
};

const updateFirestoreUserDocument = async (
  userId: string,
  updates: Record<string, any>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (firestoreError) {
    authLogger.warn('Failed to update Firestore user document', {
      error:
        firestoreError instanceof Error
          ? {
              message: firestoreError.message,
              stack: firestoreError.stack,
              name: firestoreError.name,
            }
          : firestoreError,
    });
  }
};

/**
 * Validates the length of the password.
 * @param password - The password to validate
 * @returns true if the password is at least 6 characters long, false otherwise
 */

export const validatePasswordLength = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validates if the password and confirm password match.
 * @param password - The password to validate
 * @param confirmPassword - The confirm password to validate
 * @returns true if the password and confirm password match, false otherwise
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

/**
 * Validates the sign up data including passwords matching and password length < 6 characters.
 * @param signUpData - The sign up data including first name, last name, email, password, and confirm password
 * @returns { success: boolean; message: string } - The result of the validation
 * @returns { success: true } - The result of the validation if the sign up data is valid
 * @returns { success: false, message: 'Passwords do not match' } - The result of the validation if the passwords do not match
 * @returns { success: false, message: 'Password must be at least 6 characters long' } - The result of the validation if the password is less than 6 characters long
 */
export const validateSignUpData = (signUpData: SignUpData): AuthResult => {
  const { password, confirmPassword } = signUpData;
  if (!validatePasswordMatch(password, confirmPassword)) {
    return {
      success: false,
      message: 'Passwords do not match',
    };
  }
  if (!validatePasswordLength(password)) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  return {
    success: true,
  };
};

/**
 * Create a new user in Firebase Auth using createUserWithEmailAndPassword.
 * If the user creation fails, an error is thrown.
 * @param email - The email address of the user to create
 * @param password - The password of the user to create
 * @returns The user object
 * @throws An error if the user creation fails
 */
export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    authLogger.error('Error creating user', error, {
      errorCode: error.code,
    });
    throw new Error(
      handleAuthError(error, 'An error occurred during user creation')
    );
  }
};

/**
 * Updates the display name in Firebase Auth profile.
 * @param user - The Firebase user object
 * @param displayName - The display name to set
 */
export const updateAuthDisplayName = async (
  user: User,
  displayName: string
): Promise<void> => {
  await updateProfile(user, { displayName });
};

/**
 * Orchestrates the user sign up process.
 * Validates the sign up data, creates a user in Firebase Auth, updates the display name,
 * and stores the user's first name, last name, and timestamps in Firestore.
 * @param signUpData - The sign up data including first name, last name, email, password, and confirm password
 * @returns A promise that resolves to an AuthResult with success status. Returns validation error if sign up data is invalid.
 */
export const signUp = async (signUpData: SignUpData): Promise<AuthResult> => {
  const { firstName, lastName, email, password } = signUpData;

  const validationResult = validateSignUpData(signUpData);
  if (!validationResult.success) {
    return validationResult;
  }

  const user = await createUser(email, password);
  const displayName = `${firstName} ${lastName}`;
  await updateAuthDisplayName(user, displayName);

  const userData = {
    firstName,
    lastName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await updateFirestoreUserDocument(user.uid, userData);
  return {
    success: true,
  };
};

/**
 * Sign in a user with the given login data.
 * @param loginData - The login data including email and password
 * @returns A promise that resolves to an AuthResult with success status. Returns validation error if login data is invalid.
 * @throws An error if the sign in fails
 */
export const signIn = async (loginData: LoginData) => {
  const { email, password } = loginData;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    authLogger.error('Error during sign in', error, {
      errorCode: error.code,
    });
    throw new Error(handleAuthError(error, 'An error occurred during sign in'));
  }
};

/**
 * Send a password reset email to the given email address.
 * @param email - The email address to send the password reset email to. Must be a valid email address.
 * @returns A promise that resolves to an AuthResult with success status. Returns validation error if email is invalid.
 * @throws An error if the password reset email fails to send
 */

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: 'Password reset email sent successfully!',
    };
  } catch (error: any) {
    authLogger.error('Error sending password reset email', error, {
      errorCode: error.code,
    });
    throw new Error(
      handleAuthError(
        error,
        'An error occurred while sending password reset email'
      )
    );
  }
};

export const isUserSignedIn = () => {
  return auth.currentUser !== null;
};

/**
 * Re-authenticate a user with the given password.
 * @param password - The password of the user to re-authenticate
 * @returns A promise that resolves to an AuthResult with success status. Returns validation error if user is not signed in or password is invalid.
 * @throws An error if the re-authentication fails. Returns an error message if the re-authentication fails.
 */

export const reauthenticateUser = async (
  password: string
): Promise<{ success: boolean; message: string }> => {
  if (!auth.currentUser || !auth.currentUser.email) {
    return {
      success: false,
      message: 'No user is currently signed in',
    };
  }

  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    return {
      success: true,
      message: 'Re-authentication successful',
    };
  } catch (error: any) {
    authLogger.error('Re-authentication failed', error, {
      errorCode: error.code,
    });
    return {
      success: false,
      message: handleAuthError(error, 'Re-authentication failed'),
    };
  }
};

//TODO: Add verification for new email address
export const updateUserEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  if (!auth.currentUser) {
    return {
      success: false,
      message: 'No user is currently signed in',
    };
  }

  const reAuthResult = await reauthenticateUser(password);
  if (!reAuthResult.success) {
    return reAuthResult;
  }

  try {
    await updateEmail(auth.currentUser, email);
    await updateFirestoreUserDocument(auth.currentUser.uid, { email });

    return {
      success: true,
      message: 'Email updated successfully!',
    };
  } catch (error: any) {
    authLogger.error('Error updating user email', error, {
      errorCode: error.code,
    });
    return {
      success: false,
      message: handleAuthError(error, 'Failed to update email'),
    };
  }
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  if (!auth.currentUser) {
    return {
      success: false,
      message: 'No user is currently signed in',
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long',
    };
  }

  const reAuthResult = await reauthenticateUser(currentPassword);
  if (!reAuthResult.success) {
    return reAuthResult;
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
    return {
      success: true,
      message: 'Password updated successfully!',
    };
  } catch (error: any) {
    authLogger.error('Error updating user password', error, {
      errorCode: error.code,
    });
    return {
      success: false,
      message: handleAuthError(error, 'Failed to update password'),
    };
  }
};

const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Validates that both first name and last name are provided.
 * @param firstName - The first name to validate
 * @param lastName - The last name to validate
 * @returns An object with success status and optional error message
 */
const validateNameInputs = (
  firstName: string,
  lastName: string
): { success: boolean; message?: string } => {
  if (!firstName || !lastName) {
    return {
      success: false,
      message: 'Both first name and last name are required',
    };
  }
  return { success: true };
};

/**
 * Updates the user's name in Firestore.
 * @param userId - The user's unique identifier
 * @param firstName - The user's first name
 * @param lastName - The user's last name
 */
const updateFirestoreUserName = async (
  userId: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  await updateFirestoreUserDocument(userId, {
    firstName,
    lastName,
  });
};

/**
 * Updates the user's display name in both Firebase Auth and Firestore.
 * @param firstName - The user's first name
 * @param lastName - The user's last name
 * @returns An object with success status and message
 */
export const updateUserDisplayName = async (
  firstName: string,
  lastName: string
): Promise<{ success: boolean; message: string }> => {
  const user = getCurrentUser();
  if (!user) {
    return {
      success: false,
      message: 'No user is currently signed in',
    };
  }

  const validationResult = validateNameInputs(firstName, lastName);
  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult.message || 'Validation failed',
    };
  }

  try {
    const displayName = `${firstName} ${lastName}`;
    await updateAuthDisplayName(user, displayName);
    await updateFirestoreUserName(user.uid, firstName, lastName);

    return {
      success: true,
      message: 'Name updated successfully!',
    };
  } catch (error: any) {
    authLogger.error('Error updating user display name', error, {
      errorCode: error.code,
    });
    return {
      success: false,
      message: handleAuthError(error, 'Failed to update name'),
    };
  }
};
