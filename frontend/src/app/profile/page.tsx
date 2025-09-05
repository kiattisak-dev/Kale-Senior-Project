"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useAuth } from "@/components/ui/authcontext";
import { AlertBox } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: "",
    createdAt: "",
    emailVerified: false,
  });
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (hasFetched || !user || !user.user_id) {
        if (!user) {
          console.log("No user data available");
          if (isMounted) {
            setError("Please log in to view your profile");
            setAlert({
              type: "error",
              message: "Please log in to view your profile",
            });
            setIsLoading(false);
          }
        } else if (!user.user_id) {
          console.log("No user_id available. User:", user);
          if (isMounted) {
            setError("User ID is missing. Contact support.");
            setAlert({ type: "error", message: "User ID is missing" });
            setIsLoading(false);
          }
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `http://localhost:8081/api/user/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user profile");
        }

        const result = await response.json();
        if (result.status === "success" && isMounted) {
          const userData = {
            username: result.data.username || "",
            email: result.data.email || "",
            avatar: result.data.avatar || "",
            createdAt: result.data.createdAt || new Date().toISOString(),
            emailVerified: result.data.emailVerified || false,
          };
          setFormData(userData);
          setOriginalFormData(userData);
          setHasFetched(true);
        } else {
          throw new Error(result.message || "Invalid response structure");
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load profile");
          setAlert({
            type: "error",
            message: err.message || "Failed to load profile",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!loading && !hasFetched) {
      fetchUserProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [user, loading, hasFetched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setAlert({
          type: "error",
          message: "Only JPG or PNG files are allowed",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: "error", message: "File size exceeds 5MB limit" });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalFormData);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(false);
    setError(null);
    setAlert(null);
  };

  const handleSave = async () => {
    if (!formData.username) {
      setError("Username is required");
      setAlert({ type: "error", message: "Username is required" });
      setIsLoading(false);
      return;
    }
    if (formData.username.length < 3 || formData.username.length > 20) {
      setError("Username must be between 3 and 20 characters");
      setAlert({
        type: "error",
        message: "Username must be between 3 and 20 characters",
      });
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      setAlert({
        type: "error",
        message: "Username can only contain letters, numbers, and underscores",
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      if (!user?.user_id) {
        throw new Error("User ID is missing");
      }
      const profileResponse = await fetch(
        `http://localhost:8081/api/user/${user.user_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
          }),
          credentials: "include",
        }
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error(
          `Update profile failed (status ${profileResponse.status}):`,
          errorData
        );
        throw new Error(errorData.message || "Failed to update username");
      }

      const profileData = await profileResponse.json();

      if (profileData.status !== "success") {
        throw new Error(profileData.message || "Failed to update username");
      }

      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("avatar", avatarFile);
        console.log("Uploading avatar");
        const avatarResponse = await fetch(
          "http://localhost:8081/api/user/avatar",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
            credentials: "include",
          }
        );

        if (!avatarResponse.ok) {
          const errorData = await avatarResponse.json();
          console.error(
            `Upload avatar failed (status ${avatarResponse.status}):`,
            errorData
          );
          throw new Error(errorData.message || "Failed to upload avatar");
        }

        const avatarData = await avatarResponse.json();
        if (avatarData.status === "success" && avatarData.data?.avatar) {
          setFormData((prev) => ({ ...prev, avatar: avatarData.data.avatar }));
        } else {
          throw new Error(
            avatarData.message || "Invalid avatar response structure"
          );
        }
      }

      updateUser({
        user_id: user.user_id,
        username: profileData.data?.username || formData.username,
        email: profileData.data?.email || user?.email || formData.email,
        avatar: avatarFile
          ? profileData.data?.avatar || formData.avatar
          : user?.avatar,
        createdAt: profileData.data?.createdAt || user?.createdAt,
        emailVerified: profileData.data?.emailVerified ?? user?.emailVerified,
      });

      setOriginalFormData({
        ...formData,
        username: profileData.data?.username || formData.username,
        email: profileData.data?.email || formData.email,
        avatar: profileData.data?.avatar || formData.avatar,
        createdAt: profileData.data?.createdAt || formData.createdAt,
        emailVerified:
          profileData.data?.emailVerified ?? formData.emailVerified,
      });

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      setError(null);
      setAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setAlert({
        type: "error",
        message: err.message || "Failed to save profile",
      });
      console.error("Save profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!Cookies.get("token")) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Please log in to view your profile.</p>
        <Button asChild>
          <a href="/auth/login">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-100 via-purple-100/70 to-pink-50 dark:from-gray-900 dark:via-blue-950/30 dark:to-gray-900 -z-10"></div>

      <div className="fixed top-0 left-0 w-full h-full -z-5">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[30%] left-[15%] w-40 h-40 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[10%] right-[20%] w-24 h-24 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="mb-20 text-center"></div>

        <ProfileCard
          isEditing={isEditing}
          formData={formData}
          avatarPreview={avatarPreview}
          error={error}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleAvatarChange={handleAvatarChange}
          handleSave={handleSave}
          handleCancelEdit={handleCancelEdit}
          setIsEditing={setIsEditing}
        />
      </div>
    </div>
  );
}
