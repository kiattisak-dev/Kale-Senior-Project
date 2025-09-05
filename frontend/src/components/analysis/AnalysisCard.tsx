import { cn } from '@/lib/utils';
import React from 'react';

interface AnalysisCardProps {
  title: string;
  value: string | number;
  colorClass?: string;
  className?: string;
}

export function AnalysisCard({
  title,
  value,
  colorClass = 'text-blue-600 dark:text-blue-400',
  className,
}: AnalysisCardProps) {
  return (
    <div className={cn(
      'bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-all duration-200 hover:shadow-lg',
      className
    )}>
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className={cn('text-2xl font-semibold', colorClass)}>
        {value}
      </p>
    </div>
  );
} 