'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';

export default function WorkoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sets, setSets] = useState<
    Array<{ reps: number; weight: number; completed: boolean }>
  >([]);
  const [exercises, setExercises] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
        // Load exercises from localStorage
        const savedExercises = localStorage.getItem('exercises');
        if (savedExercises) {
          setExercises(JSON.parse(savedExercises));
        } else {
          // Add some default exercises
          const defaultExercises = [
            { id: '1', name: 'Bench Press', category: 'Chest' },
            { id: '2', name: 'Squat', category: 'Legs' },
            { id: '3', name: 'Deadlift', category: 'Back' },
            { id: '4', name: 'Overhead Press', category: 'Shoulders' },
            { id: '5', name: 'Pull-ups', category: 'Back' },
          ];
          setExercises(defaultExercises);
          localStorage.setItem('exercises', JSON.stringify(defaultExercises));
        }
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutTime(0);
    setSets([]);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutTime(0);
    setSets([]);
    setCurrentExercise(0);
  };

  const addSet = () => {
    setSets(prev => [...prev, { reps: 0, weight: 0, completed: false }]);
  };

  const updateSet = (
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    setSets(prev =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  };

  const toggleSetComplete = (index: number) => {
    setSets(prev =>
      prev.map((set, i) =>
        i === index ? { ...set, completed: !set.completed } : set
      )
    );
  };

  const addExercise = () => {
    if (newExerciseName.trim() && newExerciseCategory.trim()) {
      const newExercise = {
        id: Date.now().toString(),
        name: newExerciseName.trim(),
        category: newExerciseCategory.trim(),
      };
      const updatedExercises = [...exercises, newExercise];
      setExercises(updatedExercises);
      localStorage.setItem('exercises', JSON.stringify(updatedExercises));
      setNewExerciseName('');
      setNewExerciseCategory('');
      setShowAddExercise(false);
    }
  };

  const deleteExercise = (id: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
    if (currentExercise >= updatedExercises.length) {
      setCurrentExercise(Math.max(0, updatedExercises.length - 1));
    }
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
      localStorage.setItem('exercises', JSON.stringify(updatedExercises));
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
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2'>
              Workout Session
            </h1>
            <p className='text-purple-200'>
              Ready to crush your fitness goals, {firstName}?
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant='destructive'
            size='sm'
            className='bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
          >
            Sign Out
          </Button>
        </div>

        {/* Workout Timer and Controls */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <CardTitle className='text-white text-center text-2xl'>
              Workout Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center mb-6'>
              <div className='text-6xl sm:text-8xl font-mono font-bold text-white mb-4'>
                {formatTime(workoutTime)}
              </div>
              <div className='flex justify-center space-x-4'>
                {!isWorkoutActive ? (
                  <Button
                    onClick={startWorkout}
                    size='lg'
                    className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-200'
                  >
                    <Play className='h-5 w-5 mr-2' />
                    Start Workout
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={pauseWorkout}
                      size='lg'
                      variant='outline'
                      className='border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300'
                    >
                      <Pause className='h-5 w-5 mr-2' />
                      Pause
                    </Button>
                    <Button
                      onClick={stopWorkout}
                      size='lg'
                      variant='outline'
                      className='border-2 border-red-300 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300'
                    >
                      <Square className='h-5 w-5 mr-2' />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Selection */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-white text-xl'>
                  {exercises.length > 0
                    ? `Current Exercise: ${
                        exercises[currentExercise]?.name || 'Select Exercise'
                      }`
                    : 'No Exercises Available'}
                </CardTitle>
                <CardDescription className='text-purple-200'>
                  {exercises.length > 0
                    ? `Category: ${exercises[currentExercise]?.category || ''}`
                    : 'Add exercises to get started'}
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddExercise(true)}
                size='sm'
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              >
                <Plus className='h-4 w-4 mr-1' />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Exercise Selection */}
              {exercises.length > 0 && (
                <div className='mb-6'>
                  <h3 className='text-white font-semibold mb-3'>
                    Select Exercise:
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                    {exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          currentExercise === index
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => setCurrentExercise(index)}
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='text-white font-medium'>
                              {exercise.name}
                            </div>
                            <div className='text-purple-200 text-sm'>
                              {exercise.category}
                            </div>
                          </div>
                          <div className='flex space-x-1'>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={e => {
                                e.stopPropagation();
                                startEditExercise(exercise.id);
                              }}
                              className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={e => {
                                e.stopPropagation();
                                deleteExercise(exercise.id);
                              }}
                              className='h-8 w-8 p-0 text-gray-400 hover:text-red-400'
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                          onClick={
                            editingExercise ? saveEditExercise : addExercise
                          }
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

              {/* Sets List */}
              {exercises.length > 0 ? (
                <>
                  {sets.map((set, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                        set.completed
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className='text-white font-semibold min-w-[60px]'>
                        Set {index + 1}
                      </div>
                      <div className='flex items-center space-x-2'>
                        <label className='text-purple-200 text-sm font-medium'>
                          Reps:
                        </label>
                        <input
                          type='number'
                          min='0'
                          value={set.reps}
                          onChange={e =>
                            updateSet(
                              index,
                              'reps',
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className='w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500'
                          placeholder='0'
                        />
                      </div>
                      <div className='flex items-center space-x-2'>
                        <label className='text-purple-200 text-sm font-medium'>
                          Weight:
                        </label>
                        <input
                          type='number'
                          min='0'
                          step='5'
                          value={set.weight}
                          onChange={e =>
                            updateSet(
                              index,
                              'weight',
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className='w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500'
                          placeholder='0'
                        />
                        <span className='text-purple-200 text-sm'>lbs</span>
                      </div>
                      <Button
                        size='sm'
                        variant={set.completed ? 'default' : 'outline'}
                        onClick={() => toggleSetComplete(index)}
                        className={`ml-auto ${
                          set.completed
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'border-green-300 hover:border-green-500 hover:bg-green-500/10 text-green-400'
                        }`}
                      >
                        {set.completed ? 'Completed' : 'Complete'}
                      </Button>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <Button
                    onClick={addSet}
                    variant='outline'
                    className='w-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Set
                  </Button>
                </>
              ) : (
                <div className='text-center py-8'>
                  <div className='text-purple-200 text-lg mb-4'>
                    No exercises available. Add your first exercise to get
                    started!
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
            </div>
          </CardContent>
        </Card>

        {/* Workout Stats */}
        {isWorkoutActive && (
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
            <CardHeader>
              <CardTitle className='text-white text-xl'>
                Workout Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-white mb-2'>
                    {sets.length}
                  </div>
                  <div className='text-purple-200'>Total Sets</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-white mb-2'>
                    {sets.filter(set => set.completed).length}
                  </div>
                  <div className='text-purple-200'>Completed Sets</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-white mb-2'>
                    {sets.reduce((total, set) => total + set.reps, 0)}
                  </div>
                  <div className='text-purple-200'>Total Reps</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Alert */}
        {isWorkoutActive && (
          <Alert className='bg-green-500/10 border-green-500/30 mb-8'>
            <AlertDescription className='text-green-200 text-center'>
              🔥 You're crushing it! Keep pushing through those sets!
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
          <CardHeader>
            <CardTitle className='text-white text-xl'>Quick Actions</CardTitle>
            <CardDescription className='text-purple-200'>
              Manage your workout session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Button
                variant='outline'
                className='border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300'
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant='outline'
                className='border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300'
                onClick={() => router.push('/dashboard/log-workout')}
              >
                Log Previous Workout
              </Button>
              <Button
                variant='outline'
                className='border-2 border-green-300 hover:border-green-500 hover:bg-green-500/10 text-green-400 hover:text-green-300'
                onClick={() => router.push('/dashboard/charts')}
              >
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
