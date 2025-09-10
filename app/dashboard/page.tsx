'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
      } else {
        // User is not logged in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='w-full max-w-4xl text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight'>
          You're logged in, {firstName}!
        </h1>

        <p className='text-lg sm:text-xl text-purple-100 mb-8 sm:mb-12'>
          Welcome to your PR Tracker dashboard
        </p>

        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8 border border-white/20 mb-8'>
          <h2 className='text-xl sm:text-2xl font-semibold mb-4 text-white'>
            Dashboard Coming Soon
          </h2>
          <p className='text-purple-200 mb-6'>
            This is where you'll be able to track your personal records and view
            your progress.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className='bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200'
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
