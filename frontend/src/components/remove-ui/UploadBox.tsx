"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { AlertBox } from "../ui/alert";

interface UploadBoxProps {
  onFileSelected: (file: File, preview: string) => void;
  onReset: () => void;
  preview: string | null;
}

export default function UploadBox({
  onFileSelected,
  onReset,
  preview,
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cooldown for AlertBox (5 seconds)
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000); // 5000ms = 5 seconds

      return () => clearTimeout(timer); // Cleanup on unmount or alertMessage change
    }
  }, [alertMessage]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    // Check file extension
    const validExtensions = [".png", ".jpg", ".jpeg"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));
    if (!validExtensions.includes(fileExtension)) {
      setAlertMessage("Only PNG, JPG, and JPEG files are allowed.");
      return;
    }

    // Check if the file is an image
    if (!file.type.match("image.*")) {
      setAlertMessage("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlertMessage("File size should be less than 5MB");
      return;
    }

    // Resize image to 512x512
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setAlertMessage("Failed to process image");
        URL.revokeObjectURL(img.src);
        return;
      }

      // Draw image centered and scaled to fit 512x512
      ctx.fillStyle = "white"; // Background color
      ctx.fillRect(0, 0, 512, 512);
      const scale = Math.min(512 / img.width, 512 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (512 - scaledWidth) / 2;
      const offsetY = (512 - scaledHeight) / 2;
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Convert canvas to File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setAlertMessage("Failed to process image");
            URL.revokeObjectURL(img.src);
            return;
          }
          const resizedFile = new File([blob], file.name, { type: file.type });
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && typeof e.target.result === "string") {
              onFileSelected(resizedFile, e.target.result);
              setAlertMessage(null); // Clear alert if successful
            }
          };
          reader.readAsDataURL(resizedFile);
          URL.revokeObjectURL(img.src); // Clean up
        },
        file.type,
        0.9
      ); // Use 90% quality for JPEG
    };
    img.onerror = () => {
      setAlertMessage("Failed to load image");
      URL.revokeObjectURL(img.src); // Clean up
    };
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    onReset();
    setAlertMessage(null); // Clear alert on reset
    toast.success("Image removed successfully");
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/png,image/jpeg"
        className="hidden"
        multiple={false}
      />

      {/* Display AlertBox if there's an error */}
      {alertMessage && (
        <div className="mb-4">
          <AlertBox
            type="error"
            title="Invalid Image"
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        </div>
      )}

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20"
              : "border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-900/10"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{ minHeight: "250px" }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
              Upload an image
            </h3>
            <p className="text-green-600 dark:text-green-400 mb-4">
              Drag & drop an image here or click to browse
            </p>
            <p className="text-sm text-green-500 dark:text-green-400">
              Supports: JPG, PNG, JPEG (Max: 5MB, will be resized to 512x512)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-green-200 dark:border-green-700 shadow-sm">
          <div style={{ height: "250px", position: "relative" }}>
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: "contain" }}
              className="bg-green-50 dark:bg-gray-800/30"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-green-900/70 dark:bg-green-900/80 text-white p-2 text-xs">
            <div className="flex items-center">
              <ImageIcon className="h-3 w-3 mr-1" />
              <span className="truncate">
                {preview.substring(preview.lastIndexOf("/") + 1, 80)}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
