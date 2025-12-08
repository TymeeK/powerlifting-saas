'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Zap, Dumbbell } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '@/components/workout/LoadingScreen';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import BackToDashboardButton from '@/components/back-button';
import { getPastWorkouts } from '@/lib/firebase';
import { PastWorkout } from '@/lib/types';
import { logger } from '@/lib/logger';
import {
  StrengthProgressionOverview,
  ExerciseChartsList,
  ExercisePagination,
} from '@/components/dashboard/charts';
import { ExerciseStats } from '@/lib/types';
import { getPastWorkoutsFetcher } from '@/lib/swr/fetcher';
import useSWR from 'swr';

const chartsLogger = logger.child({ component: 'charts-page' });

// Color palette for exercises
const exerciseColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500',
];

// Process workouts to calculate exercise statistics
const calculateExerciseStats = (
  workouts: PastWorkout[]
): Record<string, ExerciseStats> => {
  const exerciseMap: Record<
    string,
    {
      maxWeights: number[];
      workouts: Array<{
        date: Date;
        maxWeight: number;
        maxReps: number;
        volume: number;
      }>;
    }
  > = {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Process all workouts
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.createdAt);
    workoutDate.setHours(0, 0, 0, 0);

    workout.exercises.forEach(exercise => {
      if (!exerciseMap[exercise.name]) {
        exerciseMap[exercise.name] = {
          maxWeights: [],
          workouts: [],
        };
      }

      // Calculate max weight and reps for this exercise in this workout
      let maxWeight = 0;
      let maxReps = 0;
      let exerciseVolume = 0;

      for (let i = 0; i < exercise.sets; i++) {
        const weight = exercise.weight[i] || 0;
        const reps = exercise.reps[i] || 0;
        exerciseVolume += weight * reps;

        if (weight > maxWeight) {
          maxWeight = weight;
          maxReps = reps;
        } else if (weight === maxWeight && reps > maxReps) {
          maxReps = reps;
        }
      }

      exerciseMap[exercise.name].maxWeights.push(maxWeight);
      exerciseMap[exercise.name].workouts.push({
        date: workoutDate,
        maxWeight,
        maxReps,
        volume: exerciseVolume,
      });
    });
  });

  // Calculate statistics for each exercise
  const exerciseStats: Record<string, ExerciseStats> = {};

  Object.entries(exerciseMap).forEach(([exerciseName, data], index) => {
    // Sort workouts by date (newest first)
    const sortedWorkouts = [...data.workouts].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Calculate PRs
    const sortedMaxWeights = [...data.maxWeights].sort((a, b) => b - a);
    const currentPR = sortedMaxWeights[0] || 0;
    const previousPR = sortedMaxWeights[1] || currentPR;

    // Calculate monthly volume
    const monthlyWorkouts = sortedWorkouts.filter(w => w.date >= startOfMonth);
    const monthlyVolume = monthlyWorkouts.reduce((sum, w) => sum + w.volume, 0);

    // Get last workout date
    const lastWorkout = sortedWorkouts[0]?.date || new Date();
    const lastWorkoutStr = lastWorkout.toISOString().split('T')[0];

    // Calculate improvement percentage
    const improvement =
      previousPR > 0 ? ((currentPR - previousPR) / previousPR) * 100 : 0;

    // Calculate weekly progress (last 5 weeks)
    const weeklyProgress: Array<{
      week: string;
      weight: number;
      reps: number;
    }> = [];
    const weeksAgo = [4, 3, 2, 1, 0]; // Last 5 weeks

    weeksAgo.forEach(weeksBack => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - weeksBack * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekWorkouts = sortedWorkouts.filter(
        w => w.date >= weekStart && w.date <= weekEnd
      );

      if (weekWorkouts.length > 0) {
        const weekMax = weekWorkouts.reduce(
          (max, w) => (w.maxWeight > max.maxWeight ? w : max),
          weekWorkouts[0]
        );
        weeklyProgress.push({
          week: `Week ${5 - weeksBack}`,
          weight: weekMax.maxWeight,
          reps: weekMax.maxReps,
        });
      }
    });

    // Set target (10% above current PR, rounded to nearest 5)
    const target = currentPR > 0 ? Math.ceil((currentPR * 1.1) / 5) * 5 : 0;

    // Assign color
    const color = exerciseColors[index % exerciseColors.length];

    // Create a safe key from exercise name (lowercase, replace spaces with hyphens)
    const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '-');

    exerciseStats[exerciseKey] = {
      name: exerciseName,
      currentPR,
      previousPR,
      target,
      weeklyProgress: weeklyProgress.length > 0 ? weeklyProgress : [],
      monthlyVolume,
      lastWorkout: lastWorkoutStr,
      improvement: Math.round(improvement * 10) / 10, // Round to 1 decimal
      color,
    };
  });

  return exerciseStats;
};

export default function ChartsPage() {
  const { user, loading } = useRequireAuth('/login');

  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6;

  const {
    data: workouts = [],
    isLoading,
    error,
  } = useSWR<PastWorkout[]>(
    user ? `past-workouts-${user.uid}` : null,
    () => getPastWorkoutsFetcher(user?.uid || ''),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );
  // Memoize monthly volume calculation - only recalculates when workouts change
  const totalVolume = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyWorkouts = workouts.filter(workout => {
      // Use createdAt which is a Date object, more reliable than parsing date string
      const workoutDate = new Date(workout.createdAt);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate >= startOfMonth;
    });

    const volume = monthlyWorkouts.reduce((total, workout) => {
      return total + (workout.totalVolume || 0);
    }, 0);

    chartsLogger.debug('Monthly volume calculation', {
      totalWorkouts: workouts.length,
      monthlyWorkouts: monthlyWorkouts.length,
      volume,
      startOfMonth: startOfMonth.toISOString(),
    });

    return volume;
  }, [workouts]);

  // Memoize exercise statistics calculation - only recalculates when workouts change
  const exerciseData = useMemo(() => {
    if (workouts.length === 0) {
      return {};
    }

    const stats = calculateExerciseStats(workouts);
    chartsLogger.debug('Exercise statistics calculated', {
      exerciseCount: Object.keys(stats).length,
      exercises: Object.keys(stats),
    });

    return stats;
  }, [workouts]);

  // Memoize overall stats - only recalculates when workouts or totalVolume change
  const overallStats = useMemo(
    () => ({
      workoutsLogged: workouts.length,
      totalVolume: totalVolume,
      activeWeeks: 5,
    }),
    [workouts.length, totalVolume]
  );

  // Memoize total pages calculation - only recalculates when exerciseData changes
  const totalPages = useMemo(
    () => Math.ceil(Object.keys(exerciseData).length / exercisesPerPage),
    [exerciseData, exercisesPerPage]
  );

  // Reset to first page when exercise data changes (when workouts change)
  useEffect(() => {
    setCurrentPage(1);
  }, [workouts]);

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <BackToDashboardButton />

      {/* Header */}
      <div className='space-y-2 mt-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Progress Charts</h1>
        <p className='text-muted-foreground'>
          Track your strength progress across all exercises
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Workouts Logged
            </CardTitle>
            <Dumbbell className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {overallStats.workoutsLogged}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total workouts completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Volume</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(overallStats.totalVolume || 0).toLocaleString()}
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
      <ExerciseChartsList
        exerciseData={exerciseData}
        currentPage={currentPage}
        exercisesPerPage={exercisesPerPage}
      />

      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={currentPage}
        exercisesPerPage={exercisesPerPage}
      />

      <ExercisePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
