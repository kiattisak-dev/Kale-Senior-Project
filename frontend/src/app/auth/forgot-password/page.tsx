'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { AlertBox } from "@/components/ui/alert";
import { useLayout } from "@/components/ui/LayoutContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many requests. Please wait a minute before trying again.");
        } else if (response.status === 403) {
          setError("Email not verified. Please verify your email first.");
        } else if (response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else {
          setError(data.message || "An error occurred. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success case
      setSuccess(true);
      setIsLoading(false);

      // Navigate to OTP verification page after a short delay
      setTimeout(() => {
        router.push(`/auth/forgot-password/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mt-6"
      >
        <Card className="w-full shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900 overflow-hidden px-4">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Enter your email to receive an OTP for password reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <AlertBox
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}
            {success && (
              <AlertBox
                type="success"
                message="OTP has been sent to your email address"
              />
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label
                  className="text-sm font-medium text-green-700 dark:text-green-300"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="border-green-200 focus:border-green-500 dark:text-white dark:bg-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/auth/login"
                className="font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              >
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
