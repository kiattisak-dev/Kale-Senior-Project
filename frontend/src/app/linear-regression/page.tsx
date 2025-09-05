"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, Sparkles, Download, HelpCircle } from "lucide-react";
import UploadBox from "@/components/linear-ui/UploadBox";
import { Button } from "@/components/ui/button";
import ResultBox from "@/components/linear-ui/ResultBox";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function LinearRegressionPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [percentageWeightLose, setPercentageWeightLose] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const preview = searchParams.get("preview");
    const storedFile = localStorage.getItem("bgRemovedFile");
    const storedFileName = localStorage.getItem("bgRemovedFileName");

    if (preview && storedFile && storedFileName) {
      // Convert base64 back to File
      fetch(storedFile)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], storedFileName, { type: blob.type });
          setSelectedFiles([file]);
          setPreviews([preview]);
        })
        .catch((error) => {
          console.error("Error loading file from localStorage:", error);
          toast.error("Failed to load preloaded image.");
        });
    }
  }, [searchParams]);

  const handleFileSelect = (file: File, preview: string) => {
    setSelectedFiles([file]);
    setPreviews([preview]);
    // Clear localStorage when a new file is selected
    localStorage.removeItem("bgRemovedFile");
    localStorage.removeItem("bgRemovedFileName");
  };

  const resetImage = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setResult(null);
    setShowSuccess(false);
    localStorage.removeItem("bgRemovedFile");
    localStorage.removeItem("bgRemovedFileName");
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload an image before analyzing.");
      return;
    }
    setIsAnalyzing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    try {
      const token = Cookies.get("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8081/api/predict", {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) {
        let errorText = "Unknown error";
        try {
          errorText = await response
            .json()
            .then((data) => data.message || errorText);
        } catch {
          errorText = await response.text();
        }
        throw new Error(
          `Failed to fetch analysis results: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      if (
        !data.data ||
        typeof data.data.percentage_weight_lose === "undefined"
      ) {
        throw new Error("Invalid response format from server.");
      }

      await delay(1500);

      setResult(data);
      setPercentageWeightLose(data.data.percentage_weight_lose ?? 0);
      setShowSuccess(true);
      setProgress(100);
      clearInterval(progressInterval);

      saveToHistory(
        data,
        selectedFiles[0].name,
        data.data.imageUrl || previews[0]
      );
      toast.success("Analysis completed successfully!");
    } catch (error: any) {
      console.error("Error analyzing file:", error);
      toast.error(
        error.message.includes("Failed to fetch analysis results")
          ? `Failed to analyze image: ${error.message}`
          : `Failed to analyze image: ${error.message}`
      );
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = (
    resultData: any,
    fileName: string,
    imageUrl: string
  ) => {
    const now = new Date();
    const historyItem = {
      id: `history_${Date.now()}`,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].substring(0, 5),
      imageName: fileName,
      imageUrl: imageUrl,
      percentageWeightLoss: resultData.data.percentage_weight_lose,
      features: resultData.data.features,
    };

    const existingHistory = localStorage.getItem("analysisHistory");
    let historyArray = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray = [historyItem, ...historyArray].slice(0, 20);
    localStorage.setItem("analysisHistory", JSON.stringify(historyArray));
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatValue = (value: any): string => {
    if (typeof value === "number" && value.toString().length >= 5) {
      return value.toString().slice(0, 5) + "...";
    }
    return value.toString();
  };

  const handleDownloadCSV = () => {
    if (!result || !result.data.features || selectedFiles.length === 0) {
      toast.error("No analysis results available to download.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
      "File Name",
      "Percentage Weight Loss",
      ...Object.keys(result.data.features),
    ];
    csvContent += headers.join(",") + "\n";
    const values = [
      selectedFiles[0].name,
      (result.data.percentage_weight_lose ?? 0).toFixed(2) + "%",
      ...Object.values(result.data.features).map(formatValue),
    ];
    csvContent += values.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analysis_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pt-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-6 mb-6"
        >
          <h1 className="text-4xl font-extrabold text-green-800 dark:text-green-400 mb-2 tracking-tight">
            Kale Weight Loss Analysis
          </h1>
          <p className="text-lg text-green-600 dark:text-green-300 max-w-2xl mx-auto">
            Upload an image of your kale sample to analyze its quality and
            predict weight loss
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
            <Card className="shadow-lg border-green-100 dark:border-gray-700 min-h-[23rem]">
              <CardHeader className="bg-green-50 dark:bg-gray-800/60 border-b border-green-100 dark:border-gray-700">
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
                        Linear regression analyzes your kale image to predict weight loss.
                        For best results, use an image with the background removed from
                        the previous step.
                      </p>
                      <div className="absolute left-[80%] -translate-x-1/2 top-full w-2 h-2 -mt-1 rotate-45 bg-black"></div>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Drag and drop or click to select a kale image for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <UploadBox
                  onFileSelected={handleFileSelect}
                  onReset={resetImage}
                  preview={previews.length > 0 ? previews[0] : null}
                />
              </CardContent>
              {previews.length > 0 && (
                <div className="flex justify-center items-center py-4 bg-green-50 dark:bg-gray-800/30 border-t border-green-100 dark:border-gray-700 px-4">
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Analyze Sample <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
            <Card className="shadow-lg border-green-100 dark:border-gray-700 flex flex-col min-h-[23rem]">
              <CardHeader className="bg-green-50 dark:bg-gray-800/60 border-b border-green-100 dark:border-gray-700">
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  View predicted weight loss and download detailed results
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <ResultBox
                  result={result}
                  showSuccess={showSuccess}
                  percentageWeightLose={percentageWeightLose}
                />
                {isAnalyzing && (
                  <div className="mt-4">
                    <div className="h-2 sm:h-3 w-full bg-green-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                      Analyzing sample... {progress}%
                    </p>
                  </div>
                )}
              </CardContent>
              {result && (
                <div className="flex justify-center bg-green-50 dark:bg-gray-800/30 border-t border-green-100 dark:border-gray-700 px-4 py-4">
                  <Button
                    className="bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={handleDownloadCSV}
                  >
                    Download Report <Download className="ml-2 h-4 w-4" />
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