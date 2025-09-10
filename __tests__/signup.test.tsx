import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '@/app/signup/page';
import { signUp } from '@/lib/firebase';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  signUp: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('SignupPage', () => {
  const mockSignUp = vi.mocked(signUp);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the signup page with all required elements', () => {
      render(<SignupPage />);

      // Check main heading
      expect(
        screen.getByRole('heading', { name: /join pr tracker/i })
      ).toBeInTheDocument();

      // Check subtitle
      expect(
        screen.getByText('Start tracking your lifting progress today')
      ).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create account/i })
      ).toBeInTheDocument();

      // Check social signup button
      expect(
        screen.getByRole('button', { name: /continue with google/i })
      ).toBeInTheDocument();

      // Check login link
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /sign in/i })
      ).toBeInTheDocument();

      // Check terms and privacy links
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });

    it('renders form inputs with correct attributes', () => {
      render(<SignupPage />);

      // Check first name input
      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute('type', 'text');
      expect(firstNameInput).toHaveAttribute('required');

      // Check last name input
      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(lastNameInput).toHaveAttribute('type', 'text');
      expect(lastNameInput).toHaveAttribute('required');

      // Check email input
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');

      // Check password input
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');

      // Check confirm password input
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in form fields', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(emailInput).toHaveValue('john.doe@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('shows password mismatch warning when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Type different passwords
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');

      // Check that warning appears
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('hides password mismatch warning when passwords match', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Type different passwords first
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');

      // Verify warning is shown
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

      // Clear and type matching passwords
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'password123');

      // Verify warning is hidden
      expect(
        screen.queryByText('Passwords do not match')
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls Firebase signUp with correct data on successful submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ success: true });

      render(<SignupPage />);

      // Fill in form data
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.click(submitButton);

      // Verify Firebase signUp was called with correct data
      expect(mockSignUp).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SignupPage />);

      // Fill in form data
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('shows success message and redirects on successful signup', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ success: true });

      render(<SignupPage />);

      // Fill in form data
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Account created successfully! Redirecting to login page...'
          )
        ).toBeInTheDocument();
      });

      // Verify redirect happens
      await waitFor(
        () => {
          expect(window.location.href).toBe('/login');
        },
        { timeout: 3000 }
      );
    });

    it('shows error message on signup failure', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Email already in use'));

      render(<SignupPage />);

      // Fill in form data
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match on submission', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      // Fill in form data with mismatched passwords
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      await user.click(submitButton);

      // Should show error and not call Firebase
      expect(screen.getAllByText('Passwords do not match')).toHaveLength(2); // Both inline and form error
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});
