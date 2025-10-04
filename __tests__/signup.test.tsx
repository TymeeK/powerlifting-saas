import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '@/app/signup/page';
import { signUp } from '@/lib/firebase';
import { SIGNUP_SELECTORS } from './utils';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  signUp: vi.fn(),
}));

describe('Signup Page', () => {
  const getFormInputs = () => {
    return {
      firstNameInput: SIGNUP_SELECTORS.firstNameInput(),
      lastNameInput: SIGNUP_SELECTORS.lastNameInput(),
      emailInput: SIGNUP_SELECTORS.emailInput(),
      passwordInput: SIGNUP_SELECTORS.passwordInput(),
      confirmPasswordInput: SIGNUP_SELECTORS.confirmPasswordInput(),
    };
  };

  beforeEach(() => {
    render(<SignupPage />);
    vi.clearAllMocks();
  });

  it('renders the signup page', () => {
    expect(SIGNUP_SELECTORS.mainHeading()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.subtitle()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.firstNameInput()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.lastNameInput()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.emailInput()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.passwordInput()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.confirmPasswordInput()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.submitButton()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.loginLink()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.termsLink()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.privacyLink()).toBeInTheDocument();
    expect(SIGNUP_SELECTORS.passwordMismatchWarning()).not.toBeInTheDocument();
    expect(SIGNUP_SELECTORS.errorMessage()).not.toBeInTheDocument();
    expect(SIGNUP_SELECTORS.successMessage()).not.toBeInTheDocument();
  });

  it('renders form inputs with correct attributes', () => {
    const {
      firstNameInput,
      lastNameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
    } = getFormInputs();

    expect(firstNameInput).toHaveAttribute('type', 'text');
    expect(firstNameInput).toHaveAttribute('required');
    expect(firstNameInput).toHaveAttribute('placeholder', 'Enter first name');
    expect(lastNameInput).toHaveAttribute('type', 'text');
    expect(lastNameInput).toHaveAttribute('required');
    expect(lastNameInput).toHaveAttribute('placeholder', 'Enter last name');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('placeholder', 'Create a password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('required');
    expect(confirmPasswordInput).toHaveAttribute(
      'placeholder',
      'Confirm your password'
    );
  });

  it('renders form inputs with correct attributes', () => {
    const {
      firstNameInput,
      lastNameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
    } = getFormInputs();

    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
  });

  it('allows user to type in first name field', async () => {
    const user = userEvent.setup();
    const { firstNameInput } = getFormInputs();
    await user.type(firstNameInput, 'John');
    expect(firstNameInput).toHaveValue('John');
  });

  it('allows user to type in last name field', async () => {
    const user = userEvent.setup();
    const { lastNameInput } = getFormInputs();
    await user.type(lastNameInput, 'Doe');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('allows user to type in email field', async () => {
    const user = userEvent.setup();
    const { emailInput } = getFormInputs();
    await user.type(emailInput, 'john.doe@example.com');
    expect(emailInput).toHaveValue('john.doe@example.com');
  });

  it('allows user to type in password field', async () => {
    const user = userEvent.setup();
    const { passwordInput } = getFormInputs();
    await user.type(passwordInput, 'password');
    expect(passwordInput).toHaveValue('password');
  });

  it('allows user to type in confirm password field', async () => {
    const user = userEvent.setup();
    const { confirmPasswordInput } = getFormInputs();
    await user.type(confirmPasswordInput, 'password');
    expect(confirmPasswordInput).toHaveValue('password');
  });
});
