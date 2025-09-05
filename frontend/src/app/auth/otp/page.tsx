"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLayout } from "@/components/ui/LayoutContext";
import { AlertBox } from "@/components/ui/alert";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  useEffect(() => {
    const storedEmail = Cookies.get("email") || "";
    setEmail(storedEmail);

    if (!storedEmail) {
      router.replace("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return; // Allow only single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input if the current input is cleared
    else if (!value && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Allow arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "") // Remove non-digits
      .slice(0, 6)
      .split("");
    const newOtp = ["", "", "", "", "", ""];
    pastedData.forEach((value, i) => {
      if (i < 6) {
        newOtp[i] = value;
      }
    });
    setOtp(newOtp);

    // Focus the last filled input or the first empty one
    const lastFilledIndex = pastedData.length - 1;
    if (lastFilledIndex < 5 && inputRefs.current[lastFilledIndex + 1]) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setTimeLeft(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);

    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }

    try {
      const res = await fetch("http://localhost:8081/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }
      setSuccess("A new OTP has been sent to your email.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    if (!email) {
      setError("No email found. Please register first.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode: otpValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess("OTP verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 mt-7"
      >
        <Card className="w-full max-w-md sm:max-w-lg lg:max-w-lg sm:p-6 shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Verify Your Account
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Enter the verification code sent to{" "}
              {email && <span className="font-bold">{email}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(error || success) && (
              <AlertBox
                className="mb-2"
                type={error ? "error" : "success"}
                message={error || success}
                onClose={() => {
                  setError("");
                  setSuccess("");
                }}
              />
            )}
            <div>
              <label className="text-sm font-semibold text-green-700 dark:text-green-300 block mb-3 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white rounded-md"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-green-600 dark:text-green-300">
              {timeLeft > 0 ? (
                <p>Resend code in {timeLeft} seconds</p>
              ) : (
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  className="font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500 p-0 h-auto"
                  disabled={isLoading}
                >
                  Resend verification code
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.some((digit) => digit === "")}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="text-center text-sm text-green-600 dark:text-green-300">
              <Link
                href="/auth/register"
                className="font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              >
                Go back to Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}