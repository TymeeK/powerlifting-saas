import { BenefitsList } from './BenefitsList';
import { ReactNode } from 'react';

interface FeatureDemoSectionProps {
  title: string;
  description: string;
  benefits: string[];
  demo: ReactNode;
  reverse?: boolean;
}

export function FeatureDemoSection({
  title,
  description,
  benefits,
  demo,
  reverse = false,
}: FeatureDemoSectionProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
      <div className={reverse ? 'order-2 lg:order-1' : ''}>
        <h3 className='text-2xl sm:text-3xl font-bold mb-6'>{title}</h3>
        <p className='text-lg text-muted-foreground mb-8'>{description}</p>
        <BenefitsList benefits={benefits} />
      </div>
      <div className={reverse ? 'order-1 lg:order-2 relative' : 'relative'}>
        {demo}
      </div>
    </div>
  );
}
