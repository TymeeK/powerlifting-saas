'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

export default function LandingPage() {
  const router = useRouter();
  const { loading } = useRequireAuth('/dashboard', true);

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

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12'>
              <Card className='text-center sm:text-left'>
                <CardHeader className='pb-3'>
                  <div className='w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                    <span className='text-2xl'>📊</span>
                  </div>
                  <CardTitle>Track Progress</CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <CardDescription>
                    Monitor your lifts and see improvement over time
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='text-center sm:text-left'>
                <CardHeader className='pb-3'>
                  <div className='w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                    <span className='text-2xl'>📱</span>
                  </div>
                  <CardTitle>Mobile First</CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <CardDescription>
                    Designed for your phone, works everywhere
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='text-center sm:text-left'>
                <CardHeader className='pb-3'>
                  <div className='w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                    <span className='text-2xl'>⚡</span>
                  </div>
                  <CardTitle>Quick Logging</CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <CardDescription>
                    Log your sets in seconds, not minutes
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex -space-x-2'>
                <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-background'></div>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-background'></div>
                <div className='w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-background'></div>
              </div>
              <div>
                <Badge variant='outline' className='mb-2'>
                  500+ lifters tracking PRs
                </Badge>
                <p className='text-muted-foreground text-sm'>
                  "Finally, a PR tracker that works!" — Sarah M.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16'>
          <div className='relative w-full max-w-lg'>
            <Card className='shadow-2xl'>
              <CardHeader className='text-center'>
                <div className='text-6xl mb-4'>💪</div>
                <CardTitle className='text-2xl'>Your PR Dashboard</CardTitle>
                <CardDescription className='text-base'>
                  Track, analyze, and celebrate your gains
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-center'>
                      <span>Squat PR</span>
                      <Badge variant='secondary' className='font-bold text-lg'>
                        315 lbs
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-center'>
                      <span>Bench PR</span>
                      <Badge variant='secondary' className='font-bold text-lg'>
                        225 lbs
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-center'>
                      <span>Deadlift PR</span>
                      <Badge variant='secondary' className='font-bold text-lg'>
                        405 lbs
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <div className='absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-10 animate-pulse'></div>
            <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-10 animate-pulse delay-1000'></div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
