import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';

interface EmptyStateCardProps {
  onAddFirstExercise: () => void;
}

export default function EmptyStateCard({
  onAddFirstExercise,
}: EmptyStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-muted'>
              <Target className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <CardTitle className='text-xl'>Exercise Library</CardTitle>
              <CardDescription>
                Manage your exercises and track your workout progress
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-center py-8'>
          <div className='text-muted-foreground text-lg mb-4'>
            No exercises added yet. Start your workout by adding exercises!
          </div>
          <Button onClick={onAddFirstExercise}>
            <Plus className='h-4 w-4 mr-2' />
            Add Your First Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
