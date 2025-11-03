import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, User, Lock, UserCircle } from 'lucide-react';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeText: string;
  contentText: string;
  buttonText: string;
  onButtonClick: () => void;
}

const SettingsCard = ({
  icon,
  title,
  description,
  badgeText,
  contentText,
  buttonText,
  onButtonClick,
}: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-muted'>{icon}</div>
            <div>
              <CardTitle className='text-muted-foreground'>{title}</CardTitle>
              <CardDescription className='text-muted-foreground'>
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge className='bg-muted text-muted-foreground border-muted/30'>
            {badgeText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>{contentText}</p>
        <Button className='mt-4 cursor-pointer' onClick={onButtonClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

interface SettingsCardsProps {
  user: {
    displayName?: string | null;
    email?: string | null;
  };
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setModalType: (type: 'email' | 'password' | 'name' | null) => void;
}

export const SettingsCards = ({
  user,
  setFirstName,
  setLastName,
  setModalType,
}: SettingsCardsProps) => {
  const settingsCards = [
    {
      icon: <UserCircle className='h-5 w-5 text-muted-foreground' />,
      title: 'Name',
      description: 'Update your first and last name',
      badgeText: 'Personal',
      contentText: `Name: ${user.displayName || 'Not set'}`,
      buttonText: 'Change Name',
      onButtonClick: () => {
        setFirstName(user.displayName?.split(' ')[0] || '');
        setLastName(user.displayName?.split(' ').slice(1).join(' ') || '');
        setModalType('name');
      },
    },
    {
      icon: <User className='h-5 w-5 text-muted-foreground' />,
      title: 'Account Information',
      description: 'Update your personal details',
      badgeText: 'Active',
      contentText: `Email: ${user.email}`,
      buttonText: 'Change Email',
      onButtonClick: () => setModalType('email'),
    },
    {
      icon: <Lock className='h-5 w-5 text-muted-foreground' />,
      title: 'Security',
      description: 'Update your password',
      badgeText: 'Protected',
      contentText: 'Password: ••••••••',
      buttonText: 'Change Password',
      onButtonClick: () => setModalType('password'),
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {settingsCards.map((card, index) => (
        <SettingsCard key={index} {...card} />
      ))}
    </div>
  );
};
