import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { signIn } from '@/lib/firebase';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  signIn: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

// Test constants
const TEST_DATA = {
  email: 'test@example.com',
  password: 'password123',
  wrongPassword: 'wrongpassword',
  invalidEmail: 'invalid-email',
  user: {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
} as const;

const SELECTORS = {
  emailInput: () => screen.getByLabelText(/email address/i),
  passwordInput: () => screen.getByLabelText(/password/i),
  rememberMeCheckbox: () =>
    screen.getByRole('checkbox', { name: /remember me/i }),
  submitButton: () => screen.getByRole('button', { name: /sign in/i }),
  submitButtonLoading: () =>
    screen.getByRole('button', { name: /signing in/i }),
  forgotPasswordLink: () =>
    screen.getByRole('link', { name: /forgot your password/i }),
  signupLink: () => screen.getByRole('link', { name: /sign up/i }),
  mainHeading: () => screen.getByRole('heading', { name: /sign in/i }),
  mainElement: () => screen.getByRole('main'),
  form: () => document.querySelector('form'),
  errorMessage: () => screen.getByText('Incorrect email or password'),
  loadingText: () => screen.getByText('Signing In...'),
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
    formFields: ['space-y-3', 'sm:space-y-4'],
    input: ['px-3', 'sm:px-4', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
    button: ['px-4', 'sm:px-6', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
    rememberMeContainer: [
      'flex-col',
      'sm:flex-row',
      'sm:items-center',
      'sm:justify-between',
      'space-y-3',
      'sm:space-y-0',
    ],
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

describe('LoginPage', () => {
  const mockSignIn = vi.mocked(signIn);

  // Helper functions
  const fillForm = async (
    user: any,
    data: { email?: string; password?: string; rememberMe?: boolean } = {}
  ) => {
    const {
      email = TEST_DATA.email,
      password = TEST_DATA.password,
      rememberMe = false,
    } = data;

    await user.type(SELECTORS.emailInput(), email);
    await user.type(SELECTORS.passwordInput(), password);

    if (rememberMe) {
      await user.click(SELECTORS.rememberMeCheckbox());
    }
  };

  const submitForm = async (user: any) => {
    await user.click(SELECTORS.submitButton());
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
    expect(SELECTORS.errorMessage()).toBeInTheDocument();
  };

  const expectErrorToBeHidden = () => {
    expect(
      screen.queryByText('Incorrect email or password')
    ).not.toBeInTheDocument();
  };

  const expectLoadingState = () => {
    expect(SELECTORS.loadingText()).toBeInTheDocument();
    expect(SELECTORS.submitButtonLoading()).toBeDisabled();
  };

  const expectNotLoadingState = () => {
    expect(screen.queryByText('Signing In...')).not.toBeInTheDocument();
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
    it('renders the login page with all required elements', () => {
      render(<LoginPage />);

      expect(SELECTORS.mainHeading()).toBeInTheDocument();
      expect(screen.getByText('Welcome to PR Tracker')).toBeInTheDocument();
      expect(SELECTORS.emailInput()).toBeInTheDocument();
      expect(SELECTORS.passwordInput()).toBeInTheDocument();
      expect(SELECTORS.rememberMeCheckbox()).toBeInTheDocument();
      expect(SELECTORS.submitButton()).toBeInTheDocument();
      expect(SELECTORS.forgotPasswordLink()).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(SELECTORS.signupLink()).toBeInTheDocument();
    });

    it('renders form inputs with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = SELECTORS.emailInput();
      const passwordInput = SELECTORS.passwordInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute(
        'placeholder',
        'Enter your password'
      );
    });

    it('renders forgot password link', () => {
      render(<LoginPage />);

      const forgotPasswordLink = SELECTORS.forgotPasswordLink();
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute(
        'href',
        '/login/forgot-password'
      );
    });

    it('renders signup link with correct href', () => {
      render(<LoginPage />);

      const signupLink = SELECTORS.signupLink();
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.email);

      expect(emailInput).toHaveValue(TEST_DATA.email);
    });

    it('allows user to type in password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = SELECTORS.passwordInput();
      await user.type(passwordInput, TEST_DATA.password);

      expect(passwordInput).toHaveValue(TEST_DATA.password);
    });

    it('allows user to toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rememberMeCheckbox = SELECTORS.rememberMeCheckbox();

      expect(rememberMeCheckbox).not.toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('shows validation for required fields when form is submitted empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await submitForm(user);

      expect(SELECTORS.emailInput()).toBeInvalid();
      expect(SELECTORS.passwordInput()).toBeInvalid();
    });
  });

  describe('Form Submission', () => {
    it('calls Firebase signIn with correct data on successful submission', async () => {
      const user = userEvent.setup();
      mockSuccessfulSignIn();

      render(<LoginPage />);

      await fillForm(user, { rememberMe: true });
      await submitForm(user);

      expect(mockSignIn).toHaveBeenCalledWith({
        email: TEST_DATA.email,
        password: TEST_DATA.password,
        rememberMe: true,
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      mockDelayedSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      expectLoadingState();
    });

    it('redirects on successful login', async () => {
      const user = userEvent.setup();
      mockSuccessfulSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('shows error message on login failure', async () => {
      const user = userEvent.setup();
      mockFailedSignIn();

      render(<LoginPage />);

      await fillForm(user, { password: TEST_DATA.wrongPassword });
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });
    });

    it('prevents form submission with empty required fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await submitForm(user);

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<LoginPage />);

      expect(SELECTORS.emailInput()).toBeInTheDocument();
      expect(SELECTORS.passwordInput()).toBeInTheDocument();
      expect(SELECTORS.rememberMeCheckbox()).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<LoginPage />);

      const mainHeading = SELECTORS.mainHeading();
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('has proper button roles', () => {
      render(<LoginPage />);

      expect(SELECTORS.submitButton()).toBeInTheDocument();
    });

    it('has proper form structure with main landmark', () => {
      render(<LoginPage />);

      expect(SELECTORS.mainElement()).toBeInTheDocument();
    });

    it('has proper form element with role', () => {
      render(<LoginPage />);

      expect(SELECTORS.form()).toBeInTheDocument();
    });

    it('has proper label associations for all form controls', () => {
      render(<LoginPage />);

      expect(SELECTORS.emailInput()).toHaveAttribute('id', 'email');
      expect(SELECTORS.passwordInput()).toHaveAttribute('id', 'password');
      expect(SELECTORS.rememberMeCheckbox()).toHaveAttribute(
        'id',
        'remember-me'
      );
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.tab();
      expect(SELECTORS.emailInput()).toHaveFocus();

      await user.tab();
      expect(SELECTORS.passwordInput()).toHaveFocus();

      await user.tab();
      expect(SELECTORS.rememberMeCheckbox()).toHaveFocus();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<LoginPage />);

      const mainElement = SELECTORS.mainElement();
      expect(mainElement).toHaveClass('min-h-screen', 'w-screen', 'max-w-full');

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies gradient styling to main heading', () => {
      render(<LoginPage />);

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid email format gracefully', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.invalidEmail);

      expect(emailInput).toBeInvalid();
    });

    it('maintains form state during user interaction', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await fillForm(user, { rememberMe: true });

      expect(SELECTORS.emailInput()).toHaveValue(TEST_DATA.email);
      expect(SELECTORS.passwordInput()).toHaveValue(TEST_DATA.password);
      expect(SELECTORS.rememberMeCheckbox()).toBeChecked();
    });

    it('clears error message when form is resubmitted', async () => {
      const user = userEvent.setup();
      mockFailedSignIn();

      render(<LoginPage />);

      await fillForm(user, { password: TEST_DATA.wrongPassword });
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });

      mockSuccessfulSignIn();
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeHidden();
      });
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      mockFailedSignIn('Network error');

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });
    });
  });

  describe('Error Message Display', () => {
    it('displays error message with proper styling and icon', async () => {
      const user = userEvent.setup();
      mockFailedSignIn();

      render(<LoginPage />);

      await fillForm(user, { password: TEST_DATA.wrongPassword });
      await submitForm(user);

      await waitFor(() => {
        const errorMessage = SELECTORS.errorMessage();
        expect(errorMessage).toBeInTheDocument();

        const errorContainer = errorMessage.closest('div');
        expectClasses(errorContainer, CSS_CLASSES.error.container);
        expectClasses(errorMessage, CSS_CLASSES.error.text);

        const errorIcon = errorMessage.querySelector(
          'svg'
        ) as HTMLElement | null;
        expect(errorIcon).toBeInTheDocument();
        if (errorIcon) {
          expectClasses(errorIcon, CSS_CLASSES.error.icon);
        }
      });
    });

    it('does not display error message initially', () => {
      render(<LoginPage />);
      expectErrorToBeHidden();
    });

    it('hides error message when form is cleared and resubmitted', async () => {
      const user = userEvent.setup();
      mockFailedSignIn();

      render(<LoginPage />);

      await fillForm(user, { password: TEST_DATA.wrongPassword });
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeVisible();
      });

      await user.clear(SELECTORS.emailInput());
      await user.clear(SELECTORS.passwordInput());
      await fillForm(user);

      mockSuccessfulSignIn();
      await submitForm(user);

      await waitFor(() => {
        expectErrorToBeHidden();
      });
    });
  });

  describe('Enhanced Responsive Design', () => {
    it('applies responsive text sizing for heading', () => {
      render(<LoginPage />);

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies responsive spacing and padding', () => {
      render(<LoginPage />);

      const mainElement = SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.responsive.mainPadding);

      const container = mainElement.querySelector('div');
      expectClasses(container, CSS_CLASSES.responsive.container);
    });

    it('applies responsive form spacing', () => {
      render(<LoginPage />);

      const form = SELECTORS.form();
      expectClasses(form, CSS_CLASSES.responsive.formSpacing);

      const formFields = form?.querySelector('div');
      if (formFields) {
        expectClasses(formFields, CSS_CLASSES.responsive.formFields);
      }
    });

    it('applies responsive input styling', () => {
      render(<LoginPage />);

      const emailInput = SELECTORS.emailInput();
      expectClasses(emailInput, CSS_CLASSES.responsive.input);
    });

    it('applies responsive button styling', () => {
      render(<LoginPage />);

      const submitButton = SELECTORS.submitButton();
      expectClasses(submitButton, CSS_CLASSES.responsive.button);
    });

    it('applies responsive layout for remember me and forgot password', () => {
      render(<LoginPage />);

      const rememberMeContainer = screen
        .getByText('Remember me')
        .closest('div')?.parentElement;
      if (rememberMeContainer) {
        expectClasses(
          rememberMeContainer,
          CSS_CLASSES.responsive.rememberMeContainer
        );
      }
    });
  });

  describe('Enhanced Styling and Visual Elements', () => {
    it('applies gradient background to main container', () => {
      render(<LoginPage />);

      const mainElement = SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.gradients.main);
    });

    it('applies gradient text to heading', () => {
      render(<LoginPage />);

      const heading = SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });

    it('applies gradient styling to submit button', () => {
      render(<LoginPage />);

      const submitButton = SELECTORS.submitButton();
      expectClasses(submitButton, CSS_CLASSES.gradients.button);
    });

    it('applies disabled state styling to button when loading', async () => {
      const user = userEvent.setup();
      mockDelayedSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      const submitButton = SELECTORS.submitButtonLoading();
      expectClasses(submitButton, CSS_CLASSES.disabled);
      expect(submitButton).toBeDisabled();
    });

    it('applies hover effects to interactive elements', () => {
      render(<LoginPage />);

      const submitButton = SELECTORS.submitButton();
      expectClasses(submitButton, CSS_CLASSES.hover.button);

      const forgotPasswordLink = SELECTORS.forgotPasswordLink();
      expectClasses(forgotPasswordLink, CSS_CLASSES.hover.link);

      const signupLink = SELECTORS.signupLink();
      expectClasses(signupLink, CSS_CLASSES.hover.link);
    });
  });

  describe('Separator Component', () => {
    it('renders separator with proper styling', () => {
      render(<LoginPage />);

      const separators = SELECTORS.separators();
      expect(separators).toHaveLength(2);

      separators.forEach(separator => {
        expectClasses(separator, CSS_CLASSES.separator);
      });
    });

    it('renders "or" text between separators', () => {
      render(<LoginPage />);

      const orText = SELECTORS.orText();
      expect(orText).toBeInTheDocument();
      expectClasses(orText, CSS_CLASSES.orText);
    });
  });

  describe('Enhanced Form Validation', () => {
    it('prevents submission with empty email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(SELECTORS.passwordInput(), TEST_DATA.password);
      await submitForm(user);

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('prevents submission with empty password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(SELECTORS.emailInput(), TEST_DATA.email);
      await submitForm(user);

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('validates email format on blur', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.invalidEmail);
      await user.tab();

      expect(emailInput).toBeInvalid();
    });
  });

  describe('Loading State Management', () => {
    it('shows loading text and disables button during submission', async () => {
      const user = userEvent.setup();
      mockDelayedSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      expectLoadingState();
    });

    it('resets loading state after successful submission', async () => {
      const user = userEvent.setup();
      mockSuccessfulSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      await waitFor(() => {
        expectNotLoadingState();
      });
    });

    it('resets loading state after failed submission', async () => {
      const user = userEvent.setup();
      mockFailedSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      await waitFor(() => {
        expectNotLoadingState();
      });
    });
  });
});
