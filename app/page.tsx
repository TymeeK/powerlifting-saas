'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import {
  FeaturesGrid,
  PRTrackingDemo,
  FeaturesCTA,
} from '@/components/features';
import { BarChart3, Smartphone, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { loading } = useRequireAuth('/dashboard', true);

  const landingFeatures = [
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your lifts and see improvement over time',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Designed for your phone, works everywhere',
    },
    {
      icon: Zap,
      title: 'Quick Logging',
      description: 'Log your sets in seconds, not minutes',
    },
  ];

  if (loading) {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center bg-background px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-background flex flex-col'>
      <div className='flex flex-col lg:flex-row flex-1'>
        <div className='flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-16 pt-20 lg:pt-0'>
          <header className='mb-8'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mt-4'>
                <span className='text-white font-bold text-lg'>PR</span>
              </div>
              <div className='mt-4'>
                <h1 className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  PR Tracker
                </h1>
                <p className='text-muted-foreground text-sm'>
                  Fitness Companion
                </p>
              </div>
            </div>
          </header>
          <div className='max-w-2xl'>
            <div className='mb-8'>
              <h2 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                Track Your
                <span className='block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                  Lifting PRs
                </span>
                Like a Pro
              </h2>
              <p className='text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed'>
                A clean, mobile-friendly dashboard for your squat, bench, and
                deadlift progress. Log lifts in seconds. Get insights
                automatically.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 mb-12'>
              <Button
                size='lg'
                onClick={() => router.push('/signup')}
                className='hover:cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-4 rounded-2xl'
              >
                Start Tracking Now
              </Button>
            </div>

            <div className='mb-12'>
              <FeaturesGrid features={landingFeatures} />
            </div>
          </div>
        </div>

        <div className='flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16'>
          <PRTrackingDemo />
        </div>
      </div>

      <FeaturesCTA
        title='Ready to Start Your Fitness Journey?'
        description='Join thousands of lifters who are already tracking their progress with PR Tracker.'
        primaryButtonText='Get Started Free'
        primaryButtonHref='/signup'
        secondaryButtonText='Sign In'
        secondaryButtonHref='/login'
      />

      <Footer />
    </main>
  );
}
