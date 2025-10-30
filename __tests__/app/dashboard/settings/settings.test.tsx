import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/dashboard/settings/page';
import { updateUserEmail, updateUserPassword } from '@/lib/firebase/auth';

vi.mock('@/lib/firebase/auth', () => ({
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
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/Email: test@example.com/i)).toBeInTheDocument();
  });

  it('opens modal when "Change Email" button is clicked and shows password field', async () => {
    await user.click(screen.getByText('Change Email'));

    // Check modal appears with both fields
    expect(screen.getByText('Update Email Address')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter new email address')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your current password')
    ).toBeInTheDocument();
    expect(screen.getByText(/For security reasons/i)).toBeInTheDocument();
  });

  it('shows validation error when trying to update with empty fields', async () => {
    await user.click(screen.getByText('Change Email'));
    await user.click(screen.getByRole('button', { name: /Update Email/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Please enter both email and password')
      ).toBeInTheDocument();
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
      expect(
        screen.getByText('Email updated successfully!')
      ).toBeInTheDocument();
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
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    // Modal should still be open
    expect(screen.getByText('Update Email Address')).toBeInTheDocument();
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
    expect(screen.getByText('Update Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter current password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter new password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm new password')
    ).toBeInTheDocument();
  });

  it('shows validation error when trying to update with empty fields', async () => {
    await user.click(screen.getByText('Change Password'));
    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
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
      expect(
        screen.getByText('New passwords do not match')
      ).toBeInTheDocument();
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

    // Check success message appears
    await waitFor(() => {
      expect(
        screen.getByText('Password updated successfully!')
      ).toBeInTheDocument();
    });
  });

  it('displays error message when current password is incorrect', async () => {
    (updateUserPassword as any).mockResolvedValueOnce({
      success: false,
      message: 'Incorrect password',
    });

    await user.click(screen.getByText('Change Password'));
    await user.type(
      screen.getByPlaceholderText('Enter current password'),
      'wrongpassword'
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

    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });

    // Modal should still be open
    expect(screen.getByText('Update Password')).toBeInTheDocument();
  });
});
