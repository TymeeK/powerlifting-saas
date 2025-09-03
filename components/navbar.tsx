'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

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
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='mr-4 flex'>
          <Link href='/' className='mr-6 flex items-center space-x-2'>
            <div className='h-6 w-6 rounded bg-gradient-to-r from-purple-500 to-pink-500' />
            <span className='hidden font-bold sm:inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              PR Tracker
            </span>
          </Link>
          {/* Desktop Navigation */}
          <NavigationMenu className='hidden lg:flex'>
            <NavigationMenuList>
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
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Auth Buttons */}
        <div className='hidden lg:flex items-center space-x-2'>
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
        </div>

        {/* Mobile Navigation */}
        <div className='flex lg:hidden items-center space-x-2'>
          <Sheet>
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
                {/* Mobile Features Section */}
                <div>
                  <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3'>
                    Features
                  </h3>
                  <Separator className='mb-3' />
                  <div className='space-y-2'>
                    {features.map(feature => (
                      <Link
                        key={feature.title}
                        href={feature.href}
                        className='block p-3 rounded-md hover:bg-accent transition-colors'
                      >
                        <div className='font-medium text-sm'>
                          {feature.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Resources Section */}
                <div>
                  <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3'>
                    Resources
                  </h3>
                  <Separator className='mb-3' />
                  <div className='space-y-2'>
                    {resources.map(resource => (
                      <Link
                        key={resource.title}
                        href={resource.href}
                        className='block p-3 rounded-md hover:bg-accent transition-colors'
                      >
                        <div className='font-medium text-sm'>
                          {resource.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Pricing Link */}
                <div>
                  <Link
                    href='/pricing'
                    className='block p-3 rounded-md hover:bg-accent transition-colors'
                  >
                    <div className='font-medium text-sm'>Pricing</div>
                  </Link>
                </div>

                {/* Mobile Auth Buttons */}
                <div className='pt-4 border-t space-y-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    asChild
                  >
                    <Link href='/login'>Sign In</Link>
                  </Button>
                  <Button
                    size='sm'
                    className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    asChild
                  >
                    <Link href='/signup'>Get Started</Link>
                  </Button>
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
