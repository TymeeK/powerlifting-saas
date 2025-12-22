import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { DocumentData } from 'firebase/firestore';
import {
  PastWorkoutsResult,
  WORKOUT_DEFAULT_LIMIT,
} from '@/lib/firebase/workout';
import { getPastWorkoutsFetcher } from '@/lib/swr/fetcher';
import { PastWorkout } from '@/lib/types';

interface UsePastWorkoutsReturn {
  workouts: PastWorkout[];
  isLoading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export function usePastWorkouts(
  userId: string | undefined
): UsePastWorkoutsReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursor, setPageCursor] = useState<
    Map<number, DocumentData | null>
  >(new Map([[1, null]]));

  const currentPageCursor = pageCursor.get(currentPage) || null;

  const swrKey = userId
    ? `past-workouts-${userId}-${currentPage}-${
        currentPageCursor?.id || 'initial'
      }`
    : null;

  const {
    data: pageData,
    isLoading,
    error,
  } = useSWR<PastWorkoutsResult>(
    swrKey,
    () =>
      getPastWorkoutsFetcher(
        userId || '',
        WORKOUT_DEFAULT_LIMIT,
        currentPageCursor
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const { workouts, lastVisibleDoc, hasMore } = pageData || {
    workouts: [],
    lastVisibleDoc: null,
    hasMore: false,
  };

  useEffect(() => {
    if (lastVisibleDoc) {
      setPageCursor(prev => {
        const next = new Map(prev);
        next.set(currentPage + 1, lastVisibleDoc);
        return next;
      });
    }
  }, [lastVisibleDoc, currentPage]);

  const totalPages = useMemo(() => {
    return hasMore ? currentPage + 1 : currentPage;
  }, [hasMore, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    workouts,
    isLoading,
    error,
    hasMore,
    totalPages,
    currentPage,
    handlePageChange,
  };
}
