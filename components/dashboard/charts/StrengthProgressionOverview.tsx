import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExerciseStats } from '@/lib/types';

interface StrengthProgressionOverviewProps {
  exerciseData: Record<string, ExerciseStats>;
  currentPage: number;
  exercisesPerPage: number;
}

export default function StrengthProgressionOverview({
  exerciseData,
  currentPage,
  exercisesPerPage,
}: StrengthProgressionOverviewProps) {
  if (Object.keys(exerciseData).length === 0) {
    return null;
  }

  const exerciseEntries = Object.entries(exerciseData);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exerciseEntries.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  const exercisesToShow = currentExercises.filter(
    ([_, exercise]) => exercise.currentPR > 0
  );

  if (exercisesToShow.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strength Progression Overview</CardTitle>
        <CardDescription>
          Visual representation of your strength gains for current page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {exercisesToShow.map(([key, exercise]) => (
            <div key={key} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{exercise.name}</span>
                <span className='text-sm text-muted-foreground'>
                  {exercise.previousPR} → {exercise.currentPR} lbs
                </span>
              </div>
              <div className='relative h-3 bg-muted rounded-full overflow-hidden'>
                <div
                  className={`absolute top-0 left-0 h-full ${exercise.color} rounded-full transition-all duration-1000`}
                  style={{
                    width: '100%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
