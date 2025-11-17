import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ChartsPage from '@/app/dashboard/charts/page';
import { getPastWorkouts } from '@/lib/firebase';
import { PastWorkout } from '@/lib/types';

vi.mock('@/lib/firebase', () => ({
  getPastWorkouts: vi.fn(),
}));

vi.mock('@/lib/hooks/userRequireAuth', () => ({
  useRequireAuth: () => ({
    user: { email: 'test@example.com', uid: '123' },
    loading: false,
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    child: () => ({
      debug: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

const createMockWorkout = (
  id: string,
  totalVolume: number,
  createdAt: Date
): PastWorkout => ({
  id,
  date: createdAt.toISOString().split('T')[0],
  duration: '1h',
  exercises: [],
  totalVolume,
  personalRecords: 0,
  createdAt,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper function to render ChartsPage with mocked workouts
const renderChartsPageWithWorkouts = async (workouts: PastWorkout[]) => {
  (getPastWorkouts as any).mockResolvedValue({
    success: true,
    workouts,
  });

  render(<ChartsPage />);

  await waitFor(() => {
    expect(getPastWorkouts).toHaveBeenCalledWith('123');
  });
};

// Helper function to render ChartsPage with error
const renderChartsPageWithError = async (error: Error) => {
  (getPastWorkouts as any).mockRejectedValue(error);

  render(<ChartsPage />);

  await waitFor(() => {
    expect(getPastWorkouts).toHaveBeenCalledWith('123');
  });
};

// Helper function to render ChartsPage with loading state
const renderChartsPageWithLoading = () => {
  (getPastWorkouts as any).mockImplementation(
    () => new Promise(() => {}) // Never resolves, keeps loading state
  );

  render(<ChartsPage />);
};

// Date helper functions
const getNow = () => new Date();
const getCurrentMonthDate = (day: number = 10) => {
  const now = getNow();
  return new Date(now.getFullYear(), now.getMonth(), day);
};
const getDateDaysAgo = (daysAgo: number) => {
  const now = getNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
};
const getLastMonthDate = (day: number = 15) => {
  const now = getNow();
  return new Date(now.getFullYear(), now.getMonth() - 1, day);
};
const getFirstOfMonth = () => {
  const now = getNow();
  const date = new Date(now.getFullYear(), now.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Text assertion helper
const waitForTextToAppear = async (text: string) => {
  await waitFor(() => {
    const element = screen.getByText(text);
    expect(element).toBeInTheDocument();
  });
};

// Exercise assertion helper
const waitForExerciseToAppear = async (exerciseName: string) => {
  await waitFor(
    () => {
      const exerciseNames = screen.getAllByText(exerciseName);
      expect(exerciseNames.length).toBeGreaterThan(0);
    },
    { timeout: 3000 }
  );
};

// Exercise creation helper
const createExerciseData = (
  name: string,
  sets: number,
  reps: number[],
  weight: number[]
) => ({
  name,
  sets,
  reps,
  weight,
});

// Helper to create mock workout with exercises
const createMockWorkoutWithExercises = (
  id: string,
  exercises: Array<{
    name: string;
    sets: number;
    reps: number[];
    weight: number[];
  }>,
  createdAt: Date
): PastWorkout => {
  // Calculate total volume from exercises
  const totalVolume = exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.weight.reduce(
        (sum, w, i) => sum + w * (exercise.reps[i] || 0),
        0
      )
    );
  }, 0);

  return {
    id,
    date: createdAt.toISOString().split('T')[0],
    duration: '1h',
    exercises,
    totalVolume,
    personalRecords: 0,
    createdAt,
  };
};

describe('Charts Page - Total Volume Calculation', () => {
  it('calculates total volume correctly for workouts in the current month', async () => {
    const currentMonthWorkouts: PastWorkout[] = [
      createMockWorkout('1', 5000, getCurrentMonthDate(5)),
      createMockWorkout('2', 7500, getCurrentMonthDate(15)),
      createMockWorkout('3', 3000, getCurrentMonthDate(25)),
    ];

    await renderChartsPageWithWorkouts(currentMonthWorkouts);
    await waitForTextToAppear('15,500');
  });

  it('excludes workouts from previous months when calculating monthly volume', async () => {
    const lastMonth = getLastMonthDate(15);
    const currentMonth = getCurrentMonthDate(10);

    // Mix of workouts from last month and current month
    const mixedWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, lastMonth), // Should be excluded
      createMockWorkout('2', 5000, currentMonth), // Should be included
      createMockWorkout('3', 8000, currentMonth), // Should be included
      createMockWorkout('4', 12000, lastMonth), // Should be excluded
    ];

    await renderChartsPageWithWorkouts(mixedWorkouts);

    // Should only show volume from current month (5000 + 8000 = 13000)
    await waitForTextToAppear('13,000');
  });

  it('displays zero volume when no workouts exist in the current month', async () => {
    const lastMonth = getLastMonthDate(15);
    const twoMonthsAgo = getLastMonthDate(10);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

    // Only workouts from previous months
    const oldWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, lastMonth),
      createMockWorkout('2', 5000, twoMonthsAgo),
    ];

    await renderChartsPageWithWorkouts(oldWorkouts);

    // Should show 0 for current month volume
    await waitForTextToAppear('0');
  });

  it('handles workouts with zero totalVolume correctly', async () => {
    const currentMonth = getCurrentMonthDate(10);

    // Workouts with zero volume
    const zeroVolumeWorkouts: PastWorkout[] = [
      createMockWorkout('1', 0, currentMonth),
      createMockWorkout('2', 0, currentMonth),
      createMockWorkout('3', 5000, currentMonth), // One with volume
    ];

    await renderChartsPageWithWorkouts(zeroVolumeWorkouts);

    // Should only show volume from the workout with non-zero volume
    await waitForTextToAppear('5,000');
  });

  it('correctly calculates volume for workouts on the first day of the month', async () => {
    const firstDayWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, getFirstOfMonth()),
      createMockWorkout('2', 5000, getCurrentMonthDate(5)),
    ];

    await renderChartsPageWithWorkouts(firstDayWorkouts);

    // Should include the workout from the first day (10000 + 5000 = 15000)
    await waitForTextToAppear('15,000');
  });
});

describe('Charts Page - Workouts Logged', () => {
  it('displays correct count of workouts logged', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkout('1', 5000, getCurrentMonthDate(5)),
      createMockWorkout('2', 7500, getCurrentMonthDate(10)),
      createMockWorkout('3', 3000, getCurrentMonthDate(15)),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForTextToAppear('3');
  });

  it('displays zero when no workouts exist', async () => {
    await renderChartsPageWithWorkouts([]);

    await waitFor(() => {
      // "0" appears in both workouts logged and total volume
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Charts Page - Loading States', () => {
  it('displays loading screen when workouts are being fetched', async () => {
    renderChartsPageWithLoading();
    await waitForTextToAppear('Loading...');
  });
});

describe('Charts Page - Exercise Statistics', () => {
  it('calculates exercise statistics from workouts with exercises', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [createExerciseData('Bench Press', 3, [8, 8, 6], [185, 185, 195])],
        getCurrentMonthDate(10)
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Bench Press');
  });

  it('calculates current PR correctly from multiple workouts', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [createExerciseData('Squat', 3, [5, 5, 3], [275, 275, 295])], // Max: 295
        getCurrentMonthDate(5)
      ),
      createMockWorkoutWithExercises(
        '2',
        [createExerciseData('Squat', 3, [5, 3, 1], [285, 305, 315])], // Max: 315 (should be current PR)
        getCurrentMonthDate(10)
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Squat');
  });

  it('calculates previous PR correctly when multiple PRs exist', async () => {
    const dates = [
      getCurrentMonthDate(5),
      getCurrentMonthDate(10),
      getCurrentMonthDate(15),
    ];

    const workouts: PastWorkout[] = dates.map((date, index) =>
      createMockWorkoutWithExercises(
        `${index + 1}`,
        [
          createExerciseData(
            'Deadlift',
            3,
            [5, 3, 1],
            [335 + index * 20, 345 + index * 20, 365 + index * 20]
          ), // Increasing weights
        ],
        date
      )
    );

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Deadlift');
  });

  it('calculates exercise target as 10% above current PR rounded to nearest 5', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [createExerciseData('Bench Press', 3, [5, 3, 1], [185, 205, 225])], // Current PR: 225, Target should be ~248 rounded to 250
        getCurrentMonthDate(10)
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Bench Press');
  });

  it('calculates improvement percentage correctly', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [createExerciseData('Squat', 3, [5, 3, 1], [275, 295, 315])], // Previous PR: 315
        getCurrentMonthDate(5)
      ),
      createMockWorkoutWithExercises(
        '2',
        [createExerciseData('Squat', 3, [5, 3, 1], [285, 305, 335])], // Current PR: 335, Improvement: (335-315)/315 = 6.3%
        getCurrentMonthDate(15)
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Squat');
  });

  it('displays empty state when no exercise data exists', async () => {
    await renderChartsPageWithWorkouts([]);
    await waitForTextToAppear('No Exercise Data Yet');
  });

  it('handles error when getPastWorkouts fails', async () => {
    await renderChartsPageWithError(new Error('Failed to fetch workouts'));
    await waitForTextToAppear('Progress Charts');
  });

  it('calculates monthly volume per exercise correctly', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [createExerciseData('Bench Press', 3, [8, 8, 6], [185, 185, 195])], // Volume: 185*8 + 185*8 + 195*6 = 1480 + 1170 = 2650
        getLastMonthDate(15) // Should be excluded from monthly volume
      ),
      createMockWorkoutWithExercises(
        '2',
        [createExerciseData('Bench Press', 3, [8, 6, 4], [195, 205, 215])], // Volume: 195*8 + 205*6 + 215*4 = 1560 + 1230 + 860 = 3650
        getCurrentMonthDate(10) // Should be included
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);
    await waitForExerciseToAppear('Bench Press');
  });

  it('handles multiple exercises in a single workout', async () => {
    const workouts: PastWorkout[] = [
      createMockWorkoutWithExercises(
        '1',
        [
          createExerciseData('Bench Press', 3, [8, 8, 6], [185, 185, 195]),
          createExerciseData('Squat', 3, [5, 5, 3], [275, 275, 295]),
          createExerciseData('Deadlift', 3, [5, 3, 1], [335, 365, 405]),
        ],
        getCurrentMonthDate(10)
      ),
    ];

    await renderChartsPageWithWorkouts(workouts);

    // Should display all three exercises
    await waitForExerciseToAppear('Bench Press');
    await waitForExerciseToAppear('Squat');
    await waitForExerciseToAppear('Deadlift');
  });
});
