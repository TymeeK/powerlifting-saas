import { CheckCircle2 } from 'lucide-react';

interface BenefitsListProps {
  benefits: string[];
}

export function BenefitsList({ benefits }: BenefitsListProps) {
  return (
    <div className='space-y-4'>
      {benefits.map((benefit, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <CheckCircle2 className='h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5' />
          <p className='text-base text-foreground'>{benefit}</p>
        </div>
      ))}
    </div>
  );
}
