'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FeaturesCTAProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

export function FeaturesCTA({
  title,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
}: FeaturesCTAProps) {
  const router = useRouter();

  return (
    <section className='py-20 lg:py-32 mb-32 lg:mb-40'>
      <div className='container mx-auto px-6 sm:px-8 lg:px-16'>
        <div className='max-w-4xl mx-auto text-center'>
          <Card className='bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-2xl'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-3xl sm:text-4xl text-white mb-4'>
                {title}
              </CardTitle>
              <CardDescription className='text-lg text-white/90'>
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  size='lg'
                  onClick={() => router.push(primaryButtonHref)}
                  className='bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-2xl font-semibold shadow-lg'
                >
                  {primaryButtonText}
                </Button>
                <Button
                  size='lg'
                  onClick={() => router.push(secondaryButtonHref)}
                  className='border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6 rounded-2xl'
                >
                  {secondaryButtonText}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
