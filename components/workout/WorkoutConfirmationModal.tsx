import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { buttonVariants } from '@/lib/button-variants';
import { getOrdinalSuffix } from '@/lib/workout-utils';

interface WorkoutConfirmationModalProps {
  isOpen: boolean;
  workoutCount: number | null;
  onStartNewWorkout: () => void;
  onBackToDashboard: () => void;
}

export default function WorkoutConfirmationModal({
  isOpen,
  workoutCount,
  onStartNewWorkout,
  onBackToDashboard,
}: WorkoutConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='bg-slate-800 border-white/20 w-full max-w-md'>
        <CardContent className='p-8 text-center'>
          <div className='mb-6'>
            <div className='w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Check className='h-10 w-10 text-green-400' />
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Congratulations! 🎉
            </h2>
            <p className='text-purple-200 text-lg'>
              That's your {workoutCount}
              {getOrdinalSuffix(workoutCount || 0)} workout!
            </p>
          </div>

          <div className='space-y-3'>
            <Button
              onClick={onStartNewWorkout}
              className={`w-full ${buttonVariants.primary}`}
            >
              Start New Workout
            </Button>
            <Button
              onClick={onBackToDashboard}
              variant='outline'
              className='w-full border-white/20 text-white hover:bg-white/10 cursor-pointer'
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
