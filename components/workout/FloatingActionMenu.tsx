import { Button } from '@/components/ui/button';
import { Plus, Save, List, X } from 'lucide-react';
import { buttonVariants } from '@/lib/button-variants';

interface FloatingActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSaveWorkout: () => void;
  onAddExercise: () => void;
  onShowPastExercises: () => void;
  isSaving: boolean;
  loadingPastExercises: boolean;
}

export default function FloatingActionMenu({
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onSaveWorkout,
  onAddExercise,
  onShowPastExercises,
  isSaving,
  loadingPastExercises,
}: FloatingActionMenuProps) {
  return (
    <div
      className='fixed bottom-6 right-6 z-40'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Sub-buttons */}
      <div
        className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Save Workout Button */}
        <Button
          onClick={onSaveWorkout}
          disabled={isSaving}
          size='lg'
          className={buttonVariants.floating.save}
          title='Save Workout'
        >
          <Save className='h-5 w-5' />
        </Button>

        {/* Add Exercise Button */}
        <Button
          onClick={onAddExercise}
          size='lg'
          className={buttonVariants.floating.add}
          title='Add Exercise'
        >
          <Plus className='h-5 w-5' />
        </Button>

        {/* Past Exercises Button */}
        <Button
          onClick={onShowPastExercises}
          disabled={loadingPastExercises}
          size='lg'
          className={buttonVariants.floating.past}
          title='Past Exercises'
        >
          <List className='h-5 w-5' />
        </Button>
      </div>

      {/* Main Floating Button */}
      <Button
        onClick={onToggle}
        size='lg'
        className={`${buttonVariants.floating.main} ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        {isOpen ? <X className='h-6 w-6' /> : <Plus className='h-6 w-6' />}
      </Button>
    </div>
  );
}
