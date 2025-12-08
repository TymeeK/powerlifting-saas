import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addWorkoutToFirestore,
  createWorkoutData,
} from '@/lib/firebase/workout';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { WorkoutExercise } from '@/lib/types';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  getFirestore: vi.fn(),
}));

// Mock Firebase config
vi.mock('@/lib/firebase/config', () => ({
  db: {},
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

describe('createWorkoutData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a workout data object with the exercises, state, createdAt, and updatedAt', () => {
    const exercises = [
      {
        id: 'test-exercise-123',
        name: 'Bench Press',
        sets: [
          {
            reps: 10,
            weight: 100,
            completed: true,
          },
          {
            reps: 10,
            weight: 100,
            completed: true,
          },
        ],
      },
    ];
    const state = 'active';
    const workoutData = createWorkoutData(exercises, state);

    expect(workoutData).toEqual({
      exercises,
      state,
      createdAt: expect.objectContaining({ _methodName: 'serverTimestamp' }),
      updatedAt: expect.objectContaining({ _methodName: 'serverTimestamp' }),
    });

    expect(serverTimestamp).toHaveBeenCalledTimes(2);
  });
});

// describe('addWorkoutToFirestore', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('should add a workout to the database', async () => {
//     const userId = 'test-user-123';
//     const state = 'end';
//     const exercises: WorkoutExercise[] = [
//       {
//         id: 'test-exercise-123',
//         name: 'Bench Press',
//         sets: [
//           {
//             reps: 10,
//             weight: 100,
//             completed: true,
//           },
//           {
//             reps: 10,
//             weight: 100,
//             completed: true,
//           },
//         ],
//       },
//     ];
//     vi.mock(addDoc).mockResolvedValue({ id: 'test-workout-123' });
//     const workoutData = createWorkoutData(exercises, state);
//     const docRef = await addWorkoutToFirestore(userId, workoutData);
//     expect(docRef).toEqual({ id: 'test-workout-123' });
//   });
// });
