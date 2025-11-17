import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { ExerciseStats } from '@/lib/types';
import ExerciseChartCard from './ExerciseChartCard';

interface ExerciseChartsListProps {
  exerciseData: Record<string, ExerciseStats>;
  currentPage: number;
  exercisesPerPage: number;
}

export default function ExerciseChartsList({
  exerciseData,
  currentPage,
  exercisesPerPage,
}: ExerciseChartsListProps) {
  const exerciseEntries = Object.entries(exerciseData);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exerciseEntries.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

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
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {currentExercises.map(([key, exercise]) => (
        <ExerciseChartCard key={key} exercise={exercise} />
      ))}
    </div>
  );
}
