"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Cookie from "js-cookie";
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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLayout } from "@/components/ui/LayoutContext";
import { Eye, EyeOff } from "lucide-react";
import { AlertBox } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
    }

    try {
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setSuccess(null);
      } else {
        Cookie.set("email", formData.email, { expires: 7, secure: true });
        router.push("/auth/otp");
      }
    } catch (err) {
      setError("Something went wrong. Try again later.");
    }
  };

  const isFormValid = () => {
    return (
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    );
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        className="w-full max-w-lg mt-6"
      >
        <Card className="w-full max-w-md sm:max-w-lg lg:max-w-lg sm:p-6 shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || success) && (
              <AlertBox
                className="mb-2"
                type={error ? "error" : "success"}
                message={error || success || ""}
                onClose={() => {
                  setError(null);
                  setSuccess(null);
                }}
              />
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Username
              </label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your username"
                className="border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-green-700 dark:text-green-300"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-green-700 dark:text-green-300"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-500"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-green-700 dark:text-green-300"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-500"
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm text-green-600 dark:text-green-300">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
