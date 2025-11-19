'use client';

import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const footerLinks = {
  navigation: [
    { label: 'Features', href: '/features' },
    { label: 'Release Notes', href: '/release-notes' },
  ],
  account: [
    { label: 'Sign Up', href: '/signup' },
    { label: 'Log In', href: '/login' },
  ],
};

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/75kgpovertybencher?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr',
    icon: FaInstagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/tymee-kong/',
    icon: FaLinkedin,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/TymeeK',
    icon: FaGithub,
  },
];

export function Footer() {
  return (
    <footer className='border-t bg-background'>
      <div className='container mx-auto px-6 py-12'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-8'>
          {/* Navigation Links */}
          <div>
            <h3 className='font-semibold mb-4 text-foreground'>Navigation</h3>
            <ul className='space-y-2'>
              {footerLinks.navigation.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className='font-semibold mb-4 text-foreground'>Account</h3>
            <ul className='space-y-2'>
              {footerLinks.account.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Copyright */}
          <div>
            <h3 className='font-semibold mb-4 text-foreground'>Connect</h3>
            <div className='flex flex-col space-y-4'>
              {/* Social Media Links */}
              <div className='flex items-center space-x-4'>
                {socialLinks.map(social => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground hover:text-foreground transition-colors'
                      aria-label={social.name}
                    >
                      <Icon className='h-5 w-5' />
                    </a>
                  );
                })}
              </div>
              <p className='text-sm text-muted-foreground'>
                Made by lifters, for lifters • © {new Date().getFullYear()} PR
                Tracker
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
