"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCircle, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Link from "next/link";
import { useAuth } from "@/components/ui/authcontext";

interface UserMenuProps {
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const username = user?.username || "User";
  const userImage = user?.avatar || "";

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        const response = await fetch("http://localhost:8081/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }
      }

      Cookies.remove("token");
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      Cookies.remove("token");
      onClose();
      window.location.href = "/";
    }
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-3 z-50 border border-green-200 dark:border-green-700"
    >
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-green-200 dark:border-green-700">
        <div className="flex items-center space-x-3">
          {userImage ? (
            <img
              src={userImage}
              alt={username}
              className="w-10 h-10 rounded-full border-2 border-green-500 dark:border-green-400 object-cover"
            />
          ) : (
            <UserCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          )}
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
              {username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          onClick={onClose}
        >
          <UserCircle className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
          View Profile
        </Link>
        <Link
          href="/history"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          onClick={onClose}
        >
          <History className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
          Analysis History
        </Link>
      </div>

      {/* Separator */}
      <div className="border-t border-green-200 dark:border-green-700"></div>

      {/* Logout Button */}
      <div className="py-3 mb-[-1rem]">
        <Button
          variant="ghost"
          className="w-full flex justify-start text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </motion.div>
  );
};

export default UserMenu;
