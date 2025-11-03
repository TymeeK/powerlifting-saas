import { useState } from 'react';
import {
  updateUserEmail,
  updateUserPassword,
  updateUserDisplayName,
} from '@/lib/firebase/auth';

type ModalType = 'email' | 'password' | 'name' | null;

export const useSettingsModal = () => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleCloseModal = () => {
    setModalType(null);
    setNewEmail('');
    setPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async () => {
    if (modalType === 'email') {
      // Validate inputs
      if (!newEmail || !password) {
        setError('Please enter both email and password');
        return;
      }

      const result = await updateUserEmail(newEmail, password);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setSuccessMessage('Email updated successfully!');
      setError('');
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else if (modalType === 'password') {
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('All fields are required');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const result = await updateUserPassword(currentPassword, newPassword);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setSuccessMessage('Password updated successfully!');
      setError('');
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else if (modalType === 'name') {
      const result = await updateUserDisplayName(firstName, lastName);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setSuccessMessage('Name updated successfully!');
      setError('');
      setTimeout(() => {
        handleCloseModal();
        // Reload the page to reflect the changes
        window.location.reload();
      }, 1000);
    }
  };

  return {
    // State
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
    // Setters
    setNewEmail,
    setPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    setModalType,
    // Handlers
    handleCloseModal,
    handleSubmit,
  };
};
