'use client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import WeeklySummaryCard from '@/components/dashboard/WeeklySummaryCard';

import LoadingScreen from '@/components/workout/LoadingScreen';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import { PastWorkout } from '@/lib/types';
import { logger } from '@/lib/logger';
import {
  getPastWorkoutsFetcher,
  getWeeklySummaryFetcher,
  WeeklySummaryData,
} from '@/lib/swr/fetcher';
import useSWR from 'swr';

// Create a child logger for dashboard page
const dashboardLogger = logger.child({ component: 'dashboard-page' });

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

  // Fetch weekly summary with optimized queries (only fetches necessary data)
  const {
    data: weeklySummary,
    isLoading: isWeeklySummaryLoading,
    error: weeklySummaryError,
  } = useSWR<WeeklySummaryData>(
    user ? `weekly-summary-${user.uid}` : null,
    () => getWeeklySummaryFetcher(user?.uid || ''),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

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

      {weeklySummaryError ? (
        <Alert>
          <AlertDescription className='text-destructive text-center'>
            ⚠️ {weeklySummaryError.message || 'Failed to fetch weekly summary'}
          </AlertDescription>
        </Alert>
      ) : (
        <WeeklySummaryCard
          data={weeklySummary}
          isLoading={isWeeklySummaryLoading}
        />
      )}
    </div>
  );
}
