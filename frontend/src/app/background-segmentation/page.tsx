"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  HelpCircle,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  ArrowRight,
} from "lucide-react";
import UploadBox from "@/components/remove-ui/UploadBox";
import ResultBox from "@/components/remove-ui/ResultBox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    return interval;
  };

  const handleFileSelected = (file: File, preview: string) => {
    setFile(file);
    setPreview(preview);
    setResult(null);
    setShowSuccess(false);
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement("a");
      link.href = result;
      link.download = "background_removed_image.png";
      link.click();
    }
  };

  const handleContinueAnalysis = () => {
    if (result && file) {
      // Store file as base64 in localStorage
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          localStorage.setItem("bgRemovedFile", reader.result);
          localStorage.setItem("bgRemovedFileName", file.name);
          router.push(`/linear-regression?preview=${encodeURIComponent(result)}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setShowSuccess(false);
    localStorage.removeItem("bgRemovedFile");
    localStorage.removeItem("bgRemovedFileName");
  };

  const handleRemoveBg = async () => {
    if (!file) return;

    setProcessing(true);
    const progressInterval = simulateProgress();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8082/segment/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the image.");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setResult(imageUrl);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleScroll = () => {
    const element = document.getElementById("features-section");
    if (!element) return;

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-white to-white-50 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-20 mb-5"
        >
          <div className="text-center mb-5">
            <h1 className="text-4xl font-extrabold text-green-800 dark:text-green-400 mb-2 tracking-tight">
              Remove Image Background
            </h1>
            <p className="text-lg text-green-600 dark:text-green-300 max-w-2xl mx-auto">
              Remove backgrounds from your images in seconds with our AI
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.5 }}
          className="mt-5 mb-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-lg border-green-100 dark:border-gray-700 overflow-hidden">
              <CardHeader className="dark:bg-gray-800 shadow-sm">
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                  <div className="relative group">
                    <HelpCircle className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
                    <div
                      className="fixed -translate-x-[80%] -translate-y-[150%] hidden group-hover:block w-72 bg-black text-white text-sm rounded-lg p-2 shadow-lg pointer-events-none"
                      style={{ zIndex: 99999 }}
                    >
                      <p className="text-center">
                        Background segmentation removes the background from your
                        kale image, Please upload JPG,PNG,JPEG Max: 5MB
                        Size:512*512
                      </p>
                      <div className="absolute left-[80%] -translate-x-1/2 top-full w-2 h-2 -mt-1 rotate-45 bg-black"></div>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Drag and drop or click to select an image
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <UploadBox
                  onFileSelected={handleFileSelected}
                  onReset={resetImage}
                  preview={preview}
                />
              </CardContent>
              <div className="flex justify-center items-center py-2 bg-green-50 dark:bg-gray-900 w-full">
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white mb-1"
                  onClick={handleRemoveBg}
                  disabled={!file || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Remove Background
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="shadow-lg border-green-100 dark:border-gray-700 overflow-hidden">
              <CardHeader className="dark:bg-gray-800 shadow-sm">
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Result
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your image with background removed
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResultBox result={result} showSuccess={showSuccess} />
                {processing && (
                  <div className="mt-4">
                    <Progress
                      value={progress}
                      className="h-2 bg-green-100 dark:bg-gray-700"
                    />
                    <p className="text-sm text-green-600 mt-2 text-center">
                      Processing: {progress}%
                    </p>
                  </div>
                )}
              </CardContent>

              {result && (
                <div className="flex justify-center items-center py-2 bg-green-50 dark:bg-gray-900 w-full gap-4">
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-300 dark:hover:text-white text-white hover:opacity-90 transition-opacity border-none"
                    onClick={handleDownload}
                  >
                    Download Image
                    <Download size={18} />
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-300 dark:hover:text-white text-white hover:opacity-90 transition-opacity border-none"
                    onClick={handleContinueAnalysis}
                  >
                    Analysis Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}