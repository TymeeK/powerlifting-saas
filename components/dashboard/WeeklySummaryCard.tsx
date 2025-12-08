import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PastWorkout } from '@/lib/types';
import { WeeklySummaryData } from '@/lib/swr/fetcher';

interface WeeklySummaryCardProps {
  data?: WeeklySummaryData;
  isLoading?: boolean;
}

export default function WeeklySummaryCard({
  data,
  isLoading = false,
}: WeeklySummaryCardProps) {
  const thisWeeksWorkoutsCount = data?.thisWeekCount ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            This Week's Summary
          </CardTitle>
          <CardDescription className='text-center'>
            Loading your fitness progress...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold mb-2 animate-pulse'>
                    --o
                  </div>
                  <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                    Loading...
                  </div>
                  <Badge variant='secondary'>--</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            This Week&apos;s Summary
          </CardTitle>
          <CardDescription className='text-center'>
            No workout data available yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground py-8'>
            Start your first workout to see your progress here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-center text-xl'>
          This Week's Summary
        </CardTitle>
        <CardDescription className='text-center'>
          Your fitness progress at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6'>
          {/* This Week's Workouts */}
          <Card>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold mb-2'>
                {thisWeeksWorkoutsCount}
              </div>
              <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                Workouts This Week
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
