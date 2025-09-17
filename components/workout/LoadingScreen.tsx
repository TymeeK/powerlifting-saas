interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = 'Loading...',
}: LoadingScreenProps) {
  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
        <p className='text-purple-200'>{message}</p>
      </div>
    </main>
  );
}
