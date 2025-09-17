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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card
            className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
            onClick={() => router.push('/dashboard/workout')}
          >
            <CardContent className='text-center p-4'>
              <div className='text-2xl mb-2'>🏋️</div>
              <div className='text-white font-semibold mb-1'>Start Workout</div>
              <div className='text-xs text-purple-300'>Track your session</div>
            </CardContent>
          </Card>
          <Card
            className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
            onClick={() => router.push('/dashboard/charts')}
          >
            <CardContent className='text-center p-4'>
              <div className='text-2xl mb-2'>📊</div>
              <div className='text-white font-semibold mb-1'>View Progress</div>
              <div className='text-xs text-purple-300'>See your stats</div>
            </CardContent>
          </Card>
          <Card
            className='bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
            onClick={() => router.push('/dashboard/settings')}
          >
            <CardContent className='text-center p-4'>
              <div className='text-2xl mb-2'>🎯</div>
              <div className='text-white font-semibold mb-1'>Settings</div>
              <div className='text-xs text-purple-300'>Manage your account</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
