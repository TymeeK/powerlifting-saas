import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { ExerciseStats } from '@/lib/types';
import ExerciseChartCard from './ExerciseChartCard';

interface ExerciseChartsListProps {
  exerciseData: Record<string, ExerciseStats>;
  currentPage: number;
  exercisesPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ExerciseChartsList({
  exerciseData,
  currentPage,
  exercisesPerPage,
  onPageChange,
}: ExerciseChartsListProps) {
  const exerciseEntries = Object.entries(exerciseData);
  const totalPages = Math.ceil(exerciseEntries.length / exercisesPerPage);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exerciseEntries.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (exerciseEntries.length === 0) {
    return (
      <Card>
        <CardContent className='p-12 text-center'>
          <Dumbbell className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-xl font-semibold mb-2'>No Exercise Data Yet</h3>
          <p className='text-muted-foreground mb-6'>
            Complete some workouts to see your exercise progress and statistics
            here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {currentExercises.map(([key, exercise]) => (
          <ExerciseChartCard key={key} exercise={exercise} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={e => {
                  e.preventDefault();
                  onPageChange(Math.max(currentPage - 1, 1));
                }}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              const pageNumber = page as number;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      onPageChange(pageNumber);
                    }}
                    isActive={currentPage === pageNumber}
                    size='icon'
                    className='cursor-pointer'
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={e => {
                  e.preventDefault();
                  onPageChange(Math.min(currentPage + 1, totalPages));
                }}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
