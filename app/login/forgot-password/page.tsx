'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(true);
        setEmail(''); // Clear the email field
      }
    } catch (error: any) {
      setError(
        error.message || 'An error occurred while sending password reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 relative z-0'>
      <div className='w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl'>
        {/* Header */}
        <div className='text-center mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight'>
            Reset Password
          </h1>
          <p className='text-sm sm:text-base md:text-lg text-purple-100 px-2'>
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {/* Password Reset Form */}
        <form className='space-y-4 sm:space-y-6' onSubmit={handleSubmit}>
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
              placeholder='Enter your email address'
              className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
              required
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base cursor-pointer'
          >
            {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
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

        {/* Success Message */}
        {success && (
          <div className='mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg'>
            <p className='text-sm text-green-400 flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              Password reset email sent! Check your inbox and follow the
              instructions to reset your password.
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

        {/* Back to Login Link */}
        <div className='text-center mt-6 sm:mt-8'>
          <p className='text-xs sm:text-sm text-purple-200'>
            Remember your password?
            <Link
              href='/login'
              className='text-purple-300 hover:text-white font-medium transition-colors duration-200'
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Additional Help */}
        <div className='text-center mt-4 sm:mt-6'>
          <p className='text-xs sm:text-sm text-purple-300'>
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setError('');
                setSuccess(false);
                setEmail('');
              }}
              className='underline hover:text-white transition-colors duration-200'
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
