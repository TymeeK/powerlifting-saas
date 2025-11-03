import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Dumbbell, List } from 'lucide-react';
import { buttonVariants, cardVariants } from '@/lib/button-variants';
import { formatLastUsed } from '@/lib/workout-utils';
import { PastExercise } from '@/lib/types/exercise';

interface PastExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: PastExercise[];
  loading: boolean;
  onAddExercise: (name: string) => void;
}

export default function PastExercisesModal({
  isOpen,
  onClose,
  exercises,
  loading,
  onAddExercise,
}: PastExercisesModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='bg-slate-800 border-white/20 w-full max-w-2xl max-h-[80vh] overflow-hidden'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-orange-500/20'>
                <List className='h-5 w-5 text-orange-400' />
              </div>
              <div>
                <CardTitle className='text-white text-xl'>
                  Past Exercises
                </CardTitle>
                <CardDescription className='text-gray-300'>
                  Select an exercise from your workout history
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant='ghost'
              size='sm'
              className={buttonVariants.close}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='overflow-y-auto max-h-[60vh]'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400'></div>
              <span className='ml-3 text-orange-200'>
                Loading past exercises...
              </span>
            </div>
          ) : exercises.length > 0 ? (
            <div className='space-y-3'>
              {exercises.map((exercise, index) => (
                <Card
                  key={index}
                  className={cardVariants.pastExercise}
                  onClick={() => onAddExercise(exercise.name)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-orange-500/20'>
                          <Dumbbell className='h-4 w-4 text-orange-400' />
                        </div>
                        <div>
                          <h3 className='text-white font-semibold text-lg'>
                            {exercise.name}
                          </h3>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-orange-200 text-sm'>
                          Used {exercise.totalWorkouts} time
                          {exercise.totalWorkouts !== 1 ? 's' : ''}
                        </div>
                        <div className='text-gray-400 text-xs'>
                          Last: {formatLastUsed(exercise.lastUsed)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='text-gray-400 text-lg mb-4'>
                No past exercises found. Start working out to build your
                exercise history!
              </div>
              <Button onClick={onClose} className={buttonVariants.action.past}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
