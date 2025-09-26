import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WeeklySummaryData {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisMonthWorkouts: number;
  totalWorkouts: number;
  personalRecords: number;
  currentStreak: number;
  totalTime: number;
  caloriesBurned: number;
  goalProgress: number;
  activeDays: number;
  totalVolume: number;
  lastWorkoutDate: Date | null;
}

interface WeeklySummaryCardProps {
  data?: WeeklySummaryData | null;
  loading?: boolean;
}

export default function WeeklySummaryCard({
  data,
  loading = false,
}: WeeklySummaryCardProps) {
  if (loading) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
        <CardHeader>
          <CardTitle className='text-white text-center text-xl'>
            This Week's Summary
          </CardTitle>
          <CardDescription className='text-purple-200 text-center'>
            Loading your fitness progress...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map(i => (
              <Card key={i} className='bg-white/5 border-white/10'>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold text-white mb-2 animate-pulse'>
                    --
                  </div>
                  <div className='text-purple-200 text-sm sm:text-base mb-2'>
                    Loading...
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-gray-500/20 text-gray-400 border-gray-500/30'
                  >
                    --
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
        <CardHeader>
          <CardTitle className='text-white text-center text-xl'>
            This Week's Summary
          </CardTitle>
          <CardDescription className='text-purple-200 text-center'>
            No workout data available yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center text-purple-200 py-8'>
            Start your first workout to see your progress here!
          </div>
        </CardContent>
      </Card>
    );
  }

  const workoutChange = data.thisWeekWorkouts - data.lastWeekWorkouts;
  const workoutChangeText =
    workoutChange > 0
      ? `+${workoutChange} from last week`
      : workoutChange < 0
      ? `${workoutChange} from last week`
      : 'Same as last week';

  const prChange = data.personalRecords;
  const prChangeText =
    prChange > 0 ? `+${prChange} this month` : 'No PRs this month';

  const streakText =
    data.currentStreak > 0 ? 'Keep it up!' : 'Start your streak!';

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
                {data.thisWeekWorkouts}
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Workouts This Week
              </div>
              <Badge
                variant='secondary'
                className={`${
                  workoutChange > 0
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : workoutChange < 0
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}
              >
                {workoutChangeText}
              </Badge>
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                {data.personalRecords}
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Personal Records
              </div>
              <Badge
                variant='secondary'
                className={`${
                  data.personalRecords > 0
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}
              >
                {prChangeText}
              </Badge>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                {data.currentStreak}
              </div>
              <div className='text-purple-200 text-sm sm:text-base mb-2'>
                Day Streak
              </div>
              <Badge
                variant='secondary'
                className={`${
                  data.currentStreak > 0
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}
              >
                {streakText}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className='mt-6 pt-6 border-t border-white/20'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>
                {data.totalTime}h
              </div>
              <div className='text-xs text-purple-300'>Total Time</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>
                {data.caloriesBurned.toLocaleString()}
              </div>
              <div className='text-xs text-purple-300'>Calories Burned</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>
                {data.goalProgress}%
              </div>
              <div className='text-xs text-purple-300 mb-2'>Goal Progress</div>
              <Progress value={data.goalProgress} className='h-2' />
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold text-white mb-1'>
                {data.activeDays}
              </div>
              <div className='text-xs text-purple-300'>Active Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
