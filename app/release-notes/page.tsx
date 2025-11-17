'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  BarChart3,
  Calendar,
  Settings,
  TrendingUp,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackToDashboardButton from '@/components/back-button';

const features = [
  {
    icon: Dumbbell,
    title: 'Workout Logging',
    description:
      'Quick and intuitive workout logging with mobile-friendly interface. Add exercises, track sets, reps, and weights effortlessly.',
    highlights: [
      'Add custom exercises to your library',
      'Track multiple sets with weight and rep tracking',
      'Auto-save workout progress',
      'Quick access to past exercises',
      'Workout confirmation and progress tracking',
    ],
  },
  {
    icon: Calendar,
    title: 'Past Workouts',
    description:
      'View your complete workout history with detailed statistics. Track your progress over time and celebrate your achievements.',
    highlights: [
      'Complete workout history',
      'Personal record tracking',
      'Total volume and duration tracking',
      'Exercise-by-exercise breakdown',
      'Workout statistics overview',
    ],
  },
  {
    icon: BarChart3,
    title: 'Progress Charts',
    description:
      'Visualize your strength gains with comprehensive charts and insights. Track your progress across all exercises.',
    highlights: [
      'Individual exercise progression charts',
      'PR tracking and improvement percentages',
      'Weekly progress visualization',
      'Monthly volume tracking',
      'Strength progression overview',
      'Pagination for multiple exercises',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Weekly Summary',
    description:
      'Get insights into your weekly progress, workout counts, and achievements. Stay motivated with your fitness journey.',
    highlights: [
      'Weekly workout count',
      'Progress tracking',
      'Achievement highlights',
    ],
  },
  {
    icon: Settings,
    title: 'User Settings',
    description:
      'Manage your account settings with ease. Update your profile information and preferences.',
    highlights: [
      'Update display name',
      'Change email address',
      'Update password',
      'Secure account management',
    ],
  },
  {
    icon: Zap,
    title: 'Dashboard',
    description:
      'Your central hub for all fitness activities. Quick access to workouts, charts, and settings.',
    highlights: [
      'User profile overview',
      'Quick action cards',
      'Weekly summary at a glance',
      'Easy navigation to all features',
    ],
  },
];

const technicalFeatures = [
  {
    title: 'Mobile-First Design',
    description: 'Optimized for all devices and screen sizes',
  },
  {
    title: 'Real-time Sync',
    description: 'Instant synchronization with Firebase',
  },
  {
    title: 'Secure Authentication',
    description: 'Firebase Auth with email/password',
  },
  {
    title: 'Data Persistence',
    description: 'Automatic workout state saving',
  },
];

export default function ReleaseNotesPage() {
  return (
    <div className='container mx-auto p-6 space-y-6 max-w-5xl'>
      <BackToDashboardButton />

      {/* Header */}
      <div className='space-y-4 mt-6'>
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500'>
            <Sparkles className='h-8 w-8 text-white' />
          </div>
          <div>
            <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Release Notes
            </h1>
            <p className='text-muted-foreground text-lg mt-2'>
              MVP Launch - Everything you need to track your fitness journey
            </p>
          </div>
        </div>
        <Badge className='bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
          Version 1.0.0 - MVP
        </Badge>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-500' />
            Welcome to PR Tracker MVP!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground leading-relaxed'>
            We're excited to launch the MVP version of PR Tracker! This release
            includes all the core features you need to start tracking your
            personal records and workout progress. Built with Next.js and
            Firebase, PR Tracker provides a clean, mobile-friendly experience
            for powerlifters and fitness enthusiasts.
          </p>
        </CardContent>
      </Card>

      {/* Main Features */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Core Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className='flex flex-col h-full'>
                <CardHeader>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='p-2 rounded-lg bg-muted'>
                      <Icon className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <CardTitle className='text-xl'>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <p className='text-muted-foreground mb-4'>
                    {feature.description}
                  </p>
                  <ul className='space-y-2 flex-1'>
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className='flex items-start gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                        <span className='text-sm text-muted-foreground'>
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technical Features */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Technical Highlights
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {technicalFeatures.map((feature, index) => (
            <Card key={index}>
              <CardContent className='p-6'>
                <h3 className='font-semibold mb-2'>{feature.title}</h3>
                <p className='text-sm text-muted-foreground'>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className='bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'>
        <CardContent className='p-8 text-center'>
          <h3 className='text-2xl font-bold mb-3'>Ready to Get Started?</h3>
          <p className='text-muted-foreground mb-6'>
            Start tracking your workouts and see your progress grow!
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              asChild
            >
              <Link href='/dashboard/workout'>Start Your First Workout</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/dashboard'>Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className='text-center text-sm text-muted-foreground py-6'>
        <p>
          Thank you for being part of PR Tracker! We're constantly working on
          improvements and new features.
        </p>
      </div>
    </div>
  );
}
