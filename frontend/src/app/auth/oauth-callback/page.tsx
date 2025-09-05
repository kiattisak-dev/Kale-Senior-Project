"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        console.error("No token found in cookie");
        router.push("/auth/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8081/api/auth/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.ok) {
          window.location.href = "/";
        } else {
          const errorData = await res.json();
          console.error(
            "Failed to fetch user data:",
            errorData.message || "Unknown error"
          );
          if (res.status === 401) {
            console.log("Unauthorized: Redirecting to login");
            router.push("/auth/login");
          } else {
            console.error(`Unexpected status: ${res.status}`);
            router.push("/auth/login");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="text-center mt-10 text-lg">
      Signing you in with Google...
    </div>
  );
}