'use client';

import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import LoadingScreen from '@/components/workout/LoadingScreen';
import BackToDashboardButton from '@/components/back-button';
import { useSettingsModal } from '@/lib/hooks/useSettingsModal';
import { SettingsCards, SettingsModal } from '@/components/dashboard/settings';

const SettingsPage = () => {
  const { user, loading } = useRequireAuth('/login');
  const {
    newEmail,
    password,
    currentPassword,
    newPassword,
    confirmPassword,
    firstName,
    lastName,
    modalType,
    successMessage,
    error,
    setNewEmail,
    setPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    setModalType,
    handleCloseModal,
    handleSubmit,
  } = useSettingsModal();

  if (!user) {
    return null;
  }
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <BackToDashboardButton />

      <div className='space-y-2 mt-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsCards
        user={user}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setModalType={setModalType}
      />

      <SettingsModal
        modalType={modalType}
        error={error}
        successMessage={successMessage}
        newEmail={newEmail}
        password={password}
        onNewEmailChange={setNewEmail}
        onPasswordChange={setPassword}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        firstName={firstName}
        lastName={lastName}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SettingsPage;
