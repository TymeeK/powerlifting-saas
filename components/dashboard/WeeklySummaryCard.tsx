import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkoutSummary } from '@/lib/types';

interface WeeklySummaryCardProps {
  data?: WorkoutSummary | null;
  loading?: boolean;
}

export default function WeeklySummaryCard({
  data,
  loading = false,
}: WeeklySummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            This Week's Summary
          </CardTitle>
          <CardDescription className='text-center'>
            Loading your fitness progress...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className='text-center p-6'>
                  <div className='text-3xl sm:text-4xl font-bold mb-2 animate-pulse'>
                    --
                  </div>
                  <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                    Loading...
                  </div>
                  <Badge variant='secondary'>--</Badge>
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
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            This Week's Summary
          </CardTitle>
          <CardDescription className='text-center'>
            No workout data available yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground py-8'>
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
    <Card>
      <CardHeader>
        <CardTitle className='text-center text-xl'>
          This Week's Summary
        </CardTitle>
        <CardDescription className='text-center'>
          Your fitness progress at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* This Week's Workouts */}
          <Card>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold mb-2'>
                {data.thisWeekWorkouts}
              </div>
              <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                Workouts This Week
              </div>
              <Badge variant='secondary'>{workoutChangeText}</Badge>
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold mb-2'>
                {data.personalRecords}
              </div>
              <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                Personal Records
              </div>
              <Badge variant='secondary'>{prChangeText}</Badge>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardContent className='text-center p-6'>
              <div className='text-3xl sm:text-4xl font-bold mb-2'>
                {data.currentStreak}
              </div>
              <div className='text-muted-foreground text-sm sm:text-base mb-2'>
                Day Streak
              </div>
              <Badge variant='secondary'>{streakText}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className='mt-6 pt-6 border-t'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-lg font-semibold mb-1'>
                {data.totalTime}h
              </div>
              <div className='text-xs text-muted-foreground'>Total Time</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold mb-1'>
                {data.caloriesBurned.toLocaleString()}
              </div>
              <div className='text-xs text-muted-foreground'>
                Calories Burned
              </div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold mb-1'>
                {data.goalProgress}%
              </div>
              <div className='text-xs text-muted-foreground mb-2'>
                Goal Progress
              </div>
              <Progress value={data.goalProgress} className='h-2' />
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold mb-1'>
                {data.activeDays}
              </div>
              <div className='text-xs text-muted-foreground'>Active Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
