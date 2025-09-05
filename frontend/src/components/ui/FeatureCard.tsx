"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <motion.div
      className="relative p-6 h-full w-full overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-md hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 dark:from-green-900/30 dark:to-emerald-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-700 dark:to-emerald-600 flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-6 h-6 text-green-700 dark:text-green-300" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
