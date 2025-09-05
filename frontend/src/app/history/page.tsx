"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import HistoryList from "@/components/history/HistoryList";
import HistoryDetails from "@/components/history/HistoryDetails";
import ConfirmDelete from "@/components/history/ConfirmDelete";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  imageName: string;
  imageUrl: string;
  percentageWeightLoss: number;
  features: { [key: string]: any };
}

export default function HistoryPage() {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatTimestamp = (
    timestamp: string | undefined
  ): { date: string; time: string } => {
    const fallback = { date: "Unknown", time: "Unknown" };
    if (!timestamp) {
      console.warn("Timestamp is undefined or empty");
      return fallback;
    }
    try {
      const dateObj = new Date(timestamp);
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid timestamp: ${timestamp}`);
        return fallback;
      }
      const date = dateObj.toISOString().split("T")[0];
      const time = dateObj.toTimeString().split(" ")[0].slice(0, 5);
      return { date, time };
    } catch (err) {
      console.warn(`Error parsing timestamp ${timestamp}:`, err);
      return fallback;
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch("http://localhost:8081/api/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || `HTTP ${response.status}: Unable to fetch data`
          );
        }

        const formattedData: HistoryItem[] = result.data
          .map((item: any) => {
            if (!item._id || !item._id.match(/^[0-9a-fA-F]{24}$/)) {
              console.warn(`Skipping item with invalid or missing _id:`, item);
              return null;
            }
            return {
              id: item._id,
              imageName: item.FileName || "Unknown",
              imageUrl: item.ImageUrl || "/fallback-image.jpg",
              percentageWeightLoss: item.Percentage || 0,
              features: item.Features || {},
              ...formatTimestamp(item.Timestamp),
            };
          })
          .filter((item): item is HistoryItem => item !== null);

        setHistoryData(formattedData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: string) => {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(
          "Invalid history ID format: ID must be a valid ObjectID"
        );
      }

      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const response = await fetch(`http://localhost:8081/api/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: Unable to delete data`
        );
      }

      setHistoryData(historyData.filter((item) => item.id !== id));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message);
    } finally {
      setIsModalOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setIsModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      handleDeleteItem(itemToDelete);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analysis History
            </h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading data...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400">
            Error: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HistoryList
              historyData={historyData}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
            />
            <HistoryDetails
              selectedItem={selectedItem}
              onDeleteItem={openDeleteModal}
            />
          </div>
        )}
        <ConfirmDelete
          isOpen={isModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={
            historyData.find((item) => item.id === itemToDelete)?.imageName ||
            "this item"
          }
        />
      </div>
    </div>
  );
}
