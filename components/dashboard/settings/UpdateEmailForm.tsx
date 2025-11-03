import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UpdateEmailFormProps {
  newEmail: string;
  password: string;
  onNewEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const UpdateEmailForm = ({
  newEmail,
  password,
  onNewEmailChange,
  onPasswordChange,
}: UpdateEmailFormProps) => {
  return (
    <>
      <div className='space-y-2'>
        <Label htmlFor='new-email'>New Email Address</Label>
        <Input
          id='new-email'
          type='email'
          value={newEmail}
          onChange={e => onNewEmailChange(e.target.value)}
          placeholder='Enter new email address'
          autoFocus
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='current-password'>Current Password</Label>
        <Input
          id='current-password'
          type='password'
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          placeholder='Enter your current password'
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        For security reasons, you must verify your identity with your current
        password to change your email address.
      </p>
    </>
  );
};
