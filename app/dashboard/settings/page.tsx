'use client';

import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import LoadingScreen from '@/components/workout/LoadingScreen';
import { useState } from 'react';
import BackToDashboardButton from '@/components/back-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Badge,
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  UserCircle,
} from 'lucide-react';
import { updateUserEmail, updateUserPassword } from '@/lib/firebase/auth';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeText: string;
  contentText: string;
  buttonText: string;
  onButtonClick: () => void;
}

const SettingsCard = ({
  icon,
  title,
  description,
  badgeText,
  contentText,
  buttonText,
  onButtonClick,
}: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-muted'>{icon}</div>
            <div>
              <CardTitle className='text-muted-foreground'>{title}</CardTitle>
              <CardDescription className='text-muted-foreground'>
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge className='bg-muted text-muted-foreground border-muted/30'>
            {badgeText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>{contentText}</p>
        <Button className='mt-4 cursor-pointer' onClick={onButtonClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  const { user, loading } = useRequireAuth('/login');

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalType, setModalType] = useState<
    'email' | 'password' | 'firstName' | 'lastName' | null
  >(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  if (!user) {
    return null;
  }
  if (loading) {
    return <LoadingScreen />;
  }

  const handleCloseModal = () => {
    setModalType(null);
    setNewEmail('');
    setPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
    }
  };

  const settingsCards = [
    {
      icon: <UserCircle className='h-5 w-5 text-muted-foreground' />,
      title: 'First Name',
      description: 'Update your first name',
      badgeText: 'Personal',
      contentText: `First Name: ${
        user.displayName?.split(' ')[0] || 'Not set'
      }`,
      buttonText: 'Change First Name',
      onButtonClick: () => {},
    },
    {
      icon: <UserCircle className='h-5 w-5 text-muted-foreground' />,
      title: 'Last Name',
      description: 'Update your last name',
      badgeText: 'Personal',
      contentText: `Last Name: ${
        user.displayName?.split(' ').slice(1).join(' ') || 'Not set'
      }`,
      buttonText: 'Change Last Name',
      onButtonClick: () => {},
    },
    {
      icon: <User className='h-5 w-5 text-muted-foreground' />,
      title: 'Account Information',
      description: 'Update your personal details',
      badgeText: 'Active',
      contentText: `Email: ${user.email}`,
      buttonText: 'Change Email',
      onButtonClick: () => setModalType('email'),
    },
    {
      icon: <Lock className='h-5 w-5 text-muted-foreground' />,
      title: 'Security',
      description: 'Update your password',
      badgeText: 'Protected',
      contentText: 'Password: ••••••••',
      buttonText: 'Change Password',
      onButtonClick: () => setModalType('password'),
    },
  ];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <BackToDashboardButton />

      <div className='space-y-2 mt-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {settingsCards.map((card, index) => (
          <SettingsCard key={index} {...card} />
        ))}
      </div>

      <AlertDialog
        open={!!modalType}
        onOpenChange={open => !open && handleCloseModal()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {modalType === 'email' && 'Update Email Address'}
              {modalType === 'password' && 'Update Password'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {modalType === 'email' &&
                'Change your email address. You will need to verify your identity.'}
              {modalType === 'password' &&
                'Update your password. Make sure it is at least 6 characters long.'}
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
              <>
                <div className='space-y-2'>
                  <Label htmlFor='new-email'>New Email Address</Label>
                  <Input
                    id='new-email'
                    type='email'
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder='Enter new email address'
                    autoFocus
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>Current Password</Label>
                  <Input
                    id='current-password'
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='Enter your current password'
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  For security reasons, you must verify your identity with your
                  current password to change your email address.
                </p>
              </>
            )}

            {modalType === 'password' && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>Current Password</Label>
                  <Input
                    id='current-password'
                    type='password'
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder='Enter current password'
                    autoFocus
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='new-password'>New Password</Label>
                  <Input
                    id='new-password'
                    type='password'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder='Enter new password'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>Confirm New Password</Label>
                  <Input
                    id='confirm-password'
                    type='password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder='Confirm new password'
                  />
                </div>
              </>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseModal}>
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleSubmit} className='cursor-pointer'>
              {modalType === 'email' && 'Update Email'}
              {modalType === 'password' && 'Update Password'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
