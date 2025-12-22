import { useMemo } from 'react';
import useSWR from 'swr';
import { PastWorkout, ExerciseStats } from '@/lib/types';
import { getAllPastWorkoutsFetcher } from '@/lib/swr/fetcher';
import { calculateWorkoutVolume } from '@/lib/workout-utils';

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

interface UseExerciseStatsReturn {
  exerciseData: Record<string, ExerciseStats>;
  totalVolume: number;
  overallStats: {
    workoutsLogged: number;
    totalVolume: number;
    activeWeeks: number;
  };
  isLoading: boolean;
  error: Error | undefined;
}

export function useExerciseStats(
  userId: string | undefined
): UseExerciseStatsReturn {
  const swrKey = userId ? `exercise-stats-${userId}` : null;

  const {
    data: workouts = [],
    isLoading,
    error,
  } = useSWR<PastWorkout[]>(
    swrKey,
    () => getAllPastWorkoutsFetcher(userId || ''),
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

    return monthlyWorkouts.reduce((total, workout) => {
      return total + calculateWorkoutVolume(workout);
    }, 0);
  }, [workouts]);

  const exerciseData = useMemo(() => {
    if (workouts.length === 0) {
      return {};
    }

    return calculateExerciseStats(workouts);
  }, [workouts]);

  const overallStats = useMemo(
    () => ({
      workoutsLogged: workouts.length,
      totalVolume: totalVolume,
      activeWeeks: 5,
    }),
    [workouts.length, totalVolume]
  );

  return {
    exerciseData,
    totalVolume,
    overallStats,
    isLoading,
    error,
  };
}
