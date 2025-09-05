"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, CheckCircle, Leaf } from "lucide-react";
import Image from "next/image";
import Waves from "@/components/ui/Waves";
import { Button } from "../ui/button";

export function Hero() {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80;
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden pt-20 pb-12">
      <Waves
        lineColor="rgba(34, 197, 94, 0.2)"
        backgroundColor="transparent"
        className="absolute inset-0 z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 text-center lg:text-left space-y-6 pt-10 lg:pt-0"
          >
            <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full bg-green-200/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-2">
              <Leaf className="h-4 w-4" />
              <span>Mae Fah Luang University Senior Project</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Kale Analysis with
              </span>
              <span className="bg-gradient-to-r from-green-700 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
                {" "}
                AI Technology
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md sm:max-w-xl mx-auto lg:mx-0">
              Advanced AI-powered kale analysis system for quality assessment
              and detailed recommendations.
            </p>

            <ul className="flex flex-row flex-wrap items-center justify-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-400 px-3 sm:gap-4 md:gap-6 sm:text-sm sm:px-0 lg:justify-start">
              <motion.li
                className="flex items-center transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1.5 sm:mr-2 shrink-0" />
                <span>Remove Background</span>
              </motion.li>
              <motion.li
                className="flex items-center transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1.5 sm:mr-2 shrink-0" />
                <span>Linear Regression</span>
              </motion.li>
              <motion.li
                className="flex items-center transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1.5 sm:mr-2 shrink-0" />
                <span>Quality Prediction</span>
              </motion.li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-8"
                onClick={() => scrollToSection("analysis-steps")}
              >
                Start Analysis <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-400 dark:border-green-800 
                bg-green-100/40 dark:bg-green-900/30 
                text-green-900  hover:text-green-600 dark:text-green-100 
                hover:bg-green-200 dark:hover:bg-green-800"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 w-full mt-6 lg:mt-0"
          >
            <div className="relative w-full aspect-[4/3] max-h-[250px] sm:max-h-[350px] lg:max-h-[350px]">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br from-green-300/20 to-green-500/20 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl z-10 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 overflow-hidden">
                <div className="w-full h-full relative overflow-hidden">
                  <Image
                    src="/banner.jpeg"
                    alt="Kale analysis"
                    fill
                    className="object-cover opacity-90 dark:opacity-70 mix-blend-overlay dark:mix-blend-soft-light"
                    priority
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full z-0" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-50 dark:bg-green-800/30 rounded-full z-0" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
