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
import { useExerciseStats } from '@/lib/hooks';
import BackToDashboardButton from '@/components/back-button';
import {
  StrengthProgressionOverview,
  ExerciseChartsList,
  ExercisePagination,
} from '@/components/dashboard/charts';

export default function ChartsPage() {
  const { user, loading } = useRequireAuth('/login');

  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6;

  const { exerciseData, totalVolume, overallStats, isLoading, error } =
    useExerciseStats(user?.uid);

  // Memoize total pages calculation - only recalculates when exerciseData changes
  const totalPages = useMemo(
    () => Math.ceil(Object.keys(exerciseData).length / exercisesPerPage),
    [exerciseData, exercisesPerPage]
  );

  // Reset to first page when exercise data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [exerciseData]);

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
