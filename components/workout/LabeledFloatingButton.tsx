import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface LabeledFloatingButtonProps {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  disabled?: boolean;
  className: string;
  title?: string;
  icon: ReactNode;
}

export default function LabeledFloatingButton({
  label,
  isOpen,
  onClick,
  disabled,
  className,
  title,
  icon,
}: LabeledFloatingButtonProps) {
  return (
    <div className='relative flex items-center justify-end'>
      <span
        className={`absolute right-14 text-sm font-medium text-white whitespace-nowrap px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm shadow-lg transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        {label}
      </span>
      <Button
        onClick={onClick}
        disabled={disabled}
        size='lg'
        className={className}
        title={title}
      >
        {icon}
      </Button>
    </div>
  );
}
