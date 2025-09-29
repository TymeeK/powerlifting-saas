'use client';

import { useEffect, useState } from 'react';
import { auth, getPastWorkouts } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
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
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import LoadingScreen from '@/components/workout/LoadingScreen';
import {
  Calendar,
  Clock,
  Dumbbell,
  Trophy,
  ArrowLeft,
  Home,
} from 'lucide-react';
import Link from 'next/link';

// Workout data interface
interface Workout {
  id: string;
  date: string;
  duration: string;
  exercises: {
    name: string;
    sets: number;
    reps: number[];
    weight: number[];
  }[];
  totalVolume: number;
  personalRecords: number;
  createdAt: Date;
}

export default function PastWorkoutsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
        // Load workouts when user is authenticated
        loadWorkouts(user.uid);
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-200'
            >
              <Link href='/dashboard'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                Past Workouts
              </h1>
              <p className='text-purple-200 mt-2'>
                Track your progress and celebrate your achievements
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-purple-500/20 rounded-lg'>
                  <Dumbbell className='h-6 w-6 text-purple-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {workouts.length}
                  </p>
                  <p className='text-purple-200 text-sm'>Total Workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-green-500/20 rounded-lg'>
                  <Trophy className='h-6 w-6 text-green-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {workouts.reduce(
                      (total, workout) => total + workout.personalRecords,
                      0
                    )}
                  </p>
                  <p className='text-purple-200 text-sm'>Personal Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-blue-500/20 rounded-lg'>
                  <Clock className='h-6 w-6 text-blue-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-white'>
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
                  <p className='text-purple-200 text-sm'>Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className='bg-red-500/10 backdrop-blur-sm border-red-500/30 mb-8'>
            <CardContent className='p-6'>
              <p className='text-red-200 text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button
                  onClick={() => user && loadWorkouts(user.uid)}
                  variant='outline'
                  className='border-red-400 text-red-200 hover:bg-red-500/20'
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
              <Card
                key={i}
                className='bg-white/10 backdrop-blur-sm border-white/20'
              >
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div className='h-5 w-5 animate-pulse bg-gray-400 rounded'></div>
                    <div className='h-6 w-48 animate-pulse bg-gray-400 rounded'></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='h-4 w-full animate-pulse bg-gray-400 rounded'></div>
                    <div className='h-4 w-3/4 animate-pulse bg-gray-400 rounded'></div>
                    <div className='h-4 w-1/2 animate-pulse bg-gray-400 rounded'></div>
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
              <Card
                key={workout.id}
                className='bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-purple-500/20 rounded-lg'>
                        <Calendar className='h-5 w-5 text-purple-400' />
                      </div>
                      <div>
                        <CardTitle className='text-white text-xl'>
                          {formatDate(workout.date)}
                        </CardTitle>
                        <CardDescription className='text-purple-200'>
                          Workout #{workouts.length - index}
                        </CardDescription>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <Badge
                        variant='secondary'
                        className='bg-purple-500/20 text-purple-200 border-purple-400/30'
                      >
                        <Clock className='h-3 w-3 mr-1' />
                        {workout.duration}
                      </Badge>
                      {workout.personalRecords > 0 && (
                        <Badge
                          variant='secondary'
                          className='bg-green-500/20 text-green-200 border-green-400/30'
                        >
                          <Trophy className='h-3 w-3 mr-1' />
                          {workout.personalRecords} PR
                          {workout.personalRecords > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-white'>
                        {workout.exercises.length}
                      </p>
                      <p className='text-purple-200 text-sm'>Exercises</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-white'>
                        {calculateTotalSets(workout.exercises)}
                      </p>
                      <p className='text-purple-200 text-sm'>Total Sets</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-white'>
                        {workout.totalVolume.toLocaleString()}
                      </p>
                      <p className='text-purple-200 text-sm'>
                        Total Volume (lbs)
                      </p>
                    </div>
                  </div>

                  <Separator className='bg-white/20 mb-4' />

                  <div>
                    <h4 className='text-white font-semibold mb-3'>
                      Exercises Performed
                    </h4>
                    <div className='space-y-3'>
                      {workout.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exerciseIndex}
                          className='bg-white/5 rounded-lg p-4'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h5 className='text-white font-medium'>
                              {exercise.name}
                            </h5>
                            <span className='text-purple-200 text-sm'>
                              {exercise.sets} sets
                            </span>
                          </div>
                          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                            {exercise.sets > 0 &&
                              Array.from(
                                { length: exercise.sets },
                                (_, setIndex) => (
                                  <div
                                    key={setIndex}
                                    className='bg-white/10 rounded p-2 text-center'
                                  >
                                    <p className='text-white text-sm font-medium'>
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
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='p-12 text-center'>
              <Dumbbell className='h-16 w-16 text-purple-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                No Workouts Yet
              </h3>
              <p className='text-purple-200 mb-6'>
                Start your fitness journey by recording your first workout!
              </p>
              <Button
                size='lg'
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/25'
                asChild
              >
                <Link href='/dashboard/workout'>Start Your First Workout</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
