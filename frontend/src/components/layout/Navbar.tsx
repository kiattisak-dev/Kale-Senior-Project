"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, User, X } from "lucide-react";
import Image from "next/image";
import SwitchTheme from "@/components/layout/SwitchTheme";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useLayout } from "../ui/LayoutContext";
import UserMenu from "../ui/๊UserMenu";
import { useAuth } from "../ui/authcontext";

export function Navbar() {
  const { showNavAndFooter } = useLayout();
  const [isOpen, setIsOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    setHasToken(!!token);
    setMounted(true);
  }, [pathname]);

  if (!showNavAndFooter) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-100 dark:border-green-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/mfu.png"
                alt="MFU Logo"
                fill
                className="rounded-full object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Kale AI
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <SwitchTheme />

            {mounted && hasToken ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username || "User"}
                      className="w-9 h-9 rounded-full border-2 border-green-500 dark:border-green-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-green-500 flex items-center justify-center text-green-600 bg-white dark:bg-gray-800">
                      <User className="w-7 h-7 text-green-600 dark:text-green-300" />
                    </div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <UserMenu onClose={() => setIsMenuOpen(false)} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:block px-6 py-2 rounded-lg border border-green-600 text-green-600 font-medium hover:bg-gradient-to-r from-green-600 to-emerald-600 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden md:block px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Burger Menu Button */}
            {!hasToken && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-1 rounded-3xl border border-green-200 dark:border-green-300 bg-white/70 dark:bg-gray-800/70 hover:bg-green-50 dark:hover:bg-green-900 transition relative"
              >
                <motion.div
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: isOpen ? 0 : 1, rotate: isOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="flex items-center justify-center"
                >
                  <Menu className="h-7 w-7 text-green-700 dark:text-green-300" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    rotate: isOpen ? 0 : -90,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="h-8 w-8 text-green-700 dark:text-green-300" />
                </motion.div>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isOpen && !hasToken && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-t border-green-200 dark:border-green-800 shadow-lg"
        >
          <div className="flex flex-col items-center space-y-4 py-6 px-4">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-6 py-3 rounded-lg border border-green-600 text-green-700 dark:text-green-300 font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
