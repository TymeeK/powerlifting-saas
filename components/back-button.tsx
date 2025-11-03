import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export default function BackToDashboardButton() {
  return (
    <Button
      variant='outline'
      size='sm'
      asChild
      className='text-muted-foreground hover:text-foreground'
    >
      <Link href='/dashboard'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Link>
    </Button>
  );
}
