import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UpdateNameFormProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export const UpdateNameForm = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: UpdateNameFormProps) => {
  return (
    <>
      <div className='space-y-2'>
        <Label htmlFor='first-name'>First Name</Label>
        <Input
          id='first-name'
          type='text'
          value={firstName}
          onChange={e => onFirstNameChange(e.target.value)}
          placeholder='Enter first name'
          autoFocus
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='last-name'>Last Name</Label>
        <Input
          id='last-name'
          type='text'
          value={lastName}
          onChange={e => onLastNameChange(e.target.value)}
          placeholder='Enter last name'
        />
      </div>
    </>
  );
};
