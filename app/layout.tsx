import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { NavbarWrapper } from '@/components/navbar-wrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PR Tracker - Track Your Lifting Personal Records',
  description:
    'A clean, mobile-friendly dashboard for tracking your squat, bench, and deadlift progress. Log lifts in seconds and get insights automatically.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-x-hidden`}
      >
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
