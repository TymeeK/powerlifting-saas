import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExerciseChartCard from '@/components/dashboard/charts/ExerciseChartCard';
import { ExerciseStats } from '@/lib/types';
import { createMockExerciseStats } from '@/__tests__/utils/charts-test-helpers';

// Helper to render component and return container
const renderCard = (overrides?: Partial<ExerciseStats>) => {
  const exercise = createMockExerciseStats('Test Exercise', overrides);
  const result = render(<ExerciseChartCard exercise={exercise} />);
  return { ...result, exercise };
};

// Helper to get section by label text
const getSectionByLabel = (label: string) => {
  return screen.getByText(label).closest('div');
};

describe('ExerciseChartCard', () => {
  describe('Exercise Name and PR Display', () => {
    it('renders exercise name and current PR', () => {
      renderCard({ name: 'Bench Press', currentPR: 225 });

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText(/Current PR: 225 lbs/)).toBeInTheDocument();
    });

    it('displays "No PR set yet" when currentPR is 0', () => {
      renderCard({ name: 'New Exercise', currentPR: 0 });

      expect(screen.getByText('No PR set yet')).toBeInTheDocument();
    });
  });

  describe('Weekly Progress', () => {
    it('renders weekly progress when available', () => {
      renderCard({
        name: 'Squat',
        weeklyProgress: [
          { week: 'Week 1', weight: 275, reps: 5 },
          { week: 'Week 2', weight: 285, reps: 5 },
          { week: 'Week 3', weight: 295, reps: 3 },
        ],
      });

      expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
      expect(screen.getByText('Week 1')).toBeInTheDocument();
      expect(screen.getByText('275 lbs')).toBeInTheDocument();
      expect(screen.getAllByText('5 reps').length).toBeGreaterThan(0);
    });

    it('displays empty state message when no weekly progress', () => {
      renderCard({ name: 'Deadlift', weeklyProgress: [] });

      expect(screen.getByText('Weekly Progress')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Complete workouts over multiple weeks to see progress'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('displays previous PR correctly', () => {
      renderCard({ name: 'Bench Press', previousPR: 205, currentPR: 225 });

      const previousPRSection = getSectionByLabel('Previous PR');
      expect(previousPRSection).toBeInTheDocument();
      expect(previousPRSection).toHaveTextContent('205 lbs');
    });

    it('displays monthly volume with proper formatting', () => {
      renderCard({ name: 'Squat', monthlyVolume: 12500 });

      expect(screen.getByText('Monthly Volume')).toBeInTheDocument();
      expect(screen.getByText('12,500')).toBeInTheDocument();
    });

    it('displays last workout date', () => {
      renderCard({ name: 'Deadlift', lastWorkout: '2024-01-15' });

      const lastWorkoutSection = getSectionByLabel('Last Workout');
      const parentElement = lastWorkoutSection?.parentElement;

      expect(parentElement).toBeInTheDocument();
      expect(parentElement).toHaveTextContent(/2024/);
      expect(parentElement).toHaveTextContent(
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/
      );
    });
  });

  describe('Weight Progression Bar', () => {
    it('renders weight progression bar when currentPR > 0', () => {
      renderCard({ name: 'Bench Press', currentPR: 225, previousPR: 205 });

      expect(screen.getByText('Weight Progression')).toBeInTheDocument();
      expect(screen.getByText(/205 → 225 lbs/)).toBeInTheDocument();
    });

    it('does not render weight progression bar when currentPR is 0', () => {
      renderCard({ name: 'New Exercise', currentPR: 0, previousPR: 0 });

      expect(screen.queryByText('Weight Progression')).not.toBeInTheDocument();
    });

    it('applies correct color class to progress bar', () => {
      const { container } = renderCard({
        name: 'Bench Press',
        currentPR: 225,
        color: 'bg-green-500',
      });

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
