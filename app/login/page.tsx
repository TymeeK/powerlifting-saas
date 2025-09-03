export default function LoginPage() {
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
        <form className='space-y-4 sm:space-y-6'>
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
              <a
                href='/forgot-password'
                className='font-medium text-purple-300 hover:text-white transition-colors duration-200'
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type='submit'
            className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base'
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className='flex items-center my-4 sm:my-6'>
          <div className='flex-1 border-t border-purple-400/30'></div>
          <span className='px-3 sm:px-4 text-purple-200 text-xs sm:text-sm'>
            or
          </span>
          <div className='flex-1 border-t border-purple-400/30'></div>
        </div>

        {/* Social Login */}
        <div className='space-y-2 sm:space-y-3'>
          <button
            type='button'
            className='w-full bg-white hover:bg-gray-50 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2'
          >
            <svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            <span className='text-sm sm:text-base'>Continue with Google</span>
          </button>
        </div>

        {/* Signup Link */}
        <div className='text-center mt-6 sm:mt-8'>
          <p className='text-xs sm:text-sm text-purple-200'>
            Don't have an account?{' '}
            <a
              href='/signup'
              className='text-purple-300 hover:text-white font-medium transition-colors duration-200'
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
