"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface FeatureData {
  Mean_LAB_L: number;
  Std_LAB_L: number;
  Mean_LAB_A: number;
  Std_LAB_A: number;
  Mean_LAB_B: number;
  Std_LAB_B: number;
  Mean_HSV_H: number;
  Std_HSV_H: number;
  Mean_HSV_S: number;
  Std_HSV_S: number;
  Mean_HSV_V: number;
  Std_HSV_V: number;
  Mean_GRAY_Gray: number;
  Std_GRAY_Gray: number;
  GLCM_contrast: number;
  GLCM_dissimilarity: number;
  GLCM_homogeneity: number;
  GLCM_energy: number;
  GLCM_correlation: number;
  LBP_0: number;
  LBP_1: number;
  LBP_2: number;
  LBP_3: number;
  LBP_4: number;
  LBP_5: number;
  LBP_6: number;
  LBP_7: number;
  LBP_8: number;
  LBP_9: number;
  Magenta: number;
  Brightness: number;
}

interface ResultData {
  status: string;
  data: {
    percentage_weight_lose: number;
    features: FeatureData;
  };
}

interface ResultBoxProps {
  result: ResultData | null;
  showSuccess: boolean;
  percentageWeightLose: number;
}

export default function ResultBox({
  result,
  showSuccess,
  percentageWeightLose,
}: ResultBoxProps) {
  const [showDetails, setShowDetails] = useState(false);

 
  const getTextColor = (value: number): string => {
    if (value < 10) return "text-green-600 dark:text-green-400";
    if (value < 15) return "text-blue-600 dark:text-blue-400";
    if (value < 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (value: number): string => {
    if (value < 10) return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (value < 15) return "bg-gradient-to-r from-blue-500 to-blue-400";
    if (value < 20) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    return "bg-gradient-to-r from-red-500 to-red-400";
  };


  const formatValue = (value: number): string => {
    return value.toFixed(2);
  };


  const groupFeatures = (features: FeatureData) => {
    const groups = {
      'LAB Color': ['Mean_LAB_L', 'Std_LAB_L', 'Mean_LAB_A', 'Std_LAB_A', 'Mean_LAB_B', 'Std_LAB_B'],
      'HSV Color': ['Mean_HSV_H', 'Std_HSV_H', 'Mean_HSV_S', 'Std_HSV_S', 'Mean_HSV_V', 'Std_HSV_V'],
      'Grayscale': ['Mean_GRAY_Gray', 'Std_GRAY_Gray'],
      'GLCM Features': ['GLCM_contrast', 'GLCM_dissimilarity', 'GLCM_homogeneity', 'GLCM_energy', 'GLCM_correlation'],
      'LBP Features': ['LBP_0', 'LBP_1', 'LBP_2', 'LBP_3', 'LBP_4', 'LBP_5', 'LBP_6', 'LBP_7', 'LBP_8', 'LBP_9'],
      'Other': ['Magenta', 'Brightness']
    };

    return Object.entries(groups).map(([groupName, featureNames]) => ({
      name: groupName,
      features: featureNames.map(name => ({
        name: name.replace(/_/g, ' '),
        value: features[name as keyof FeatureData]
      }))
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      {!result ? (
        <Card className="h-[15.625rem] flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-800/50 dark:to-gray-900 border-2 border-dashed border-green-200 dark:border-green-700 rounded-2xl shadow-lg">
          <CardContent className="text-center p-4">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-green-500 dark:text-green-400 opacity-70" />
            <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
              No Analysis Results Yet
            </p>
            <p className="text-[0.65rem] sm:text-xs mt-0.5 text-gray-600 dark:text-gray-400 max-w-xs sm:max-w-sm">
              Upload a kale image and click "Analyze Sample" to view detailed
              quality insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={`flex flex-col border border-green-200 dark:border-green-700 rounded-2xl bg-gradient-to-br from-green-50 to-white dark:from-gray-800/50 dark:to-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300 ${showDetails ? 'h-auto' : 'h-[15.625rem]'}`}>
          <CardContent className="flex flex-col justify-between flex-grow p-4">
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-1.5 flex items-center p-3 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-900/50"
              >
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-green-800 dark:text-green-300 font-medium text-[0.65rem] sm:text-xs">
                  Analysis Completed Successfully
                </span>
              </motion.div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Predicted Weight Loss
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-extrabold ${getTextColor(
                      percentageWeightLose
                    )} mt-1`}
                  >
                    {percentageWeightLose.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="w-full bg-green-100 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(percentageWeightLose * 2, 100)}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-1.5 sm:h-2 rounded-full ${getProgressColor(
                    percentageWeightLose
                  )}`}
                ></motion.div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center space-x-2 mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDetails && result.data.features && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {groupFeatures(result.data.features).map((group, index) => (
                  <div key={index} className="border-t border-green-100 dark:border-green-800 pt-4 first:border-t-0 first:pt-0">
                    <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                      {group.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{feature.name}:</span>
                          <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                            {formatValue(feature.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex flex-col justify-center mt-4">
              <p className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 text-center">
                Download the CSV report for detailed analysis features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}