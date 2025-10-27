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
import { Badge, User } from 'lucide-react';

const SettingsPage = () => {
  const { user, loading } = useRequireAuth('/login');
  const [email, setEmail] = useState('');

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
          <Button>Change Email</Button>
          <Button variant='destructive'>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
