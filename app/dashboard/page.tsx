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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    return (
      <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-purple-200'>Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Extract first name from displayName
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-4xl text-center'>
        {/* User Profile Section */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardContent className='flex items-center justify-center p-6'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-16 w-16 border-2 border-white/20'>
                <AvatarImage src={user.photoURL || ''} alt={firstName} />
                <AvatarFallback className='bg-purple-500 text-white text-xl font-semibold'>
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='text-center'>
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>
                  Welcome back, {firstName}!
                </h1>
                <p className='text-purple-200 text-sm sm:text-base'>
                  Ready to crush your fitness goals today?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Summary Panel */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <CardTitle className='text-white text-center text-xl'>
              This Week's Summary
            </CardTitle>
            <CardDescription className='text-purple-200 text-center'>
              Your fitness progress at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* This Week's Workouts */}
              <Card className='bg-white/5 border-white/10'>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                    4
                  </div>
                  <div className='text-purple-200 text-sm sm:text-base mb-2'>
                    Workouts This Week
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-green-500/20 text-green-400 border-green-500/30'
                  >
                    +1 from last week
                  </Badge>
                </CardContent>
              </Card>

              {/* Personal Records */}
              <Card className='bg-white/5 border-white/10'>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                    12
                  </div>
                  <div className='text-purple-200 text-sm sm:text-base mb-2'>
                    Personal Records
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-green-500/20 text-green-400 border-green-500/30'
                  >
                    +3 this month
                  </Badge>
                </CardContent>
              </Card>

              {/* Current Streak */}
              <Card className='bg-white/5 border-white/10'>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                    7
                  </div>
                  <div className='text-purple-200 text-sm sm:text-base mb-2'>
                    Day Streak
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-green-500/20 text-green-400 border-green-500/30'
                  >
                    Keep it up!
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row */}
            <div className='mt-6 pt-6 border-t border-white/20'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-lg font-semibold text-white mb-1'>
                    2.5h
                  </div>
                  <div className='text-xs text-purple-300'>Total Time</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-semibold text-white mb-1'>
                    1,250
                  </div>
                  <div className='text-xs text-purple-300'>Calories Burned</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-semibold text-white mb-1'>
                    85%
                  </div>
                  <div className='text-xs text-purple-300 mb-2'>
                    Goal Progress
                  </div>
                  <Progress value={85} className='h-2' />
                </div>
                <div className='text-center'>
                  <div className='text-lg font-semibold text-white mb-1'>3</div>
                  <div className='text-xs text-purple-300'>Active Days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Alert */}
        <Alert className='bg-green-500/10 border-green-500/30 mb-8'>
          <AlertDescription className='text-green-200 text-center'>
            🎉 Great job! You're on a 7-day streak. Keep up the momentum!
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <CardTitle className='text-white text-center text-xl'>
              Quick Actions
            </CardTitle>
            <CardDescription className='text-purple-200 text-center'>
              Start your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card
                className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
                onClick={() => router.push('/dashboard/log-workout')}
              >
                <CardContent className='text-center p-4'>
                  <div className='text-2xl mb-2'>🏋️</div>
                  <div className='text-white font-semibold mb-1'>
                    Log Workout
                  </div>
                  <div className='text-xs text-purple-300'>
                    Track your session
                  </div>
                </CardContent>
              </Card>
              <Card
                className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
                onClick={() => router.push('/dashboard/charts')}
              >
                <CardContent className='text-center p-4'>
                  <div className='text-2xl mb-2'>📊</div>
                  <div className='text-white font-semibold mb-1'>
                    View Progress
                  </div>
                  <div className='text-xs text-purple-300'>See your stats</div>
                </CardContent>
              </Card>
              <Card
                className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
                onClick={() => router.push('/dashboard/settings')}
              >
                <CardContent className='text-center p-4'>
                  <div className='text-2xl mb-2'>🎯</div>
                  <div className='text-white font-semibold mb-1'>Settings</div>
                  <div className='text-xs text-purple-300'>
                    Manage your account
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

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
