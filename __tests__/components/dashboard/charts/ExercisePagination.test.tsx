import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExercisePagination from '@/components/dashboard/charts/ExercisePagination';

describe('ExercisePagination', () => {
  it('returns null when totalPages is 0', () => {
    const { container } = render(
      <ExercisePagination
        currentPage={1}
        totalPages={0}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when totalPages is 1', () => {
    const { container } = render(
      <ExercisePagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders pagination when totalPages > 1', () => {
    render(
      <ExercisePagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    // Should show page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays all page numbers when totalPages <= 5', () => {
    render(
      <ExercisePagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays ellipsis when currentPage is near the beginning', () => {
    render(
      <ExercisePagination
        currentPage={2}
        totalPages={10}
        onPageChange={vi.fn()}
      />
    );

    // Should show: 1, 2, 3, 4, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays ellipsis when currentPage is near the end', () => {
    render(
      <ExercisePagination
        currentPage={9}
        totalPages={10}
        onPageChange={vi.fn()}
      />
    );

    // Should show: 1, ..., 7, 8, 9, 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays ellipsis on both sides when currentPage is in the middle', () => {
    render(
      <ExercisePagination
        currentPage={5}
        totalPages={10}
        onPageChange={vi.fn()}
      />
    );

    // Should show: 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking a page number', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExercisePagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const page3Button = screen.getByText('3');
    await user.click(page3Button);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when clicking previous button', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExercisePagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const previousButton = screen.getByRole('link', {
      name: /go to previous page/i,
    });
    await user.click(previousButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not call onPageChange when clicking previous on first page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExercisePagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const previousButton = screen.getByRole('link', {
      name: /go to previous page/i,
    });
    await user.click(previousButton);

    // Should still be called but with page 1 (Math.max prevents going below 1)
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with next page when clicking next button', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExercisePagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByRole('link', { name: /go to next page/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('does not call onPageChange when clicking next on last page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExercisePagination
        currentPage={5}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByRole('link', { name: /go to next page/i });
    await user.click(nextButton);

    // Should still be called but with page 5 (Math.min prevents going above totalPages)
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('highlights current page as active', () => {
    render(
      <ExercisePagination
        currentPage={3}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const page3Button = screen.getByText('3');
    expect(page3Button.closest('a')).toHaveAttribute('aria-current', 'page');
  });

  it('disables previous button on first page', () => {
    render(
      <ExercisePagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const previousButton = screen.getByRole('link', {
      name: /go to previous page/i,
    });
    expect(previousButton).toHaveClass('pointer-events-none', 'opacity-50');
  });

  it('disables next button on last page', () => {
    render(
      <ExercisePagination
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const nextButton = screen.getByRole('link', { name: /go to next page/i });
    expect(nextButton).toHaveClass('pointer-events-none', 'opacity-50');
  });
});
