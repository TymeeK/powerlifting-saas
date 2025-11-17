import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseChartsList from '@/components/dashboard/charts/ExerciseChartsList';
import {
  createMockExerciseStats,
  createMultipleExerciseStats,
} from '@/__tests__/utils/charts-test-helpers';

// Helper to render component with common props
const renderList = (
  exerciseData: Record<string, any>,
  currentPage = 1,
  exercisesPerPage = 6
) => {
  return render(
    <ExerciseChartsList
      exerciseData={exerciseData}
      currentPage={currentPage}
      exercisesPerPage={exercisesPerPage}
    />
  );
};

describe('ExerciseChartsList', () => {
  describe('Empty State', () => {
    it('renders empty state when no exercise data exists', () => {
      renderList({});

      expect(screen.getByText('No Exercise Data Yet')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Complete some workouts to see your exercise progress and statistics here!'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Exercise Rendering', () => {
    it('renders exercise cards when exercise data exists', () => {
      const exerciseData = {
        'bench-press': createMockExerciseStats('Bench Press'),
        squat: createMockExerciseStats('Squat'),
      };

      renderList(exerciseData);

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays only exercises for current page', () => {
      const exerciseData = createMultipleExerciseStats(7);

      renderList(exerciseData, 1, 3);

      expect(screen.getByText('Exercise 1')).toBeInTheDocument();
      expect(screen.getByText('Exercise 2')).toBeInTheDocument();
      expect(screen.getByText('Exercise 3')).toBeInTheDocument();
      expect(screen.queryByText('Exercise 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Exercise 7')).not.toBeInTheDocument();
    });

    it('displays correct exercises for page 2', () => {
      const exerciseData = createMultipleExerciseStats(5);

      renderList(exerciseData, 2, 2);

      expect(screen.queryByText('Exercise 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Exercise 2')).not.toBeInTheDocument();
      expect(screen.getByText('Exercise 3')).toBeInTheDocument();
      expect(screen.getByText('Exercise 4')).toBeInTheDocument();
      expect(screen.queryByText('Exercise 5')).not.toBeInTheDocument();
    });

    it('handles pagination with fewer exercises than page size', () => {
      const exerciseData = createMultipleExerciseStats(2);

      renderList(exerciseData, 1, 6);

      expect(screen.getByText('Exercise 1')).toBeInTheDocument();
      expect(screen.getByText('Exercise 2')).toBeInTheDocument();
    });
  });
});
