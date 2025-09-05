import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
}

export function NavLink({
  href,
  children,
  variant = 'default',
  className,
}: NavLinkProps) {
  const baseStyles = 'px-4 py-2 rounded-lg transition-colors duration-200';
  const variants = {
    default: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-primary text-white hover:bg-primary/90',
  };

  return (
    <Link
      href={href}
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
} 