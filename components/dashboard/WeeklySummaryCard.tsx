import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function WeeklySummaryCard() {
  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
      <CardHeader>
        <CardTitle className='text-white text-center text-xl'>
          This Week's Summary
        </CardTitle>
        <CardDescription className='text-purple-200 text-center'>
          Your fitness progress at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* This Week's Workouts */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                4
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Workouts This Week
              </div>
              <Badge
                variant='secondary'
                className='bg-green-500/20 text-green-400 border-green-500/30'
              >
                +1 from last week
              </Badge>
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                12
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Personal Records
              </div>
              <Badge
                variant='secondary'
                className='bg-green-500/20 text-green-400 border-green-500/30'
              >
                +3 this month
              </Badge>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                7
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Day Streak
              </div>
              <Badge
                variant='secondary'
                className='bg-green-500/20 text-green-400 border-green-500/30'
              >
                Keep it up!
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className='mt-6 pt-6 border-t border-white/20'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>2.5h</div>
              <div className='text-xs text-purple-300'>Total Time</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>1,250</div>
              <div className='text-xs text-purple-300'>Calories Burned</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>85%</div>
              <div className='text-xs text-purple-300 mb-2'>Goal Progress</div>
              <Progress value={85} className='h-2' />
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>3</div>
              <div className='text-xs text-purple-300'>Active Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
