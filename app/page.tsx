'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-purple-200'>Loading...</p>
        </div>
      </main>
    );
  }

  // If user is logged in, they will be redirected, so this won't render
  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
      {/* Header - Top Left */}
      <header className='absolute top-0 left-0 p-6 sm:p-8 z-10'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>PR</span>
          </div>
          <div>
            <h1 className='text-xl font-bold text-white'>PR Tracker</h1>
            <p className='text-purple-200 text-sm'>Fitness Companion</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex flex-col lg:flex-row min-h-screen'>
        {/* Left Side - Content */}
        <div className='flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-16 pt-20 lg:pt-0'>
          <div className='max-w-2xl'>
            <div className='mb-8'>
              <h2 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                Track Your
                <span className='block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                  Lifting PRs
                </span>
                Like a Pro
              </h2>
              <p className='text-lg sm:text-xl text-purple-100 mb-8 leading-relaxed'>
                A clean, mobile-friendly dashboard for your squat, bench, and
                deadlift progress. Log lifts in seconds. Get insights
                automatically.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 mb-12'>
              <button className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-lg active:scale-95 touch-manipulation'>
                Start Tracking Now
              </button>
              <button className='bg-transparent border-2 border-purple-400 hover:border-purple-300 hover:bg-purple-500/10 px-8 py-4 rounded-2xl font-semibold text-purple-200 hover:text-white transition-all duration-200 text-lg active:scale-95 touch-manipulation'>
                View Demo
              </button>
            </div>

            {/* Features Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12'>
              <div className='text-center sm:text-left'>
                <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                  <span className='text-2xl'>📊</span>
                </div>
                <h3 className='font-semibold text-white mb-2'>
                  Track Progress
                </h3>
                <p className='text-purple-200 text-sm'>
                  Monitor your lifts and see improvement over time
                </p>
              </div>
              <div className='text-center sm:text-left'>
                <div className='w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                  <span className='text-2xl'>📱</span>
                </div>
                <h3 className='font-semibold text-white mb-2'>Mobile First</h3>
                <p className='text-purple-200 text-sm'>
                  Designed for your phone, works everywhere
                </p>
              </div>
              <div className='text-center sm:text-left'>
                <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0'>
                  <span className='text-2xl'>⚡</span>
                </div>
                <h3 className='font-semibold text-white mb-2'>Quick Logging</h3>
                <p className='text-purple-200 text-sm'>
                  Log your sets in seconds, not minutes
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className='flex items-center space-x-4'>
              <div className='flex -space-x-2'>
                <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white'></div>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white'></div>
                <div className='w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white'></div>
              </div>
              <div>
                <p className='text-purple-200 font-medium'>
                  500+ lifters tracking PRs
                </p>
                <p className='text-purple-300 text-sm'>
                  "Finally, a PR tracker that works!" — Sarah M.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className='flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16'>
          <div className='relative w-full max-w-lg'>
            {/* Main Dashboard Preview */}
            <div className='bg-gradient-to-br from-purple-800/40 to-pink-800/40 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/30 shadow-2xl'>
              <div className='text-center mb-6'>
                <div className='text-6xl mb-4'>💪</div>
                <h3 className='text-2xl font-bold text-white mb-2'>
                  Your PR Dashboard
                </h3>
                <p className='text-purple-200'>
                  Track, analyze, and celebrate your gains
                </p>
              </div>

              {/* Mock Stats */}
              <div className='space-y-4'>
                <div className='bg-white/10 rounded-xl p-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-purple-200'>Squat PR</span>
                    <span className='text-white font-bold text-lg'>
                      315 lbs
                    </span>
                  </div>
                </div>
                <div className='bg-white/10 rounded-xl p-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-purple-200'>Bench PR</span>
                    <span className='text-white font-bold text-lg'>
                      225 lbs
                    </span>
                  </div>
                </div>
                <div className='bg-white/10 rounded-xl p-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-purple-200'>Deadlift PR</span>
                    <span className='text-white font-bold text-lg'>
                      405 lbs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className='absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse'></div>
            <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse delay-1000'></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-center'>
        <p className='text-purple-300 text-sm'>
          Made by lifters, for lifters • Launching soon
        </p>
      </footer>
    </main>
  );
}
