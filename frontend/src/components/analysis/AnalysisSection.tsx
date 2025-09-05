'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, Check, X, Image as ImageIcon } from 'lucide-react';
import type { AnalysisResult } from '@/types';

interface AnalysisSectionProps {
  selectedFiles: File[];
  previews: string[];
  isAnalyzing: boolean;
  progress: number;
  results: AnalysisResult[];
  onFileSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onAnalyze: () => void;
}

export function AnalysisSection({
  selectedFiles,
  previews,
  isAnalyzing,
  progress,
  results,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
}: AnalysisSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const dropBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previews.length > 0) {
      const img = new Image();
      img.src = previews[0];
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    } else {
      setImageSize(null);
    }
  }, [previews]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-100 dark:border-green-900"
      >
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold gradient-text">
              Upload Your Kale Images
            </h2>
            <div
              ref={dropBoxRef}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={imageSize ? { width: imageSize.width, height: imageSize.height } : { height: '16rem' }}
              className={`relative border-2 border-dashed rounded-xl flex items-center justify-center transition-colors duration-200 overflow-hidden ${
                isDragging
                  ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                  : 'hover:border-green-400 dark:hover:border-green-600'
              }`}
            >
<<<<<<< HEAD
              {previews.length > 0 ? (
                <img
                  src={previews[0]}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl "
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                  <Upload className="w-12 h-12 text-green-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag and drop your images here
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">or</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="mt-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                  >
                    Browse Files
                  </label>
=======
              <Upload className="w-12 h-12 text-green-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop your images here
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">or</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
              />
              <label
                htmlFor="file-upload"
                className="mt-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
              >
                Browse Files
              </label>
            </div>


            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Selected Images ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveFile(index)}
                          className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {selectedFiles[index].name}
                      </p>
                    </motion.div>
                  ))}
>>>>>>> 51e632ace2d55b93bad9f301a6b240a33a7bf25f
                </div>
              )}
            </div>
            <button
              onClick={onAnalyze}
              disabled={selectedFiles.length === 0 || isAnalyzing}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Analyze Images</span>
                </>
              )}
            </button>
<<<<<<< HEAD
=======

            {/* Progress Bar */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {progress}% Complete
                </p>
              </div>
            )}
>>>>>>> 51e632ace2d55b93bad9f301a6b240a33a7bf25f
          </div>
        </div>
      </motion.div>
    </div>
  );
}
