'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface FeaturesHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export function FeaturesHero({
  icon: Icon,
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
}: FeaturesHeroProps) {
  const router = useRouter();

  return (
    <section className='w-full bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 py-20 lg:py-32'>
      <div className='container mx-auto px-6 sm:px-8 lg:px-16'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='mb-8 flex justify-center'>
            <div className='h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl'>
              <Icon className='h-10 w-10 text-white' />
            </div>
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
            {title}
            <span className='block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2'>
              {subtitle}
            </span>
          </h1>
          <p className='text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto'>
            {description}
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              onClick={() => router.push(primaryButtonHref)}
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-6 rounded-2xl'
            >
              {primaryButtonText}
            </Button>
            {secondaryButtonText && secondaryButtonHref && (
              <Button
                size='lg'
                variant='outline'
                onClick={() => router.push(secondaryButtonHref)}
                className='border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-lg px-8 py-6 rounded-2xl'
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
