import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import HistoryItem from "./HistoryItem";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  imageName: string;
  imageUrl: string;
  percentageWeightLoss: number;
  features: { [key: string]: any };
}

interface HistoryListProps {
  historyData: HistoryItem[];
  selectedItem: HistoryItem | null;
  onSelectItem: (item: HistoryItem) => void;
}

export default function HistoryList({ historyData, selectedItem, onSelectItem }: HistoryListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="md:col-span-1"
    >
      <Card className="border-green-100 dark:border-green-700 shadow-md overflow-hidden">
        <CardHeader className="bg-green-50 dark:bg-gray-800">
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
            <Leaf className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-green-200 dark:divide-green-700 max-h-[calc(100vh-250px)] overflow-y-auto">
            {historyData.length > 0 ? (
              historyData.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={() => onSelectItem(item)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>Analysis history not found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}