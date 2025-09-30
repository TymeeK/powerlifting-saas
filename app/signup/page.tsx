'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { signUp, SignUpData } from '@/lib/firebase';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const checkPasswordMatch = (pwd: string, confirmPwd: string) => {
    if (confirmPwd.length > 0 && pwd !== confirmPwd) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordMatch(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    checkPasswordMatch(password, newConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Check if passwords match before submitting
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const signUpData: SignUpData = {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      };

      const result = await signUp(signUpData);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPasswordMismatch(false);

        // Redirect to dashboard or login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
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
            Join PR Tracker
          </h1>
          <p className='text-sm sm:text-base md:text-lg text-purple-100 px-2'>
            Start tracking your lifting progress today
          </p>
        </div>

        {/* Signup Form */}
        <form className='space-y-4 sm:space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-3 sm:space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm sm:text-base font-medium text-purple-100 mb-1 sm:mb-2'
                >
                  First Name
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder='Enter first name'
                  className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm sm:text-base font-medium text-purple-100 mb-1 sm:mb-2'
                >
                  Last Name
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder='Enter last name'
                  className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
                  required
                />
              </div>
            </div>

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
                onChange={handlePasswordChange}
                placeholder='Create a password'
                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500 text-sm sm:text-base'
                required
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm sm:text-base font-medium text-purple-100 mb-1 sm:mb-2'
              >
                Confirm Password
              </label>
              <input
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder='Confirm your password'
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-black bg-white border-2 focus:outline-none focus:ring-2 placeholder-gray-500 text-sm sm:text-base ${
                  passwordMismatch
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-purple-300 focus:border-purple-500 focus:ring-purple-200'
                }`}
                required
              />
              {passwordMismatch && (
                <p className='mt-1 text-sm text-red-400 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base'
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
              Account created successfully! Redirecting to login page...
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

        {/* Login Link */}
        <div className='text-center mt-6 sm:mt-8'>
          <p className='text-xs sm:text-sm text-purple-200'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-purple-300 hover:text-white font-medium transition-colors duration-200'
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className='text-center mt-4 sm:mt-6'>
          <p className='text-xs sm:text-sm text-purple-300'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms'
              className='underline hover:text-white transition-colors duration-200'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='underline hover:text-white transition-colors duration-200'
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
