import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
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
}

export default function SetCard({
  set,
  setIndex,
  exerciseId,
  onUpdateSet,
  onToggleComplete,
}: SetCardProps) {
  return (
    <Card
      className={`transition-all duration-200 ${cardVariants.set(
        set.completed
      )}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500/30'>
            <span className='text-white font-bold text-lg'>{setIndex + 1}</span>
          </div>

          <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-purple-200 text-sm font-medium block'>
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

            <div className='space-y-2'>
              <label className='text-purple-200 text-sm font-medium block'>
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
            className={buttonVariants.setComplete(set.completed)}
          >
            <Check className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
