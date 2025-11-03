'use client';

import { useState, useEffect } from 'react';
import { getPastWorkouts } from '@/lib/firebase';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LoadingScreen from '@/components/workout/LoadingScreen';
import { Calendar, Clock, Dumbbell, Trophy } from 'lucide-react';
import Link from 'next/link';
import BackToDashboardButton from '@/components/back-button';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import { PastWorkout } from '@/lib/types';

export default function PastWorkoutsPage() {
  const { user, loading } = useRequireAuth('/login');
  const [workouts, setWorkouts] = useState<PastWorkout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = async (userId: string) => {
    try {
      setWorkoutsLoading(true);
      setError(null);
      const result = await getPastWorkouts(userId);
      if (result.success) {
        setWorkouts(result.workouts);
      } else {
        setError('Failed to load workouts');
      }
    } catch (err) {
      console.error('Error loading workouts:', err);
      setError('Failed to load workouts');
    } finally {
      setWorkoutsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkouts(user.uid);
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotalSets = (exercises: any[]) => {
    return exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <BackToDashboardButton />

      {/* Header */}
      <div className='space-y-2 mt-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Past Workouts</h1>
        <p className='text-muted-foreground'>
          Track your progress and celebrate your achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'>
        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-muted rounded-lg'>
                <Dumbbell className='h-6 w-6 text-muted-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{workouts.length}</p>
                <p className='text-muted-foreground text-sm'>Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-muted rounded-lg'>
                <Trophy className='h-6 w-6 text-muted-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {workouts.reduce(
                    (total, workout) => total + workout.personalRecords,
                    0
                  )}
                </p>
                <p className='text-muted-foreground text-sm'>
                  Personal Records
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-muted rounded-lg'>
                <Clock className='h-6 w-6 text-muted-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {Math.round(
                    workouts.reduce((total, workout) => {
                      const [hours, minutes] =
                        workout.duration.split('h ')[0] === workout.duration
                          ? [0, parseInt(workout.duration.split('m')[0])]
                          : [
                              parseInt(workout.duration.split('h ')[0]),
                              parseInt(
                                workout.duration.split('h ')[1].split('m')[0]
                              ),
                            ];
                      return total + hours + minutes / 60;
                    }, 0)
                  )}
                  h
                </p>
                <p className='text-muted-foreground text-sm'>Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className='p-6'>
            <p className='text-destructive text-center'>{error}</p>
            <div className='flex justify-center mt-4'>
              <Button
                onClick={() => user && loadWorkouts(user.uid)}
                variant='outline'
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workouts Loading State */}
      {workoutsLoading && (
        <div className='space-y-6'>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className='flex items-center space-x-3'>
                  <div className='h-5 w-5 animate-pulse bg-muted rounded'></div>
                  <div className='h-6 w-48 animate-pulse bg-muted rounded'></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='h-4 w-full animate-pulse bg-muted rounded'></div>
                  <div className='h-4 w-3/4 animate-pulse bg-muted rounded'></div>
                  <div className='h-4 w-1/2 animate-pulse bg-muted rounded'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Workouts List */}
      {!workoutsLoading && !error && (
        <div className='space-y-6'>
          {workouts.map((workout, index) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-muted rounded-lg'>
                      <Calendar className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>
                        {formatDate(workout.date)}
                      </CardTitle>
                      <CardDescription>
                        Workout #{workouts.length - index}
                      </CardDescription>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <Badge variant='secondary'>
                      <Clock className='h-3 w-3 mr-1' />
                      {workout.duration}
                    </Badge>
                    {workout.personalRecords > 0 && (
                      <Badge variant='secondary'>
                        <Trophy className='h-3 w-3 mr-1' />
                        {workout.personalRecords} PR
                        {workout.personalRecords > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {workout.exercises.length}
                    </p>
                    <p className='text-muted-foreground text-sm'>Exercises</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {calculateTotalSets(workout.exercises)}
                    </p>
                    <p className='text-muted-foreground text-sm'>Total Sets</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {workout.totalVolume.toLocaleString()}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Total Volume (lbs)
                    </p>
                  </div>
                </div>

                <Separator className='mb-4' />

                <div>
                  <h4 className='font-semibold mb-3'>Exercises Performed</h4>
                  <div className='space-y-3'>
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        className='bg-muted/50 rounded-lg p-4'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h5 className='font-bold text-lg underline'>
                            {exercise.name}
                          </h5>
                          <span className='text-muted-foreground text-sm'>
                            {exercise.sets} sets
                          </span>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2'>
                          {exercise.sets > 0 &&
                            Array.from(
                              { length: exercise.sets },
                              (_, setIndex) => (
                                <div
                                  key={setIndex}
                                  className='bg-muted rounded p-2 sm:p-3 text-center'
                                >
                                  <p className='text-xs sm:text-sm font-medium'>
                                    {exercise.reps[setIndex]} ×{' '}
                                    {exercise.weight[setIndex]}lbs
                                  </p>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!workoutsLoading && !error && workouts.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <Dumbbell className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-xl font-semibold mb-2'>No Workouts Yet</h3>
            <p className='text-muted-foreground mb-6'>
              Start your fitness journey by recording your first workout!
            </p>
            <Button size='lg' asChild>
              <Link href='/dashboard/workout'>Start Your First Workout</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
