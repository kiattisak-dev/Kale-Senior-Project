"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertBox } from "@/components/ui/alert";
import { useLayout } from "@/components/ui/LayoutContext";

export default function LoginPage() {
  const router = useRouter();
  const { setShowNavAndFooter } = useLayout();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      Cookies.set("token", data.token, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8081/api/auth/oauth";
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
            <CardTitle className="text-3xl text-center text-green-800 dark:text-green-400">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-green-700 dark:text-green-300"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="identity"
                type="email"
                placeholder="name@example.com"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="border-green-200 focus:border-green-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-green-700 dark:text-green-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-green-200 dark:border-gray-600 focus:border-green-500 dark:bg-gray-800 dark:text-white"
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Button Google Login test */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-green-300 text-green-700 hover:bg-green-50 dark:bg-gray-800 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-6 h-6 mr-2 rounded-lg"
              />
              Sign in with Google
            </Button>

            <div className="text-center text-sm text-green-600 dark:text-green-300">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
