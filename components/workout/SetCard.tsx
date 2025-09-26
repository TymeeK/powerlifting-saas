import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
import {
  buttonVariants,
  cardVariants,
  inputVariants,
} from '@/lib/button-variants';

interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

interface SetCardProps {
  set: Set;
  setIndex: number;
  exerciseId: string;
  onUpdateSet: (
    exerciseId: string,
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => void;
  onToggleComplete: (exerciseId: string, index: number) => void;
  onDeleteSet: (exerciseId: string, index: number) => void;
}

export default function SetCard({
  set,
  setIndex,
  exerciseId,
  onUpdateSet,
  onToggleComplete,
  onDeleteSet,
}: SetCardProps) {
  return (
    <div className='px-3 py-2'>
      <div className='flex items-end space-x-3'>
        <div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-purple-500/30 flex-shrink-0'>
          <span className='text-white font-bold text-base'>{setIndex + 1}</span>
        </div>

        <div className='flex-1 grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <label className='text-purple-200 text-xs font-medium block'>
              Weight (lbs)
            </label>
            <input
              type='number'
              value={set.weight === 0 ? '' : set.weight}
              onChange={e =>
                onUpdateSet(
                  exerciseId,
                  setIndex,
                  'weight',
                  parseInt(e.target.value) || 0
                )
              }
              className={inputVariants.number}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-purple-200 text-xs font-medium block'>
              Reps
            </label>
            <input
              type='number'
              value={set.reps === 0 ? '' : set.reps}
              onChange={e =>
                onUpdateSet(
                  exerciseId,
                  setIndex,
                  'reps',
                  parseInt(e.target.value) || 0
                )
              }
              className={inputVariants.number}
            />
          </div>
        </div>

        <Button
          size='sm'
          variant={set.completed ? 'default' : 'outline'}
          onClick={() => onToggleComplete(exerciseId, setIndex)}
          className={`${buttonVariants.setComplete(
            set.completed
          )} flex-shrink-0 w-10 h-10 p-0`}
        >
          <Check className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onDeleteSet(exerciseId, setIndex)}
          className={`${buttonVariants.delete} flex-shrink-0 w-10 h-10 p-0`}
        >
          <Trash className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    </div>
  );
}
