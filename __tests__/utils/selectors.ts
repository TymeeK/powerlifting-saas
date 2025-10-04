import { screen } from '@testing-library/react';

// Common selectors for authentication pages
export const AUTH_SELECTORS = {
  emailInput: () => screen.getByLabelText(/email address/i),
  passwordInput: () => screen.getByLabelText(/password/i),
  submitButton: (text: string) =>
    screen.getByRole('button', { name: new RegExp(text, 'i') }),
  submitButtonLoading: (text: string) =>
    screen.getByRole('button', { name: new RegExp(text, 'i') }),
  mainElement: () => screen.getByRole('main'),
  form: () => document.querySelector('form'),
  orText: () => screen.getByText('or'),
  separators: () =>
    screen
      .getAllByRole('none')
      .filter(el => el.getAttribute('data-slot') === 'separator'),
} as const;

// Login-specific selectors
export const LOGIN_SELECTORS = {
  ...AUTH_SELECTORS,
  rememberMeCheckbox: () =>
    screen.getByRole('checkbox', { name: /remember me/i }),
  forgotPasswordLink: () =>
    screen.getByRole('link', { name: /forgot your password/i }),
  signupLink: () => screen.getByRole('link', { name: /sign up/i }),
  mainHeading: () => screen.getByRole('heading', { name: /sign in/i }),
  errorMessage: () => screen.getByText('Incorrect email or password'),
  loadingText: () => screen.getByText('Signing In...'),
} as const;

// Forgot password-specific selectors
export const FORGOT_PASSWORD_SELECTORS = {
  ...AUTH_SELECTORS,
  backToLoginLink: () => screen.getByRole('link', { name: /sign in/i }),
  tryAgainButton: () => screen.getByRole('button', { name: /try again/i }),
  mainHeading: () => screen.getByRole('heading', { name: /reset password/i }),
  errorMessage: () => screen.queryByText(/error occurred while sending/i),
  successMessage: () => screen.queryByText(/password reset email sent/i),
} as const;

// Signup-specific selectors
export const SIGNUP_SELECTORS = {
  ...AUTH_SELECTORS,
  firstNameInput: () => screen.getByLabelText(/first name/i),
  lastNameInput: () => screen.getByLabelText(/last name/i),
  passwordInput: () => screen.getByLabelText(/^password$/i), // More specific regex to match only "Password" not "Confirm Password"
  confirmPasswordInput: () => screen.getByLabelText(/confirm password/i),
  mainHeading: () => screen.getByRole('heading', { name: /join pr tracker/i }),
  subtitle: () =>
    screen.getByText('Start tracking your lifting progress today'),
  submitButton: () => screen.getByRole('button', { name: /create account/i }),
  submitButtonLoading: () =>
    screen.getByRole('button', { name: /creating account/i }),
  loginLink: () => screen.getByRole('link', { name: /sign in/i }),
  termsLink: () => screen.getByRole('link', { name: /terms of service/i }),
  privacyLink: () => screen.getByRole('link', { name: /privacy policy/i }),
  passwordMismatchWarning: () => screen.queryByText('Passwords do not match'),
  errorMessage: () => screen.queryByText(/error occurred during sign up/i),
  successMessage: () => screen.queryByText(/account created successfully/i),
} as const;
