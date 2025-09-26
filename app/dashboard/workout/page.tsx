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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Check, Dumbbell } from 'lucide-react';

// Import reusable components and utilities
import AddExerciseModal from '@/components/workout/AddExerciseModal';
import PastExercisesModal from '@/components/workout/PastExercisesModal';
import FloatingActionMenu from '@/components/workout/FloatingActionMenu';
import ExerciseCard from '@/components/workout/ExerciseCard';
import LoadingScreen from '@/components/workout/LoadingScreen';
import WorkoutConfirmationModal from '@/components/workout/WorkoutConfirmationModal';
import EmptyStateCard from '@/components/workout/EmptyStateCard';
import { buttonVariants } from '@/lib/button-variants';
import {
  type WorkoutState,
  type ModalState,
  type FormState,
  type LoadingState,
  type ErrorState,
  saveSetsToStorage,
  loadSetsFromStorage,
  saveWorkoutStateToStorage,
  loadWorkoutStateFromStorage,
  clearWorkoutStateFromStorage,
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

        // Try to load complete saved workout state first
        const savedWorkoutState = loadWorkoutStateFromStorage();
        if (savedWorkoutState) {
          setWorkoutState(savedWorkoutState);
        } else {
          // Start with empty state if no saved workout
          setWorkoutState({ exercises: [], sets: {} });
        }
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Auto-save complete workout state whenever it changes
  useEffect(() => {
    if (
      workoutState.exercises.length > 0 ||
      Object.keys(workoutState.sets).length > 0
    ) {
      saveWorkoutStateToStorage(workoutState);
    }
  }, [workoutState]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Extract first name from displayName
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-6xl mx-auto'>
        {/* Breadcrumb Navigation */}
        <PageBreadcrumb
          items={[
            { label: 'Record Workout', icon: <Dumbbell className='h-4 w-4' /> },
          ]}
          className='mb-6'
        />

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
          onMouseEnter={() => setIsHoveringFloatingButton(true)}
          onMouseLeave={() => {
            setIsHoveringFloatingButton(false);
            setIsFloatingMenuOpen(false);
          }}
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
