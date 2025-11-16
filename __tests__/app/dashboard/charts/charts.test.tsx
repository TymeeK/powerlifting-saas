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

describe('Charts Page - Total Volume Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('calculates total volume correctly for workouts in the current month', async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Create workouts within the current month
    const currentMonthWorkouts: PastWorkout[] = [
      createMockWorkout(
        '1',
        5000,
        new Date(now.getFullYear(), now.getMonth(), 5)
      ),
      createMockWorkout(
        '2',
        7500,
        new Date(now.getFullYear(), now.getMonth(), 15)
      ),
      createMockWorkout(
        '3',
        3000,
        new Date(now.getFullYear(), now.getMonth(), 25)
      ),
    ];

    (getPastWorkouts as any).mockResolvedValue({
      success: true,
      workouts: currentMonthWorkouts,
    });

    render(<ChartsPage />);

    await waitFor(() => {
      expect(getPastWorkouts).toHaveBeenCalledWith('123');
    });

    // Wait for the component to render and calculate volume
    await waitFor(() => {
      const totalVolumeElement = screen.getByText('15,500');
      expect(totalVolumeElement).toBeInTheDocument();
    });
  });

  it('excludes workouts from previous months when calculating monthly volume', async () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 10);

    // Mix of workouts from last month and current month
    const mixedWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, lastMonth), // Should be excluded
      createMockWorkout('2', 5000, currentMonth), // Should be included
      createMockWorkout('3', 8000, currentMonth), // Should be included
      createMockWorkout('4', 12000, lastMonth), // Should be excluded
    ];

    (getPastWorkouts as any).mockResolvedValue({
      success: true,
      workouts: mixedWorkouts,
    });

    render(<ChartsPage />);

    await waitFor(() => {
      expect(getPastWorkouts).toHaveBeenCalledWith('123');
    });

    // Should only show volume from current month (5000 + 8000 = 13000)
    await waitFor(() => {
      const totalVolumeElement = screen.getByText('13,000');
      expect(totalVolumeElement).toBeInTheDocument();
    });
  });

  it('displays zero volume when no workouts exist in the current month', async () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 10);

    // Only workouts from previous months
    const oldWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, lastMonth),
      createMockWorkout('2', 5000, twoMonthsAgo),
    ];

    (getPastWorkouts as any).mockResolvedValue({
      success: true,
      workouts: oldWorkouts,
    });

    render(<ChartsPage />);

    await waitFor(() => {
      expect(getPastWorkouts).toHaveBeenCalledWith('123');
    });

    // Should show 0 for current month volume
    await waitFor(() => {
      const totalVolumeElement = screen.getByText('0');
      expect(totalVolumeElement).toBeInTheDocument();
    });
  });

  it('handles workouts with zero totalVolume correctly', async () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 10);

    // Workouts with zero volume
    const zeroVolumeWorkouts: PastWorkout[] = [
      createMockWorkout('1', 0, currentMonth),
      createMockWorkout('2', 0, currentMonth),
      createMockWorkout('3', 5000, currentMonth), // One with volume
    ];

    (getPastWorkouts as any).mockResolvedValue({
      success: true,
      workouts: zeroVolumeWorkouts,
    });

    render(<ChartsPage />);

    await waitFor(() => {
      expect(getPastWorkouts).toHaveBeenCalledWith('123');
    });

    // Should only show volume from the workout with non-zero volume
    await waitFor(() => {
      const totalVolumeElement = screen.getByText('5,000');
      expect(totalVolumeElement).toBeInTheDocument();
    });
  });

  it('correctly calculates volume for workouts on the first day of the month', async () => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstOfMonth.setHours(0, 0, 0, 0);

    // Workout exactly on the first day of the month
    const firstDayWorkouts: PastWorkout[] = [
      createMockWorkout('1', 10000, firstOfMonth),
      createMockWorkout(
        '2',
        5000,
        new Date(now.getFullYear(), now.getMonth(), 5)
      ),
    ];

    (getPastWorkouts as any).mockResolvedValue({
      success: true,
      workouts: firstDayWorkouts,
    });

    render(<ChartsPage />);

    await waitFor(() => {
      expect(getPastWorkouts).toHaveBeenCalledWith('123');
    });

    // Should include the workout from the first day (10000 + 5000 = 15000)
    await waitFor(() => {
      const totalVolumeElement = screen.getByText('15,000');
      expect(totalVolumeElement).toBeInTheDocument();
    });
  });
});
