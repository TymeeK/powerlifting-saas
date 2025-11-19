'use client';

import { Footer } from '@/components/footer';
import {
  FeaturesHero,
  FeatureSection,
  FeaturesCTA,
  PRTrackingDemo,
  WorkoutLoggingDemo,
} from '@/components/features';
import {
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  Award,
  Zap,
  Activity,
  Plus,
  Clock,
  Smartphone,
  Save,
  Dumbbell,
} from 'lucide-react';

export default function FeaturesPage() {
  const prTrackingFeatures = [
    {
      icon: Target,
      title: 'Track All Your Lifts',
      description:
        'Record personal records for squat, bench, deadlift, and any other exercise. Never lose track of your progress again.',
    },
    {
      icon: TrendingUp,
      title: 'Visual Progress Tracking',
      description:
        'See your strength gains over time with beautiful charts and graphs. Identify trends and celebrate milestones.',
    },
    {
      icon: Calendar,
      title: 'Historical Records',
      description:
        'Access your complete workout history. See when you hit each PR and track your journey from day one.',
    },
    {
      icon: Award,
      title: 'PR Notifications',
      description:
        'Get automatically notified when you break a personal record. Celebrate every achievement, big or small.',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description:
        'Analyze your performance with comprehensive statistics. Compare lifts, calculate volume, and identify patterns.',
    },
    {
      icon: Zap,
      title: 'Quick Entry',
      description:
        'Log your PRs in seconds with our mobile-optimized interface. No complicated forms, just quick and easy tracking.',
    },
  ];

  const workoutLoggingFeatures = [
    {
      icon: Plus,
      title: 'Quick Exercise Entry',
      description:
        'Add exercises to your workout in seconds. Search from your exercise history or create new ones on the fly.',
    },
    {
      icon: Dumbbell,
      title: 'Set & Rep Tracking',
      description:
        'Log sets, reps, and weights effortlessly. Our mobile-optimized interface makes it easy to track during your workout.',
    },
    {
      icon: Clock,
      title: 'Fast Workout Logging',
      description:
        'Record your entire workout in minutes, not hours. Spend less time logging and more time lifting.',
    },
    {
      icon: Save,
      title: 'Auto-Save Progress',
      description:
        'Never lose your data. Your workouts are automatically saved as you log them, so you can focus on your training.',
    },
    {
      icon: Activity,
      title: 'Workout History',
      description:
        'Access all your past workouts instantly. Review previous sessions, compare performance, and track your progress.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description:
        'Built for the gym. Our interface is optimized for mobile devices, making it easy to log workouts between sets.',
    },
  ];

  const prTrackingBenefits = [
    'Track unlimited exercises and lifts',
    'Automatic PR detection and tracking',
    'Beautiful visualizations and charts',
    'Mobile-first design for gym use',
    'Export your data anytime',
    'Privacy-focused with secure storage',
  ];

  const workoutLoggingBenefits = [
    'Log unlimited exercises per workout',
    'Quick access to past exercise data',
    'Intuitive set and rep entry',
    'Mobile-optimized for gym use',
    'Automatic PR detection',
    'Complete workout history tracking',
  ];

  const featureSections = [
    {
      icon: Target,
      title: 'PR Tracking',
      description:
        'Track your personal records across all major lifts with detailed progress analytics. Never forget a PR again.',
      features: prTrackingFeatures,
      demoTitle: 'See Your Progress at a Glance',
      demoDescription:
        'Our intuitive dashboard shows all your personal records in one place. Track multiple exercises, see your best lifts, and visualize your progress over time.',
      benefits: prTrackingBenefits,
      demo: <PRTrackingDemo />,
      reverse: false,
      background: 'default' as const,
    },
    {
      icon: Activity,
      title: 'Workout Logging',
      description:
        'Log your workouts quickly and easily with our mobile-friendly interface. Track exercises, sets, reps, and weights in seconds.',
      features: workoutLoggingFeatures,
      demoTitle: 'Log Workouts in Seconds',
      demoDescription:
        'Our streamlined interface makes it easy to log your entire workout quickly. Add exercises, record sets and reps, and save your session - all optimized for mobile use in the gym.',
      benefits: workoutLoggingBenefits,
      demo: <WorkoutLoggingDemo />,
      reverse: true,
      background: 'muted' as const,
    },
  ];

  return (
    <main className='min-h-screen bg-background flex flex-col'>
      <FeaturesHero
        icon={Target}
        title='Powerful Features'
        subtitle='For Serious Lifters'
        description='Everything you need to track your workouts, monitor your progress, and achieve your strength goals. Built for lifters, by lifters.'
        primaryButtonText='Get Started Free'
        primaryButtonHref='/signup'
        secondaryButtonText='View Dashboard'
        secondaryButtonHref='/dashboard'
      />

      {featureSections.map((section, index) => (
        <FeatureSection
          key={index}
          icon={section.icon}
          title={section.title}
          description={section.description}
          features={section.features}
          demoTitle={section.demoTitle}
          demoDescription={section.demoDescription}
          benefits={section.benefits}
          demo={section.demo}
          reverse={section.reverse}
          background={section.background}
        />
      ))}

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
