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

const validateSignUpData = (signUpData: SignUpData): AuthResult => {
  const { firstName, lastName, email, password, confirmPassword } = signUpData;
  if (password !== confirmPassword) {
    return {
      success: false,
      message: 'Passwords do not match',
    };
  }
  if (password.length < 6) {
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
 * Signs up a user with the given sign up data in the database.
 * The function checks for passwords matching and password length < 6 characters.
 * Uses firebase authentication to create a new user and then stores the user data in the database.
 *  **TODO ** Consider refactoring this function because it is doing multiple things and should only sign up the user
 * - It is currently creating a user in the database and then storing the user data in the database.
 * - It is currently updating the user's display name and email in the database.
 * - It is currently setting the user's createdAt and updatedAt fields in the database.
 * - It is currently returning the user object if the sign up is successful, otherwise throwing an error.
 * - It is currently logging the user's creation and update in the database.
 * - It is currently logging the user's creation and update in the database.
 * @param signUpData - The sign up data including first name, last name, email, password, and confirm password
 * @returns A promise that resolves to the user object if the sign up is successful, otherwise throws an error
 */
export const signUp = async (signUpData: SignUpData) => {
  const { firstName, lastName, email, password, confirmPassword } = signUpData;

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  try {
    authLogger.debug('Creating user account');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    authLogger.info('User account created successfully');

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    try {
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      authLogger.debug('User data stored in Firestore successfully');
    } catch (firestoreError) {
      authLogger.error('Error storing user data in Firestore', firestoreError);
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error: any) {
    authLogger.error('Error during sign up', error, {
      errorCode: error.code,
    });
    throw new Error(handleAuthError(error, 'An error occurred during sign up'));
  }
};

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

export const updateUserDisplayName = async (
  firstName: string,
  lastName: string
): Promise<{ success: boolean; message: string }> => {
  if (!auth.currentUser) {
    return {
      success: false,
      message: 'No user is currently signed in',
    };
  }

  if (!firstName || !lastName) {
    return {
      success: false,
      message: 'Both first name and last name are required',
    };
  }

  try {
    const displayName = `${firstName} ${lastName}`;
    await updateProfile(auth.currentUser, {
      displayName,
    });
    await updateFirestoreUserDocument(auth.currentUser.uid, {
      firstName,
      lastName,
    });

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
