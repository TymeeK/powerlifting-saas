import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { UpdateEmailForm, UpdatePasswordForm, UpdateNameForm } from './index';

interface SettingsModalProps {
  modalType: 'email' | 'password' | 'name' | null;
  error: string;
  successMessage: string;
  // Email form props
  newEmail: string;
  password: string;
  onNewEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  // Password form props
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  // Name form props
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  // Handlers
  onClose: () => void;
  onSubmit: () => void;
}

export const SettingsModal = ({
  modalType,
  error,
  successMessage,
  newEmail,
  password,
  onNewEmailChange,
  onPasswordChange,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onClose,
  onSubmit,
}: SettingsModalProps) => {
  return (
    <AlertDialog open={!!modalType} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {modalType === 'email' && 'Update Email Address'}
            {modalType === 'password' && 'Update Password'}
            {modalType === 'name' && 'Update Name'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {modalType === 'email' &&
              'Change your email address. You will need to verify your identity.'}
            {modalType === 'password' &&
              'Update your password. Make sure it is at least 6 characters long.'}
            {modalType === 'name' && 'Update your first and last name.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='space-y-4 py-4'>
          {error && (
            <Alert variant='destructive' className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4' />
              <span>{error}</span>
            </Alert>
          )}
          {successMessage && (
            <Alert className='flex items-center gap-2 border-green-500 text-green-600 dark:border-green-800 dark:text-green-400'>
              <CheckCircle2 className='h-4 w-4' />
              <span>{successMessage}</span>
            </Alert>
          )}

          {modalType === 'email' && (
            <UpdateEmailForm
              newEmail={newEmail}
              password={password}
              onNewEmailChange={onNewEmailChange}
              onPasswordChange={onPasswordChange}
            />
          )}

          {modalType === 'password' && (
            <UpdatePasswordForm
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onCurrentPasswordChange={onCurrentPasswordChange}
              onNewPasswordChange={onNewPasswordChange}
              onConfirmPasswordChange={onConfirmPasswordChange}
            />
          )}

          {modalType === 'name' && (
            <UpdateNameForm
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={onFirstNameChange}
              onLastNameChange={onLastNameChange}
            />
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button onClick={onSubmit} className='cursor-pointer'>
            {modalType === 'email' && 'Update Email'}
            {modalType === 'password' && 'Update Password'}
            {modalType === 'name' && 'Update Name'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
