import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExercisePagination from '@/components/dashboard/charts/ExercisePagination';

// Helper to render component with common props
const renderPagination = (
  currentPage: number,
  totalPages: number,
  onPageChange = vi.fn()
) => {
  return render(
    <ExercisePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
};

describe('ExercisePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Null States', () => {
    it('returns null when totalPages is 0', () => {
      const { container } = renderPagination(1, 0);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when totalPages is 1', () => {
      const { container } = renderPagination(1, 1);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Page Number Display', () => {
    it('renders pagination when totalPages > 1', () => {
      renderPagination(1, 5);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays all page numbers when totalPages <= 5', () => {
      renderPagination(1, 5);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays ellipsis when currentPage is near the beginning', () => {
      renderPagination(2, 10);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('displays ellipsis when currentPage is near the end', () => {
      renderPagination(9, 10);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('displays ellipsis on both sides when currentPage is in the middle', () => {
      renderPagination(5, 10);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onPageChange when clicking a page number', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      renderPagination(1, 5, onPageChange);

      await user.click(screen.getByText('3'));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with previous page when clicking previous button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      renderPagination(3, 5, onPageChange);

      const previousButton = screen.getByRole('link', {
        name: /go to previous page/i,
      });
      await user.click(previousButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('prevents going below page 1 when clicking previous on first page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      renderPagination(1, 5, onPageChange);

      const previousButton = screen.getByRole('link', {
        name: /go to previous page/i,
      });
      await user.click(previousButton);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange with next page when clicking next button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      renderPagination(3, 5, onPageChange);

      const nextButton = screen.getByRole('link', { name: /go to next page/i });
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('prevents going above totalPages when clicking next on last page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      renderPagination(5, 5, onPageChange);

      const nextButton = screen.getByRole('link', { name: /go to next page/i });
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Visual States', () => {
    it('highlights current page as active', () => {
      renderPagination(3, 5);

      const page3Button = screen.getByText('3');
      expect(page3Button.closest('a')).toHaveAttribute('aria-current', 'page');
    });

    it('disables previous button on first page', () => {
      renderPagination(1, 5);

      const previousButton = screen.getByRole('link', {
        name: /go to previous page/i,
      });
      expect(previousButton).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('disables next button on last page', () => {
      renderPagination(5, 5);

      const nextButton = screen.getByRole('link', { name: /go to next page/i });
      expect(nextButton).toHaveClass('pointer-events-none', 'opacity-50');
    });
  });
});
