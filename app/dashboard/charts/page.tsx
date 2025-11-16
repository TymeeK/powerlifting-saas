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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Trophy,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/workout/LoadingScreen';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import BackToDashboardButton from '@/components/back-button';
import { getPastWorkouts } from '@/lib/firebase';
import { PastWorkout } from '@/lib/types';
import { logger } from '@/lib/logger';
import { StrengthProgressionOverview } from '@/components/dashboard/charts';
import { ExerciseStats } from '@/lib/types';

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
  const [workouts, setWorkouts] = useState<PastWorkout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState(0);
  const [exerciseData, setExerciseData] = useState<
    Record<string, ExerciseStats>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6;

  useEffect(() => {
    const calculateMonthlyVolume = () => {
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

      setTotalVolume(volume);
    };

    calculateMonthlyVolume();
  }, [workouts]);

  // Calculate exercise statistics when workouts change
  useEffect(() => {
    if (workouts.length > 0) {
      const stats = calculateExerciseStats(workouts);
      chartsLogger.debug('Exercise statistics calculated', {
        exerciseCount: Object.keys(stats).length,
        exercises: Object.keys(stats),
      });
      setExerciseData(stats);
      // Reset to first page when exercise data changes
      setCurrentPage(1);
    } else {
      setExerciseData({});
      setCurrentPage(1);
    }
  }, [workouts]);

  useEffect(() => {
    const loadWorkouts = async (userId: string) => {
      try {
        setWorkoutsLoading(true);
        const result = await getPastWorkouts(userId);
        if (result.success) {
          chartsLogger.debug('Workouts loaded', {
            workoutCount: result.workouts.length,
          });
          setWorkouts(result.workouts);
        }
      } catch (error) {
        chartsLogger.error('Error loading workouts', error);
      } finally {
        setWorkoutsLoading(false);
      }
    };

    if (user) {
      loadWorkouts(user.uid);
    }
  }, [user]);

  if (loading || workoutsLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  // Calculate overall stats (keeping prefilled data for other stats for now)
  const overallStats = {
    workoutsLogged: workouts.length,
    totalVolume: totalVolume,
    activeWeeks: 5,
  };

  // Calculate pagination
  const exerciseEntries = Object.entries(exerciseData);
  const totalPages = Math.ceil(exerciseEntries.length / exercisesPerPage);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exerciseEntries.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current page range, ellipsis, last page
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
      {Object.keys(exerciseData).length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <Dumbbell className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-xl font-semibold mb-2'>No Exercise Data Yet</h3>
            <p className='text-muted-foreground mb-6'>
              Complete some workouts to see your exercise progress and
              statistics here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {currentExercises.map(([key, exercise]) => (
              <Card key={key} className='relative overflow-hidden'>
                <CardHeader>
                  <CardTitle className='text-lg sm:text-xl'>
                    {exercise.name}
                  </CardTitle>
                  <CardDescription>
                    {exercise.currentPR > 0 ? (
                      <>Current PR: {exercise.currentPR} lbs</>
                    ) : (
                      'No PR set yet'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Weekly Progress Chart */}
                  {exercise.weeklyProgress.length > 0 ? (
                    <div className='space-y-3'>
                      <h4 className='font-medium text-sm'>Weekly Progress</h4>
                      <div className='space-y-2'>
                        {exercise.weeklyProgress.map((week, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between text-sm'
                          >
                            <span className='text-muted-foreground'>
                              {week.week}
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {week.weight} lbs
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                {week.reps} reps
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <h4 className='font-medium text-sm'>Weekly Progress</h4>
                      <p className='text-xs text-muted-foreground'>
                        Complete workouts over multiple weeks to see progress
                      </p>
                    </div>
                  )}

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
                  </div>

                  {/* Visual Progress Bar */}
                  {exercise.currentPR > 0 && (
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
                            width: '100%',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => {
                  if (page === 'ellipsis') {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  const pageNumber = page as number;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href='#'
                        onClick={e => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                        size='icon'
                        className='cursor-pointer'
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Summary Chart */}
      <StrengthProgressionOverview exerciseData={exerciseData} />
    </div>
  );
}
