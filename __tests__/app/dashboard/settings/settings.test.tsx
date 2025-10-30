import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/dashboard/settings/page';
import { updateUserEmail } from '@/lib/firebase/auth';

const user = userEvent.setup();

const setupTest = () => {
  render(<SettingsPage />);
};

describe('Settings Page', () => {
  beforeEach(() => {
    setupTest();
  });

  it('renders the settings page', () => {
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('allows user to update their email', async () => {
    const newEmail = 'newemail@example.com';
    await user.type(screen.getByLabelText(/email address/i), newEmail);
    await user.click(screen.getByRole('button', { name: /change email/i }));
    expect(updateUserEmail).toHaveBeenCalledWith(newEmail);
  });
});
