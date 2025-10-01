'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { signIn, LoginData } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email,
        password,
        rememberMe,
      };

      const result = await signIn(loginData);

      if (result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      // Display generic error message for authentication failures
      setError('Incorrect email or password');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 relative z-0'>
      <div className='w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight'>
          Sign In
        </h1>
        <p className='text-sm sm:text-base md:text-lg text-purple-100 mb-4 sm:mb-6 md:mb-8 text-center px-2'>
          Welcome to PR Tracker
        </p>

        {/* Login Form */}
        <form className='space-y-4 sm:space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-3 sm:space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm sm:text-base font-medium text-purple-100 mb-1 sm:mb-2'
              >
                Email Address
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email'
                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
                required
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm sm:text-base font-medium text-purple-100 mb-1 sm:mb-2'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Enter your password'
                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
                required
              />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-xs sm:text-sm text-purple-200'
              >
                Remember me
              </label>
            </div>

            <div className='text-xs sm:text-sm'>
              <Link
                href='/login/forgot-password'
                className='font-medium text-purple-300 hover:text-white transition-colors duration-200'
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base cursor-pointer'
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className='mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <p className='text-sm text-red-400 flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className='flex items-center my-4 sm:my-6'>
          <Separator className='flex-1 bg-purple-400/30' />
          <span className='px-3 sm:px-4 text-purple-200 text-xs sm:text-sm'>
            or
          </span>
          <Separator className='flex-1 bg-purple-400/30' />
        </div>

        {/* Signup Link */}
        <div className='text-center mt-6 sm:mt-8'>
          <p className='text-xs sm:text-sm text-purple-200'>
            Don't have an account?{' '}
            <Link
              href='/signup'
              className='text-purple-300 hover:text-white font-medium transition-colors duration-200'
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
