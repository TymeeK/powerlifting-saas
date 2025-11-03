import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Trash } from 'lucide-react';

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
        <div className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-border bg-muted flex-shrink-0'>
          <span className='font-bold text-base'>{setIndex + 1}</span>
        </div>

        <div className='flex-1 grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <Label className='text-xs font-medium'>Weight (lbs)</Label>
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
              className='text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>

          <div className='space-y-1'>
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
              className='text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>
        </div>

        <Button
          size='sm'
          variant={set.completed ? 'default' : 'outline'}
          onClick={() => onToggleComplete(exerciseId, setIndex)}
          className='flex-shrink-0 w-10 h-10 p-0'
        >
          <Check className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onDeleteSet(exerciseId, setIndex)}
          className='flex-shrink-0 w-10 h-10 p-0 text-destructive hover:text-destructive'
        >
          <Trash className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
