import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HistoryFeatureProps {
  features: { [key: string]: any };
}

export default function HistoryFeature({ features }: HistoryFeatureProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Quality Features
      </h3>
      <div className="relative">
        <div className="max-h-48 overflow-y-auto rounded-lg">
          <div
            className="space-y-2 px-3 py-2 relative"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, black 2%, black 100%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 2%, black 100%, transparent 100%)",
            }}
          >
            {features && Object.keys(features).length > 0 ? (
              <>
                {Object.entries(features).map(([key, value], index) => (
                  <motion.div
                    key={`${key}-${index}`}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                      ease: "easeOut",
                    }}
                  >
                    <span className="text-gray-600 dark:text-gray-300 capitalize font-medium">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {String(value)}
                    </span>
                  </motion.div>
                ))}
              </>
            ) : (
              <motion.p
                className="text-gray-500 dark:text-gray-400 text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                No features available
              </motion.p>
            )}
          </div>
        </div>
        {features && Object.keys(features).length > 3 && (
          <motion.div
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-green-600 dark:text-green-400 z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              y: [0, 8, 0],
            }}
            transition={{
              opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
            }}
          >
            <ChevronDown className="h-7 w-7" />
          </motion.div>
        )}
      </div>
    </div>
  );
}