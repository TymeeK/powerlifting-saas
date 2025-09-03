export default function LandingPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4'>
      <h1 className='text-4xl font-bold mb-4 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>
        Track your lifting PRs without spreadsheets
      </h1>
      <p className='text-lg text-purple-100 mb-6 text-center max-w-md'>
        A clean, mobile-friendly dashboard for your squat, bench, and deadlift
        progress. Log lifts in seconds. Get insights automatically.
      </p>
      <form className='flex flex-col sm:flex-row gap-3 w-full max-w-md'>
        <input
          type='email'
          placeholder='Enter your email'
          className='flex-1 px-4 py-3 rounded-lg text-black bg-white border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-500'
          required
        />
        <button
          type='submit'
          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200'
        >
          Get Early Access
        </button>
      </form>
      <div className='mt-10'>
        {/* Optional: Replace with a screenshot or chart mockup */}
        <div className='w-80 h-48 bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-lg flex items-center justify-center border border-purple-400/30 backdrop-blur-sm'>
          <span className='text-purple-200 font-medium'>Dashboard Preview</span>
        </div>
      </div>
      <footer className='mt-12 text-sm text-purple-300'>
        Launching soon — made by a lifter for lifters
      </footer>
    </main>
  );
}
