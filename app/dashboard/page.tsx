'use client';

import { useEffect, useState } from 'react';
import { auth, getWeeklySummary } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import WeeklySummaryCard from '@/components/dashboard/WeeklySummaryCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import LoadingScreen from '@/components/workout/LoadingScreen';

interface WeeklySummaryData {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisMonthWorkouts: number;
  totalWorkouts: number;
  personalRecords: number;
  currentStreak: number;
  totalTime: number;
  caloriesBurned: number;
  goalProgress: number;
  activeDays: number;
  totalVolume: number;
  lastWorkoutDate: Date | null;
}

type WorkoutCallToActionCard = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

const workoutCallToActionCards = [
  {
    title: 'Ready to Crush Your Goals?',
    description:
      'Start your workout session and track your progress. Every rep counts towards your fitness journey!',
    buttonText: 'Start Workout Now',
    buttonLink: '/dashboard/workout',
  },
  {
    title: 'Ready to View Your Past Workouts?',
    description:
      'View your past workout sessions and track your progress. Every rep counts towards your fitness journey!',
    buttonText: 'View Past Workouts Now',
    buttonLink: '/dashboard/past-workouts',
  },
];

const WorkoutCallToActionCard = ({
  router,
  title,
  description,
  buttonText,
  buttonLink,
}: {
  router: ReturnType<typeof useRouter>;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => {
  return (
    <Card className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/40 mb-8'>
      <CardContent className='text-center p-8'>
        <div className='text-6xl mb-4'>🏋️‍♂️</div>
        <h2 className='text-2xl sm:text-3xl font-bold text-white mb-3'>
          {title}
        </h2>
        <p className='text-purple-200 text-lg mb-6 max-w-2xl mx-auto'>
          {description}
        </p>
        <Button
          onClick={() => router.push(buttonLink)}
          size='lg'
          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:cursor-pointer'
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<WeeklySummaryData | null>(
    null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch summary data when user is available
  const fetchSummaryData = async (userId: string) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const result = await getWeeklySummary(userId);
      if (result.success) {
        setSummaryData(result.summary);
      } else {
        setSummaryError('Failed to load summary data');
      }
    } catch (error: any) {
      console.error('Error fetching summary data:', error);
      setSummaryError(error.message || 'Failed to load summary data');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
        // Fetch summary data when user is authenticated
        fetchSummaryData(user.uid);
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

        <div className='flex flex-row gap-4'>
          {workoutCallToActionCards.map(card => (
            <WorkoutCallToActionCard
              key={card.title}
              router={router}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              buttonLink={card.buttonLink}
            />
          ))}
        </div>

        {/* Quick Actions */}
        {/* <QuickActionsCard /> */}

        {/* Motivational Alert */}
        {/* <Alert className='bg-green-500/10 border-green-500/30 mb-8'>
          <AlertDescription className='text-green-200 text-center'>
            🎉 Great job! You're on a 7-day streak. Keep up the momentum!
          </AlertDescription>
        </Alert> */}

        {/* Hero Summary Panel */}
        {summaryError ? (
          <Alert className='bg-red-500/10 border-red-500/30 mb-8'>
            <AlertDescription className='text-red-200 text-center'>
              ⚠️ {summaryError}
            </AlertDescription>
          </Alert>
        ) : (
          <WeeklySummaryCard data={summaryData} loading={summaryLoading} />
        )}

        {/* <Button
          onClick={handleSignOut}
          variant='destructive'
          size='lg'
          className='bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/25'
        >
          Sign Out
        </Button> */}
      </div>
    </main>
  );
}
