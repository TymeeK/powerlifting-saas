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
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import { WorkoutSummary } from '@/lib/types';

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
    <Card className='flex flex-col h-full'>
      <CardContent className='text-center p-8 flex flex-col flex-1 justify-between'>
        <div>
          <div className='text-6xl mb-4'>🏋️‍♂️</div>
          <h2 className='text-2xl sm:text-3xl font-bold mb-3 min-h-[4.5rem] flex items-center justify-center'>
            {title}
          </h2>
          <p className='text-muted-foreground text-lg mb-6'>{description}</p>
        </div>
        <Button onClick={() => router.push(buttonLink)} size='lg'>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user, loading } = useRequireAuth('/login');
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<WorkoutSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSummaryData(user.uid);
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <UserProfileCard user={user} />

      <div className='flex flex-col sm:flex-row gap-4 items-stretch'>
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
        <Alert>
          <AlertDescription className='text-destructive text-center'>
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
  );
}
