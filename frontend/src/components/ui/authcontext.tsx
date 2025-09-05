"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  user_id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  emailVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        setUser({
          user_id: result.data.user_id,
          username: result.data.username,
          email: result.data.email,
          avatar: result.data.avatar || "",
          createdAt: result.data.createdAt,
          emailVerified: result.data.emailVerified,
        });
        setLoading(false);
      } else {
        console.error(
          "Failed to fetch user data:",
          result.message || "Invalid response structure"
        );
        setUser(null);
        setLoading(false);
        if (res.status === 401) {
          console.log("Unauthorized: Redirecting to login");
          window.location.href = "/auth/login";
        }
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
