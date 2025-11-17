import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExerciseStats } from '@/lib/types';

interface ExerciseChartCardProps {
  exercise: ExerciseStats;
}

export default function ExerciseChartCard({
  exercise,
}: ExerciseChartCardProps) {
  return (
    <Card className='relative overflow-hidden'>
      <CardHeader>
        <CardTitle className='text-lg sm:text-xl'>{exercise.name}</CardTitle>
        <CardDescription>
          {exercise.currentPR > 0 ? (
            <>Current PR: {exercise.currentPR} lbs</>
          ) : (
            'No PR set yet'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Weekly Progress Chart */}
        {exercise.weeklyProgress.length > 0 ? (
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Weekly Progress</h4>
            <div className='space-y-2'>
              {exercise.weeklyProgress.map((week, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='text-muted-foreground'>{week.week}</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{week.weight} lbs</span>
                    <Badge variant='outline' className='text-xs'>
                      {week.reps} reps
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Weekly Progress</h4>
            <p className='text-xs text-muted-foreground'>
              Complete workouts over multiple weeks to see progress
            </p>
          </div>
        )}

        <Separator />

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-muted-foreground'>Previous PR</p>
            <p className='font-medium'>{exercise.previousPR} lbs</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Monthly Volume</p>
            <p className='font-medium'>
              {exercise.monthlyVolume.toLocaleString()}
            </p>
          </div>
          <div>
            <p className='text-muted-foreground'>Last Workout</p>
            <p className='font-medium'>
              {new Date(exercise.lastWorkout).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        {exercise.currentPR > 0 && (
          <div className='space-y-2'>
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Weight Progression</span>
              <span>
                {exercise.previousPR} → {exercise.currentPR} lbs
              </span>
            </div>
            <div className='relative h-2 bg-muted rounded-full overflow-hidden'>
              <div
                className={`absolute top-0 left-0 h-full ${exercise.color} rounded-full transition-all duration-1000`}
                style={{
                  width: '100%',
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
