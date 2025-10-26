'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Trophy,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import LoadingScreen from '@/components/workout/LoadingScreen';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';

// Prefilled data for the three main lifts
const exerciseData = {
  squat: {
    name: 'Squat',
    currentPR: 315,
    previousPR: 295,
    target: 350,
    weeklyProgress: [
      { week: 'Week 1', weight: 275, reps: 5 },
      { week: 'Week 2', weight: 285, reps: 5 },
      { week: 'Week 3', weight: 295, reps: 3 },
      { week: 'Week 4', weight: 305, reps: 3 },
      { week: 'Week 5', weight: 315, reps: 1 },
    ],
    monthlyVolume: 12500,
    lastWorkout: '2024-01-15',
    improvement: 6.8,
    color: 'bg-blue-500',
  },
  bench: {
    name: 'Bench Press',
    currentPR: 225,
    previousPR: 205,
    target: 275,
    weeklyProgress: [
      { week: 'Week 1', weight: 185, reps: 8 },
      { week: 'Week 2', weight: 195, reps: 6 },
      { week: 'Week 3', weight: 205, reps: 4 },
      { week: 'Week 4', weight: 215, reps: 3 },
      { week: 'Week 5', weight: 225, reps: 1 },
    ],
    monthlyVolume: 8500,
    lastWorkout: '2024-01-14',
    improvement: 9.8,
    color: 'bg-green-500',
  },
  deadlift: {
    name: 'Deadlift',
    currentPR: 405,
    previousPR: 385,
    target: 450,
    weeklyProgress: [
      { week: 'Week 1', weight: 335, reps: 5 },
      { week: 'Week 2', weight: 345, reps: 5 },
      { week: 'Week 3', weight: 365, reps: 3 },
      { week: 'Week 4', weight: 385, reps: 2 },
      { week: 'Week 5', weight: 405, reps: 1 },
    ],
    monthlyVolume: 15200,
    lastWorkout: '2024-01-16',
    improvement: 5.2,
    color: 'bg-purple-500',
  },
};

const overallStats = {
  totalPRs: 3,
  totalImprovement: 21.8,
  averageImprovement: 7.3,
  totalVolume: 36200,
  activeWeeks: 5,
};

export default function ChartsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth('/login');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTrendIcon = (improvement: number) => {
    return improvement > 0 ? (
      <TrendingUp className='h-4 w-4 text-green-500' />
    ) : (
      <TrendingDown className='h-4 w-4 text-red-500' />
    );
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Progress Charts</h1>
        <p className='text-muted-foreground'>
          Track your strength progress across the big three lifts
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total PRs</CardTitle>
            <Trophy className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overallStats.totalPRs}</div>
            <p className='text-xs text-muted-foreground'>
              Personal records set
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Improvement
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              +{overallStats.averageImprovement}%
            </div>
            <p className='text-xs text-muted-foreground'>Across all lifts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Volume</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {overallStats.totalVolume.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              Pounds lifted this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Weeks</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overallStats.activeWeeks}</div>
            <p className='text-xs text-muted-foreground'>Consistent training</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Exercise Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {Object.entries(exerciseData).map(([key, exercise]) => (
          <Card key={key} className='relative overflow-hidden'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl'>{exercise.name}</CardTitle>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  {getTrendIcon(exercise.improvement)}+{exercise.improvement}%
                </Badge>
              </div>
              <CardDescription>
                Current PR: {exercise.currentPR} lbs • Target: {exercise.target}{' '}
                lbs
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Progress Bar */}
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Progress to Target</span>
                  <span>
                    {Math.round(
                      getProgressPercentage(exercise.currentPR, exercise.target)
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(
                    exercise.currentPR,
                    exercise.target
                  )}
                  className='h-3'
                />
              </div>

              {/* Weekly Progress Chart */}
              <div className='space-y-3'>
                <h4 className='font-medium text-sm'>Weekly Progress</h4>
                <div className='space-y-2'>
                  {exercise.weeklyProgress.map((week, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between text-sm'
                    >
                      <span className='text-muted-foreground'>{week.week}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{week.weight} lbs</span>
                        <Badge variant='outline' className='text-xs'>
                          {week.reps} reps
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Previous PR</p>
                  <p className='font-medium'>{exercise.previousPR} lbs</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Monthly Volume</p>
                  <p className='font-medium'>
                    {exercise.monthlyVolume.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Last Workout</p>
                  <p className='font-medium'>
                    {new Date(exercise.lastWorkout).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Improvement</p>
                  <p className='font-medium text-green-600'>
                    +{exercise.improvement}%
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className='space-y-2'>
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>Weight Progression</span>
                  <span>
                    {exercise.previousPR} → {exercise.currentPR} lbs
                  </span>
                </div>
                <div className='relative h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className={`absolute top-0 left-0 h-full ${exercise.color} rounded-full transition-all duration-1000`}
                    style={{
                      width: `${getProgressPercentage(
                        exercise.currentPR,
                        exercise.target
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Strength Progression Overview</CardTitle>
          <CardDescription>
            Visual representation of your strength gains across all three lifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Object.entries(exerciseData).map(([key, exercise]) => (
              <div key={key} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{exercise.name}</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      {exercise.previousPR} → {exercise.currentPR} lbs
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      +{exercise.improvement}%
                    </Badge>
                  </div>
                </div>
                <div className='relative h-3 bg-muted rounded-full overflow-hidden'>
                  <div
                    className={`absolute top-0 left-0 h-full ${exercise.color} rounded-full transition-all duration-1000`}
                    style={{
                      width: `${getProgressPercentage(
                        exercise.currentPR,
                        exercise.target
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
