import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { buttonVariants, inputVariants } from '@/lib/button-variants';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  editingExercise?: {
    id: string;
    name: string;
  } | null;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  onSave,
  editingExercise,
}: AddExerciseModalProps) {
  const [name, setName] = useState(editingExercise?.name || '');
  const [error, setError] = useState<string | null>(null);

  // Update name when editingExercise changes
  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
    } else {
      setName('');
    }
  }, [editingExercise]);

  const handleSave = () => {
    // Validate the name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Exercise name is required');
      return;
    }

    // Call onSave with the trimmed name
    onSave(trimmedName);

    // Clear the form
    setName('');
    setError(null);
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='bg-slate-800 border-white/20 w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-white'>
            {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='text-red-400 text-sm bg-red-500/10 p-2 rounded'>
              {error}
            </div>
          )}

          <div>
            <label className='text-white text-sm font-medium mb-2 block'>
              Exercise Name
            </label>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder='e.g., Bench Press'
              className={inputVariants.text}
              autoFocus
            />
          </div>

          <div className='flex space-x-3'>
            <Button
              onClick={handleSave}
              className={`flex-1 ${buttonVariants.primary}`}
            >
              <Check className='h-4 w-4 mr-2' />
              {editingExercise ? 'Save Changes' : 'Add Exercise'}
            </Button>
            <Button
              onClick={handleClose}
              variant='outline'
              className='flex-1 border-white/20 text-black hover:text-white hover:bg-white/10 cursor-pointer font-medium text-sm'
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
