"use client";
import React from "react";
import Link from "next/link";
import { Leaf, Twitter, Github, Linkedin } from "lucide-react";
import { useLayout } from "../ui/LayoutContext";

export function Footer() {
  const { showNavAndFooter } = useLayout();

  if (!showNavAndFooter) return null;

  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-t border-green-100 dark:border-green-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Kale AI
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-xl">
            Revolutionizing kale quality assessment with advanced AI technology.
            Making fresh produce analysis accessible to everyone.
          </p>
          <div className="flex space-x-4">
            <Link
              href="https://twitter.com"
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com"
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com"
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Kale AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
