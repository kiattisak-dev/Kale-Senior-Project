import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Leaf } from "lucide-react";
import HistoryFeature from "./HistoryFeature";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  imageName: string;
  imageUrl: string;
  percentageWeightLoss: number;
  features: { [key: string]: any };
}

interface HistoryDetailsProps {
  selectedItem: HistoryItem | null;
  onDeleteItem: (id: string) => void;
}

export default function HistoryDetails({
  selectedItem,
  onDeleteItem,
}: HistoryDetailsProps) {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.warn(`Failed to load image: ${e.currentTarget.src}`);
    e.currentTarget.src = "/fallback-image.jpg";
  };

  const handleDownloadCSV = (item: HistoryItem) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
      "File Name",
      "Date",
      "Time",
      "Percentage Weight Loss",
      ...Object.keys(item.features),
    ];
    csvContent += headers.join(",") + "\n";
    const values = [
      item.imageName,
      item.date,
      item.time,
      item.percentageWeightLoss.toFixed(2) + "%",
      ...Object.values(item.features).map((value) => String(value)),
    ];
    csvContent += values.join(",") + "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analysis_${item.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      className="md:col-span-2 w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-green-100 dark:border-green-700 shadow-md w-full">
        {selectedItem ? (
          <>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-2 sm:mb-0">
                  Analysis Details
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white border-none hover:from-green-600 hover:to-green-800 dark:from-green-500 dark:to-green-700 dark:hover:from-green-400 dark:hover:to-green-600 transition-all duration-300 ease-in-out shadow-md dark:shadow-gray-800 hover:shadow-lg dark:hover:shadow-gray-700 transform hover:scale-105 rounded-lg px-4 py-2 font-medium"
                    onClick={() => handleDownloadCSV(selectedItem)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white border-none hover:from-red-600 hover:to-red-800 dark:from-red-500 dark:to-red-700 dark:hover:from-red-400 dark:hover:to-red-600 transition-all duration-300 ease-in-out shadow-md dark:shadow-gray-800 hover:shadow-lg dark:hover:shadow-gray-700 transform hover:scale-105 rounded-lg px-4 py-2 font-medium"
                    onClick={() => onDeleteItem(selectedItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 mt-2 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Image */}
                <div className="w-full">
                  <div className="rounded-lg overflow-hidden border border-green-200 dark:border-green-700 mb-4 w-full">
                    <img
                      src={selectedItem.imageUrl}
                      alt="Kale sample"
                      className="w-full h-48 sm:h-56 object-cover"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  {/* Sample Box Information */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-8 sm:p-5 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Sample Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          File Name:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                          {selectedItem.imageName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          Analysis Date:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                          {selectedItem.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          Analysis Time:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                          {selectedItem.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Weight Loss Analysis & HistoryFeature */}
                <div className="space-y-4 sm:space-y-6 w-full">
                  <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800 rounded-lg p-4 sm:p-5 border border-green-200 dark:border-green-700 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-green-100 mb-3">
                      Weight Loss Analysis
                    </h3>
                    <div className="flex items-end space-x-2">
                      <div className="text-3xl sm:text-4xl font-bold text-green-700 dark:text-green-300">
                        {selectedItem.percentageWeightLoss.toFixed(1)}%
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base pb-1">
                        weight loss
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2.5">
                      <div
                        className="bg-green-600 dark:bg-green-400 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            Math.abs(selectedItem.percentageWeightLoss) * 2,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <HistoryFeature features={selectedItem.features} />
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="py-12 px-6 text-center">
            <Leaf className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Analysis Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select an analysis from the list to view detailed information and
              results.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
