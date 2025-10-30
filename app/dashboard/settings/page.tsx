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
  Badge,
  User,
  X,
  Lock,
  AlertCircle,
  CheckCircle2,
  UserCircle,
} from 'lucide-react';
import { updateUserEmail } from '@/lib/firebase/auth';

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
  const [showModal, setShowModal] = useState(false);
  const [successfulEmailUpdate, setSuccessfulEmailUpdate] = useState(false);
  const [error, setError] = useState('');
  if (!user) {
    return null;
  }
  if (loading) {
    return <LoadingScreen />;
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEmail('');
    setPassword('');
    setError('');
    setSuccessfulEmailUpdate(false);
  };

  const handleChangeEmail = async () => {
    // Validate inputs
    if (!newEmail || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await updateUserEmail(newEmail, password);
    if (result.success) {
      setSuccessfulEmailUpdate(true);
      setError('');
      setNewEmail('');
      setPassword('');
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } else {
      setSuccessfulEmailUpdate(false);
      setError(result.message);
    }
  };

  const settingsCards = [
    {
      icon: <User className='h-5 w-5 text-muted-foreground' />,
      title: 'Account Information',
      description: 'Update your personal details',
      badgeText: 'Active',
      contentText: `Email: ${user.email}`,
      buttonText: 'Change Email',
      onButtonClick: () => setShowModal(true),
    },
    {
      icon: <Lock className='h-5 w-5 text-muted-foreground' />,
      title: 'Security',
      description: 'Update your password',
      badgeText: 'Protected',
      contentText: 'Password: ••••••••',
      buttonText: 'Change Password',
      onButtonClick: () => {},
    },
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

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Update Email Address</CardTitle>
                <button
                  onClick={handleCloseModal}
                  className='text-muted-foreground hover:text-foreground cursor-pointer p-2 rounded-lg bg-muted'
                >
                  <X className='h-5 w-5 cursor-pointer' />
                </button>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {error && (
                <Alert
                  variant='destructive'
                  className='flex items-center gap-2'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{error}</span>
                </Alert>
              )}
              {successfulEmailUpdate && (
                <Alert className='flex items-center gap-2 border-green-500 text-green-600 dark:border-green-800 dark:text-green-400'>
                  <CheckCircle2 className='h-4 w-4' />
                  <span>Email updated successfully!</span>
                </Alert>
              )}
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
              <div className='flex space-x-3'>
                <Button
                  onClick={handleChangeEmail}
                  className='flex-1 cursor-pointer'
                >
                  Update Email
                </Button>
                <Button
                  onClick={handleCloseModal}
                  variant='outline'
                  className='flex-1 cursor-pointer'
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
