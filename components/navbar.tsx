'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    title: 'PR Tracking',
    href: '/features/pr-tracking',
    description:
      'Track your personal records across all major lifts with detailed progress analytics.',
  },
  {
    title: 'Workout Logging',
    href: '/features/workout-logging',
    description:
      'Quick and easy workout logging with mobile-friendly interface.',
  },
  {
    title: 'Progress Analytics',
    href: '/features/analytics',
    description:
      'Visualize your strength gains with comprehensive charts and insights.',
  },
  {
    title: 'Program Templates',
    href: '/features/programs',
    description:
      'Access proven training programs and create your own custom routines.',
  },
];

const resources = [
  {
    title: 'Documentation',
    href: '/docs',
    description: 'Learn how to get the most out of PR Tracker.',
  },
  {
    title: 'Blog',
    href: '/blog',
    description: 'Training tips, nutrition advice, and lifting insights.',
  },
  {
    title: 'Community',
    href: '/community',
    description: 'Connect with other lifters and share your progress.',
  },
  {
    title: 'Support',
    href: '/support',
    description: 'Get help when you need it with our support team.',
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='mr-4 flex'>
          <Link
            href={user ? '/dashboard' : '/'}
            className='mr-6 flex items-center space-x-2'
          >
            <div className='h-6 w-6 rounded bg-gradient-to-r from-purple-500 to-pink-500' />
            <span className='font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              PR Tracker
            </span>
          </Link>
          {/* Desktop Navigation */}
          <NavigationMenu className='hidden lg:flex'>
            <NavigationMenuList>
              {loading ? (
                // Loading state - show minimal navigation
                <NavigationMenuItem>
                  <div className='h-10 w-20 animate-pulse bg-gray-200 rounded'></div>
                </NavigationMenuItem>
              ) : user !== null ? (
                // Authenticated user navigation
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/dashboard/past-workouts'
                        className={navigationMenuTriggerStyle()}
                      >
                        Past workouts
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/dashboard/charts'
                        className={navigationMenuTriggerStyle()}
                      >
                        Charts
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/dashboard/settings'
                        className={navigationMenuTriggerStyle()}
                      >
                        Settings
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              ) : (
                // Guest user navigation
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                        {features.map(feature => (
                          <ListItem
                            key={feature.title}
                            title={feature.title}
                            href={feature.href}
                          >
                            {feature.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                        {resources.map(resource => (
                          <ListItem
                            key={resource.title}
                            title={resource.title}
                            href={resource.href}
                          >
                            {resource.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/pricing'
                        className={navigationMenuTriggerStyle()}
                      >
                        Pricing
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Auth Buttons */}
        <div className='hidden lg:flex items-center space-x-2'>
          {loading ? (
            <div className='flex items-center space-x-2'>
              <div className='w-20 h-8 animate-pulse bg-gray-200 rounded'></div>
              <div className='w-16 h-8 animate-pulse bg-gray-200 rounded'></div>
            </div>
          ) : user !== null ? (
            <div className='flex items-center space-x-3'>
              <Button
                size='sm'
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                asChild
              >
                <Link href='/dashboard/workout'>Record Workout</Link>
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSignOut}
                className='text-gray-600 hover:text-gray-900 cursor-pointer'
              >
                <LogOut className='h-4 w-4 mr-1' />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/login'>Sign In</Link>
              </Button>
              <Button
                size='sm'
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                asChild
              >
                <Link href='/signup'>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className='flex lg:hidden items-center space-x-2'>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='sm' className='p-2'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
              <SheetHeader>
                <SheetTitle className='text-left'>Navigation</SheetTitle>
              </SheetHeader>
              <div className='flex flex-col space-y-4 mt-6'>
                {loading ? (
                  // Loading state for mobile
                  <div className='px-4'>
                    <div className='space-y-2'>
                      <div className='h-10 w-full animate-pulse bg-gray-200 rounded'></div>
                      <div className='h-10 w-full animate-pulse bg-gray-200 rounded'></div>
                      <div className='h-10 w-full animate-pulse bg-gray-200 rounded'></div>
                    </div>
                  </div>
                ) : user !== null ? (
                  // Authenticated user mobile navigation
                  <>
                    {/* Mobile Dashboard Section */}
                    <div className='px-4'>
                      <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3'>
                        Navigation
                      </h3>
                      <Separator className='mb-3' />
                      <div className='space-y-2'>
                        <Button
                          variant='outline'
                          className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                          asChild
                        >
                          <Link
                            href='/dashboard/all-workouts'
                            onClick={handleLinkClick}
                          >
                            All workouts
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                          asChild
                        >
                          <Link
                            href='/dashboard/charts'
                            onClick={handleLinkClick}
                          >
                            Charts
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                          asChild
                        >
                          <Link
                            href='/dashboard/settings'
                            onClick={handleLinkClick}
                          >
                            Settings
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Guest user mobile navigation
                  <>
                    {/* Mobile Features Section */}
                    <div className='px-4'>
                      <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3'>
                        Features
                      </h3>
                      <Separator className='mb-3' />
                      <div className='space-y-2'>
                        {features.map(feature => (
                          <Button
                            key={feature.title}
                            variant='outline'
                            className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                            asChild
                          >
                            <Link href={feature.href} onClick={handleLinkClick}>
                              {feature.title}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Resources Section */}
                    <div className='px-4'>
                      <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3'>
                        Resources
                      </h3>
                      <Separator className='mb-3' />
                      <div className='space-y-2'>
                        {resources.map(resource => (
                          <Button
                            key={resource.title}
                            variant='outline'
                            className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                            asChild
                          >
                            <Link
                              href={resource.href}
                              onClick={handleLinkClick}
                            >
                              {resource.title}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Pricing Link */}
                    <div className='px-4'>
                      <Button
                        variant='outline'
                        className='w-full justify-start border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                        asChild
                      >
                        <Link href='/pricing' onClick={handleLinkClick}>
                          Pricing
                        </Link>
                      </Button>
                    </div>
                  </>
                )}

                {/* Mobile Auth Buttons */}
                <div className='pt-6 border-t space-y-3 px-4'>
                  {loading ? (
                    <div className='space-y-3'>
                      <div className='w-full h-12 animate-pulse bg-gray-200 rounded-lg'></div>
                      <div className='w-full h-12 animate-pulse bg-gray-200 rounded-lg'></div>
                    </div>
                  ) : user !== null ? (
                    <div className='space-y-3'>
                      <Button
                        size='lg'
                        className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200'
                        asChild
                      >
                        <Link
                          href='/dashboard/record-workout'
                          onClick={handleLinkClick}
                        >
                          Start Workout
                        </Link>
                      </Button>
                      <Button
                        variant='outline'
                        size='lg'
                        onClick={() => {
                          handleSignOut();
                          handleLinkClick();
                        }}
                        className='w-full border-2 border-red-300 hover:border-red-500 hover:bg-red-500/10 text-red-600 hover:text-red-700 transition-all duration-200 cursor-pointer'
                      >
                        <LogOut className='h-4 w-4 mr-2' />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant='outline'
                        size='lg'
                        className='w-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-gray-900 hover:text-gray-900 transition-all duration-200'
                        asChild
                      >
                        <Link href='/login' onClick={handleLinkClick}>
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        size='lg'
                        className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200'
                        asChild
                      >
                        <Link href='/signup' onClick={handleLinkClick}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
  }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
