'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingProps } from '@/types';

export function Loading({ progress, message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{message}</span>
      </div>
      {progress > 0 && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
            {progress}% Complete
          </p>
        </div>
      )}
    </div>
  );
} 