import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/dashboard/settings/page';
import {
  updateUserEmail,
  updateUserPassword,
  updateUserDisplayName,
} from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({
  updateUserEmail: vi.fn(),
  updateUserPassword: vi.fn(),
  updateUserDisplayName: vi.fn(),
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

    expect(updateUserEmail).not.toHaveBeenCalled();
  });

  it('successfully updates email when valid email and password are provided', async () => {
    (updateUserEmail as any).mockResolvedValueOnce({
      success: true,
      message: 'Email updated successfully!',
    });

    const changeEmailButton = screen.getByText('Change Email');
    const newEmail = 'newemail@example.com';
    const currentPassword = 'mypassword123';

    await user.click(changeEmailButton);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const passwordInput = screen.getByPlaceholderText(
      'Enter your current password'
    );
    const updateEmailButton = screen.getByRole('button', {
      name: /Update Email/i,
    });

    await user.type(emailInput, newEmail);
    await user.type(passwordInput, currentPassword);
    await user.click(updateEmailButton);

    // Verify function was called with both email and password
    expect(updateUserEmail).toHaveBeenCalledWith(newEmail, currentPassword);

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

    const changeEmailButton = screen.getByText('Change Email');
    const newEmail = 'newemail@example.com';
    const wrongPassword = 'wrongpassword';

    await user.click(changeEmailButton);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const passwordInput = screen.getByPlaceholderText(
      'Enter your current password'
    );
    const updateEmailButton = screen.getByRole('button', {
      name: /Update Email/i,
    });

    await user.type(emailInput, newEmail);
    await user.type(passwordInput, wrongPassword);
    await user.click(updateEmailButton);

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
    const changePasswordButton = screen.getByText('Change Password');

    await user.click(changePasswordButton);

    const updatePasswordButton = screen.getByRole('button', {
      name: /Update Password/i,
    });
    await user.click(updatePasswordButton);

    await waitFor(() => {
      const errorMessage = screen.getByText('All fields are required');
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserPassword was NOT called
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('shows validation error when new passwords do not match', async () => {
    const changePasswordButton = screen.getByText('Change Password');
    const currentPassword = 'currentpassword123';
    const newPassword = 'newpassword123';
    const differentPassword = 'differentpassword123';

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

    await user.type(currentPasswordInput, currentPassword);
    await user.type(newPasswordInput, newPassword);
    await user.type(confirmPasswordInput, differentPassword);
    await user.click(updatePasswordButton);

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

    const changePasswordButton = screen.getByText('Change Password');
    const currentPassword = 'currentpassword123';
    const newPassword = 'newpassword123';

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

    await user.type(currentPasswordInput, currentPassword);
    await user.type(newPasswordInput, newPassword);
    await user.type(confirmPasswordInput, newPassword);
    await user.click(updatePasswordButton);

    // Verify function was called with correct parameters
    expect(updateUserPassword).toHaveBeenCalledWith(
      currentPassword,
      newPassword
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

describe('Settings Page - Name Change Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<SettingsPage />);
  });

  it('opens modal when "Change Name" button is clicked', async () => {
    await user.click(screen.getByText('Change Name'));

    // Check modal appears with name fields
    const modalTitle = screen.getByRole('heading', { name: 'Update Name' });
    const firstNameInput = screen.getByPlaceholderText('Enter first name');
    const lastNameInput = screen.getByPlaceholderText('Enter last name');
    const descriptionText = screen.getByText(
      'Update your first and last name.'
    );

    expect(modalTitle).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(descriptionText).toBeInTheDocument();
  });

  it('shows validation error when trying to update with empty fields', async () => {
    (updateUserDisplayName as any).mockResolvedValueOnce({
      success: false,
      message: 'Both first name and last name are required',
    });

    const changeNameButton = screen.getByText('Change Name');

    await user.click(changeNameButton);

    const updateNameButton = screen.getByRole('button', {
      name: /Update Name/i,
    });
    await user.click(updateNameButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(
        'Both first name and last name are required'
      );
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserDisplayName was called with empty strings
    expect(updateUserDisplayName).toHaveBeenCalledWith('', '');
  });

  it('shows validation error when first name is empty', async () => {
    (updateUserDisplayName as any).mockResolvedValueOnce({
      success: false,
      message: 'Both first name and last name are required',
    });

    const changeNameButton = screen.getByText('Change Name');
    const lastName = 'Doe';

    await user.click(changeNameButton);

    const lastNameInput = screen.getByPlaceholderText('Enter last name');
    const updateNameButton = screen.getByRole('button', {
      name: /Update Name/i,
    });

    await user.type(lastNameInput, lastName);
    await user.click(updateNameButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(
        'Both first name and last name are required'
      );
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserDisplayName was called with empty first name
    expect(updateUserDisplayName).toHaveBeenCalledWith('', lastName);
  });

  it('shows validation error when last name is empty', async () => {
    (updateUserDisplayName as any).mockResolvedValueOnce({
      success: false,
      message: 'Both first name and last name are required',
    });

    const changeNameButton = screen.getByText('Change Name');
    const firstName = 'John';

    await user.click(changeNameButton);

    const firstNameInput = screen.getByPlaceholderText('Enter first name');
    const updateNameButton = screen.getByRole('button', {
      name: /Update Name/i,
    });

    await user.type(firstNameInput, firstName);
    await user.click(updateNameButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(
        'Both first name and last name are required'
      );
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify updateUserDisplayName was called with empty last name
    expect(updateUserDisplayName).toHaveBeenCalledWith(firstName, '');
  });

  it('successfully updates name when valid first and last names are provided', async () => {
    (updateUserDisplayName as any).mockResolvedValueOnce({
      success: true,
      message: 'Name updated successfully!',
    });

    const changeNameButton = screen.getByText('Change Name');
    const firstName = 'John';
    const lastName = 'Doe';

    await user.click(changeNameButton);

    const firstNameInput = screen.getByPlaceholderText('Enter first name');
    const lastNameInput = screen.getByPlaceholderText('Enter last name');
    const updateNameButton = screen.getByRole('button', {
      name: /Update Name/i,
    });

    await user.type(firstNameInput, firstName);
    await user.type(lastNameInput, lastName);
    await user.click(updateNameButton);

    // Verify function was called with correct parameters
    expect(updateUserDisplayName).toHaveBeenCalledWith(firstName, lastName);

    // Check success message appears
    await waitFor(() => {
      const successMessage = screen.getByText('Name updated successfully!');
      expect(successMessage).toBeInTheDocument();
    });
  });

  it('displays error message when name update fails', async () => {
    (updateUserDisplayName as any).mockResolvedValueOnce({
      success: false,
      message: 'Failed to update name',
    });

    const changeNameButton = screen.getByText('Change Name');
    const firstName = 'John';
    const lastName = 'Doe';

    await user.click(changeNameButton);

    const firstNameInput = screen.getByPlaceholderText('Enter first name');
    const lastNameInput = screen.getByPlaceholderText('Enter last name');
    const updateNameButton = screen.getByRole('button', {
      name: /Update Name/i,
    });

    await user.type(firstNameInput, firstName);
    await user.type(lastNameInput, lastName);
    await user.click(updateNameButton);

    await waitFor(() => {
      const errorMessage = screen.getByText('Failed to update name');
      expect(errorMessage).toBeInTheDocument();
    });

    // Modal should still be open
    const modalTitle = screen.getByRole('heading', { name: 'Update Name' });
    expect(modalTitle).toBeInTheDocument();
  });
});
