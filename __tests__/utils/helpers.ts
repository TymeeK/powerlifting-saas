import { expect } from 'vitest';
import { screen } from '@testing-library/react';
import { LOGIN_SELECTORS, FORGOT_PASSWORD_SELECTORS } from './selectors';
import { TEST_DATA } from './test-data';

// Common helper function for CSS class assertions
export const expectClasses = (
  element: HTMLElement | null,
  classes: readonly string[]
) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className);
  });
};

// Login-specific helper functions
export const createLoginHelpers = (mockSignIn: any) => {
  const fillForm = async (
    user: any,
    data: { email?: string; password?: string; rememberMe?: boolean } = {}
  ) => {
    const {
      email = TEST_DATA.email,
      password = TEST_DATA.password,
      rememberMe = false,
    } = data;

    await user.type(LOGIN_SELECTORS.emailInput(), email);
    await user.type(LOGIN_SELECTORS.passwordInput(), password);

    if (rememberMe) {
      await user.click(LOGIN_SELECTORS.rememberMeCheckbox());
    }
  };

  const submitForm = async (user: any) => {
    await user.click(LOGIN_SELECTORS.submitButton('sign in'));
  };

  const mockSuccessfulSignIn = () => {
    mockSignIn.mockResolvedValue({
      success: true,
      user: TEST_DATA.user,
    });
  };

  const mockFailedSignIn = (error = 'Invalid credentials') => {
    mockSignIn.mockRejectedValue(new Error(error));
  };

  const mockDelayedSignIn = (delay = 100) => {
    mockSignIn.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                success: true,
                user: TEST_DATA.user,
              }),
            delay
          )
        )
    );
  };

  const expectErrorToBeVisible = () => {
    expect(LOGIN_SELECTORS.errorMessage()).toBeInTheDocument();
  };

  const expectErrorToBeHidden = () => {
    expect(
      screen.queryByText('Incorrect email or password')
    ).not.toBeInTheDocument();
  };

  const expectLoadingState = () => {
    expect(LOGIN_SELECTORS.loadingText()).toBeInTheDocument();
    expect(LOGIN_SELECTORS.submitButtonLoading('signing in')).toBeDisabled();
  };

  const expectNotLoadingState = () => {
    expect(screen.queryByText('Signing In...')).not.toBeInTheDocument();
    expect(LOGIN_SELECTORS.submitButton('sign in')).not.toBeDisabled();
  };

  return {
    fillForm,
    submitForm,
    mockSuccessfulSignIn,
    mockFailedSignIn,
    mockDelayedSignIn,
    expectErrorToBeVisible,
    expectErrorToBeHidden,
    expectLoadingState,
    expectNotLoadingState,
  };
};

// Forgot password-specific helper functions
export const createForgotPasswordHelpers = (mockResetPassword: any) => {
  const fillEmail = async (user: any, email: string = TEST_DATA.email) => {
    await user.type(FORGOT_PASSWORD_SELECTORS.emailInput(), email);
  };

  const submitForm = async (user: any) => {
    await user.click(FORGOT_PASSWORD_SELECTORS.submitButton('send reset link'));
  };

  const mockSuccessfulReset = () => {
    mockResetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset email sent successfully!',
    });
  };

  const mockFailedReset = (
    error = 'An error occurred while sending password reset email'
  ) => {
    mockResetPassword.mockRejectedValue(new Error(error));
  };

  const mockDelayedReset = (delay = 100) => {
    mockResetPassword.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: 'Password reset email sent successfully!',
              }),
            delay
          )
        )
    );
  };

  const expectErrorToBeVisible = () => {
    expect(FORGOT_PASSWORD_SELECTORS.errorMessage()).toBeInTheDocument();
  };

  const expectErrorToBeHidden = () => {
    expect(FORGOT_PASSWORD_SELECTORS.errorMessage()).not.toBeInTheDocument();
  };

  const expectSuccessToBeVisible = () => {
    expect(FORGOT_PASSWORD_SELECTORS.successMessage()).toBeInTheDocument();
  };

  const expectSuccessToBeHidden = () => {
    expect(FORGOT_PASSWORD_SELECTORS.successMessage()).not.toBeInTheDocument();
  };

  const expectLoadingState = () => {
    expect(screen.getByText('Sending Reset Link...')).toBeInTheDocument();
    expect(
      FORGOT_PASSWORD_SELECTORS.submitButtonLoading('sending reset link')
    ).toBeDisabled();
  };

  const expectNotLoadingState = () => {
    expect(screen.queryByText('Sending Reset Link...')).not.toBeInTheDocument();
    expect(
      FORGOT_PASSWORD_SELECTORS.submitButton('send reset link')
    ).not.toBeDisabled();
  };

  return {
    fillEmail,
    submitForm,
    mockSuccessfulReset,
    mockFailedReset,
    mockDelayedReset,
    expectErrorToBeVisible,
    expectErrorToBeHidden,
    expectSuccessToBeVisible,
    expectSuccessToBeHidden,
    expectLoadingState,
    expectNotLoadingState,
  };
};
