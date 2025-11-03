import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/dashboard/settings/page';
import { updateUserEmail, updateUserPassword } from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({
  updateUserEmail: vi.fn(),
  updateUserPassword: vi.fn(),
}));

vi.mock('@/lib/hooks/userRequireAuth', () => ({
  useRequireAuth: () => ({
    user: { email: 'test@example.com', uid: '123' },
    loading: false,
  }),
}));

const user = userEvent.setup();

describe('Settings Page - Email Update Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<SettingsPage />);
  });

  it('renders the settings page with user email', () => {
    const settingsHeading = screen.getByText('Settings');
    const emailText = screen.getByText(/Email: test@example.com/i);

    expect(settingsHeading).toBeInTheDocument();
    expect(emailText).toBeInTheDocument();
  });

  it('opens modal when "Change Email" button is clicked and shows password field', async () => {
    await user.click(screen.getByText('Change Email'));

    // Check modal appears with both fields
    const modalTitle = screen.getByText('Update Email Address');
    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const passwordInput = screen.getByPlaceholderText(
      'Enter your current password'
    );
    const securityText = screen.getByText(/For security reasons/i);

    expect(modalTitle).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(securityText).toBeInTheDocument();
  });

  it('shows validation error when trying to update with empty fields', async () => {
    const changeEmailButton = screen.getByText('Change Email');
    await user.click(changeEmailButton);

    const updateEmailButton = screen.getByRole('button', {
      name: /Update Email/i,
    });
    await user.click(updateEmailButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(
        'Please enter both email and password'
      );
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserEmail was NOT called
    expect(updateUserEmail).not.toHaveBeenCalled();
  });

  it('successfully updates email when valid email and password are provided', async () => {
    (updateUserEmail as any).mockResolvedValueOnce({
      success: true,
      message: 'Email updated successfully!',
    });

    await user.click(screen.getByText('Change Email'));
    await user.type(
      screen.getByPlaceholderText('Enter new email address'),
      'newemail@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter your current password'),
      'mypassword123'
    );
    await user.click(screen.getByRole('button', { name: /Update Email/i }));

    // Verify function was called with both email and password
    expect(updateUserEmail).toHaveBeenCalledWith(
      'newemail@example.com',
      'mypassword123'
    );

    // Check success message appears
    await waitFor(() => {
      const successMessage = screen.getByText('Email updated successfully!');
      expect(successMessage).toBeInTheDocument();
    });
  });

  it('displays error message when password is incorrect', async () => {
    (updateUserEmail as any).mockResolvedValueOnce({
      success: false,
      message: 'Incorrect password',
    });

    await user.click(screen.getByText('Change Email'));
    await user.type(
      screen.getByPlaceholderText('Enter new email address'),
      'newemail@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter your current password'),
      'wrongpassword'
    );
    await user.click(screen.getByRole('button', { name: /Update Email/i }));

    await waitFor(() => {
      const errorMessage = screen.getByText('Incorrect password');
      expect(errorMessage).toBeInTheDocument();
    });

    // Modal should still be open
    const modalTitle = screen.getByText('Update Email Address');
    expect(modalTitle).toBeInTheDocument();
  });
});

describe('Settings Page - Password Change Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<SettingsPage />);
  });

  it('opens modal when "Change Password" button is clicked', async () => {
    await user.click(screen.getByText('Change Password'));

    // Check modal appears with password fields
    const modalTitle = screen.getByRole('heading', { name: 'Update Password' });
    const currentPasswordInput = screen.getByPlaceholderText(
      'Enter current password'
    );
    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Confirm new password'
    );

    expect(modalTitle).toBeInTheDocument();
    expect(currentPasswordInput).toBeInTheDocument();
    expect(newPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it('shows validation error when trying to update with empty fields', async () => {
    await user.click(screen.getByText('Change Password'));
    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      const errorMessage = screen.getByText('All fields are required');
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserPassword was NOT called
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('shows validation error when new passwords do not match', async () => {
    await user.click(screen.getByText('Change Password'));
    await user.type(
      screen.getByPlaceholderText('Enter current password'),
      'currentpassword123'
    );
    await user.type(
      screen.getByPlaceholderText('Enter new password'),
      'newpassword123'
    );
    await user.type(
      screen.getByPlaceholderText('Confirm new password'),
      'differentpassword123'
    );
    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      const errorMessage = screen.getByText('New passwords do not match');
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserPassword was NOT called
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('successfully updates password when valid passwords are provided', async () => {
    (updateUserPassword as any).mockResolvedValueOnce({
      success: true,
      message: 'Password updated successfully!',
    });

    await user.click(screen.getByText('Change Password'));
    await user.type(
      screen.getByPlaceholderText('Enter current password'),
      'currentpassword123'
    );
    await user.type(
      screen.getByPlaceholderText('Enter new password'),
      'newpassword123'
    );
    await user.type(
      screen.getByPlaceholderText('Confirm new password'),
      'newpassword123'
    );
    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    // Verify function was called with correct parameters
    expect(updateUserPassword).toHaveBeenCalledWith(
      'currentpassword123',
      'newpassword123'
    );

    await waitFor(() => {
      const successMessage = screen.getByText('Password updated successfully!');
      expect(successMessage).toBeInTheDocument();
    });
  });

  it('displays error message when current password is incorrect', async () => {
    (updateUserPassword as any).mockResolvedValueOnce({
      success: false,
      message: 'Incorrect password',
    });

    const changePasswordButton = screen.getByText('Change Password');
    await user.click(changePasswordButton);

    const currentPasswordInput = screen.getByPlaceholderText(
      'Enter current password'
    );
    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Confirm new password'
    );
    const updatePasswordButton = screen.getByRole('button', {
      name: /Update Password/i,
    });
    await user.type(currentPasswordInput, 'wrongpassword');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(updatePasswordButton);

    await waitFor(() => {
      const errorMessage = screen.getByText('Incorrect password');
      expect(errorMessage).toBeInTheDocument();
    });

    const modalTitle = screen.getByRole('heading', { name: 'Update Password' });
    expect(modalTitle).toBeInTheDocument();
  });
});
