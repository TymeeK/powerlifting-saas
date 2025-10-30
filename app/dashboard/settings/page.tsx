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
import { Badge, User, X } from 'lucide-react';
import { updateUserEmail } from '@/lib/firebase/auth';

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

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <BackToDashboardButton />

      <div className='space-y-2 mt-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-muted'>
                <User className='h-5 w-5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-muted-foreground'>
                  Account Information
                </CardTitle>
                <CardDescription className='text-muted-foreground'>
                  Update your personal details
                </CardDescription>
              </div>
            </div>
            <Badge className='bg-muted text-muted-foreground border-muted/30'>
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p>Email: {user.email}</p>
          <Button
            className='mt-4 cursor-pointer'
            onClick={() => setShowModal(true)}
          >
            Change Email
          </Button>
        </CardContent>
      </Card>

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
                <div className='text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded'>
                  {error}
                </div>
              )}
              {successfulEmailUpdate && (
                <div className='text-green-500 text-sm bg-green-50 dark:bg-green-950 p-3 rounded'>
                  Email updated successfully!
                </div>
              )}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  New Email Address
                </label>
                <input
                  type='email'
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder='Enter new email address'
                  className='w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                  autoFocus
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your current password'
                  className='w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary'
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
