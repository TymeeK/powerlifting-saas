import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Always start with Dashboard */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href='/dashboard'
              className='flex items-center gap-1 text-purple-200 hover:text-white transition-colors'
            >
              <Home className='h-4 w-4' />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Render additional breadcrumb items */}
        {items.map((item, index) => (
          <div key={index} className='flex items-center'>
            <BreadcrumbSeparator className='text-purple-300' />
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className='flex items-center gap-1 text-purple-200 hover:text-white transition-colors'
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className='text-white font-medium flex items-center gap-1'>
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
