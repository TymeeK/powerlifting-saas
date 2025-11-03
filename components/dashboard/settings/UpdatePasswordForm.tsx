import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UpdatePasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export const UpdatePasswordForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
}: UpdatePasswordFormProps) => {
  return (
    <>
      <div className='space-y-2'>
        <Label htmlFor='current-password'>Current Password</Label>
        <Input
          id='current-password'
          type='password'
          value={currentPassword}
          onChange={e => onCurrentPasswordChange(e.target.value)}
          placeholder='Enter current password'
          autoFocus
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='new-password'>New Password</Label>
        <Input
          id='new-password'
          type='password'
          value={newPassword}
          onChange={e => onNewPasswordChange(e.target.value)}
          placeholder='Enter new password'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirm-password'>Confirm New Password</Label>
        <Input
          id='confirm-password'
          type='password'
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
          placeholder='Confirm new password'
        />
      </div>
    </>
  );
};
