"use client";

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
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useLayout } from "@/components/ui/LayoutContext";

export default function ResetSuccessPage() {
  const router = useRouter();
  const { setShowNavAndFooter } = useLayout();

  useEffect(() => {
    setShowNavAndFooter(false);
    return () => setShowNavAndFooter(true);
  }, [setShowNavAndFooter]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="w-full shadow-lg border border-green-300 dark:border-green-700 dark:bg-gray-900 overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="mx-auto bg-green-100 dark:bg-green-900/50 w-20 h-20 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-400">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-center text-green-600 dark:text-green-300">
              Your password has been successfully changed. You can now login
              with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-600 dark:text-gray-400 mb-4"
            >
              If you did not request this password change, please contact the
              administrator immediately.
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Login with New Password
            </Button>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/"
                className="font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-500"
              >
                Back to Home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
