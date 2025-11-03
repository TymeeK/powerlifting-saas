import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Edit, Trash2, Plus, Check } from 'lucide-react';
import SetCard from '@/components/workout/SetCard';

interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
}

interface ExerciseProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  sets: Set[];
  exerciseProgress: ExerciseProgress;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => void;
  onToggleSetComplete: (exerciseId: string, index: number) => void;
  onDeleteSet: (exerciseId: string, index: number) => void;
  onEditExercise: (id: string) => void;
  onDeleteExercise: (id: string) => void;
}

export default function ExerciseCard({
  exercise,
  sets,
  exerciseProgress,
  onAddSet,
  onUpdateSet,
  onToggleSetComplete,
  onDeleteSet,
  onEditExercise,
  onDeleteExercise,
}: ExerciseCardProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
            <div className='p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0'>
              <Dumbbell className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground' />
            </div>
            <div className='min-w-0 flex-1'>
              <CardTitle className='text-lg sm:text-xl truncate'>
                {exercise.name}
              </CardTitle>
            </div>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
            <Badge
              variant='secondary'
              className='text-xs px-2 py-1 hidden sm:inline-flex'
            >
              {exerciseProgress.completed} / {exerciseProgress.total}
            </Badge>
            <div className='flex space-x-1'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onEditExercise(exercise.id)}
                className='h-7 w-7 sm:h-8 sm:w-8'
              >
                <Edit className='h-3 w-3' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onDeleteExercise(exercise.id)}
                className='h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive'
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar for this exercise - more compact */}
        {exerciseProgress.total > 0 && (
          <div className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold text-sm sm:text-base'>Progress</h3>
              <Badge
                variant='secondary'
                className='text-xs px-2 py-1 sm:hidden'
              >
                {exerciseProgress.completed} / {exerciseProgress.total}
              </Badge>
            </div>
            <Progress
              value={exerciseProgress.percentage}
              className='h-1.5 mb-3'
            />
          </div>
        )}

        {/* Sets for this exercise - reduced spacing */}
        <div className='space-y-2'>
          {sets.map((set, setIndex) => (
            <SetCard
              key={setIndex}
              set={set}
              setIndex={setIndex}
              exerciseId={exercise.id}
              onUpdateSet={onUpdateSet}
              onToggleComplete={onToggleSetComplete}
              onDeleteSet={onDeleteSet}
            />
          ))}
        </div>

        {/* Add Set Button for this exercise - more compact */}
        <Button
          onClick={() => onAddSet(exercise.id)}
          variant='outline'
          className='mt-3 text-sm py-2 w-full'
        >
          <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
