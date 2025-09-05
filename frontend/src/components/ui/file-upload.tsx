'use client';

import React from 'react';
import { ImagePlus } from 'lucide-react';
import { FileUploadProps } from '@/types';

export function FileUpload({
  onFileSelect,
  onRemoveFile,
  previews,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
          ${previews.length > 0 ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'}
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
      >
        {previews.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4 w-full">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImagePlus className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PNG, JPG, JPEG
            </p>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
      </label>
    </div>
  );
} 