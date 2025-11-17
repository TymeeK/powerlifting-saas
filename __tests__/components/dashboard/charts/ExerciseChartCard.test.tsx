import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseChartCard from '@/components/dashboard/charts/ExerciseChartCard';
import { ExerciseStats } from '@/lib/types';

const createMockExerciseStats = (
  name: string,
  overrides?: Partial<ExerciseStats>
): ExerciseStats => ({
  name,
  currentPR: 225,
  previousPR: 205,
  target: 250,
  weeklyProgress: [
    { week: 'Week 1', weight: 205, reps: 5 },
    { week: 'Week 2', weight: 215, reps: 5 },
    { week: 'Week 3', weight: 225, reps: 3 },
  ],
  monthlyVolume: 5000,
  lastWorkout: '2024-01-15',
  improvement: 9.8,
  color: 'bg-blue-500',
  ...overrides,
});

describe('ExerciseChartCard', () => {
  it('renders exercise name and current PR', () => {
    const exercise = createMockExerciseStats('Bench Press', {
      currentPR: 225,
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText(/Current PR: 225 lbs/)).toBeInTheDocument();
  });

  it('displays "No PR set yet" when currentPR is 0', () => {
    const exercise = createMockExerciseStats('New Exercise', {
      currentPR: 0,
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('No PR set yet')).toBeInTheDocument();
  });

  it('renders weekly progress when available', () => {
    const exercise = createMockExerciseStats('Squat', {
      weeklyProgress: [
        { week: 'Week 1', weight: 275, reps: 5 },
        { week: 'Week 2', weight: 285, reps: 5 },
        { week: 'Week 3', weight: 295, reps: 3 },
      ],
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
    expect(screen.getByText('Week 1')).toBeInTheDocument();
    expect(screen.getByText('275 lbs')).toBeInTheDocument();
    // Use getAllByText since there are multiple "5 reps" badges
    expect(screen.getAllByText('5 reps').length).toBeGreaterThan(0);
  });

  it('displays empty state message when no weekly progress', () => {
    const exercise = createMockExerciseStats('Deadlift', {
      weeklyProgress: [],
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
    expect(
      screen.getByText('Complete workouts over multiple weeks to see progress')
    ).toBeInTheDocument();
  });

  it('displays previous PR correctly', () => {
    const exercise = createMockExerciseStats('Bench Press', {
      previousPR: 205,
      currentPR: 225, // Different from previousPR to avoid duplicates
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Previous PR')).toBeInTheDocument();
    // Check that "205 lbs" appears in the context of "Previous PR"
    const previousPRSection = screen.getByText('Previous PR').closest('div');
    expect(previousPRSection).toBeInTheDocument();
    expect(previousPRSection).toHaveTextContent('205 lbs');
  });

  it('displays monthly volume with proper formatting', () => {
    const exercise = createMockExerciseStats('Squat', {
      monthlyVolume: 12500,
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Monthly Volume')).toBeInTheDocument();
    expect(screen.getByText('12,500')).toBeInTheDocument();
  });

  it('displays last workout date', () => {
    const exercise = createMockExerciseStats('Deadlift', {
      lastWorkout: '2024-01-15',
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Last Workout')).toBeInTheDocument();
    // Check that the date is formatted and displayed
    // The date should be formatted by toLocaleDateString()
    const lastWorkoutSection = screen.getByText('Last Workout').closest('div');
    expect(lastWorkoutSection).toBeInTheDocument();
    // Verify the section contains formatted date (format may vary by locale and timezone)
    // Date might show as 1/14 or 1/15 depending on timezone, so we check for 2024
    const parentElement = lastWorkoutSection?.parentElement;
    expect(parentElement).toBeInTheDocument();
    expect(parentElement).toHaveTextContent(/2024/);
    // Also verify it contains a date-like pattern
    expect(parentElement).toHaveTextContent(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
  });

  it('renders weight progression bar when currentPR > 0', () => {
    const exercise = createMockExerciseStats('Bench Press', {
      currentPR: 225,
      previousPR: 205,
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.getByText('Weight Progression')).toBeInTheDocument();
    expect(screen.getByText(/205 → 225 lbs/)).toBeInTheDocument();
  });

  it('does not render weight progression bar when currentPR is 0', () => {
    const exercise = createMockExerciseStats('New Exercise', {
      currentPR: 0,
      previousPR: 0,
    });

    render(<ExerciseChartCard exercise={exercise} />);

    expect(screen.queryByText('Weight Progression')).not.toBeInTheDocument();
  });

  it('applies correct color class to progress bar', () => {
    const exercise = createMockExerciseStats('Bench Press', {
      currentPR: 225,
      color: 'bg-green-500',
    });

    const { container } = render(<ExerciseChartCard exercise={exercise} />);
    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });
});
