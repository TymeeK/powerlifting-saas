import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export default function BackButton() {
  return (
    <Button
      variant='outline'
      size='sm'
      asChild
      className='border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-200'
    >
      <Link href='/dashboard'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Link>
    </Button>
  );
}
