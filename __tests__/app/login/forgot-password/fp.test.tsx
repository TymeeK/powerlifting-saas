import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '@/app/login/forgot-password/page';
import { resetPassword } from '@/lib/firebase';

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

// Test constants
const TEST_DATA = {
  email: 'test@example.com',
  invalidEmail: 'invalid-email',
  nonExistentEmail: 'nonexistent@example.com',
} as const;

const SELECTORS = {
  emailInput: () => screen.getByLabelText(/email address/i),
  submitButton: () => screen.getByRole('button', { name: /send reset link/i }),
  submitButtonLoading: () =>
    screen.getByRole('button', { name: /sending reset link/i }),
  backToLoginLink: () => screen.getByRole('link', { name: /sign in/i }),
  tryAgainButton: () => screen.getByRole('button', { name: /try again/i }),
  mainHeading: () => screen.getByRole('heading', { name: /reset password/i }),
  mainElement: () => screen.getByRole('main'),
  form: () => document.querySelector('form'),
  errorMessage: () => screen.queryByText(/error occurred while sending/i),
  successMessage: () => screen.queryByText(/password reset email sent/i),
  orText: () => screen.getByText('or'),
  separators: () =>
    screen
      .getAllByRole('none')
      .filter(el => el.getAttribute('data-slot') === 'separator'),
} as const;

const CSS_CLASSES = {
  responsive: {
    heading: ['text-2xl', 'sm:text-3xl', 'md:text-4xl', 'lg:text-5xl'],
    mainPadding: ['px-4', 'sm:px-6', 'lg:px-8', 'py-8'],
    container: ['max-w-sm', 'sm:max-w-md', 'lg:max-w-lg', 'xl:max-w-xl'],
    formSpacing: ['space-y-4', 'sm:space-y-6'],
    input: ['px-3', 'sm:px-4', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
    button: ['px-4', 'sm:px-6', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
  },
  gradients: {
    main: [
      'bg-gradient-to-br',
      'from-slate-900',
      'via-purple-900',
      'to-slate-900',
    ],
    heading: [
      'bg-gradient-to-r',
      'from-white',
      'to-purple-200',
      'bg-clip-text',
      'text-transparent',
    ],
    button: [
      'bg-gradient-to-r',
      'from-purple-500',
      'to-pink-500',
      'hover:from-purple-600',
      'hover:to-pink-600',
    ],
  },
  error: {
    container: [
      'mt-4',
      'p-3',
      'bg-red-500/10',
      'border',
      'border-red-500/20',
      'rounded-lg',
    ],
    text: ['text-sm', 'text-red-400', 'flex', 'items-center'],
    icon: ['w-4', 'h-4', 'mr-2'],
  },
  success: {
    container: [
      'mt-4',
      'p-3',
      'bg-green-500/10',
      'border',
      'border-green-500/20',
      'rounded-lg',
    ],
    text: ['text-sm', 'text-green-400', 'flex', 'items-center'],
    icon: ['w-4', 'h-4', 'mr-2'],
  },
  separator: ['flex-1', 'bg-purple-400/30'],
  orText: ['px-3', 'sm:px-4', 'text-purple-200', 'text-xs', 'sm:text-sm'],
  hover: {
    button: ['hover:shadow-purple-500/25', 'transition-all', 'duration-200'],
    link: ['hover:text-white', 'transition-colors', 'duration-200'],
  },
  disabled: [
    'disabled:from-gray-400',
    'disabled:to-gray-500',
    'disabled:cursor-not-allowed',
  ],
} as const;

describe('ForgotPasswordPage', () => {
  const mockResetPassword = vi.mocked(resetPassword);

  // Helper functions
  const fillEmail = async (user: any, email: string = TEST_DATA.email) => {
    await user.type(SELECTORS.emailInput(), email);
  };

  const submitForm = async (user: any) => {
    await user.click(SELECTORS.submitButton());
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
    expect(SELECTORS.errorMessage()).toBeInTheDocument();
  };

  const expectErrorToBeHidden = () => {
    expect(SELECTORS.errorMessage()).not.toBeInTheDocument();
  };

  const expectSuccessToBeVisible = () => {
    expect(SELECTORS.successMessage()).toBeInTheDocument();
  };

  const expectSuccessToBeHidden = () => {
    expect(SELECTORS.successMessage()).not.toBeInTheDocument();
  };

  const expectLoadingState = () => {
    expect(screen.getByText('Sending Reset Link...')).toBeInTheDocument();
    expect(SELECTORS.submitButtonLoading()).toBeDisabled();
  };

  const expectNotLoadingState = () => {
    expect(screen.queryByText('Sending Reset Link...')).not.toBeInTheDocument();
    expect(SELECTORS.submitButton()).not.toBeDisabled();
  };

  const expectClasses = (
    element: HTMLElement | null,
    classes: readonly string[]
  ) => {
    classes.forEach(className => {
      expect(element).toHaveClass(className);
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the forgot password page with all required elements', () => {
      render(<ForgotPasswordPage />);

      expect(SELECTORS.mainHeading()).toBeInTheDocument();
      expect(
        screen.getByText(/enter your email address and we'll send you a link/i)
      ).toBeInTheDocument();
      expect(SELECTORS.emailInput()).toBeInTheDocument();
      expect(SELECTORS.submitButton()).toBeInTheDocument();
      expect(SELECTORS.backToLoginLink()).toBeInTheDocument();
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByText(/didn't receive the email/i)).toBeInTheDocument();
      expect(SELECTORS.tryAgainButton()).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      render(<ForgotPasswordPage />);

      const emailInput = SELECTORS.emailInput();

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

      const backToLoginLink = SELECTORS.backToLoginLink();
      expect(backToLoginLink).toBeInTheDocument();
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });

    it('renders form with proper structure', () => {
      render(<ForgotPasswordPage />);

      const form = SELECTORS.form();
      expect(form).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      const emailInput = SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.email);

      expect(emailInput).toHaveValue(TEST_DATA.email);
    });

    it('shows validation for required email field when form is submitted empty', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await submitForm(user);

      expect(SELECTORS.emailInput()).toBeInvalid();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      const emailInput = SELECTORS.emailInput();
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
        expect(SELECTORS.emailInput()).toHaveValue('');
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

      await user.click(SELECTORS.tryAgainButton());

      expectErrorToBeHidden();
      expectSuccessToBeHidden();
      expect(SELECTORS.emailInput()).toHaveValue('');
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
        const successMessage = SELECTORS.successMessage();
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

      await user.click(SELECTORS.tryAgainButton());
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
        const errorMessage = SELECTORS.errorMessage();
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

      const emailInput = SELECTORS.emailInput();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('has proper heading hierarchy', () => {
      render(<ForgotPasswordPage />);

      const mainHeading = SELECTORS.mainHeading();
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('has proper button roles', () => {
      render(<ForgotPasswordPage />);

      expect(SELECTORS.submitButton()).toBeInTheDocument();
      expect(SELECTORS.tryAgainButton()).toBeInTheDocument();
    });

    it('has proper form structure with main landmark', () => {
      render(<ForgotPasswordPage />);

      expect(SELECTORS.mainElement()).toBeInTheDocument();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordPage />);

      await user.tab();
      expect(SELECTORS.emailInput()).toHaveFocus();

      await user.tab();
      expect(SELECTORS.submitButton()).toHaveFocus();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<ForgotPasswordPage />);

      const mainElement = SELECTORS.mainElement();
      expect(mainElement).toHaveClass('min-h-screen', 'w-screen', 'max-w-full');

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies gradient styling to main heading', () => {
      render(<ForgotPasswordPage />);

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });

    it('applies gradient background to main container', () => {
      render(<ForgotPasswordPage />);

      const mainElement = SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.gradients.main);
    });

    it('applies gradient styling to submit button', () => {
      render(<ForgotPasswordPage />);

      const submitButton = SELECTORS.submitButton();
      expectClasses(submitButton, CSS_CLASSES.gradients.button);
    });

    it('applies disabled state styling to button when loading', async () => {
      const user = userEvent.setup();
      mockDelayedReset();

      render(<ForgotPasswordPage />);

      await fillEmail(user);
      await submitForm(user);

      const submitButton = SELECTORS.submitButtonLoading();
      expectClasses(submitButton, CSS_CLASSES.disabled);
      expect(submitButton).toBeDisabled();
    });

    it('applies hover effects to interactive elements', () => {
      render(<ForgotPasswordPage />);

      const submitButton = SELECTORS.submitButton();
      expectClasses(submitButton, CSS_CLASSES.hover.button);

      const backToLoginLink = SELECTORS.backToLoginLink();
      expectClasses(backToLoginLink, CSS_CLASSES.hover.link);

      const tryAgainButton = SELECTORS.tryAgainButton();
      expectClasses(tryAgainButton, CSS_CLASSES.hover.link);
    });
  });

  describe('Separator Component', () => {
    it('renders separator with proper styling', () => {
      render(<ForgotPasswordPage />);

      const separators = SELECTORS.separators();
      expect(separators).toHaveLength(2);

      separators.forEach(separator => {
        expectClasses(separator, CSS_CLASSES.separator);
      });
    });

    it('renders "or" text between separators', () => {
      render(<ForgotPasswordPage />);

      const orText = SELECTORS.orText();
      expect(orText).toBeInTheDocument();
      expectClasses(orText, CSS_CLASSES.orText);
    });
  });

  describe('Enhanced Responsive Design', () => {
    it('applies responsive text sizing for heading', () => {
      render(<ForgotPasswordPage />);

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies responsive spacing and padding', () => {
      render(<ForgotPasswordPage />);

      const mainElement = SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.responsive.mainPadding);

      const container = mainElement.querySelector('div');
      expectClasses(container, CSS_CLASSES.responsive.container);
    });

    it('applies responsive form spacing', () => {
      render(<ForgotPasswordPage />);

      const form = SELECTORS.form();
      expectClasses(form, CSS_CLASSES.responsive.formSpacing);
    });

    it('applies responsive input styling', () => {
      render(<ForgotPasswordPage />);

      const emailInput = SELECTORS.emailInput();
      expectClasses(emailInput, CSS_CLASSES.responsive.input);
    });

    it('applies responsive button styling', () => {
      render(<ForgotPasswordPage />);

      const submitButton = SELECTORS.submitButton();
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

      expect(SELECTORS.emailInput()).toHaveValue(TEST_DATA.email);
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

      await user.click(SELECTORS.tryAgainButton());

      expectErrorToBeHidden();
      expectSuccessToBeHidden();
      expect(SELECTORS.emailInput()).toHaveValue('');
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

      const emailInput = SELECTORS.emailInput();
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
