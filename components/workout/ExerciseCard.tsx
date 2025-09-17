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
import {
  buttonVariants,
  cardVariants,
  badgeVariants,
  inputVariants,
} from '@/lib/button-variants';
import SetCard from '@/components/workout/SetCard';

interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
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
  onEditExercise,
  onDeleteExercise,
}: ExerciseCardProps) {
  return (
    <Card className={cardVariants.main}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-purple-500/20'>
              <Dumbbell className='h-5 w-5 text-purple-400' />
            </div>
            <div>
              <CardTitle className='text-white text-xl'>
                {exercise.name}
              </CardTitle>
              <CardDescription className='text-purple-200'>
                {exercise.category}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className={badgeVariants.setCount}>
              {exerciseProgress.completed} / {exerciseProgress.total} sets
            </Badge>
            <div className='flex space-x-1'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onEditExercise(exercise.id)}
                className={buttonVariants.edit}
              >
                <Edit className='h-3 w-3' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onDeleteExercise(exercise.id)}
                className={buttonVariants.delete}
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar for this exercise */}
        {exerciseProgress.total > 0 && (
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-white font-semibold'>Progress</h3>
              <Badge variant='secondary' className={badgeVariants.setCount}>
                {exerciseProgress.completed} / {exerciseProgress.total}{' '}
                completed
              </Badge>
            </div>
            <Progress
              value={exerciseProgress.percentage}
              className='h-2 mb-4'
            />
          </div>
        )}

        {/* Sets for this exercise */}
        <div className='space-y-3'>
          {sets.map((set, setIndex) => (
            <SetCard
              key={setIndex}
              set={set}
              setIndex={setIndex}
              exerciseId={exercise.id}
              onUpdateSet={onUpdateSet}
              onToggleComplete={onToggleSetComplete}
            />
          ))}
        </div>

        {/* Add Set Button for this exercise */}
        <Button
          onClick={() => onAddSet(exercise.id)}
          variant='outline'
          className={buttonVariants.addSet}
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
