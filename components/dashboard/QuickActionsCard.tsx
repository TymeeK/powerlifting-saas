import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function QuickActionsCard() {
  const router = useRouter();

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
      <CardHeader>
        <CardTitle className='text-white text-center text-xl'>
          Quick Actions
        </CardTitle>
        <CardDescription className='text-purple-200 text-center'>
          Start your fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Primary Action - Start Workout */}
        <div className='mb-6'>
          <Card
            className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-purple-500/25'
            onClick={() => router.push('/dashboard/workout')}
          >
            <CardContent className='text-center p-6'>
              <div className='text-4xl mb-3'>🏋️‍♂️</div>
              <div className='text-white font-bold text-xl mb-2'>
                Start Your Workout
              </div>
              <div className='text-purple-200 text-sm mb-3'>
                Ready to crush your fitness goals?
              </div>
              <div className='inline-flex items-center px-4 py-2 bg-purple-500/30 rounded-full text-white text-sm font-medium'>
                Click to begin →
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card
            className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
            onClick={() => router.push('/dashboard/past-workouts')}
          >
            <CardContent className='text-center p-4'>
              <div className='text-2xl mb-2'>📊</div>
              <div className='text-white font-semibold mb-1'>Past Workouts</div>
              <div className='text-xs text-purple-300'>View your history</div>
            </CardContent>
          </Card>
          <Card
            className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
            onClick={() => router.push('/dashboard/settings')}
          >
            <CardContent className='text-center p-4'>
              <div className='text-2xl mb-2'>⚙️</div>
              <div className='text-white font-semibold mb-1'>Settings</div>
              <div className='text-xs text-purple-300'>Manage your account</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
