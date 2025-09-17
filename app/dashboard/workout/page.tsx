'use client';

import { useEffect, useState } from 'react';
import {
  auth,
  saveWorkout,
  getPastExercises,
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
  X,
  List,
} from 'lucide-react';

// Import reusable components and utilities
import AddExerciseModal from '@/components/workout/AddExerciseModal';
import PastExercisesModal from '@/components/workout/PastExercisesModal';
import FloatingActionMenu from '@/components/workout/FloatingActionMenu';
import {
  buttonVariants,
  inputVariants,
  cardVariants,
  badgeVariants,
} from '@/lib/button-variants';
import {
  type WorkoutState,
  type ModalState,
  type FormState,
  type LoadingState,
  type ErrorState,
  saveSetsToStorage,
  loadSetsFromStorage,
  createNewExercise,
  addSetToExercise,
  updateSetInExercise,
  toggleSetComplete,
  getExerciseProgress,
  getOrdinalSuffix,
} from '@/lib/workout-utils';

export default function WorkoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Grouped state management
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    exercises: [],
    sets: {},
  });

  const [modalState, setModalState] = useState<ModalState>({
    showAddExercise: false,
    showPastExercises: false,
    showConfirmation: false,
    editingExercise: null,
  });

  const [formState, setFormState] = useState<FormState>({
    newExerciseName: '',
    newExerciseCategory: '',
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isSaving: false,
    loadingPastExercises: false,
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    saveError: null,
    saveSuccess: false,
  });

  const [workoutCount, setWorkoutCount] = useState<number | null>(null);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [isHoveringFloatingButton, setIsHoveringFloatingButton] =
    useState(false);
  const [pastExercises, setPastExercises] = useState<
    Array<{
      name: string;
      category: string;
      lastUsed: Date;
      totalWorkouts: number;
    }>
  >([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user);

        // Start with empty exercises - no persistence between sessions
        setWorkoutState(prev => ({ ...prev, exercises: [] }));

        // Load sets from localStorage
        const savedSets = loadSetsFromStorage();
        setWorkoutState(prev => ({ ...prev, sets: savedSets }));
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
    if (Object.keys(workoutState.sets).length > 0) {
      saveSetsToStorage(workoutState.sets);
    }
  }, [workoutState.sets]);

  // Helper function to get sets for a specific exercise
  const getExerciseSets = (exerciseId: string) => {
    return workoutState.sets[exerciseId] || [];
  };

  const addSetForExercise = (exerciseId: string) => {
    setWorkoutState(prev => ({
      ...prev,
      sets: addSetToExercise(prev.sets, exerciseId),
    }));
  };

  const updateSetForExercise = (
    exerciseId: string,
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    setWorkoutState(prev => ({
      ...prev,
      sets: updateSetInExercise(prev.sets, exerciseId, index, field, value),
    }));
  };

  const toggleSetCompleteForExercise = (exerciseId: string, index: number) => {
    setWorkoutState(prev => ({
      ...prev,
      sets: toggleSetComplete(prev.sets, exerciseId, index),
    }));
  };

  const handleAddExercise = (name: string, category: string) => {
    const newExercise = createNewExercise(name, category);
    setWorkoutState(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    setModalState(prev => ({
      ...prev,
      showAddExercise: false,
      editingExercise: null,
    }));
  };

  const handleEditExercise = (name: string, category: string) => {
    if (modalState.editingExercise) {
      setWorkoutState(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === modalState.editingExercise
            ? { ...ex, name: name.trim(), category: category.trim() }
            : ex
        ),
      }));
      setModalState(prev => ({
        ...prev,
        showAddExercise: false,
        editingExercise: null,
      }));
    }
  };

  const deleteExercise = (id: string) => {
    setWorkoutState(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id),
      sets: (() => {
        const newSets = { ...prev.sets };
        delete newSets[id];
        return newSets;
      })(),
    }));
  };

  const startEditExercise = (id: string) => {
    const exercise = workoutState.exercises.find(ex => ex.id === id);
    if (exercise) {
      setFormState({
        newExerciseName: exercise.name,
        newExerciseCategory: exercise.category,
      });
      setModalState(prev => ({
        ...prev,
        editingExercise: id,
        showAddExercise: true,
      }));
    }
  };

  const loadPastExercises = async () => {
    if (!user) return;

    setLoadingState(prev => ({ ...prev, loadingPastExercises: true }));
    try {
      const result = await getPastExercises(user.uid);
      if (result.success) {
        setPastExercises(result.exercises);
        setModalState(prev => ({ ...prev, showPastExercises: true }));
      }
    } catch (error: any) {
      console.error('Error loading past exercises:', error);
      setErrorState(prev => ({
        ...prev,
        saveError: 'Failed to load past exercises',
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, loadingPastExercises: false }));
    }
  };

  const addPastExerciseToWorkout = (
    exerciseName: string,
    exerciseCategory: string
  ) => {
    const newExercise = createNewExercise(exerciseName, exerciseCategory);
    setWorkoutState(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    setModalState(prev => ({ ...prev, showPastExercises: false }));
  };

  const handleSaveWorkout = async () => {
    if (!user) {
      setErrorState(prev => ({
        ...prev,
        saveError: 'You must be logged in to save workouts',
      }));
      return;
    }

    setLoadingState(prev => ({ ...prev, isSaving: true }));
    setErrorState(prev => ({ ...prev, saveError: null, saveSuccess: false }));

    try {
      // Prepare workout data
      const workoutExercises: WorkoutExercise[] = workoutState.exercises.map(
        exercise => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          sets: workoutState.sets[exercise.id] || [],
        })
      );

      // Save to Firestore with 'end' state
      const result = await saveWorkout(user.uid, workoutExercises, 'end');

      if (result.success) {
        // Clear local storage
        localStorage.removeItem('workoutSets');

        // Clear sets state
        setWorkoutState(prev => ({ ...prev, sets: {} }));

        // Show confirmation screen
        setWorkoutCount(result.totalWorkouts);
        setModalState(prev => ({ ...prev, showConfirmation: true }));
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      setErrorState(prev => ({
        ...prev,
        saveError: error.message || 'Failed to save workout',
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, isSaving: false }));
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
          <div className='mb-4'>
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
          </div>
          <Separator className='bg-purple-500/20' />
        </div>

        {/* Success/Error Messages */}
        {errorState.saveSuccess && (
          <Alert className='bg-green-500/10 border-green-500/30 mb-6'>
            <Check className='h-4 w-4' />
            <AlertDescription className='text-green-200'>
              Workout saved successfully! Your progress has been recorded.
            </AlertDescription>
          </Alert>
        )}

        {errorState.saveError && (
          <Alert className='bg-red-500/10 border-red-500/30 mb-6'>
            <AlertDescription className='text-red-200'>
              {errorState.saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Exercise Management Header - Only show when no exercises */}
        {workoutState.exercises.length === 0 && (
          <Card className={cardVariants.main + ' mb-8'}>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8'>
                <div className='text-purple-200 text-lg mb-4'>
                  No exercises added yet. Start your workout by adding
                  exercises!
                </div>
                <Button
                  onClick={() =>
                    setModalState(prev => ({ ...prev, showAddExercise: true }))
                  }
                  className={buttonVariants.primary}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Your First Exercise
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Exercise Modal */}
        <AddExerciseModal
          isOpen={modalState.showAddExercise}
          onClose={() =>
            setModalState(prev => ({
              ...prev,
              showAddExercise: false,
              editingExercise: null,
            }))
          }
          onSave={
            modalState.editingExercise ? handleEditExercise : handleAddExercise
          }
          editingExercise={
            modalState.editingExercise
              ? workoutState.exercises.find(
                  ex => ex.id === modalState.editingExercise
                ) || null
              : null
          }
        />

        {/* Past Exercises Modal */}
        <PastExercisesModal
          isOpen={modalState.showPastExercises}
          onClose={() =>
            setModalState(prev => ({ ...prev, showPastExercises: false }))
          }
          exercises={pastExercises}
          loading={loadingState.loadingPastExercises}
          onAddExercise={addPastExerciseToWorkout}
        />

        {/* Individual Exercise Cards */}
        {workoutState.exercises.length > 0 && (
          <div className='space-y-6'>
            {workoutState.exercises.map((exercise, exerciseIndex) => {
              const exerciseProgress = getExerciseProgress(
                workoutState.sets,
                exercise.id
              );

              return (
                <Card key={exercise.id} className={cardVariants.main}>
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
                          className={badgeVariants.setCount}
                        >
                          {exerciseProgress.completed} /{' '}
                          {exerciseProgress.total} sets
                        </Badge>
                        <div className='flex space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => startEditExercise(exercise.id)}
                            className={buttonVariants.edit}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => deleteExercise(exercise.id)}
                            className={buttonVariants.delete}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar for this exercise */}
                    {exerciseProgress.total > 0 && (
                      <div className='mb-6'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-white font-semibold'>Progress</h3>
                          <Badge
                            variant='secondary'
                            className={badgeVariants.setCount}
                          >
                            {exerciseProgress.completed} /{' '}
                            {exerciseProgress.total} completed
                          </Badge>
                        </div>
                        <Progress
                          value={exerciseProgress.percentage}
                          className='h-2 mb-4'
                        />
                      </div>
                    )}

                    {/* Sets for this exercise */}
                    <div className='space-y-3'>
                      {getExerciseSets(exercise.id).map((set, setIndex) => (
                        <Card
                          key={setIndex}
                          className={`transition-all duration-200 ${cardVariants.set(
                            set.completed
                          )}`}
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
                                    className={inputVariants.number}
                                  />
                                </div>

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
                                    className={inputVariants.number}
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
                                className={buttonVariants.setComplete(
                                  set.completed
                                )}
                              >
                                <Check className='h-4 w-4' />
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
                      className={buttonVariants.addSet}
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

        {/* Floating Action Menu */}
        <div
          className='fixed bottom-6 right-6 z-40'
          onMouseEnter={() => setIsHoveringFloatingButton(true)}
          onMouseLeave={() => {
            setIsHoveringFloatingButton(false);
            setIsFloatingMenuOpen(false);
          }}
        >
          {/* Sub-buttons */}
          <div
            className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${
              isFloatingMenuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Save Workout Button */}
            <Button
              onClick={handleSaveWorkout}
              disabled={loadingState.isSaving}
              size='lg'
              className={buttonVariants.floating.save}
              title='Save Workout'
            >
              <Save className='h-5 w-5' />
            </Button>

            {/* Add Exercise Button */}
            <Button
              onClick={() => {
                setModalState(prev => ({ ...prev, showAddExercise: true }));
                setIsFloatingMenuOpen(false);
              }}
              size='lg'
              className={buttonVariants.floating.add}
              title='Add Exercise'
            >
              <Plus className='h-5 w-5' />
            </Button>

            {/* Past Exercises Button */}
            <Button
              onClick={() => {
                loadPastExercises();
                setIsFloatingMenuOpen(false);
              }}
              disabled={loadingState.loadingPastExercises}
              size='lg'
              className={buttonVariants.floating.past}
              title='Past Exercises'
            >
              <List className='h-5 w-5' />
            </Button>
          </div>

          {/* Main Floating Button */}
          <Button
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            size='lg'
            className={`${buttonVariants.floating.main} ${
              isFloatingMenuOpen ? 'rotate-45' : 'rotate-0'
            }`}
            title={isFloatingMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isFloatingMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Plus className='h-6 w-6' />
            )}
          </Button>
        </div>
      </div>

      {/* Workout Confirmation Screen */}
      {modalState.showConfirmation && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <Card className='bg-slate-800 border-white/20 w-full max-w-md'>
            <CardContent className='p-8 text-center'>
              <div className='mb-6'>
                <div className='w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Check className='h-10 w-10 text-green-400' />
                </div>
                <h2 className='text-2xl font-bold text-white mb-2'>
                  Congratulations! 🎉
                </h2>
                <p className='text-purple-200 text-lg'>
                  That's your {workoutCount}
                  {getOrdinalSuffix(workoutCount || 0)} workout!
                </p>
              </div>

              <div className='space-y-3'>
                <Button
                  onClick={() => {
                    setModalState(prev => ({
                      ...prev,
                      showConfirmation: false,
                    }));
                    setWorkoutState({ exercises: [], sets: {} });
                  }}
                  className={`w-full ${buttonVariants.primary}`}
                >
                  Start New Workout
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant='outline'
                  className='w-full border-white/20 text-white hover:bg-white/10 cursor-pointer'
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
