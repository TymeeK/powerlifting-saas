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

describe('LoginPage', () => {
  const mockSignIn = vi.mocked(signIn);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the login page with all required elements', () => {
      render(<LoginPage />);

      // Check main heading
      expect(
        screen.getByRole('heading', { name: /sign in/i })
      ).toBeInTheDocument();

      // Check welcome message
      expect(screen.getByText('Welcome to PR Tracker')).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /remember me/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();

      // Check social login button
      expect(
        screen.getByRole('button', { name: /continue with google/i })
      ).toBeInTheDocument();

      // Check signup link
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it('renders form inputs with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

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

      const forgotPasswordLink = screen.getByRole('link', {
        name: /forgot your password/i,
      });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('renders signup link with correct href', () => {
      render(<LoginPage />);

      const signupLink = screen.getByRole('link', { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows user to type in password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('allows user to toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rememberMeCheckbox = screen.getByRole('checkbox', {
        name: /remember me/i,
      });

      expect(rememberMeCheckbox).not.toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('shows validation for required fields when form is submitted empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // HTML5 validation should prevent submission
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
    });
  });

  describe('Form Submission', () => {
    it('calls Firebase signIn with correct data on successful submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        success: true,
        user: {
          uid: '123',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', {
        name: /remember me/i,
      });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in form data
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);

      await user.click(submitButton);

      // Verify Firebase signIn was called with correct data
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSignIn.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  user: {
                    uid: '123',
                    email: 'test@example.com',
                    displayName: 'Test User',
                  },
                }),
              100
            )
          )
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('redirects on successful login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        success: true,
        user: {
          uid: '123',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Verify redirect happens
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('shows error message on login failure', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect email or password')
        ).toBeInTheDocument();
      });
    });

    it('prevents form submission with empty required fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit empty form
      await user.click(submitButton);

      // Firebase should not be called
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Social Login', () => {
    it('renders Google login button with correct icon', () => {
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      expect(googleButton).toBeInTheDocument();

      // Check that the Google SVG icon is present
      const googleIcon = googleButton.querySelector('svg');
      expect(googleIcon).toBeInTheDocument();
    });

    it('handles Google login button click', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      // In a real app, this would trigger Google OAuth
      // For now, we're just testing that the button is clickable
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(rememberMeCheckbox).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<LoginPage />);

      const mainHeading = screen.getByRole('heading', { name: /sign in/i });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('has proper button roles', () => {
      render(<LoginPage />);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });

      expect(signInButton).toBeInTheDocument();
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<LoginPage />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('min-h-screen', 'w-screen', 'max-w-full');

      const heading = screen.getByRole('heading', { name: /sign in/i });
      expect(heading).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl');
    });

    it('applies gradient styling to main heading', () => {
      render(<LoginPage />);

      const heading = screen.getByRole('heading', { name: /sign in/i });
      expect(heading).toHaveClass(
        'bg-gradient-to-r',
        'from-white',
        'to-purple-200'
      );
    });
  });

  describe('Error Handling', () => {
    it('handles invalid email format gracefully', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      // HTML5 validation should mark as invalid
      expect(emailInput).toBeInvalid();
    });

    it('maintains form state during user interaction', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', {
        name: /remember me/i,
      });

      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);

      // Verify state is maintained
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(rememberMeCheckbox).toBeChecked();
    });
  });
});
