import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Trash } from 'lucide-react';
import { WorkoutSet } from '@/lib/types/workout';

interface SetCardProps {
  set: WorkoutSet;
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
      <div className='grid grid-cols-[auto_1fr_1fr_auto_auto] items-end gap-2 sm:gap-4'>
        <div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-border bg-muted'>
          <span className='font-bold text-base'>{setIndex + 1}</span>
        </div>

        <div className='flex flex-col space-y-1 min-w-0'>
          <Label className='text-xs font-medium'>Weight</Label>
          <Input
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
            className='w-full min-w-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          />
        </div>

        <div className='flex flex-col space-y-1 min-w-0'>
          <Label className='text-xs font-medium'>Reps</Label>
          <Input
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
            className='w-full min-w-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          />
        </div>

        <Button
          size='sm'
          variant={set.completed ? 'default' : 'outline'}
          onClick={() => onToggleComplete(exerciseId, setIndex)}
          className='w-10 h-10 p-0'
        >
          <Check className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onDeleteSet(exerciseId, setIndex)}
          className='w-10 h-10 p-0 text-destructive hover:text-destructive'
        >
          <Trash className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
