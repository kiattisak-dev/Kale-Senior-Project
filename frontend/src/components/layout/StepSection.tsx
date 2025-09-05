"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ImageIcon, LineChart } from "lucide-react";
import Link from "next/link";
import { StepCard } from "../ui/StepCard";
import type { Step } from "@/types";

interface StepSectionProps {
  workflowSteps: Step[];
}

export function StepSection({ workflowSteps }: StepSectionProps) {
  return (
    <div>
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent dark:from-gray-950 dark:to-transparent z-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          id="analysis-steps"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center space-y-6 sm:space-y-8 px-4"
        >
          <div className="inline-flex items-center justify-center p-3 sm:p-4 lg:p-4 bg-green-50 dark:bg-green-950/30 rounded-xl text-green-700 dark:text-green-300 gap-2 border border-green-100 dark:border-green-900/50 shadow-sm">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
            <span className="text-sm sm:text-base lg:text-base font-medium">
              Ready to analyze your kale? Choose your analysis method
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl lg:max-w-7xl mx-auto">
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="group flex flex-col h-full p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-green-100 dark:border-green-900/50 shadow-md hover:shadow-xl overflow-hidden"
            >
              <div className="p-2 sm:p-3 lg:p-3 flex items-center rounded-xl bg-green-50 dark:bg-green-900/30 mb-3 sm:mb-4 lg:mb-4 self-start">
                <p className="text-green-600 dark:text-green-400 font-bold mr-3 p-1">
                  Step 1
                </p>
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-3">
                Remove Background
              </h3>
              <p className="text-sm sm:text-base lg:text-base text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                Separate kale from background for precise measurements and
                visual quality assessment
              </p>
              <Link href="/background-segmentation" className="w-full h-full">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-center gap-2 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 lg:px-4 rounded-xl mt-2 group-hover:gap-3 transition-all text-sm sm:text-sm lg:text-base">
                  Start Remove Background
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="group flex flex-col h-full p-4 sm:p-5 lg:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-green-100 dark:border-green-900/50 shadow-md hover:shadow-xl overflow-hidden"
            >
              <div className="p-2 sm:p-3 lg:p-3 rounded-xl items-center flex bg-green-50 dark:bg-green-900/30 mb-3 sm:mb-4 lg:mb-4 self-start">
                <p className="text-green-600 dark:text-green-400 font-bold mr-3 p-1">
                  Step 2
                </p>
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-3">
                Linear Regression Analysis
              </h3>
              <p className="text-sm sm:text-base lg:text-base text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                Predict kale quality and shelf life based on visual features for
                quality control
              </p>
              <Link href="/linear-regression" className="w-full h-full">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-center gap-2 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 lg:px-4 rounded-xl mt-2 group-hover:gap-3 transition-all text-sm sm:text-sm lg:text-base">
                  Start Regression Analysis
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
        </motion.div>

        <div className="space-y-20 mt-[-3rem]">
          {workflowSteps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>
        
        
      </div>
    </div>
  );
}
