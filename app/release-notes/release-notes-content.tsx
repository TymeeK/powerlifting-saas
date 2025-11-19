'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Sparkles } from 'lucide-react';

interface ReleaseNotesContentProps {
  releaseNotes: Record<string, string>;
}

const VERSION_INFO: Record<string, { label: string; subtitle: string }> = {
  '1.0.3': {
    label: 'Latest',
    subtitle: 'Features Page & Component Architecture',
  },
  '1.0.2': {
    label: 'Hotfixes',
    subtitle: 'Hotfixes',
  },
  '1.0.1': {
    label: 'UI Improvements',
    subtitle: 'UI Improvements & Bug Fixes',
  },
  '1.0.0': {
    label: 'MVP',
    subtitle: 'Welcome to PR Tracker MVP!',
  },
};

function HeaderSidebarTrigger() {
  const { open, openMobile, isMobile } = useSidebar();

  // Show trigger when sidebar is closed
  // On mobile, check openMobile; on desktop, check open
  const sidebarOpen = isMobile ? openMobile : open;

  if (sidebarOpen) {
    return null;
  }

  return <SidebarTrigger className='cursor-pointer' />;
}

export function ReleaseNotesContent({
  releaseNotes,
}: ReleaseNotesContentProps) {
  const [selectedVersion, setSelectedVersion] = useState<string>('1.0.3');
  const versions = Object.keys(releaseNotes).sort().reverse(); // Latest first

  const currentContent = releaseNotes[selectedVersion] || '';
  const currentVersionInfo = VERSION_INFO[selectedVersion];

  return (
    <div className='release-notes-wrapper'>
      <SidebarProvider>
        <Sidebar variant='inset' collapsible='offcanvas'>
          <SidebarHeader>
            <SidebarTrigger className='cursor-pointer' />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Releases</SidebarGroupLabel>
              <SidebarMenu>
                {versions.map(version => {
                  const versionInfo = VERSION_INFO[version];
                  const isActive = selectedVersion === version;
                  return (
                    <SidebarMenuItem key={version}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setSelectedVersion(version)}
                        className='cursor-pointer'
                      >
                        <Badge
                          className={
                            isActive
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {version}
                        </Badge>
                        <span className='ml-2'>{versionInfo.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className='container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl'>
            {/* Sidebar Trigger - Above Header */}
            <div className='mt-4 sm:mt-6'>
              <HeaderSidebarTrigger />
            </div>

            {/* Header */}
            <div className='space-y-3 sm:space-y-4'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                <div className='p-2 sm:p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0'>
                  <Sparkles className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                    Release Notes
                  </h1>
                  <p className='text-muted-foreground text-sm sm:text-base lg:text-lg mt-1 sm:mt-2'>
                    Stay updated with the latest improvements and features
                  </p>
                </div>
              </div>
              <Badge className='bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1'>
                Version {selectedVersion} - {currentVersionInfo.subtitle}
              </Badge>
            </div>

            {/* Markdown Content */}
            <div className='markdown-content space-y-4 sm:space-y-6'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-6 sm:mt-8 mb-3 sm:mb-4'>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className='text-xl sm:text-2xl font-bold tracking-tight mt-6 sm:mt-8 mb-3 sm:mb-4'>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className='text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3'>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className='text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4'>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className='list-none space-y-2 sm:space-y-3 mb-3 sm:mb-4 pl-0'>{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className='flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground'>
                      <span className='text-purple-500 mt-1.5 sm:mt-2 flex-shrink-0'>•</span>
                      <span className='flex-1'>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className='font-semibold text-foreground'>
                      {children}
                    </strong>
                  ),
                  hr: () => <hr className='my-6 sm:my-8 border-t border-border' />,
                }}
              >
                {currentContent}
              </ReactMarkdown>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
