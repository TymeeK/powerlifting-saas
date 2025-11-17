'use client';

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
  markdown: string;
}

function HeaderSidebarTrigger() {
  const { open } = useSidebar();

  if (open) {
    return null;
  }

  return <SidebarTrigger className='cursor-pointer' />;
}

export function ReleaseNotesContent({ markdown }: ReleaseNotesContentProps) {
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
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Badge className='bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
                      1.0.0
                    </Badge>
                    <span className='ml-2'>MVP</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className='container mx-auto p-6 space-y-6 max-w-5xl'>
            {/* Sidebar Trigger - Above Header */}
            <div className='mt-6'>
              <HeaderSidebarTrigger />
            </div>

            {/* Header */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500'>
                  <Sparkles className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                    Release Notes
                  </h1>
                  <p className='text-muted-foreground text-lg mt-2'>
                    MVP Launch - Everything you need to track your fitness
                    journey
                  </p>
                </div>
              </div>
              <Badge className='bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
                Version 1.0.0 - MVP
              </Badge>
            </div>

            {/* Markdown Content */}
            <div className='markdown-content space-y-6'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-8 mb-4'>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className='text-2xl font-bold tracking-tight mt-8 mb-4'>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className='text-xl font-semibold mt-6 mb-3'>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className='text-muted-foreground leading-relaxed mb-4'>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className='list-none space-y-2 mb-4'>{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className='flex items-start gap-2 text-muted-foreground'>
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className='font-semibold text-foreground'>
                      {children}
                    </strong>
                  ),
                  hr: () => <hr className='my-8 border-t border-muted' />,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
