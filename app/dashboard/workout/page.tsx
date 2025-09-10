'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
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
import { Plus, Edit, Trash2, Check, Dumbbell, Target } from 'lucide-react';

export default function WorkoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sets, setSets] = useState<{
    [exerciseId: string]: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>({});
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

  // Helper function to get current exercise's sets
  const getCurrentExerciseSets = () => {
    if (exercises.length === 0) return [];
    const currentExerciseId = exercises[currentExercise]?.id;
    return currentExerciseId ? sets[currentExerciseId] || [] : [];
  };

  const addSet = () => {
    if (exercises.length === 0) return;
    const currentExerciseId = exercises[currentExercise].id;
    setSets(prev => ({
      ...prev,
      [currentExerciseId]: [
        ...(prev[currentExerciseId] || []),
        { reps: 0, weight: 0, completed: false },
      ],
    }));
  };

  const updateSet = (
    index: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    if (exercises.length === 0) return;
    const currentExerciseId = exercises[currentExercise].id;
    setSets(prev => ({
      ...prev,
      [currentExerciseId]: (prev[currentExerciseId] || []).map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      ),
    }));
  };

  const toggleSetComplete = (index: number) => {
    if (exercises.length === 0) return;
    const currentExerciseId = exercises[currentExercise].id;
    setSets(prev => ({
      ...prev,
      [currentExerciseId]: (prev[currentExerciseId] || []).map((set, i) =>
        i === index ? { ...set, completed: !set.completed } : set
      ),
    }));
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
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-4'>
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
          <Separator className='bg-purple-500/20' />
        </div>

        {/* Exercise Selection */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mb-8'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-purple-500/20'>
                  <Target className='h-5 w-5 text-purple-400' />
                </div>
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
                      ? `Category: ${
                          exercises[currentExercise]?.category || ''
                        }`
                      : 'Add exercises to get started'}
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
            <div className='space-y-4'>
              {/* Exercise Selection */}
              {exercises.length > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-white font-semibold text-lg'>
                      Select Exercise:
                    </h3>
                    <Badge
                      variant='secondary'
                      className='bg-purple-500/20 text-purple-200 border-purple-500/30'
                    >
                      {exercises.length} exercises
                    </Badge>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {exercises.map((exercise, index) => (
                      <Card
                        key={exercise.id}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          currentExercise === index
                            ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/25'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        onClick={() => setCurrentExercise(index)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <div className='text-white font-medium text-lg mb-1'>
                                {exercise.name}
                              </div>
                              <Badge
                                variant='outline'
                                className='text-purple-200 border-purple-500/30'
                              >
                                {exercise.category}
                              </Badge>
                            </div>
                            <div className='flex space-x-1 ml-2'>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={e => {
                                  e.stopPropagation();
                                  startEditExercise(exercise.id);
                                }}
                                className='h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10'
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
                                className='h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                              >
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                  {(() => {
                    const currentSets = getCurrentExerciseSets();
                    return (
                      currentSets.length > 0 && (
                        <div className='mb-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <h3 className='text-white font-semibold'>
                              Sets Progress
                            </h3>
                            <Badge
                              variant='secondary'
                              className='bg-green-500/20 text-green-200 border-green-500/30'
                            >
                              {currentSets.filter(set => set.completed).length}{' '}
                              / {currentSets.length} completed
                            </Badge>
                          </div>
                          <Progress
                            value={
                              (currentSets.filter(set => set.completed).length /
                                currentSets.length) *
                              100
                            }
                            className='h-2 mb-4'
                          />
                        </div>
                      )
                    );
                  })()}

                  <div className='space-y-3'>
                    {getCurrentExerciseSets().map((set, index) => (
                      <Card
                        key={index}
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
                                {index + 1}
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
                                    updateSet(
                                      index,
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
                                    updateSet(
                                      index,
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
                              onClick={() => toggleSetComplete(index)}
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

                  {/* Add Set Button */}
                  <Button
                    onClick={addSet}
                    variant='outline'
                    className='w-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 mt-4'
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

        {/* Quick Actions */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-500/20'>
                <Target className='h-5 w-5 text-blue-400' />
              </div>
              <div>
                <CardTitle className='text-white text-xl'>
                  Quick Actions
                </CardTitle>
                <CardDescription className='text-purple-200'>
                  Manage your workout session and track progress
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Button
                variant='outline'
                className='h-16 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-105'
                onClick={() => router.push('/dashboard')}
              >
                <div className='text-center'>
                  <div className='font-semibold'>Back to Dashboard</div>
                  <div className='text-xs opacity-75'>
                    Return to main dashboard
                  </div>
                </div>
              </Button>
              <Button
                variant='outline'
                className='h-16 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all duration-200 hover:scale-105'
                onClick={() => router.push('/dashboard/log-workout')}
              >
                <div className='text-center'>
                  <div className='font-semibold'>Log Previous Workout</div>
                  <div className='text-xs opacity-75'>Record past sessions</div>
                </div>
              </Button>
              <Button
                variant='outline'
                className='h-16 border-2 border-green-300 hover:border-green-500 hover:bg-green-500/10 text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-105'
                onClick={() => router.push('/dashboard/charts')}
              >
                <div className='text-center'>
                  <div className='font-semibold'>View Progress</div>
                  <div className='text-xs opacity-75'>
                    Track your improvements
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
