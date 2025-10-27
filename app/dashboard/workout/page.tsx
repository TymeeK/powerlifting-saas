'use client';

import { useEffect, useState } from 'react';
import {
  auth,
  saveWorkout,
  getPastExercises,
  type WorkoutExercise,
  type UserExercise,
} from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Check, Dumbbell } from 'lucide-react';

// Import reusable components and utilities
import AddExerciseModal from '@/components/workout/AddExerciseModal';
import PastExercisesModal from '@/components/workout/PastExercisesModal';
import FloatingActionMenu from '@/components/workout/FloatingActionMenu';
import ExerciseCard from '@/components/workout/ExerciseCard';
import LoadingScreen from '@/components/workout/LoadingScreen';
import WorkoutConfirmationModal from '@/components/workout/WorkoutConfirmationModal';
import EmptyStateCard from '@/components/workout/EmptyStateCard';
import {
  type WorkoutState,
  type ModalState,
  type FormState,
  type LoadingState,
  type ErrorState,
  saveWorkoutStateToStorage,
  loadWorkoutStateFromStorage,
  clearWorkoutStateFromStorage,
  createNewExercise,
  addSetToExercise,
  updateSetInExercise,
  toggleSetComplete,
  getExerciseProgress,
} from '@/lib/workout-utils';
import BackToDashboardButton from '@/components/back-button';
import { useRequireAuth } from '@/lib/hooks/userRequireAuth';

export default function WorkoutPage() {
  const { user, loading } = useRequireAuth('/login');
  // Grouped state management
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    exercises: [],
    sets: {},
  });
  const router = useRouter();

  const [modalState, setModalState] = useState<ModalState>({
    showAddExercise: false,
    showPastExercises: false,
    showConfirmation: false,
    editingExercise: null,
  });

  const [formState, setFormState] = useState<FormState>({
    newExerciseName: '',
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
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pastExercises, setPastExercises] = useState<
    Array<{
      name: string;
      lastUsed: Date;
      totalWorkouts: number;
    }>
  >([]);

  // Hover management functions
  const handleMouseEnter = () => {
    setIsHoveringFloatingButton(true);
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Open menu on hover
    setIsFloatingMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringFloatingButton(false);

    const timeout = setTimeout(() => {
      setIsFloatingMenuOpen(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Load saved workout state after user is authenticated

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    console.log('User authenticated, loading saved workout state...');
    const savedWorkoutState = loadWorkoutStateFromStorage();
    console.log('Loading from storage:', savedWorkoutState);
    if (savedWorkoutState) {
      console.log('Restoring workout state from storage');
      setWorkoutState(savedWorkoutState);
    } else {
      console.log('No saved workout state found, starting fresh');
      // Start with empty state if no saved workout
      setWorkoutState({ exercises: [], sets: {} });
    }
  }, [user]);

  // Auto-save complete workout state whenever it changes
  useEffect(() => {
    // Only run on client side and when user is authenticated
    if (typeof window === 'undefined' || !user) return;

    console.log('Workout state changed:', workoutState);
    if (
      workoutState.exercises.length > 0 ||
      Object.keys(workoutState.sets).length > 0
    ) {
      console.log('Saving workout state to storage...');
      saveWorkoutStateToStorage(workoutState);
      console.log('Workout state saved to localStorage');
    }
  }, [workoutState, user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

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

  const deleteSetForExercise = (exerciseId: string, index: number) => {
    setWorkoutState(prev => ({
      ...prev,
      sets: {
        ...prev.sets,
        [exerciseId]:
          prev.sets[exerciseId]?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleAddExercise = (name: string) => {
    const newExercise = createNewExercise(name);
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

  const handleEditExercise = (name: string) => {
    if (modalState.editingExercise) {
      setWorkoutState(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === modalState.editingExercise
            ? { ...ex, name: name.trim() }
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

  const addPastExerciseToWorkout = (exerciseName: string) => {
    const newExercise = createNewExercise(exerciseName);
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
          sets: workoutState.sets[exercise.id] || [],
        })
      );

      // Save to Firestore with 'end' state
      const result = await saveWorkout(user.uid, workoutExercises, 'end');

      if (result.success) {
        // Clear all workout data from storage
        clearWorkoutStateFromStorage();

        // Clear state
        setWorkoutState({ exercises: [], sets: {} });

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
  // Extract first name from displayName
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-6xl mx-auto'>
        <BackToDashboardButton />
        {/* Header */}
        <div className='mb-8 mt-6'>
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
          <EmptyStateCard
            onAddFirstExercise={() =>
              setModalState(prev => ({ ...prev, showAddExercise: true }))
            }
          />
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
          onSave={name =>
            modalState.editingExercise
              ? handleEditExercise(name)
              : handleAddExercise(name)
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
            {workoutState.exercises.map(exercise => {
              const exerciseProgress = getExerciseProgress(
                workoutState.sets,
                exercise.id
              );

              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  sets={getExerciseSets(exercise.id)}
                  exerciseProgress={exerciseProgress}
                  onAddSet={addSetForExercise}
                  onUpdateSet={updateSetForExercise}
                  onToggleSetComplete={toggleSetCompleteForExercise}
                  onDeleteSet={deleteSetForExercise}
                  onEditExercise={startEditExercise}
                  onDeleteExercise={deleteExercise}
                />
              );
            })}
          </div>
        )}

        {/* Floating Action Menu */}
        <FloatingActionMenu
          isOpen={isFloatingMenuOpen}
          onToggle={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onSaveWorkout={handleSaveWorkout}
          onAddExercise={() => {
            setModalState(prev => ({ ...prev, showAddExercise: true }));
            setIsFloatingMenuOpen(false);
          }}
          onShowPastExercises={() => {
            loadPastExercises();
            setIsFloatingMenuOpen(false);
          }}
          isSaving={loadingState.isSaving}
          loadingPastExercises={loadingState.loadingPastExercises}
        />
      </div>

      {/* Workout Confirmation Screen */}
      <WorkoutConfirmationModal
        isOpen={modalState.showConfirmation}
        workoutCount={workoutCount}
        onStartNewWorkout={() => {
          setModalState(prev => ({
            ...prev,
            showConfirmation: false,
          }));
          setWorkoutState({ exercises: [], sets: {} });
        }}
        onBackToDashboard={() => router.push('/dashboard')}
      />
    </main>
  );
}
