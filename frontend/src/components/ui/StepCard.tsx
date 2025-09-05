"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Step } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface StepCardProps {
  step: Step;
  index: number;
  className?: string;
}

export function StepCard({ step, index, className }: StepCardProps) {
  const isEven = index % 2 === 0;

  return (
    <div className={cn("relative", className)}>
      {/* Connector line between steps */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="flex flex-col md:flex-row gap-8 items-stretch rounded-2xl overflow-hidden shadow-md"
      >
        {/* Image Section */}
        <div
          className={cn(
            "w-full md:w-2/5 relative overflow-hidden",
            isEven ? "md:order-1" : "md:order-2"
          )}
        >
          <div className="relative aspect-video md:h-full w-full">
            <Image
              src={step.imageSrc}
              alt={step.imageAlt}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />

            {/* Step Number Badge */}
            <div className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 shadow-md z-10">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white font-bold text-lg shadow">
                {step.id}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div
          className={cn(
            "flex-1 flex flex-col justify-center p-6 md:p-8 bg-white dark:bg-gray-900 space-y-4",
            isEven ? "md:order-2" : "md:order-1"
          )}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {step.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {step.description}
          </p>

          {/* <div className="pt-4 md:pt-6">
            <motion.div
              className="inline-flex items-center text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 group cursor-pointer"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Learn more
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.div>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
}
