import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrengthProgressionOverview from '@/components/dashboard/charts/StrengthProgressionOverview';
import { ExerciseStats } from '@/lib/types';

const createMockExerciseStats = (
  name: string,
  overrides?: Partial<ExerciseStats>
): ExerciseStats => ({
  name,
  currentPR: 225,
  previousPR: 205,
  target: 250,
  weeklyProgress: [],
  monthlyVolume: 5000,
  lastWorkout: '2024-01-15',
  improvement: 9.8,
  color: 'bg-blue-500',
  ...overrides,
});

describe('StrengthProgressionOverview', () => {
  it('returns null when no exercise data exists', () => {
    const { container } = render(
      <StrengthProgressionOverview
        exerciseData={{}}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when all exercises have zero currentPR', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1', { currentPR: 0 }),
      'exercise-2': createMockExerciseStats('Exercise 2', { currentPR: 0 }),
    };

    const { container } = render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders progression overview when exercises with PRs exist', () => {
    const exerciseData = {
      'bench-press': createMockExerciseStats('Bench Press', {
        currentPR: 225,
        previousPR: 205,
      }),
    };

    render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(
      screen.getByText('Strength Progression Overview')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Visual representation of your strength gains for current page'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText(/205 → 225 lbs/)).toBeInTheDocument();
  });

  it('filters out exercises with zero PR from display', () => {
    const exerciseData = {
      'bench-press': createMockExerciseStats('Bench Press', {
        currentPR: 225,
        previousPR: 205,
      }),
      'new-exercise': createMockExerciseStats('New Exercise', {
        currentPR: 0,
        previousPR: 0,
      }),
    };

    render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('New Exercise')).not.toBeInTheDocument();
  });

  it('displays only exercises for current page', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1', { currentPR: 200 }),
      'exercise-2': createMockExerciseStats('Exercise 2', { currentPR: 250 }),
      'exercise-3': createMockExerciseStats('Exercise 3', { currentPR: 300 }),
      'exercise-4': createMockExerciseStats('Exercise 4', { currentPR: 350 }),
    };

    render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={2}
      />
    );

    // Should show first 2 exercises
    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText('Exercise 2')).toBeInTheDocument();
    expect(screen.queryByText('Exercise 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Exercise 4')).not.toBeInTheDocument();
  });

  it('displays correct exercises for page 2', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1', { currentPR: 200 }),
      'exercise-2': createMockExerciseStats('Exercise 2', { currentPR: 250 }),
      'exercise-3': createMockExerciseStats('Exercise 3', { currentPR: 300 }),
    };

    render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={2}
        exercisesPerPage={2}
      />
    );

    expect(screen.queryByText('Exercise 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Exercise 2')).not.toBeInTheDocument();
    expect(screen.getByText('Exercise 3')).toBeInTheDocument();
  });

  it('applies correct color class to progression bars', () => {
    const exerciseData = {
      'bench-press': createMockExerciseStats('Bench Press', {
        currentPR: 225,
        color: 'bg-green-500',
      }),
    };

    const { container } = render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('handles multiple exercises with different PRs', () => {
    const exerciseData = {
      'bench-press': createMockExerciseStats('Bench Press', {
        currentPR: 225,
        previousPR: 205,
      }),
      squat: createMockExerciseStats('Squat', {
        currentPR: 315,
        previousPR: 295,
      }),
      deadlift: createMockExerciseStats('Deadlift', {
        currentPR: 405,
        previousPR: 385,
      }),
    };

    render(
      <StrengthProgressionOverview
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
    expect(screen.getByText(/205 → 225 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/295 → 315 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/385 → 405 lbs/)).toBeInTheDocument();
  });
});
