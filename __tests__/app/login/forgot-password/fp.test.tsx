import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '@/app/login/forgot-password/page';
import { resetPassword } from '@/lib/firebase';
import {
  TEST_DATA,
  FORGOT_PASSWORD_SELECTORS,
  CSS_CLASSES,
  expectClasses,
  createForgotPasswordHelpers,
} from '../../../utils';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  resetPassword: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  const mockResetPassword = vi.mocked(resetPassword);
  const {
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
  } = createForgotPasswordHelpers(mockResetPassword);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the forgot password page with all required elements', () => {
      render(<ForgotPasswordPage />);

      expect(FORGOT_PASSWORD_SELECTORS.mainHeading()).toBeInTheDocument();
      expect(
        screen.getByText(/enter your email address and we'll send you a link/i)
      ).toBeInTheDocument();
      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toBeInTheDocument();
      expect(
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link')
      ).toBeInTheDocument();
      expect(FORGOT_PASSWORD_SELECTORS.backToLoginLink()).toBeInTheDocument();
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByText(/didn't receive the email/i)).toBeInTheDocument();
      expect(FORGOT_PASSWORD_SELECTORS.tryAgainButton()).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute(
        'placeholder',
        'Enter your email address'
      );
      expect(emailInput).toHaveValue('');
    });

    it('renders back to login link with correct href', () => {
      render(<ForgotPasswordPage />);

      const backToLoginLink = FORGOT_PASSWORD_SELECTORS.backToLoginLink();
      expect(backToLoginLink).toBeInTheDocument();
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });

    it('renders form with proper structure', () => {
      render(<ForgotPasswordPage />);

      const form = FORGOT_PASSWORD_SELECTORS.form();
      expect(form).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.email);

      expect(emailInput).toHaveValue(TEST_DATA.email);
    });

    it('shows validation for required email field when form is submitted empty', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await submitForm(user);

      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toBeInvalid();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.invalidEmail);

      expect(emailInput).toBeInvalid();
    });
  });

  describe('Form Submission', () => {
    it('calls Firebase resetPassword with correct email on successful submission', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      expect(mockResetPassword).toHaveBeenCalledWith(TEST_DATA.email);
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      mockDelayedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      expectLoadingState();
    });

    it('shows success message on successful password reset', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectSuccessToBeVisible();
      });
    });

    it('clears email field on successful password reset', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toHaveValue('');
      });
    });

    it('shows error message on password reset failure', async () => {
      const user = userEvent.setup();
      mockFailedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });
    });

    it('prevents form submission with empty email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await submitForm(user);

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('prevents form submission with invalid email format', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await fillEmail(user, TEST_DATA.invalidEmail);
      await submitForm(user);

      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles specific Firebase errors correctly', async () => {
      const user = userEvent.setup();
      mockFailedReset('No account found with this email address');

      render(<ForgotPasswordPage />);

      await fillEmail(user, TEST_DATA.nonExistentEmail);
      await submitForm(user);

      await waitFor(() => {
        expect(
          screen.getByText('No account found with this email address')
        ).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      mockFailedReset('Network error');

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('clears error message when form is resubmitted', async () => {
      const user = userEvent.setup();
      mockFailedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });

      mockSuccessfulReset();
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeHidden();
      });
    });

    it('clears error and success messages when try again is clicked', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectSuccessToBeVisible();
      });

      await user.click(FORGOT_PASSWORD_SELECTORS.tryAgainButton());

      expectErrorToBeHidden();
      expectSuccessToBeHidden();
      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toHaveValue('');
    });
  });

  describe('Success State Management', () => {
    it('shows success message with proper styling and icon', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        const successMessage = FORGOT_PASSWORD_SELECTORS.successMessage();
        expect(successMessage).toBeInTheDocument();

        const successContainer = successMessage?.closest(
          'div'
        ) as HTMLElement | null;
        expectClasses(successContainer, CSS_CLASSES.success.container);
        expectClasses(successMessage, CSS_CLASSES.success.text);

        const successIcon = successMessage?.querySelector(
          'svg'
        ) as HTMLElement | null;
        expect(successIcon).toBeInTheDocument();
        if (successIcon) {
          expectClasses(successIcon, CSS_CLASSES.success.icon);
        }
      });
    });

    it('does not display success message initially', () => {
      render(<ForgotPasswordPage />);
      expectSuccessToBeHidden();
    });

    it('maintains success state until try again is clicked', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectSuccessToBeVisible();
      });

      // Success message should persist
      expectSuccessToBeVisible();

      await user.click(FORGOT_PASSWORD_SELECTORS.tryAgainButton());
      expectSuccessToBeHidden();
    });
  });

  describe('Error Message Display', () => {
    it('displays error message with proper styling and icon', async () => {
      const user = userEvent.setup();
      mockFailedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        const errorMessage = FORGOT_PASSWORD_SELECTORS.errorMessage();
        expect(errorMessage).toBeInTheDocument();

        const errorContainer = errorMessage?.closest(
          'div'
        ) as HTMLElement | null;
        expectClasses(errorContainer, CSS_CLASSES.error.container);
        expectClasses(errorMessage, CSS_CLASSES.error.text);

        const errorIcon = errorMessage?.querySelector(
          'svg'
        ) as HTMLElement | null;
        expect(errorIcon).toBeInTheDocument();
        if (errorIcon) {
          expectClasses(errorIcon, CSS_CLASSES.error.icon);
        }
      });
    });

    it('does not display error message initially', () => {
      render(<ForgotPasswordPage />);
      expectErrorToBeHidden();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('has proper heading hierarchy', () => {
      render(<ForgotPasswordPage />);

      const mainHeading = FORGOT_PASSWORD_SELECTORS.mainHeading();
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('has proper button roles', () => {
      render(<ForgotPasswordPage />);

      expect(
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link')
      ).toBeInTheDocument();
      expect(FORGOT_PASSWORD_SELECTORS.tryAgainButton()).toBeInTheDocument();
    });

    it('has proper form structure with main landmark', () => {
      render(<ForgotPasswordPage />);

      expect(FORGOT_PASSWORD_SELECTORS.mainElement()).toBeInTheDocument();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await user.tab();
      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toHaveFocus();

      await user.tab();
      expect(
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link')
      ).toHaveFocus();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<ForgotPasswordPage />);

      const mainElement = FORGOT_PASSWORD_SELECTORS.mainElement();
      expect(mainElement).toHaveClass('min-h-screen', 'w-screen', 'max-w-full');

      const heading = FORGOT_PASSWORD_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies gradient styling to main heading', () => {
      render(<ForgotPasswordPage />);

      const heading = FORGOT_PASSWORD_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });

    it('applies gradient background to main container', () => {
      render(<ForgotPasswordPage />);

      const mainElement = FORGOT_PASSWORD_SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.gradients.main);
    });

    it('applies gradient styling to submit button', () => {
      render(<ForgotPasswordPage />);

      const submitButton =
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link');
      expectClasses(submitButton, CSS_CLASSES.gradients.button);
    });

    it('applies disabled state styling to button when loading', async () => {
      const user = userEvent.setup();
      mockDelayedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      const submitButton =
        FORGOT_PASSWORD_SELECTORS.submitButtonLoading('sending reset link');
      expectClasses(submitButton, CSS_CLASSES.disabled);
      expect(submitButton).toBeDisabled();
    });

    it('applies hover effects to interactive elements', () => {
      render(<ForgotPasswordPage />);

      const submitButton =
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link');
      expectClasses(submitButton, CSS_CLASSES.hover.button);

      const backToLoginLink = FORGOT_PASSWORD_SELECTORS.backToLoginLink();
      expectClasses(backToLoginLink, CSS_CLASSES.hover.link);

      const tryAgainButton = FORGOT_PASSWORD_SELECTORS.tryAgainButton();
      expectClasses(tryAgainButton, CSS_CLASSES.hover.link);
    });
  });

  describe('Separator Component', () => {
    it('renders separator with proper styling', () => {
      render(<ForgotPasswordPage />);

      const separators = FORGOT_PASSWORD_SELECTORS.separators();
      expect(separators).toHaveLength(2);

      separators.forEach(separator => {
        expectClasses(separator, CSS_CLASSES.separator);
      });
    });

    it('renders "or" text between separators', () => {
      render(<ForgotPasswordPage />);

      const orText = FORGOT_PASSWORD_SELECTORS.orText();
      expect(orText).toBeInTheDocument();
      expectClasses(orText, CSS_CLASSES.orText);
    });
  });

  describe('Enhanced Responsive Design', () => {
    it('applies responsive text sizing for heading', () => {
      render(<ForgotPasswordPage />);

      const heading = FORGOT_PASSWORD_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies responsive spacing and padding', () => {
      render(<ForgotPasswordPage />);

      const mainElement = FORGOT_PASSWORD_SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.responsive.mainPadding);

      const container = mainElement.querySelector('div');
      expectClasses(container, CSS_CLASSES.responsive.container);
    });

    it('applies responsive form spacing', () => {
      render(<ForgotPasswordPage />);

      const form = FORGOT_PASSWORD_SELECTORS.form();
      expectClasses(form, CSS_CLASSES.responsive.formSpacing);
    });

    it('applies responsive input styling', () => {
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();
      expectClasses(emailInput, CSS_CLASSES.responsive.input);
    });

    it('applies responsive button styling', () => {
      render(<ForgotPasswordPage />);

      const submitButton =
        FORGOT_PASSWORD_SELECTORS.submitButton('send reset link');
      expectClasses(submitButton, CSS_CLASSES.responsive.button);
    });
  });

  describe('Loading State Management', () => {
    it('shows loading text and disables button during submission', async () => {
      const user = userEvent.setup();
      mockDelayedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      expectLoadingState();
    });

    it('resets loading state after successful submission', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectNotLoadingState();
      });
    });

    it('resets loading state after failed submission', async () => {
      const user = userEvent.setup();
      mockFailedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectNotLoadingState();
      });
    });
  });

  describe('Form State Management', () => {
    it('maintains form state during user interaction', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await fillEmail(user);

      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toHaveValue(
        TEST_DATA.email
      );
    });

    it('clears all states when try again is clicked', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      await waitFor(() => {
        expectSuccessToBeVisible();
      });

      await user.click(FORGOT_PASSWORD_SELECTORS.tryAgainButton());

      expectErrorToBeHidden();
      expectSuccessToBeHidden();
      expect(FORGOT_PASSWORD_SELECTORS.emailInput()).toHaveValue('');
    });
  });

  describe('Enhanced Form Validation', () => {
    it('prevents submission with empty email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await submitForm(user);

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('validates email format on blur', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      const emailInput = FORGOT_PASSWORD_SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.invalidEmail);
      await user.tab();

      expect(emailInput).toBeInvalid();
    });

    it('allows submission with valid email format', async () => {
      const user = userEvent.setup();
      mockSuccessfulReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      expect(mockResetPassword).toHaveBeenCalledWith(TEST_DATA.email);
    });
  });
});
