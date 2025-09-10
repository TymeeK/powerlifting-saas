'use client';

import { useEffect, useState } from 'react';
import {
  auth,
  saveWorkout,
  type WorkoutExercise,
  type UserExercise,
} from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Dumbbell,
  Target,
  Save,
} from 'lucide-react';

export default function WorkoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<{
    [exerciseId: string]: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>({});
  const [exercises, setExercises] = useState<UserExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user);

        // Start with empty exercises - no persistence between sessions
        setExercises([]);

        // Load sets from localStorage
        const savedSets = loadSetsFromStorage();
        setSets(savedSets);
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Save sets to localStorage whenever sets change
  useEffect(() => {
    if (Object.keys(sets).length > 0) {
      saveSetsToStorage(sets);
    }
  }, [sets]);

  // Helper function to get sets for a specific exercise
  const getExerciseSets = (exerciseId: string) => {
    return sets[exerciseId] || [];
  };

  // Save sets to localStorage
  const saveSetsToStorage = (setsData: typeof sets) => {
    try {
      localStorage.setItem('workoutSets', JSON.stringify(setsData));
    } catch (error) {
      console.error('Error saving sets to localStorage:', error);
    }
  };

  // Load sets from localStorage
  const loadSetsFromStorage = () => {
    try {
      const savedSets = localStorage.getItem('workoutSets');
      if (savedSets) {
        return JSON.parse(savedSets);
      }
    } catch (error) {
      console.error('Error loading sets from localStorage:', error);
    }
    return {};
  };

  const addSetForExercise = (exerciseId: string) => {
    setSets(prev => ({
      ...prev,
      [exerciseId]: [
        ...(prev[exerciseId] || []),
        { reps: 0, weight: 0, completed: false },
      ],
    }));
  };

  const updateSetForExercise = (
    exerciseId: string,
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    setSets(prev => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      ),
    }));
  };

  const toggleSetCompleteForExercise = (exerciseId: string, index: number) => {
    setSets(prev => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).map((set, i) =>
        i === index ? { ...set, completed: !set.completed } : set
      ),
    }));
  };

  const addExercise = () => {
    if (newExerciseName.trim() && newExerciseCategory.trim()) {
      const now = new Date();
      const newExercise: UserExercise = {
        id: Date.now().toString(),
        name: newExerciseName.trim(),
        category: newExerciseCategory.trim(),
        createdAt: now,
        updatedAt: now,
      };

      // Add to local state only - no persistence
      const updatedExercises = [...exercises, newExercise];
      setExercises(updatedExercises);
      setNewExerciseName('');
      setNewExerciseCategory('');
      setShowAddExercise(false);
    }
  };

  const deleteExercise = (id: string) => {
    // Update local state only - no persistence
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);

    // Remove sets for the deleted exercise
    setSets(prev => {
      const newSets = { ...prev };
      delete newSets[id];
      return newSets;
    });
  };

  const startEditExercise = (id: string) => {
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
      setNewExerciseName(exercise.name);
      setNewExerciseCategory(exercise.category);
      setEditingExercise(id);
      setShowAddExercise(true);
    }
  };

  const saveEditExercise = () => {
    if (
      editingExercise &&
      newExerciseName.trim() &&
      newExerciseCategory.trim()
    ) {
      // Update local state only - no persistence
      const updatedExercises = exercises.map(ex =>
        ex.id === editingExercise
          ? {
              ...ex,
              name: newExerciseName.trim(),
              category: newExerciseCategory.trim(),
            }
          : ex
      );
      setExercises(updatedExercises);
      setNewExerciseName('');
      setNewExerciseCategory('');
      setEditingExercise(null);
      setShowAddExercise(false);
    }
  };

  const cancelEdit = () => {
    setNewExerciseName('');
    setNewExerciseCategory('');
    setEditingExercise(null);
    setShowAddExercise(false);
  };

  const handleSaveWorkout = async () => {
    if (!user) {
      setSaveError('You must be logged in to save workouts');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Prepare workout data
      const workoutExercises: WorkoutExercise[] = exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: sets[exercise.id] || [],
      }));

      // Save to Firestore with 'end' state
      const result = await saveWorkout(user.uid, workoutExercises, 'end');

      if (result.success) {
        // Clear local storage
        localStorage.removeItem('workoutSets');

        // Clear sets state
        setSets({});

        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      setSaveError(error.message || 'Failed to save workout');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-purple-200'>Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Extract first name from displayName
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-full bg-purple-500/20'>
                <Dumbbell className='h-8 w-8 text-purple-400' />
              </div>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold text-white'>
                  Workout Session
                </h1>
                <p className='text-purple-200 text-lg'>
                  Ready to crush your fitness goals, {firstName}?
                </p>
              </div>
            </div>
            <Button
              onClick={handleSaveWorkout}
              disabled={isSaving}
              className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Save className='h-4 w-4 mr-2' />
              {isSaving ? 'Saving...' : 'Save Workout'}
            </Button>
          </div>
          <Separator className='bg-purple-500/20' />
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <Alert className='bg-green-500/10 border-green-500/30 mb-6'>
            <Check className='h-4 w-4' />
            <AlertDescription className='text-green-200'>
              Workout saved successfully! Your progress has been recorded.
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className='bg-red-500/10 border-red-500/30 mb-6'>
            <AlertDescription className='text-red-200'>
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Exercise Management Header */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-purple-500/20'>
                  <Target className='h-5 w-5 text-purple-400' />
                </div>
                <div>
                  <CardTitle className='text-white text-xl'>
                    Exercise Library
                  </CardTitle>
                  <CardDescription className='text-purple-200'>
                    Manage your exercises and track your workout progress
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowAddExercise(true)}
                size='sm'
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
              >
                <Plus className='h-4 w-4 mr-1' />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exercises.length > 0 ? (
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white font-semibold text-lg'>
                  Your Exercises:
                </h3>
                <Badge
                  variant='secondary'
                  className='bg-purple-500/20 text-purple-200 border-purple-500/30'
                >
                  {exercises.length} exercises
                </Badge>
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='text-purple-200 text-lg mb-4'>
                  No exercises added yet. Start your workout by adding
                  exercises!
                </div>
                <Button
                  onClick={() => setShowAddExercise(true)}
                  className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Your First Exercise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Exercise Modal */}
        {showAddExercise && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <Card className='bg-slate-800 border-white/20 w-full max-w-md'>
              <CardHeader>
                <CardTitle className='text-white'>
                  {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-white text-sm font-medium mb-2 block'>
                    Exercise Name
                  </label>
                  <input
                    type='text'
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    placeholder='e.g., Bench Press'
                    className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div>
                  <label className='text-white text-sm font-medium mb-2 block'>
                    Category
                  </label>
                  <input
                    type='text'
                    value={newExerciseCategory}
                    onChange={e => setNewExerciseCategory(e.target.value)}
                    placeholder='e.g., Chest, Legs, Back'
                    className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div className='flex space-x-3'>
                  <Button
                    onClick={editingExercise ? saveEditExercise : addExercise}
                    className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  >
                    <Check className='h-4 w-4 mr-2' />
                    {editingExercise ? 'Save Changes' : 'Add Exercise'}
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    variant='outline'
                    className='flex-1 border-white/20 text-white hover:bg-white/10'
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Individual Exercise Cards */}
        {exercises.length > 0 && (
          <div className='space-y-6'>
            {exercises.map((exercise, exerciseIndex) => {
              const exerciseSets = sets[exercise.id] || [];
              const completedSets = exerciseSets.filter(
                set => set.completed
              ).length;

              return (
                <Card
                  key={exercise.id}
                  className='bg-white/10 backdrop-blur-sm border-white/20'
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-purple-500/20'>
                          <Dumbbell className='h-5 w-5 text-purple-400' />
                        </div>
                        <div>
                          <CardTitle className='text-white text-xl'>
                            {exercise.name}
                          </CardTitle>
                          <CardDescription className='text-purple-200'>
                            {exercise.category}
                          </CardDescription>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='secondary'
                          className='bg-green-500/20 text-green-200 border-green-500/30'
                        >
                          {completedSets} / {exerciseSets.length} sets
                        </Badge>
                        <div className='flex space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => startEditExercise(exercise.id)}
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => deleteExercise(exercise.id)}
                            className='h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar for this exercise */}
                    {exerciseSets.length > 0 && (
                      <div className='mb-6'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-white font-semibold'>Progress</h3>
                          <Badge
                            variant='secondary'
                            className='bg-green-500/20 text-green-200 border-green-500/30'
                          >
                            {completedSets} / {exerciseSets.length} completed
                          </Badge>
                        </div>
                        <Progress
                          value={(completedSets / exerciseSets.length) * 100}
                          className='h-2 mb-4'
                        />
                      </div>
                    )}

                    {/* Sets for this exercise */}
                    <div className='space-y-3'>
                      {exerciseSets.map((set, setIndex) => (
                        <Card
                          key={setIndex}
                          className={`transition-all duration-200 ${
                            set.completed
                              ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <CardContent className='p-4'>
                            <div className='flex items-center space-x-4'>
                              <div className='flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500/30'>
                                <span className='text-white font-bold text-lg'>
                                  {setIndex + 1}
                                </span>
                              </div>

                              <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                  <label className='text-purple-200 text-sm font-medium block'>
                                    Reps
                                  </label>
                                  <input
                                    type='number'
                                    value={set.reps === 0 ? '' : set.reps}
                                    onChange={e =>
                                      updateSetForExercise(
                                        exercise.id,
                                        setIndex,
                                        'reps',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className='w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  />
                                </div>

                                <div className='space-y-2'>
                                  <label className='text-purple-200 text-sm font-medium block'>
                                    Weight (lbs)
                                  </label>
                                  <input
                                    type='number'
                                    value={set.weight === 0 ? '' : set.weight}
                                    onChange={e =>
                                      updateSetForExercise(
                                        exercise.id,
                                        setIndex,
                                        'weight',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className='w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  />
                                </div>
                              </div>

                              <Button
                                size='sm'
                                variant={set.completed ? 'default' : 'outline'}
                                onClick={() =>
                                  toggleSetCompleteForExercise(
                                    exercise.id,
                                    setIndex
                                  )
                                }
                                className={`${
                                  set.completed
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                                    : 'border-green-300 hover:border-green-500 hover:bg-green-500/10 text-green-400'
                                }`}
                              >
                                <Check className='h-4 w-4 mr-1' />
                                {set.completed ? 'Done' : 'Complete'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Add Set Button for this exercise */}
                    <Button
                      onClick={() => addSetForExercise(exercise.id)}
                      variant='outline'
                      className='w-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 mt-4'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Set
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
