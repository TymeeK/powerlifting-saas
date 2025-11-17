import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrengthProgressionOverview from '@/components/dashboard/charts/StrengthProgressionOverview';
import {
  createMockExerciseStats,
  createMultipleExerciseStats,
} from '@/__tests__/utils/charts-test-helpers';

// Helper to render component with common props
const renderOverview = (
  exerciseData: Record<string, any>,
  currentPage = 1,
  exercisesPerPage = 6
) => {
  return render(
    <StrengthProgressionOverview
      exerciseData={exerciseData}
      currentPage={currentPage}
      exercisesPerPage={exercisesPerPage}
    />
  );
};

describe('StrengthProgressionOverview', () => {
  describe('Null States', () => {
    it('returns null when no exercise data exists', () => {
      const { container } = renderOverview({});
      expect(container.firstChild).toBeNull();
    });

    it('returns null when all exercises have zero currentPR', () => {
      const exerciseData = {
        'exercise-1': createMockExerciseStats('Exercise 1', { currentPR: 0 }),
        'exercise-2': createMockExerciseStats('Exercise 2', { currentPR: 0 }),
      };

      const { container } = renderOverview(exerciseData);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Rendering', () => {
    it('renders progression overview when exercises with PRs exist', () => {
      const exerciseData = {
        'bench-press': createMockExerciseStats('Bench Press', {
          currentPR: 225,
          previousPR: 205,
        }),
      };

      renderOverview(exerciseData);

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

      renderOverview(exerciseData);

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('New Exercise')).not.toBeInTheDocument();
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

      renderOverview(exerciseData);

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
      expect(screen.getByText('Deadlift')).toBeInTheDocument();
      expect(screen.getByText(/205 → 225 lbs/)).toBeInTheDocument();
      expect(screen.getByText(/295 → 315 lbs/)).toBeInTheDocument();
      expect(screen.getByText(/385 → 405 lbs/)).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays only exercises for current page', () => {
      const exerciseData = {
        'exercise-1': createMockExerciseStats('Exercise 1', { currentPR: 200 }),
        'exercise-2': createMockExerciseStats('Exercise 2', { currentPR: 250 }),
        'exercise-3': createMockExerciseStats('Exercise 3', { currentPR: 300 }),
        'exercise-4': createMockExerciseStats('Exercise 4', { currentPR: 350 }),
      };

      renderOverview(exerciseData, 1, 2);

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

      renderOverview(exerciseData, 2, 2);

      expect(screen.queryByText('Exercise 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Exercise 2')).not.toBeInTheDocument();
      expect(screen.getByText('Exercise 3')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct color class to progression bars', () => {
      const exerciseData = {
        'bench-press': createMockExerciseStats('Bench Press', {
          currentPR: 225,
          color: 'bg-green-500',
        }),
      };

      const { container } = renderOverview(exerciseData);
      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
