import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dumbbell, Activity, Zap } from 'lucide-react';

export function WorkoutLoggingDemo() {
  return (
    <div className='relative'>
      <Card className='shadow-2xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl mb-2'>Today's Workout</CardTitle>
          <CardDescription>Quick and easy workout logging</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center'>
                    <Dumbbell className='h-5 w-5 text-purple-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Bench Press</p>
                  </div>
                </div>
              </div>
              <div className='space-y-2 ml-14'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 1</span>
                  <span className='font-medium'>225 lbs × 5</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 2</span>
                  <span className='font-medium'>225 lbs × 5</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 3</span>
                  <span className='font-medium'>225 lbs × 5</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center'>
                    <Activity className='h-5 w-5 text-pink-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Squat</p>
                  </div>
                </div>
              </div>
              <div className='space-y-2 ml-14'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 1</span>
                  <span className='font-medium'>315 lbs × 3</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 2</span>
                  <span className='font-medium'>315 lbs × 3</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center'>
                    <Zap className='h-5 w-5 text-blue-500' />
                  </div>
                  <div>
                    <p className='font-semibold'>Deadlift</p>
                  </div>
                </div>
              </div>
              <div className='space-y-2 ml-14'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Set 1</span>
                  <span className='font-medium'>405 lbs × 1</span>
                </div>
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
