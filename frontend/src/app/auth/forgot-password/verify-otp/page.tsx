"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(cooldownTimer);
    }
  }, [resendCooldown]);

  // Format time left as mm:ss
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return; // Allow only digits or empty

    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle pasted multi-digit input
      const digits = value
        .replace(/\D/g, "")
        .slice(0, 6 - index)
        .split("");
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);

      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit or empty input
      newOtp[index] = value.slice(-1); // Take only the last character
      setOtp(newOtp);

      // Move focus: next input on digit entry, previous on clear
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "") // Remove non-digits
      .slice(0, 6 - index)
      .split("");
    const newOtp = [...otp];
    pastedData.forEach((value, i) => {
      if (index + i < 6) {
        newOtp[index + i] = value;
      }
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(index + pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/auth/resend-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else if (response.status === 403) {
          setError("Email not verified. Please verify your email first.");
        } else if (response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else {
          setError(data.message || "Could not send OTP. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setTimeLeft(600);
      setResendCooldown(60);
      setOtp(Array(6).fill(""));
      setSuccess("A new OTP has been sent to your email.");
      setIsLoading(false);

      setTimeout(() => setSuccess(""), 5000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        "Failed to connect to the server. Please check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const verificationCode = otp.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8081/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, verificationCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid OTP. Please try again.");
        } else if (
          response.status === 400 &&
          data.message.includes("expired")
        ) {
          setError("OTP has expired. Please request a new one.");
        } else if (response.status === 403) {
          setError("Email not verified. Please verify your email first.");
        } else if (response.status === 429) {
          setError(
            "Too many attempts. Please wait a minute before trying again."
          );
        } else {
          setError(data.message || "Could not verify OTP. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setSuccess("OTP verified successfully!");
      setIsLoading(false);

      setTimeout(() => {
        router.push(
          `/auth/forgot-password/reset-password?email=${encodeURIComponent(
            email
          )}`
        );
      }, 1000);
    } catch (err) {
      setError(
        "Failed to connect to the server. Please check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 mt-7"
      >
        <Card className="w-full shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900 overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Verify OTP
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Please enter the OTP sent to{" "}
              {email && <span className="font-semibold">{email}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || success) && (
              <AlertBox
                type={error ? "error" : "success"}
                message={error || success}
                onClose={() => {
                  setError("");
                  setSuccess("");
                }}
              />
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    6-Digit OTP Code
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      timeLeft < 60
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <Input
                      key={`otp-digit-${i}`}
                      ref={setInputRef(i)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg border-green-200 focus:border-green-500 dark:text-white dark:bg-gray-800 rounded-md"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={(e) => handlePaste(e, i)}
                      disabled={isLoading}
                      required
                    />
                  ))}
                </div>
                <div className="text-center">
                  {timeLeft === 0 ? (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      OTP has expired. Please request a new one.
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      OTP will expire in {formatTimeLeft(timeLeft)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                disabled={
                  isLoading || timeLeft === 0 || otp.join("").length !== 6
                }
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="flex justify-center space-x-4 text-sm">
              <Button
                variant="link"
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500 p-0 h-auto"
                onClick={handleResendOtp}
                disabled={isLoading || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Resend OTP"}
              </Button>
            </div>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              >
                Edit Email
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
