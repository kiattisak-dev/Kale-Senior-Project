import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  imageName: string;
  imageUrl: string;
  percentageWeightLoss: number;
  features: { [key: string]: any };
}

interface HistoryItemProps {
  item: HistoryItem;
  isSelected: boolean;
  onSelect: () => void;
}

export default function HistoryItem({ item, isSelected, onSelect }: HistoryItemProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Failed to load image: ${e.currentTarget.src}`);
    e.currentTarget.src = "/fallback-image.jpg";
  };

  return (
    <motion.div
      whileHover={{
        backgroundColor: "rgba(16, 185, 129, 0.05)",
      }}
      className={`p-4 cursor-pointer flex items-center justify-between ${
        isSelected ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt="Kale sample"
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
            {item.imageName}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{item.date}</span>
            <Clock className="h-3 w-3 ml-2 mr-1" />
            <span>{item.time}</span>
          </div>
        </div>
      </div>
      <ChevronRight
        className={`h-4 w-4 text-gray-400 transition-transform ${
          isSelected ? "transform rotate-90" : ""
        }`}
      />
    </motion.div>
  );
}