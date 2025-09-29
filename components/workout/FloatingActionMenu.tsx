import { Button } from '@/components/ui/button';
import { Plus, Save, List, X } from 'lucide-react';
import { buttonVariants } from '@/lib/button-variants';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
  isHovering?: boolean;
}

const buttonConfigs = [
  {
    key: 'save',
    tooltip: 'Save Workout',
    onClick: () => {},
    children: <Save className='h-5 w-5' />,
    className: `${buttonVariants.floating.save} transition-all duration-200 hover:scale-110 hover:shadow-lg`,
  },
  {
    key: 'add',
    tooltip: 'Add Exercise',
    onClick: () => {},
    children: <Plus className='h-5 w-5' />,
    className: `${buttonVariants.floating.add} transition-all duration-200 hover:scale-110 hover:shadow-lg`,
  },
  {
    key: 'past',
    tooltip: 'Past Exercises',
    onClick: 'onShowPastExercises',

    className: `${buttonVariants.floating.past} transition-all duration-200 hover:scale-110 hover:shadow-lg`,
  },
];

// Reusable tooltip button component
const TooltipButton = ({
  children,
  tooltip,
  onClick,
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        onClick={onClick}
        disabled={disabled}
        size='lg'
        className={className}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

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
  isHovering = false,
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
        {Object.keys(tooltipContent).map(content => (
          <TooltipButton
            key={content}
            onClick={() => {}}
            tooltip={content}
            children={undefined}
            className={''}
          />
        ))}
        {/* Save Workout Button */}
        <TooltipButton
          onClick={onSaveWorkout}
          disabled={isSaving}
          tooltip={tooltipContent.save}
          className={`${buttonVariants.floating.save} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
        >
          <Save className='h-5 w-5' />
        </TooltipButton>

        {/* Add Exercise Button */}
        <TooltipButton
          onClick={onAddExercise}
          tooltip={tooltipContent.add}
          className={`${buttonVariants.floating.add} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
        >
          <Plus className='h-5 w-5' />
        </TooltipButton>

        {/* Past Exercises Button */}
        <TooltipButton
          onClick={onShowPastExercises}
          disabled={loadingPastExercises}
          tooltip={tooltipContent.past}
          className={`${buttonVariants.floating.past} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
        >
          <List className='h-5 w-5' />
        </TooltipButton>
      </div>

      {/* Main Floating Button */}
      <Button
        onClick={onToggle}
        size='lg'
        className={`${
          buttonVariants.floating.main
        } transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        {isOpen ? <X className='h-6 w-6' /> : <Plus className='h-6 w-6' />}
      </Button>
    </div>
  );
}
