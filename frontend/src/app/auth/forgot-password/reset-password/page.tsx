"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon } from "lucide-react";
import { AlertBox } from "@/components/ui/alert";
import { useLayout } from "@/components/ui/LayoutContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password validation
  const [lengthValid, setLengthValid] = useState(false);
  const [uppercaseValid, setUppercaseValid] = useState(false);
  const [lowercaseValid, setLowercaseValid] = useState(false);
  const [numberValid, setNumberValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  // Validate email existence
  useEffect(() => {
    if (!email) {
      setError("No email provided. Please restart the password reset process.");
    }
  }, [email]);

  // Validate password on change
  useEffect(() => {
    setLengthValid(password.length >= 8);
    setUppercaseValid(/[A-Z]/.test(password));
    setLowercaseValid(/[a-z]/.test(password));
    setNumberValid(/\d/.test(password));
    setPasswordsMatch(password === confirmPassword && password !== "");
  }, [password, confirmPassword]);

  const isPasswordValid =
    lengthValid && uppercaseValid && lowercaseValid && numberValid;

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("No email provided. Please restart the password reset process.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please make sure your password meets all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword: password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("No verified OTP found. Please verify OTP first.");
        } else if (response.status === 403) {
          setError("Email not verified. Please verify your email first.");
        } else if (response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else {
          setError(
            data.message || "Failed to reset password. Please try again."
          );
        }
        setIsLoading(false);
        return;
      }

      // Success case
      setSuccess(
        "Password reset successfully! You will be redirected to login."
      );
      setIsLoading(false);

      // Navigate to login page after a short delay
      setTimeout(() => {
        router.push("/auth/forgot-password/reset-success");
      }, 2000);
    } catch (err) {
      setError(
        "Failed to connect to the server. Please check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 mt-10"
      >
        <Card className="w-full shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900 overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Create a new password for{" "}
              {email ? (
                <span className="font-semibold">{email}</span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  No email provided
                </span>
              )}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-green-700 dark:text-green-300"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="border-green-200 focus:border-green-500 dark:text-white dark:bg-gray-800 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-green-700 dark:text-green-300"
                  htmlFor="confirm-password"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="border-green-200 focus:border-green-500 dark:text-white dark:bg-gray-800 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Password Requirements:
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    {lengthValid ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span
                      className={
                        lengthValid
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    {uppercaseValid ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span
                      className={
                        uppercaseValid
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    {lowercaseValid ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span
                      className={
                        lowercaseValid
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      At least one lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    {numberValid ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span
                      className={
                        numberValid
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      At least one number
                    </span>
                  </li>
                  <li className="flex items-center text-sm">
                    {passwordsMatch ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span
                      className={
                        passwordsMatch
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      Passwords match
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                disabled={
                  isLoading || !isPasswordValid || !passwordsMatch || !email
                }
              >
                {isLoading ? "Processing..." : "Set New Password"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              onClick={() => router.push("/auth/login")}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
