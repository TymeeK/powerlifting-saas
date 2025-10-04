import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { signIn } from '@/lib/firebase';
import {
  TEST_DATA,
  LOGIN_SELECTORS,
  CSS_CLASSES,
  expectClasses,
  createLoginHelpers,
} from '../../utils';

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

describe('LoginPage', () => {
  const mockSignIn = vi.mocked(signIn);
  const {
    fillForm,
    submitForm,
    mockSuccessfulSignIn,
    mockFailedSignIn,
    mockDelayedSignIn,
    expectErrorToBeVisible,
    expectErrorToBeHidden,
    expectLoadingState,
    expectNotLoadingState,
  } = createLoginHelpers(mockSignIn);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the login page with all required elements', () => {
      render(<LoginPage />);

      expect(LOGIN_SELECTORS.mainHeading()).toBeInTheDocument();
      expect(screen.getByText('Welcome to PR Tracker')).toBeInTheDocument();
      expect(LOGIN_SELECTORS.emailInput()).toBeInTheDocument();
      expect(LOGIN_SELECTORS.passwordInput()).toBeInTheDocument();
      expect(LOGIN_SELECTORS.rememberMeCheckbox()).toBeInTheDocument();
      expect(LOGIN_SELECTORS.submitButton('sign in')).toBeInTheDocument();
      expect(LOGIN_SELECTORS.forgotPasswordLink()).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(LOGIN_SELECTORS.signupLink()).toBeInTheDocument();
    });

    it('renders form inputs with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = LOGIN_SELECTORS.emailInput();
      const passwordInput = LOGIN_SELECTORS.passwordInput();

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

      const forgotPasswordLink = LOGIN_SELECTORS.forgotPasswordLink();
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute(
        'href',
        '/login/forgot-password'
      );
    });

    it('renders signup link with correct href', () => {
      render(<LoginPage />);

      const signupLink = LOGIN_SELECTORS.signupLink();
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = LOGIN_SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.email);

      expect(emailInput).toHaveValue(TEST_DATA.email);
    });

    it('allows user to type in password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = LOGIN_SELECTORS.passwordInput();
      await user.type(passwordInput, TEST_DATA.password);

      expect(passwordInput).toHaveValue(TEST_DATA.password);
    });

    it('allows user to toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rememberMeCheckbox = LOGIN_SELECTORS.rememberMeCheckbox();

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

      expect(LOGIN_SELECTORS.emailInput()).toBeInvalid();
      expect(LOGIN_SELECTORS.passwordInput()).toBeInvalid();
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

      expect(LOGIN_SELECTORS.emailInput()).toBeInTheDocument();
      expect(LOGIN_SELECTORS.passwordInput()).toBeInTheDocument();
      expect(LOGIN_SELECTORS.rememberMeCheckbox()).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<LoginPage />);

      const mainHeading = LOGIN_SELECTORS.mainHeading();
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('has proper button roles', () => {
      render(<LoginPage />);

      expect(LOGIN_SELECTORS.submitButton('sign in')).toBeInTheDocument();
    });

    it('has proper form structure with main landmark', () => {
      render(<LoginPage />);

      expect(LOGIN_SELECTORS.mainElement()).toBeInTheDocument();
    });

    it('has proper form element with role', () => {
      render(<LoginPage />);

      expect(LOGIN_SELECTORS.form()).toBeInTheDocument();
    });

    it('has proper label associations for all form controls', () => {
      render(<LoginPage />);

      expect(LOGIN_SELECTORS.emailInput()).toHaveAttribute('id', 'email');
      expect(LOGIN_SELECTORS.passwordInput()).toHaveAttribute('id', 'password');
      expect(LOGIN_SELECTORS.rememberMeCheckbox()).toHaveAttribute(
        'id',
        'remember-me'
      );
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.tab();
      expect(LOGIN_SELECTORS.emailInput()).toHaveFocus();

      await user.tab();
      expect(LOGIN_SELECTORS.passwordInput()).toHaveFocus();

      await user.tab();
      expect(LOGIN_SELECTORS.rememberMeCheckbox()).toHaveFocus();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<LoginPage />);

      const mainElement = LOGIN_SELECTORS.mainElement();
      expect(mainElement).toHaveClass('min-h-screen', 'w-screen', 'max-w-full');

      const heading = LOGIN_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies gradient styling to main heading', () => {
      render(<LoginPage />);

      const heading = LOGIN_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid email format gracefully', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = LOGIN_SELECTORS.emailInput();
      await user.type(emailInput, TEST_DATA.invalidEmail);

      expect(emailInput).toBeInvalid();
    });

    it('maintains form state during user interaction', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await fillForm(user, { rememberMe: true });

      expect(LOGIN_SELECTORS.emailInput()).toHaveValue(TEST_DATA.email);
      expect(LOGIN_SELECTORS.passwordInput()).toHaveValue(TEST_DATA.password);
      expect(LOGIN_SELECTORS.rememberMeCheckbox()).toBeChecked();
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
        const errorMessage = LOGIN_SELECTORS.errorMessage();
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

      await user.clear(LOGIN_SELECTORS.emailInput());
      await user.clear(LOGIN_SELECTORS.passwordInput());
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

      const heading = LOGIN_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.responsive.heading);
    });

    it('applies responsive spacing and padding', () => {
      render(<LoginPage />);

      const mainElement = LOGIN_SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.responsive.mainPadding);

      const container = mainElement.querySelector('div');
      expectClasses(container, CSS_CLASSES.responsive.container);
    });

    it('applies responsive form spacing', () => {
      render(<LoginPage />);

      const form = LOGIN_SELECTORS.form();
      expectClasses(form, CSS_CLASSES.responsive.formSpacing);

      const formFields = form?.querySelector('div');
      if (formFields) {
        expectClasses(formFields, CSS_CLASSES.responsive.formFields);
      }
    });

    it('applies responsive input styling', () => {
      render(<LoginPage />);

      const emailInput = LOGIN_SELECTORS.emailInput();
      expectClasses(emailInput, CSS_CLASSES.responsive.input);
    });

    it('applies responsive button styling', () => {
      render(<LoginPage />);

      const submitButton = LOGIN_SELECTORS.submitButton('sign in');
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

      const mainElement = LOGIN_SELECTORS.mainElement();
      expectClasses(mainElement, CSS_CLASSES.gradients.main);
    });

    it('applies gradient text to heading', () => {
      render(<LoginPage />);

      const heading = LOGIN_SELECTORS.mainHeading();
      expectClasses(heading, CSS_CLASSES.gradients.heading);
    });

    it('applies gradient styling to submit button', () => {
      render(<LoginPage />);

      const submitButton = LOGIN_SELECTORS.submitButton('sign in');
      expectClasses(submitButton, CSS_CLASSES.gradients.button);
    });

    it('applies disabled state styling to button when loading', async () => {
      const user = userEvent.setup();
      mockDelayedSignIn();

      render(<LoginPage />);

      await fillForm(user);
      await submitForm(user);

      const submitButton = LOGIN_SELECTORS.submitButtonLoading('signing in');
      expectClasses(submitButton, CSS_CLASSES.disabled);
      expect(submitButton).toBeDisabled();
    });

    it('applies hover effects to interactive elements', () => {
      render(<LoginPage />);

      const submitButton = LOGIN_SELECTORS.submitButton('sign in');
      expectClasses(submitButton, CSS_CLASSES.hover.button);

      const forgotPasswordLink = LOGIN_SELECTORS.forgotPasswordLink();
      expectClasses(forgotPasswordLink, CSS_CLASSES.hover.link);

      const signupLink = LOGIN_SELECTORS.signupLink();
      expectClasses(signupLink, CSS_CLASSES.hover.link);
    });
  });

  describe('Separator Component', () => {
    it('renders separator with proper styling', () => {
      render(<LoginPage />);

      const separators = LOGIN_SELECTORS.separators();
      expect(separators).toHaveLength(2);

      separators.forEach(separator => {
        expectClasses(separator, CSS_CLASSES.separator);
      });
    });

    it('renders "or" text between separators', () => {
      render(<LoginPage />);

      const orText = LOGIN_SELECTORS.orText();
      expect(orText).toBeInTheDocument();
      expectClasses(orText, CSS_CLASSES.orText);
    });
  });

  describe('Enhanced Form Validation', () => {
    it('prevents submission with empty email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(LOGIN_SELECTORS.passwordInput(), TEST_DATA.password);
      await submitForm(user);

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('prevents submission with empty password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(LOGIN_SELECTORS.emailInput(), TEST_DATA.email);
      await submitForm(user);

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('validates email format on blur', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = LOGIN_SELECTORS.emailInput();
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
