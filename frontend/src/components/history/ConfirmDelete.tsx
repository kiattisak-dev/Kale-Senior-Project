"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "item",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <h2
                id="modal-title"
                className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"
              >
                Confirm Deletion
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium">{itemName}</span>? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 sm:px-6 sm:py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
