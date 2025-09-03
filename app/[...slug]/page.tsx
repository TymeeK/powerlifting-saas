import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Zap } from 'lucide-react';

interface ComingSoonPageProps {
  params: {
    slug: string[];
  };
}

export default function ComingSoonPage({ params }: ComingSoonPageProps) {
  const slug = params.slug.join('/');
  const pageTitle = slug
    .split('/')
    .map(
      word => word.charAt(0).toUpperCase() + word.slice(1).replace(/-/g, ' ')
    )
    .join(' - ');

  return (
    <main className='min-h-screen w-screen max-w-full overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 relative z-0'>
      <div className='w-full max-w-2xl text-center'>
        {/* Icon */}
        <div className='mb-8 flex justify-center'>
          <div className='relative'>
            <div className='h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl'>
              <Zap className='h-12 w-12 text-white' />
            </div>
            <div className='absolute -top-2 -right-2 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center'>
              <span className='text-yellow-900 text-sm font-bold'>!</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight'>
            Coming Soon
          </h1>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-semibold text-purple-200 mb-4'>
            {pageTitle}
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-purple-100 max-w-xl mx-auto leading-relaxed'>
            We're working hard to bring you this amazing feature. Stay tuned for
            updates!
          </p>
        </div>

        {/* Features Preview */}
        <div className='mb-12'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20'>
              <div className='h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto'>
                <Zap className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>
                Powerful Features
              </h3>
              <p className='text-purple-200 text-sm'>
                Advanced functionality designed to enhance your experience
              </p>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20'>
              <div className='h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto'>
                <Zap className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>
                Easy to Use
              </h3>
              <p className='text-purple-200 text-sm'>
                Intuitive interface that makes complex tasks simple
              </p>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20'>
              <div className='h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto'>
                <Zap className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>
                Mobile Ready
              </h3>
              <p className='text-purple-200 text-sm'>
                Optimized for all devices and screen sizes
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 px-8 py-3'
            asChild
          >
            <Link href='/signup'>Get Notified</Link>
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-white hover:text-white transition-all duration-200 px-8 py-3'
            asChild
          >
            <Link href='/'>
              <Home className='h-4 w-4 mr-2' />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className='mb-8'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <div className='h-2 w-2 rounded-full bg-purple-500 animate-pulse'></div>
            <div
              className='h-2 w-2 rounded-full bg-purple-500 animate-pulse'
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className='h-2 w-2 rounded-full bg-purple-500 animate-pulse'
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
          <p className='text-sm text-purple-300'>
            Development in progress • Expected launch: Q2 2024
          </p>
        </div>

        {/* Footer Links */}
        <div className='text-center'>
          <p className='text-sm text-purple-300 mb-4'>
            In the meantime, explore our other features:
          </p>
          <div className='flex flex-wrap justify-center gap-4 text-sm'>
            <Link
              href='/'
              className='text-purple-300 hover:text-white transition-colors duration-200 underline'
            >
              Home
            </Link>
            <Link
              href='/login'
              className='text-purple-300 hover:text-white transition-colors duration-200 underline'
            >
              Sign In
            </Link>
            <Link
              href='/signup'
              className='text-purple-300 hover:text-white transition-colors duration-200 underline'
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
