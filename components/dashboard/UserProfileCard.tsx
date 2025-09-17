import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileCardProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
      <CardContent className='flex items-center justify-center p-6'>
        <div className='flex items-center space-x-4'>
          <Avatar className='h-16 w-16 border-2 border-white/20'>
            <AvatarImage src={user.photoURL || ''} alt={firstName} />
            <AvatarFallback className='bg-purple-500 text-white text-xl font-semibold'>
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='text-center'>
            <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>
              Welcome back, {firstName}!
            </h1>
            <p className='text-purple-200 text-sm sm:text-base'>
              Ready to crush your fitness goals today?
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
