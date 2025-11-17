import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseChartsList from '@/components/dashboard/charts/ExerciseChartsList';
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

describe('ExerciseChartsList', () => {
  it('renders empty state when no exercise data exists', () => {
    render(
      <ExerciseChartsList
        exerciseData={{}}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(screen.getByText('No Exercise Data Yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Complete some workouts to see your exercise progress and statistics here!'
      )
    ).toBeInTheDocument();
  });

  it('renders exercise cards when exercise data exists', () => {
    const exerciseData = {
      'bench-press': createMockExerciseStats('Bench Press'),
      squat: createMockExerciseStats('Squat'),
    };

    render(
      <ExerciseChartsList
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('displays only exercises for current page', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1'),
      'exercise-2': createMockExerciseStats('Exercise 2'),
      'exercise-3': createMockExerciseStats('Exercise 3'),
      'exercise-4': createMockExerciseStats('Exercise 4'),
      'exercise-5': createMockExerciseStats('Exercise 5'),
      'exercise-6': createMockExerciseStats('Exercise 6'),
      'exercise-7': createMockExerciseStats('Exercise 7'),
    };

    render(
      <ExerciseChartsList
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={3}
      />
    );

    // Should show first 3 exercises
    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText('Exercise 2')).toBeInTheDocument();
    expect(screen.getByText('Exercise 3')).toBeInTheDocument();
    expect(screen.queryByText('Exercise 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Exercise 7')).not.toBeInTheDocument();
  });

  it('displays correct exercises for page 2', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1'),
      'exercise-2': createMockExerciseStats('Exercise 2'),
      'exercise-3': createMockExerciseStats('Exercise 3'),
      'exercise-4': createMockExerciseStats('Exercise 4'),
      'exercise-5': createMockExerciseStats('Exercise 5'),
    };

    render(
      <ExerciseChartsList
        exerciseData={exerciseData}
        currentPage={2}
        exercisesPerPage={2}
      />
    );

    // Should show exercises 3 and 4 (page 2 with 2 per page)
    expect(screen.queryByText('Exercise 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Exercise 2')).not.toBeInTheDocument();
    expect(screen.getByText('Exercise 3')).toBeInTheDocument();
    expect(screen.getByText('Exercise 4')).toBeInTheDocument();
    expect(screen.queryByText('Exercise 5')).not.toBeInTheDocument();
  });

  it('handles pagination with fewer exercises than page size', () => {
    const exerciseData = {
      'exercise-1': createMockExerciseStats('Exercise 1'),
      'exercise-2': createMockExerciseStats('Exercise 2'),
    };

    render(
      <ExerciseChartsList
        exerciseData={exerciseData}
        currentPage={1}
        exercisesPerPage={6}
      />
    );

    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText('Exercise 2')).toBeInTheDocument();
  });
});
