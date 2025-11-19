import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award } from 'lucide-react';

export function PRTrackingDemo() {
  return (
    <div className='relative'>
      <Card className='shadow-2xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl mb-2'>Your Personal Records</CardTitle>
          <CardDescription>
            Track and celebrate every achievement
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center'>
                    <TrendingUp className='h-5 w-5 text-purple-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Squat</p>
                    <p className='text-sm text-muted-foreground'>
                      Personal Best
                    </p>
                  </div>
                </div>
                <Badge
                  variant='secondary'
                  className='font-bold text-lg bg-purple-500/10 text-purple-700 dark:text-purple-300'
                >
                  315 lbs
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center'>
                    <Target className='h-5 w-5 text-pink-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Bench Press</p>
                    <p className='text-sm text-muted-foreground'>
                      Personal Best
                    </p>
                  </div>
                </div>
                <Badge
                  variant='secondary'
                  className='font-bold text-lg bg-pink-500/10 text-pink-700 dark:text-pink-300'
                >
                  225 lbs
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center'>
                    <Award className='h-5 w-5 text-blue-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Deadlift</p>
                    <p className='text-sm text-muted-foreground'>
                      Personal Best
                    </p>
                  </div>
                </div>
                <Badge
                  variant='secondary'
                  className='font-bold text-lg bg-blue-500/10 text-blue-700 dark:text-blue-300'
                >
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
  );
}
