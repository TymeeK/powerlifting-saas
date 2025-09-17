'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import WeeklySummaryCard from '@/components/dashboard/WeeklySummaryCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import LoadingScreen from '@/components/workout/LoadingScreen';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-4xl text-center'>
        {/* User Profile Section */}
        <UserProfileCard user={user} />

        {/* Hero Summary Panel */}
        <WeeklySummaryCard />

        {/* Motivational Alert */}
        <Alert className='bg-green-500/10 border-green-500/30 mb-8'>
          <AlertDescription className='text-green-200 text-center'>
            🎉 Great job! You're on a 7-day streak. Keep up the momentum!
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <QuickActionsCard />

        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <CardTitle className='text-white text-xl sm:text-2xl'>
              Dashboard Coming Soon
            </CardTitle>
            <CardDescription className='text-purple-200'>
              This is where you'll be able to track your personal records and
              view your progress.
            </CardDescription>
          </CardHeader>
        </Card>

        <Button
          onClick={handleSignOut}
          variant='destructive'
          size='lg'
          className='bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/25'
        >
          Sign Out
        </Button>
      </div>
    </main>
  );
}
