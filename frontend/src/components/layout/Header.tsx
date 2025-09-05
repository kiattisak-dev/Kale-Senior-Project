import React from 'react';
import { NavLink } from '@/components/ui/NavLink';

export function Header() {
  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Kale AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/dashboard" variant="primary">Get Started</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
} 