import React from 'react';
import { AnalysisCard } from './AnalysisCard';
import { AnalysisResult } from '@/types';

interface AnalysisResultsProps {
  results: AnalysisResult | null;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  if (!results) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Upload and analyze an image to see the results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <AnalysisCard
          title="Prediction"
          value={results.prediction}
          colorClass="text-green-600 dark:text-green-400"
        />
        <AnalysisCard
          title="Confidence"
          value={`${(results.confidence * 100).toFixed(1)}%`}
          colorClass="text-blue-600 dark:text-blue-400"
        />
        <AnalysisCard
          title="Segmentation Status"
          value={results.segmentation}
          colorClass="text-purple-600 dark:text-purple-400"
        />
      </div>
    </div>
  );
} 