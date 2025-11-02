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
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { SignUpData, LoginData } from './types';

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

export const signUp = async (signUpData: SignUpData) => {
  const { firstName, lastName, email, password, confirmPassword } = signUpData;

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  try {
    console.log('Creating user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log('User created successfully:', user.uid);

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
      console.log('User data stored in Firestore successfully');
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
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
    return {
      success: true,
      message: 'Email updated successfully!',
    };
  } catch (error: any) {
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
    return {
      success: false,
      message: handleAuthError(error, 'Failed to update password'),
    };
  }
};
