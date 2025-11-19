import { LucideIcon } from 'lucide-react';

interface FeatureSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureSectionHeader({
  icon: Icon,
  title,
  description,
}: FeatureSectionHeaderProps) {
  return (
    <div className='text-center mb-16'>
      <div className='mb-6 flex justify-center'>
        <div className='h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
          <Icon className='h-8 w-8 text-white' />
        </div>
      </div>
      <h2 className='text-3xl sm:text-4xl font-bold mb-4'>{title}</h2>
      <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
        {description}
      </p>
    </div>
  );
}
